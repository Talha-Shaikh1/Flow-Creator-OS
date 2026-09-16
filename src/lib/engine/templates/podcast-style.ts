import { StorySpec, ClipPrompt } from '@/types';
import { generateLocationAnchorPrompt } from '../rules/spatial';
import { generateSecBySecTimeline } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

// 7-Day Rotating Aesthetic Outfits (Gold layered necklace + stud earrings locked across ALL)
export const DAILY_PODCAST_OUTFITS = [
  'off-shoulder dark charcoal ribbed knit sweater, gold layered necklace and small stud earrings',
  'oversized cozy cream cashmere sweater, gold layered necklace and small stud earrings',
  'sleek espresso brown square-neck long sleeve top, gold layered necklace and small stud earrings',
  'deep navy off-shoulder soft lounge knit sweater, gold layered necklace and small stud earrings',
  'relaxed olive green chunky knit cardigan over beige camisole, gold layered necklace and small stud earrings',
  'minimalist slate grey soft mock-neck top, gold layered necklace and small stud earrings',
  'soft oatmeal heathered knit pullover, gold layered necklace and small stud earrings',
];

interface ScriptPackage {
  title: string;
  hookDescription: string;
  dialogueLines: string[];
}

// Curated 4-Clip Scripts strictly calibrated to 25–35 words per 10s clip (~2.5 to 3.2 words/sec)
const RELATIONSHIP_SCRIPTS: ScriptPackage[] = [
  {
    title: 'Why They Pull Away When Things Get Real',
    hookDescription:
      'A warm, thoughtful UK/EU relationship hot-take explaining why emotional unavailability is often mistaken for mystery.',
    dialogueLines: [
      // Clip 1 (29 words)
      'If you constantly find yourself guessing where you stand with someone, pay close attention. Real, genuine emotional connection always brings effortless clarity, never continuous anxiety, mixed signals, or second-guessing.',
      // Clip 2 (30 words)
      "People don't suddenly withdraw because they are simply too busy with life. They pull away because genuine emotional intimacy demands an honesty and vulnerability they simply aren't ready to give you.",
      // Clip 3 (33 words)
      "And the most painful realization isn't even losing them in the end. It's looking back and realizing how long you stayed silent, trying to preserve a connection they had already checked out of.",
      // Clip 4 (30 words)
      'Never allow yourself to audition for someone\'s basic consistency or affection. The right person will never treat your presence as an optional debate in their everyday life; they show up.',
    ],
  },
  {
    title: 'The Truth About Mixed Signals and Priorities',
    hookDescription:
      'A grounded psychological reflection on why inconsistency is always a silent answer.',
    dialogueLines: [
      // Clip 1 (31 words)
      'Pay very close attention to how someone treats you when things are inconvenient for them. Anyone can love you when the sun is shining, but character shows up in the storm.',
      // Clip 2 (32 words)
      'Inconsistency is never an unsolved mystery you are meant to spend sleepless nights deciphering. It is simply a quiet demonstration of their actual priorities, and you need to believe what you see.',
      // Clip 3 (30 words)
      'The hardest pill to swallow is accepting that you fell deeply in love with their potential, while they were comfortably enjoying the unconditional patience and grace you kept endlessly offering.',
      // Clip 4 (31 words)
      'Stop lowering your standards just to make someone else feel comfortable staying around you. Walk away with your dignity intact, and make room for someone who meets you with equal intention.',
    ],
  },
];

