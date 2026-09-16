import { StorySpec, ClipPrompt } from '@/types';
import { generateLocationAnchorPrompt } from '../rules/spatial';
import { generateSecBySecTimeline } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

// -------------------------------------------------------------
// 🐾 PET COMEDY SERIES — CONTENT BIBLE CONSTANTS
// -------------------------------------------------------------

export const COZY_LIVING_ROOM_PROMPT =
  'A warm, cozy traditional living room interior, photorealistic, cinematic architectural photography. Large cream sectional sofa with a floral-patterned throw pillow on the left side. A wooden coffee table in the center with papers, a laptop, and a ceramic mug on it. Tall wooden bookshelf filled with books, small ceramic decor pieces, and a potted plant, positioned against the back wall. A cream fabric table lamp glowing softly beside the bookshelf. A large white/cream classic fireplace mantel on the right with a lit fire, decorated with small vases and plants on top. A window with sheer floral curtains on the left letting in warm natural sunlight. A small framed photo on the wall near the window. Warm wood parquet flooring throughout. Golden hour warm lighting, soft shadows, lived-in and detailed but tidy, shallow depth of field, cinematic soft lighting, 4k, ultra realistic, no people, no animals, 9:16 vertical composition';

export const JOE_CAT_REFERENCE_PROMPT =
  'Hyper-realistic photo of a grey British Shorthair cat named Joe, sitting upright on a wooden coffee table in a cozy traditional living room, warm fireplace glowing softly out of focus behind him. Wearing a simple brown leather collar with a small round tag engraved "JOE". Dense plush grey fur, round face, striking copper-orange eyes with sharp catchlight, calm and slightly judgmental expression, ears alert. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition';

export const NOVA_CORGI_REFERENCE_PROMPT =
  'Hyper-realistic photo of a cream-colored corgi named Nova, sitting on wood parquet flooring in a cozy traditional living room, warm fireplace visible softly blurred in the background. Wearing a small red bowtie around his neck. Thick fluffy fur, short legs, big round brown eyes, tongue slightly out, alert happy expression, ears perked straight up. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition';

export const ZARA_OWNER_REFERENCE_PROMPT =
  'Hyper-realistic cinematic portrait of a young woman in her mid-20s named Zara, wavy brown shoulder-length hair, natural soft makeup, wearing a casual navy tank top and layered silver necklaces. Sitting on a cream sectional sofa in a cozy traditional living room, a lit fireplace and wooden bookshelf softly blurred in the background. Warm golden natural sunlight from a window, shallow depth of field, candid expressive facial expression, cinematic photography, shot on 50mm lens, ultra realistic, 4k, natural skin texture, professional portrait photography style, 9:16 vertical composition';

// -------------------------------------------------------------
// EPISODIC STORIES (Everyday Relatable Scenarios)
// -------------------------------------------------------------

interface PetEpisodeScript {
  title: string;
  scenario: string;
  clips: {
    speaker: 'Zara' | 'Joe' | 'Nova';
    line: string;
    cameraMove: string;
    spatialSetup: string;
    nonSpeakersDirective: string;
    expression: string;
    foley: string;
  }[];
}

