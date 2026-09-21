import { DailyPhotoPost, CastMember } from '@/types';

interface PhotoThemeConfig {
  cafeLocation: string;
  cafeOutfit: string;
  mirrorOutfit: string;
  streetOutfit: string;
  deskOutfit: string;
}

// 7-Day distinct wardrobe and location rotation for Daily Photos (all keep signature jewelry locked)
const DAILY_PHOTO_THEMES: PhotoThemeConfig[] = [
  // Day 1 (Monday)
  {
    cafeLocation: 'Cozy artisan coffee shop with exposed brick and rain-streaked window',
    cafeOutfit: 'oversized ribbed oatmeal knit sweater, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'vintage high-waisted denim jeans, fitted cream ribbed long sleeve top, delicate layered gold necklace',
    streetOutfit: 'charcoal wool trench coat over black turtleneck, tailored trousers, delicate gold layered necklace',
    deskOutfit: 'casual relaxed olive linen shirt over white tank top, delicate layered gold necklace, small stud earrings',
  },
  // Day 2 (Tuesday)
  {
    cafeLocation: 'Sunlit Parisian-style corner café with marble bistro table and wicker chairs',
    cafeOutfit: 'soft sage green cashmere knit pullover, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'relaxed beige linen trousers, cropped white knit tee, delicate layered gold necklace',
    streetOutfit: 'camel tailored overcoat, off-white ribbed scarf, dark denim, delicate layered gold necklace',
    deskOutfit: 'oversized dark heather grey college crewneck, delicate layered gold necklace, messy bun',
  },
  // Day 3 (Wednesday)
  {
    cafeLocation: 'Minimalist boutique café with Scandinavian blonde wood and warm pendant lighting',
    cafeOutfit: 'espresso brown soft knit polo, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'pleated charcoal trousers, fitted black boatneck top, delicate layered gold necklace',
    streetOutfit: 'oversized vintage leather bomber jacket, straight-leg denim, white sneakers, layered gold necklace',
    deskOutfit: 'cozy cream cable-knit cardigan, layered gold necklace, studio headphones around neck',
  },
  // Day 4 (Thursday)
  {
    cafeLocation: 'Charming London bookstore café with vintage bookshelves in background',
    cafeOutfit: 'deep burgundy crewneck sweater, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'silk beige slip skirt, chunky cream knit sweater half-tucked, layered gold necklace',
    streetOutfit: 'classic houndstooth wool blazer, black turtleneck, layered gold necklace, leather shoulder bag',
    deskOutfit: 'relaxed slate blue button-up shirt, layered gold necklace, silver laptop in front',
  },
  // Day 5 (Friday)
  {
    cafeLocation: 'Modern rooftop café with panoramic city skyline view in soft morning haze',
    cafeOutfit: 'chunky ivory waffle-knit sweater, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'wide-leg washed black jeans, fitted espresso tank top, delicate layered gold necklace',
    streetOutfit: 'belted wool camel coat, dark sunglasses pushed up on head, layered gold necklace',
    deskOutfit: 'cozy oversized mocha knit pullover, delicate layered gold necklace, warm ceramic mug',
  },
  // Day 6 (Saturday)
  {
    cafeLocation: 'Bustling weekend brunch spot with green potted plants and natural skylight',
    cafeOutfit: 'soft lavender-grey wool knit sweater, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'weekend casual vintage Levi denim shorts with oversized knit cardigan, layered gold necklace',
    streetOutfit: 'relaxed shearling-lined aviator jacket, warm knit beanie, layered gold necklace',
    deskOutfit: 'casual grey heather loungewear set, layered gold necklace, weekend planner open',
  },
  // Day 7 (Sunday)
  {
    cafeLocation: 'Quiet Sunday morning bakery café with warm pastry display in soft background',
    cafeOutfit: 'ultra-soft cream cashmere turtleneck, delicate layered gold necklace, small stud earrings',
    mirrorOutfit: 'relaxed Sunday morning cream loungewear trousers, soft ribbed camisole, layered gold necklace',
    streetOutfit: 'olive green quilted jacket, cream knit scarf, tailored trousers, layered gold necklace',
    deskOutfit: 'oversized chunky knit sweater in dusty taupe, layered gold necklace, Sunday reflection journal',
  },
];

