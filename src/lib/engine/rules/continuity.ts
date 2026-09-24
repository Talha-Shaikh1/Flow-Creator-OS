import { StorySpec, CastMember } from '@/types';
import { DAILY_PODCAST_OUTFITS } from '../templates/podcast-style';

export interface WardrobeLockItem {
  characterName: string;
  role: string;
  exactOutfit: string;
  hairAndGrooming?: string;
  signatureProps?: string;
}

export interface EpisodeSceneContinuity {
  episodeTitle: string;
  format: string;
  timeOfDay: string;
  lightingSetup: string;
  roomGeography: string;
  wardrobeLocks: WardrobeLockItem[];
  colorPaletteGrade: string;
  masterAnchorPrompt: string;
  midjourneyContinuityRecipe: string;
}

export function resolveEpisodeContinuity(
  spec: StorySpec,
  dayNum: number = 1,
  episodeTitle: string = 'Current Episode',
  customFormat?: string
): EpisodeSceneContinuity {
  const format = customFormat || spec.format || 'character_drama';
  const location = spec.locationSettings?.[0] || 'Executive Corner Suite';
  const cast = spec.cast || [];
  const heroMember = cast.find((c) => c.role === 'Hero') || cast[0];
  const villainMember = cast.find((c) => c.role === 'Villain') || cast[1] || cast[0];

  const heroName = heroMember?.name || 'Lead Protagonist';
  const villainName = villainMember?.name || 'Antagonist';

  // 1. PODCAST STYLE / ELENA INFLUENCER
  if (format === 'podcast_style') {
    const dayOutfit = DAILY_PODCAST_OUTFITS[(dayNum - 1) % DAILY_PODCAST_OUTFITS.length] ||
      'off-shoulder dark charcoal ribbed knit sweater, gold layered necklace and small stud earrings';
    
    const wardrobeLocks: WardrobeLockItem[] = [
      {
        characterName: heroName,
        role: 'Podcast Host',
        exactOutfit: dayOutfit,
        hairAndGrooming: 'Soft natural waves, effortless UK/European styling, distinct cheek beauty mole, subtle natural makeup',
        signatureProps: 'Matte-black Shure SM7B dynamic microphone on low-profile boom arm positioned 4 inches from mouth',
      },
    ];

    return {
      episodeTitle,
      format,
      timeOfDay: 'Intimate evening podcast recording session',
      lightingSetup: 'Soft warm 3200K ring light from 45-degree front-left, amber warm practical lamp glow in background, f/1.8 shallow depth of field',
      roomGeography: 'Acoustic-treated studio, warm mahogany desk, blurred bookshelf and minimalist Scandinavian wall art in soft bokeh',
      wardrobeLocks,
      colorPaletteGrade: 'Warm moody filmic grade, slightly desaturated pastels, natural skin pore detail, zero AI waxy smoothing',
      masterAnchorPrompt: `[MASTER EPISODE ANCHOR]: Podcast studio, ${heroName} wearing ${dayOutfit}. Shure SM7B microphone. Soft warm ring light. Lock 100% across all clips.`,
      midjourneyContinuityRecipe: `--sref [KEYFRAME_1_URL] --sw 100 --cref [CHARACTER_REF_URL] --cw 100 --ar 9:16`,
    };
  }

  // 2. PET COMEDY (Joe the Cat, Nova the Corgi, Zara the Owner)
  if (format === 'pet_comedy') {
    const wardrobeLocks: WardrobeLockItem[] = [
      {
        characterName: 'Zara',
        role: 'Pet Parent',
        exactOutfit: 'Casual ribbed navy tank top, layered delicate silver chain necklaces, relaxed faded blue denim',
        hairAndGrooming: 'Wavy brunette hair tied in a loose relaxed low bun with soft strands framing face',
      },
      {
        characterName: 'Joe',
        role: 'British Shorthair Cat',
        exactOutfit: 'Plush solid blue-grey dense coat, simple distressed brown leather collar with polished brass round tag engraved "JOE"',
        hairAndGrooming: 'Round chubby face, vibrant copper-orange eyes with sharp pinpoint catchlight, pristine grooming',
      },
      {
        characterName: 'Nova',
        role: 'Corgi Dog',
        exactOutfit: 'Thick fluffy red-and-white double coat, vibrant scarlet-red satin bowtie secured neatly at collar',
        hairAndGrooming: 'Ears perked straight up, alert dark almond eyes, wet dark nose, clean white chest fur',
      },
    ];

    return {
      episodeTitle,
      format,
      timeOfDay: 'Warm late-afternoon golden hour',
      lightingSetup: 'Sunlight streaming through sheer floral curtains from left window, cozy amber glow from wood-burning fireplace on right mantel',
      roomGeography: 'Cozy living room: large cream sectional sofa, dark oak coffee table in center, parquet wood floor with woven tribal rug',
      wardrobeLocks,
      colorPaletteGrade: 'Warm golden hour cinematic film still, rich organic wood tones, natural animal fur texture, zero plastic smoothing',
      masterAnchorPrompt: `[MASTER EPISODE ANCHOR]: Traditional cozy living room. Zara in navy tank top, Joe in leather collar 'JOE', Nova in red bowtie. Golden fireplace light. Lock 100% across all clips.`,
      midjourneyContinuityRecipe: `--sref [KEYFRAME_1_URL] --sw 100 --ar 9:16`,
    };
  }

  // 3. OBJECT TALKING (Anthropomorphic Espresso Cup, etc.)
  if (format === 'object_talking') {
    const objectName = heroMember?.name || 'Coffee Cup';
    const wardrobeLocks: WardrobeLockItem[] = [
      {
        characterName: objectName,
        role: 'Hero Object',
        exactOutfit: 'Artisanal matte-black stoneware ceramic body with raw terracotta unglazed base rim and glossy obsidian interior glaze',
        signatureProps: 'Gentle vertical plume of aromatic coffee steam swirling steadily upward from rim',
      },
    ];

    return {
      episodeTitle,
      format,
      timeOfDay: 'Early morning 7:15 AM dawn light',
      lightingSetup: 'Low-angle morning sunlight grazing across countertop from camera-left, creating long warm shadows and crisp specular edge rim reflections on ceramic',
      roomGeography: 'Luxury modern kitchen: polished dark-veined Italian Carrara marble countertop, blurred copper goose-neck kettle and coffee grinder in soft bokeh backdrop',
      wardrobeLocks,
      colorPaletteGrade: 'ARRI Alexa 100mm macro prime, f/2.0 shallow focus, crisp tactile ceramic texture, steam motion blur, 8K UHD film still',
      masterAnchorPrompt: `[MASTER EPISODE ANCHOR]: ${objectName} on dark Carrara marble counter. Morning sunrise rim light. Constant steam plume. 100% surface texture lock across all clips.`,
      midjourneyContinuityRecipe: `--sref [KEYFRAME_1_URL] --sw 100 --ar 9:16`,
    };
  }

  // 4. FACELESS AMBIENT / LUXURY AESTHETIC
  if (format === 'faceless_ambient') {
    const wardrobeLocks: WardrobeLockItem[] = [
      {
        characterName: 'Solitary Protagonist',
        role: 'Faceless Wanderer',
        exactOutfit: 'Tailored heavy midnight-charcoal wool trench coat with structured lapels, black cashmere turtleneck, matte leather gloves',
        signatureProps: 'Minimalist matte-black umbrella handle dripping with clean raindrops',
      },
    ];

    return {
      episodeTitle,
      format,
      timeOfDay: '1:45 AM Midnight Rain',
      lightingSetup: 'Rain-soaked asphalt with gleaming specular reflections of amber streetlights and cyan retro shop neon, deep moody shadows',
      roomGeography: 'Solitary cobblestone metropolitan alleyway, rain droplets creating concentric ripples in dark street puddles, vintage architectural facade',
      wardrobeLocks,
      colorPaletteGrade: 'Kodak Vision3 500T 5219 texture, rich deep blacks, anamorphic blue horizontal streaks, cinematic noir color grade',
      masterAnchorPrompt: `[MASTER EPISODE ANCHOR]: Midnight rain alley, charcoal wool trench coat, cyan/amber neon reflections. Strict 100% weather and lighting lock across all clips.`,
      midjourneyContinuityRecipe: `--sref [KEYFRAME_1_URL] --sw 100 --ar 9:16`,
    };
  }

  // 5. CHARACTER DRAMA / SERIES DRAMA (Default Universal Multi-Character Standoff)
  // Rotating curated wardrobe themes by day number to prevent boring repetition across episodes
  const DRAMA_WARDROBES: Record<number, { hero: string; villain: string; side: string; lighting: string }> = {
    1: {
      hero: 'Tailored charcoal bespoke three-piece wool suit, crisp white spread collar, silk slate-gray tie with subtle micro-weave, platinum tie bar',
      villain: 'Minimalist structured midnight-navy double-breasted designer blazer with brushed platinum buttons, cream silk camisole, hair pinned in immaculate low chignon',
      side: 'Distressed black leather trench coat over dark olive cashmere turtleneck, vintage bronze watch',
      lighting: '2:15 AM stormy midnight rain against glass, high-contrast chiaroscuro key light through wet blinds, warm 3000K amber desk lamp edge glow',
    },
    2: {
      hero: 'Deep espresso-brown tailored cashmere overcoat over fitted black merino turtleneck, brushed titanium wristwatch',
      villain: 'Sleek ivory structured power blazer with sharp padded shoulders, black satin lapel accents, subtle diamond solitaire earrings',
      side: 'Dark charcoal canvas field jacket over washed grey oxford shirt, horn-rimmed eyeglasses',
      lighting: 'Overcast late dusk, cool 5600K blue hour window light balanced with warm incandescent interior wall sconces',
    },
    3: {
      hero: 'Formal midnight-black tuxedo blazer with satin shawl lapel, unbuttoned crisp white wing-collar shirt, loosened bow tie draped around collar',
      villain: 'Dramatic emerald-green silk crepe evening gown with high neckline and structured back cutout, emerald stud earrings',
      side: 'Black tailored security suit with subtle earpiece acoustic coiled tube, rigid posture',
      lighting: 'Private high-stakes VIP lounge, moody low-key candlelight reflections, amber crystal chandelier bokeh',
    },
    4: {
      hero: 'Tactical slate-grey fitted turtleneck under charcoal unbuttoned wool blazer, matte-black chronometer',
      villain: 'Tailored graphite pinstripe pantsuit with sharp peaked lapels, structured silk black shirt, silver minimalist ring',
      side: 'Worn dark brown leather bomber jacket with shearling collar, tired heavy eyelids',
      lighting: 'Subterranean private boardroom, cold fluorescent overhead strip balanced with warm single green banker lamp',
    },
    5: {
      hero: 'Dark sapphire bespoke wool suit with black satin pocket square, crisp open-collar white shirt',
      villain: 'Monochrome black structured cape-blazer with sharp geometric shoulders, matte crimson lipstick, diamond cuff bracelet',
      side: 'Charcoal trench coat with damp rain shoulders, holding leather legal portfolio',
      lighting: 'Sudden thunder flash through penthouse skylight, alternating between deep shadow and intense dramatic flash lighting',
    },
    6: {
      hero: 'Distressed white dress shirt with rolled-up sleeves showing forearm veins, unbuttoned collar, disheveled tie, loosened vest',
      villain: 'Immaculate structured burgundy velvet blazer with satin peak lapels, pearl hair barrette, poised posture',
      side: 'Black rain jacket with hood down, dripping wet collar',
      lighting: '3:00 AM tense standoff, single overhead cone pendant light creating intense top-down chiaroscuro facial shadows',
    },
    7: {
      hero: 'Full pristine charcoal three-piece suit restored to immaculate razor-sharp condition, silk black tie, silver cuff links',
      villain: 'Structured jet-black designer tuxedo dress with dramatic asymmetric satin shoulder drapery, slicked-back high ponytail',
      side: 'Formal federal dark blue suit with gold legal seal pin',
      lighting: 'Final confrontation: Golden dawn light breaking through storm clouds on horizon, dramatic high-stakes sunrise rim light across faces',
    },
  };

  const dayScheme = DRAMA_WARDROBES[dayNum] || DRAMA_WARDROBES[1];

  const wardrobeLocks: WardrobeLockItem[] = [
    {
      characterName: heroName,
      role: heroMember?.role || 'Hero',
      exactOutfit: dayScheme.hero,
      hairAndGrooming: 'Clean styled parted pompadour with light 5 o\'clock shadow along jawline, razor-sharp focus',
    },
    {
      characterName: villainName,
      role: villainMember?.role || 'Villain',
      exactOutfit: dayScheme.villain,
      hairAndGrooming: 'Immaculate high-gloss styling, flawless matte complexion, calculating cold stare',
    },
  ];

  // Add side characters if present
  cast.slice(2).forEach((sideMember, idx) => {
    wardrobeLocks.push({
      characterName: sideMember.name,
      role: sideMember.role || 'Side',
      exactOutfit: dayScheme.side,
      hairAndGrooming: 'Weathered authentic styling, watchful observant posture',
    });
  });

  return {
    episodeTitle,
    format: 'character_drama',
    timeOfDay: `Episode ${dayNum} High-Stakes Scene Setting`,
    lightingSetup: dayScheme.lighting,
    roomGeography: `${location}: Architectural environment details, spatial depth, atmospheric room elements, and practical scene lighting matching this location setting`,
    wardrobeLocks,
    colorPaletteGrade: 'ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, Kodak Vision3 500T 5219 texture, master cinematic chiaroscuro grade',
    masterAnchorPrompt: `[MASTER EPISODE ANCHOR]: ${location}. ${heroName} in ${dayScheme.hero}. ${villainName} in ${dayScheme.villain}. Lighting: ${dayScheme.lighting}. Lock 100% across all clips.`,
    midjourneyContinuityRecipe: `--sref [KEYFRAME_1_URL] --sw 100 --cref [CHARACTER_REF_URL] --cw 100 --ar 9:16`,
  };
}

