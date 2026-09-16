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

export function generateDailyPhotoPosts(
  persona: CastMember | undefined,
  dayNum: number,
  dayName: string,
  dailyEmotion: string
): DailyPhotoPost[] {
  const theme = DAILY_PHOTO_THEMES[(dayNum - 1) % DAILY_PHOTO_THEMES.length];
  const charName = persona?.name || 'Elena';

  return [
    // PHOTO 1: Café Window Candid
    {
      id: `day-${dayNum}-photo-1-cafe`,
      category: 'Cafe Candid',
      title: 'Morning Window Reflection',
      outfit: theme.cafeOutfit,
      caption: `Morning thoughts hit differently with quiet rain and a warm flat white. Reminding myself today that peace is a practice, not an accident. ☕️✨`,
      hashtags: ['#MorningRoutine', '#LondonCafe', '#MindsetShift', '#SlowLiving', '#UKCreator', '#CoffeeAesthetic'],
      imagePrompt: `Candid unposed iPhone photo of a 24-year-old woman seated by a window in a ${theme.cafeLocation}. Head held straight at a natural angle, looking away toward the street with a gentle contemplative half-smile, brunette hair in an effortless messy low bun with soft loose strands framing face, green eyes with natural window catchlight, distinct signature cheek beauty mole on upper cheekbone. Wearing ${theme.cafeOutfit}. Holding a ceramic cup of coffee with both hands. Soft diffused overcast natural daylight from window, warm wooden textures in soft bokeh, authentic UGC aesthetic, natural skin texture with visible micro-pores and slight natural sheen, no beauty filter, no plastic skin smoothing, shot on 35mm f/1.8 lens, warm Kodak Portra film tones. [IDENTITY]: Lock 100% to uploaded master reference image.`,
    },

    // PHOTO 2: Mirror Selfie OOTD
    {
      id: `day-${dayNum}-photo-2-mirror`,
      category: 'Mirror OOTD',
      title: 'Aesthetic Mirror OOTD',
      outfit: theme.mirrorOutfit,
      caption: `Uniform for a productive ${dayName}. Simple, comfortable, and grounded. How’s your week feeling so far? 🤍`,
      hashtags: ['#OOTD', '#MinimalistStyle', '#NeutralAesthetic', '#CapsuleWardrobe', '#DailyLook'],
      imagePrompt: `Aesthetic casual mirror selfie taken in a sunlit minimalist modern apartment bedroom. Full-length arched gold mirror, subject holding an iPhone with matte case partially covering torso, natural relaxed posture, head straight with subtle candid tilt, effortless brunette hair falling naturally over shoulders, distinct signature cheek beauty mole visible on cheekbone. Wearing ${theme.mirrorOutfit}. Warm afternoon sunlight streaming through sheer curtains, soft room shadows, unposed authentic influencer aesthetic, real skin texture with visible pores, slight natural grain, candid lifestyle photo. [IDENTITY]: Lock 100% to uploaded master reference image.`,
    },

    // PHOTO 3: Golden Hour Street Walk
    {
      id: `day-${dayNum}-photo-3-street`,
      category: 'Golden Hour Street',
      title: 'Golden Hour Street Candid',
      outfit: theme.streetOutfit,
      caption: `The golden hour light in the city this evening was something else. Catching my breath between meetings. 🌇✨`,
      hashtags: ['#GoldenHour', '#CityWalks', '#LondonVibes', '#StreetStyle', '#AestheticMoments'],
      imagePrompt: `Candid medium full-body street photograph of a 24-year-old brunette woman walking along a quiet European cobblestone street lined with brick townhouses. Natural candid mid-stride motion, gentle breeze catching her brunette hair, looking down with a relaxed authentic expression, distinct signature cheek beauty mole on cheekbone. Wearing ${theme.streetOutfit}. Warm 5 PM golden hour sunbeams slicing through buildings, creating a radiant golden rim light on her hair and shoulders, cinematic shallow depth of field, real candid street photography style, natural unedited skin texture, 50mm f/2.0 lens look, authentic filmic warmth. [IDENTITY]: Lock 100% to uploaded master reference image.`,
    },

    // PHOTO 4: Desk / Study BTS Flatlay
    {
      id: `day-${dayNum}-photo-4-desk`,
      category: 'Desk / BTS Flatlay',
      title: 'Podcast Prep & Workspace Moment',
      outfit: theme.deskOutfit,
      caption: `Scripting tomorrow’s podcast episode. Some hard truths in this one that took me months to admit to myself. Stay tuned. 🎙️📓`,
      hashtags: ['#BehindTheScenes', '#PodcastLife', '#CreatorMindset', '#WorkspaceAesthetic', '#RealTalk'],
      imagePrompt: `Authentic lifestyle photograph of a 24-year-old woman seated at a clean minimalist wooden desk. Brunette hair in a casual claw clip, green eyes, distinct signature cheek beauty mole on cheekbone. Wearing ${theme.deskOutfit}. Open paper notebook with handwritten cursive notes and a silver laptop on desk, Shure SM7B studio microphone visible in soft background corner, warm ambient brass desk lamp illuminating the scene. Subject is looking down thoughtfully pen in hand, candid authentic creator moment, warm moody aesthetic, real skin texture with visible micro-pores, no AI-smoothing, authentic 35mm photograph. [IDENTITY]: Lock 100% to uploaded master reference image.`,
    },
  ];
}
