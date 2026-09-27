import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';
import {
  SeasonStory,
  CharacterBible,
  CharacterBibleItem,
  EpisodeProductionSheet,
  SceneContinuityPlan,
  TenSecClipDef,
  FramePromptItem,
  VideoPromptItem,
  DirectorQAPackage,
} from '@/types/drama-series';

/**
 * PHASE 1: Generate Complete Season Story Concept & Episode Arcs (Real Human Emotional Drama & Revenge)
 */
export async function generateSeasonStoryPipeline(
  seedTopic: string,
  genre: string = 'Cinematic Emotional Drama & Revenge Romance',
  aiConfig?: AIProviderConfig,
  optionalLocationHint?: string
): Promise<SeasonStory> {
  const locationInstruction = optionalLocationHint
    ? `User Setting Note: "${optionalLocationHint}". Design an authentic, prestige architectural environment around this concept.`
    : `Intelligently architect and design the primary world environment that NATURALLY AND PERFECTLY FITS THIS DRAMATIC STORY (e.g. if the story is about estranged corporate lovers, design a high-floor glass penthouse study or executive boardroom; if about dynasty inheritance, design an ancestral mansion foyer; if about a runaway lover, design a rain-soaked coastal harbor or moody boutique hotel).`;

  const prompt = `You are a Prestige Television Showrunner, Melodrama Director, and Master Screenwriter specializing in high-stakes REAL HUMAN EMOTIONAL DRAMA, INTENSE LOVE STORIES, BETRAYAL, AND REVENGE SAGAS (HBO, A24, prestige Kdrama, and cinematic British/American character dramas).

TASK: Develop PHASE 1: SEASON STORY DEVELOPMENT based on this concept:
"${seedTopic}"
Genre: ${genre}

LOCATION & WORLD DESIGN DIRECTIVE:
${locationInstruction}

CRITICAL STORYTELLING & ENVIRONMENT RULES:
- CHARACTERS ARE REAL HUMAN BEINGS: Photorealistic human actors, complex emotional psychologies, intense romance, suppressed passion, heartbreak, family vendettas, and calculated revenge.
- MANDATORY MULTI-LAYERED DRAMA BLEND (NEVER ONE-DIMENSIONAL):
  A true prestige drama is NEVER flat or single-note! If a concept focuses on 'revenge', it must NOT be only cold anger.
  EVERY series and episode MUST be a rich, powerful MIXUP of:
  1. INTENSE ROMANCE & UNRESOLVED PASSION: Electric eye contact, physical proximity, suppressed longing, memories of tender intimacy.
  2. HEART-WRENCHING EMOTIONAL VULNERABILITY: Moist tearful eyes, cracking voices, unspoken grief, secret sacrifices, shattering heartbreak.
  3. BETRAYAL & REVENGE STAKES: Calculated retribution, family vendettas, hidden evidence, sudden power shifts, cutthroat loyalty tests.
  4. PRIDE & SHARP DRAMATIC BANTER: Wounded egos, cutting ironic retorts, prideful defenses concealing unbearable love.
  The engine must interweave these four pillars seamlessly across all episodes.
- DYNAMIC REAL-WORLD DRAMA SETTING: Autonomously create a rich, photorealistic, atmospheric world environment that matches the emotional tone of the story (e.g. rain-slicked glass penthouse overlooking city lights, grand heritage mansion hall, candlelit hotel suite, stormy coastal cliff, private executive lounge).
- STRICT BAN ON WEIRD / ABSTRACT SETTINGS: Absolutely NO cartoon environments, NO kitchens or household counters, NO appliances, NO toasters, NO mugs, NO talking objects, NO surreal/fantasy micro-worlds. 100% photorealistic prestige TV drama sets only.
- Focus ONLY on high-level season and episodic narrative arcs. No camera prompts at this stage.
- Divide the season into 4 to 6 serialized, tightly connected episodes.
- Ensure every episode has a high-stakes emotional confrontation, a sharp dramatic escalation, and a cliffhanger hook that leaves the audience breathless.
- Return STRICT JSON only matching the schema below.

JSON SCHEMA:
{
  "seasonTitle": "Evocative Cinematic Season Title",
  "genre": "${genre}",
  "mainTheme": "Core emotional theme (e.g. Unresolved love vs ruthless revenge, the cost of loyalty, hidden past sacrifices)",
  "worldEnvironment": "Photorealistic, atmospheric prestige real-world location designed specifically for this story (e.g. Rain-streaked high-rise penthouse study in Manhattan overlooking a midnight skyline; grand ancestral family estate foyer with marble staircase; private candlelit suite)",
  "overallTone": "Intense, deeply emotional, atmospheric, romantic tension with undercurrent of danger",
  "comedyStyle": "Dark witty tension banter and sharp dramatic retorts (never silly cartoon gags)",
  "emotionalStyle": "Heart-wrenching vulnerability, unspoken grief, suppressed passion, tearful accusations",
  "narrativeArc": "Overarching season journey from bitter reunion to devastating revelation and climax",
  "beginning": "The opening catalyst: an unexpected confrontation or a long-planned revenge move",
  "majorDevelopments": "Key emotional betrayals, leaked secrets, and shifting loyalties across the season",
  "majorConflicts": "The clash between irresistible romantic pull and the moral duty of revenge",
  "characterRelationships": "The complex history, shared trauma, and intense chemistry between the lead characters",
  "recurringSituations": "Tense late-night private confrontations, shared symbolic tokens (rings, letters, dossiers)",
  "importantCallbacks": "A specific whispered phrase or promise from their past that changes meaning later",
  "seasonClimax": "The explosive truth revealed: where love and revenge collide in a life-or-death ultimatum",
  "seasonEnding": "A devastating, emotionally charged cliffhanger setting up the next season",
  "episodes": [
    {
      "episodeNumber": 1,
      "episodeTitle": "Episode Title",
      "mainStory": "Core dramatic narrative of this episode",
      "mainConflict": "The primary clash between characters in this episode",
      "beginning": "Opening 0-3s psychological hook (e.g. a classified dossier slammed on the table, eye contact across a rainy glass window)",
      "middle": "Rising confrontation, bitter accusations, and intimate emotional tension",
      "ending": "A sharp cliffhanger reveal or heartbreaking ultimatum",
      "charactersInvolved": ["Character Name 1", "Character Name 2"],
      "importantEmotionalBeats": "A crack in the emotional armor; a moment of undeniable romantic vulnerability",
      "comedyMoments": "Sharp, cutting verbal irony and defensive sarcastic retorts",
      "connectionWithPrevious": "Opening of the series or callback to previous episode",
      "setupForFuture": "An unresolved clue or secret hidden from the other character"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Lead Showrunner for prestige cinematic television dramas. Return strictly valid JSON. Do not wrap in markdown.',
    temperature: 0.8,
    responseJson: true,
  });

  if (!res.parsed || !res.parsed.seasonTitle) {
    throw new Error('Failed to generate valid Season Story JSON');
  }

  if (Array.isArray(res.parsed.episodes)) {
    res.parsed.episodes = res.parsed.episodes.map((ep: any) => ({
      ...ep,
      beginning:
        typeof ep.beginning === 'string'
          ? ep.beginning
          : ep.beginning?.hook || ep.beginning?.text || JSON.stringify(ep.beginning) || '',
      middle:
        typeof ep.middle === 'string'
          ? ep.middle
          : ep.middle?.text || JSON.stringify(ep.middle) || '',
      ending:
        typeof ep.ending === 'string'
          ? ep.ending
          : ep.ending?.cliffhanger || ep.ending?.text || JSON.stringify(ep.ending) || '',
      charactersInvolved: Array.isArray(ep.charactersInvolved)
        ? ep.charactersInvolved
        : typeof ep.charactersInvolved === 'string'
        ? [ep.charactersInvolved]
        : [],
    }));
  }

  return res.parsed as SeasonStory;
}

/**
 * PHASE 2: Generate Locked Character Bible from Approved Season Story (Real Human Actors)
 */
export async function generateCharacterBiblePipeline(
  seasonStory: SeasonStory,
  aiConfig?: AIProviderConfig
): Promise<CharacterBible> {
  // Extract all characters mentioned in story summaries or episode lists
  const storyCharacters = Array.from(
    new Set(
      (seasonStory.episodes || [])
        .flatMap((e) => e.charactersInvolved || [])
        .filter((c) => typeof c === 'string' && c.trim().length > 0)
    )
  );

  const characterContext =
    storyCharacters.length > 0
      ? `CHARACTERS ESTABLISHED IN APPROVED STORY:\n${storyCharacters.map((c, i) => `- CHAR-0${i + 1}: ${c}`).join('\n')}\n\nRELATIONSHIPS & CONFLICTS:\n${seasonStory.characterRelationships || seasonStory.majorConflicts}`
      : `RELATIONSHIPS & CONFLICTS:\n${seasonStory.characterRelationships || seasonStory.majorConflicts}`;

  const prompt = `You are a Lead Casting Director, Hair & Makeup Head, and Cinematic Actor Performance Supervisor.

TASK: Develop PHASE 2: LOCKED CHARACTER BIBLE for REAL HUMAN ACTORS based on the approved Season Story:
Title: "${seasonStory.seasonTitle}"
World: "${seasonStory.worldEnvironment}"
Theme: "${seasonStory.mainTheme}"

${characterContext}

CRITICAL RULES:
- STORY-DRIVEN CAST SIZE: Create a complete, locked character profile for EVERY character required by the approved story (Protagonists, Antagonists, Love Interests, Key Family/Allies). Assign sequential IDs: CHAR-01, CHAR-02, CHAR-03, etc.
- CHARACTERS ARE REAL HUMAN BEINGS (Photorealistic digital actors): Age, facial bone structure, ethnic heritage, tailored wardrobe, vocal timbre, and micro-expressions.
- In "morphologySpec", specify REAL HUMAN VISUAL DNA: Exact eye color/moisture, jawline, natural skin texture with visible pores (no plastic smoothing), lip shape, and micro-expressions under emotional distress.
- Define exact acting expressions, voice cadence (breathy whispers, cracks in voice, icy composure), and LOCKED continuity rules that must never drift between clips.
- Return STRICT JSON only.

JSON SCHEMA:
{
  "characters": [
    {
      "id": "CHAR-01",
      "name": "Character Full Name",
      "speciesObject": "Role / Archetype: e.g. 32-year-old Estranged Tycoon & Brooding Strategist",
      "ageAppearance": "32 years old",
      "genderPresentation": "Masculine / Tailored Executive",
      "personality": "Calculating, guarded, intensely passionate, speaks with quiet authority",
      "roleInStory": "Main Character",
      "morphologySpec": {
        "eyeType": "Deep slate-grey eyes with intense emotional depth, natural moisture and faint red rimming",
        "mouthPlacement": "Sculpted lips, tense jawline that clenches visibly during confrontation",
        "limbPhysics": "Poised, commanding posture; defensive hands in coat pockets or gripping furniture",
        "materialTexture": "Photorealistic human skin with visible natural pores, light five o'clock shadow stubble",
        "distinctiveFeatures": "Faint 1-inch hairline scar near right temple; platinum signet ring on left pinky"
      },
      "physicalAppearance": {
        "headShape": "Strong chiseled jawline, high cheekbones, dark textured wavy hair slightly damp from rain",
        "faceStructure": "Sharp aristocratic bone structure with piercing gaze and sorrowful furrowed brow",
        "bodyProportions": "Athletic, broad-shouldered 6'1 frame in tailored European silhouette",
        "distinctiveFeatures": "Piercing eye contact that rarely blinks during confrontations"
      },
      "clothing": {
        "exactOutfit": "Tailored charcoal Italian cashmere overcoat over an unbuttoned crisp black silk shirt",
        "colors": "Charcoal grey, midnight black, brushed platinum accents",
        "materials": "Heavy cashmere wool, matte silk, polished black leather oxfords",
        "accessories": "Vintage platinum watch with black leather strap",
        "propsNormallyCarried": "Encrypted black smartphone, confidential leather dossier folder"
      },
      "acting": {
        "normalExpression": "Cold, unreadable composure masking profound inner turmoil",
        "happyExpression": "Rare, gentle softening around the eyes with a warm, private half-smile",
        "sadExpression": "Eyes glistening with unshed tears, jaw clenching, looking down to conceal heartbreak",
        "angryExpression": "Icy calm, lowered voice, piercing narrowed gaze that commands the entire room",
        "comedicExpression": "Dry, sardonic smirk with a slow tilt of the head",
        "typicalBodyLanguage": "Maintains unbroken eye contact, steps forward slowly to close physical distance during arguments"
      },
      "voice": {
        "voiceType": "Resonant, velvety baritone with gravelly texture when emotional",
        "ageImpression": "Mature early 30s",
        "accent": "Refined Mid-Atlantic cadence",
        "speakingSpeed": "Deliberate 120 WPM with pregnant, suspenseful pauses",
        "emotionalStyle": "Restrained intensity; voice lowers to a dangerous whisper when furious"
      },
      "continuityRules": [
        "Signet ring MUST always remain on the left pinky",
        "Overcoat collar stays popped on the left side",
        "Hair has consistent damp styling throughout the scene"
      ]
    }
  ],
  "lockedRules": [
    "Permanent actor IDs (CHAR-01, CHAR-02) must never be swapped",
    "Real human facial features and bone structure must remain 100% consistent across all camera angles",
    "Wardrobe and jewelry must remain identical throughout the episode without unexplained changes"
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Master Casting and Visual DNA Supervisor for prestige cinema. Produce a complete locked Character Bible for all characters required by the story in strictly valid JSON.',
    temperature: 0.75,
    responseJson: true,
  });

  let rawCharacters = res.parsed?.characters;
  if (!rawCharacters && Array.isArray(res.parsed)) {
    rawCharacters = res.parsed;
  } else if (!rawCharacters && Array.isArray(res.parsed?.characterBible?.characters)) {
    rawCharacters = res.parsed.characterBible.characters;
  }

  if (!rawCharacters || !Array.isArray(rawCharacters) || rawCharacters.length === 0) {
    throw new Error('Failed to generate valid Character Bible JSON (no characters array found)');
  }

  const sanitizedCharacters: CharacterBibleItem[] = rawCharacters.map((c: any, idx: number) => {
    // 1. Clothing Sanitization
    let clothingObj = {
      exactOutfit: 'Tailored luxury bespoke styling',
      colors: 'Neutral, dark cinematic tones',
      materials: 'Cashmere wool, matte silk',
      accessories: 'None',
      propsNormallyCarried: 'None',
    };
    if (typeof c.clothing === 'string') {
      clothingObj.exactOutfit = c.clothing;
    } else if (c.clothing && typeof c.clothing === 'object') {
      clothingObj = {
        exactOutfit: c.clothing.exactOutfit || c.clothing.outfit || c.clothing.description || 'Tailored luxury bespoke styling',
        colors: c.clothing.colors || 'Neutral, dark cinematic tones',
        materials: c.clothing.materials || 'Cashmere wool, matte silk',
        accessories: c.clothing.accessories || 'None',
        propsNormallyCarried: c.clothing.propsNormallyCarried || 'None',
      };
    }

    // 2. Morphology Spec Sanitization
    let morphologyObj = {
      eyeType: 'Deep focused gaze, natural emotional depth',
      mouthPlacement: 'Natural expression, disciplined jawline',
      limbPhysics: 'Commanding posture, controlled body language',
      materialTexture: 'Photorealistic human skin with visible natural pores',
      distinctiveFeatures: 'Refined cinematic presence',
    };
    if (typeof c.morphologySpec === 'string') {
      morphologyObj.distinctiveFeatures = c.morphologySpec;
    } else if (c.morphologySpec && typeof c.morphologySpec === 'object') {
      morphologyObj = {
        eyeType: c.morphologySpec.eyeType || morphologyObj.eyeType,
        mouthPlacement: c.morphologySpec.mouthPlacement || morphologyObj.mouthPlacement,
        limbPhysics: c.morphologySpec.limbPhysics || morphologyObj.limbPhysics,
        materialTexture: c.morphologySpec.materialTexture || morphologyObj.materialTexture,
        distinctiveFeatures: c.morphologySpec.distinctiveFeatures || morphologyObj.distinctiveFeatures,
      };
    }

    // 3. Physical Appearance Sanitization
    let physicalObj = {
      headShape: 'Chiseled, defined structure',
      faceStructure: 'Expressive aristocratic bone structure',
      bodyProportions: 'Athletic, elegant European silhouette',
      distinctiveFeatures: 'Unbroken intense eye contact',
    };
    if (typeof c.physicalAppearance === 'string') {
      physicalObj.distinctiveFeatures = c.physicalAppearance;
    } else if (c.physicalAppearance && typeof c.physicalAppearance === 'object') {
      physicalObj = {
        headShape: c.physicalAppearance.headShape || physicalObj.headShape,
        faceStructure: c.physicalAppearance.faceStructure || physicalObj.faceStructure,
        bodyProportions: c.physicalAppearance.bodyProportions || physicalObj.bodyProportions,
        distinctiveFeatures: c.physicalAppearance.distinctiveFeatures || physicalObj.distinctiveFeatures,
      };
    }

    // 4. Voice Sanitization
    let voiceObj = {
      voiceType: 'Resonant, expressive cinematic cadence',
      ageImpression: c.ageAppearance || 'Mature',
      accent: 'Neutral refined cadence',
      speakingSpeed: 'Deliberate 120 WPM',
      emotionalStyle: 'Restrained emotional intensity',
    };
    if (typeof c.voice === 'string') {
      voiceObj.voiceType = c.voice;
    } else if (c.voice && typeof c.voice === 'object') {
      voiceObj = {
        voiceType: c.voice.voiceType || voiceObj.voiceType,
        ageImpression: c.voice.ageImpression || voiceObj.ageImpression,
        accent: c.voice.accent || voiceObj.accent,
        speakingSpeed: c.voice.speakingSpeed || voiceObj.speakingSpeed,
        emotionalStyle: c.voice.emotionalStyle || voiceObj.emotionalStyle,
      };
    }

    // 5. Acting Sanitization
    let actingObj = {
      normalExpression: 'Guarded composure, intense emotional depth',
      happyExpression: 'Rare, gentle softening around the eyes',
      sadExpression: 'Eyes glistening with unshed tears, jaw clenching',
      angryExpression: 'Icy calm, lowered dangerous whisper',
      comedicExpression: 'Dry, sardonic smirk',
      typicalBodyLanguage: 'Direct eye contact, controlled posture',
    };
    if (typeof c.acting === 'string') {
      actingObj.normalExpression = c.acting;
    } else if (c.acting && typeof c.acting === 'object') {
      actingObj = {
        normalExpression: c.acting.normalExpression || actingObj.normalExpression,
        happyExpression: c.acting.happyExpression || actingObj.happyExpression,
        sadExpression: c.acting.sadExpression || actingObj.sadExpression,
        angryExpression: c.acting.angryExpression || actingObj.angryExpression,
        comedicExpression: c.acting.comedicExpression || actingObj.comedicExpression,
        typicalBodyLanguage: c.acting.typicalBodyLanguage || actingObj.typicalBodyLanguage,
      };
    }

    return {
      id: c.id || `CHAR-0${idx + 1}`,
      name: c.name || `Character ${idx + 1}`,
      speciesObject: c.speciesObject || c.role || 'Photorealistic Actor',
      ageAppearance: c.ageAppearance || '30s',
      genderPresentation: c.genderPresentation || 'Refined',
      personality: c.personality || 'Complex, emotionally guarded',
      roleInStory: c.roleInStory || (idx === 0 ? 'Main Character' : 'Recurring Character'),
      morphologySpec: morphologyObj,
      physicalAppearance: physicalObj,
      clothing: clothingObj,
      acting: actingObj,
      voice: voiceObj,
      continuityRules: Array.isArray(c.continuityRules)
        ? c.continuityRules
        : [String(c.continuityRules || 'Wardrobe and appearance must stay strictly locked')],
    };
  });

  const lockedRules = Array.isArray(res.parsed?.lockedRules)
    ? res.parsed.lockedRules
    : [
        'Permanent actor IDs (CHAR-01, CHAR-02) must never be swapped',
        'Real human facial features and bone structure must remain 100% consistent across all camera angles',
        'Wardrobe and jewelry must remain identical throughout the episode without unexplained changes',
      ];

  return {
    characters: sanitizedCharacters,
    lockedRules,
  } as CharacterBible;
}

