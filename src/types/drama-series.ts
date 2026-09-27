export interface SeasonStory {
  seasonTitle: string;
  genre: string;
  mainTheme: string;
  worldEnvironment: string;
  overallTone: string;
  comedyStyle: string;
  emotionalStyle: string;
  narrativeArc: string;
  beginning: string;
  majorDevelopments: string;
  majorConflicts: string;
  characterRelationships: string;
  recurringSituations: string;
  importantCallbacks: string;
  seasonClimax: string;
  seasonEnding: string;
  charactersInvolved?: string[];
  runtimeTarget?: string;
  episodes: EpisodeStorySummary[];
}

export interface EpisodeStorySummary {
  episodeNumber: number;
  episodeTitle: string;
  mainStory: string;
  mainConflict: string;
  beginning: string;
  middle: string;
  ending: string;
  charactersInvolved: string[];
  importantEmotionalBeats: string;
  comedyMoments: string;
  connectionWithPrevious: string;
  setupForFuture: string;
}

export interface CharacterBibleItem {
  id: string; // CHAR-01, CHAR-02
  name: string;
  speciesObject: string; // Real Human Character Role: e.g. 32-year-old Brooding Strategist, Estranged Heiress
  ageAppearance: string;
  genderPresentation: string;
  personality: string;
  roleInStory: 'Main Character' | 'Recurring Character' | 'Supporting Character' | 'Episode-Specific Character';
  morphologySpec: {
    eyeType: string;
    mouthPlacement: string;
    limbPhysics: string;
    materialTexture: string;
    distinctiveFeatures: string;
  };
  physicalAppearance: {
    headShape: string;
    faceStructure: string;
    bodyProportions: string;
    distinctiveFeatures: string;
  };
  clothing: {
    exactOutfit: string;
    colors: string;
    materials: string;
    accessories: string;
    propsNormallyCarried: string;
  };
  acting: {
    normalExpression: string;
    happyExpression: string;
    sadExpression: string;
    angryExpression: string;
    comedicExpression: string;
    typicalBodyLanguage: string;
  };
  voice: {
    voiceType: string;
    ageImpression: string;
    accent: string;
    speakingSpeed: string;
    emotionalStyle: string;
  };
  continuityRules: string[];
}

export interface CharacterBible {
  characters: CharacterBibleItem[];
  lockedRules: string[];
}

export interface SceneDef {
  sceneNumber: number;
  scenePurpose: string;
  location: string;
  timeOfDay: string;
  charactersPresent: string[];
  characterPositions: string;
  characterActions: string;
  characterEmotionalStates: string;
  props: string;
  backgroundActivity: string;
  cameraConcept: string;
  dialogue: string;
  transitionFromPrevious: string;
  transitionIntoNext: string;
}

export interface EpisodeProductionSheet {
  episodeNumber: number;
  episodeTitle: string;
  runtimeTarget: string; // e.g. "40-60s (4-6 clips)"
  storySummary: string;
  characterList: string[];
  locationList: string[];
  timeline: string;
  emotionalProgression: string;
  comedyBeats: string;
  dialogueFlow: string;
  arcStructure: string;
  scenes: SceneDef[];
}

export interface SceneContinuityPlan {
  sceneNumber: number;
  cameraSide: string;
  axisOfAction180: string; // Locked 180-degree rule description
  characterSpatialMapping: string; // Screen-Left vs Screen-Right definitions
  distanceBetweenCharacters: string;
  environmentalAnchors: string;
  characterEntrancePoints: string;
  characterExitPoints: string;
}

export interface TenSecClipDef {
  clipNumber: number;
  duration: '10 seconds';
  sceneNumber: number;
  charactersPresent: string[];
  characterPositions: string;
  characterActions: string;
  characterExpressions: string;
  eyeDirection: string; // Strict eye contact vector
  bodyOrientation: string;
  cameraPosition: string;
  cameraMovement: string;
  environment: string;
  lighting: string;
  props: string;
  activeSpeaker: string; // Exactly one speaking character
  listenerCharacter?: string; // Must be tagged silent
  dialogue: string; // 14-18 words maximum
  wordCount: number;
  voiceEmotion: string;
  beginningState: string;
  endingState: string;
  continuityConnectionToPrevious: string;
  locationContinuityType?: 'SAME_LOCATION_CONTINUOUS' | 'NEW_LOCATION_SCENE_CUT';
  frameReferenceStrategy?: 'USE_PREVIOUS_CLIP_END_FRAME' | 'NEW_STARTING_FRAME';
  frameReferenceNote?: string;
}

export interface FramePromptItem {
  clipNumber: number;
  prompt: string;
  aspectRatio: string;
  styleTag: string;
  isContinuousFromPrevious?: boolean;
  previousClipReference?: number;
  frameStrategy?: 'USE_PREVIOUS_CLIP_END_FRAME' | 'NEW_STARTING_FRAME';
  workflowInstruction?: string;
}

export interface VideoPromptItem {
  clipNumber: number;
  prompt: string; // [Camera movement] + [Character action] + [Expression] + [Eye direction] + [Body language] + "Exact spoken dialogue" + [Voice emotion] + [Environmental movement]
  activeSpeaker: string;
  listenerDirective: string;
  dialogueLine: string;
}

export interface ClipQACheck {
  characterContinuity: boolean;
  positionContinuity: boolean;
  eyeContact: boolean;
  expressionContinuity: boolean;
  clothingContinuity: boolean;
  locationContinuity: boolean;
  actionContinuity: boolean;
  cameraContinuity: boolean;
  dialogueLipSync: boolean;
}

export interface ClipQAResult {
  clipNumber: number;
  status: 'PASS' | 'REVISION REQUIRED';
  checks: ClipQACheck;
  issuesIdentified: string[];
  requiredCorrections: string[];
  correctedFramePrompt?: string;
  correctedVideoPrompt?: string;
}

export interface DirectorQAPackage {
  overallStatus: 'PRODUCTION READY' | 'REVISION REQUIRED';
  summary: string;
  clipReviews: ClipQAResult[];
}

export type DramaPipelineGate =
  | 1 // Phase 1: Season Story Development
  | 2 // Phase 2: Character Bible
  | 3 // Phase 3: Episode Production Breakdown
  | 4 // Phase 4: Scene Continuity Planning
  | 5 // Phase 5: 10-Second Clip Breakdown
  | 6 // Phase 6: Frame-First Production
  | 7 // Phase 7: Video Prompts
  | 8; // Phase 8: Director QA & Production Ready

export interface DramaSeriesState {
  currentGate: DramaPipelineGate;
  completedGates: DramaPipelineGate[];
  seedTopic: string;
  genre?: string;
  seasonStory?: SeasonStory;
  characterBible?: CharacterBible;
  selectedEpisodeNumber: number;
  episodeProduction?: EpisodeProductionSheet;
  sceneContinuity?: SceneContinuityPlan[];
  clipsBreakdown?: TenSecClipDef[];
  framePrompts?: FramePromptItem[];
  videoPrompts?: VideoPromptItem[];
  directorQA?: DirectorQAPackage;
  aspectRatio?: '16:9' | '9:16';
  targetRuntime?: '60s' | '90s' | '120s';
  selectedLocation?: string;
  customLocation?: string;
  updatedAt: string;
}
