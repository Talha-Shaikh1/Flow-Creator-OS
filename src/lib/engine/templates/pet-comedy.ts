import {
  StorySpec,
  ClipPrompt,
  SceneContinuityLock,
  CleanLocationPlate,
  PlatformSocialMetadata,
  InUniversePostBundle,
  CastMember,
} from '@/types';
import { generateCleanLocationPlatePrompt, enforceEyelineBlocking } from '../rules/spatial';
import { generateSecBySecTimeline, buildOmniFlash11Directive } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

// -------------------------------------------------------------
// 🐾 PET COMEDY SERIES — MASTER VISUAL ANCHORS
// -------------------------------------------------------------

export const COZY_LIVING_ROOM_PROMPT =
  'A warm, cozy traditional living room interior, photorealistic, cinematic architectural photography. Large cream sectional sofa with a floral-patterned throw pillow on the left side. A wooden coffee table in the center with papers, a laptop, and a ceramic mug on it. Tall wooden bookshelf filled with books, small ceramic decor pieces, and a potted plant, positioned against the back wall. A cream fabric table lamp glowing softly beside the bookshelf. A large white/cream classic fireplace mantel on the right with a lit fire, decorated with small vases and plants on top. A window with sheer floral curtains on the left letting in warm natural sunlight. A small framed photo on the wall near the window. Warm wood parquet flooring throughout. Golden hour warm lighting, soft shadows, lived-in and detailed but tidy, shallow depth of field, cinematic soft lighting, 4k, ultra realistic, no people, no animals, 9:16 vertical composition.';

export const JOE_CAT_REFERENCE_PROMPT =
  'Hyper-realistic photo of a grey British Shorthair cat named Joe, sitting upright on a wooden coffee table in a cozy traditional living room, warm fireplace glowing softly out of focus behind him. Wearing a simple distressed brown leather collar with a small round brass tag engraved "JOE". Dense plush grey fur, round face, striking copper-orange eyes with sharp catchlight, calm and slightly judgmental expression, ears alert. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition.';

export const NOVA_CORGI_REFERENCE_PROMPT =
  'Hyper-realistic photo of a cream-colored corgi named Nova, sitting on wood parquet flooring in a cozy traditional living room, warm fireplace visible softly blurred in the background. Wearing a small scarlet-red bowtie around his neck. Thick fluffy fur, short legs, big round brown eyes, tongue slightly out, alert happy expression, ears perked straight up. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition.';

export const ZARA_OWNER_REFERENCE_PROMPT =
  'Hyper-realistic cinematic portrait of a young woman in her mid-20s named Zara, wavy brown shoulder-length hair tied in a loose stylish messy ponytail, natural soft makeup, wearing a casual navy ribbed tank top and layered silver necklaces. Sitting on a cream sectional sofa in a cozy traditional living room. Warm golden natural sunlight from a window, shallow depth of field, candid expressive facial expression, cinematic photography, shot on 50mm lens, ultra realistic, 4k, natural skin texture, professional portrait photography style, 9:16 vertical composition.';

export interface PetMultiSceneBeat {
  sceneNumber: 1 | 2 | 3;
  sceneName: string;
  locationName: string;
  timeRange: string;
  lightingTheme: string;
  cleanPlatePrompt: string;
}

/**
 * Generates 100% human-free & animal-free Clean Location Plates for Pet Comedy start-frame pinning.
 */
function getPetCleanPlates(dayNum: number, is90s: boolean): PetMultiSceneBeat[] {
  return [
    {
      sceneNumber: 1,
      sceneName: is90s ? 'Scene 1: The Kitchen Island & Pantry Crime Scene (00s - 30s)' : 'Scene 1: The Kitchen Island & Pantry Crime Scene (00s - 20s)',
      locationName: 'Sunlit Modern Farmhouse Kitchen Island & Walk-In Pantry',
      timeRange: is90s ? '00s - 30s' : '00s - 20s',
      lightingTheme: 'Crisp morning natural sunlight through kitchen bay window, soft natural fill, white marble countertop reflections, warm ambient oak wood accents',
      cleanPlatePrompt: 'Architectural wide interior photograph of a sunlit modern farmhouse kitchen with a white marble waterfall island, natural oak barstools, copper pans hanging above, white shaker cabinets with brass handles, polished wood parquet floor. ZERO HUMANS, ZERO PETS, NO ANIMALS, NO PEOPLE, completely empty clean architectural photography, 8k resolution, 9:16 vertical composition.',
    },
    {
      sceneNumber: 2,
      sceneName: is90s ? 'Scene 2: The Living Room Interrogation & Sofa Standoff (30s - 60s)' : 'Scene 2: The Living Room Interrogation & Sofa Standoff (20s - 40s)',
      locationName: 'Cozy Traditional Living Room with Sectional Sofa & Fireplace',
      timeRange: is90s ? '30s - 60s' : '20s - 40s',
      lightingTheme: 'Warm golden hour sunlight streaming through sheer floral curtains, soft orange glow from lit white fireplace mantel, warm table lamp glow',
      cleanPlatePrompt: 'Architectural wide photograph of a cozy traditional living room interior, cream sectional sofa with decorative floral throw pillow, round dark wood coffee table in center, tall wooden bookshelf filled with books, lit white fireplace mantel with glowing fire on right, parquet wood floor. ZERO HUMANS, ZERO PETS, NO ANIMALS, NO PEOPLE, completely empty clean interior photography, 8k resolution, 9:16 vertical composition.',
    },
    {
      sceneNumber: 3,
      sceneName: is90s ? 'Scene 3: The Sunlit Hallway & Garden Patio Doors (60s - 90s)' : 'Scene 3: The Sunlit Hallway & Garden Patio Doors (40s - 60s)',
      locationName: 'Sun-Drenched Hallway Opening into French Garden Patio Doors',
      timeRange: is90s ? '60s - 90s' : '40s - 60s',
      lightingTheme: 'High-contrast afternoon sunlight, lush landscaped green garden bokeh visible through open glass doors, golden dust motes floating on herringbone floor',
      cleanPlatePrompt: 'Architectural interior photograph of a sun-drenched home hallway leading to open French glass patio doors overlooking a lush landscaped green garden, polished herringbone hardwood flooring, tall potted fiddle-leaf fig plant. ZERO HUMANS, ZERO PETS, NO ANIMALS, NO PEOPLE, completely empty clean interior photography, 8k resolution, 9:16 vertical composition.',
    },
  ];
}

// -------------------------------------------------------------
// 7-DAY NARRATIVE MATRIX (9 BEATS PER DAY ACROSS 3 SCENES)
// -------------------------------------------------------------

interface PetBeatDef {
  speaker: 'Zara' | 'Joe' | 'Nova';
  dialogue: string;
  action: string;
  shotType: 'Shot-Reverse-Shot Close-Up' | 'Master Wide' | 'Dynamic Tracking' | 'Over-the-Shoulder';
  sceneNum: 1 | 2 | 3;
  cameraSetup: string;
  foley: string;
  eyeline: 'screen-left' | 'screen-right' | 'center-forward';
}

