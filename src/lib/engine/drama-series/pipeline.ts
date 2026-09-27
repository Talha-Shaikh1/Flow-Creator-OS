import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';
import {
  SeasonStory,
  CharacterBible,
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
  aiConfig?: AIProviderConfig
): Promise<SeasonStory> {
  const prompt = `You are a Prestige Television Showrunner, Melodrama Director, and Master Screenwriter specializing in high-stakes REAL HUMAN EMOTIONAL DRAMA, INTENSE LOVE STORIES, BETRAYAL, AND REVENGE SAGAS (HBO, A24, prestige Kdrama, and cinematic British/American character dramas).

TASK: Develop PHASE 1: SEASON STORY DEVELOPMENT based on this concept:
"${seedTopic}"
Genre: ${genre}

CRITICAL STORYTELLING RULES:
- CHARACTERS ARE REAL HUMAN BEINGS: Photorealistic human actors, complex emotional psychologies, intense romance, suppressed passion, heartbreak, family vendettas, and calculated revenge.
- Focus ONLY on high-level season and episodic narrative arcs. No camera prompts at this stage.
- Divide the season into 4 to 6 serialized, tightly connected episodes.
- Ensure every episode has a high-stakes emotional confrontation, a sharp dramatic escalation, and a cliffhanger hook that leaves the audience breathless.
- Return STRICT JSON only matching the schema below.

JSON SCHEMA:
{
  "seasonTitle": "Evocative Cinematic Season Title",
  "genre": "${genre}",
  "mainTheme": "Core emotional theme (e.g. Unresolved love vs ruthless revenge, the cost of loyalty, hidden past sacrifices)",
  "worldEnvironment": "High-end cinematic real-world setting (e.g. Rain-slicked luxury penthouse in Manhattan overlooking a midnight skyline; moody coastal villa; candlelit executive boardroom)",
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

  return res.parsed as SeasonStory;
}

/**
 * PHASE 2: Generate Locked Character Bible from Approved Season Story (Real Human Actors)
 */
export async function generateCharacterBiblePipeline(
  seasonStory: SeasonStory,
  aiConfig?: AIProviderConfig
): Promise<CharacterBible> {
  const prompt = `You are a Lead Casting Director, Hair & Makeup Head, and Cinematic Actor Performance Supervisor.

TASK: Develop PHASE 2: LOCKED CHARACTER BIBLE for REAL HUMAN ACTORS based on the approved Season Story:
Title: "${seasonStory.seasonTitle}"
World: "${seasonStory.worldEnvironment}"
Theme: "${seasonStory.mainTheme}"

CRITICAL RULES:
- CHARACTERS ARE REAL HUMAN BEINGS (Fictional photorealistic digital actors): Age, facial bone structure, ethnic heritage, hair, tailored wardrobe, vocal timbre, and micro-expressions.
- Assign permanent IDs: CHAR-01 (Protagonist), CHAR-02 (Rival/Lover), etc.
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
      "personality": "Calculating, guarded, intensely passionate, haunted by past sacrifices, speaks with quiet authority",
      "roleInStory": "Main Character",
      "morphologySpec": {
        "eyeType": "Deep slate-grey eyes with intense emotional depth, natural moisture and faint red rimming from suppressed tears",
        "mouthPlacement": "Sculpted lips, tense jawline that clenches visibly during confrontation, subtle quiver when vulnerable",
        "limbPhysics": "Poised, commanding posture; defensive hands in coat pockets or gripping furniture with white knuckles",
        "materialTexture": "Photorealistic human skin with visible natural pores, light five o'clock shadow stubble, subtle rain sheen",
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
        "accessories": "Vintage platinum watch with black leather strap, monogrammed silver lighter",
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
        "accent": "Refined Mid-Atlantic / Transatlantic cadence",
        "speakingSpeed": "Deliberate 120 WPM with pregnant, suspenseful pauses before revelations",
        "emotionalStyle": "Restrained intensity; voice lowers to a dangerous whisper when furious"
      },
      "continuityRules": [
        "Signet ring MUST always remain on the left pinky",
        "Overcoat collar stays popped on the left side",
        "Hair has consistent damp rain styling throughout the scene"
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
      'You are a Master Casting and Visual DNA Supervisor for prestige cinema. Produce an exhaustive, locked Character Bible in strictly valid JSON.',
    temperature: 0.75,
    responseJson: true,
  });

  if (!res.parsed || !Array.isArray(res.parsed.characters)) {
    throw new Error('Failed to generate valid Character Bible JSON');
  }

  return res.parsed as CharacterBible;
}

/**
 * PHASE 3: Generate Episode Production Breakdown (Real Human Drama)
 */
