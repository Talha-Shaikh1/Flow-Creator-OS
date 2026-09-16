import { StorySpec, ClipPrompt } from '@/types';
import { generateLocationAnchorPrompt } from '../rules/spatial';
import { generateSecBySecTimeline, buildCinematicFlowVeoPrompt } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

export function buildObjectTalkingClips(
  spec: StorySpec,
  dayEmotion: string,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook'
): {
  title: string;
  hookDescription: string;
  clips: ClipPrompt[];
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  dialogueScript: { speaker: string; line: string; timing: string }[];
} {
  const objectChar = spec.cast[0] || {
    name: 'Coffee Cup',
    role: 'Hero',
    dnaPrompt: 'A weathered ceramic espresso cup with subtle expressive animated facial features, glossy glaze texture.',
  };
  const location = spec.locationSettings[0] || 'Modern Kitchen Counter';

  const title = `${objectChar.name}'s Secret: ${dayEmotion} (${variationType})`;
  const hookDescription = `An anthropomorphic ${objectChar.name} directly engages the audience with a relatable existential dilemma.`;

  const dialogue1 =
    variationType === 'High Tension'
      ? "You think your day is exhausting? Try sitting right here on the edge of this table for twelve hours straight."
      : variationType === 'Emotional Core'
      ? "I was made to keep you warm, but every time you take a sip, you forget I'm still here listening."
      : "Stop scrolling right now. You are about to make the exact same mistake you made yesterday.";

  const dialogue2 =
    "They always reach for me when the morning is broken, but by noon, I'm just cold porcelain left behind.";

  const dialogue3 =
    "Next time you pick me up, ask yourself—are you really ready for tomorrow? Because I won't save you twice.";

  // CLIP 1
  const timeline1 = generateSecBySecTimeline(
    objectChar.name,
    [],
    dialogue1,
    `${objectChar.name} subtly wobbles on counter edge, steam swirling as expressive eyes blink into sharp focus.`,
    'Whistling gentle kettle sound, sharp ceramic clink on marble, sudden silence as object awakens.',
    'Resting solidly on marble counter, slight forward tilt, steam rising steadily from rim.',
    '1.5-second curious stillness; steam pauses mid-air, subtle porcelain micro-expression awakens.'
  );

  const flowPrompt1 = buildCinematicFlowVeoPrompt({
    clipIndex: 1,
    totalClips: 3,
    sceneName: 'The Awakening Hook',
    shotType: 'Macro Eye-Level Cinematic Close-Up',
    locationAnchor: location,
    activeSpeaker: {
      name: objectChar.name,
      dnaPrompt: objectChar.dnaPrompt,
      voiceTone: 'Expressive witty conversational tone, warm baritone resonance',
    },
    silentCharacters: [],
    dialogue: dialogue1,
    cameraSetup: '100mm macro prime lens, f/2.0 shallow depth of field, gentle forward push-in toward eye level.',
    lightingTheme: 'Warm morning sunrise rim light catching porcelain rim gloss, soft bokeh kitchen background.',
    timeline: timeline1,
    negativePromptDirectives: 'blurry facial features, glitching porcelain texture, double mouth, erratic steam jitter, low quality.',
  });

  // CLIP 2
  const timeline2 = generateSecBySecTimeline(
    objectChar.name,
    [],
    dialogue2,
    `Camera slowly circles around ${objectChar.name} as steam dissipates, revealing cool blue afternoon shadows.`,
    'Subtle acoustic kitchen hum, lonely clock ticking, resonant vocal echo.',
    'Slight backward slump, ceramic glaze dulled in shadow, steam thin and wispy.',
    '1-second reflective hesitation before delivering the vulnerable emotional line.'
  );

  const flowPrompt2 = buildCinematicFlowVeoPrompt({
    clipIndex: 2,
    totalClips: 3,
    sceneName: 'The Escalation & Vulnerability',
    shotType: 'Tight 3/4 Macro Profile Shot',
    locationAnchor: location,
    activeSpeaker: {
      name: objectChar.name,
      dnaPrompt: objectChar.dnaPrompt,
      voiceTone: 'Melancholic, intimate, expressive vocal rasp',
    },
    silentCharacters: [],
    dialogue: dialogue2,
    cameraSetup: '85mm macro lens, slow 15-degree orbital arc, shallow depth blurring out surrounding counter items.',
    lightingTheme: 'Cool blue-hour side light, dramatic specular reflection along handle edge.',
    timeline: timeline2,
    negativePromptDirectives: 'blurry facial features, morphing ceramic handle, erratic movement, bad lip sync.',
  });

  // CLIP 3
  const timeline3 = generateSecBySecTimeline(
    objectChar.name,
    [],
    dialogue3,
    `${objectChar.name} leans directly toward the front lens element with intense theatrical swagger.`,
    'Rising suspense tone, sudden sharp ceramic scrape on stone, dramatic audio drop.',
    'Aggressive forward tilt toward camera lens, steam suddenly billows fiercely from rim.',
    '1.5-second unblinking stare into audience lens before snapping into final warning.'
  );

  const flowPrompt3 = buildCinematicFlowVeoPrompt({
    clipIndex: 3,
    totalClips: 3,
    sceneName: 'The Cliffhanger Callout',
    shotType: 'Extreme Macro Low-Angle Push-In',
    locationAnchor: location,
    activeSpeaker: {
      name: objectChar.name,
      dnaPrompt: objectChar.dnaPrompt,
      voiceTone: 'Authoritative, sharp warning tone, punchy comedic finality',
    },
    silentCharacters: [],
    dialogue: dialogue3,
    cameraSetup: 'Ultra-wide macro push-in from counter level, dramatic distortion, extreme focal clarity on rim.',
    lightingTheme: 'High-contrast theatrical rim lighting, intense specular gloss highlight on eyes.',
    timeline: timeline3,
    cliffhangerNote: 'Clip cuts to black instantly on the final word, freezing on an extreme close-up eye lock.',
    negativePromptDirectives: 'morphing, blurred features, distorted face, low quality render.',
  });

  const clips: ClipPrompt[] = [
    {
      clipIndex: 1,
      totalClips: 3,
      sceneName: 'The Awakening Hook',
      locationAnchor: location,
      masterKeyframeLock: `Fixed macro perspective of ${location}, 50mm f/1.8 lens, shallow depth of field, warm sunrise rim light.`,
      shotType: 'Master Wide',
      frameImagePrompt: `[VIDEO FRAME IMAGE 1/3 - STARTING KEYFRAME]: Fixed macro perspective of ${location}. ${objectChar.name} - ${objectChar.dnaPrompt}. 50mm f/1.8 lens, shallow depth of field, warm sunrise rim light, photorealistic ceramic gloss reflection, 4K composition.`,
      speakerIsolation: {
        activeSpeaker: objectChar.name,
        speakingDialogue: dialogue1,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline1,
      flowPromptText: flowPrompt1,
      retentionHookReasoning: '0-3s unexpected object movement & sharp direct address creates curiosity gap.',
      pacingWordCount: calculateWordCount(dialogue1),
    },
    {
      clipIndex: 2,
      totalClips: 3,
      sceneName: 'The Escalation',
      locationAnchor: location,
      masterKeyframeLock: `Same fixed perspective in ${location}, lighting deepens into moody contrast.`,
      shotType: 'Shot-Reverse-Shot Close-Up',
      frameImagePrompt: `[VIDEO FRAME IMAGE 2/3 - STARTING KEYFRAME]: Tight macro profile switching to 3/4 angle on ${objectChar.name} in ${location}. Dramatic blue-hour fill lighting, steam dissipating, high specular contrast, 4K cinematic still.`,
      speakerIsolation: {
        activeSpeaker: objectChar.name,
        speakingDialogue: dialogue2,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline2,
      flowPromptText: flowPrompt2,
      retentionHookReasoning: 'Vulnerability escalation keeps viewer emotionally invested.',
      pacingWordCount: calculateWordCount(dialogue2),
    },
    {
      clipIndex: 3,
      totalClips: 3,
      sceneName: 'The Cliffhanger Callout',
      locationAnchor: location,
      masterKeyframeLock: `Macro lock on ${location}, sharp dramatic rim light, moody shadow falloff.`,
      shotType: 'Dynamic Tracking',
      frameImagePrompt: `[VIDEO FRAME IMAGE 3/3 - STARTING KEYFRAME]: Extreme macro dynamic angle of ${objectChar.name} leaning towards camera in ${location}. Moody rim light, high focal clarity on rim edge, dramatic suspense composition, 4K render.`,
      speakerIsolation: {
        activeSpeaker: objectChar.name,
        speakingDialogue: dialogue3,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline3,
      flowPromptText: flowPrompt3,
      retentionHookReasoning: 'Open-ended psychological question drives repeat watch time.',
      pacingWordCount: calculateWordCount(dialogue3),
    },
  ];

  return {
    title,
    hookDescription,
    clips,
    characterAnchors: [
      {
        characterName: objectChar.name,
        anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${objectChar.name}. ${objectChar.dnaPrompt} Visual Style: ${spec.visualStyle}. Consistent material textures and rendering.`,
      },
    ],
    locationAnchors: [
      {
        locationName: location,
        anchorPrompt: generateLocationAnchorPrompt(location, spec.visualStyle, spec.tone),
      },
    ],
    dialogueScript: [
      { speaker: objectChar.name, line: dialogue1, timing: '0:02 - 0:07' },
      { speaker: objectChar.name, line: dialogue2, timing: '0:02 - 0:07' },
      { speaker: objectChar.name, line: dialogue3, timing: '0:02 - 0:07' },
    ],
  };
}
