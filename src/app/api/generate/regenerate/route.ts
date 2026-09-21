import { NextRequest, NextResponse } from 'next/server';
import { StorySpec, ClipPrompt, VideoVariation } from '@/types';
import { getWeeklyEmotionArc, calculateWordCount } from '@/lib/engine/rules/retention';
import { formatSpeakerIsolationPrompt, generateSecBySecTimeline } from '@/lib/engine/rules/temporal';
import { evaluatePromptCritique } from '@/lib/engine/critique';
import { createTokenReport, estimateTokenCount } from '@/lib/engine/tokens';
import { generateDailyPhotoPosts } from '@/lib/engine/rules/photos';
import { EPISODE_TITLES } from '@/lib/engine/generator';
import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';
import { produceVariationWithLLM, buildCinematicFrameImagePrompt, buildCinematicFlowPrompt } from '@/lib/engine/llm-produce';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, spec, dayNumber, variationIndex, clipIndex, existingVariation, aiConfig } = body;
    const typedAiConfig = aiConfig as AIProviderConfig | undefined;

    const arc = getWeeklyEmotionArc(dayNumber || 1);

    if (target === 'clip') {
      // 1. REGENERATE SINGLE CLIP VIA LLM
      const activeChar = spec.cast[0]?.name || 'Julian Vance';
      const silentChars = spec.cast.slice(1).map((c: any) => c.name);
      const location = spec.locationSettings[0] || 'Executive Penthouse';
      const cIndex = clipIndex || 1;

      const promptText = `Regenerate Clip ${cIndex} of 3 for a 10s Google Flow Veo short film.
Story Format: ${spec.format}
Tone & Daily Arc: ${spec.tone} (${arc.dailyEmotion})
Active Speaker: ${activeChar}
Silent Characters in background: ${silentChars.join(', ') || 'None'}
Location: ${location}
Rules:
- Strict speaker isolation: The inactive character must have [100% SILENT, LISTENING REACTION ONLY, LIPS SEALED].
- Spoken dialogue strictly 18-22 words.
- Detailed vocal cadence with dynamic tonal inflection (sakhti & narmi).
- Shot-reverse-shot camera cut.
- Include Google Flow Veo master directive text.

Return JSON format:
{
  "dialogue": "Exact spoken line (18-22 words)",
  "sceneName": "Descriptive scene name",
  "shotType": "Camera lens and shot type",
  "visualAction": "Second by second action description",
  "flowPrompt": "Master [CLIP ${cIndex}/3 - GOOGLE FLOW VEO MASTER DIRECTIVE]...",
  "frameImagePrompt": "[VIDEO FRAME IMAGE - KEYFRAME ${cIndex}/3]..."
}`;

      const llmRes = await callUniversalLLM({
        config: typedAiConfig,
        prompt: promptText,
        systemInstruction: 'You are an autonomous cinematic director for Google Flow Veo. Output strictly valid JSON.',
        temperature: 0.8,
        responseJson: true,
      });

      const parsed = llmRes.parsed || {};
      const newDialogue = parsed.dialogue || 'I told you before—nothing changes until you confront the reality of what happened.';
      const counterpartChar = silentChars[0] || 'counterpart';
      const shot = parsed.shotType || (cIndex === 2 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide');
      const scName = parsed.sceneName || `Scene ${cIndex} (Re-rolled: ${arc.dayName})`;

      const newFramePrompt = buildCinematicFrameImagePrompt({
        rawPrompt: parsed.frameImagePrompt,
        clipIndex: cIndex,
        totalClips: 3,
        characterName: activeChar,
        counterpartName: counterpartChar,
        location,
        visualStyle: spec.visualStyle,
        sceneName: scName,
        dialogue: newDialogue,
      });

      const newPromptText = buildCinematicFlowPrompt({
        rawFlow: parsed.flowPrompt,
        clipIndex: cIndex,
        totalClips: 3,
        activeSpeaker: activeChar,
        counterpart: counterpartChar,
        location,
        dialogue: newDialogue,
        sceneName: scName,
        visualStyle: spec.visualStyle,
        shotType: shot,
      });

      const regeneratedClip: ClipPrompt = {
        clipIndex: cIndex,
        totalClips: 3,
        sceneName: scName,
        locationAnchor: location,
        masterKeyframeLock: `Fixed spatial perspective in ${spec.visualStyle}`,
        shotType: shot,
        frameImagePrompt: newFramePrompt,
        speakerIsolation: {
          activeSpeaker: activeChar,
          speakingDialogue: newDialogue,
          silentCharacters: silentChars,
          cameraCutApplied: true,
        },
        timeline: generateSecBySecTimeline(
          activeChar,
          silentChars,
          newDialogue,
          `${activeChar} delivers line with dynamic vocal cadence and measured gaze.`
        ),
        flowPromptText: newPromptText,
        retentionHookReasoning: 'Fresh dynamic angle re-rolled via LLM for optimal tension.',
        pacingWordCount: calculateWordCount(newDialogue),
        requiresReferenceImageAttachment: true,
        foleySoundDesign: 'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
        negativePromptDirectives: 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
      };

      const clipTokenReport = createTokenReport(
        llmRes.usage.promptTokens,
        llmRes.usage.completionTokens,
        llmRes.model,
        llmRes.provider
      );

      return NextResponse.json({
        success: true,
        clip: regeneratedClip,
        tokenUsage: clipTokenReport,
      });
    }

    if (target === 'day') {
      // 2. REGENERATE ENTIRE DAY (3 Variations) VIA LLM
      const variationTypes: Array<'High Tension' | 'Emotional Core' | 'Fast Hook'> = [
        'High Tension',
        'Emotional Core',
        'Fast Hook',
      ];

      const newVariations: VideoVariation[] = [];
      let totalPromptTokens = 0;
      let totalCompTokens = 0;
      let lastModel = 'gemini-3.6-flash';
      let lastProvider = 'gemini';

      for (let vIdx = 0; vIdx < variationTypes.length; vIdx++) {
        const vType = variationTypes[vIdx];
        const produced = await produceVariationWithLLM({
          spec: spec as StorySpec,
          dayNum: dayNumber,
          variationType: vType,
          aiConfig: typedAiConfig,
        });

        if (produced.tokenUsage) {
          totalPromptTokens += produced.tokenUsage.promptTokens || 0;
          totalCompTokens += produced.tokenUsage.completionTokens || 0;
          lastModel = produced.tokenUsage.model || lastModel;
          lastProvider = produced.tokenUsage.provider || lastProvider;
        }

        const unvalidated = {
          id: `day-${dayNumber}-${vType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          variationLabel: `Variation ${String.fromCharCode(65 + vIdx)} (${vType})` as any,
          title: produced.title,
          hookDescription: produced.hookDescription,
          characterAnchors: produced.characterAnchors,
          locationAnchors: produced.locationAnchors,
          clips: produced.clips,
          dialogueScript: produced.dialogueScript,
          isProduced: true,
          metadata: {
            caption: `${produced.title} 🎬 Generated with FlowCreator OS. #AIcinema #GoogleFlow`,
            hashtags: ['#GoogleFlow', '#Veo', '#AIFilmmaking', '#ShortFilm'],
            audioVibe: spec.tone,
          },
        };

        const critique = evaluatePromptCritique(unvalidated);
        newVariations.push({ ...unvalidated, critique });
      }

      const dayTokenReport = createTokenReport(
        totalPromptTokens || 950,
        totalCompTokens || 850,
        lastModel,
        lastProvider
      );

      const dailyPhotos = generateDailyPhotoPosts(
        spec.cast?.[0],
        dayNumber,
        arc.dayName,
        arc.dailyEmotion,
        spec.format,
        spec.locationSettings?.[0],
        spec.cast
      );

      return NextResponse.json({
        success: true,
        day: {
          dayNumber,
          episodeTitle: EPISODE_TITLES[dayNumber] || `Episode ${dayNumber}`,
          dayName: arc.dayName,
          dailyEmotion: `${arc.dayName} Arc: ${arc.dailyEmotion}`,
          variations: newVariations,
          selectedVariationId: newVariations[0].id,
          dailyPhotoPosts: dailyPhotos,
        },
        tokenUsage: dayTokenReport,
      });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to regenerate target via LLM:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to regenerate target via AI' }, { status: 500 });
  }
}
