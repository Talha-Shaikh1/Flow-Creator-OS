export type CreatorArchetype = 'human_influencer' | 'talking_object' | 'faceless_niche';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type VideoFormatMode = 'podcast_fixed' | 'cinematic_multi';

export type VideoDuration = '30s' | '60s';

export type ContentLanguage = 'english_global' | 'roman_urdu_hindi' | 'spanish_global';

export type ContentType = 'video' | 'post';

export type ProductionMode = 'standalone_daily' | 'episodic_season';

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'mentor';

export interface DramaCharacter {
  id: string;
  name: string;
  role: CharacterRole;
  roleLabel: string;   // e.g. "Protagonist / Hero", "Antagonist / Villain", "Supporting / Hacker"
  visualAnchor: string; // e.g. "Screen-left: navy blue hoodie with silver watch"
  color: string;        // e.g. "#26D9E6", "#FF4D6D", "#D84DFF"
}

export type EmotionalTriggerType =
  | 'shock_curiosity'     // Mon: Shock / Curiosity ("WTF Factor") -> 3s Hook Retention
  | 'deep_empathy'        // Tue: Relatability / "That's so me" -> Comments & DMs
  | 'controversy_debate'  // Wed: Provocative Debate -> Comment Flame Wars (Algorithm Push)
  | 'sarcasm_humor'       // Thu: Satire & Sarcasm -> High Direct Shares & DMs
  | 'high_value_secret'   // Fri: Behind-the-Scenes Epiphany -> Maximum Saves & Bookmarks
  | 'hard_reality_check'  // Sat: Hard Truth & Wake-Up Call -> Authority & Retention
  | 'inspiration_awe';    // Sun: Transformation & Vision -> Profile Visits & Follows

export interface EmotionalProfile {
  type: EmotionalTriggerType;
  label: string;
  icon: string;
  algorithmicGoal: string;
  color: string;
}

export interface RecurringCharacter {
  id: string;
  name: string;
  personality: string;
  visualDna: string;
  archetype: CreatorArchetype;
  imageUrl?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  archetype: CreatorArchetype;
  productionMode?: ProductionMode;
  seasonNumber?: number;
  seasonTitle?: string;
  seasonSynopsis?: string;
  castEnsemble?: DramaCharacter[];
  selectedVibeTags?: string[];
  customTwistInput?: string;
  contentType: ContentType;
  videoFormatMode: VideoFormatMode;
  videoDuration?: VideoDuration;
  language?: ContentLanguage;
  castMembers?: RecurringCharacter[];
  hasReferenceImage: boolean;
  referenceImageUrl?: string;
  niche: string;
  objectName?: string;
  objectMetaphor?: string;
  characterDna: string;
  aspectRatio: AspectRatio;
  visualStyle: string;
  tone: string;
  targetAudience: string;
  createdAt: number;
}

export interface Scene {
  sceneNumber: number;
  duration: string;
  phase: string;
  speaker?: string;             // Character name speaking
  speakerRole?: CharacterRole;  // 'protagonist' | 'antagonist' | 'supporting' | 'mentor'
  listenerName?: string;        // Name of character listening/reacting
  listenerReaction?: string;    // e.g. "Stares coldly on screen-right with clenched jaw"
  cameraAngleType?: string;     // e.g. "Over-the-shoulder Left", "Reverse Angle Right", "Two-Shot Wide"
  keyframeImagePrompt?: string;
  visualPrompt: string;
  facialExpression?: string;
  bodyLanguage?: string;
  eyeContactCue?: string;
  actingDirection: string;
  dialogue: string;
  alternateHooks?: string[];
  cameraMotion: string;
  lightingAndMood: string;
}

export interface PlatformMetadata {
  instagram: {
    hookCaption: string;
    bodyCaption: string;
    hashtags: string[];
    callToAction: string;
  };
  tiktok: {
    textOverlayHook: string;
    caption: string;
    seoKeywords: string[];
    audioVibe: string;
  };
  youtubeShorts: {
    title: string;
    description: string;
    tags: string[];
    pinnedComment: string;
  };
  threads: {
    threadPost: string;
  };
  pinterest: {
    pinTitle: string;
    pinDescription: string;
    suggestedBoard: string;
    keywords: string[];
  };
  facebook: {
    storyCaption: string;
  };
}

export interface DayContent {
  dayNumber: number;
  dayName: string;
  title: string;
  episodeNumber?: number;
  episodeTitle?: string;
  cliffhangerHook?: string;
  angleArchetype: string;
  emotionalTrigger: EmotionalProfile;
  viralScore: number;
  targetEmotion: string;
  videoFormatMode: VideoFormatMode;
  masterKeyframePrompt: string;
  scenes: Scene[];
  bgmPrompt: string;
  lifestylePhotoPrompt?: string;
  lifestyleCaption?: string;
  platformMetadata: PlatformMetadata;
}

export interface WeeklyPlan {
  id: string;
  profileId: string;
  profileName: string;
  archetype: CreatorArchetype;
  productionMode?: ProductionMode;
  seasonNumber?: number;
  seasonTitle?: string;
  seasonSynopsis?: string;
  castEnsemble?: DramaCharacter[];
  selectedVibeTags?: string[];
  customTwistInput?: string;
  aspectRatio?: AspectRatio;
  contentType: ContentType;
  videoFormatMode: VideoFormatMode;
  videoDuration?: VideoDuration;
  language?: ContentLanguage;
  castMembers?: RecurringCharacter[];
  hasReferenceImage: boolean;
  referenceImageUrl?: string;
  niche: string;
  createdAt: number;
  days: DayContent[];
}

export interface VaultItem {
  id: string;
  topic: string;
  angle: string;
  emotionalTrigger: string;
  archetype: CreatorArchetype;
  usedInDate: string;
}

export interface DiagnosticFeedback {
  dropOffDiagnosis: 'hook_issue' | 'seo_distribution_issue' | 'cta_engagement_issue' | 'viral_winner';
  consecutiveTestsCount: number;
  aiGrowthRecommendation: string;
}

export interface PerformanceLog {
  id: string;
  planId: string;
  videoTitle: string;
  dayNumber: number;
  emotionalTrigger: string;
  result: 'viral' | 'good' | 'flop';
  viewsCount?: string;
  retentionRate?: string;
  diagnostic: DiagnosticFeedback;
  userNotes?: string;
  keyLearnings: string;
  createdAt: number;
}