const MINDSET_SCRIPTS: ScriptPackage[] = [
  {
    title: 'Stop Over-Explaining Your Worth to the Wrong Rooms',
    hookDescription:
      'A slow, deliberate mindset reflection on why protecting your peace means letting go of the need to be understood.',
    dialogueLines: [
      // Clip 1 (29 words)
      'The exact moment you stop over-explaining your boundaries to people committed to misunderstanding you, your entire energy shifts. You never owe anyone an apology for choosing your own inner peace.',
      // Clip 2 (33 words)
      "You really don't have to attend every argument you're invited to, nor do you need validation from everyone. True self-respect begins when you quietly refuse to beg for a seat at tables you've outgrown.",
      // Clip 3 (32 words)
      'True maturity is realizing that your silence is often the loudest answer you can ever give. Peace of mind is infinitely more valuable than having the last word in a pointless argument.',
      // Clip 4 (29 words)
      'Give yourself full permission to step back quietly, protect your focus, and let your daily consistency speak for itself. You don\'t need to be loud to make your impact felt.',
    ],
  },
  {
    title: 'Quiet Confidence and Trusting Your Own Timing',
    hookDescription:
      'An authentic personal growth reflection on overcoming fear of judgment and outgrowing old chapters.',
    dialogueLines: [
      // Clip 1 (31 words)
      "Most people aren't actually afraid of failing; they're terrified of being seen trying by people who aren't doing anything at all. Don't let spectators ever dictate the pace of your life.",
      // Clip 2 (30 words)
      'When you start outgrowing old environments, the discomfort feels overwhelming at first. But isolation is often just the prerequisite quiet you need before stepping into your next chapter with confidence.',
      // Clip 3 (31 words)
      "Stop waiting for everyone around you to agree with where you're headed. The vision was given to you, not to an audience of people who are too scared to take a risk.",
      // Clip 4 (27 words)
      'Trust the quiet timing of your personal growth, stay grounded in your daily habits, and remember that real self-belief is built when nobody is watching or applauding.',
    ],
  },
];

// Clip-specific dynamic directives for timing, breath intakes, micro-expressions, and head/camera cues
interface ClipDirectorCues {
  sceneName: string;
  cueNote: string;
  promptDirective: string;
  timelinePose: string;
  timelinePauseBeat: string;
  timelineVisualAction: string;
}

const CLIP_DIRECTOR_CUES: ClipDirectorCues[] = [
  {
    sceneName: 'Clip 1/4: The Opening Hook & Reflective Breath',
    cueNote: 'Thoughtful gaze off-camera, quiet vulnerable breath before speaking.',
    promptDirective:
      '[CLIP 1 TIMING, BREATH & MICRO-EXPRESSION]: Begin with a 1.2-second reflective silence. Take a soft, visible natural breath intake through slightly parted lips while gazing slightly off-camera to the side, looking thoughtful as if recalling a personal memory, before delivering the opening word. Maintain an intimate, vulnerable micro-expression — eyes softening with genuine empathy. Insert a distinct micro-pause at commas and clause boundaries.',
    timelinePose:
      'Head held straight and level, relaxed shoulders with natural calm rise and fall of chest breathing.',
    timelinePauseBeat:
      '1.2-second thoughtful silence; soft natural breath intake before starting speech.',
    timelineVisualAction:
      'Seated level at slight angle, gazes off-camera thoughtfully, takes a soft breath, begins speaking slowly with precise lip-sync.',
  },
  {
    sceneName: 'Clip 2/4: The Deeper Observation & Analytical Truth',
    cueNote: 'Gentle micro-nod mid-sentence, steady deliberate speech, soft hand gesture near mic.',
    promptDirective:
      '[CLIP 2 TIMING, BREATH & MICRO-EXPRESSION]: Maintain steady, relaxed breathing. Between the first and second sentence, insert a deliberate 1.0-second pause accompanied by a subtle, slow micro-nod and a faint hand gesture resting near the base of the Shure microphone to emphasize the realization. Expression is calm, knowing, and deeply grounded — delivering hard psychological truth with compassionate maturity.',
    timelinePose:
      'Upright grounded posture, subtle slow micro-nod during the mid-clause pause, hands resting near microphone base.',
    timelinePauseBeat:
      '1.0-second deliberate pause between sentences; steady calm exhalation.',
    timelineVisualAction:
      'Delivers first observation slowly, pauses for 1.0s with an insightful micro-nod, then continues with grounded conviction.',
  },
  {
    sceneName: 'Clip 3/4: The Vulnerable Emotional Core & Relatable Ache',
    cueNote: 'Slight downward eye flicker mid-sentence, tender solemnity, peak relatability.',
    promptDirective:
      '[CLIP 3 TIMING, BREATH & MICRO-EXPRESSION]: Before delivering the second half of the sentence, let a visible, slightly heavier breath escape. Allow a tender 1.2-second emotional pause to hang mid-sentence with eyes glancing slightly downward for 0.8 seconds to capture the quiet ache of relatable truth, before lifting gaze back off-camera to finish the line with solemn warmth.',
    timelinePose:
      'Slight softening of shoulders, brief 0.8s downward eye flicker at the emotional realization, returning to off-camera gaze.',
    timelinePauseBeat:
      '1.2-second heavy emotional pause mid-sentence; soft reflective sigh.',
    timelineVisualAction:
      'Speaks opening clause, pauses with eyes softening downward at the emotional weight, then resumes off-camera with tender solemnity.',
  },
  {
    sceneName: 'Clip 4/4: The Resolution, Empowerment & Direct Connection',
    cueNote: 'Brief reassuring gaze shift toward camera on final takeaway, calm warm exhale.',
    promptDirective:
      '[CLIP 4 TIMING, BREATH & MICRO-EXPRESSION]: Delivery is reassuring, steady, and protective. On the final key phrase, gently shift gaze directly toward the camera lens for 1.5 to 2 seconds — breaking the off-camera gaze for a brief moment of direct, intimate connection with the viewer — paired with a subtle, faint warm micro-smile and a slow relaxed exhale as the 10 seconds conclude.',
    timelinePose:
      'Confident, warm posture; brief gentle turn of eyes toward camera lens during the final takeaway phrase.',
    timelinePauseBeat:
      '0.8-second warm breath pause before the final clause; peaceful closing exhale.',
    timelineVisualAction:
      'Delivers empowering advice off-camera, then glances directly into lens for 1.5s with a reassuring micro-smile and calm exhale.',
  },
];