export function buildContinuityFramePrompt({
  clipIndex,
  totalClips,
  activeSpeaker,
  counterpart,
  location,
  sceneName,
  actionText,
  continuity,
}: {
  clipIndex: number;
  totalClips: number;
  activeSpeaker: string;
  counterpart: string;
  location: string;
  sceneName: string;
  actionText: string;
  continuity: EpisodeSceneContinuity;
}): string {
  const activeWardrobe =
    continuity.wardrobeLocks.find(
      (w) => w.characterName.toLowerCase() === activeSpeaker.toLowerCase()
    )?.exactOutfit || continuity.wardrobeLocks[0]?.exactOutfit || 'Tailored bespoke dark styling';

  const counterpartWardrobe =
    continuity.wardrobeLocks.find(
      (w) => w.characterName.toLowerCase() === counterpart.toLowerCase()
    )?.exactOutfit || continuity.wardrobeLocks[1]?.exactOutfit || 'Tailored structured styling';

  const isMasterAnchor = clipIndex === 1;

  if (isMasterAnchor) {
    return `[VIDEO FRAME IMAGE - MASTER ANCHOR KEYFRAME 1/${totalClips} (ESTABLISHING SHOT)]
[EPISODE CONTINUITY & WARDROBE LOCK]:
- ACTIVE CHARACTER (${activeSpeaker}): Wearing ${activeWardrobe}. Strict facial geometry lock, zero morphing.
- COUNTERPART (${counterpart}): Wearing ${counterpartWardrobe}. Visible in spatial blocking, sealed lips.
- SCENE LIGHTING & ATMOSPHERE: ${continuity.lightingSetup} (${continuity.timeOfDay}).
- ROOM GEOGRAPHY: ${continuity.roomGeography}.
[SCENE BLOCKING & ACTION]: ${sceneName}. ${actionText}.
[CINEMATOGRAPHY & LIGHTING]: Shot on ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field. High-contrast chiaroscuro key lighting, moody volumetric rim light, subtle atmospheric haze.
[FILM EMULATION & GRADE]: ${continuity.colorPaletteGrade}, 8K UHD photorealistic film still.
[MIDJOURNEY MASTER ANCHOR INSTRUCTION]: Generate this Master Keyframe first. Save its URL and use as --sref for subsequent clips to guarantee 100% visual match.
[MIDJOURNEY PARAMS]: --ar 9:16 --v 6.1 --style raw`;
  }

  // Clips 2, 3, 4: CONTINUITY SHOTS LINKED TO KEYFRAME 1
  const continuityRole =
    clipIndex === 2
      ? '180-DEGREE REVERSE SHOT (MATCH KEYFRAME 1)'
      : clipIndex === totalClips
      ? 'CULMINATION & CLIFFHANGER (MATCH KEYFRAME 1)'
      : 'CONTINUOUS SCENE COVERAGE (MATCH KEYFRAME 1)';

  return `[VIDEO FRAME IMAGE - KEYFRAME ${clipIndex}/${totalClips} (${continuityRole})]
[CRITICAL CONTINUITY MATCH TO KEYFRAME 1]:
- MASTER REFERENCE: [ATTACH KEYFRAME 1 IMAGE AS SCENE & STYLE REFERENCE]
- WARDROBE LOCK (100% IDENTICAL TO KEYFRAME 1):
  * ${activeSpeaker}: Wearing ${activeWardrobe} (Must NOT change from Keyframe 1).
  * ${counterpart}: Wearing ${counterpartWardrobe} (Must NOT change from Keyframe 1).
- SCENE & LIGHTING LOCK: Exact same room position, exact same ${continuity.lightingSetup}.
- CAMERA SETUP: ${clipIndex === 2 ? '180-degree reverse angle shot-reverse-shot over-shoulder framing' : 'Dynamic master cinematic framing maintaining spatial axis'}.
[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of ${activeSpeaker}. Exact facial features, eye color, jawline, and hair styling.
[SCENE BLOCKING & ACTION]: ${sceneName}. ${actionText}. ${counterpart} positioned in continuous spatial depth.
[FILM EMULATION & GRADE]: ${continuity.colorPaletteGrade}, 8K UHD photorealistic film still.
[MIDJOURNEY CONTINUITY RECIPE]: --sref [KEYFRAME_1_IMAGE_URL] --sw 100 --cref [CHARACTER_REF_URL] --cw 100 --ar 9:16 --v 6.1 --style raw`;
}