const PET_7DAY_DIALOGUE_MATRIX: Record<number, PetBeatDef[]> = {
  // Day 1: The Salmon Treat Heist (Pantry Break-in)
  1: [
    // Scene 1: Kitchen Island (0-20s or 0-30s)
    {
      speaker: 'Zara',
      dialogue: "I locked this pantry door at 7:00 AM. Explain how twenty dollars worth of freeze-dried salmon treats vanished into thin air.",
      action: "Medium shot on Zara standing at the kitchen marble island holding an empty foil treat bag, looking screen-right with an exasperated, suspicious squint.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime portrait lens, eye-level angle, gentle push-in, shallow depth of field',
      foley: 'Gentle morning kitchen ambiance, soft crinkle of empty foil treat bag, floor wood creak.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Accusations without biometric paw-print forensics are pure slander, Zara. Besides, look at how suspiciously glossy Nova's coat is today.",
      action: "Reverse low-angle macro shot on Joe the grey cat sitting upright on the marble island. Eyeline locked screen-left, slow judgmental blink, whisker twitch.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm macro telephoto lens at cat eye-level, razor sharp focus on Joe whiskers, soft marble blur',
      foley: 'Subtle deep cat throat purr hum, round brass collar tag "JOE" faint clink against marble.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "I didn't eat salmon! I was on high alert barking at the suspicious Amazon delivery box! The cardboard was aggressive!",
      action: "Low-angle medium shot on Nova the corgi sitting on the kitchen floor beside the island, ears perked, tongue out, looking screen-right earnestly.",
      shotType: 'Dynamic Tracking',
      sceneNum: 1,
      cameraSetup: '35mm wide lens at floor height, slight handheld bounce matching eager panting',
      foley: 'Fast paws tapping on kitchen parquet floor, tail thudding rhythmically against wooden cabinets.',
      eyeline: 'screen-right',
    },
    // Scene 2: Living Room (20-40s or 30-60s)
    {
      speaker: 'Joe',
      dialogue: "The dog has zero impulse control. Yesterday he licked the living room baseboard for forty-five minutes straight.",
      action: "Tight close-up on Joe perched on the round wooden coffee table in the living room, looking screen-left with utter deadpan superiority.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm portrait lens, warm fireplace glow softly blurred in background',
      foley: 'Soft fireplace wood crackle, gentle purring vibration, room tone.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "The baseboard had salty flavor, Joe! You cannot judge my culinary explorations from your high velvet pillow!",
      action: "Reverse shot on Nova on the living room rug, head tilting dynamically with wide innocent brown eyes, looking screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '50mm lens at dog eye-level, scarlet-red bowtie in sharp focus',
      foley: 'Soft carpet scratch, red bowtie rustle, dog micro-snort.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "Neither of you is off the hook. Look under the sofa cushion right now... there are three empty salmon wrappers!",
      action: "Over-the-shoulder medium shot. Zara lifts the sofa cushion to reveal crumpled foil wrappers, turning to look between both pets.",
      shotType: 'Over-the-Shoulder',
      sceneNum: 2,
      cameraSetup: '35mm medium wide lens, warm afternoon golden sunlight filling the room',
      foley: 'Cushion fabric rustle, soft foil crunch, Zara affectionate sigh.',
      eyeline: 'center-forward',
    },
    // Scene 3: Garden Patio (40-60s or 60-90s)
    {
      speaker: 'Joe',
      dialogue: "Those wrappers were planted by an external feline syndicate. Now if you will excuse me, my 2:00 PM sunbeam nap starts in three seconds.",
      action: "Low-angle tracking shot as Joe strolls gracefully across the sun-drenched hallway towards the patio sunbeam, facing screen-left.",
      shotType: 'Dynamic Tracking',
      sceneNum: 3,
      cameraSetup: '50mm smooth tracking gimbal at floor height, golden light flaring across fur',
      foley: 'Soft padded cat pawsteps on polished herringbone floor, distant birds chirping outside.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Wait! The sunbeam is mine! I called dibs on the warm wooden floor patch! Race you to the patio doors!",
      action: "Wide kinetic shot as Nova scrambles onto short legs, claws skidding playfully on the herringbone floor, facing screen-right.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '28mm wide action angle capturing both pets entering the sunlit hallway patio frame',
      foley: 'Rapid claws scrambling on polished wood, playful breathless panting.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Watch the dog slip on the fresh hardwood wax in three... two... one... poetic justice delivered.",
      action: "Tight close-up on Joe's deadpan face basking in golden sunlight as Nova slides gently past into the soft rug. Freeze frame comedy cut to black!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '85mm close-up, warm golden hour rim lighting on grey fur, abrupt blackout cut',
      foley: 'Soft comical rug thud (whump!), warm purr crescendo, immediate silence on cut.',
      eyeline: 'screen-left',
    },
  ],

  // Day 2: Work From Home & The Keyboard War
  2: [
    {
      speaker: 'Zara',
      dialogue: "I have a quarterly budget presentation in five minutes, and someone chewed through the Ethernet cable on the counter!",
      action: "Medium shot on Zara in the kitchen holding two severed ends of a nylon cable, eyes wide with corporate dread, looking screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime, bright morning kitchen light',
      foley: 'Plastic wire rattle, nervous human breath, distant morning traffic.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Nova',
      dialogue: "The black snake on the counter was slithering towards your coffee, Zara! I neutralized the serpent with my front teeth!",
      action: "Reverse shot on Nova sitting proudly on the kitchen runner rug, chest puffed out, tail wagging like a propeller, looking screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm at dog height, shallow depth of field',
      foley: 'Energetic tail thumps against kitchen cabinet, happy dog panting.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "The serpent was a sixty-dollar high-speed braided cable. Your dog has the cognitive capacity of a damp sponge.",
      action: "Tight close-up on Joe perched on the kitchen island stool, looking screen-left with cold intellectual disdain.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm macro lens, marble countertop reflection in foreground',
      foley: 'Calm cat purr, light tag click on wooden stool.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "Joe, do not step on that laptop! I am typing an email to the board of directors right this second!",
      action: "Medium shot in the living room as Zara frantically reaches toward the coffee table where her laptop sits open.",
      shotType: 'Dynamic Tracking',
      sceneNum: 2,
      cameraSetup: '35mm handheld tracking, tense comedic camera movement',
      foley: 'Rapid laptop keyboard clicks, stressed human whisper.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "You said your corporate career lacked decisive leadership. I just laid my stomach on 'Delete All' and sent it. You're welcome.",
      action: "Reverse tight close-up on Joe lying completely flat across the keyboard, looking up sideways with unbothered deadpan eyes screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm macro lens, glowing screen reflections on cat face',
      foley: 'Mac email send whoosh chime (swoosh!), deep fireplace rumble.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "You just uninstalled my entire company spreadsheet! Both of you are officially grounded until Friday!",
      action: "Over-the-shoulder shot on Zara clutching her head in disbelief as the blank screen shines back at her.",
      shotType: 'Over-the-Shoulder',
      sceneNum: 2,
      cameraSetup: '50mm lens, warm room lighting',
      foley: 'Sudden gasp of horror, keyboard clatter, fireplace crackle.',
      eyeline: 'center-forward',
    },
    {
      speaker: 'Nova',
      dialogue: "Does grounded mean we get to run in circles on the lawn?! Because I am already stretching my corgi hamstrings!",
      action: "Wide tracking shot as Nova sprints through the hallway towards the open garden patio doors, ears flying back happily.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '28mm wide angle tracking low to the ground',
      foley: 'Claws scrabbling on hardwood, excited high-pitched yip.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Notice how the dog interprets corporate catastrophe as an Olympic track-and-field opportunity. Remarkable.",
      action: "Tight close-up on Joe sitting dignified by the patio glass door, watching Nova with half-lidded amusement, facing screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '85mm portrait lens, garden green bokeh background',
      foley: 'Subtle throat purr hum, distant lawn breeze.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "Come here you two chaotic monsters... close the laptop, it's belly rub time whether you like it or not!",
      action: "Warm medium shot as Zara sits on the hallway floor in the sunbeam, pulling both pets into a warm affectionate cuddle. Cut to black!",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '50mm cinematic portrait lens, warm golden lens flare, freeze and cut',
      foley: 'Affectionate soft laughter, contented deep purr, happy tail wag.',
      eyeline: 'center-forward',
    },
  ],

  // Day 3: The Robotic Vacuum Invasion (The Roomba Standoff)
  3: [
    {
      speaker: 'Zara',
      dialogue: "Guys, it's just the new robotic vacuum cleaner! Stop treating a circular dust collector like an alien invasion!",
      action: "Medium shot on Zara in the kitchen pointing down at the humming round robotic vacuum moving across the tiles.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime, eye-level angle',
      foley: 'Low electric motor hum of vacuum, soft rotating brush sound.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Nova',
      dialogue: "It has no eyes, Zara! It hums in binary and it rolled over my tail like an unstoppable iron beast!",
      action: "Reverse shot on Nova pressed trembling against the kitchen cabinets, eyes wide as saucers, looking screen-right in terror.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm low angle at dog level, high dramatic tension',
      foley: 'Whimpering dog sigh, claws quivering on tile floor.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Calm down, ground infantry. I have already analyzed its patrol pattern. It turns 45 degrees whenever it taps a chair leg.",
      action: "Low-angle shot looking up at Joe crouched atop the kitchen refrigerator like a tactical sniper, looking screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm low-to-high angle, cinematic hero framing for cat',
      foley: 'Steady purr of tactical confidence, distant vacuum hum.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "It's heading straight for my toy squeaky duck! Fall back to the couch! Protect the duck at all costs!",
      action: "Dynamic tracking shot as Nova dives onto the living room rug, scooping up a yellow squeaky duck with urgent heroism.",
      shotType: 'Dynamic Tracking',
      sceneNum: 2,
      cameraSetup: '35mm fast-tracking camera at carpet level',
      foley: 'Loud rubber squeak (squeak-squeak!), frantic claw scramble on rug.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "I have taken the high tactical ground on the third bookshelf. When the beast approaches the wool rug, I deploy the paw of doom.",
      action: "Tight close-up on Joe perched between books on the tall living room bookshelf, paw hovering ominously over the edge screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm portrait lens, dramatic shadow from table lamp',
      foley: 'Tense dramatic silence, soft electronic whirr of vacuum below.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "Joe, do not swat the laser sensor! It took me forty minutes to map this living room floor plan!",
      action: "Medium shot on Zara standing by the fireplace with hands raised in helpless defense of her technology.",
      shotType: 'Over-the-Shoulder',
      sceneNum: 2,
      cameraSetup: '50mm prime, warm firelight reflections',
      foley: 'Fireplace crackle, exasperated sigh.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Tactical strike executed. One precise swipe to the power button, and the robotic menace is deactivated. You're welcome, humanity.",
      action: "Low-angle tracking shot as Joe drops gracefully from the shelf, tapping the red button with one nonchalant paw tap, facing screen-left.",
      shotType: 'Dynamic Tracking',
      sceneNum: 3,
      cameraSetup: '50mm smooth tracking, hero slow-motion feel on paw tap',
      foley: 'Mechanical power-down descending tone (boop-bzzzz), light thud of cat landing.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Joe defeated the robot! He is our fearless king! I shall sing the victory bark of my corgi ancestors!",
      action: "Medium wide on Nova howling joyfully into the sunbeam by the patio doors, tail wagging like crazy, facing screen-right.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '35mm wide lens, bright afternoon garden backlight',
      foley: 'Adorable comical corgi howl-bark (awoooo!), tail thumping floor.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "And now my robot vacuum is singing an error beep while Nova howls along in harmony. My house is a literal circus.",
      action: "Tight close-up on Zara facepalming while laughing warmly in the sunlit hallway. Cut to black!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm portrait lens, golden sunlight catching hair, abrupt comedy blackout',
      foley: 'Robot error chime (beep-beep), affectionate laughter, sudden cut to black.',
      eyeline: 'center-forward',
    },
  ],

  // Day 4: The Midnight Zoomies Incident
  4: [
    {
      speaker: 'Zara',
      dialogue: "It was 3:14 AM last night. Why were there frantic paw skids across the polished kitchen floor like a Fast & Furious drift?",
      action: "Medium close-up on Zara in pajama top leaning against the kitchen counter, dark circles under eyes, mug in hand, looking screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm lens, early morning quiet light',
      foley: 'Ceramic coffee mug clink on counter, quiet morning room tone.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Nova',
      dialogue: "The kitchen floor had high friction, Zara! The hallway was a velocity corridor and I hit maximum corgi acceleration!",
      action: "Reverse shot on Nova on the kitchen rug, panting proudly with tongue hanging out, looking screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm dog level, shallow depth of field',
      foley: 'Happy dog breath, red bowtie rustle.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "He claims speed, but in reality he collided with the walk-in pantry door and bounced off like a furry bowling ball.",
      action: "Tight close-up on Joe sitting on the counter beside the toaster, deadpan copper eyes locked screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm macro lens, sharp whisker detail',
      foley: 'Subtle throat purr hum, toaster metallic tick.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "And Joe, why were you sprinting vertically up the living room curtains like a caffeinated ninja at three in the morning?",
      action: "Medium shot in the living room as Zara points at the slightly wrinkled sheer curtains by the sofa.",
      shotType: 'Dynamic Tracking',
      sceneNum: 2,
      cameraSetup: '35mm tracking push-in',
      foley: 'Curtain fabric rustle, fireplace warmth.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "A rogue airborne dust particle violated our living room airspace. I neutralized the threat with Olympic aerial gymnastics.",
      action: "Reverse shot on Joe perched majestically on the sofa armrest, licking his front paw with imperial unbothered dignity screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm portrait, soft fireplace bokeh behind',
      foley: 'Soft paw lick sound, faint collar clink.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "I thought the dust particle was an intruder so I backed up Joe with tactical floor barks! We are a team!",
      action: "Over-the-shoulder shot on Nova sitting attentively at the coffee table, gazing up at Joe with pure admiration.",
      shotType: 'Over-the-Shoulder',
      sceneNum: 2,
      cameraSetup: '50mm prime, warm living room tones',
      foley: 'Tail thumping parquet rug, enthusiastic dog pant.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "You two woke up three neighboring houses! Look at the exhaustion on my face!",
      action: "Medium wide shot in the hallway as Zara walks with hands on hips, both pets trotting beside her towards the garden patio.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '35mm wide angle, bright sunlight streaming through patio glass',
      foley: 'Soft footsteps on herringbone wood, light pet claws pattering.',
      eyeline: 'center-forward',
    },
    {
      speaker: 'Joe',
      dialogue: "Sleep is a bourgeois concept, Zara. What matters is that this household remains safe under our nocturnal vigilance.",
      action: "Tight close-up on Joe lying in the fresh sunbeam by the glass doors, closing eyes comfortably, facing screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '85mm close-up, warm dust motes floating in sunlight',
      foley: 'Deep contented cat purr, soft sigh.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Can we do it again tonight?! I feel like my sprint turns can shave off half a second on the rug!",
      action: "Extreme close-up on Nova's big enthusiastic puppy eyes quivering with joy. Abrupt comedy blackout cut!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm close-up, golden catchlights in dark brown eyes, abrupt blackout cut',
      foley: 'Single energetic bark (woof!), quick snap to black.',
      eyeline: 'screen-right',
    },
  ],

  // Day 5: The Vet Clinic Appointment Deception
  5: [
    {
      speaker: 'Zara',
      dialogue: "Who wants to go for a fun little car ride to get tasty treats and see friendly people?!",
      action: "Medium close-up on Zara in the kitchen speaking with exaggerated sugary sweetness, hiding her car keys behind her back screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime, bright sunny kitchen',
      foley: 'Keys jingling softly behind back, forced cheerful tone.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Do you hear the unnatural cheerfulness in her voice, dog? That cadence is not a park visit... that is the veterinary tribunal.",
      action: "Reverse shot on Joe instantly narrowing his copper eyes on the kitchen island, ears swiveling back into airplane mode screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm telephoto, dramatic suspicious focus on cat face',
      foley: 'Low warning cat growl hum, silence.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Did she say CAR RIDE?! I love the car! The window wind flaps my tongue at ninety miles an hour!",
      action: "Low-angle medium on Nova bouncing on all four paws by the pantry door with uncontrollable joy, facing screen-right.",
      shotType: 'Dynamic Tracking',
      sceneNum: 1,
      cameraSetup: '35mm wide angle at floor height',
      foley: 'Ecstatic paws dancing on floor, heavy tail thuds.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Look at her left hand behind her back, idiot. She is holding the plastic pet carrier with the metal wire door.",
      action: "Tight close-up on Joe pointing with a subtle chin nod toward Zara's hidden carrier handle, facing screen-left with ice-cold realization.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm macro, dramatic suspense lighting from living room lamp',
      foley: 'Plastic carrier handle squeak, tension silence.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "The carrier box?! The cold stainless steel table with the thermometer?! Betrayal! Deception in the highest order!",
      action: "Reverse shot on Nova instantly stopping his tail, ears pinning flat to head, eyes wide with horror screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '50mm portrait lens, comedic panic framing',
      foley: 'Sudden squeak of dog brakes, dramatic tension drop.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "Guys, it's just your routine annual vaccinations! Joe, get out from under the coffee table this instant!",
      action: "Over-the-shoulder shot on Zara kneeling on the living room rug with the plastic carrier ready.",
      shotType: 'Over-the-Shoulder',
      sceneNum: 2,
      cameraSetup: '35mm wide lens, warm cozy fireplace backdrop',
      foley: 'Knees creaking on floor rug, exasperated chuckle.',
      eyeline: 'center-forward',
    },
    {
      speaker: 'Joe',
      dialogue: "I have wedged my body into the negative space between the baseboard and the sofa. I am now load-bearing architecture.",
      action: "Tight low-angle shot under the sofa where two glowing copper eyes stare back with unbreakable resolve, facing screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm macro under furniture, shadows and glowing cat eyes',
      foley: 'Muffled stubborn cat purr from dark shadows.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "I am hiding behind the potted patio plant! If I cannot see Zara, Zara cannot see Nova! Perfect camouflage!",
      action: "Wide shot in the hallway where Nova sits behind a small potted fig plant, whole red bowtie and fluffy rear clearly exposed, facing screen-right.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '35mm wide angle capturing obvious failed hiding spot',
      foley: 'Plant leaves rustling, nervous panting.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "Nova, your entire red bowtie and fluffy tail are sticking out of the fern. Get in the car, both of you!",
      action: "Zara laughing as she scoops Nova up under her arm while Joe watches from under the sofa. Abrupt comedy blackout cut!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm lens, bright sunlight on patio, freeze frame and cut to black',
      foley: 'Warm laughter, soft dog grunt, instant cut to black.',
      eyeline: 'center-forward',
    },
  ],

  // Day 6: The Mysterious Sock Disappearance
  6: [
    {
      speaker: 'Zara',
      dialogue: "I put six pairs of matched wool socks into the laundry basket. Now there are seven left socks and zero right socks.",
      action: "Medium shot on Zara in the kitchen holding an empty wicker laundry basket, staring at both pets with forensic intensity screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime, bright morning light',
      foley: 'Wicker basket creak, laundry fabric rustle.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Nova',
      dialogue: "The sock fairy took them, Zara! A mythical creature that loves ankle warmth and cotton-poly blends!",
      action: "Reverse shot on Nova sitting unnaturally rigid on the kitchen rug, cheeks looking suspiciously swollen, facing screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm low angle at dog height, bulging cheeks in sharp focus',
      foley: 'Muffled guilty dog breath, tail twitching once.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Notice the slight bulge under Nova's red bowtie and the unmistakable guilt radiating from his droopy ears.",
      action: "Tight close-up on Joe atop the kitchen counter, casually pointing a grey paw toward Nova with deadpan accuracy screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm macro, sharp whiskers, marble background',
      foley: 'Cat claw tapping counter (tap-tap), purr.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "Nova, drop it. Drop whatever is in your mouth right now onto the living room coffee table.",
      action: "Medium shot in the living room as Zara points firmly at the wooden coffee table, stepping closer.",
      shotType: 'Dynamic Tracking',
      sceneNum: 2,
      cameraSetup: '35mm slow push-in',
      foley: 'Footsteps on parquet floor, firm parental tone.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Nova',
      dialogue: "I am holding nothing! This is merely my natural dental cheek structure expanding with seasonal pride!",
      action: "Reverse shot on Nova trying to speak without opening his jaw, eyes rolling upwards in frantic denial screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '50mm portrait, comical swollen muzzle in focus',
      foley: 'Comical muffled dog mumbling through clenched teeth.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Poke his left cheek, Zara. Watch the yellow cashmere argyle sock emerge like a circus magic trick.",
      action: "Tight close-up on Joe watching from the sofa armrest, tail swishing with smug satisfaction screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm portrait, warm fireplace glow behind',
      foley: 'Tail swish on sofa fabric, deep purring vibration.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "It fell into my mouth accidentally while I was yawning near the laundry basket! It was self-defense!",
      action: "Wide shot as Nova finally opens mouth and a yellow sock drops onto the coffee table with a soft flop, facing screen-right.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '35mm wide lens, hallway patio light in background',
      foley: 'Soft wet fabric flop on wood table (thwack!), guilty whimper.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "The legal defense team rests. Now retrieve my fleece blanket from the patio before the morning sun fades.",
      action: "Tight close-up on Joe closing his eyes with majestic superiority, turning toward the sunbeam screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '85mm lens, golden light streaming across plush grey fur',
      foley: 'Contented cat yawn, collar clink.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Zara',
      dialogue: "At this point, I am just going to start buying socks in packs of twenty. Give me that, you goofy pup!",
      action: "Zara laughing as she picks up the sock and scratches Nova behind the ears. Abrupt comedy blackout cut!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm lens, warm affectionate golden light, freeze and cut to black',
      foley: 'Warm laughter, happy dog tail thumping, abrupt blackout cut.',
      eyeline: 'center-forward',
    },
  ],

  // Day 7: Season Finale: The Great Dinner Feast Ambush
  7: [
    {
      speaker: 'Zara',
      dialogue: "Tonight is Thanksgiving dinner. The roasted turkey is resting on the marble island, and NOBODY is touching it.",
      action: "Medium shot on Zara in the kitchen wearing a festive holiday apron, pointing firmly at the golden roasted turkey platter screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '50mm prime lens, warm festive holiday kitchen lighting',
      foley: 'Sizzling holiday roast aroma ambiance, silver platter clink.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Look at the golden glazed perimeter of that poultry, Nova. It is practically begging for a multi-species joint operation.",
      action: "Reverse shot on Joe crouched low on the kitchen island stool, eyes dilated with laser-focused predatory interest screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 1,
      cameraSetup: '85mm macro lens, dilated black pupils with amber ring',
      foley: 'Deep predatory throat purr hum, whisker twitching.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Operation Turkey Drop! I create a high-volume diversion by the refrigerator, and you execute the vertical table leap!",
      action: "Low-angle medium on Nova whispering urgently near the kitchen island leg, ears forward, tail trembling with excitement screen-right.",
      shotType: 'Dynamic Tracking',
      sceneNum: 1,
      cameraSetup: '35mm wide angle at floor height',
      foley: 'Urgent low dog chuff, rapid tail vibration on floor.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "I hear tactical whispering from the kitchen hallway. If I see a single paw within six inches of that platter, dinner is canceled!",
      action: "Medium shot in the living room as Zara walks towards the kitchen with oven mitts in hand, looking suspicious screen-right.",
      shotType: 'Dynamic Tracking',
      sceneNum: 2,
      cameraSetup: '35mm tracking shot, cozy fireplace roaring in background',
      foley: 'Padded oven mitt rustle, crackle of fireplace logs.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "Commencing distraction protocol. Dog, knock over the decorative ceramic bowl on the entryway runner now.",
      action: "Tight close-up on Joe giving a subtle ear flick signal from the counter screen-left.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 2,
      cameraSetup: '85mm portrait, dramatic holiday warm shadows',
      foley: 'Tense silence, subtle cat purr.',
      eyeline: 'screen-left',
    },
    {
      speaker: 'Nova',
      dialogue: "Executing tactical tail swipe! Clatter clatter! Look Zara, a spontaneous interior decor malfunction!",
      action: "Wide action shot as Nova's tail wags against a low wooden stool, sending a small plastic fruit bowl tumbling safely onto the rug screen-right.",
      shotType: 'Master Wide',
      sceneNum: 2,
      cameraSetup: '28mm wide angle capturing the staged comedic accident',
      foley: 'Plastic bowl clattering harmlessly on rug (clatter-thump!), proud dog bark.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Zara',
      dialogue: "You two coordinated a full-scale culinary heist! But joke's on you... I prepared two bowls of shredded turkey for my favorite partners.",
      action: "Medium wide shot as Zara brings two festive ceramic pet bowls to the sunlit hallway patio, smiling affectionately.",
      shotType: 'Master Wide',
      sceneNum: 3,
      cameraSetup: '35mm wide lens, bright golden sunlight through French patio doors',
      foley: 'Ceramic bowls placed on wood floor (clink-clink), aroma steam sound.',
      eyeline: 'center-forward',
    },
    {
      speaker: 'Nova',
      dialogue: "Our own turkey bowls?! With warm savory gravy?! Zara is the greatest human in the history of the universe!",
      action: "Tight close-up on Nova diving joyfully into his bowl with ears flying and tail wagging at supersonic speed screen-right.",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '50mm lens at bowl level, joyful holiday energy',
      foley: 'Enthusiastic happy dog munching, rapid tail thuds on floor.',
      eyeline: 'screen-right',
    },
    {
      speaker: 'Joe',
      dialogue: "The diplomatic negotiations were a complete success. Season 1 concluded. Now dim the lights, we feast like royalty.",
      action: "Tight close-up on Joe taking a delicate, dignified bite of turkey before looking directly at camera with a slow, contented wink. Freeze frame and cut to black!",
      shotType: 'Shot-Reverse-Shot Close-Up',
      sceneNum: 3,
      cameraSetup: '85mm macro lens, slow-motion contented wink, abrupt comedy blackout cut',
      foley: 'Gentle purr crescendo, warm holiday fireplace chord, abrupt cut to black.',
      eyeline: 'center-forward',
    },
  ],
};

