import { StorySpec, ClipPrompt } from '@/types';
import { generateLocationAnchorPrompt, enforceSpatialBlocking } from '../rules/spatial';
import { generateSecBySecTimeline, buildCinematicFlowVeoPrompt } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

export function buildCharacterDramaClips(
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
  const char1 = spec.cast[0] || {
    name: 'Julian',
    role: 'Hero',
    dnaPrompt: '30yo sharp-featured man with intense dark eyes, tailored charcoal wool coat, subtle stubble.',
  };
  const char2 = spec.cast[1] || {
    name: 'Elena',
    role: 'Villain',
    dnaPrompt: '28yo poised woman with sharp cheekbones, sleek auburn hair tied back, minimalist beige blazer.',
  };
  const location = spec.locationSettings[0] || 'Penthouse Study at Night';

  const title = `The Confrontation: ${char1.name} vs ${char2.name} - ${dayEmotion}`;
  const hookDescription = `A battle of wills between ${char1.name} and ${char2.name} over a high-stakes secret that changes everything.`;

  const dialogue1 =
    variationType === 'High Tension'
      ? `You sat in that boardroom for six months pretending to protect my family, while you were quietly selling every asset we owned.`
      : variationType === 'Emotional Core'
      ? `I didn't lose this company because of bad investments, Julian. I gave it away because I couldn't bear watching you destroy yourself.`
      : `Look at me and tell me you didn't sign those transfer documents last night before the vault closed.`;

  const dialogue2 =
    variationType === 'High Tension'
      ? `I didn't sell you out, Julian. I saved what was left before your reckless pride burned the entire foundation to the ground.`
      : variationType === 'Emotional Core'
      ? `You think I wanted this? Every single decision I made was to keep you from ending up in a prison cell.`
      : `I did what had to be done. And if you had any courage left in you, you'd thank me instead of pointing fingers.`;

  const dialogue3 =
    variationType === 'High Tension'
      ? `Tomorrow at 9 AM, everyone finds out the truth. Let's see who they believe when the real signatures are shown.`
      : `Then take the keys and walk away. But remember this moment when the doors lock behind you forever.`;

  // CLIP 1: Julian Focus (The Accusation)
  const timeline1 = generateSecBySecTimeline(
    char1.name,
    [char2.name],
    dialogue1,
    `${char1.name} slams a sealed black folder onto the mahogany table, holding fierce eye contact with ${char2.name}.`,
    'Tension sub-bass drone, sharp folder slam reverberating in room, rain on glass.',
    'Shoulders rigid, leaning forward aggressively over the desk, hands flat on wood, eyes narrowed.',
    '1.5-second pregnant silence; jaw clenches, sharp intake of breath before unleashing words.'
  );

  const flowPrompt1 = buildCinematicFlowVeoPrompt({
    clipIndex: 1,
    totalClips: 3,
    sceneName: 'The Accusation (Julian Focus)',
    shotType: 'Shot-Reverse-Shot Medium Close-Up',
    locationAnchor: location,
    activeSpeaker: {
      name: char1.name,
      dnaPrompt: char1.dnaPrompt,
      voiceTone: 'Intense baritone, controlled fury, crisp English articulation',
    },
    silentCharacters: [
      { name: char2.name, dnaPrompt: char2.dnaPrompt },
    ],
    dialogue: dialogue1,
    cameraSetup: '85mm cinematic portrait lens, f/1.8 shallow depth of field, anamorphic lens flares from rain streaks on window.',
    lightingTheme: 'Moody chiaroscuro cinema lighting, deep shadows, warm mahogany reflections, cool blue rim light on jawline.',
    timeline: timeline1,
    negativePromptDirectives: 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
  });

  // CLIP 2: Elena Reverse Shot (The Counter-Strike)
  const timeline2 = generateSecBySecTimeline(
    char2.name,
    [char1.name],
    dialogue2,
    `${char2.name} slowly tilts her chin upward, unfazed and icy, stepping half an inch forward into the light.`,
    'Sudden quiet stillness, practical lamp hum, faint ominous cello swell.',
    'Poised, hands loosely clasped in front of blazer, relaxed yet lethal composure, unblinking glare.',
    '1.5-second calculating pause; subtle dismissive smirk fades into razor-sharp focus.'
  );

  const flowPrompt2 = buildCinematicFlowVeoPrompt({
    clipIndex: 2,
    totalClips: 3,
    sceneName: 'The Counter-Strike (Elena Reaction & Rebuttal)',
    shotType: 'Shot-Reverse-Shot Tight Reverse Medium Shot',
    locationAnchor: location,
    activeSpeaker: {
      name: char2.name,
      dnaPrompt: char2.dnaPrompt,
      voiceTone: 'Poised, cold, resonant feminine cadence, unwavering composure',
    },
    silentCharacters: [
      { name: char1.name, dnaPrompt: char1.dnaPrompt },
    ],
    dialogue: dialogue2,
    cameraSetup: '50mm prime cinema lens, tight reverse framing screen-left, shallow background blur.',
    lightingTheme: 'Cold blue practical fill light, sharp cheekbone rim shadow, subtle specular reflection in eyes.',
    timeline: timeline2,
    negativePromptDirectives: 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion.',
  });

  // CLIP 3: Over-the-Shoulder Tension & Cliffhanger
  const timeline3 = generateSecBySecTimeline(
    char1.name,
    [char2.name],
    dialogue3,
    `${char1.name} steps toward the frosted glass door, hand freezing on the metal handle as he turns back.`,
    'Heavy footsteps, metallic handle touch, rising suspense string swell, sudden abrupt cutoff.',
    'Body turned half-away toward exit, neck craned back, silhouette sharp against hallway backlight.',
    '1-second suspended breath; cold pause before delivering the final ultimatum.'
  );

  const flowPrompt3 = buildCinematicFlowVeoPrompt({
    clipIndex: 3,
    totalClips: 3,
    sceneName: 'The Ultimatum & Cliffhanger',
    shotType: 'Over-the-Shoulder Dramatic Standoff',
    locationAnchor: location,
    activeSpeaker: {
      name: char1.name,
      dnaPrompt: char1.dnaPrompt,
      voiceTone: 'Cold, decisive, finality in tone, resonant low frequency',
    },
    silentCharacters: [
      { name: char2.name, dnaPrompt: char2.dnaPrompt },
    ],
    dialogue: dialogue3,
    cameraSetup: 'Dynamic tracking over-the-shoulder, rack focus from door handle to distant eye line.',
    lightingTheme: 'Intense cinematic backlighting through doorway, high contrast silhouette framing, deep shadows.',
    timeline: timeline3,
    cliffhangerNote: 'Clip abruptly cuts to black at 0:09.5s on a suspended high-stakes revelation.',
    negativePromptDirectives: 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching.',
  });

  const clips: ClipPrompt[] = [
    {
      clipIndex: 1,
      totalClips: 3,
      sceneName: 'The Accusation (Julian Focus)',
      locationAnchor: location,
      masterKeyframeLock: `Master frame of ${location}. ${enforceSpatialBlocking(char1.name, [char2.name])} Rainy window background with soft bokeh.`,
      shotType: 'Shot-Reverse-Shot Close-Up',
      frameImagePrompt: `[VIDEO FRAME IMAGE 1/3 - STARTING KEYFRAME]: ${location}. Medium close-up on ${char1.name}. ${char1.dnaPrompt}. High-contrast moody chiaroscuro lighting, mahogany desk in foreground, rain streaks on window background, 85mm cinematic portrait framing, 4K photorealistic composition.`,
      speakerIsolation: {
        activeSpeaker: char1.name,
        speakingDialogue: dialogue1,
        silentCharacters: [char2.name],
        cameraCutApplied: true,
      },
      timeline: timeline1,
      flowPromptText: flowPrompt1,
      retentionHookReasoning: '0-2s physical prop slam & direct betrayal line captures immediate retention.',
      pacingWordCount: calculateWordCount(dialogue1),
    },
    {
      clipIndex: 2,
      totalClips: 3,
      sceneName: 'The Counter-Strike (Elena Reaction & Rebuttal)',
      locationAnchor: location,
      masterKeyframeLock: `Exact reverse shot in ${location}. ${char2.name} framed screen-left in sharp focus; ${char1.name} soft focus screen-right.`,
      shotType: 'Shot-Reverse-Shot Close-Up',
      frameImagePrompt: `[VIDEO FRAME IMAGE 2/3 - STARTING KEYFRAME]: ${location}. Tight reverse medium shot on ${char2.name} screen-left. ${char2.dnaPrompt}. Cold blue practical rim light, sharp cheekbone shadow, intense unwavering eye contact with camera right, 4K master shot.`,
      speakerIsolation: {
        activeSpeaker: char2.name,
        speakingDialogue: dialogue2,
        silentCharacters: [char1.name],
        cameraCutApplied: true,
      },
      timeline: timeline2,
      flowPromptText: flowPrompt2,
      retentionHookReasoning: 'Status reversal creates narrative tension.',
      pacingWordCount: calculateWordCount(dialogue2),
    },
    {
      clipIndex: 3,
      totalClips: 3,
      sceneName: 'The Ultimatum & Cliffhanger',
      locationAnchor: location,
      masterKeyframeLock: `Dramatic tension 2-shot with depth separation in ${location}.`,
      shotType: 'Over-the-Shoulder',
      frameImagePrompt: `[VIDEO FRAME IMAGE 3/3 - STARTING KEYFRAME]: ${location}. Over-the-shoulder dramatic composition. ${char1.name} hand on modern study door handle, turning back toward ${char2.name} seated in shadows. Intense cinematic backlighting, high depth-of-field tension, 4K film keyframe.`,
      speakerIsolation: {
        activeSpeaker: char1.name,
        speakingDialogue: dialogue3,
        silentCharacters: [char2.name],
        cameraCutApplied: true,
      },
      timeline: timeline3,
      flowPromptText: flowPrompt3,
      retentionHookReasoning: 'Timed cutoff forces audience to check profile for Episode 2.',
      pacingWordCount: calculateWordCount(dialogue3),
    },
  ];

  return {
    title,
    hookDescription,
    clips,
    characterAnchors: [
      {
        characterName: char1.name,
        anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${char1.name}. ${char1.dnaPrompt} Style: ${spec.visualStyle}. Consistent facial structure, coat texture, lighting tone.`,
      },
      {
        characterName: char2.name,
        anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${char2.name}. ${char2.dnaPrompt} Style: ${spec.visualStyle}. Consistent jawline, hair, and wardrobe color palette.`,
      },
    ],
    locationAnchors: [
      {
        locationName: location,
        anchorPrompt: generateLocationAnchorPrompt(location, spec.visualStyle, spec.tone),
      },
    ],
    dialogueScript: [
      { speaker: char1.name, line: dialogue1, timing: '0:02 - 0:07' },
      { speaker: char2.name, line: dialogue2, timing: '0:02 - 0:07' },
      { speaker: char1.name, line: dialogue3, timing: '0:02 - 0:07' },
    ],
  };
}
