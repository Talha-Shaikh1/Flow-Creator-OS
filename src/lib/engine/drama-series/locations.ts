export interface DramaLocationSetting {
  id: string;
  name: string;
  category: 'Penthouse & Luxury' | 'Mansion & Heritage' | 'Corporate & Power' | 'Intimate & Noir' | 'Atmospheric Outdoor';
  shortDesc: string;
  environmentDescription: string;
  lightingAtmosphere: string;
  keyProps: string[];
  cameraBlockingTips: string;
}

export const REAL_DRAMA_LOCATIONS: DramaLocationSetting[] = [
  {
    id: 'midnight_penthouse',
    name: 'Luxury Midnight Penthouse & Study',
    category: 'Penthouse & Luxury',
    shortDesc: 'Floor-to-ceiling rain-streaked glass, skyline city lights bokeh, dark mahogany desk & amber lamps.',
    environmentDescription:
      'High-rise minimalist luxury penthouse study in Manhattan with floor-to-ceiling rain-streaked glass walls overlooking a glistening dark metropolitan skyline.',
    lightingAtmosphere:
      'Chiaroscuro lighting: warm 3200K amber glow from a vintage brass desk lamp contrasting with cool 5600K moody blue rainstorm reflections outside.',
    keyProps: [
      'Heavy solid mahogany executive desk',
      'Crystal tumbler with amber whiskey',
      'Confidential sealed leather dossier',
      'Floor-to-ceiling panoramic glass',
    ],
    cameraBlockingTips:
      'Screen-Left protagonist behind desk; Screen-Right visitor by glass door. Raindrops visible on glass in shallow depth of field.',
  },
  {
    id: 'rain_terrace',
    name: 'Rain-Drenched Glass Balcony & Terrace',
    category: 'Penthouse & Luxury',
    shortDesc: 'Wet reflective marble floor, cold midnight rain, misty neon city lights, billowing curtains.',
    environmentDescription:
      'Sleek open-air penthouse glass terrace during a torrential midnight downpour, overlooking blurred distant city lights and traffic bokeh.',
    lightingAtmosphere:
      'Deep cinematic midnight blue, glistening wet reflective dark marble tiles, soft diffused city rim lighting on wet faces.',
    keyProps: [
      'Frameless glass security balustrade',
      'Potted black bonsai planter',
      'Wet marble floor with puddle reflections',
      'Billowing sheer linen drapery',
    ],
    cameraBlockingTips:
      'Wind whipping trench coats, unbroken horizontal eye lock, droplets dripping from hair.',
  },
  {
    id: 'grand_mansion_foyer',
    name: 'Grand Family Dynasty Mansion & Marble Foyer',
    category: 'Mansion & Heritage',
    shortDesc: 'Double marble staircase, golden crystal chandelier, velvet drapes, ancestral oil portraits.',
    environmentDescription:
      'Palatial aristocratic estate entrance hall with a sweeping double marble staircase, monumental crystal chandelier, and towering oil portraits of family ancestors.',
    lightingAtmosphere:
      'Warm opulent golden light cascading from high crystal chandelier, deep dramatic shadows under the sweeping archways.',
    keyProps: [
      'Curved marble staircase banister',
      'Gilded antique console table',
      'Framed vintage family portrait',
      'Heavy velvet crimson curtains',
    ],
    cameraBlockingTips:
      'One character standing on third stair landing (dominant high position), other character looking up from marble floor with proud defiance.',
  },
  {
    id: 'executive_boardroom',
    name: 'Executive High-Rise Boardroom (After-Hours)',
    category: 'Corporate & Power',
    shortDesc: 'Polished black granite table, city skyline behind tinted glass, tense architectural downlights.',
    environmentDescription:
      'Monolithic corporate boardroom on the 54th floor after midnight. Empty leather swivel chairs, frosted glass walls, and a 20-foot polished black granite conference table.',
    lightingAtmosphere:
      'Cold, sterile high-stakes corporate power ambiance: recessed architectural narrow downlights pooling on the polished black table.',
    keyProps: [
      'Polished black granite boardroom table',
      'Signed non-disclosure agreement papers',
      'High-end encrypted tablet',
      'Floor-to-ceiling panoramic windows',
    ],
    cameraBlockingTips:
      'Characters at opposite ends or leaning over the dark reflective granite table, aggressive forward body angle.',
  },
  {
    id: 'candlelit_hotel_suite',
    name: 'Candlelit VIP Hotel Suite & Private Lounge',
    category: 'Intimate & Noir',
    shortDesc: 'Intimate fireplace glow, deep velvet sofas, amber wall sconces, private bar.',
    environmentDescription:
      'Ultra-exclusive 5-star hotel presidential suite, intimate, luxurious, and emotionally suffocating. Deep velvet sofas, warm wood panelling, and a crackling marble fireplace.',
    lightingAtmosphere:
      'Low-key intimate amber lighting: dancing golden firelight embers, dim wall sconces, heavy shadows in room corners.',
    keyProps: [
      'Marble fireplace hearth',
      'Deep velvet chaise lounge',
      'Unopened champagne bottle in silver ice bucket',
      'Discarded silver lighter',
    ],
    cameraBlockingTips:
      'Close personal proximity (within 3 feet), intense emotional vulnerability, tears catching golden fire reflections.',
  },
  {
    id: 'luxury_sedan_interior',
    name: 'Luxury Chauffeur Sedan Interior (Midnight Rain)',
    category: 'Intimate & Noir',
    shortDesc: 'Rain sliding down tinted glass, sodium streetlights sweeping across faces, black leather seats.',
    environmentDescription:
      'Rear passenger cabin of an armored luxury German sedan driving through midnight city streets under heavy rain.',
    lightingAtmosphere:
      'Moody cabin interior with soft ambient amber LED strip lighting; passing yellow sodium streetlights and red neon signs sweeping rhythmically across faces.',
    keyProps: [
      'Perforated black leather seats',
      'Tinted rain-beaded side window',
      'Fold-out walnut wood tray table',
      'Confidential smartphone screen glow',
    ],
    cameraBlockingTips:
      'Tight intimate two-shot in car backseat or shot-reverse-shot with rain sliding down the window behind their heads.',
  },
  {
    id: 'stormy_coastal_cliff',
    name: 'Stormy Seaside Cliff & Private Dock at Dusk',
    category: 'Atmospheric Outdoor',
    shortDesc: 'Crashing dark waves, moody overcast dusk, ocean breeze, wet wooden pier.',
    environmentDescription:
      'Desolate rocky seaside cliff overlooking crashing dark waves and a weathered wooden pier as dusk falls under heavy slate-grey storm clouds.',
    lightingAtmosphere:
      'Naturalistic moody overcast dusk: cold ocean slate blues and charcoal greys, sweeping beam from distant coastal lighthouse.',
    keyProps: [
      'Weathered timber pier posts',
      'Crashing sea foam against dark rocks',
      'Rain-spotted classic trench coats',
      'Distant lighthouse beam',
    ],
    cameraBlockingTips:
      'Wide cinematic establishing shot transitioning to wind-whipped close-ups with ocean spray misting character faces.',
  },
];