// -------------------------------------------------------------
// VIP BEHIND-THE-SCENES (BTS) PROMPT GENERATOR FOR PETS
// -------------------------------------------------------------

export function generateVIPPetBehindTheScenesPost(params: {
  dayNum: number;
  seriesTitle: string;
  sceneLocation: string;
}): {
  title: string;
  imagePrompt: string;
  caption: string;
  hashtags: string[];
  angleDescription: string;
} {
  const btsPrompt = `Candid, high-budget behind-the-scenes film set photograph from a major cinematic pet comedy production. In the foreground, an ARRI Alexa Mini LF cinema camera mounted on a low-angle floor skater slider rig with an external Atomos monitor displaying live camera playback of Joe the plush grey British Shorthair cat sitting upright on the wooden coffee table. In the midground, a licensed professional female animal trainer in practical beige cargo trousers is kneeling beside the camera holding a yellow target clicker and a treat pouch, smiling warmly as Joe calmly looks towards the lens. Beside them on the cream sectional sofa, the actress playing Zara in her navy tank top is laughing candidly between takes with the female director holding a marked leather episode script binder. In the background, Nova the fluffy corgi with a red bowtie is resting happily on the rug with a crew member gently petting him. Overhead softbox diffused studio lighting on C-stands, boom microphone hovering above, professional sound recordist wearing headphones in background. Setting is the authentic cozy movie set of ${params.sceneLocation}. Shot on 35mm film stock, crisp 8K resolution, genuine movie production atmosphere with soft background blur.`;

  return {
    title: `Ep ${params.dayNum} Movie Set BTS: The Skater Dolly & Treat Trainer`,
    imagePrompt: btsPrompt,
    caption: `Cameras off, treats out! 🐱🐶 In front of the camera, Joe and Nova are criminal masterminds, but behind the scenes... Joe demanded 4 freeze-dried salmon treats before he agreed to deliver his deadpan stare in take 3! 😂 Nova was too busy trying to lick the camera lens! Who was the bigger diva today? Comment below! 👇`,
    hashtags: [
      '#BehindTheScenes',
      '#PetComedy',
      '#AnimalActors',
      '#FilmMaking',
      '#CatLife',
      '#DogLife',
      '#MovieMagic',
      '#CorgiLove',
      '#BritishShorthair',
      '#ViralReels',
    ],
    angleDescription: 'Low-angle cinema camera rig on skater dolly with animal trainer holding treats beside lead cat and dog.',
  };
}