export async function generateEpisodeProductionPipeline(
  seasonStory: SeasonStory,
  characterBible: CharacterBible,
  episodeNumber: number,
  aiConfig?: AIProviderConfig
): Promise<EpisodeProductionSheet> {
  const selectedEp =
    seasonStory.episodes.find((e) => e.episodeNumber === episodeNumber) || seasonStory.episodes[0];

  const charSummary = characterBible.characters
    .map((c) => `${c.id} (${c.name}): ${c.speciesObject}, ${c.personality}`)
    .join('\n');

  const prompt = `You are a Senior Drama Series Director and Screenwriter.

TASK: Develop PHASE 3: EPISODE PRODUCTION BREAKDOWN for Episode ${episodeNumber}: "${selectedEp.episodeTitle}".

CONTEXT:
Season: "${seasonStory.seasonTitle}"
World: "${seasonStory.worldEnvironment}"
Episode Summary: "${selectedEp.mainStory}"
Conflict: "${selectedEp.mainConflict}"
Cast Available:
${charSummary}

CRITICAL RULES:
- REAL HUMAN EMOTIONAL DRAMA: Romantic tension, bitter heartbreak, betrayal, and revenge.
- Target Runtime: 40 to 60 seconds (4 to 6 continuous 10-second clips).
- Break the episode into 2 to 3 cinematic scenes with seamless emotional escalation.
- Blocking: Physical proximity, stepping into each other's personal space, turning away in pain, touching or slamming props.
- Return STRICT JSON only matching this schema.

JSON SCHEMA:
{
  "episodeNumber": ${episodeNumber},
  "episodeTitle": "${selectedEp.episodeTitle}",
  "runtimeTarget": "40-60s (4-6 clips)",
  "storySummary": "${selectedEp.mainStory}",
  "characterList": ["CHAR-01", "CHAR-02"],
  "locationList": ["Midnight Penthouse Study", "Rain-Drenched Glass Balcony"],
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
  aiConfig?: AIProviderConfig
): Promise<{
  sceneContinuity: SceneContinuityPlan[];
  clipsBreakdown: TenSecClipDef[];
}> {
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

LOCKED CAST:
${charactersJson}

CRITICAL RULES:
1. SPATIAL GEOMETRY & 180° AXIS LOCK:
   - Establish the camera side. The camera must NEVER cross the 180-degree axis line between CHAR-01 and CHAR-02.
   - Screen-Left character must remain screen-left in reverse-shots (looking screen-right at listener).
   - Screen-Right character must remain screen-right (looking screen-left at listener).
2. 10-SECOND CLIP STRUCTURE:
   - Exactly 4 to 6 clips (each exactly 10 seconds).
   - A character must NOT teleport, change clothing, or alter hair styling between clips.
   - Every clip begins from the logical ending state of the previous clip.
3. DIALOGUE & SPEAKER ISOLATION (VEO HARD CONSTRAINT):
   - HARD WORD BUDGET: Maximum 14 to 18 words per 10-second clip! (Pacing for emotional human delivery with breath pauses).
   - STRICT SINGLE SPEAKER: Exactly ONE active speaking character per clip!
   - Non-speaking character in frame must be explicitly marked as LISTENER ONLY with lips sealed and emotional reaction.
   - EYE CONTACT: Speaker must look directly into the other character's eyes.
4. 0-3S HOOK IN CLIP 1:
   - Clip 1 MUST have an immediate emotional shock hook in the first 3 seconds (e.g. an unexpected confrontation, a dossier slammed down, tear glistening on cheek).

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

  // Calculate exact word counts
  const clips: TenSecClipDef[] = res.parsed.clipsBreakdown.map((clip: any) => {
    const words = clip.dialogue ? clip.dialogue.trim().split(/\s+/).filter(Boolean) : [];
    return {
      ...clip,
      duration: '10 seconds',
      wordCount: words.length,
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
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<{
  framePrompts: FramePromptItem[];
  videoPrompts: VideoPromptItem[];
}> {
  const charactersContext = characterBible.characters
    .map(
      (c) =>
        `[${c.id} - ${c.name}]: ${c.speciesObject}. Appearance: ${c.physicalAppearance.headShape}, ${c.physicalAppearance.faceStructure}. Outfit: ${c.clothing.exactOutfit}. Visual DNA: ${c.morphologySpec.eyeType}, ${c.morphologySpec.mouthPlacement}, ${c.morphologySpec.materialTexture}, ${c.morphologySpec.distinctiveFeatures}.`
    )
    .join('\n');

  const clipsJson = JSON.stringify(clips);

  const prompt = `You are a Master Prompt Engineer for Google Flow (Veo) and Midjourney/Flux Photorealistic Cinema Generation.

TASK: Generate PHASE 6 (Still Frame Prompts) and PHASE 7 (10-Second Video Prompts) for REAL HUMAN EMOTIONAL DRAMA.
TARGET ASPECT RATIO: ${aspectRatio} (${aspectRatio === '16:9' ? '16:9 Cinematic Widescreen Landscape — emphasize horizontal depth, clear screen-left vs screen-right two-shot blocking, and razor-sharp horizontal eyeline contact between characters' : '9:16 Vertical Portrait Short-Form'})

LOCKED CHARACTERS BIBLE:
${charactersContext}

CLIPS TO GENERATE:
${clipsJson}

CRITICAL RULES FOR FRAME PROMPTS (PHASE 6):
- Create the exact starting still image prompt for the 10-second clip.
- MUST SPECIFY REAL HUMAN CINEMATIC PHOTOREALISM:
  * 35mm film still, Panavision anamorphic lens, 85mm portrait bokeh.
  * Real human skin texture, visible natural pores, subtle moisture/tears, fine facial hair stubble, realistic hair strands.
  * No plastic AI smoothing, no cartoon or stylized 3D looks — 100% photorealistic prestige movie aesthetic (Netflix/HBO drama).
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
      "prompt": "Cinematic 35mm film still, photorealistic prestige drama (${aspectRatio}): CHAR-01 framed on Screen-Left looking toward Screen-Right...",
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

  return {
    framePrompts: res.parsed.framePrompts,
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
