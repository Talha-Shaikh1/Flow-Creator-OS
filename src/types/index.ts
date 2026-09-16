export type ContentFormat = 'object_talking' | 'character_drama' | 'podcast_style' | 'faceless_ambient' | 'pet_comedy';

export type GenreTheme = 
  | 'Family Drama'
  | 'Revenge'
  | 'Romance'
  | 'Comedy'
  | 'Rivalry'
  | 'Redemption'
  | 'Mystery'
  | 'Motivational';

export type ContentTone = 'Emotional / Heavy' | 'Light / Fun' | 'Intense / Suspenseful' | 'Inspirational';

export type CharacterRole = 'Hero' | 'Villain' | 'Side' | 'Narrator';

export type VisualStylePreset = 
  | 'Hyper-Realistic Cinematic'
  | 'Stylized 3D Animation'
  | 'Moody Film Noir'
  | 'Vibrant Commercial Gloss'
  | 'Vintage 90s Camcorder';

export interface CastMember {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  dnaPrompt: string; // Master visual anchor or ref image directive
  usesReferenceImage?: boolean;
  personalityVibe?: string;
  baseIdentity?: string;
}

export type NicheWorkflowCategory =
  | 'ai_influencer_ugc'
  | 'talking_object'
  | 'cinematic_drama'
  | 'faceless_aesthetic'
  | 'podcast_debate'
  | 'pet_comedy'
  | 'custom';

export type HookArchetype =
  | 'curiosity_gap' // "Nobody is talking about this hidden truth..."
  | 'shock_reversal' // Visual shock followed by instant perspective flip
  | 'secret_expose' // "What they don't want you to know..."
  | 'cold_open_standoff' // Mid-action climax opener
  | 'controversial_opinion'; // High-retention polar argument

export type PacingCadence =
  | 'rapid_tiktok_22w' // 20-22 words/10s, high-retention fast cuts
  | 'measured_cinematic_16w' // 15-18 words/10s, dramatic breathing room
  | 'ambient_voiceover_12w'; // 10-12 words/10s, poetic aesthetic flow

export interface WorkflowPipeline {
  id: string;
  name: string;
  nicheType: NicheWorkflowCategory;
  customNicheTitle?: string;
  description: string;
  personaSubjectAnchor: string; // Master character / subject DNA definition
  cameraShootingStyle: string; // e.g. "Handheld iPhone 16 Pro 4K UGC, eye-level ring light"
  hookArchetype: HookArchetype;
  pacingCadence: PacingCadence;
  audioFoleyMood?: string; // e.g. "Subtle room reverb, crisp vocal isolation, punchy bass sub-drop"
  visualStylePreset: VisualStylePreset;
  defaultLocations: string[];
  isPinned?: boolean;
  createdAt: string;
}

export interface StorySpec {
  id: string;
  format: ContentFormat;
  genres: GenreTheme[];
  tone: ContentTone;
  castCount: number;
  cast: CastMember[];
  visualStyle: VisualStylePreset;
  formatLength: 'single_video' | 'multi_episode_series';
  episodeCount?: number;
  locationSettings: string[]; // List of locations (e.g., Living Room, Office, Rooftop)
  customStoryIdea?: string; // Optional user-provided premise / concept
  workflowPipeline?: WorkflowPipeline; // Linked custom niche workflow pipeline
  createdAt: string;
}


export interface SecBySecAction {
  timeRange: string; // e.g. "0:00 - 0:02"
  visualAction: string;
  cameraMovement: string;
  characterPose?: string; // e.g. "Tense forward lean, hands gripped on desk edge"
  pauseBeat?: string; // e.g. "1.5s heavy suspenseful pause, breath intake"
  spokenDialogue?: string; // Spoken line articulated in this window
  lipSyncDirective?: string; // Specific lip and mouth motion directive
  activeSpeaker?: string;
  silentCharacters?: string[];
  lightingMood?: string;
  sfxCue?: string; // Sound effect / foley audio directive
}


export interface ClipPrompt {
  clipIndex: number;
  totalClips: number;
  sceneName: string;
  locationAnchor: string;
  masterKeyframeLock: string;
  shotType: 'Master Wide' | 'Shot-Reverse-Shot Close-Up' | 'Over-the-Shoulder' | 'Dynamic Tracking' | 'Point of View';
  frameImagePrompt: string; // The exact prompt to generate the starting keyframe/video frame image
  flowPromptText: string; // Full video motion directive for Google Flow
  speakerIsolation: {
    activeSpeaker: string;
    speakingDialogue: string;
    silentCharacters: string[];
    cameraCutApplied: boolean;
  };
  timeline: SecBySecAction[];
  retentionHookReasoning?: string;
  pacingWordCount: number;
  sceneWardrobe?: string; // Story & location adaptive clothing
  requiresReferenceImageAttachment?: boolean; // Reminder badge to attach user ref image
  foleySoundDesign?: string; // Complete audio ambience and sound design directive
  negativePromptDirectives?: string; // Negative prompt directives for cleaner video output
}

export interface QualityCritique {
  spatialLockScore: number; // 0-100
  speakerIsolationScore: number; // 0-100
  retentionHookScore: number; // 0-100
  overallScore: number; // 0-100
  passedQualityGate: boolean;
  critiqueNotes: string[];
  refinementsApplied: string[];
}

export interface VideoVariation {
  id: string;
  variationLabel: 'Variation A (High Tension)' | 'Variation B (Emotional Core)' | 'Variation C (Fast Hook)';
  title: string;
  hookDescription: string;
  masterFrameImagePrompt?: string;
  characterAnchors: {
    characterName: string;
    anchorPrompt: string;
  }[];
  locationAnchors: {
    locationName: string;
    anchorPrompt: string;
  }[];
  clips: ClipPrompt[];
  dialogueScript: {
    speaker: string;
    line: string;
    timing: string;
  }[];
  metadata: {
    caption: string;
    hashtags: string[];
    audioVibe: string;
  };
  critique: QualityCritique;
  seriesContinuityRecap?: string; // Episode plot continuity & cliffhanger note
  isProduced?: boolean; // True when full frame prompts and Flow motion directives have been produced
}

export interface DailyPhotoPost {
  id: string;
  category: 'Cafe Candid' | 'Mirror OOTD' | 'Golden Hour Street' | 'Desk / BTS Flatlay';
  title: string;
  caption: string;
  hashtags: string[];
  outfit: string;
  imagePrompt: string; // The exact Midjourney / Flux / Google Flow prompt
}

export interface DayContentPackage {
  dayNumber: number; // 1-7
  dayName: string; // e.g. "Monday"
  dailyEmotion: string; // e.g. "Monday Hook - Curiosity & Intrigue"
  variations: VideoVariation[];
  selectedVariationId?: string;
  dailyPhotoPosts?: DailyPhotoPost[]; // 3-4 daily authentic lifestyle photos
}


export interface SeriesBibleSummary {
  arcOverview: string;
  characterArcs: { name: string; weekArc: string }[];
  keyCliffhangers: string[];
}

export interface TokenUsageReport {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  model: string;
  source: 'gemini-api' | 'procedural-engine' | 'regenerate-clip';
  timestamp: string;
}

export interface WeeklyBatchDelivery {
  id: string;
  spec: StorySpec;
  createdAt: string;
  days: DayContentPackage[];
  seriesBible?: SeriesBibleSummary;
  tokenUsage?: TokenUsageReport;
}

