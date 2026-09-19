import { StorySpec, ClipPrompt } from '@/types';
import { getWeeklyEmotionArc, calculateWordCount } from './rules/retention';
import { createTokenReport, estimateTokenCount } from './tokens';
import { callUniversalLLM, AIProviderConfig } from './llm-provider';
import { resolveAutonomousCast, resolveSeriesTitle, EPISODE_TITLES } from './generator';

export async function produceVariationWithLLM({
  spec,
  dayNum,
  variationType,
  existingVariation,
  aiConfig,
}: {
  spec: StorySpec;
  dayNum: number;
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook';
  existingVariation?: any;
  aiConfig?: AIProviderConfig;
}): Promise<{
  title: string;
  hookDescription: string;
  dialogueScript: any[];
  masterFrameImagePrompt?: string;
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  clips: ClipPrompt[];
  tokenUsage?: any;
}> {
  if (!spec.cast || spec.cast.length === 0 || spec.autonomousCast) {
    spec.cast = resolveAutonomousCast(spec);
    spec.castCount = spec.cast.length;
  }
  spec.seriesTitle = resolveSeriesTitle(spec);

  const arc = getWeeklyEmotionArc(dayNum);
  const episodeName = EPISODE_TITLES[dayNum] || `Episode ${dayNum}`;
  const baseTitle = existingVariation?.title || `${episodeName} - ${variationType}`;
  const baseHook = existingVariation?.hookDescription || `${spec.format} story for ${arc.dailyEmotion}`;
  const baseScript = existingVariation?.dialogueScript || [];

  const char1 = spec.cast[0]?.name || 'Julian Vance';
  const char2 = spec.cast[1]?.name || 'Elena Sterling';
  const location = spec.locationSettings[0] || 'Executive Penthouse Study';

  const systemInstruction = `You are FlowCreator OS — an Elite Autonomous Directing Engine producing a 3-clip short-form cinematic video episode for Google Flow (Veo 2).
You MUST strictly adhere to the Directing Directives:

1. 3-CLIP SHOT-REVERSE-SHOT CONTINUITY:
- Multi-character dialogue MUST alternate: Clip 1 (Lead A speaks, Lead B silent), Clip 2 (Lead B speaks, Lead A silent), Clip 3 (Culmination/Reversal).
- Strict Speaker Isolation: NEVER allow two characters to speak simultaneously. The inactive character MUST have: "[NAME: 100% SILENT, LISTENING REACTION ONLY, LIPS SEALED, BACK TO CAMERA / SOFT FOCUS]".

2. VOCAL CADENCE & DYNAMIC TONAL INFLECTION (SAKHTI & NARMI):
- Detail how the voice shifts in each clip (e.g., quiet, calm narmi hardening into sharp authority sakhti, or icy whisper).
- Spoken dialogue strictly 18-22 words per clip.

3. GOOGLE FLOW VEO 2 DIRECTIVE STRUCTURE:
Each clip's "flowPromptText" must be fully formatted as:
[CLIP X/3 - GOOGLE FLOW VEO MASTER DIRECTIVE]
[CINEMATIC SPEC]: 9:16 vertical composition, 24fps motion blur, 4K film composition.
[LOCATION MASTER ANCHOR]: ${location}.
[CHARACTER REFERENCE ANCHORS & SPATIAL BLOCKING]:
- Active: Original fictional character [Name] [ATTACH REFERENCE IMAGE 1 - [NAME]].
- Counterpart: Original fictional character [Counterpart Name] [ATTACH REFERENCE IMAGE 2 - [COUNTERPART]].
[VOCAL CADENCE & DYNAMIC TONAL INFLECTION (SAKHTI & NARMI)]:
- Dynamic Modulation: ...
- Spoken Line: "..."
- Lip-Sync Directive: Realistic mouth synchronization matching syllables.
[SHOT & CAMERA]: Camera angle, lens, and rack-focus shift to counterpart.
[SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
- [0:00 - 0:02 | SUSPENSE BEAT]: 1.5s dramatic pause, composed posture.
- [0:02 - 0:07 | VOCAL DELIVERY & MODULATION]: Dialogue with sakhti/narmi tonal inflection.
- [0:07 - 0:09 | CAMERA SHIFT & COUNTERPART REACTION]: Rack-focus drift to counterpart [ATTACH REFERENCE IMAGE 2], rigid posture, sealed lips.
- [0:09 - 0:10 | CONTINUITY HOLD]: Cliffhanger standoff hold.
[LIGHTING & ATMOSPHERE]: Chiaroscuro key lighting, atmospheric depth.
[AUDIO & FOLEY SOUND DESIGN]: Room acoustics, directional vocal warmth, subtle tension drone.
[NEGATIVE DIRECTIVES]: morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter. (NEVER write blood, weapons, violence, gore, or tobacco).

4. REFERENCE IMAGE ANCHOR (Flux / Midjourney frameImagePrompt):
[VIDEO FRAME IMAGE - KEYFRAME X/3 (FLUX / MIDJOURNEY)]:
[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of [Character]. Maintain 100% exact facial geometry, cheekbone structure, eyes, and hair styling without alteration.
[SCENE BLOCKING & ACTION]: ...
[CINEMATOGRAPHY & LIGHTING]: ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field. 8K photorealistic film still.

Return strictly valid JSON with this schema:
{
  "title": string,
  "hookDescription": string,
  "dialogueScript": [
    { "speaker": string, "line": string, "timing": string }
  ],
  "masterFrameImagePrompt": string,
  "characterAnchors": [
    { "characterName": string, "anchorPrompt": string }
  ],
  "locationAnchors": [
    { "locationName": string, "anchorPrompt": string }
  ],
  "clips": [
    {
      "clipIndex": 1,
      "totalClips": 3,
      "sceneName": string,
      "locationAnchor": string,
      "masterKeyframeLock": string,
      "shotType": string,
      "speakerIsolation": {
        "activeSpeaker": string,
        "speakingDialogue": string,
        "silentCharacters": string[],
        "cameraCutApplied": true
      },
      "timeline": [
        { "timeRange": "0:00 - 0:02", "visualAction": string, "cameraMovement": string, "sfxCue": string },
        { "timeRange": "0:02 - 0:07", "visualAction": string, "cameraMovement": string, "sfxCue": string },
        { "timeRange": "0:07 - 0:10", "visualAction": string, "cameraMovement": string, "sfxCue": string }
      ],
      "frameImagePrompt": string,
      "flowPromptText": string,
      "retentionHookReasoning": string,
      "sceneWardrobe": string,
      "requiresReferenceImageAttachment": true,
      "foleySoundDesign": string,
      "negativePromptDirectives": string
    }
  ]
}`;

  const promptText = `PRODUCE EPISODE DIRECTIVES:
- Series: "${spec.seriesTitle}"
- Day: ${dayNum} (${arc.dayName})
- Daily Emotion: "${arc.dailyEmotion}"
- Variation Type: "${variationType}"
- Working Episode Title: "${baseTitle}"
- Working Hook: "${baseHook}"
${baseScript.length > 0 ? `- Existing Dialogue Context:\n${baseScript.map((s: any) => `  * ${s.speaker}: "${s.line}"`).join('\n')}` : ''}
- Story Premise: "${spec.customStoryIdea || spec.tone}"
- Format: ${spec.format}
- Visual Style: ${spec.visualStyle}
- Cast:
  * Lead 1 (Hero): ${char1}
  * Lead 2 (Villain/Rival): ${char2}
- Location: ${location}

Generate the complete 3-clip production package now.`;

  const llmRes = await callUniversalLLM({
    config: aiConfig,
    prompt: promptText,
    systemInstruction,
    temperature: 0.7,
    responseJson: true,
  });

  const parsed = llmRes.parsed;
  if (!parsed || !Array.isArray(parsed.clips) || parsed.clips.length === 0) {
    throw new Error('LLM did not return valid clips array for produced variation.');
  }

  const clips: ClipPrompt[] = parsed.clips.slice(0, 3).map((c: any, idx: number) => {
    const dialogue = c.speakerIsolation?.speakingDialogue || c.dialogue || '';
    return {
      clipIndex: idx + 1,
      totalClips: 3,
      sceneName: c.sceneName || `Scene ${idx + 1}`,
      locationAnchor: c.locationAnchor || location,
      masterKeyframeLock: c.masterKeyframeLock || `Spatial perspective in ${spec.visualStyle}`,
      shotType: c.shotType || (idx === 1 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide'),
      speakerIsolation: {
        activeSpeaker: c.speakerIsolation?.activeSpeaker || (idx === 1 ? char2 : char1),
        speakingDialogue: dialogue,
        silentCharacters: c.speakerIsolation?.silentCharacters || [idx === 1 ? char1 : char2],
        cameraCutApplied: true,
      },
      timeline: (c.timeline || [
        { timeRange: '0:00 - 0:02', visualAction: 'Composed opening beat.', cameraMovement: 'Subtle slow push.', sfxCue: 'Tension sub-bass.' },
        { timeRange: '0:02 - 0:07', visualAction: 'Delivers dialogue with tonal cadence.', cameraMovement: 'Locked portrait.', sfxCue: 'Clear vocal warmth.' },
        { timeRange: '0:07 - 0:10', visualAction: 'Rack-focus to counterpart silent reaction.', cameraMovement: 'Rack focus drift.', sfxCue: 'Standoff hold tone.' },
      ]).map((t: any) => ({
        ...t,
        sfxCue: t.sfxCue || 'Cinematic room acoustics and tension drone.',
      })),
      frameImagePrompt: c.frameImagePrompt || `[VIDEO FRAME IMAGE - KEYFRAME ${idx + 1}/3]: ${location}. ${spec.visualStyle}. 4K keyframe portrait.`,
      flowPromptText: c.flowPromptText || `[CLIP ${idx + 1}/3 - GOOGLE FLOW VEO MASTER DIRECTIVE]\n[LOCATION]: ${location}\n[ACTIVE SPEAKER]: ${idx === 1 ? char2 : char1}`,
      retentionHookReasoning: c.retentionHookReasoning || '0-3s hook captures algorithmic retention.',
      pacingWordCount: calculateWordCount(dialogue) || 18,
      sceneWardrobe: c.sceneWardrobe || 'Adaptive scene-appropriate styling',
      requiresReferenceImageAttachment: true,
      foleySoundDesign: c.foleySoundDesign || 'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
      negativePromptDirectives: c.negativePromptDirectives || 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
    };
  });

  const tokenUsage = createTokenReport(
    llmRes.usage.promptTokens,
    llmRes.usage.completionTokens,
    llmRes.model,
    llmRes.provider
  );

  return {
    title: parsed.title || baseTitle,
    hookDescription: parsed.hookDescription || baseHook,
    dialogueScript: parsed.dialogueScript || baseScript,
    masterFrameImagePrompt: parsed.masterFrameImagePrompt || clips[0]?.frameImagePrompt,
    characterAnchors: parsed.characterAnchors || [
      { characterName: char1, anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${char1} DNA Lock. ${spec.visualStyle}` },
      { characterName: char2, anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${char2} DNA Lock. ${spec.visualStyle}` },
    ],
    locationAnchors: parsed.locationAnchors || [
      { locationName: location, anchorPrompt: `[LOCATION MASTER FRAME ANCHOR]: ${location}. ${spec.visualStyle}` },
    ],
    clips,
    tokenUsage,
  };
}
