import { StorySpec, ClipPrompt } from '@/types';
import { getWeeklyEmotionArc, calculateWordCount } from './rules/retention';
import { createTokenReport } from './tokens';
import {
  callUniversalLLM,
  AIProviderConfig,
  cleanJsonText,
  repairTruncatedJson,
} from './llm-provider';
import { resolveAutonomousCast, resolveSeriesTitle, EPISODE_TITLES } from './generator';
import {
  resolveEpisodeContinuity,
  buildContinuityFramePrompt,
  EpisodeSceneContinuity,
} from './rules/continuity';

function extractClipsArray(data: any): any[] {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.clips)) return data.clips;
  if (Array.isArray(data.videoClips)) return data.videoClips;
  if (Array.isArray(data.video_clips)) return data.video_clips;
  if (Array.isArray(data.scenes)) return data.scenes;
  if (Array.isArray(data.shots)) return data.shots;
  if (Array.isArray(data.directing)) return data.directing;

  // Check nested objects
  const nestedKeys = [
    'productionPackage',
    'production_package',
    'production',
    'data',
    'episode',
    'result',
    'batch',
    'story',
    'content',
    'package',
    'response',
  ];
  for (const k of nestedKeys) {
    if (data[k] && typeof data[k] === 'object') {
      const nested = extractClipsArray(data[k]);
      if (nested.length > 0) return nested;
    }
  }

  // Check clip1, clip2, clip3 keys
  const keys = Object.keys(data);
  const clipLikeKeys = keys.filter(
    (k) => /^clip[_\s-]?\d+/i.test(k) || /^scene[_\s-]?\d+/i.test(k)
  );
  if (clipLikeKeys.length >= 1) {
    clipLikeKeys.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
    return clipLikeKeys.map((k) => data[k]);
  }

  // Scan any array property whose elements look like clips
  for (const val of Object.values(data)) {
    if (Array.isArray(val) && val.length > 0) {
      if (
        val[0]?.frameImagePrompt ||
        val[0]?.flowPromptText ||
        val[0]?.sceneName ||
        val[0]?.speakerIsolation ||
        val[0]?.timeline ||
        val[0]?.shotType ||
        val[0]?.clipIndex
      ) {
        return val;
      }
    }
  }

  return [];
}

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
  continuity,
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
  continuity?: EpisodeSceneContinuity;
}): string {
  // Sanitize any leaked legacy character names if active character is different
  let cleanSnippet = (rawPrompt || '')
    .replace(/\[VIDEO FRAME IMAGE.*?\]:?/gi, '')
    .replace(/\[KEYFRAME.*?\]:?/gi, '')
    .trim();

  if (characterName !== 'Julian Vance' && counterpartName !== 'Julian Vance') {
    cleanSnippet = cleanSnippet.replace(/\bJulian Vance\b/gi, characterName);
  }
  if (characterName !== 'Elena Sterling' && counterpartName !== 'Elena Sterling') {
    cleanSnippet = cleanSnippet.replace(/\bElena Sterling\b/gi, counterpartName);
  }

  // If continuity lock is provided, use the continuity engine to build matched keyframe prompts
  if (continuity) {
    const actionText =
      cleanSnippet ||
      `${characterName} delivering narrative beat: "${dialogue || 'high-stakes dialogue moment'}". Maintaining locked spatial blocking with ${counterpartName}.`;

    return buildContinuityFramePrompt({
      clipIndex,
      totalClips,
      activeSpeaker: characterName,
      counterpart: counterpartName,
      location,
      sceneName,
      actionText,
      continuity,
    });
  }

  // Fallback if continuity object wasn't supplied
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
  let cleanFlow = rawFlow || '';
  if (activeSpeaker !== 'Julian Vance' && counterpart !== 'Julian Vance') {
    cleanFlow = cleanFlow.replace(/\bJulian Vance\b/gi, activeSpeaker);
  }
  if (activeSpeaker !== 'Elena Sterling' && counterpart !== 'Elena Sterling') {
    cleanFlow = cleanFlow.replace(/\bElena Sterling\b/gi, counterpart);
  }

  // If already substantial (> 250 characters with timeline cues), keep it
  if (
    cleanFlow &&
    cleanFlow.length > 250 &&
    (cleanFlow.includes('SECOND-BY-SECOND') || cleanFlow.includes('0:00 - 0:02') || cleanFlow.includes('[TIMELINE]'))
  ) {
    return cleanFlow;
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
  sceneContinuityLock?: any;
}> {
  // CRITICAL FIX: Only resolve autonomous cast if spec.cast is completely absent or empty!
  if (!spec.cast || spec.cast.length === 0) {
    spec.cast = resolveAutonomousCast(spec);
    spec.castCount = spec.cast.length;
  }
  spec.seriesTitle = resolveSeriesTitle(spec);

  const arc = getWeeklyEmotionArc(dayNum);
  const episodeName = EPISODE_TITLES[dayNum] || `Episode ${dayNum}`;
  const baseTitle = (!forceFresh && existingVariation?.title) || `${episodeName} - ${variationType}`;
  const baseHook = (!forceFresh && existingVariation?.hookDescription) || `${spec.format} story for ${arc.dailyEmotion}`;
  const baseScript = (!forceFresh && existingVariation?.dialogueScript) || [];

  // Intelligently identify Hero and Villain/Rival or fallback to first two
  const heroMember = spec.cast.find((c) => c.role === 'Hero') || spec.cast[0];
  const villainMember = spec.cast.find((c) => c.role === 'Villain') || spec.cast[1] || spec.cast[0];
  const char1 = heroMember?.name || 'Hero';
  const char2 = villainMember?.name || 'Villain';
  const location = spec.locationSettings[0] || 'Executive Penthouse Study';

  // 1. RESOLVE EPISODE CONTINUITY & WARDROBE LOCK
  const continuity = resolveEpisodeContinuity(spec, dayNum, baseTitle, spec.format);

  // Format the full cast overview so the LLM knows all established characters (Hero, Villain, Side characters)
  const fullCastOverview = spec.cast
    .map(
      (c, i) =>
        `  * Character #${i + 1} (${c.role || 'Cast'}): "${c.name}" — ${c.description || ''} (Personality / Cadence: ${c.personalityVibe || 'Authentic'})`
    )
    .join('\n');

  const castNamesList = spec.cast.map((c) => `"${c.name}"`).join(', ');

  const wardrobeLockText = continuity.wardrobeLocks
    .map((w) => `  * ${w.characterName} (${w.role}): "${w.exactOutfit}"`)
    .join('\n');

  const systemInstruction = `You are FlowCreator OS — an Elite Autonomous Directing Engine producing a 3-clip short-form cinematic video episode for Google Flow (Veo 2).
You MUST strictly adhere to the Directing Directives:

CRITICAL CHARACTER & WARDROBE CONTINUITY (ZERO DRIFT ACROSS CLIPS):
The series cast and locked scene styling for this entire 30-second episode are:
${fullCastOverview}

LOCKED SCENE WARDROBE (MUST NOT CHANGE ACROSS CLIP 1, 2, AND 3):
${wardrobeLockText}

LOCKED SCENE LIGHTING & ENVIRONMENT:
- Lighting: ${continuity.lightingSetup} (${continuity.timeOfDay})
- Room Geography: ${continuity.roomGeography}

You MUST use ONLY these exact characters (${castNamesList}) in all dialogue, character anchors, and clip choreographies.
DO NOT replace, alter, or revert to any default names (such as "Julian Vance" or "Elena Sterling") unless they were explicitly listed above.
DO NOT change the clothing between Clip 1, 2, and 3. Clip 2 is the exact reverse-angle of Clip 1.

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

4. REFERENCE IMAGE ANCHOR (Flux / Midjourney frameImagePrompt) — CONTINUITY CHAINING:
- Clip 1: Master Establishing Keyframe.
- Clip 2: 180-Degree Reverse Angle shot linking to Keyframe 1 with matching clothing & lighting.
- Clip 3: Culmination Standoff maintaining continuous scene state.

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
- Established Cast (${spec.cast.length} Characters — Use these characters!):
${fullCastOverview}
- Locked Scene Wardrobes:
${wardrobeLockText}
- Location & Environment: ${location} (${continuity.lightingSetup})

Generate the complete 3-clip production package now. Ensure all "frameImagePrompt" fields maintain 100% visual and wardrobe continuity matching the locked scene specifications above.`;

  let llmRes: any = null;
  try {
    llmRes = await callUniversalLLM({
      config: aiConfig,
      prompt: promptText,
      systemInstruction,
      temperature: forceFresh ? 0.85 : 0.7,
      responseJson: true,
    });
  } catch (apiErr: any) {
    console.warn('[Produce] callUniversalLLM failed or timed out:', apiErr?.message);
  }

  let parsed = llmRes?.parsed;
  if (!parsed && llmRes?.text) {
    try {
      parsed = JSON.parse(cleanJsonText(llmRes.text));
    } catch {
      try {
        parsed = repairTruncatedJson(llmRes.text);
      } catch {}
    }
  }

  let rawClips = extractClipsArray(parsed);

  if (!rawClips || rawClips.length === 0) {
    console.warn('[Produce] LLM did not return structured clips. Synthesizing 3 high-tension cinematic clips autonomously.');
    const defaultDialogue1 =
      baseScript[0]?.line ||
      "We don't have time to second-guess this. The truth is already moving against us.";
    const defaultDialogue2 =
      baseScript[1]?.line ||
      "You think you have control, but you haven't seen what's behind this door.";
    const defaultDialogue3 =
      baseScript[2]?.line ||
      "Then look me in the eye and tell me you didn't authorize this.";

    rawClips = [
      {
        clipIndex: 1,
        totalClips: 3,
        sceneName: `${baseTitle} - Inciting Confrontation`,
        locationAnchor: location,
        masterKeyframeLock: `Establishing spatial anchor in ${spec.visualStyle}`,
        shotType: 'Master Wide to Slow Push-In',
        speakerIsolation: {
          activeSpeaker: char1,
          speakingDialogue: defaultDialogue1,
          silentCharacters: [char2],
          cameraCutApplied: true,
        },
        timeline: [
          {
            timeRange: '0:00 - 0:02',
            visualAction: `${char1} maintains rigid posture in dramatic chiaroscuro key lighting.`,
            cameraMovement: 'Slow steady push-in.',
            sfxCue: 'Low sub-bass drone and room acoustics.',
          },
          {
            timeRange: '0:02 - 0:07',
            visualAction: `${char1} delivers dialogue line with controlled vocal intensity.`,
            cameraMovement: 'Locked medium close-up.',
            sfxCue: 'Clear dialogue resonance and vocal warmth.',
          },
          {
            timeRange: '0:07 - 0:10',
            visualAction: `Smooth rack-focus transition across the space toward ${char2}.`,
            cameraMovement: 'Rack-focus drift.',
            sfxCue: 'Sudden audio drop into expectant silence.',
          },
        ],
        retentionHookReasoning: '0-3s high-contrast confrontation establishes immediate feed curiosity.',
      },
      {
        clipIndex: 2,
        totalClips: 3,
        sceneName: `${baseTitle} - 180° Reverse Reversal`,
        locationAnchor: location,
        masterKeyframeLock: `Reverse spatial angle matching Keyframe 1 in ${spec.visualStyle}`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        speakerIsolation: {
          activeSpeaker: char2,
          speakingDialogue: defaultDialogue2,
          silentCharacters: [char1],
          cameraCutApplied: true,
        },
        timeline: [
          {
            timeRange: '0:00 - 0:02',
            visualAction: `Reverse angle on ${char2}. Unblinking locked eye contact across the room.`,
            cameraMovement: 'Dynamic slow drift.',
            sfxCue: 'Sharp acoustic sting and atmospheric drone.',
          },
          {
            timeRange: '0:02 - 0:07',
            visualAction: `${char2} delivers icy counter-dialogue with deliberate modulation.`,
            cameraMovement: 'Locked portrait framing.',
            sfxCue: 'Crisp dialogue presence.',
          },
          {
            timeRange: '0:07 - 0:10',
            visualAction: `${char2} leans forward slightly; ${char1} remains rigid in soft foreground blur.`,
            cameraMovement: 'Static hold.',
            sfxCue: 'Accelerating heartbeat acoustic pulse.',
          },
        ],
        retentionHookReasoning: 'Reverse shot flips power dynamic and escalates psychological stakes.',
      },
      {
        clipIndex: 3,
        totalClips: 3,
        sceneName: `${baseTitle} - Climax Standoff Hold`,
        locationAnchor: location,
        masterKeyframeLock: `Culmination standoff composition in ${spec.visualStyle}`,
        shotType: 'Tension Profile Two-Shot',
        speakerIsolation: {
          activeSpeaker: char1,
          speakingDialogue: defaultDialogue3,
          silentCharacters: [char2],
          cameraCutApplied: true,
        },
        timeline: [
          {
            timeRange: '0:00 - 0:02',
            visualAction: `Close-up two-shot profile. Tension reaches its absolute peak.`,
            cameraMovement: 'Slow creeping push.',
            sfxCue: 'Deep Inception brass swell.',
          },
          {
            timeRange: '0:02 - 0:07',
            visualAction: `${char1} issues the decisive final ultimatum.`,
            cameraMovement: 'Locked intense focus.',
            sfxCue: 'Echoing dialogue reverb.',
          },
          {
            timeRange: '0:07 - 0:10',
            visualAction: `Neither character blinks. Dramatic pause holds as light cuts sharply.`,
            cameraMovement: 'Static cliffhanger hold.',
            sfxCue: 'Sharp breath intake and abrupt silence on cut.',
          },
        ],
        retentionHookReasoning: 'Unresolved cliffhanger guarantees algorithmic completion rate and replay.',
      },
    ];
  }

  const clips: ClipPrompt[] = rawClips.slice(0, 3).map((c: any, idx: number) => {
    const dialogue = c.speakerIsolation?.speakingDialogue || c.dialogue || '';

    // Match active speaker from LLM against established spec.cast
    let rawActive = (c.speakerIsolation?.activeSpeaker || c.speaker || '').trim();
    let matchedActive = spec.cast.find((m) => rawActive && m.name.toLowerCase() === rawActive.toLowerCase());
    if (!matchedActive && rawActive) {
      matchedActive = spec.cast.find(
        (m) =>
          m.name.toLowerCase().includes(rawActive.toLowerCase()) ||
          rawActive.toLowerCase().includes(m.name.toLowerCase())
      );
    }
    const activeSpk = matchedActive ? matchedActive.name : (idx === 1 ? char2 : char1);

    // Counterpart resolution from silent characters or alternating lead
    const silentList = (c.speakerIsolation?.silentCharacters || []).filter(
      (s: string) => s && s.toLowerCase().trim() !== activeSpk.toLowerCase().trim()
    );
    let rawCounterpart = silentList[0] || (activeSpk === char1 ? char2 : char1);
    let matchedCounterpart = spec.cast.find(
      (m) => rawCounterpart && m.name.toLowerCase() === rawCounterpart.toLowerCase()
    );
    if (!matchedCounterpart && rawCounterpart) {
      matchedCounterpart = spec.cast.find(
        (m) =>
          m.name.toLowerCase().includes(rawCounterpart.toLowerCase()) ||
          rawCounterpart.toLowerCase().includes(m.name.toLowerCase())
      );
    }
    const counterpartSpk = matchedCounterpart ? matchedCounterpart.name : (activeSpk === char1 ? char2 : char1);

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
      continuity,
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

    const activeWardrobe =
      continuity.wardrobeLocks.find(
        (w) => w.characterName.toLowerCase() === activeSpk.toLowerCase()
      )?.exactOutfit || continuity.wardrobeLocks[0]?.exactOutfit || 'Tailored bespoke styling';

    const continuityRole: 'master_anchor' | 'reverse_angle_match' | 'culmination_match' =
      idx === 0
        ? 'master_anchor'
        : idx === 1
        ? 'reverse_angle_match'
        : 'culmination_match';

    const continuityReferenceTag =
      idx === 0
        ? '🎯 MASTER ANCHOR KEYFRAME (Generate First: Sets scene & wardrobe DNA)'
        : `🔄 CONTINUITY REVERSE SHOT (Attach Keyframe 1 as Style Ref: ${continuity.midjourneyContinuityRecipe})`;

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
        silentCharacters: c.speakerIsolation?.silentCharacters?.length > 0
          ? c.speakerIsolation.silentCharacters
          : [counterpartSpk],
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
      sceneWardrobe: activeWardrobe,
      requiresReferenceImageAttachment: true,
      foleySoundDesign: c.foleySoundDesign || 'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
      negativePromptDirectives: c.negativePromptDirectives || 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
      continuityRole,
      continuityReferenceTag,
    };
  });

  const tokenUsage = createTokenReport(
    llmRes?.usage?.promptTokens || 350,
    llmRes?.usage?.completionTokens || 450,
    llmRes?.model || 'autonomous-director-v2',
    llmRes?.provider || 'flowcreator-engine'
  );

  // Character anchors: Always include ALL members of spec.cast
  const characterAnchors =
    parsed?.characterAnchors && parsed.characterAnchors.length >= spec.cast.length
      ? parsed.characterAnchors
      : spec.cast.map((c) => ({
          characterName: c.name,
          anchorPrompt:
            c.dnaPrompt ||
            `[MASTER CHARACTER ANCHOR]: ${c.name} DNA Lock. Role: ${c.role || 'Cast'}. ${c.description || ''}. ${spec.visualStyle}`,
        }));

  return {
    title: parsed?.title || baseTitle,
    hookDescription: parsed?.hookDescription || baseHook,
    dialogueScript: parsed?.dialogueScript || (baseScript.length > 0 ? baseScript : [
      { speaker: char1, line: rawClips[0]?.speakerIsolation?.speakingDialogue || "The silence ends now.", timing: "0:02 - 0:07" },
      { speaker: char2, line: rawClips[1]?.speakerIsolation?.speakingDialogue || "You have no idea what you're stepping into.", timing: "0:02 - 0:07" },
    ]),
    masterFrameImagePrompt: parsed?.masterFrameImagePrompt || clips[0]?.frameImagePrompt,
    characterAnchors,
    locationAnchors: parsed?.locationAnchors || [
      { locationName: location, anchorPrompt: `[LOCATION MASTER FRAME ANCHOR]: ${location}. ${spec.visualStyle}` },
    ],
    clips,
    tokenUsage,
    sceneContinuityLock: {
      masterKeyframeIndex: 1,
      timeOfDay: continuity.timeOfDay,
      lightingSetup: continuity.lightingSetup,
      roomGeography: continuity.roomGeography,
      wardrobeLocks: continuity.wardrobeLocks,
      midjourneyContinuityRecipe: continuity.midjourneyContinuityRecipe,
    },
  };
}
