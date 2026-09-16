import { GoogleGenAI } from '@google/genai';
import { StorySpec, WeeklyBatchDelivery, DayContentPackage, VideoVariation } from '@/types';
import { getWeeklyEmotionArc } from './rules/retention';
import { evaluatePromptCritique } from './critique';
import { generateWeeklyBatch } from './generator';
import { createTokenReport, estimateTokenCount } from './tokens';

function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    null
  );
}

export async function generateWeeklyBatchWithGemini(
  spec: StorySpec,
  options: { mode?: 'mind_maps' | 'full' } = { mode: 'mind_maps' }
): Promise<WeeklyBatchDelivery> {
  const apiKey = getApiKey();
  const isMindMapOnly = options.mode === 'mind_maps';

  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found in environment. Falling back to local procedural engine.');
    return generateWeeklyBatch(spec, options);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = isMindMapOnly
    ? `You are FlowCreator OS — an Autonomous Directing Engine.
You are generating STAGE 1: LIGHTWEIGHT STORY & DIALOGUE MIND MAPS for a 7-Day arc.
To protect tokens, DO NOT generate deep clip prompts yet.
For EACH of the 7 days, generate 3 variations:
- Variation A (High Tension)
- Variation B (Emotional Core)
- Variation C (Fast Hook)

For each variation, provide:
1. "title": Short cinematic episode title
2. "variationLabel": Variation name
3. "hookDescription": Compelling visual/psychological hook
4. "dialogueScript": Array of dialogue lines [{ speaker: string, line: string (18-22 words), timing: string }]
5. "seriesContinuityRecap": Plot continuity recap for this day
6. "metadata": caption, hashtags, audioVibe
7. "clips": [] (Leave EMPTY array to save tokens!)
8. "isProduced": false

Return valid JSON matching the schema with days array containing the variations.`
    : `You are FlowCreator OS — an Autonomous Directing and Production Operating System for Google Flow (Veo).
Your mission is to generate high-performing short-form video story specs and prompt packages for content creators.
You NEVER write generic video prompts. You MUST strictly adhere to the 3 Foundational Pillars:

PILLAR 1: SPATIAL GEOMETRY, MASTER ANCHORS & REFERENCE IMAGE LOCKING
- Every location must have a fixed spatial anchor.
- For characters with a Reference Image: Instruct Google Flow: "[CHARACTER FACE & IDENTITY]: Lock to attached Reference Image. Do not alter facial likeness."
- STORY-ADAPTIVE WARDROBE: While face is locked to the image, adapt the character's clothing naturally to the scene context (e.g. Sharp tailored suit in boardroom, casual hoodie in studio, rain coat in street).
- Scene-based continuity locks (not single chain across different locations).

PILLAR 2: TEMPORAL CHOREOGRAPHY & STRICT SPEAKER ISOLATION
- Google Flow generates 10-second clips.
- Multi-character dialogue MUST use shot-reverse-shot cuts.
- NEVER allow two characters to speak simultaneously in one clip.
- The inactive character in any clip MUST have an explicit directive: "[CHARACTER_NAME: 100% SILENT, LISTENING REACTION ONLY, LIPS SEALED]".

PILLAR 3: RETENTION DYNAMICS & PSYCHOLOGICAL HOOKS
- Clip 1 must have a 0-3s visual-contrast opener.
- Dialogue pacing for each 10s clip must be strictly 18-22 words (never more than 25 words).
- End with a psychological cliffhanger.

OUTPUT SPECIFICATION:
Generate a 7-Day arc (Day 1 to Day 7). For each day, create 3 variations:
- Variation A (High Tension)
- Variation B (Emotional Core)
- Variation C (Fast Hook)

CRITICAL: For EACH clip, you MUST provide TWO distinct prompts:
1. "frameImagePrompt": The exact Text-to-Image prompt to generate this clip's starting keyframe image (composition, character placement screen-left/right, scene-adaptive wardrobe, 4K photorealistic lighting).
2. "flowPromptText": The 10-second video motion directive for Google Flow (Veo). This prompt MUST EMBED THE SPOKEN DIALOGUE directly inside it with vocal tone and lip-sync directives so Google Flow generates the voice!
Format of "flowPromptText":
- [CINEMATIC SPEC]: 9:16 vertical video, 24fps motion blur, 4K film composition.
- [LOCATION MASTER ANCHOR]: Fixed spatial coordinates.
- [ACTIVE CHARACTER & SILENT CHARACTERS]: Active character in sharp focus; inactive characters explicitly marked "[NAME: 100% SILENT, LIPS SEALED, LISTENING REACTION ONLY]".
- [AUDIO & SPOKEN DIALOGUE]: Spoken Line: "[Exact Spoken Words]" (in English with vocal tone description). Lip-Sync Directive: Realistic mouth opening, syllable matching, breath pauses.
- [SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
  • [0:00 - 0:02 | HOOK & DRAMATIC PAUSE]: Camera angle/lens, character pose, 1.5s dramatic pregnant pause before speech, ambient SFX.
  • [0:02 - 0:07 | DIALOGUE DELIVERY & LIP-SYNC]: Camera movement, physical gesture/head tilt, spoken line "[Exact Dialogue]" with precise lip-sync.
  • [0:07 - 0:09 | REACTION & TENSION HOLD]: Camera drift, sealed lips, heavy silent tension.
  • [0:09 - 0:10 | CLIFFHANGER CUT]: Abrupt cutoff, dramatic cliffhanger sound design.
Plus character/location reference prompts, dialogue script, and metadata (caption, hashtags).
Return valid JSON only matching the schema.`;

  const promptText = `Story Specification:
- Format: ${spec.format}
- Genres: ${spec.genres.join(', ')}
- Tone: ${spec.tone}
- Visual Style: ${spec.visualStyle}
${spec.workflowPipeline ? `- CUSTOM NICHE PIPELINE: "${spec.workflowPipeline.name}" (${spec.workflowPipeline.nicheType})
  * Persona DNA Lock: "${spec.workflowPipeline.personaSubjectAnchor}"
  * Camera & Shooting Style: "${spec.workflowPipeline.cameraShootingStyle}"
  * Hook Recipe: "${spec.workflowPipeline.hookArchetype}"
  * Pacing Cadence: "${spec.workflowPipeline.pacingCadence}"
  * Audio & Foley Mood: "${spec.workflowPipeline.audioFoleyMood || 'Proximity vocal presence, room acoustics'}"
  (CRITICAL: Strictly enforce this camera shooting style, persona anchor, and hook pacing in every clip!)` : ''}
${spec.customStoryIdea ? `- CREATOR'S CUSTOM STORY PREMISE / ANCHOR: "${spec.customStoryIdea}" (Incorporate this premise as the core narrative throughout the 7-day arc!)` : ''}
- Cast Setup: ${spec.cast
    .map(
      (c) =>
        `${c.name} (${c.role}): ${
          c.usesReferenceImage
            ? `Uses Reference Image for facial DNA. Personality Vibe: ${c.personalityVibe || 'Dynamic'}`
            : c.dnaPrompt
        }`
    )
    .join(' | ')}
- Locations: ${spec.locationSettings.join(', ')}

Generate a complete 7-Day production delivery package with 3 variations per day.`;


  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(responseText);

    // If Gemini returned an array of days or a batch object, standardize it
    const rawDays = Array.isArray(parsedData)
      ? parsedData
      : parsedData.days || parsedData.weeklyBatch || [];

    if (!Array.isArray(rawDays) || rawDays.length === 0) {
      throw new Error('Gemini response format did not contain valid days array');
    }

    const days: DayContentPackage[] = rawDays.slice(0, 7).map((d: any, dayIdx: number) => {
      const arc = getWeeklyEmotionArc(dayIdx + 1);
      const variations: VideoVariation[] = (d.variations || []).map((v: any, vIdx: number) => {
        const vLabel =
          v.variationLabel ||
          (vIdx === 0
            ? 'Variation A (High Tension)'
            : vIdx === 1
            ? 'Variation B (Emotional Core)'
            : 'Variation C (Fast Hook)');

        const unvalidatedVariation = {
          id: `day-${dayIdx + 1}-v${vIdx + 1}`,
          variationLabel: vLabel,
          title: v.title || `${arc.dayName} Episode - ${vLabel}`,
          hookDescription: v.hookDescription || `${spec.format} story for ${arc.dailyEmotion}`,
          characterAnchors: v.characterAnchors || [
            {
              characterName: spec.cast[0]?.name || 'Protagonist',
              anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${spec.cast[0]?.name || 'Protagonist'} DNA Lock. ${spec.visualStyle}`,
            },
          ],
          locationAnchors: v.locationAnchors || [
            {
              locationName: spec.locationSettings[0] || 'Main Location',
              anchorPrompt: `[LOCATION MASTER FRAME ANCHOR]: ${spec.locationSettings[0] || 'Main Location'}. ${spec.visualStyle}`,
            },
          ],
          clips: isMindMapOnly
            ? []
            : (v.clips || []).map((c: any, cIdx: number) => ({
                clipIndex: c.clipIndex || cIdx + 1,
                totalClips: 3,
                sceneName: c.sceneName || `Scene ${cIdx + 1}`,
                locationAnchor: c.locationAnchor || spec.locationSettings[0] || 'Main Location',
                masterKeyframeLock: c.masterKeyframeLock || `Spatial master lock in ${spec.visualStyle}`,
                shotType: c.shotType || (cIdx === 1 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide'),
                speakerIsolation: {
                  activeSpeaker: c.speakerIsolation?.activeSpeaker || spec.cast[0]?.name || 'Speaker',
                  speakingDialogue: c.speakerIsolation?.speakingDialogue || c.dialogue || '',
                  silentCharacters: c.speakerIsolation?.silentCharacters || [],
                  cameraCutApplied: Boolean(c.speakerIsolation?.cameraCutApplied ?? true),
                },
                timeline: (c.timeline || [
                  {
                    timeRange: '0:00 - 0:03',
                    visualAction: 'High contrast visual opener.',
                    cameraMovement: 'Subtle slow push-in.',
                    sfxCue: 'Subtle bass sub-drop, sudden silence on cut.',
                  },
                  {
                    timeRange: '0:03 - 0:08',
                    visualAction: 'Delivers dialogue with strict speaker isolation.',
                    cameraMovement: 'Locked portrait framing.',
                    sfxCue: 'Clear dialogue vocal warmth, faint emotional cello / atmospheric drone.',
                  },
                  {
                    timeRange: '0:08 - 0:10',
                    visualAction: 'Lingering reaction hold before clip cut.',
                    cameraMovement: 'Static hold.',
                    sfxCue: 'Sharp breath intake, cliffhanger riser sound, sudden audio cut.',
                  },
                ]).map((t: any) => ({
                  ...t,
                  sfxCue: t.sfxCue || 'Cinematic room tone and subtle foley sound.',
                })),
                frameImagePrompt:
                  c.frameImagePrompt ||
                  `[VIDEO FRAME IMAGE - KEYFRAME ${cIdx + 1}/3]: ${spec.locationSettings[0] || 'Scene'}. ${spec.visualStyle}. ${c.shotType || 'Cinematic Shot'}. Photorealistic 4K starting keyframe composition. Key lighting, architectural depth, shallow focus.`,
                flowPromptText:
                  c.flowPromptText ||
                  `[CLIP ${cIdx + 1}/3 - GOOGLE FLOW VEO DIRECTIVE]\n[LOCATION]: ${spec.locationSettings[0]}\n[SHOT]: 4K Cinematic\n[ACTIVE SPEAKER]: ${c.speakerIsolation?.activeSpeaker || 'Speaker'}`,
                retentionHookReasoning: c.retentionHookReasoning || '0-3s hook captures feed attention.',
                pacingWordCount: (c.speakerIsolation?.speakingDialogue || '').split(/\s+/).filter(Boolean).length || 18,
                sceneWardrobe: c.sceneWardrobe || 'Adaptive scene-appropriate styling',
                requiresReferenceImageAttachment: Boolean(spec.cast.some((char) => char.usesReferenceImage)),
                foleySoundDesign: c.foleySoundDesign || 'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
                negativePromptDirectives: c.negativePromptDirectives || 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
              })),
          isProduced: !isMindMapOnly,
          dialogueScript: v.dialogueScript || [],
          seriesContinuityRecap: v.seriesContinuityRecap || `Day ${dayIdx + 1} Continuity: ${arc.dailyEmotion}. Culminates in a psychological cliffhanger.`,
          metadata: {
            caption: v.metadata?.caption || `${v.title || 'New Episode'} 🎬 Directed with FlowCreator OS. #GoogleFlow #AIvideo`,
            hashtags: v.metadata?.hashtags || ['#GoogleFlow', '#Veo', '#AICinema', '#ViralShorts'],
            audioVibe: v.metadata?.audioVibe || spec.tone,
          },
        };

        const critique = evaluatePromptCritique(unvalidatedVariation);
        return {
          ...unvalidatedVariation,
          critique,
        };
      });

      return {
        dayNumber: dayIdx + 1,
        dayName: arc.dayName,
        dailyEmotion: `${arc.dayName} Arc: ${arc.dailyEmotion}`,
        variations: variations.length > 0 ? variations : generateWeeklyBatch(spec).days[dayIdx].variations,
        selectedVariationId: variations[0]?.id,
      };
    });

    const seriesBible = parsedData.seriesBible || {
      arcOverview: `7-Day Story Arc for ${spec.format.replace('_', ' ').toUpperCase()} in ${spec.visualStyle}. Follows a rising tension progression from initial curiosity to weekend climax.`,
      characterArcs: spec.cast.map((c) => ({
        name: c.name,
        weekArc: `${c.name} (${c.role}): Undergoes high-tension dynamic shift across the 7 episodes.`,
      })),
      keyCliffhangers: [
        'Day 1: Inciting betrayal and concealed motives.',
        'Day 3: Mid-week revelation of unexpected alliance.',
        'Day 5: Direct high-stakes confrontation.',
        'Day 7: Final climax setting up future narrative arcs.',
      ],
    };

    const usage = (response as any)?.usageMetadata;
    const promptTokens =
      usage?.promptTokenCount || estimateTokenCount(promptText + systemInstruction);
    const completionTokens =
      usage?.candidatesTokenCount || estimateTokenCount(responseText);
    const tokenUsage = createTokenReport(
      promptTokens,
      completionTokens,
      'gemini-3.6-flash',
      'gemini-api'
    );

    return {
      id: `batch-${Date.now()}`,
      spec,
      createdAt: new Date().toISOString(),
      days,
      seriesBible,
      tokenUsage,
    };
  } catch (err) {
    console.error('Gemini Generation failed, seamlessly using procedural rule engine:', err);
    return generateWeeklyBatch(spec);
  }
}

