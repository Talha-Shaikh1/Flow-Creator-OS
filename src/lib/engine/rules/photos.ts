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
  location: string = 'Penthouse Study at Night'
): DailyPhotoPost[] {
  const charName = persona?.name || 'Julian Vance';
  const role = persona?.role || 'Hero';

  // If Hollywood Noir / Character Drama: Generate Film Set BTS, Forensic Props & Candid Set Lore!
  if (format === 'character_drama') {
    const dramaTheme = DRAMA_DAILY_PHOTO_THEMES[dayNum] || DRAMA_DAILY_PHOTO_THEMES[1];

    return [
      // POST 1: On-Set Film Production Behind-The-Scenes (BTS)
      {
        id: `day-${dayNum}-photo-1-bts`,
        category: 'Film Set BTS',
        title: `Day ${dayNum} Set BTS: Rehearsal & Camera Rig`,
        outfit: 'charcoal bespoke wool suit, slate-gray tie, white crisp collar',
        caption: `Between takes on today's ${location} scene. The tension in this episode was palpable even when the cameras stopped rolling. What do you think is in that sealed file? 🎬🎬 #BehindTheScenes #NetflixNoir #FlowCreatorOS #FilmMaking #Cinematography`,
        hashtags: ['#BehindTheScenes', '#OnSet', '#NetflixNoir', '#FilmMaking', '#ShortDrama', '#AIcinema'],
        imagePrompt: `Film set behind-the-scenes production photograph: Original fictional character ${charName} (distinct non-celebrity digital human actor) ${dramaTheme.btsSetDescription}. Authentic soundstage ambiance, professional cinema production equipment, warm tungsten studio softboxes, subtle atmospheric haze, 35mm motion picture film still, natural candid film crew aesthetic, no real celebrities, no public figures. [IDENTITY]: Lock to master reference character image.`,
      },

      // POST 2: Forensic Prop Evidence & Clue Teaser
      {
        id: `day-${dayNum}-photo-2-prop`,
        category: 'Forensic Prop Clue',
        title: `Forensic Clue: ${dramaTheme.propName}`,
        outfit: 'N/A (Tactile Prop Macro)',
        caption: `Forensic Evidence File #${dayNum}0${dayNum}: ${dramaTheme.propName}. Look closely at the details... who authorized this? Drop your theories below. 🕵️‍♂️🔍 #ForensicEvidence #CrimeThriller #PlotTwist #MysterySeries #DetectiveVibes`,
        hashtags: ['#ForensicFiles', '#MysteryClue', '#CrimeThriller', '#PlotTwist', '#DetectiveWork', '#StoryLore'],
        imagePrompt: `Cinematic macro flat-lay photograph: ${dramaTheme.propDescription}. High tactile texture, crisp 8K macro lens focus, moody chiaroscuro lighting, deep Venetian blind shadows, dramatic mystery film prop still, authentic legal-thriller documentation aesthetic. No violence, no weapons, no gore, clean analytical crime mystery prop.`,
      },

      // POST 3: Candid In-Universe Set Corner Lore
      {
        id: `day-${dayNum}-photo-3-candid`,
        category: 'Candid Set Lore',
        title: `In-Universe Lore: ${location} Alternate Angle`,
        outfit: 'tailored bespoke waistcoat, loosened silk tie, crisp spread collar',
        caption: `In this business, silence is either your greatest weapon or your death sentence. Day ${dayNum} episode is now streaming. 🥃 #CorporateThriller #CharacterLore #CinematicSeries #NoirAesthetic`,
        hashtags: ['#CharacterLore', '#CorporateNoir', '#NoirVibes', '#DramaticSeries', '#Storytelling'],
        imagePrompt: `Cinematic in-universe portrait: Original fictional character ${charName} (distinct non-celebrity digital human) ${dramaTheme.candidLocation}. Anamorphic lens flare from nocturnal city lights, moody chiaroscuro rim lighting on cheekbones, cool cyan and warm amber color palette, 4K film still, authentic Netflix Noir aesthetic, no real celebrities, no famous people. [IDENTITY]: Lock to master reference character image.`,
      },

      // POST 4: Director's Monitor & Clapperboard Flatlay
      {
        id: `day-${dayNum}-photo-4-desk`,
        category: 'Desk / BTS Flatlay',
        title: `Director's Monitor: ${dramaTheme.deskClapper}`,
        outfit: 'N/A (Director Village Setup)',
        caption: `Wrapped scene ${dayNum} at 3:00 AM. The cast delivered something truly chilling today. Get ready for tomorrow's continuation. 🎥✨ #DirectorsCut #ProductionLife #FilmSet #IndieFilm`,
        hashtags: ['#DirectorsCut', '#FilmmakerLife', '#IndieCreator', '#FilmProduction', '#CinematicArt'],
        imagePrompt: `High-end film director video village flatlay: A professional SmallHD cinema monitor displaying the last shot of ${charName} on set, an engraved wooden production clapperboard reading '${dramaTheme.deskClapper}' resting next to a highlighted printed screenplay, Sennheiser studio headphones, and a steaming black coffee cup on dark wood table. Warm atmospheric studio practical lights in soft background bokeh. Authentic cinematic filmmaking aesthetic.`,
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
