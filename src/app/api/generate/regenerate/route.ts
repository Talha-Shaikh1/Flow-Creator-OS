import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { StorySpec, ClipPrompt, VideoVariation } from '@/types';
import { getWeeklyEmotionArc, validateDialoguePacing, calculateWordCount } from '@/lib/engine/rules/retention';
import { formatSpeakerIsolationPrompt, generateSecBySecTimeline } from '@/lib/engine/rules/temporal';
import { evaluatePromptCritique } from '@/lib/engine/critique';
import { buildCharacterDramaClips } from '@/lib/engine/templates/character-drama';
import { buildObjectTalkingClips } from '@/lib/engine/templates/object-talking';
import { buildPodcastStyleClips } from '@/lib/engine/templates/podcast-style';
import { buildFacelessAmbientClips } from '@/lib/engine/templates/faceless-ambient';
import { createTokenReport, estimateTokenCount } from '@/lib/engine/tokens';

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, spec, dayNumber, variationIndex, clipIndex, existingVariation } = body;

    const apiKey = getApiKey();
    const arc = getWeeklyEmotionArc(dayNumber || 1);

    if (target === 'clip') {
      // 1. REGENERATE SINGLE CLIP
      const activeChar = spec.cast[0]?.name || 'Speaker 1';
      const silentChars = spec.cast.slice(1).map((c: any) => c.name);

      let newDialogue = `I told you before—nothing changes until you confront the reality of what happened.`;
      let newPromptText = '';
      const cIndex = clipIndex || 1;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Regenerate Clip ${cIndex} of 3 for a 10s Google Flow short film.
Story format: ${spec.format}
Theme/Tone: ${spec.tone} (${arc.dailyEmotion})
Active Speaker: ${activeChar}
Silent Characters in background: ${silentChars.join(', ') || 'None'}
Rules: Strict speaker isolation (silent characters must have [SILENT] directive), optimal dialogue 18-22 words, shot-reverse-shot camera cut.
Return JSON with { "dialogue": string, "sceneName": string, "shotType": string, "visualAction": string, "flowPrompt": string }`,
          config: { responseMimeType: 'application/json', temperature: 0.8 },
        });

        try {
          const parsed = JSON.parse(res.text?.trim() || '{}');
          if (parsed.dialogue) newDialogue = parsed.dialogue;
          if (parsed.flowPrompt) newPromptText = parsed.flowPrompt;
        } catch (e) {
          // fallback to rule template
        }
      }

      const regeneratedClip: ClipPrompt = {
        clipIndex: cIndex,
        totalClips: 3,
        sceneName: `Scene ${cIndex} (Re-rolled: ${arc.dayName})`,
        locationAnchor: spec.locationSettings[0] || 'Main Set',
        masterKeyframeLock: `Fixed spatial perspective in ${spec.visualStyle}`,
        shotType: cIndex === 2 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide',
        frameImagePrompt: `[VIDEO FRAME IMAGE - KEYFRAME ${cIndex}/3]: ${spec.locationSettings[0] || 'Main Set'}. ${spec.visualStyle}. ${cIndex === 2 ? 'Tight reverse medium shot' : 'Master wide establishing shot'} on ${activeChar}. 4K photorealistic cinematic composition, key lighting, sharp depth.`,
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
          `${activeChar} reacts dynamically with intense focal presence.`
        ),
        flowPromptText:
          newPromptText ||
          `[CLIP ${cIndex}/3 - GOOGLE FLOW VEO DIRECTIVE]\n[LOCATION]: ${spec.locationSettings[0]}\n[SUBJECT]: ${activeChar}\n[SPEAKER ISOLATION]: ${formatSpeakerIsolationPrompt({ activeSpeaker: activeChar, speakingDialogue: newDialogue, silentCharacters: silentChars, requiresMidClipCut: false })}\n[SHOT]: 4K Cinematic Lighting.`,
        retentionHookReasoning: 'Fresh dynamic angle re-rolled for optimal pacing.',
        pacingWordCount: calculateWordCount(newDialogue),
      };

      const clipTokenReport = createTokenReport(
        420,
        estimateTokenCount(newDialogue + newPromptText) + 180,
        apiKey ? 'gemini-3.6-flash' : 'flowcreator-procedural',
        'regenerate-clip'
      );

      return NextResponse.json({
        success: true,
        clip: regeneratedClip,
        tokenUsage: clipTokenReport,
      });
    }

    if (target === 'day') {
      // 2. REGENERATE ENTIRE DAY (3 Variations)
      const variationTypes: Array<'High Tension' | 'Emotional Core' | 'Fast Hook'> = [
        'High Tension',
        'Emotional Core',
        'Fast Hook',
      ];

      const newVariations: VideoVariation[] = variationTypes.map((vType, vIdx) => {
        let built: any;
        switch (spec.format) {
          case 'object_talking':
            built = buildObjectTalkingClips(spec, arc.dailyEmotion, vType);
            break;
          case 'podcast_style':
            built = buildPodcastStyleClips(spec, arc.dailyEmotion, vType);
            break;
          case 'faceless_ambient':
            built = buildFacelessAmbientClips(spec, arc.dailyEmotion, vType);
            break;
          default:
            built = buildCharacterDramaClips(spec, arc.dailyEmotion, vType);
            break;
        }

        const unvalidated = {
          id: `day-${dayNumber}-${vType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          variationLabel: `Variation ${String.fromCharCode(65 + vIdx)} (${vType})` as any,
          title: built.title,
          hookDescription: built.hookDescription,
          characterAnchors: built.characterAnchors,
          locationAnchors: built.locationAnchors,
          clips: built.clips,
          dialogueScript: built.dialogueScript,
          metadata: {
            caption: `${built.title} 🎬 Generated with FlowCreator OS. #AIcinema #GoogleFlow`,
            hashtags: ['#GoogleFlow', '#Veo', '#AIFilmmaking', '#ShortFilm'],
            audioVibe: spec.tone,
          },
        };

        const critique = evaluatePromptCritique(unvalidated);
        return { ...unvalidated, critique };
      });

      const dayTokenReport = createTokenReport(
        950,
        estimateTokenCount(JSON.stringify(newVariations)),
        'flowcreator-procedural',
        'procedural-engine'
      );

      return NextResponse.json({
        success: true,
        day: {
          dayNumber,
          dayName: arc.dayName,
          dailyEmotion: `${arc.dayName} Arc: ${arc.dailyEmotion}`,
          variations: newVariations,
          selectedVariationId: newVariations[0].id,
        },
        tokenUsage: dayTokenReport,
      });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to regenerate target:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
