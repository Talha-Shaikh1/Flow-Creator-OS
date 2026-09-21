import { StorySpec, ClipPrompt } from '@/types';
import { getWeeklyEmotionArc, calculateWordCount } from './rules/retention';
import { createTokenReport } from './tokens';
import { callUniversalLLM, AIProviderConfig } from './llm-provider';
import { resolveAutonomousCast, resolveSeriesTitle, EPISODE_TITLES } from './generator';

export function buildCinematicFrameImagePrompt({
  rawPrompt,
  clipIndex,
  totalClips,
  characterName,
  counterpartName,
  location,
  visualStyle,
  sceneName,
  dialogue,
}: {
  rawPrompt?: string;
  clipIndex: number;
  totalClips: number;
  characterName: string;
  counterpartName: string;
  location: string;
  visualStyle: string;
  sceneName: string;
  dialogue?: string;
}): string {
  // If the prompt is already comprehensive (> 220 characters with key anchors), preserve it
  if (
    rawPrompt &&
    rawPrompt.length > 220 &&
    (rawPrompt.includes('[IMAGE REFERENCE ANCHOR]') || rawPrompt.includes('REFERENCE IMAGE')) &&
    (rawPrompt.includes('[CINEMATOGRAPHY') || rawPrompt.includes('Anamorphic') || rawPrompt.includes('Alexa'))
  ) {
    return rawPrompt;
  }

  // Clean raw prompt to use as scene action context
  const cleanSnippet = (rawPrompt || '')
    .replace(/\[VIDEO FRAME IMAGE.*?\]:?/gi, '')
    .replace(/\[KEYFRAME.*?\]:?/gi, '')
    .trim();

  const actionText =
    cleanSnippet ||
    `${characterName} positioned in high-tension dramatic standoff. Delivering narrative beat: "${dialogue || 'calculated emotional revelation'}"`;

  return `[VIDEO FRAME IMAGE - KEYFRAME ${clipIndex}/${totalClips} (FLUX / MIDJOURNEY)]
[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of ${characterName}. Strict facial geometry lock, exact cheekbones, jawline, skin texture, and hair styling without alteration. Zero facial distortion or morphing.
[SCENE BLOCKING & SPATIAL DEPTH]: ${characterName} positioned in dynamic foreground at ${location}. ${sceneName}. ${actionText}. ${counterpartName} positioned over-shoulder in soft optical depth-of-field blur.
[CINEMATOGRAPHY & LIGHTING]: Shot on ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field, dramatic cinematic chiaroscuro key lighting, moody volumetric rim light, subtle atmospheric haze, deep rich shadows.
[FILM EMULATION & PALETTE]: 8K UHD photorealistic film still, ${visualStyle}, Kodak Vision3 500T 5219 texture, natural skin pore detail, balanced film grain, high dynamic range, master graded color palette.`;
}

export function buildCinematicFlowPrompt({
  rawFlow,
  clipIndex,
  totalClips,
  activeSpeaker,
  counterpart,
  location,
  dialogue,
  sceneName,
  visualStyle,
  shotType,
}: {
  rawFlow?: string;
  clipIndex: number;
  totalClips: number;
  activeSpeaker: string;
  counterpart: string;
  location: string;
  dialogue: string;
  sceneName: string;
  visualStyle: string;
  shotType?: string;
}): string {
  // If already substantial (> 250 characters with timeline cues), keep it
  if (
    rawFlow &&
    rawFlow.length > 250 &&
    (rawFlow.includes('SECOND-BY-SECOND') || rawFlow.includes('0:00 - 0:02') || rawFlow.includes('[TIMELINE]'))
  ) {
    return rawFlow;
  }

  return `[CLIP ${clipIndex}/${totalClips} - GOOGLE FLOW VEO MASTER DIRECTIVE]
[CINEMATIC SPEC]: 9:16 vertical composition (Shorts/Reels), 24fps motion blur, 4K Hollywood composition.
[LOCATION MASTER ANCHOR]: ${location}. Master visual lock in ${visualStyle}.
[CHARACTER REFERENCE ANCHORS & SPATIAL BLOCKING]:
- Active: Original fictional character ${activeSpeaker} [ATTACH REFERENCE IMAGE 1 - ${activeSpeaker.toUpperCase()}].
- Counterpart: Original fictional character ${counterpart} [ATTACH REFERENCE IMAGE 2 - ${counterpart.toUpperCase()}]. [100% SILENT, LISTENING REACTION ONLY, LIPS SEALED, EYE CONTACT LOCKED].
[VOCAL CADENCE & DYNAMIC TONAL INFLECTION (SAKHTI & NARMI)]:
- Dynamic Modulation: Delivery begins with calm, quiet restraint (narmi), gradually hardening into sharp steely authority (sakhti).
- Spoken Line: "${dialogue}"
- Lip-Sync Directive: Realistic mouth lip-synchronization. Syllables, jaw, and facial muscles move naturally matching each spoken word. Lips seal completely after line ends.
[SHOT & CAMERA]: ${shotType || (clipIndex === 2 ? 'Shot-Reverse-Shot Close-Up' : 'Medium Cinematic Shot')}, slow tracking drift with rack-focus transition to counterpart.
[SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
- [0:00 - 0:02 | SUSPENSE BEAT]: 1.5s dramatic pause, composed posture, steady breathing, eye contact locked across the room.
- [0:02 - 0:07 | VOCAL DELIVERY & MODULATION]: ${activeSpeaker} delivers spoken line with clear syllable sync and controlled tonal inflection.
- [0:07 - 0:09 | CAMERA SHIFT & COUNTERPART REACTION]: Rack-focus drift to ${counterpart} [ATTACH REFERENCE IMAGE 2], rigid posture, lips sealed, silent reaction.
- [0:09 - 0:10 | CONTINUITY HOLD]: Cliffhanger standoff hold, suspense beat into next clip cut.
[LIGHTING & ATMOSPHERE]: Dramatic chiaroscuro key lighting, atmospheric volumetric haze, moody shadows.
[AUDIO & FOLEY SOUND DESIGN]: Room acoustic resonance, directional vocal warmth, subtle tension sub-drone.
[NEGATIVE DIRECTIVES]: morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter. (NEVER write blood, weapons, violence, gore, or tobacco).`;
}