/**
 * PHASE 3: Generate Episode Production Breakdown (Real Human Drama)
 */
export async function generateEpisodeProductionPipeline(
  seasonStory: SeasonStory,
  characterBible: CharacterBible,
  episodeNumber: number,
  aiConfig?: AIProviderConfig,
  locationSetting?: string,
  targetRuntime: '60s' | '90s' | '120s' = '60s'
): Promise<EpisodeProductionSheet> {
  const selectedEp =
    seasonStory.episodes.find((e) => e.episodeNumber === episodeNumber) || seasonStory.episodes[0];

  const charSummary = characterBible.characters
    .map((c) => `${c.id} (${c.name}): ${c.speciesObject}, ${c.personality}`)
    .join('\n');

  const chosenLocation = locationSetting || seasonStory.worldEnvironment;
  const clipCount = targetRuntime === '120s' ? 12 : targetRuntime === '90s' ? 9 : 6;
  const runtimeLabel =
    targetRuntime === '120s'
      ? '120 seconds (12 clips of 10s — 2 Min Mini-Film)'
      : targetRuntime === '90s'
      ? '90 seconds (9 clips of 10s — 1.5 Min Mini-Film)'
      : '60 seconds (6 clips of 10s — 1 Min Micro-Drama)';

  const prompt = `You are a Senior Drama Series Director and Screenwriter.

TASK: Develop PHASE 3: EPISODE PRODUCTION BREAKDOWN for Episode ${episodeNumber}: "${selectedEp.episodeTitle}".
TARGET RUNTIME FORMAT: ${runtimeLabel}

CONTEXT:
Season: "${seasonStory.seasonTitle}"
World / Main Setting: "${chosenLocation}"
Episode Summary: "${selectedEp.mainStory}"
Conflict: "${selectedEp.mainConflict}"
Cast Available:
${charSummary}

CRITICAL RULES:
- REAL HUMAN EMOTIONAL DRAMA BLEND: Never make this episode one-dimensional. Seamlessly blend intense romantic tension, deep emotional vulnerability (tears, heartbreak), and calculated revenge stakes. A scene can begin with cold vengeful accusations, transition into intimate physical proximity and romantic vulnerability as defenses crumble, and end on a heartbreaking ultimatum.
- LOCKED REAL DRAMA LOCATION: All scenes must be grounded in realistic prestige settings matching: "${chosenLocation}" (e.g. Midnight Penthouse Study with rain-streaked windows, Rain-Drenched Glass Terrace, Grand Mansion Foyer, Executive Boardroom After Hours, VIP Hotel Suite).
- NEGATIVE DIRECTIVE: STRICTLY FORBID KITCHENS, NO APPLIANCES, NO DOMESTIC COMIC SPACES, NO TOY/CARTOON WORLDS. Every scene must look like a high-budget HBO / A24 / Netflix prestige television drama.
- Target Runtime: Exactly ${runtimeLabel}. Plan 2 to 3 cinematic scenes that can be executed in exactly ${clipCount} continuous 10-second clips.
- Blocking: Physical proximity, stepping into each other's personal space, turning away in pain, touching or slamming props.
- Return STRICT JSON only matching this schema.

JSON SCHEMA:
{
  "episodeNumber": ${episodeNumber},
  "episodeTitle": "${selectedEp.episodeTitle}",
  "runtimeTarget": "${runtimeLabel}",
  "storySummary": "${selectedEp.mainStory}",
  "characterList": ["CHAR-01", "CHAR-02"],
  "locationList": ["${chosenLocation}"],
  "timeline": "Midnight 01:15 AM, Heavy Rainstorm",
  "emotionalProgression": "Icy confrontation -> Painful tearful revelation -> Romantic vulnerability -> Bitter ultimatum",
  "comedyBeats": "Sharp, cutting verbal irony and prideful defensive retorts",
  "dialogueFlow": "Intense, rapid-fire emotional exchanges followed by heavy, breathless silences",
  "arcStructure": "Hook -> Confrontation -> Escalation -> Heartbreak Climax -> Cliffhanger",
  "scenes": [
    {
      "sceneNumber": 1,
      "scenePurpose": "Establish the sudden late-night confrontation and reveal the evidence of betrayal",
      "location": "Midnight Penthouse Study with floor-to-ceiling rain-streaked windows",
      "timeOfDay": "Midnight, cold blue exterior city neon contrasting with warm interior desk lamps",
      "charactersPresent": ["CHAR-01", "CHAR-02"],
      "characterPositions": "CHAR-01 is screen-left standing behind the mahogany desk; CHAR-02 is screen-right by the glass door",
      "characterActions": "CHAR-01 slides the red folder across the desk; CHAR-02 freezes with trembling eyes",
      "characterEmotionalStates": "CHAR-01 cold restrained rage; CHAR-02 stunned heartbreak and defensive pride",
      "props": "Mahogany desk, crystal whiskey glass, sealed red dossier, vintage table lamp",
      "backgroundActivity": "Heavy rain cascading down the exterior glass with distant city traffic reflections",
      "cameraConcept": "35mm anamorphic establishing two-shot transitioning to intimate shot-reverse-shot close-ups",
      "dialogue": "Exact dramatic lines planned for the scene",
      "transitionFromPrevious": "Episode cold open with thunderclap and footsteps outside the door",
      "transitionIntoNext": "CHAR-02 steps onto the wet balcony, camera tracking from behind"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a prestige television drama director. Return strictly valid JSON conforming to the schema.',
    temperature: 0.75,
    responseJson: true,
  });

  if (!res.parsed || !res.parsed.scenes) {
    throw new Error('Failed to generate Episode Production Sheet JSON');
  }

  return res.parsed as EpisodeProductionSheet;
}

/**
 * PHASE 4 & 5: Generate Scene Continuity Planning & 10-Second Clip Breakdown (Real Human Drama)
 */
export async function generateClipsAndContinuityPipeline(
  episodeSheet: EpisodeProductionSheet,
  characterBible: CharacterBible,
  aiConfig?: AIProviderConfig,
  targetRuntime: '60s' | '90s' | '120s' = '60s'
): Promise<{
  sceneContinuity: SceneContinuityPlan[];
  clipsBreakdown: TenSecClipDef[];
}> {
  const targetClipsCount = targetRuntime === '120s' ? 12 : targetRuntime === '90s' ? 9 : 6;

  const charactersJson = JSON.stringify(
    characterBible.characters.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.speciesObject,
      voice: c.voice,
      morphology: c.morphologySpec,
    }))
  );

  const prompt = `You are an Animation & Film Continuity Supervisor and Technical Camera Director.

TASK: Develop PHASE 4 (Scene Continuity Planning) and PHASE 5 (10-Second Clip Breakdown) for REAL HUMAN DRAMA:
Episode ${episodeSheet.episodeNumber}: "${episodeSheet.episodeTitle}"
Scenes to cover: ${JSON.stringify(episodeSheet.scenes)}
TARGET RUNTIME: ${targetRuntime === '120s' ? '120s (12 clips — 2 Min Mini-Film)' : targetRuntime === '90s' ? '90s (9 clips — 1.5 Min Mini-Film)' : '60s (6 clips — 1 Min Micro-Drama)'}

LOCKED CAST:
${charactersJson}

CRITICAL RULES:
1. SPATIAL GEOMETRY & 180° AXIS LOCK:
   - Establish the camera side. The camera must NEVER cross the 180-degree axis line between CHAR-01 and CHAR-02.
   - Screen-Left character must remain screen-left in reverse-shots (looking screen-right at listener).
   - Screen-Right character must remain screen-right (looking screen-left at listener).
2. 10-SECOND CLIP STRUCTURE (EXACTLY ${targetClipsCount} CLIPS):
   - Output EXACTLY ${targetClipsCount} clips (each strictly 10 seconds).
   - Complete the full mini-film story arc across these ${targetClipsCount} clips:
     * Clip 1 (0-10s): High-voltage opening shock hook (dossier slammed, tear glistening, tense confrontation).
     * Clips 2-${Math.floor(targetClipsCount * 0.4)}: Rising bitter accusations, ego clashes, and sarcastic retorts.
     * Clips ${Math.floor(targetClipsCount * 0.4) + 1}-${Math.floor(targetClipsCount * 0.7)}: Romantic vulnerability, close physical proximity, suppressed passion resurfacing.
     * Clips ${Math.floor(targetClipsCount * 0.7) + 1}-${targetClipsCount}: Revenge trap execution, devastating truth revealed, and heartbreaking cliffhanger ending.
   - A character must NOT teleport, change clothing, or alter hair styling between clips.
   - Every clip begins from the logical ending state of the previous clip.
3. DIALOGUE & SPEAKER ISOLATION (VEO HARD CONSTRAINT):
   - HARD WORD BUDGET: Maximum 14 to 18 words per 10-second clip! (Pacing for emotional human delivery with breath pauses).
   - STRICT SINGLE SPEAKER: Exactly ONE active speaking character per clip!
   - Non-speaking character in frame must be explicitly marked as LISTENER ONLY with lips sealed and emotional reaction.
   - EYE CONTACT: Speaker must look directly into the other character's eyes.
4. 0-3S HOOK IN CLIP 1:
   - Clip 1 MUST have an immediate emotional shock hook in the first 3 seconds (e.g. an unexpected confrontation, a dossier slammed down, tear glistening on cheek).
5. LOCATION CONTINUITY & FRAME CHAINING STRATEGY:
   - Determine whether each clip stays in the same location/scene as the previous clip.
   - If Clip N stays in the same location as Clip N-1 (e.g. both in Penthouse Study):
     * Set "locationContinuityType": "SAME_LOCATION_CONTINUOUS"
     * Set "frameReferenceStrategy": "USE_PREVIOUS_CLIP_END_FRAME"
     * Set "frameReferenceNote": "Location does not change. Use the final frame (End Frame) of Clip [N-1] as the starting frame input in Google Flow (Veo) for 100% actor and environment continuity."
   - If Clip N cuts to a different location or time:
     * Set "locationContinuityType": "NEW_LOCATION_SCENE_CUT"
     * Set "frameReferenceStrategy": "NEW_STARTING_FRAME"
     * Set "frameReferenceNote": "New scene cut. Generate fresh starting frame."
6. MULTI-LAYERED EMOTIONAL ACTING & DIALOGUE (LOVE + EMOTION + REVENGE MIXUP):
   - Dialogue must NEVER be one-dimensional. It must carry deep subtext: pride and vengeance on the surface, but intense suppressed love, sorrow, and unbearable longing underneath in their eyes and micro-expressions.
   - Spoken words attack the betrayal or demand revenge, but the actor's moist eyes and proximity reveal that they still desperately care.

Return STRICT JSON only matching this schema:
{
  "sceneContinuity": [
    {
      "sceneNumber": 1,
      "cameraSide": "West side of penthouse study, facing East toward the rain-drenched glass window",
      "axisOfAction180": "The 180-degree axis line runs between CHAR-01 and CHAR-02 across the mahogany desk. All camera angles remain strictly on the West side of this line.",
      "characterSpatialMapping": "CHAR-01 is locked Screen-Left looking screen-right (angle +35°); CHAR-02 is locked Screen-Right looking screen-left (angle -35°)",
      "distanceBetweenCharacters": "Approximately 4 feet apart across the executive desk",
      "environmentalAnchors": "Mahogany desk on left, rain-streaked glass on right, glowing desk lamp in foreground",
      "characterEntrancePoints": "CHAR-02 enters through the double oak doors in background",
      "characterExitPoints": "None in Scene 1"
    }
  ],
  "clipsBreakdown": [
    {
      "clipNumber": 1,
      "duration": "10 seconds",
      "sceneNumber": 1,
      "locationContinuityType": "NEW_LOCATION_SCENE_CUT",
      "frameReferenceStrategy": "NEW_STARTING_FRAME",
      "frameReferenceNote": "Episode establishing clip. Generate new starting frame.",
      "charactersPresent": ["CHAR-01", "CHAR-02"],
      "characterPositions": "CHAR-01 on Screen-Left; CHAR-02 on Screen-Right",
      "characterActions": "CHAR-01 stands motionless behind desk with jaw clenched; CHAR-02 takes a tentative step forward clutching her coat",
      "characterExpressions": "CHAR-01 intense, icy piercing gaze; CHAR-02 eyes wide with shock and unspoken heartbreak",
      "eyeDirection": "CHAR-01 eyes locked directly on CHAR-02's face; CHAR-02 gazing desperately into CHAR-01's eyes",
      "bodyOrientation": "CHAR-01 angled 35 degrees toward right; CHAR-02 angled 35 degrees toward left",
      "cameraPosition": "Eye-level 50mm cinema lens framing medium two-shot with shallow depth of field",
      "cameraMovement": "Subtle slow 2-inch cinematic push-in toward CHAR-01",
      "environment": "Dimly lit penthouse study, cold blue rainstorm outside glass window",
      "lighting": "Warm golden key light from desk lamp with cool moody blue rim light from the rain outside",
      "props": "Mahogany desk, crystal whiskey glass, sealed red dossier folder",
      "activeSpeaker": "CHAR-01",
      "listenerCharacter": "CHAR-02 (Lips sealed, mouth closed, moist emotional eyes, silent reaction)",
      "dialogue": "You spent five years planning this revenge... yet you tremble when you look at me.",
      "wordCount": 14,
      "voiceEmotion": "Low, gravelly baritone with restrained emotional heartbreak and dangerous composure",
      "beginningState": "Static room, rain beating on glass, CHAR-01 already watching CHAR-02 from behind the desk",
      "endingState": "CHAR-01 finishes sentence with intense eye lock; CHAR-02's lips part slightly in silent disbelief",
      "continuityConnectionToPrevious": "Opening clip of the episode"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Lead Continuity Supervisor for prestige cinema. Produce strictly valid JSON meeting all word count, eye-contact, and 180-degree axis constraints.',
    temperature: 0.7,
    responseJson: true,
  });

  if (!res.parsed || !Array.isArray(res.parsed.clipsBreakdown)) {
    throw new Error('Failed to generate Scene Continuity and Clips Breakdown JSON');
  }

  // Calculate exact word counts & deterministic location continuity
  const rawClips = res.parsed.clipsBreakdown || [];
  const clips: TenSecClipDef[] = rawClips.map((clip: any, idx: number) => {
    const words = clip.dialogue ? clip.dialogue.trim().split(/\s+/).filter(Boolean) : [];
    const isFirstClip = idx === 0;
    const prevClip = idx > 0 ? rawClips[idx - 1] : null;
    const sameScene = prevClip && clip.sceneNumber && prevClip.sceneNumber && clip.sceneNumber === prevClip.sceneNumber;
    const sameEnv =
      prevClip &&
      prevClip.environment &&
      clip.environment &&
      prevClip.environment.trim().toLowerCase().slice(0, 15) === clip.environment.trim().toLowerCase().slice(0, 15);

    const isContinuous =
      !isFirstClip &&
      (sameScene || sameEnv || clip.locationContinuityType === 'SAME_LOCATION_CONTINUOUS');

    return {
      ...clip,
      duration: '10 seconds',
      wordCount: words.length,
      locationContinuityType: isContinuous ? 'SAME_LOCATION_CONTINUOUS' : 'NEW_LOCATION_SCENE_CUT',
      frameReferenceStrategy: isContinuous ? 'USE_PREVIOUS_CLIP_END_FRAME' : 'NEW_STARTING_FRAME',
      frameReferenceNote: isContinuous
        ? `Location does not change from Clip ${clip.clipNumber - 1}. Use the ENDING FRAME (last frame) of Clip ${clip.clipNumber - 1} as the starting frame in Google Flow (Veo) Image-to-Video mode for 100% continuity.`
        : isFirstClip
        ? 'Episode opening establishing shot. Generate fresh starting frame.'
        : 'Scene transition / new location cut. Generate fresh establishing frame.',
    };
  });

  return {
    sceneContinuity: res.parsed.sceneContinuity || [],
    clipsBreakdown: clips,
  };
}

/**
 * PHASE 6 & 7: Generate Starting Frame Prompts and Motion Video Prompts (Real Human Drama)
 */
export async function generateFrameAndVideoPromptsPipeline(
  clips: TenSecClipDef[],
  characterBible: CharacterBible,
  sceneContinuity: SceneContinuityPlan[],
  aiConfig?: AIProviderConfig,
  aspectRatio: '16:9' | '9:16' = '16:9',
  locationSetting?: string
): Promise<{
  framePrompts: FramePromptItem[];
  videoPrompts: VideoPromptItem[];
}> {
  const charactersContext = characterBible.characters
    .map((c) => {
      const outfit = typeof c.clothing === 'string' ? c.clothing : c.clothing?.exactOutfit || 'Tailored luxury styling';
      const head = c.physicalAppearance?.headShape || 'Chiseled';
      const face = c.physicalAppearance?.faceStructure || 'Expressive';
      const eyes = c.morphologySpec?.eyeType || 'Focused gaze';
      const mouth = c.morphologySpec?.mouthPlacement || 'Disciplined';
      const texture = c.morphologySpec?.materialTexture || 'Photorealistic skin';
      const features = c.morphologySpec?.distinctiveFeatures || '';
      return `[${c.id} - ${c.name}]: ${c.speciesObject}. Appearance: ${head}, ${face}. Outfit: ${outfit}. Visual DNA: ${eyes}, ${mouth}, ${texture}, ${features}.`;
    })
    .join('\n');

  const clipsJson = JSON.stringify(clips);

  const prompt = `You are a Master Prompt Engineer for Google Flow (Veo) and Midjourney/Flux Photorealistic Cinema Generation.

TASK: Generate PHASE 6 (Still Frame Prompts) and PHASE 7 (10-Second Video Prompts) for REAL HUMAN EMOTIONAL DRAMA.
TARGET ASPECT RATIO: ${aspectRatio} (${aspectRatio === '16:9' ? '16:9 Cinematic Widescreen Landscape — emphasize horizontal depth, clear screen-left vs screen-right two-shot blocking, and razor-sharp horizontal eyeline contact between characters' : '9:16 Vertical Portrait Short-Form'})
LOCKED LOCATION SETTING: ${locationSetting || 'Luxury Midnight Penthouse & Study with rain-streaked glass walls'}

LOCKED CHARACTERS BIBLE:
${charactersContext}

CLIPS TO GENERATE:
${clipsJson}

CRITICAL RULES FOR FRAME PROMPTS (PHASE 6):
- Create the exact starting still image prompt for the 10-second clip.
- MUST SPECIFY REAL HUMAN CINEMATIC PHOTOREALISM:
  * 35mm film still, Panavision anamorphic lens, 85mm portrait bokeh, shot on Arri Alexa Mini LF.
  * Real human skin texture, visible natural pores, subtle moisture/tears, fine facial hair stubble, realistic hair strands.
  * Architectural Realism: Ground background strictly in real prestige drama settings (e.g. rain-streaked glass, dark mahogany, warm brass lamp chiaroscuro lighting against cold rainstorm neon).
  * NEGATIVE PROMPT EMBEDDED: Include at the end: [NEGATIVE: cartoon, anime, 3D render, CGI look, plastic doll skin, kitchen counter, appliances, toaster, mug, vegetable, anthropomorphic, miniature world, surreal abstract room, extra limbs].
  * Exact spatial position (Screen-Left vs Screen-Right), gaze vector, hand posture, lighting, and wardrobe.
  * Aspect ratio: ${aspectRatio}.

CRITICAL RULES FOR VIDEO PROMPTS (PHASE 7):
- Format must strictly follow this exact syntax:
  [Camera movement] + [Character action] + [Expression] + [Eye direction] + [Body language] + "Exact spoken dialogue" + [Voice emotion] + [Environmental movement]
- ACTIVE SPEAKER: The mouth moves ONLY for the active speaker with realistic human lip-sync.
- LISTENER: Non-speaking characters MUST have explicit tag: [LISTENER ONLY: Lips sealed, mouth closed, silent emotional reaction, no vocalization].
- Dialogue line must be identical to the approved clip dialogue.

Return STRICT JSON only matching this schema:
{
  "framePrompts": [
    {
      "clipNumber": 1,
      "prompt": "Cinematic 35mm film still, photorealistic prestige drama (${aspectRatio}): CHAR-01 framed on Screen-Left looking toward Screen-Right... [NEGATIVE: cartoon, 3D CGI, plastic skin, kitchen counter, toaster, mug, vegetable, miniature world]",
      "aspectRatio": "${aspectRatio}",
      "styleTag": "Photorealistic 35mm Film Still"
    }
  ],
  "videoPrompts": [
    {
      "clipNumber": 1,
      "prompt": "[Slow subtle 35mm push-in] [CHAR-01 steps forward slowly behind the mahogany desk, resting fingertips on the wood] [Piercing, sorrowful narrowed eyes with jaw clenching] [Eyes locked strictly on CHAR-02's face on screen-right at +35 degree angle] [Tense, upright posture in tailored cashmere coat] \\"Exact dialogue line here\\" [Low gravelly baritone with restrained emotional heartbreak] [Heavy rain streaming down glass window in background with soft neon reflections]. [LISTENER DIRECTIVE: CHAR-02 standing on screen-right remains with lips sealed, mouth closed, tear glistening in eye, watching in silent disbelief].",
      "activeSpeaker": "CHAR-01",
      "listenerDirective": "CHAR-02 lips sealed, mouth closed, zero vocalization",
      "dialogueLine": "Exact dialogue line here"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Google Flow & Veo Prompt Specialist for Photorealistic Cinema. Produce strictly valid JSON matching the exact prompt syntax.',
    temperature: 0.7,
    responseJson: true,
  });

  if (
    !res.parsed ||
    !Array.isArray(res.parsed.framePrompts) ||
    !Array.isArray(res.parsed.videoPrompts)
  ) {
    throw new Error('Failed to generate Frame and Video Prompts JSON');
  }

  const rawFrames = res.parsed.framePrompts || [];
  const framePrompts: FramePromptItem[] = rawFrames.map((fp: any, idx: number) => {
    const clip = clips[idx];
    const isContinuous = clip?.frameReferenceStrategy === 'USE_PREVIOUS_CLIP_END_FRAME';
    const prevClipNum = clip ? clip.clipNumber - 1 : idx;

    return {
      ...fp,
      isContinuousFromPrevious: isContinuous,
      previousClipReference: isContinuous ? prevClipNum : undefined,
      frameStrategy: isContinuous ? 'USE_PREVIOUS_CLIP_END_FRAME' : 'NEW_STARTING_FRAME',
      workflowInstruction: isContinuous
        ? `🔄 SAME LOCATION CONTINUATION: Location does NOT change from Clip ${prevClipNum}. Do not generate a new image from scratch. Use the ENDING FRAME (last frame) of Clip ${prevClipNum} directly as the starting image in Google Flow (Veo) Image-to-Video mode for 100% actor and environment continuity.`
        : `🎬 NEW SCENE CUT: Generate a fresh starting frame using this prompt.`,
    };
  });

  return {
    framePrompts,
    videoPrompts: res.parsed.videoPrompts,
  };
}

/**
 * PHASE 8: Director Agent QA & Continuity Verification (Real Human Drama)
 */
export async function runDirectorQAPipeline(
  clips: TenSecClipDef[],
  framePrompts: FramePromptItem[],
  videoPrompts: VideoPromptItem[],
  characterBible: CharacterBible,
  sceneContinuity: SceneContinuityPlan[],
  aiConfig?: AIProviderConfig
): Promise<DirectorQAPackage> {
  const auditData = {
    characters: characterBible.characters.map((c) => ({ id: c.id, name: c.name })),
    continuity: sceneContinuity,
    clips: clips.map((c) => ({
      clipNumber: c.clipNumber,
      positions: c.characterPositions,
      activeSpeaker: c.activeSpeaker,
      dialogue: c.dialogue,
      wordCount: c.wordCount,
      eyeDirection: c.eyeDirection,
    })),
    frames: framePrompts,
    videos: videoPrompts,
  };

  const prompt = `You are the Master Film Director Agent & Chief Continuity QA Auditor.

TASK: Audit every single clip in this REAL HUMAN DRAMA episode against the 9 Continuity Dimensions:
1. Character Continuity (Actor facial bone structure, hair, clothing, signature accessories)
2. Position Continuity (Correct screen-left/right positions, no teleporting)
3. Eye Contact (Speaker looks at listener; listener looks at speaker; uninterrupted eyeline)
4. Expression Continuity (Human emotional expression matches dialogue and continues logically)
5. Clothing Continuity (Tailored outfits and accessories remain locked)
6. Location Continuity (Environment, lighting, props stay stable)
7. Action Continuity (Props held remain in hand, doors stay open)
8. Camera Continuity (180-degree rule respected, no spatial confusion)
9. Dialogue & Lip-Sync (Word count under 18 words, only active speaker speaks, listener lips sealed)

AUDIT DATA:
${JSON.stringify(auditData)}

For every clip, decide if it PASSES or if REVISION IS REQUIRED. If revision is required, provide the exact correction.

Return STRICT JSON only matching this schema:
{
  "overallStatus": "PRODUCTION READY",
  "summary": "Director QA verdict summary covering emotional pacing, actor continuity, and Flow Veo execution readiness",
  "clipReviews": [
    {
      "clipNumber": 1,
      "status": "PASS",
      "checks": {
        "characterContinuity": true,
        "positionContinuity": true,
        "eyeContact": true,
        "expressionContinuity": true,
        "clothingContinuity": true,
        "locationContinuity": true,
        "actionContinuity": true,
        "cameraContinuity": true,
        "dialogueLipSync": true
      },
      "issuesIdentified": [],
      "requiredCorrections": []
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are the Lead Director QA Inspector. Return strictly valid JSON with rigorous continuity analysis.',
    temperature: 0.3,
    responseJson: true,
  });

  if (!res.parsed || !Array.isArray(res.parsed.clipReviews)) {
    throw new Error('Failed to run Director QA pipeline');
  }

  return res.parsed as DirectorQAPackage;
}