const PET_COMEDY_EPISODES: PetEpisodeScript[] = [
  // Episode 1: The Strict Diet Snacks
  {
    title: 'The Diet Intervention (Who Ate the Organic Chicken?)',
    scenario: 'Zara starts a strict household diet, but the pantry was mysteriously breached.',
    clips: [
      {
        speaker: 'Zara',
        line: "I literally locked the pantry door this morning. So someone explain how twenty dollars worth of organic salmon treats vanished into thin air.",
        cameraMove: 'Camera pushes in slowly on Zara sitting on the sectional sofa, holding an empty treat bag with an exasperated expression.',
        spatialSetup: 'Zara seated center on sofa; Joe sitting 2 feet away on wooden coffee table; Nova lying on the parquet rug below.',
        nonSpeakersDirective: 'Joe: upright on coffee table, eyes half-lidded, completely silent, licking paw casually with sealed mouth. Nova: lying on floor, tail thumping once, ears pinned back guilty.',
        expression: 'Exasperated, suspicious pet owner holding empty packaging.',
        foley: 'Gentle fireplace crackle, soft crinkle of empty foil treat bag, floor wood creak.',
      },
      {
        speaker: 'Joe',
        line: "First of all, accusations without forensic evidence are slander. Second of all, Nova looks suspiciously glossy today.",
        cameraMove: 'Camera smoothly pans and racks focus from Zara to Joe sitting upright on the coffee table, now in sharp macro focus.',
        spatialSetup: 'Joe on coffee table in sharp foreground; Zara blurred in background leaning forward with hand on forehead.',
        nonSpeakersDirective: 'Zara: sitting on sofa, completely silent, staring disbelief at Joe with mouth closed. Nova: on floor, looking between both with wide eyes.',
        expression: 'Deadpan witty one-liner delivery, ears perked, dignified, unbothered superiority.',
        foley: 'Subtle deep cat throat rumble, collar tag "JOE" faint clink, room acoustics.',
      },
      {
        speaker: 'Nova',
        line: "I didn't eat salmon! I was outside barking at the leaf that threatened our perimeter! The leaf was hostile, Zara!",
        cameraMove: 'Whip pan down to Nova sitting on the parquet floor beside the coffee table, big round eyes staring up passionately.',
        spatialSetup: 'Nova center floor; coffee table legs visible right; Joe peering down from table edge with disdain.',
        nonSpeakersDirective: 'Joe: looking down from table edge, completely silent, mouth closed, slow judgmental blink. Zara: silent, facepalming on sofa.',
        expression: 'Hyper-earnest, innocent, ears bouncing, tail wagging vigorously, tongue out between words.',
        foley: 'Tail thumps rhythmically against wood parquet floor, red bowtie collar rustle.',
      },
      {
        speaker: 'Joe',
        line: "See? The dog is unhinged. Now if you'll excuse me, my 2:00 PM sunbeam nap starts in three minutes. Case dismissed.",
        cameraMove: 'Camera cuts to Joe in an 85mm close-up on the coffee table delivering his deadpan punchline with a calm, flat expression. As he finishes, Zara reaches into frame and gently scratches him behind the ears; Joe maintains his deadpan serious face while subtly leaning his head into her fingers, as Zara shakes her head with a soft affectionate chuckle.',
        spatialSetup: 'Joe in sharp focus on coffee table; Zara sitting close on sofa reaching out to pet him warmly.',
        nonSpeakersDirective: 'Zara: smiling fondly with a soft giggle, mouth closed, gently scratching Joe behind the ears. Nova: curled on parquet floor resting, completely silent.',
        expression: 'Flat deadpan delivery, calm copper eyes, subtle lean into Zara’s gentle ear scratch.',
        foley: 'Warm deep purr hum, soft affectionate chuckle from Zara, gentle fireplace crackle.',
      },
    ],
  },

  // Episode 2: Working From Home (The Keyboard Incident)
  {
    title: 'Work From Home Productivity Expert',
    scenario: 'Zara is on an important client video call while Joe decides the keyboard is his bed.',
    clips: [
      {
        speaker: 'Zara',
        line: "Joe, I am five seconds away from sending an email to my entire department that reads 'ffffffffffffffff'. Please move.",
        cameraMove: 'Camera starts in a tight medium shot on Zara leaning over her laptop on the coffee table, whispering tensely.',
        spatialSetup: 'Zara on sofa leaning toward coffee table; Joe lying directly sprawled across the laptop keys.',
        nonSpeakersDirective: 'Joe: body sprawled across keyboard, head rested on trackpad, mouth closed, flat serious expression, completely ignoring her pleas.',
        expression: 'Stressed professional trying not to yell on a work call.',
        foley: 'Rapid laptop keyboard clicking sound, soft laptop fan hum, warm room ambient.',
      },
      {
        speaker: 'Joe',
        line: "You said your career needed more impact. I just hit 'Reply All' and CC'ed the CEO. Consider that executive consulting.",
        cameraMove: 'Camera pushes in smoothly on Joe’s round grey face on the keyboard, looking sideways up at Zara with a completely flat, serious expression.',
        spatialSetup: 'Joe in sharp foreground with deadpan face; Zara frozen in sheer horror in the blurred background.',
        nonSpeakersDirective: 'Zara: mouth frozen shut, hands clutching her cheeks in shock, completely silent.',
        expression: 'Completely flat deadpan confidence, calm copper eyes, zero facial twitch.',
        foley: 'Mac send sound chime (ding!), light tag rattle, deep fireplace roar.',
      },
      {
        speaker: 'Nova',
        line: "I am ready for the corporate presentation! Look, I brought my emotional support tennis ball! Who wants to throw it?!",
        cameraMove: 'Camera whip pans to Nova trotting into frame on the parquet floor, high energy, proudly dropping a green tennis ball at Zara’s feet.',
        spatialSetup: 'Nova sitting happily at Zara’s feet; tennis ball rolling slightly; Joe sighing on the laptop.',
        nonSpeakersDirective: 'Zara: staring at ball with sealed lips. Joe: flat serious deadpan stare, mouth closed.',
        expression: 'Ecstatic golden retriever energy in a corgi body, panting joyfully, ears bouncing.',
        foley: 'Hollow tennis ball bounce on wood floor (thump-thump), quick claws pattering.',
      },
      {
        speaker: 'Joe',
        line: "Promoted to Chief Barking Officer. Now close the laptop, woman, it was warm five minutes ago and now it's cold.",
        cameraMove: 'Camera cuts to Joe sitting upright beside the laptop, delivering punchline with deadpan seriousness. Zara breaks into a soft, relieved laugh, shaking her head affectionately and pulling Joe into a gentle lap cuddle; Joe stays completely flat and composed in her arms.',
        spatialSetup: 'Joe on Zara’s lap on the sofa; Zara wrapping arms warmly around him; laptop closed beside them.',
        nonSpeakersDirective: 'Zara: soft affectionate head shake and warm giggle, mouth closed, hugging Joe like family. Nova: sitting alert at her knees.',
        expression: 'Deadpan unimpressed dignity, mouth closed as Zara cuddles him warmly.',
        foley: 'Warm room acoustic, gentle soft laugh, fireplace warmth.',
      },
    ],
  },

  // Episode 3: The Robotic Vacuum Cleaner Invasion
  {
    title: 'The Mechanical Beast (Vacuum Cleaner Defense)',
    scenario: 'A robotic vacuum cleaner starts cleaning the living room parquet floor.',
    clips: [
      {
        speaker: 'Zara',
        line: "Guys, it's just the Roomba! Can both of you stop treating a five-pound dust collector like an apocalyptic alien invasion?",
        cameraMove: 'Camera pans across the living room from the sofa to the floor where the small circular robot vacuum hums near the rug.',
        spatialSetup: 'Zara sitting relaxed on sectional sofa; Joe perched high on top of the tall bookshelf; Nova backed into the fireplace corner.',
        nonSpeakersDirective: 'Joe: crouched on top shelf like a sniper, mouth closed, flat watchful gaze. Nova: shivering behind fireplace mantel, ears flat.',
        expression: 'Amused, rolling eyes with a warm soft smile at her pets dramatic overreaction.',
        foley: 'Low mechanical vacuum hum moving across floor, soft carpet brush sound.',
      },
      {
        speaker: 'Nova',
        line: "It has no face, Zara! No face and it eats socks! It bumped my left ankle and told me to move in robotic beeps!",
        cameraMove: 'Camera pushes in quickly on Nova tucked beside the white fireplace mantel, peering out with wide saucer eyes and high dramatic energy.',
        spatialSetup: 'Nova in corner; fireplace warm flames behind; circular robot vacuum approaching slowly on floor.',
        nonSpeakersDirective: 'Zara: giggling silently on sofa, lips closed. Joe: watching from high shelf, tail twitching silently.',
        expression: 'High-alert existential terror, ears quivering, dramatic whine stance.',
        foley: 'Robot vacuum bump sound (clunk-beep), soft terrified dog snort, crackle of fire.',
      },
      {
        speaker: 'Joe',
        line: "Hold your position, ground unit. I have established tactical aerial superiority on shelf three. When it approaches the rug, I strike.",
        cameraMove: 'Camera tilts up dramatically to Joe looking down from the tall wooden bookshelf next to the table lamp, looking like Batman with deadpan seriousness.',
        spatialSetup: 'Joe on high bookshelf looking down; living room spread below in cinematic perspective.',
        nonSpeakersDirective: 'Zara and Nova looking up silently, mouths closed.',
        expression: 'Completely serious deadpan military composure, squinted copper eyes.',
        foley: 'Dramatic tension silence, soft electronic whirr of vacuum below, faint floor creak.',
      },
      {
        speaker: 'Joe',
        line: "Mission aborted. It bumped the coffee table and I got startled. Zara, carry me to the bedroom immediately with dignity.",
        cameraMove: 'Camera cuts to Joe standing squarely on Zara’s lap on the sectional sofa, looking up at her with flat serious eyes. Zara wraps her arms around him with a warm, loving giggle, scratching his chin as Joe looks at the camera with dignified deadpan composure.',
        spatialSetup: 'Joe standing on Zara’s lap; Zara cradling him warmly on sofa; vacuum retreating across room.',
        nonSpeakersDirective: 'Zara: soft loving giggle, smiling warmly at Joe, chin scratch. Nova: trotting toward sofa silently.',
        expression: 'Regal deadpan entitlement, unblinking copper eyes, leaning subtly into Zara’s chin scratch.',
        foley: 'Soft urgent meow accent, muffled vacuum retreating, room warmth ambience.',
      },
    ],
  },
];