// 7-Day In-Universe BTS & Forensic Clue Themes for Character Drama
interface DramaPhotoTheme {
  btsSetDescription: string;
  propName: string;
  propDescription: string;
  candidLocation: string;
  deskClapper: string;
}

const DRAMA_DAILY_PHOTO_THEMES: Record<number, DramaPhotoTheme> = {
  1: {
    btsSetDescription: 'sitting in the corner of the dimly lit luxury penthouse study reviewing a highlighted paper script between takes, with a professional matte-black ARRI cinema camera rig and boom mic visible in soft-focus foreground',
    propName: '40% Forged Share Trust Certificates & Montblanc Pen',
    propDescription: 'official embossed stock transfer certificates dated 02:14 AM spread across dark mahogany desk, open Montblanc fountain pen resting near contested signature line, soft Venetian blind shadows cutting across official corporate wax seal',
    candidLocation: 'standing on the rain-streaked glass balcony of the luxury penthouse overlooking foggy nocturnal skyscraper lights, slate-gray tie loosened, holding an amber crystal tumbler in hand',
    deskClapper: 'SCENE 1A - THE FORGED WILL - TAKE 4',
  },
  2: {
    btsSetDescription: 'listening attentively to director blocking notes near dark oak archival filing cabinets, with C-stand lighting and soft amber LED panel visible in the background',
    propName: 'Brushed-Metal Encrypted SSD & Zurich Routing Wire',
    propDescription: 'brushed-metal encrypted external SSD drive resting next to a folded Zurich bank wire transfer routing sheet for $50,000,000, faint pulsing green LED indicator light on metallic desk',
    candidLocation: 'standing in front of floor-to-ceiling dark oak bookshelves lined with confidential leather-bound ledgers, fingers lightly grazing the spine of an antique book under cool chiaroscuro lighting',
    deskClapper: 'SCENE 2B - THE ERASED DRIVE - TAKE 2',
  },
  3: {
    btsSetDescription: 'rehearsing line delivery on the living salon set while sound technician adjusts boom microphone overhead, warm practical lamps glowing in background',
    propName: 'Titanium Audio Recorder with Glowing Frequency Bars',
    propDescription: 'sleek titanium voice recorder resting on glass coffee table with illuminated amber digital frequency bars and encrypted memory card, faint audio waveforms visible on screen',
    candidLocation: 'seated deep in a vintage chesterfield leather armchair in the salon corner, looking thoughtfully through rain-soaked floor-to-ceiling glass into the nocturnal city',
    deskClapper: 'SCENE 3C - THE AUDIO TAPE - TAKE 3',
  },
  4: {
    btsSetDescription: 'checking monitor playback with the cinematographer near the steel vault security gates, soft atmospheric mist and cool blue rim lighting cutting through the corridor',
    propName: 'Cold-Storage Flash Drive & Bribe Ledger Extract',
    propDescription: 'military-grade brushed-metal flash drive with etched serial numbers resting on an illuminated steel control panel beside a printed list of regulatory transactions',
    candidLocation: 'leaning against polished dark granite elevator foyer, checking tactical building timecard under cold blue architectural recessed lighting',
    deskClapper: 'SCENE 4D - MIDNIGHT EXCHANGE - TAKE 1',
  },
  5: {
    btsSetDescription: 'waiting for camera repositioning while costume stylist straightens coat collar, camera dolly track visible on the polished marble floor',
    propName: 'Shattered Biometric Card & Safety Box 409 Lock',
    propDescription: 'shattered biometric security clearance card from Safety Deposit Box 409 with hairline fractures and exposed microchip, resting near an electronic drill-bypass tool',
    candidLocation: 'walking through the vaulted safe deposit corridor with polished brass locker doors receding into deep cinematic perspective',
    deskClapper: 'SCENE 5B - BOX 409 - TAKE 2',
  },
  6: {
    btsSetDescription: 'reviewing the rapid dialogue beat with director, script pages held in hand, flashing emergency light rig reflecting off studio baffles',
    propName: 'Active Wiretap Smartphone with Audio Waveform',
    propDescription: 'black luxury smartphone on glass desk showing active green call screen labeled Federal Prosecutor - 47:12 with real-time pulsing audio frequency graph',
    candidLocation: 'standing by high-rise executive window as blue and red emergency light reflections paint the ceiling and dark blinds in rhythmic pulses',
    deskClapper: 'SCENE 6A - WIRETAP STANDOFF - TAKE 5',
  },
  7: {
    btsSetDescription: 'getting final audio checks on the grand season finale set, artificial rain misting the glass walls, director holding clapperboard for the final confrontation take',
    propName: 'Antique Analog Rotary Phone with Coiled Copper Cord',
    propDescription: 'antique heavy black analog rotary telephone on mahogany side table, receiver slightly lifted with mechanical clatter, warm amber desk lamp casting long noir shadows',
    candidLocation: 'staring into the darkness of the service tunnel staircase illuminated only by emergency red exit lighting and rising steam',
    deskClapper: 'SEASON 1 FINALE - ARTHUR VANCE RETURNS - TAKE 7',
  },
};

