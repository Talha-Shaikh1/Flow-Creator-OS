import { StorySpec, ClipPrompt, SceneContinuityLock } from '@/types';
import { generateLocationAnchorPrompt } from '../rules/spatial';
import { buildCinematicFlowVeoPrompt } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

export function buildFacelessAmbientClips(
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
  sceneContinuityLock?: SceneContinuityLock;
} {
  const location = spec.locationSettings[0] || 'Midnight Rain-Drenched Neon Alley';

  const title = `Atmospheric Reflections: ${dayEmotion} (${variationType})`;
  const hookDescription = `A hypnotic, faceless ambient narrative focused on deep atmospheric visual storytelling with voiceover poetry.`;

  const voLine1 =
    variationType === 'High Tension'
      ? "Silence isn't empty. It's full of all the answers you've been running away from."
      : "The city forgets everything by midnight, but the quiet moments remember who you used to be.";

  const voLine2 =
    "We spend our whole lives trying to build something permanent, forgetting that peace is found in letting go.";

  const voLine3 =
    "Take a breath. What is meant for you will never pass you by. Save this when you need reminding.";

  // CLIP 1
  const timeline1 = [
    {
      timeRange: '0:00 - 0:02',
      visualAction: 'Ultra slow-motion camera pan over rain-slicked pavement reflecting amber and cyan neon.',
      cameraMovement: 'Smooth gliding steady-cam forward movement at ankle level, shallow focus.',
      characterPose: 'Faceless cinematic environment; solitary rain drops creating concentric ripples in puddle.',
      pauseBeat: '1.5-second meditative pause; ambient rain sound swells before voiceover begins.',
      activeSpeaker: 'Voiceover Narrator',
      lightingMood: 'Moody neon cyan and amber specular reflections on wet asphalt.',
      sfxCue: 'Crisp ASMR rain drops on asphalt, distant rolling thunder, warm lo-fi tape hiss.',
    },
    {
      timeRange: '0:02 - 0:07',
      visualAction: 'Subtle atmospheric wind sweeps mist through neon light beams as voiceover speaks.',
      cameraMovement: 'Gentle upward tilt into glowing retro neon signage reflections.',
      characterPose: 'Stillness of the nocturnal environment, solitary leaf floating across water ripple.',
      pauseBeat: 'Measured poetic pacing, gentle vocal breath pauses between words.',
      spokenDialogue: voLine1,
      lipSyncDirective: 'Faceless voiceover narration — clean broadcast acoustic audio track with stereo depth.',
      activeSpeaker: 'Voiceover Narrator',
      lightingMood: 'High contrast wet specular highlights, anamorphic blue lens flare.',
      sfxCue: 'Resonant soothing voiceover narration in English, deep vocal warmth, gentle ambient drone.',
    },
    {
      timeRange: '0:07 - 0:09',
      visualAction: 'Steam gently billows from a street drain grate under the glow of a warm streetlamp.',
      cameraMovement: 'Slow decelerating drift, holding on the tranquil mystery of the alleyway.',
      characterPose: 'Atmospheric mist dissipating into darkness.',
      pauseBeat: '2-second silent reflection beat as voiceover resonance lingers.',
      activeSpeaker: undefined,
      lightingMood: 'Deep midnight blue tones with warm sodium-vapor backlight.',
      sfxCue: 'Soft rain ambience, gentle piano chord decay.',
    },
    {
      timeRange: '0:09 - 0:10',
      visualAction: 'Sudden light flicker on water surface before smooth cut to next scene.',
      cameraMovement: 'Subtle forward dolly push.',
      pauseBeat: 'Brief suspended pause before scene transition.',
      lightingMood: 'Dimming neon glow.',
      sfxCue: 'Faint wind chime accent, soft audio swell.',
    },
  ];

  const flowPrompt1 = buildCinematicFlowVeoPrompt({
    clipIndex: 1,
    totalClips: 3,
    sceneName: 'Ambient Opening / Hypnotic Anchor',
    shotType: 'Aesthetic Macro Steady-Cam Tracking Shot',
    locationAnchor: location,
    activeSpeaker: {
      name: 'Voiceover Narrator',
      dnaPrompt: 'Faceless cinematic ambient visual narrative, no human faces on camera.',
      voiceTone: 'Calm, soothing, deep ASMR resonant voiceover cadence',
    },
    silentCharacters: [],
    dialogue: voLine1,
    cameraSetup: '35mm anamorphic prime lens, ultra slow-motion 60fps aesthetic drift, shallow depth of field.',
    lightingTheme: 'Cyber-amber and neon cyan reflections on rain-soaked pavement, volumetric mist rays.',
    timeline: timeline1,
    negativePromptDirectives: 'human faces, blurry textures, jerky camera movement, cartoonish colors, low quality.',
  });

  // CLIP 2
  const timeline2 = [
    {
      timeRange: '0:00 - 0:02',
      visualAction: 'Camera tracks along a glowing storefront window misted with rain condensation.',
      cameraMovement: 'Cinematic horizontal slider tracking move left-to-right.',
      characterPose: 'Faceless aesthetic silhouette passing in distant soft focus under umbrella.',
      pauseBeat: '1.5-second contemplative pause before spoken line resumes.',
      activeSpeaker: 'Voiceover Narrator',
      sfxCue: 'Soft glass condensation drops sliding down window, quiet city murmur.',
    },
    {
      timeRange: '0:02 - 0:07',
      visualAction: 'Warm golden interior light glows through the glass, illuminating water droplet patterns.',
      cameraMovement: 'Slow rack focus from window glass droplets to blurred street silhouette in background.',
      characterPose: 'Solitary tranquil city atmosphere.',
      pauseBeat: 'Measured emotional delivery with gentle breaths.',
      spokenDialogue: voLine2,
      lipSyncDirective: 'Faceless voiceover narrative with intimate proximity effect.',
      activeSpeaker: 'Voiceover Narrator',
      sfxCue: 'Warm intimate narration audio, delicate melancholic ambient acoustic drone.',
    },
    {
      timeRange: '0:07 - 0:09',
      visualAction: 'The silhouette fades into gentle distance as amber neon reflections sparkle.',
      cameraMovement: 'Smooth decelerating camera drift.',
      pauseBeat: '2-second lingering silence.',
      activeSpeaker: undefined,
      sfxCue: 'Gentle distant rain rumble, fading vocal echo.',
    },
    {
      timeRange: '0:09 - 0:10',
      visualAction: 'Single golden water drop falls in slow motion through warm light beam.',
      cameraMovement: 'Macro focus lock.',
      sfxCue: 'Gentle water droplet ping, audio bridge into climax.',
    },
  ];

  const flowPrompt2 = buildCinematicFlowVeoPrompt({
    clipIndex: 2,
    totalClips: 3,
    sceneName: 'Atmospheric Continuity Shift',
    shotType: 'Point of View Cinematic Slider Shot',
    locationAnchor: location,
    activeSpeaker: {
      name: 'Voiceover Narrator',
      dnaPrompt: 'Faceless aesthetic point of view, warm shopfront window with condensation.',
      voiceTone: 'Intimate, warm, reflective poetic voiceover',
    },
    silentCharacters: [],
    dialogue: voLine2,
    cameraSetup: '50mm prime lens, smooth motorized slider tracking, beautiful bokeh circles in background.',
    lightingTheme: 'Warm 3200K interior shop glow contrasting against 5600K cool blue night rain.',
    timeline: timeline2,
    negativePromptDirectives: 'faces, distorted hands, shaky camera, low resolution.',
  });

  // CLIP 3
  const timeline3 = [
    {
      timeRange: '0:00 - 0:02',
      visualAction: 'Expansive vista of the skyline as rain clears and first golden rays break through clouds.',
      cameraMovement: 'Smooth crane elevation rising slowly upward.',
      characterPose: 'Open expansive horizon, gleaming wet rooftop reflections.',
      pauseBeat: '1.5-second awe-inspiring breath of silence.',
      activeSpeaker: 'Voiceover Narrator',
      sfxCue: 'Uplifting atmospheric chord swell, soft breeze, rain fading.',
    },
    {
      timeRange: '0:02 - 0:07',
      visualAction: 'Golden sunlight illuminates drifting morning mist across skyscraper architectural lines.',
      cameraMovement: 'Expansive upward tilt embracing the sunrise horizon.',
      characterPose: 'Majestic tranquility and hope.',
      pauseBeat: 'Profound concluding cadence.',
      spokenDialogue: voLine3,
      lipSyncDirective: 'Warm inspirational voiceover with stereo presence.',
      activeSpeaker: 'Voiceover Narrator',
      sfxCue: 'Inspiring resonant vocal delivery, cinematic orchestral pad swell.',
    },
    {
      timeRange: '0:07 - 0:09',
      visualAction: 'Camera glides toward the golden horizon as light fills the entire frame.',
      cameraMovement: 'Continuous forward glide into warm lens flare.',
      pauseBeat: 'Hold on absolute beauty.',
      activeSpeaker: undefined,
      sfxCue: 'Lingering musical resonance, bird chirping in distant morning air.',
    },
    {
      timeRange: '0:09 - 0:10',
      visualAction: 'Gradual elegant fade to black on golden sunburst.',
      cameraMovement: 'Slow ease out.',
      pauseBeat: 'Final audio sustain before video loop.',
      sfxCue: 'Warm bass tone decay, gentle fade to silence.',
    },
  ];

  const flowPrompt3 = buildCinematicFlowVeoPrompt({
    clipIndex: 3,
    totalClips: 3,
    sceneName: 'The Inspiring Closing Callout',
    shotType: 'Master Wide Sunrise Vista Crane Shot',
    locationAnchor: location,
    activeSpeaker: {
      name: 'Voiceover Narrator',
      dnaPrompt: 'Faceless panoramic morning skyline vista with golden hour sunbeams.',
      voiceTone: 'Inspiring, deeply compassionate, soothing finality',
    },
    silentCharacters: [],
    dialogue: voLine3,
    cameraSetup: '24mm ultra-wide cinema lens, rising crane shot, anamorphic horizontal golden sun flare.',
    lightingTheme: 'Brilliant golden hour sunbeams slicing through dramatic dark storm clouds, wet architectural glow.',
    timeline: timeline3,
    cliffhangerNote: 'Ends on inspirational emotional peak designed for high saves and profile follows.',
    negativePromptDirectives: 'ugly clouds, stuttering motion, washed out colors.',
  });

  const clips: ClipPrompt[] = [
    {
      clipIndex: 1,
      totalClips: 3,
      sceneName: 'Ambient Opening / Hypnotic Anchor',
      locationAnchor: location,
      masterKeyframeLock: `Fixed aesthetic perspective of ${location}. Slow-motion water drops reflecting cyber-amber lighting.`,
      shotType: 'Master Wide',
      frameImagePrompt: `[VIDEO FRAME IMAGE 1/3 - STARTING KEYFRAME]: Hypnotic cinematic composition of ${location}. Slow-motion water drops reflecting cyber-amber and neon cyan street signs on wet asphalt, anamorphic lens flare, shallow focus, 4K atmospheric keyframe.`,
      speakerIsolation: {
        activeSpeaker: 'Voiceover / Ambient Narration',
        speakingDialogue: voLine1,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline1,
      flowPromptText: flowPrompt1,
      retentionHookReasoning: 'Hypnotic slow-motion aesthetic instantly relaxes and captures attention.',
      pacingWordCount: calculateWordCount(voLine1),
    },
    {
      clipIndex: 2,
      totalClips: 3,
      sceneName: 'Atmospheric Continuity Shift',
      locationAnchor: location,
      masterKeyframeLock: `Identical color palette and rain reflections in ${location}.`,
      shotType: 'Point of View',
      frameImagePrompt: `[VIDEO FRAME IMAGE - KEYFRAME 2/3 (CONTINUITY SLIDER SHOT - MATCH KEYFRAME 1)]
[CRITICAL CONTINUITY MATCH TO KEYFRAME 1]:
- MASTER REFERENCE: [ATTACH KEYFRAME 1 AS SCENE & STYLE REFERENCE]
- SCENE & LIGHTING LOCK: 100% exact match to Keyframe 1 midnight rain atmosphere, cyan and amber neon reflections, wet reflective ground.
- CAMERA SETUP: Cinematic point-of-view slider shot past warm glowing condensation shopfront window.
[CINEMATOGRAPHY]: ARRI Alexa LF, 50mm anamorphic prime lens, f/1.8 shallow focus. 8K UHD film still.
[MIDJOURNEY CONTINUITY RECIPE]: --sref [KEYFRAME_1_URL] --sw 100 --ar 9:16 --v 6.1 --style raw`,
      speakerIsolation: {
        activeSpeaker: 'Voiceover / Ambient Narration',
        speakingDialogue: voLine2,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline2,
      flowPromptText: flowPrompt2,
      retentionHookReasoning: 'Consistent meditative visual flow ensures full watch completion.',
      pacingWordCount: calculateWordCount(voLine2),
      sceneWardrobe: 'Heavy charcoal wool trench coat with structured lapels, matte leather gloves',
      continuityRole: 'reverse_angle_match',
      continuityReferenceTag: '🔄 CONTINUITY POV SHOT (Attach Keyframe 1 as Style Ref: --sref [KEYFRAME_1_URL] --sw 100)',
    },
    {
      clipIndex: 3,
      totalClips: 3,
      sceneName: 'The Inspiring Closing Callout',
      locationAnchor: location,
      masterKeyframeLock: `Wide vista in ${location} maintaining midnight neon rain reflection continuity.`,
      shotType: 'Master Wide',
      frameImagePrompt: `[VIDEO FRAME IMAGE - KEYFRAME 3/3 (CONTINUITY RESOLUTION - MATCH KEYFRAME 1)]
[CRITICAL CONTINUITY MATCH TO KEYFRAME 1]:
- MASTER REFERENCE: [ATTACH KEYFRAME 1 AS SCENE & STYLE REFERENCE]
- SCENE & LIGHTING LOCK: Exact continuous midnight storm environment, wet cobblestones, glowing ambient neon signs.
- CAMERA SETUP: Expansive slow crane elevation revealing solitary silhouette with umbrella against glistening neon street.
[CINEMATOGRAPHY]: ARRI Alexa LF, 85mm anamorphic prime, f/2.0 shallow focus. 8K UHD film still.
[MIDJOURNEY CONTINUITY RECIPE]: --sref [KEYFRAME_1_URL] --sw 100 --ar 9:16 --v 6.1 --style raw`,
      speakerIsolation: {
        activeSpeaker: 'Voiceover / Ambient Narration',
        speakingDialogue: voLine3,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline: timeline3,
      flowPromptText: flowPrompt3,
      retentionHookReasoning: 'Inspirational takeaway drives video saves, reposts, and loop watches.',
      pacingWordCount: calculateWordCount(voLine3),
      sceneWardrobe: 'Heavy charcoal wool trench coat with structured lapels, matte leather gloves',
      continuityRole: 'culmination_match',
      continuityReferenceTag: '⚡ CONTINUITY RESOLUTION SHOT (Attach Keyframe 1 as Style Ref: --sref [KEYFRAME_1_URL] --sw 100)',
    },
  ];

  return {
    title,
    hookDescription,
    clips,
    characterAnchors: [
      {
        characterName: 'Atmospheric Visual Environment',
        anchorPrompt: `[MASTER ENVIRONMENT ANCHOR]: ${location}. Visual Style: ${spec.visualStyle}. Consistent color grading, rain sheen, and volumetric lighting.`,
      },
    ],
    locationAnchors: [
      {
        locationName: location,
        anchorPrompt: generateLocationAnchorPrompt(location, spec.visualStyle, spec.tone),
      },
    ],
    dialogueScript: [
      { speaker: 'Voiceover', line: voLine1, timing: '0:02 - 0:07' },
      { speaker: 'Voiceover', line: voLine2, timing: '0:02 - 0:07' },
      { speaker: 'Voiceover', line: voLine3, timing: '0:02 - 0:07' },
    ],
    sceneContinuityLock: {
      masterKeyframeIndex: 1,
      timeOfDay: '1:45 AM Midnight Rain',
      lightingSetup: 'Rain-soaked asphalt with gleaming specular reflections of amber streetlights and cyan retro shop neon, deep moody shadows',
      roomGeography: location,
      wardrobeLocks: [
        {
          characterName: 'Solitary Protagonist',
          exactOutfit: 'Tailored heavy midnight-charcoal wool trench coat with structured lapels, black cashmere turtleneck, matte leather gloves',
        },
      ],
      midjourneyContinuityRecipe: '--sref [KEYFRAME_1_URL] --sw 100 --ar 9:16',
    },
  };
}
