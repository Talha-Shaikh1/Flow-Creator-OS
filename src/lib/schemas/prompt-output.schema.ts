import { z } from 'zod';

export const SecBySecActionSchema = z.object({
  timeRange: z.string(),
  visualAction: z.string(),
  cameraMovement: z.string(),
  activeSpeaker: z.string().optional(),
  silentCharacters: z.array(z.string()).optional().default([]),
  lightingMood: z.string().optional(),
  sfxCue: z.string().optional(),
});

export const ClipPromptSchema = z.object({
  clipIndex: z.number().int().min(1),
  totalClips: z.number().int().min(1),
  sceneName: z.string(),
  locationAnchor: z.string(),
  masterKeyframeLock: z.string(),
  shotType: z.enum([
    'Master Wide',
    'Shot-Reverse-Shot Close-Up',
    'Over-the-Shoulder',
    'Dynamic Tracking',
    'Point of View',
  ]),
  frameImagePrompt: z.string().min(10, 'Video frame keyframe image prompt is required'),
  flowPromptText: z.string().min(20, 'Flow prompt must contain full spatial, temporal and visual instructions'),
  speakerIsolation: z.object({
    activeSpeaker: z.string(),
    speakingDialogue: z.string(),
    silentCharacters: z.array(z.string()),
    cameraCutApplied: z.boolean(),
  }),
  timeline: z.array(SecBySecActionSchema).min(1),
  retentionHookReasoning: z.string().optional(),
  pacingWordCount: z.number().int(),
  sceneWardrobe: z.string().optional(),
  requiresReferenceImageAttachment: z.boolean().optional(),
  foleySoundDesign: z.string().optional(),
  negativePromptDirectives: z.string().optional(),
});

export const QualityCritiqueSchema = z.object({
  spatialLockScore: z.number().min(0).max(100),
  speakerIsolationScore: z.number().min(0).max(100),
  retentionHookScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  passedQualityGate: z.boolean(),
  critiqueNotes: z.array(z.string()),
  refinementsApplied: z.array(z.string()),
});

export const VideoVariationSchema = z.object({
  id: z.string(),
  variationLabel: z.enum([
    'Variation A (High Tension)',
    'Variation B (Emotional Core)',
    'Variation C (Fast Hook)',
  ]),
  title: z.string(),
  hookDescription: z.string(),
  masterFrameImagePrompt: z.string().optional(),
  characterAnchors: z.array(
    z.object({
      characterName: z.string(),
      anchorPrompt: z.string(),
    })
  ),
  locationAnchors: z.array(
    z.object({
      locationName: z.string(),
      anchorPrompt: z.string(),
    })
  ),
  clips: z.array(ClipPromptSchema),
  dialogueScript: z.array(
    z.object({
      speaker: z.string(),
      line: z.string(),
      timing: z.string(),
    })
  ),
  metadata: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    audioVibe: z.string(),
  }),
  critique: QualityCritiqueSchema,
  seriesContinuityRecap: z.string().optional(),
  isProduced: z.boolean().optional(),
});

export const DayContentPackageSchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  episodeTitle: z.string().optional(),
  dayName: z.string(),
  dailyEmotion: z.string(),
  variations: z.array(VideoVariationSchema).min(1),
  selectedVariationId: z.string().optional(),
  nextEpisodePromo: z.any().optional(),
});

export const SeriesBibleSummarySchema = z.object({
  arcOverview: z.string(),
  characterArcs: z.array(
    z.object({
      name: z.string(),
      weekArc: z.string(),
    })
  ),
  keyCliffhangers: z.array(z.string()),
});

export const TokenUsageReportSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
  estimatedCostUsd: z.number(),
  model: z.string(),
  source: z.enum(['gemini-api', 'procedural-engine', 'regenerate-clip']),
  timestamp: z.string(),
});

export const WeeklyBatchDeliverySchema = z.object({
  id: z.string(),
  spec: z.any(),
  createdAt: z.string(),
  days: z.array(DayContentPackageSchema).length(7),
  seriesBible: SeriesBibleSummarySchema.optional(),
  tokenUsage: TokenUsageReportSchema.optional(),
  seasonTrailer: z.any().optional(),
});