export function buildPodcastStyleClips(
  spec: StorySpec,
  dayEmotion: string,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook',
  dayNum: number = 1
): {
  title: string;
  hookDescription: string;
  masterFrameImagePrompt: string;
  clips: ClipPrompt[];
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  dialogueScript: { speaker: string; line: string; timing: string }[];
} {
  // Day-specific outfit selection (locked across all 4 clips of this day + photo posts)
  const dayOutfit = DAILY_PODCAST_OUTFITS[(dayNum - 1) % DAILY_PODCAST_OUTFITS.length];

  // Master Persona 1 (UK/Europe Audience)
  const persona = spec.cast[0] || {
    name: 'Elena (Persona 1)',
    role: 'Hero',
    dnaPrompt:
      `24yo woman with brunette hair, green eyes, natural subtle makeup, distinct signature cheek beauty mole on cheekbone. Wearing ${dayOutfit}. Warm, relatable, authentic real skin texture with visible pores. Lock 100% to uploaded master reference image.`,
  };

  const studioLocation =
    spec.locationSettings[0] ||
    'Podcast studio setting with soft warm ring light, blurred bookshelf, and ambient lamp glow in background';

  // Topic & Script Selection
  const isRelationshipTopic = variationType === 'High Tension' || variationType === 'Fast Hook';
  const scriptPool = isRelationshipTopic ? RELATIONSHIP_SCRIPTS : MINDSET_SCRIPTS;
  const selectedScript = scriptPool[(dayNum - 1) % scriptPool.length];

  const title = `${selectedScript.title} (${dayEmotion})`;
  const hookDescription = selectedScript.hookDescription;
  const dialogueLines = selectedScript.dialogueLines;

  // Single Master Starting Frame Prompt: Used once for the entire reel (all 4 clips)
  const startingFrameImagePrompt =
    `[VIDEO FRAME IMAGE - STARTING KEYFRAME (DAY ${dayNum})]: Podcast studio setting, subject seated facing camera at a slight angle, head held straight and level — not tilted to either side, gaze directed slightly off-camera to the side as if looking at someone seated beside the lens — not making direct eye contact with the camera, soft warm ring light from the front-left, blurred bookshelf and ambient lamp glow in background, wearing ${dayOutfit}, Shure microphone positioned close to mouth, warm moody cinematic color grade, slightly desaturated tone, natural skin texture with visible pores and signature cheek beauty mole on cheekbone, photorealistic, shallow depth of field, 35mm lens look. [IDENTITY]: Lock 100% to uploaded master reference image for facial biometric consistency.`;

  const clips: ClipPrompt[] = [];

  for (let i = 0; i < 4; i++) {
    const line = dialogueLines[i];
    const clipIndex = i + 1;
    const cues = CLIP_DIRECTOR_CUES[i];

    const timeline = generateSecBySecTimeline(
      persona.name,
      [],
      line,
      `${persona.name} in ${dayOutfit}. ${cues.timelineVisualAction}`,
      'Intimate acoustic room warmth, proximity Shure microphone vocal tone, subtle tape hiss.',
      cues.timelinePose,
      cues.timelinePauseBeat
    );

    // TAILORED MASTER VIDEO PROMPT: Dynamically tailored with clip-specific pauses, breath, and micro-expression
    const masterVideoPrompt =
`Animate this frame speaking the following dialogue, in exact sequential order from the first word to the last — do not skip ahead, do not jump to later words, do not rearrange or compress the sentence: "${line}"

${cues.promptDirective}

Speak very slowly and softly, with a warm, gentle, loving tone — like someone speaking thoughtfully and deliberately to a person they care about, not reciting quickly. Each word should be given its own time and weight, with natural micro-pauses between phrases and a slightly longer pause at commas.

Lip-sync must be exaggerated and precise enough that the dialogue is understandable even with the sound muted — every consonant and vowel shape should be clearly and fully formed on the mouth and lips, no rushed or blended mouth movements, no mumbling motion.

Take a soft natural breath before starting to speak, and let a small breath be visible/audible between sentences. Subtle natural rise and fall of the chest and shoulders throughout, like calm relaxed breathing.

If the full dialogue cannot naturally finish within the 10-second duration at this slow, deliberate pace, that is expected and fine — stop wherever the sentence naturally lands. Do not speed up or compress the remaining words to fit the time limit.

Gaze stays directed slightly off-camera to the side throughout, only shifting briefly toward the camera on a strongly emphasized word if the line calls for it — never a direct continuous stare at the lens. Head stays level and straight, no tilting, only small natural micro-turns.

Eyes blink naturally and irregularly. Camera stays almost completely locked/static, with only the faintest handheld micro-drift — no push-ins, no dramatic movement. Warm moody cinematic color grade, slightly desaturated, matching the reference frame's lighting exactly. Natural skin texture retained throughout, no AI-smoothing or waxy skin. Photorealistic, 10 seconds.`;

    clips.push({
      clipIndex,
      totalClips: 4,
      sceneName: cues.sceneName,
      locationAnchor: studioLocation,
      masterKeyframeLock: `Day ${dayNum} Master Keyframe Image (Locked single frame for all 4 clips to prevent room/character drift). Outfit: ${dayOutfit}.`,
      shotType: 'Master Wide',
      frameImagePrompt: startingFrameImagePrompt,
      speakerIsolation: {
        activeSpeaker: persona.name,
        speakingDialogue: line,
        silentCharacters: [],
        cameraCutApplied: false,
      },
      timeline,
      flowPromptText: masterVideoPrompt,
      retentionHookReasoning: `Clip ${clipIndex} delivers measured, relatable psychological retention pacing (${calculateWordCount(line)} words).`,
      pacingWordCount: calculateWordCount(line),
      sceneWardrobe: dayOutfit,
      requiresReferenceImageAttachment: true,
      foleySoundDesign: 'Warm acoustic studio presence, Shure SM7B proximity effect, natural vocal breathing, soft ambient room tone.',
      negativePromptDirectives: 'head tilt, direct camera stare, camera zoom, push-in, robotic speech, blurred facial features, missing cheek mole, smoothing filter, fast speech.',
    });
  }

  return {
    title,
    hookDescription,
    masterFrameImagePrompt: startingFrameImagePrompt,
    clips,
    characterAnchors: [
      {
        characterName: persona.name,
        anchorPrompt: `[MASTER INFLUENCER ANCHOR (DAY ${dayNum})]: ${persona.name}. Brunette hair, green eyes, signature distinct cheek beauty mole on cheekbone. Today's Locked Outfit: ${dayOutfit}. Lock 100% to uploaded master reference image for facial identity across all clips.`,
      },
    ],
    locationAnchors: [
      {
        locationName: studioLocation,
        anchorPrompt: generateLocationAnchorPrompt(studioLocation, 'Hyper-Realistic Cinematic', 'Emotional / Heavy'),
      },
    ],
    dialogueScript: dialogueLines.map((line, idx) => ({
      speaker: persona.name,
      line,
      timing: `Clip ${idx + 1}/4 (0:01 - 0:09)`,
    })),
  };
}