export function generateDailyPhotoPosts(
  persona: CastMember | undefined,
  dayNum: number,
  dayName: string,
  dailyEmotion: string,
  format: string = 'character_drama',
  location: string = 'Penthouse Study at Night',
  allCast?: CastMember[]
): DailyPhotoPost[] {
  const char1 = persona || allCast?.[0] || { name: 'Julian Vance', role: 'Hero' };
  const char2 = allCast?.[1] || { name: 'Elena Sterling', role: 'Villain' };
  const charName = char1.name;
  const coStarName = char2.name;

  // If Hollywood Noir / Character Drama: Generate Authentic Real-Star On-Set BTS Photos
  if (format === 'character_drama') {
    const dramaTheme = DRAMA_DAILY_PHOTO_THEMES[dayNum] || DRAMA_DAILY_PHOTO_THEMES[1];

    return [
      // POST 1: Actor Vanity Trailer / Hair & Makeup Check (Real Star Mirror Candid)
      {
        id: `day-${dayNum}-photo-1-trailer`,
        category: 'Film Set BTS',
        title: `Day ${dayNum} Actor Trailer: Hair & Makeup Touch-Up`,
        outfit: 'charcoal tailored trousers, crisp white dress shirt with loosened top button, hair clips holding front parted hair',
        caption: `Touch-ups before the heavy standoff scenes today. ${charName} isn't ready for what ${coStarName} does in Episode ${dayNum}. Script notes reviewed, iced americano in hand. Let's make cinema. 🎬☕️ #BehindTheScenes #ActorLife #OnSet #TrailerLife #NetflixSeries`,
        hashtags: ['#BehindTheScenes', '#ActorLife', '#OnSet', '#TrailerVibes', '#NetflixNoir', '#FilmMaking'],
        imagePrompt: `Ultra-authentic celebrity film actor behind-the-scenes photograph: Original fictional character ${charName} (distinct non-celebrity digital human actor) seated in a brightly lit hair-and-makeup trailer chair in front of a wide mirror lined with warm glowing incandescent Hollywood bulbs. A professional set hairstylist is gently adjusting hair with styling clips. On the vanity counter rests a personalized takeaway coffee cup labeled '${charName}', an open highlighted episode script binder, and makeup brushes in acrylic cups. 35mm film still, warm flattering vanity mirror lighting, authentic candid Instagram star selfie aesthetic, natural skin texture, visible pores, no plastic smoothing, no real celebrities. [IDENTITY]: Lock to master reference character image.`,
      },

      // POST 2: Breaking Character with Co-Star (Laughing Outtake between Takes)
      {
        id: `day-${dayNum}-photo-2-costar`,
        category: 'Film Set BTS',
        title: `Day ${dayNum} Set Blooper: Breaking Character with ${coStarName}`,
        outfit: `Bespoke tailored suit / chic designer blazer, holding paper coffee cups`,
        caption: `We look like mortal enemies on screen, but between takes we cannot stop laughing. Rehearsing the confrontation beat for Episode ${dayNum} before the cameras started rolling. Episode drops tonight! 🥂😂 #Costars #Blooper #OnSetFun #BehindTheScenes #ActorsAtWork`,
        hashtags: ['#Costars', '#SetLife', '#OnSetHumor', '#BehindTheScenes', '#FilmmakingLife', '#ActorDuo'],
        imagePrompt: `Candid behind-the-scenes film set photograph: Original fictional character ${charName} and co-star original fictional character ${coStarName} (distinct non-celebrity digital humans) breaking character and laughing genuinely together between intense takes on the ${location} soundstage set. Both hold printed episode screenplay pages with highlighted yellow lines. In the soft-focus background, a matte-black ARRI cinema camera on a dolly track, boom microphone operator, and warm tungsten studio softboxes are visible. Authentic 35mm motion picture film still, candid laugh, genuine joyful expression, natural skin texture, no real celebrities. [IDENTITY]: Lock to master reference character images.`,
      },

      // POST 3: Director Village, Clapperboard Slate & ARRI Alexa Rig
      {
        id: `day-${dayNum}-photo-3-slate`,
        category: 'Forensic Prop Clue',
        title: `Production Slate & Clue: ${dramaTheme.deskClapper}`,
        outfit: 'N/A (Cinema Camera Village & Prop Evidence)',
        caption: `Rolling sound... and ACTION. Scene ${dayNum} locked. Also swipe to see the actual document ${charName} drops on the desk today. Notice the timestamp in the corner? 🔍📁 #Filmmaking #DirectorVillage #Cinematography #SetLife #MysteryClue`,
        hashtags: ['#Cinematography', '#ARRI', '#ProductionSlate', '#DirectorVillage', '#SetProps', '#MovieMagic'],
        imagePrompt: `Cinematic over-the-shoulder video village photograph: Looking over the shoulder of the camera operator holding an engraved wooden production slate clapperboard reading '${dramaTheme.deskClapper}'. In front of the camera, the professional SmallHD cinema monitor clearly displays a live high-contrast preview of ${charName} on the dark moody ${location} set. Beside the monitor rests the physical prop: ${dramaTheme.propDescription}. Moody chiaroscuro studio lighting, cool blue rim lights, anamorphic flare, authentic Hollywood film production atmosphere.`,
      },

      // POST 4: 3:30 AM Late-Night Wrap / Soundstage Exit Candid
      {
        id: `day-${dayNum}-photo-4-wrap`,
        category: 'Candid Set Lore',
        title: `3:30 AM Night Shoot Wrap: Leaving the Soundstage`,
        outfit: 'dark wool trench coat over comfortable clothing, holding leather script portfolio',
        caption: `3:30 AM wrap on Day ${dayNum}. Night shoots are brutal on the voice and mind, but watching this story come alive makes every sleepless hour worth it. See you all for tomorrow's continuation. 🌙🎬✨ #NightShoot #SetWrap #FilmmakerLife #ActorJourney #LateNightCinema`,
        hashtags: ['#NightShoot', '#Wrapped', '#SetLife', '#CinemaNight', '#LateNightVibes', '#ActorLife'],
        imagePrompt: `Moody candid nighttime photograph: Original fictional character ${charName} (distinct non-celebrity digital human actor) exiting through the heavy steel double doors of a major film studio soundstage into the misty nocturnal studio backlot. Wearing a stylish dark wool trench coat, holding a leather script portfolio and a steaming thermos. Studio red exit indicator lights and wet asphalt reflecting warm amber backlot streetlamps. 35mm candid street film photography, authentic midnight wrap aesthetic, natural skin texture, atmospheric cinematic mist. [IDENTITY]: Lock to master reference character image.`,
      },
    ];
  }

  // If Pet Comedy: Generate Authentic Hilarious Pet Photo Posts (Barnaby, Sir Reginald & Zara)
  if (format === 'pet_comedy') {
    const dogName = allCast?.find((c) => c.name.toLowerCase().includes('dog') || c.name.toLowerCase().includes('barnaby') || c.name.toLowerCase().includes('corgi'))?.name || 'Barnaby (Golden Retriever)';
    const catName = allCast?.find((c) => c.name.toLowerCase().includes('cat') || c.name.toLowerCase().includes('reginald') || c.name.toLowerCase().includes('persian'))?.name || 'Sir Reginald (Persian Cat)';
    const ownerName = allCast?.find((c) => c.name.toLowerCase().includes('zara') || c.role === 'Side')?.name || 'Zara';

    return [
      {
        id: `day-${dayNum}-photo-1-guilty`,
        category: 'Goofy Pet Candid',
        title: `Guilty Face Confession: ${dogName}`,
        outfit: 'Fluffy golden retriever coat, floppy ears pinned back, big round apologetic eyes',
        caption: `Look into those eyes and tell me he didn't orchestrate the whole thing. The chewed evidence was right beside him on the rug, but he claims total innocence. 🐶😂 #GuiltyDog #GoldenRetrieverLife #PetComedy #CaughtRedHanded #DogHumor`,
        hashtags: ['#GuiltyDog', '#GoldenRetriever', '#PetComedy', '#DogMemes', '#FunnyPets', '#DogLovers'],
        imagePrompt: `Hilarious candid pet photography: Master keyframe photo of ${dogName} sitting on a lived-in living room hardwood floor with an undeniably guilty facial expression, ears pinned back, big round amber eyes looking sideways. Beside him lies an overturned dog chew toy. Ultra-realistic dog fur texture, wet nose reflections, warm natural morning sunlight streaming from living room window. 85mm portrait lens, f/2.0, photorealistic 8K film still, authentic pet photography.`,
      },
      {
        id: `day-${dayNum}-photo-2-aristocrat`,
        category: 'Goofy Pet Candid',
        title: `Aristocratic Disdain: ${catName}`,
        outfit: 'Lush pristine fluffy coat, flat squished face, supreme judgmental gaze',
        caption: `He has reviewed today's schedule and found it entirely beneath him. Not a single nap will be compromised. 🐱👑 #CatLogic #PersianCat #AristocraticFeline #JudgingYou #CatComedy`,
        hashtags: ['#CatLogic', '#PersianCat', '#GrumpyCatVibes', '#CatHumor', '#AristocraticPet', '#ViralCats'],
        imagePrompt: `Cinematic macro pet portrait: Master keyframe photo of ${catName} perched majestically atop the backrest of a luxury velvet armchair. Extreme judgmental and unamused facial expression, piercing copper-amber eyes staring directly into camera, pristine fluffy white/cream fur with photorealistic individual whisker detail. Warm ambient living room light, shallow depth of field, 8K ultra-detailed animal photography.`,
      },
      {
        id: `day-${dayNum}-photo-3-standoff`,
        category: 'Pet Comedy Standoff',
        title: `The Living Room Sofa Standoff`,
        outfit: 'Both pets positioned on opposite ends of the cozy sofa',
        caption: `Two kings, one couch cushion. Neither is willing to blink. Episode ${dayNum} drops tonight and the peace treaty is already expired! 😂🛋️🐾 #PetStandoff #CatVsDog #SiblingRivalry #PetWars #LivingRoomChaos`,
        hashtags: ['#PetStandoff', '#CatVsDog', '#FunnyPets', '#AnimalComedy', '#CouchWars', '#ViralShorts'],
        imagePrompt: `Wide cinematic living room candid: ${dogName} and ${catName} occupying opposite ends of a large comfortable fabric sofa in a cozy sunlit apartment. High-tension comedic stare-down, dog frozen with tail wagging cautiously, cat puffed up with narrowed eyes. Warm lived-in apartment aesthetic, authentic pet interaction, sharp focus across both animals, natural room lighting, 35mm film still.`,
      },
      {
        id: `day-${dayNum}-photo-4-parent-bts`,
        category: 'Pet Parent BTS',
        title: `Pet Parent Reality: ${ownerName}'s Failed Group Selfie`,
        outfit: 'Casual oversized loungewear and denim, holding phone high for selfie',
        caption: `All I wanted was ONE nice photo where everyone looks at the camera at the same time. This is Take 47. 🤦‍♀️🐾❤️ #PetParentLife #BehindTheScenes #ChaosCrew #NeverWorkingWithPets #DailyLife`,
        hashtags: ['#PetParent', '#PetMom', '#FailedSelfie', '#BehindTheScenes', '#LifeWithPets', '#DogAndCat'],
        imagePrompt: `Candid selfie-style behind-the-scenes photograph: Original fictional character ${ownerName} attempting a front-facing selfie in her living room, smiling exasperatedly while ${dogName} tries to lick her cheek and ${catName} completely turns his back to the camera in contempt. Authentic UGC Instagram aesthetic, natural indoor lighting, motion blur on dog's tail, 100% realistic animal and human skin textures, no real celebrities.`,
      },
    ];
  }

  // Fallback: Default Lifestyle Photos for Non-Drama Formats
  const theme = DAILY_PHOTO_THEMES[(dayNum - 1) % DAILY_PHOTO_THEMES.length];
  return [
    {
      id: `day-${dayNum}-photo-1-cafe`,
      category: 'Cafe Candid',
      title: 'Morning Window Reflection',
      outfit: theme.cafeOutfit,
      caption: `Morning thoughts hit differently with quiet rain and a warm flat white. Reminding myself today that peace is a practice, not an accident. ☕️✨`,
      hashtags: ['#MorningRoutine', '#LondonCafe', '#MindsetShift', '#SlowLiving', '#CoffeeAesthetic'],
      imagePrompt: `Candid unposed photo of an original fictional woman seated by a window in a ${theme.cafeLocation}. Natural candid expression, distinct non-celebrity digital human, wearing ${theme.cafeOutfit}. Holding a ceramic cup of coffee with both hands. Soft diffused overcast daylight, authentic UGC aesthetic, 35mm f/1.8 lens, Kodak Portra film tones. No real celebrities.`,
    },
    {
      id: `day-${dayNum}-photo-2-mirror`,
      category: 'Mirror OOTD',
      title: 'Aesthetic Mirror OOTD',
      outfit: theme.mirrorOutfit,
      caption: `Uniform for a productive ${dayName}. Simple, comfortable, and grounded. How’s your week feeling so far? 🤍`,
      hashtags: ['#OOTD', '#MinimalistStyle', '#NeutralAesthetic', '#CapsuleWardrobe', '#DailyLook'],
      imagePrompt: `Aesthetic casual mirror selfie taken in a sunlit minimalist apartment. Original fictional digital character holding a smartphone, wearing ${theme.mirrorOutfit}. Warm afternoon sunlight, candid lifestyle photo. No real celebrities.`,
    },
    {
      id: `day-${dayNum}-photo-3-street`,
      category: 'Golden Hour Street',
      title: 'Golden Hour Street Candid',
      outfit: theme.streetOutfit,
      caption: `The golden hour light in the city this evening was something else. Catching my breath between meetings. 🌇✨`,
      hashtags: ['#GoldenHour', '#CityWalks', '#StreetStyle', '#AestheticMoments'],
      imagePrompt: `Candid medium full-body street photograph of an original fictional woman walking along a quiet European cobblestone street. Wearing ${theme.streetOutfit}. Warm golden hour rim light, 50mm lens, authentic filmic warmth. No real celebrities.`,
    },
    {
      id: `day-${dayNum}-photo-4-desk`,
      category: 'Desk / BTS Flatlay',
      title: 'Workspace & Prep Moment',
      outfit: theme.deskOutfit,
      caption: `Scripting tomorrow’s episode. Some hard truths in this one. Stay tuned. 🎙️📓`,
      hashtags: ['#BehindTheScenes', '#CreatorMindset', '#WorkspaceAesthetic'],
      imagePrompt: `Authentic lifestyle photograph of an original fictional creator seated at a clean wooden desk with open notebook and silver laptop, warm desk lamp. No real celebrities.`,
    },
  ];
}