// -------------------------------------------------------------
// DUAL CROSS-PLATFORM METADATA SUITE FOR PET COMEDY
// -------------------------------------------------------------

export function generateDualCrossPlatformPetMetadata(params: {
  seriesTitle: string;
  seasonNumber: number;
  dayNum: number;
  episodeTitle: string;
  hook: string;
  scenes: PetMultiSceneBeat[];
}): {
  episode: PlatformSocialMetadata;
  bts: PlatformSocialMetadata;
} {
  const cleanEpTitle = params.episodeTitle.replace(/^Ep \d+:\s*/, '');
  const is90s = params.scenes[0]?.timeRange?.includes('30s');
  const ts1 = '0:00';
  const ts2 = is90s ? '0:30' : '0:20';
  const ts3 = is90s ? '0:60' : '0:40';

  // 1. EPISODE METADATA
  const episodeYoutubeTitle = `HE ACCUSED THE CAT! 🐱😂 | Ep ${params.dayNum}: ${cleanEpTitle}`.slice(0, 70);

  const episodeYoutubeDescription = `Watch Episode ${params.dayNum} of "${params.seriesTitle}" (Season ${params.seasonNumber})!

🐱🐶 EPISODE SYNOPSIS & PET COMEDY STORY:
${params.hook}
When human owner Zara leaves the pantry door unlocked for thirty seconds, master planner Joe the British Shorthair cat and his hyperactive corgi accomplice Nova launch an audacious household heist. Moving across three distinct rooms—from the high kitchen marble island to the living room fireplace and sunlit French garden patio—their hilarious bantering and synchronized speaking lips reveal the secret comedy life pets live when humans look away.

⏱️ EXACT SCENE-BY-SCENE TIMESTAMPS:
${ts1} - Scene 1: The Treat Pantry Infiltration (${params.scenes[0]?.locationName || 'Kitchen Island'})
${ts2} - Scene 2: The Fireplace Living Room Interrogation (${params.scenes[1]?.locationName || 'Living Room'})
${ts3} - Scene 3: The Garden Patio Getaway Standoff (${params.scenes[2]?.locationName || 'Garden Patio'})

🐾 CAST & VOICE CHARACTERS:
• Joe — Sarcastic British Shorthair Cat Mastermind (Orange Eyes, Distressed Leather Collar)
• Nova — Chaotic Cream Corgi Accomplice (Scarlet Bowtie, Infinite Zoomies)
• Zara — Loving, Exhausted Human Owner Caught in the Crossfire
Directed with Gemini Omni Flash 1.1 native speech synchronization & micro-expressions.

🎥 PRODUCTION & CAMERA GEAR BREAKDOWN:
• Camera: ARRI Alexa Mini LF on low-angle floor skater dolly (pet eye-level)
• Lenses: 85mm Macro & 50mm Prime with shallow f/1.8 depth of field
• Ratio: 9:16 Vertical Video (YouTube Shorts / Reels / TikTok)
• Motion: 24fps motion cadence with locked 180-degree eyeline matching

🔍 TARGETED SEARCH KEYWORDS & TOPICS:
talking pets, funny cat videos, talking dog, funny animals 2026, pet comedy episode, corgi comedy, british shorthair cat, pets caught on camera, animal voiceover, funny pet shorts, pet bloopers, talking animal series, comedy shorts, episode ${params.dayNum}

💬 AUDIENCE DEBATE POLL — COMMENT BELOW:
Whose side are you on in today's heist?
🐱 Team Joe (The Mastermind Cat)
🐶 Team Nova (The Chaotic Corgi)
Drop your vote in the comments below! 👇

🔔 SUBSCRIBE & HIT THE BELL ICON for tomorrow's Episode ${(params.dayNum % 7) + 1}! New hilarious talking pet adventures daily!`;

  const episodeYoutubeTags = [
    'pet comedy',
    `episode ${params.dayNum}`,
    'funny pets 2026',
    'talking cat',
    'talking dog',
    'corgi comedy',
    'british shorthair',
    'joe and nova',
    'funny animal video',
    'talking animals',
    'comedy shorts',
    'pet drama',
    'viral pet reels',
    'omni flash video',
    'animal bloopers',
    'cute animals',
    'cat vs dog',
    'talking corgi',
    'viral animals',
    'pet series',
  ];

  const episodeSocialCaption = `Joe: "Act natural!" 😼 Nova: *knocks over entire treat jar* 🐶 Ep ${params.dayNum} out now! When Zara turned her back, the kitchen syndicate struck! Whose side are you on: Team Joe 🐱 or Team Nova 🐶? Drop your vote below! 👇`.slice(0, 300);

  const episodeSocialHashtags = [
    '#PetComedy',
    '#CatLogic',
    '#DogLogic',
    '#FunnyAnimals',
    '#RelatablePets',
    '#CorgiLife',
    '#BritishShorthair',
    '#PetLovers',
    '#TrendingReels',
    '#ComedyShorts',
  ];

  // 2. BTS METADATA
  const btsYoutubeTitle = `HOW WE TRAINED THE CAT! 🎬 Behind The Scenes Ep ${params.dayNum}`.slice(0, 70);

  const btsYoutubeDescription = `Exclusive Hollywood Behind-The-Scenes of "${params.seriesTitle}" Episode ${params.dayNum}!

Ever wondered how we get a British Shorthair cat and a Corgi to deliver synchronized comedy beats with zero face distortion?
Take a look at our on-set production setup:
• ARRI Alexa Mini LF on low-angle floor skater dolly
• Licensed professional animal trainer with target clickers and freeze-dried treats
• Clean location plates pinned in Gemini Omni Flash 1.1 for 100% stable fur and facial geometry

🍿 ON-SET BLOOPER HIGHLIGHT:
Joe refused to do take 3 until his salmon treat was handed to him directly on a porcelain saucer! 😂

🔍 BTS SEARCH KEYWORDS & TOPICS:
pet film set, animal trainer bts, arri alexa mini lf, how to film pets, talking pet bloopers, corgi bloopers, cat bloopers, animal acting tips, filmmaking tutorial

🔔 Subscribe for daily behind-the-scenes film tricks and pet comedy secrets!`;

  const btsYoutubeTags = [
    'pet comedy bts',
    'movie set bts',
    'animal training bts',
    'how to film pets',
    'arri alexa mini',
    'corgi behind the scenes',
    'filmmaking tips',
    'ai filmmaking',
    'omni flash 1.1',
    'bloopers 2026',
    'cat bloopers',
    'dog bloopers',
    'behind the scenes',
    'animal actors',
  ];

  const btsSocialCaption = `Director: "Action!" 🎬 Joe: "Not until I get my salmon treats." 😼 Ever wonder what filming talking pets actually looks like? Here is our on-set trainer getting the perfect take! 😂`.slice(0, 300);

  const btsSocialHashtags = [
    '#BehindTheScenes',
    '#PetBloopers',
    '#AnimalActors',
    '#FilmMaking',
    '#MovieSetLife',
    '#CatBloopers',
    '#DogBloopers',
    '#ViralBTS',
  ];

  return {
    episode: {
      youtube: {
        title: episodeYoutubeTitle,
        description: episodeYoutubeDescription,
        tags: episodeYoutubeTags,
        hashtags: ['#PetComedy', '#TalkingAnimals', '#FunnyPets', '#GoogleFlow', '#Shorts'],
      },
      social: {
        caption: episodeSocialCaption,
        hashtags: episodeSocialHashtags,
        commentCallToAction: 'Whose side are you on today: Team Joe 🐱 or Team Nova 🐶? Drop your vote below! 👇',
      },
    },
    bts: {
      youtube: {
        title: btsYoutubeTitle,
        description: btsYoutubeDescription,
        tags: btsYoutubeTags,
        hashtags: ['#BehindTheScenes', '#PetBTS', '#MovieMagic', '#FilmMaking'],
      },
      social: {
        caption: btsSocialCaption,
        hashtags: btsSocialHashtags,
        commentCallToAction: 'Which pet actor was funnier in the bloopers: Joe 😼 or Nova 🐶? Comment below! 👇',
      },
    },
  };
}

