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
  seriesTitle?: string; // Global Drama / Show Name (e.g. "The Shadow Trust")
  workflowPipeline?: WorkflowPipeline; // Linked custom niche workflow pipeline
  seasonNumber?: number; // Current Season in multi-season series arc (1-8)
  seasonTitle?: string; // e.g. "The Criminal Cover-Up"
  stakesTier?: string; // e.g. "Criminal Blackmail & Federal Stakes"
  previousSeasonRecap?: string; // Continuity plot recap carried from previous season Day 7 finale
  unresolvedMysteries?: string[]; // Loose ends / clues carried forward into this season
  clipDurationSeconds?: 30 | 45 | 60; // Desired episode length
  autonomousCast?: boolean; // True when AI Director dynamically casts characters based on story premise
  createdAt: string;
}

export interface SeasonEscalationStage {
  seasonNumber: number;
  seasonTitle: string;
  stakesTier: string;
  coreConflict: string;
  newCharacterRole: string;
  newCharacterArchetype: string;
  escalationSummary: string;
}

export const SEASON_ESCALATION_LADDER: SeasonEscalationStage[] = [
  {
    seasonNumber: 1,
    seasonTitle: 'The Local Betrayal',
    stakesTier: 'Corporate Fraud',
    coreConflict: '40% stolen company shares & forged signatures in boardroom',
    newCharacterRole: 'The Power Broker',
    newCharacterArchetype: 'Marcus Kane (Underground Intelligence Fixer)',
    escalationSummary: 'Internal rivalry between Julian and Elena explodes over missing family assets.'
  },
  {
    seasonNumber: 2,
    seasonTitle: 'The Criminal Cover-Up',
    stakesTier: 'Criminal Blackmail & Federal Stakes',
    coreConflict: 'Wiretapped audio recordings & high-stakes federal audit blackmail',
    newCharacterRole: 'The Federal Investigator',
    newCharacterArchetype: 'Detective Sarah Vance (Internal Affairs / Estranged Sister)',
    escalationSummary: 'The cover-up spirals into criminal territory as federal investigators knock on the door.'
  },
  {
    seasonNumber: 3,
    seasonTitle: 'The Shadow Syndicate',
    stakesTier: 'Off-Shore Cartel & Life-or-Death',
    coreConflict: 'Swiss secret accounts & high-level assassination threats',
    newCharacterRole: 'The Shadow Broker',
    newCharacterArchetype: 'Dominic Sterling (Exiled Patriarch / Shadow Syndicate Financier)',
    escalationSummary: 'Julian and Elena realize the company was a front for a ruthless international financial syndicate.'
  },
  {
    seasonNumber: 4,
    seasonTitle: 'The High Table Standoff',
    stakesTier: 'Global Syndicate & Physical Danger',
    coreConflict: 'Physical hostage negotiations & midnight airstrip escape',
    newCharacterRole: 'The Asset / Enforcer',
    newCharacterArchetype: 'Viktor Ruiz (High-End Syndicate Operative)',
    escalationSummary: 'Stakes escalate from boardroom paperwork to midnight armed standoff.'
  },
  {
    seasonNumber: 5,
    seasonTitle: 'Broken Alliances',
    stakesTier: 'Forced Partnership & Double Agents',
    coreConflict: 'Elena and Julian forced into secret alliance to survive',
    newCharacterRole: 'The Whistleblower',
    newCharacterArchetype: 'Chloe Lin (Lead Cybersecurity Architect)',
    escalationSummary: 'Mortal enemies must protect each other as the walls close in from all sides.'
  },
  {
    seasonNumber: 6,
    seasonTitle: 'The Puppet Master',
    stakesTier: 'Ultimate Revelation',
    coreConflict: 'The father was alive all along, orchestrating both sides',
    newCharacterRole: 'The True Puppet Master',
    newCharacterArchetype: 'Arthur Vance (Presumed Dead Patriarch)',
    escalationSummary: 'The shocking truth unravels every secret from Season 1 to 5.'
  },
  {
    seasonNumber: 7,
    seasonTitle: 'The Fall of the Empire',
    stakesTier: 'Total Warfare',
    coreConflict: 'Public collapse, high-court trial & midnight escape plan',
    newCharacterRole: 'The Chief Prosecutor',
    newCharacterArchetype: 'District Attorney Evelyn Cross',
    escalationSummary: 'Everything burns as the legal and underground empire faces complete destruction.'
  },
  {
    seasonNumber: 8,
    seasonTitle: 'The Final Reckoning',
    stakesTier: 'Series Climax Finale',
    coreConflict: 'Final physical and moral face-off; only one walks away clean',
    newCharacterRole: 'Final Antagonist Standoff',
    newCharacterArchetype: 'The Architect of the Fall',
    escalationSummary: 'The ultimate climax where every debt is paid and the series reaches its final resolution.'
  }
];


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
  inUniversePosts?: InUniversePostBundle; // 3 Hollywood In-Universe & BTS feed posts for this episode
}

export interface InUniversePostBundle {
  btsPost: {
    title: string;
    imagePrompt: string;
    caption: string;
    hashtags: string[];
    angleDescription: string;
  };
  propPost: {
    title: string;
    imagePrompt: string;
    caption: string;
    hashtags: string[];
    clueName: string;
  };
  candidPost: {
    title: string;
    imagePrompt: string;
    caption: string;
    hashtags: string[];
    moodDescription: string;
  };
}

export interface DailyPhotoPost {
  id: string;
  category: 'Film Set BTS' | 'Forensic Prop Clue' | 'Candid Set Lore' | 'Desk / BTS Flatlay' | 'Cafe Candid' | 'Mirror OOTD' | 'Golden Hour Street';
  title: string;
  caption: string;
  hashtags: string[];
  outfit: string;
  imagePrompt: string; // The exact Midjourney / Flux / Google Flow prompt
}

export interface DayContentPackage {
  dayNumber: number; // 1-7
  dayName: string; // e.g. "Monday"
  episodeTitle?: string; // e.g. "The Forged Will"
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
  source: 'gemini-api' | 'procedural-engine' | 'regenerate-clip' | string;
  timestamp: string;
}

export interface WeeklyBatchDelivery {
  id: string;
  spec: StorySpec;
  createdAt: string;
  days: DayContentPackage[];
  seriesBible?: SeriesBibleSummary;
  tokenUsage?: TokenUsageReport;
  generatedClips?: Record<string, boolean>; // Map of generated clip keys to track video production
}