// -------------------------------------------------------------
// MAIN GENERATOR FUNCTION
// -------------------------------------------------------------

export function buildPetComedyClips(
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
  // Episode Selection based on dayNum and variation
  const episodeIndex = (dayNum - 1 + (variationType === 'High Tension' ? 0 : variationType === 'Fast Hook' ? 1 : 2)) % PET_COMEDY_EPISODES.length;
  const ep = PET_COMEDY_EPISODES[episodeIndex];

  const title = `Pet Comedy Ep ${dayNum}: ${ep.title}`;
  const hookDescription = ep.scenario;

  // Master Reference Starting Frame Image Prompt (Cozy Living Room with Zara, Joe, Nova)
  const masterFrameImagePrompt =
    `[VIDEO FRAME IMAGE - STARTING KEYFRAME (DAY ${dayNum})]: Warm cozy traditional living room interior, cinematic architectural and portrait photography. In the center, young woman Zara (mid-20s, wavy brown hair, casual navy tank top, silver necklaces) sitting relaxed on cream sectional sofa. On the wooden coffee table 2 feet in front of her sits Joe, a plush grey British Shorthair cat wearing a brown leather collar with round tag "JOE", copper-orange eyes. On the wood parquet floor to the right sits Nova, a cream fluffy corgi wearing a red bowtie with big round brown eyes. In background, a lit white fireplace mantel glows softly with a tall wooden bookshelf on the back wall. Warm golden hour sunlight streaming through floral curtains on left. 9:16 vertical composition, 4k photorealistic, shallow depth of field, 35mm cinematic lens. [IDENTITY LOCK]: Lock Joe, Nova, and Zara 100% to uploaded master character reference images.`;

  const clips: ClipPrompt[] = [];

  for (let i = 0; i < ep.clips.length; i++) {
    const clipData = ep.clips[i];
    const clipIndex = i + 1;

    // GOOGLE FLOW (VEO) MOTION PROMPT DIRECTIVE
    const flowPromptText =
`[SHOT SPECIFICATION]: 9:16 vertical video, 24fps cinematic camera movement, 4K film grade, cozy traditional living room with lit fireplace and wooden bookshelf.

[SPATIAL POSITIONING & CAMERA MOVEMENT]:
${clipData.cameraMove}
Spatial layout: ${clipData.spatialSetup}

[ACTIVE SPEAKER & LIP-SYNC]:
Active Character: ${clipData.speaker}
Speaking Dialogue: "${clipData.line}"
Lip-sync directive: Highly expressive, clear syllable mouth opening synchronized to the dialogue line. Realistic animal muzzle and mouth movement for ${clipData.speaker}. Take a natural micro-breath before speaking.

[NON-SPEAKING CHARACTERS - STRICT ISOLATION]:
${clipData.nonSpeakersDirective}
CRITICAL RULE: The non-speaking characters must remain 100% silent throughout this entire 10-second clip with their mouths completely closed, only reacting through alert ears, eye shifts, and head turns. Under no circumstances should more than one character's mouth move.

[ATMOSPHERE & LIGHTING]:
Warm golden hour sunlight through window, soft ambient glow from lit fireplace and table lamp, shallow depth of field with cinematic optical blur on background. Lived-in, cozy, photorealistic British/European home aesthetic. Photorealistic, 10 seconds.`;

    const timeline = generateSecBySecTimeline(
      clipData.speaker,
      ['Joe', 'Nova', 'Zara'].filter((n) => n !== clipData.speaker),
      clipData.line,
      `${clipData.cameraMove}. ${clipData.expression}`,
      clipData.foley,
      `Head held in character pose. ${clipData.spatialSetup}`,
      '1.0s comedic timing pause before dialogue delivery.'
    );

    clips.push({
      clipIndex,
      totalClips: ep.clips.length,
      sceneName: `Clip ${clipIndex}/4: ${clipData.speaker}'s Beat (${clipIndex === 1 ? 'Hook' : clipIndex === 4 ? 'Punchline' : 'Build-up'})`,
      locationAnchor: 'Cozy Traditional Living Room',
      masterKeyframeLock: `Day ${dayNum} Master Living Room Keyframe (Locked room, Joe with JOE collar, Nova with red bowtie, Zara in navy tank).`,
      shotType: clipIndex === 2 || clipIndex === 4 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide',
      frameImagePrompt: masterFrameImagePrompt,
      speakerIsolation: {
        activeSpeaker: clipData.speaker,
        speakingDialogue: clipData.line,
        silentCharacters: ['Joe', 'Nova', 'Zara'].filter((n) => n !== clipData.speaker),
        cameraCutApplied: true,
      },
      timeline,
      flowPromptText,
      retentionHookReasoning: `Clip ${clipIndex} drives comedy retention through character contrast and deadpan timing.`,
      pacingWordCount: calculateWordCount(clipData.line),
      sceneWardrobe: "Zara: casual navy tank top + layered silver necklaces; Joe: brown leather collar 'JOE'; Nova: red bowtie",
      requiresReferenceImageAttachment: true,
      foleySoundDesign: clipData.foley,
      negativePromptDirectives: 'double speaking characters, cartoon 3d style, distorted paws, extra ears, missing collar, plastic fur, robotic voice, flickering lighting, deformed animal face.',
    });
  }

  return {
    title,
    hookDescription,
    masterFrameImagePrompt,
    clips,
    characterAnchors: [
      {
        characterName: 'Joe (Cat - British Shorthair)',
        anchorPrompt: JOE_CAT_REFERENCE_PROMPT,
      },
      {
        characterName: 'Nova (Dog - Corgi)',
        anchorPrompt: NOVA_CORGI_REFERENCE_PROMPT,
      },
      {
        characterName: 'Zara (Human Owner)',
        anchorPrompt: ZARA_OWNER_REFERENCE_PROMPT,
      },
    ],
    locationAnchors: [
      {
        locationName: 'Cozy Traditional Living Room (Base Home)',
        anchorPrompt: COZY_LIVING_ROOM_PROMPT,
      },
    ],
    dialogueScript: ep.clips.map((c, idx) => ({
      speaker: c.speaker,
      line: c.line,
      timing: `Clip ${idx + 1}/${ep.clips.length} (0:01 - 0:09)`,
    })),
  };
}