// -------------------------------------------------------------
// MAIN ENTRYPOINT: BUILD PET COMEDY CLIPS
// -------------------------------------------------------------

export function buildPetComedyClips(
  spec: StorySpec,
  dayEmotion: string,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook' = 'High Tension',
  dayNum: number = 1,
  existingVariation?: any
): {
  title: string;
  hookDescription: string;
  clips: ClipPrompt[];
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  dialogueScript: { speaker: string; line: string; timing: string }[];
  cleanLocationPlates: CleanLocationPlate[];
  dualMetadata: { episode: PlatformSocialMetadata; bts: PlatformSocialMetadata };
  inUniversePosts: InUniversePostBundle;
  sceneContinuityLock: SceneContinuityLock;
} {
  const is90s = spec.clipDurationSeconds === 90;

  // 1. Resolve 3 Dynamic Household Clean Plates
  const sceneBeats = getPetCleanPlates(dayNum, is90s);
  const cleanLocationPlates: CleanLocationPlate[] = sceneBeats.map((s) => ({
    sceneNumber: s.sceneNumber,
    sceneName: s.sceneName,
    locationName: s.locationName,
    timeRange: s.timeRange,
    cleanPlatePrompt: s.cleanPlatePrompt,
    lightingAndAtmosphere: s.lightingTheme,
  }));

  // 2. Resolve 9 Beats and Slice based on 60s vs 90s
  const rawDayBeats = PET_7DAY_DIALOGUE_MATRIX[dayNum] || PET_7DAY_DIALOGUE_MATRIX[1];
  const dayBeats = is90s
    ? rawDayBeats
    : [rawDayBeats[0], rawDayBeats[1], rawDayBeats[3], rawDayBeats[4], rawDayBeats[6], rawDayBeats[8]];

  const episodeTitles: Record<number, { title: string; hook: string }> = {
    1: {
      title: `Ep 1: The Salmon Treat Heist (Pantry Break-in)`,
      hook: `Twenty dollars of freeze-dried salmon treats vanished from a locked pantry, and Joe accuses Nova.`,
    },
    2: {
      title: `Ep 2: Work From Home & The Keyboard War`,
      hook: `Zara tries to host a quarterly presentation while Joe uninstalls company spreadsheets with his belly.`,
    },
    3: {
      title: `Ep 3: The Robotic Vacuum Invasion (The Roomba Standoff)`,
      hook: `A five-pound robotic vacuum moves onto the living room rug, triggering a multi-species tactical defense.`,
    },
    4: {
      title: `Ep 4: The Midnight Zoomies Incident`,
      hook: `Frantic 3:00 AM velocity sprints down the hallway corridor leave paw skids and three wakeful neighbors.`,
    },
    5: {
      title: `Ep 5: The Vet Clinic Appointment Deception`,
      hook: `A suspiciously cheerful car ride invitation unmasks the dreaded veterinary carrier box.`,
    },
    6: {
      title: `Ep 6: The Mysterious Sock Disappearance`,
      hook: `Seven left socks, zero right socks, and Nova's suspiciously swollen cheek structure.`,
    },
    7: {
      title: `Ep 7: Season Finale: The Great Dinner Feast Ambush`,
      hook: `Thanksgiving turkey rests on the kitchen island as Joe and Nova stage a coordinated distraction protocol.`,
    },
  };

  const epMeta = episodeTitles[dayNum] || episodeTitles[1];
  const title = epMeta.title;
  const hookDescription = epMeta.hook;

  // 3. Build Clips with Gemini Omni Flash 1.1 Directives & 180° Eyeline Blocking
  const clips: ClipPrompt[] = dayBeats.map((d, idx) => {
    const isLast = idx === dayBeats.length - 1;
    const sceneDef = sceneBeats.find((s) => s.sceneNumber === d.sceneNum) || sceneBeats[0];
    const counterpartName = d.speaker === 'Joe' ? 'Nova' : (d.speaker === 'Nova' ? 'Joe' : 'Joe & Nova');

    const eyelineRule = enforceEyelineBlocking(d.speaker, d.eyeline, counterpartName);
    const matchingPlate = cleanLocationPlates.find((p) => p.sceneNumber === d.sceneNum) || cleanLocationPlates[0];

    const zaraOutfits: Record<number, string> = {
      1: 'Casual ribbed navy tank top, layered delicate silver chain necklaces, relaxed faded blue denim',
      2: 'Cream oversized chunky-knit sweater, olive linen lounge pants, delicate gold pendant necklace',
      3: 'Heather grey fitted athletic crewneck, high-waisted black leggings, hair in high ponytail',
      4: 'Sage green linen button-up shirt with rolled cuffs, white relaxed shorts, tortoiseshell hair clip',
      5: 'Terracotta oversized graphic hoodie, distressed light-wash boyfriend jeans, messy hair bun',
      6: 'Pastel lilac ribbed knit cardigan over white scoop-neck tank top, relaxed stone chinos',
      7: 'Warm mustard yellow relaxed flannel shirt, dark raw denim, leather wristband',
    };
    const currentZaraOutfit = zaraOutfits[((dayNum - 1) % 7) + 1] || zaraOutfits[1];

    const joeCollars: Record<number, string> = {
      1: 'distressed brown leather collar with round brass tag "JOE"',
      2: 'midnight-black velvet collar with small polished silver bell',
      3: 'royal navy braided leather collar with silver fish tag engraved "JOE"',
    };
    const currentJoeCollar = joeCollars[((dayNum - 1) % 3) + 1] || joeCollars[1];

    const novaBowties: Record<number, string> = {
      1: 'scarlet-red satin bowtie collar',
      2: 'classic Scottish tartan plaid bowtie with brass buckle',
      3: 'mustard-gold satin bowtie secured around fluffy neck',
    };
    const currentNovaBowtie = novaBowties[((dayNum - 1) % 3) + 1] || novaBowties[1];

    const wardrobeText = d.speaker === 'Zara'
      ? `Zara: ${currentZaraOutfit}`
      : (d.speaker === 'Joe' ? `Joe: ${currentJoeCollar}` : `Nova: ${currentNovaBowtie}`);

    const omniFlash11Prompt = buildOmniFlash11Directive({
      cameraFramingAndMotion: idx % 2 === 0
        ? 'Low-angle dog/cat eye-level camera pushing in gently, ground-level cinematic tracking'
        : 'Reverse angle close-up at floor height, shallow depth of field f/1.8, 85mm macro lens',
      lensAndStyle: `${spec.visualStyle || 'Hyper-Realistic Pet Cinema'}, shallow depth of field f/1.8, 4K film still`,
      lightingTheme: sceneDef.lightingTheme,
      locationName: sceneDef.locationName,
      speakerName: d.speaker,
      counterpartName,
      wardrobe: wardrobeText,
      eyelineDirective: eyelineRule.facingDirective,
      actionAndMicroExpression: `${d.action}. Expressive mouth lip-sync synchronized to spoken dialogue, natural animal micro-expressions, whiskers/ears alert. Zero camera glance.`,
      dialogue: d.dialogue,
      foleyAndAudio: d.foley,
      clipIndex: idx + 1,
      totalClips: dayBeats.length,
      sceneName: `${sceneDef.sceneName.split(':')[0]} - Clip ${idx + 1}`,
    });

    const timeline = generateSecBySecTimeline(
      d.speaker,
      ['Joe', 'Nova', 'Zara'].filter((n) => n !== d.speaker),
      d.dialogue,
      d.action,
      d.foley,
      `Sitting in designated scene blocking at ${sceneDef.locationName}.`,
      '1.0s comedic timing pause before punchline delivery.'
    );

    const frameImagePrompt = `[PET COMEDY KEYFRAME ${idx + 1}/${dayBeats.length} - ${sceneDef.sceneName.toUpperCase()}]:
[LOCATION MASTER ANCHOR]: ${matchingPlate.cleanPlatePrompt}
[PRIMARY SUBJECT]: Hyper-realistic photo of ${d.speaker} in ${sceneDef.locationName}. ${d.action}. ${eyelineRule.facingDirective}
[COUNTERPART REACTION]: ${eyelineRule.counterpartFacingDirective}
[MUTUAL GAZE LOCK]: ${eyelineRule.mutualGazeDirective}
[WARDROBE LOCK (EPISODE ${dayNum})]: ${wardrobeText}.
[LIGHTING & DEPTH]: ${sceneDef.lightingTheme}, shallow depth of field, 35mm film stock, 8k resolution, 9:16 vertical composition.`;

    const continuityRole: 'master_anchor' | 'reverse_angle_match' | 'culmination_match' =
      idx === 0 ? 'master_anchor' : (idx === 1 ? 'reverse_angle_match' : 'culmination_match');

    const continuityReferenceTag = idx === 0
      ? `🎯 MASTER PET ANCHOR (Sets Joe ${currentJoeCollar}, Nova ${currentNovaBowtie}, Zara outfit & room lighting)`
      : `🔄 CONTINUITY REVERSE ANGLE (Locked to Scene ${d.sceneNum} Clean Plate: --sref [KEYFRAME_1_URL] --sw 100)`;

    return {
      clipIndex: idx + 1,
      totalClips: dayBeats.length,
      sceneName: `${sceneDef.sceneName.split(':')[0]} - Clip ${idx + 1}`,
      sceneNumber: d.sceneNum,
      sceneLocation: sceneDef.locationName,
      eyelineDirection: d.eyeline,
      cleanPlateStartFramePrompt: matchingPlate.cleanPlatePrompt,
      omniFlash11Prompt,
      locationAnchor: sceneDef.locationName,
      masterKeyframeLock: `Scene ${d.sceneNum} Clean Plate of ${sceneDef.locationName}. ${eyelineRule.blockingText} Wardrobe: ${wardrobeText}. ${sceneDef.lightingTheme}.`,
      shotType: d.shotType,
      frameImagePrompt,
      speakerIsolation: {
        activeSpeaker: d.speaker,
        speakingDialogue: d.dialogue,
        silentCharacters: ['Joe', 'Nova', 'Zara'].filter((n) => n !== d.speaker),
        cameraCutApplied: true,
      },
      timeline,
      flowPromptText: omniFlash11Prompt,
      retentionHookReasoning: isLast
        ? 'Freeze-frame comedic punchline and sudden blackout cutoff guarantees high replay rate.'
        : 'Continuous scene momentum with seamless 180-degree match-cut to counterpart.',
      pacingWordCount: calculateWordCount(d.dialogue),
      sceneWardrobe: wardrobeText,
      requiresReferenceImageAttachment: true,
      foleySoundDesign: d.foley,
      negativePromptDirectives: 'looking at camera, staring into lens, wandering eyes, double speaking characters, cartoon 3d style, distorted paws, extra ears, missing collar, plastic fur, robotic voice, flickering lighting, deformed animal face.',
      continuityRole,
      continuityReferenceTag,
    };
  });

  // 4. Generate Dual Cross-Platform Metadata (YouTube SEO + Social)
  const dualMetadata = generateDualCrossPlatformPetMetadata({
    seriesTitle: spec.seriesTitle || 'Joe & Nova: The Household Syndicate',
    seasonNumber: spec.seasonNumber || 1,
    dayNum,
    episodeTitle: title,
    hook: hookDescription,
    scenes: sceneBeats,
  });

  // 5. Generate VIP Behind-The-Scenes Post
  const btsPost = generateVIPPetBehindTheScenesPost({
    dayNum,
    seriesTitle: spec.seriesTitle || 'Joe & Nova: The Household Syndicate',
    sceneLocation: sceneBeats[0]?.locationName || 'Cozy Traditional Living Room',
  });

  const inUniversePosts: InUniversePostBundle = {
    btsPost: {
      ...btsPost,
      metadata: dualMetadata.bts,
    },
    propPost: {
      title: `Ep ${dayNum} Forensic Evidence: The Empty Salmon Wrapper`,
      imagePrompt: `Macro close-up forensic photograph of an empty silver foil salmon treat bag with tiny feline claw punctures, resting on a white marble countertop in ${sceneBeats[0]?.locationName}. Warm natural sunlight, shallow depth of field, 8k resolution, professional still life photography.`,
      caption: `The evidence doesn't lie. Notice the tiny puncture marks at the corner... who has claws that sharp? 🔍😼`,
      hashtags: ['#PetForensics', '#PetComedy', '#FunnyCat', '#MysterySolved'],
      clueName: 'Empty Salmon Treat Bag with Claw Punctures',
    },
    candidPost: {
      title: `Ep ${dayNum} In-Character Mood: The Sunbeam Protector`,
      imagePrompt: `Cinematic 35mm portrait of grey British Shorthair cat Joe sitting majestically in a golden afternoon sunbeam on a polished herringbone hardwood floor, glowing orange eyes, dignified posture, soft background bokeh. 4k resolution, 9:16 vertical composition.`,
      caption: `“I don't start the chaos. I merely manage the consequences.” Ep ${dayNum} streaming now. 🐾`,
      hashtags: ['#CatMood', '#BritishShorthair', '#CatLovers', '#PetComedy'],
      moodDescription: 'Imperial feline dignity and sunny contentment',
    },
  };

  const sceneContinuityLock: SceneContinuityLock = {
    masterKeyframeIndex: 1,
    timeOfDay: 'Morning to late golden hour',
    lightingSetup: 'Warm golden hour sunlight streaming through sheer floral curtains, lit fireplace mantel glow, soft bay window fill',
    roomGeography: '3-scene home: Sunlit modern farmhouse kitchen, cozy traditional living room with fireplace, sun-drenched hallway patio doors',
    wardrobeLocks: [
      { characterName: 'Zara', exactOutfit: 'Casual navy ribbed tank top, layered silver necklaces' },
      { characterName: 'Joe', exactOutfit: 'Distressed brown leather collar with round brass tag "JOE"' },
      { characterName: 'Nova', exactOutfit: 'Scarlet-red bowtie collar' },
    ],
    midjourneyContinuityRecipe: '--sref [KEYFRAME_1_URL] --sw 100 --ar 9:16',
  };

  return {
    title,
    hookDescription,
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
        locationName: 'Sunlit Modern Farmhouse Kitchen Island',
        anchorPrompt: sceneBeats[0].cleanPlatePrompt,
      },
      {
        locationName: 'Cozy Traditional Living Room with Fireplace',
        anchorPrompt: sceneBeats[1].cleanPlatePrompt,
      },
      {
        locationName: 'Sun-Drenched Hallway Opening into Patio',
        anchorPrompt: sceneBeats[2].cleanPlatePrompt,
      },
    ],
    cleanLocationPlates,
    dualMetadata,
    inUniversePosts,
    dialogueScript: dayBeats.map((c, idx) => ({
      speaker: c.speaker,
      line: c.dialogue,
      timing: `Clip ${idx + 1}/${dayBeats.length} (${(idx * 10).toString().padStart(2, '0')}s - ${((idx + 1) * 10).toString().padStart(2, '0')}s)`,
    })),
    sceneContinuityLock,
  };
}
