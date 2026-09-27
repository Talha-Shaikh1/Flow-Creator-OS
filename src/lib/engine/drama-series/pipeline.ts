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
 * PHASE 1: Generate Complete Season Story Concept & Episode Arcs
 */
export async function generateSeasonStoryPipeline(
  seedTopic: string,
  genre: string = 'Cinematic 3D Animated Comedy / Drama',
  aiConfig?: AIProviderConfig
): Promise<SeasonStory> {
  const prompt = `You are a Master AI Animation Director and Story Architect specializing in high-retention 3D anthropomorphic object/animal/vegetable animated series (Pixar & DreamWorks quality).

TASK: Develop PHASE 1: SEASON STORY DEVELOPMENT based on this concept:
"${seedTopic}"
Genre: ${genre}

CRITICAL RULES:
- Focus ONLY on high-level season and episode storytelling. No video/image prompts.
- Divide the season into 4 to 6 serialized, tightly connected episodes.
- Ensure characters have clear personalities, funny relatable conflicts, and emotional stakes.
- Return STRICT JSON only matching the schema below.

JSON SCHEMA:
{
  "seasonTitle": "Catchy Animated Season Title",
  "genre": "${genre}",
  "mainTheme": "Core emotional & comedic theme (e.g. impostor syndrome, culinary ambition)",
  "worldEnvironment": "Specific animated micro-world (e.g. Michelin Star Kitchen counter after midnight)",
  "overallTone": "Fast-paced satirical comedy with genuine heart",
  "comedyStyle": "Visual slapstick, witty dialogue, deadpan object reactions",
  "emotionalStyle": "Earnest vulnerability beneath humorous chaos",
  "narrativeArc": "Overarching season journey from beginning status quo to climax",
  "beginning": "How the season opens and introduces the conflict",
  "majorDevelopments": "Key plot escalations across the season",
  "majorConflicts": "Internal and external rivalries/obstacles",
  "characterRelationships": "Dynamic interplay between lead characters",
  "recurringSituations": "Funny running gags or recurring situations",
  "importantCallbacks": "Specific props or lines that pay off later in the season",
  "seasonClimax": "High-stakes dramatic/comedic peak in the penultimate/final episode",
  "seasonEnding": "Satisfying resolution and cliffhanger hook for next season",
  "episodes": [
    {
      "episodeNumber": 1,
      "episodeTitle": "Episode Title",
      "mainStory": "Core plot of this episode",
      "mainConflict": "What goes wrong or who clashes",
      "beginning": "Opening hook (0-3s pattern interrupt)",
      "middle": "Escalation and peak argument/chaos",
      "ending": "Cliffhanger ending or comedic punchline",
      "charactersInvolved": ["Character Name 1", "Character Name 2"],
      "importantEmotionalBeats": "Key emotional realization",
      "comedyMoments": "Specific laugh-out-loud visual/verbal gags",
      "connectionWithPrevious": "N/A for Ep 1, or callback",
      "setupForFuture": "Thread left unresolved for Ep 2"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are an elite Hollywood animation showrunner. Return strictly valid JSON. Do not wrap in markdown.',
    temperature: 0.8,
    responseJson: true,
  });

  if (!res.parsed || !res.parsed.seasonTitle) {
    throw new Error('Failed to generate valid Season Story JSON');
  }

  return res.parsed as SeasonStory;
}

/**
 * PHASE 2: Generate Locked Character Bible from Approved Season Story
 */
export async function generateCharacterBiblePipeline(
  seasonStory: SeasonStory,
  aiConfig?: AIProviderConfig
): Promise<CharacterBible> {
  const prompt = `You are a Master Character Designer and Animation Technical Director.

TASK: Develop PHASE 2: LOCKED CHARACTER BIBLE based on the approved Season Story:
Title: "${seasonStory.seasonTitle}"
World: "${seasonStory.worldEnvironment}"
Theme: "${seasonStory.mainTheme}"

CRITICAL RULES:
- Analyze the season and extract ALL key characters (Main, Recurring, Supporting).
- Assign permanent IDs: CHAR-01, CHAR-02, etc.
- For 3D Anthropomorphic Objects/Vegetables/Animals, provide strict MORPHOLOGY specs (eye placement, mouth mechanics, limb physics, materials).
- Define exact acting expressions, voice cadence, and LOCKED continuity rules that must never drift.
- Return STRICT JSON only.

JSON SCHEMA:
{
  "characters": [
    {
      "id": "CHAR-01",
      "name": "Character Name",
      "speciesObject": "e.g. Weathered Ceramic Espresso Mug with Chip on Rim",
      "ageAppearance": "30s exhausted professional",
      "genderPresentation": "Masculine / Neutral",
      "personality": "Cynical, hyper-intellectual, secretly protective, sarcastic",
      "roleInStory": "Main Character",
      "morphologySpec": {
        "eyeType": "Pixar-grade stylized expressive cartoon eyeballs embedded into surface with gloss highlight",
        "mouthPlacement": "Rubbery pliable mouth carved into upper ceramic curve, teeth visible when shouting",
        "limbPhysics": "Curved porcelain handle functions as a gestural arm; walks by hopping with clay-like bounce",
        "materialTexture": "Matte cracked off-white ceramic with dried coffee drip stains on side",
        "distinctiveFeatures": "Small 2mm hairline crack on left rim that wiggles when nervous"
      },
      "physicalAppearance": {
        "headShape": "Cylindrical ceramic mug silhouette with slight taper at base",
        "faceStructure": "Front-facing animated facial features centered between handle and spout",
        "bodyProportions": "Top-heavy, stout 4-inch height",
        "distinctiveFeatures": "Signature steam rising in subtle swirls when agitated"
      },
      "clothing": {
        "exactOutfit": "Tiny brown leather detective fedora perched between rim and handle",
        "colors": "Antique mahogany brown leather, tarnished brass buckle",
        "materials": "Worn stitched leather with fabric inner lining",
        "accessories": "Miniature toothpick held like a cigarette in handle grip",
        "propsNormallyCarried": "Stained receipt notepad tucked under base"
      },
      "acting": {
        "normalExpression": "Slightly narrowed eyes, unimpressed straight mouth line",
        "happyExpression": "Wide open-mouthed grin, steam shooting up happily in double puffs",
        "sadExpression": "Drooping upper eyelids, steam fading to thin wisp, downward curved mouth",
        "angryExpression": "Furrowed brow ridges, bubbling coffee surface, intense eye squint",
        "comedicExpression": "Jaw dropped to the floor, eyes bulging out with classic squash-and-stretch",
        "typicalBodyLanguage": "Tilts backward 15 degrees when making a sarcastic remark"
      },
      "voice": {
        "voiceType": "Gravelly noir detective baritone with fast cadence",
        "ageImpression": "Mid 40s exhausted investigator",
        "accent": "Subtle Brooklyn / Mid-Atlantic grit",
        "speakingSpeed": "Crisp 130 WPM with dramatic pauses before punchlines",
        "emotionalStyle": "Deadpan cynicism masking genuine concern"
      },
      "continuityRules": [
        "Rim chip MUST always remain on the upper left rim",
        "Toothpick prop must always remain in left handle grip unless explicitly discarded",
        "Steam color is always warm white translucent vapor, never colored smoke"
      ]
    }
  ],
  "lockedRules": [
    "Permanent character IDs (CHAR-01, CHAR-02) must never be swapped",
    "Eyes and mouth morphology must stay identical across all camera angles",
    "No sudden wardrobe changes without explicit narrative costume change scene"
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Lead Pixar Character Supervisor. Produce an exhaustive, locked Character Bible in strictly valid JSON.',
    temperature: 0.75,
    responseJson: true,
  });

  if (!res.parsed || !Array.isArray(res.parsed.characters)) {
    throw new Error('Failed to generate valid Character Bible JSON');
  }

  return res.parsed as CharacterBible;
}