export async function produceVariationWithLLM({
  spec,
  dayNum,
  variationType,
  existingVariation,
  forceFresh,
  aiConfig,
}: {
  spec: StorySpec;
  dayNum: number;
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook';
  existingVariation?: any;
  forceFresh?: boolean;
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
  const baseTitle = (!forceFresh && existingVariation?.title) || `${episodeName} - ${variationType}`;
  const baseHook = (!forceFresh && existingVariation?.hookDescription) || `${spec.format} story for ${arc.dailyEmotion}`;
  const baseScript = (!forceFresh && existingVariation?.dialogueScript) || [];

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
- Dynamic Modulation: Delivery begins with calm restraint (narmi) hardening into steely authority (sakhti)...
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

4. REFERENCE IMAGE ANCHOR (Flux / Midjourney frameImagePrompt) — STRICT 6-10 LINE FORMAT:
CRITICAL REQUIREMENT: Every single clip's "frameImagePrompt" MUST BE A COMPREHENSIVE 6 TO 10 LINE MASTER PHOTOREALISTIC PROMPT!
NEVER PROVIDE A SHORT 1 OR 2 LINE PROMPT! You MUST include all 4 tagged sections:
[VIDEO FRAME IMAGE - KEYFRAME X/3 (FLUX / MIDJOURNEY)]
[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of [Character]. Maintain 100% exact facial geometry, high cheekbones, distinct jawline, eyes, and hair styling without alteration. Zero facial distortion or morphing.
[SCENE BLOCKING & SPATIAL DEPTH]: [Character] positioned in dynamic foreground at ${location}. Detailed pose, posture, props, and micro-expression. Counterpart visible over-shoulder in soft optical depth-of-field blur.
[CINEMATOGRAPHY & LIGHTING]: Shot on ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field, dramatic cinematic chiaroscuro key lighting, moody volumetric rim light, subtle atmospheric haze.
[FILM EMULATION & PALETTE]: 8K UHD photorealistic film still, ${spec.visualStyle}, Kodak Vision3 500T 5219 texture, natural skin pore detail, balanced film grain, high dynamic range, master graded color palette.

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
${forceFresh ? `- FORCE FRESH GENERATION: Ignore prior dialogue lines. Craft completely new, high-stakes dialogue lines, fresh dramatic visual blocking, and new plot suspense from scratch.` : (baseScript.length > 0 ? `- Existing Dialogue Context:\n${baseScript.map((s: any) => `  * ${s.speaker}: "${s.line}"`).join('\n')}` : '')}
- Story Premise: "${spec.customStoryIdea || spec.tone}"
- Format: ${spec.format}
- Visual Style: ${spec.visualStyle}
- Cast:
  * Lead 1 (Hero): ${char1}
  * Lead 2 (Villain/Rival): ${char2}
- Location: ${location}

Generate the complete 3-clip production package now. Ensure all "frameImagePrompt" fields are full 6-10 line cinematic master prompts.`;

  const llmRes = await callUniversalLLM({
    config: aiConfig,
    prompt: promptText,
    systemInstruction,
    temperature: forceFresh ? 0.85 : 0.7,
    responseJson: true,
  });

  const parsed = llmRes.parsed;
  if (!parsed || !Array.isArray(parsed.clips) || parsed.clips.length === 0) {
    throw new Error('LLM did not return valid clips array for produced variation.');
  }

  const clips: ClipPrompt[] = parsed.clips.slice(0, 3).map((c: any, idx: number) => {
    const dialogue = c.speakerIsolation?.speakingDialogue || c.dialogue || '';
    const activeSpk = c.speakerIsolation?.activeSpeaker || (idx === 1 ? char2 : char1);
    const counterpartSpk = activeSpk === char1 ? char2 : char1;
    const shot = c.shotType || (idx === 1 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide');
    const scName = c.sceneName || `Scene ${idx + 1}`;

    const enrichedFrame = buildCinematicFrameImagePrompt({
      rawPrompt: c.frameImagePrompt,
      clipIndex: idx + 1,
      totalClips: 3,
      characterName: activeSpk,
      counterpartName: counterpartSpk,
      location,
      visualStyle: spec.visualStyle,
      sceneName: scName,
      dialogue,
    });

    const enrichedFlow = buildCinematicFlowPrompt({
      rawFlow: c.flowPromptText,
      clipIndex: idx + 1,
      totalClips: 3,
      activeSpeaker: activeSpk,
      counterpart: counterpartSpk,
      location,
      dialogue,
      sceneName: scName,
      visualStyle: spec.visualStyle,
      shotType: shot,
    });

    return {
      clipIndex: idx + 1,
      totalClips: 3,
      sceneName: scName,
      locationAnchor: c.locationAnchor || location,
      masterKeyframeLock: c.masterKeyframeLock || `Spatial perspective in ${spec.visualStyle}`,
      shotType: shot,
      speakerIsolation: {
        activeSpeaker: activeSpk,
        speakingDialogue: dialogue,
        silentCharacters: c.speakerIsolation?.silentCharacters || [counterpartSpk],
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
      frameImagePrompt: enrichedFrame,
      flowPromptText: enrichedFlow,
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