/**
 * PHASE 3: Generate Episode Production Breakdown
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

  const prompt = `You are a Senior Animation Director.

TASK: Develop PHASE 3: EPISODE PRODUCTION BREAKDOWN for Episode ${episodeNumber}: "${selectedEp.episodeTitle}".

CONTEXT:
Season: "${seasonStory.seasonTitle}"
World: "${seasonStory.worldEnvironment}"
Episode Summary: "${selectedEp.mainStory}"
Conflict: "${selectedEp.mainConflict}"
Characters Available:
${charSummary}

CRITICAL RULES:
- Runtime Target: 40 to 60 seconds (4 to 6 continuous 10-second clips).
- Break the episode into 2 to 3 distinct scenes with logical transitions.
- Focus on sharp comedic escalation, precise character blocking, and emotional payoff.
- Return STRICT JSON only matching this schema.

JSON SCHEMA:
{
  "episodeNumber": ${episodeNumber},
  "episodeTitle": "${selectedEp.episodeTitle}",
  "runtimeTarget": "40-60s (4-6 clips)",
  "storySummary": "${selectedEp.mainStory}",
  "characterList": ["CHAR-01", "CHAR-02"],
  "locationList": ["Kitchen Counter Near Toaster", "Under Refrigerator Shadow"],
  "timeline": "Midnight 00:03 AM",
  "emotionalProgression": "Smug confidence -> Sudden panic -> Hilarious compromise",
  "comedyBeats": "Physical slip on butter, ridiculous dramatic interrogation of a blueberry",
  "dialogueFlow": "Fast-paced banter with sharp comedic retorts",
  "arcStructure": "Hook -> Incident -> Escalation -> Climax -> Cliffhanger",
  "scenes": [
    {
      "sceneNumber": 1,
      "scenePurpose": "Establish the 0-3s hook, the stakes, and the immediate confrontation",
      "location": "Kitchen Counter Near Toaster",
      "timeOfDay": "Midnight, dim warm moonlight through blinds",
      "charactersPresent": ["CHAR-01", "CHAR-02"],
      "characterPositions": "CHAR-01 is screen-left standing on wooden cutting board; CHAR-02 is screen-right perched on toaster rim",
      "characterActions": "CHAR-01 slams toothpick down; CHAR-02 crosses arms smugly",
      "characterEmotionalStates": "CHAR-01 suspicious and furious; CHAR-02 condescending and amused",
      "props": "Wooden cutting board, crumb trail, chrome toaster",
      "backgroundActivity": "Digital refrigerator clock glowing 00:03 in background",
      "cameraConcept": "Medium-wide establishing shot cutting to intimate 35mm two-shot",
      "dialogue": "Exact line planned for the scene",
      "transitionFromPrevious": "Episode opening cold open with sudden kitchen ambient hum",
      "transitionIntoNext": "CHAR-02 kicks a crumb toward floor, initiating camera pan down"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are an Animation Episode Director. Return strictly valid JSON conforming to the schema.',
    temperature: 0.75,
    responseJson: true,
  });

  if (!res.parsed || !res.parsed.scenes) {
    throw new Error('Failed to generate Episode Production Sheet JSON');
  }

  return res.parsed as EpisodeProductionSheet;
}

/**
 * PHASE 4 & 5: Generate Scene Continuity Planning & 10-Second Clip Breakdown
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
      species: c.speciesObject,
      voice: c.voice,
      morphology: c.morphologySpec,
    }))
  );

  const prompt = `You are an Animation Continuity Supervisor and Technical Camera Director.

TASK: Develop PHASE 4 (Scene Continuity Planning) and PHASE 5 (10-Second Clip Breakdown) for:
Episode ${episodeSheet.episodeNumber}: "${episodeSheet.episodeTitle}"
Scenes to cover: ${JSON.stringify(episodeSheet.scenes)}

LOCKED CAST:
${charactersJson}

CRITICAL RULES:
1. SPATIAL GEOMETRY & 180° AXIS LOCK:
   - Establish the camera side. The camera must NEVER cross the 180-degree axis.
   - Screen-Left character must remain screen-left in reverse-shots (looking screen-right).
   - Screen-Right character must remain screen-right (looking screen-left).
2. 10-SECOND CLIP STRUCTURE:
   - Exactly 4 to 6 clips (each exactly 10 seconds).
   - A character must NOT teleport, morph, or change clothing between clips.
   - Every clip begins from the logical ending state of the previous clip.
3. DIALOGUE & SPEAKER ISOLATION (VEO HARD CONSTRAINT):
   - HARD WORD BUDGET: Maximum 14 to 18 words per 10-second clip! (Never 25+ words).
   - STRICT SINGLE SPEAKER: Exactly ONE active speaking character per clip!
   - Non-speaking characters in frame must be explicitly marked as LISTENER ONLY with lips sealed.
   - EYE CONTACT: Speaker must look directly at listener's eyes (or directly at camera lens if 4th wall break).
4. 0-3S HOOK IN CLIP 1:
   - Clip 1 MUST have an immediate visual shock or physical comedy hook in the first 3 seconds.

Return STRICT JSON only matching this schema:
{
  "sceneContinuity": [
    {
      "sceneNumber": 1,
      "cameraSide": "South-West side of counter, facing North-East",
      "axisOfAction180": "Imaginary axis runs East-West between CHAR-01 and CHAR-02. All camera setups stay on the South side of this line.",
      "characterSpatialMapping": "CHAR-01 is locked Screen-Left looking screen-right (angle +30°); CHAR-02 is locked Screen-Right looking screen-left (angle -30°)",
      "distanceBetweenCharacters": "Approximately 18 inches apart across cutting board",
      "environmentalAnchors": "Toaster on right, cutting board in center, refrigerator blurred in background",
      "characterEntrancePoints": "CHAR-01 enters hopping from left counter",
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
      "characterActions": "CHAR-01 hops forward aggressively and slams toothpick on cutting board; CHAR-02 tilts head back with smirk",
      "characterExpressions": "CHAR-01 wide angry eyes with steam puff; CHAR-02 smug half-lidded eyes",
      "eyeDirection": "CHAR-01 eyes locked on CHAR-02's face; CHAR-02 gazing down at CHAR-01",
      "bodyOrientation": "CHAR-01 angled 35 degrees toward right; CHAR-02 angled 35 degrees toward left",
      "cameraPosition": "Eye-level 35mm cinema lens framing medium two-shot",
      "cameraMovement": "Subtle 2-inch slow push-in focusing toward CHAR-01",
      "environment": "Dim midnight kitchen counter with moonlight rim light",
      "lighting": "Warm ambient lamp glow from behind counter with cool blue moonlight fill",
      "props": "Wooden cutting board, toothpick, breadcrumbs",
      "activeSpeaker": "CHAR-01",
      "listenerCharacter": "CHAR-02 (Lips sealed, mouth closed, silent condescending listening reaction)",
      "dialogue": "Short, punchy 14-18 word line delivered with high comedic tension.",
      "wordCount": 16,
      "voiceEmotion": "Aggressive, gravelly, breathless indignation",
      "beginningState": "Static counter, CHAR-01 lands on cutting board with a soft ceramic thud",
      "endingState": "CHAR-01 leaning forward with steam hissing; CHAR-02 raising one ceramic eyebrow",
      "continuityConnectionToPrevious": "Opening clip of episode"
    }
  ]
}`;

  const res = await callUniversalLLM({
    config: aiConfig,
    prompt,
    systemInstruction:
      'You are a Lead Continuity Supervisor for Pixar. Produce strictly valid JSON meeting all word count and 180-degree axis constraints.',
    temperature: 0.7,
    responseJson: true,
  });

  if (!res.parsed || !Array.isArray(res.parsed.clipsBreakdown)) {
    throw new Error('Failed to generate Scene Continuity and Clips Breakdown JSON');
  }

  // Double check and calculate exact word counts
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
 * PHASE 6 & 7: Generate Starting Frame Prompts and Motion Video Prompts
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
        `[${c.id} - ${c.name}]: ${c.speciesObject}. Appearance: ${c.physicalAppearance.headShape}, ${c.physicalAppearance.faceStructure}. Outfit: ${c.clothing.exactOutfit}. Morphology: ${c.morphologySpec.eyeType}, ${c.morphologySpec.mouthPlacement}, ${c.morphologySpec.limbPhysics}, ${c.morphologySpec.materialTexture}.`
    )
    .join('\n');

  const clipsJson = JSON.stringify(clips);

  const prompt = `You are a Master Prompt Engineer for Google Flow (Veo) and Midjourney/Flux 3D animation generation.

TASK: Generate PHASE 6 (Still Frame Prompts) and PHASE 7 (10-Second Video Prompts) for each clip.
TARGET ASPECT RATIO: ${aspectRatio} (${aspectRatio === '16:9' ? '16:9 Cinematic Widescreen Landscape — emphasize generous horizontal spatial depth, clear screen-left vs screen-right two-shot blocking, and razor-sharp horizontal eyeline contact between characters' : '9:16 Vertical Portrait Short-Form'})

LOCKED CHARACTERS BIBLE:
${charactersContext}

CLIPS TO GENERATE:
${clipsJson}

CRITICAL RULES FOR FRAME PROMPTS (PHASE 6):
- Create the exact starting still image prompt for the 10-second clip.
- Must specify: Character identity, exact morphology, clothing, spatial position (Screen-Left vs Screen-Right), gaze vector, hand posture, lighting, 3D animated cinematic rendering (Pixar/DreamWorks aesthetic, Octane render, raytracing, subsurface scattering on materials).
- Aspect ratio: ${aspectRatio} (${aspectRatio === '16:9' ? 'Cinematic 16:9 Widescreen' : 'Vertical 9:16 portrait'}).

CRITICAL RULES FOR VIDEO PROMPTS (PHASE 7):
- Format must strictly follow this exact syntax:
  [Camera movement] + [Character action] + [Expression] + [Eye direction] + [Body language] + "Exact spoken dialogue" + [Voice emotion] + [Environmental movement]
- ACTIVE SPEAKER: The mouth moves ONLY for the active speaker.
- LISTENER: Non-speaking characters MUST have explicit tag: [LISTENER ONLY: Lips sealed, mouth closed, silent attentive reaction, no vocalization].
- Dialogue line must be identical to the approved clip dialogue.

Return STRICT JSON only matching this schema:
{
  "framePrompts": [
    {
      "clipNumber": 1,
      "prompt": "Detailed 3D cinematic animation still frame prompt (${aspectRatio})...",
      "aspectRatio": "${aspectRatio}",
      "styleTag": "Cinematic 3D Animated Feature Film"
    }
  ],
  "videoPrompts": [
    {
      "clipNumber": 1,
      "prompt": "[Slow subtle 35mm push-in] [CHAR-01 hops forward aggressively on cutting board and slams toothpick down] [Furious narrowed cartoon eyes with small steam puff rising] [Eyes locked strictly toward CHAR-02 screen-right at +30 degree angle] [Leaning forward with tense porcelain body posture] \\"Exact dialogue line here\\" [Gravelly, breathless indignation voice tone] [Soft background dust motes drifting in moonlit counter light, refrigerator clock glowing in blurred background]. [LISTENER DIRECTIVE: CHAR-02 standing screen-right remains with lips sealed, mouth closed, raising one sarcastic eyebrow silently].",
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
      'You are a Google Flow & Veo Prompt Specialist. Produce strictly valid JSON matching the exact prompt syntax.',
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
 * PHASE 8: Director Agent QA & Continuity Verification
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

  const prompt = `You are the Master Animation Director Agent & Chief Continuity QA Auditor.

TASK: Audit every single clip in this episode against the 9 Continuity Dimensions:
1. Character Continuity (Face, proportions, clothing, morphology)
2. Position Continuity (Correct screen-left/right positions, no teleporting)
3. Eye Contact (Speaker looks at listener; listener looks at speaker; no contradictory gaze)
4. Expression Continuity (Expression matches dialogue and continues logically)
5. Clothing Continuity (Outfits and accessories locked)
6. Location Continuity (Environment, lighting, props stay stable)
7. Action Continuity (Props picked up do not disappear, doors stay open)
8. Camera Continuity (180-degree rule respected, no spatial confusion)
9. Dialogue & Lip-Sync (Word count under 18 words, only active speaker speaks, listener lips sealed)

AUDIT DATA:
${JSON.stringify(auditData)}

For every clip, decide if it PASSES or if REVISION IS REQUIRED. If revision is required, provide the exact correction.

Return STRICT JSON only matching this schema:
{
  "overallStatus": "PRODUCTION READY", // or "REVISION REQUIRED"
  "summary": "Director QA verdict summary covering continuity stability and Flow Veo execution readiness",
  "clipReviews": [
    {
      "clipNumber": 1,
      "status": "PASS", // or "REVISION REQUIRED"
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
