import { z } from 'zod';

export const ContentFormatSchema = z.enum([
  'object_talking',
  'character_drama',
  'podcast_style',
  'faceless_ambient',
  'pet_comedy',
]);

export const GenreThemeSchema = z.enum([
  'Family Drama',
  'Revenge',
  'Romance',
  'Comedy',
  'Rivalry',
  'Redemption',
  'Mystery',
  'Motivational',
]);

export const ContentToneSchema = z.enum([
  'Emotional / Heavy',
  'Light / Fun',
  'Intense / Suspenseful',
  'Inspirational',
]);

export const CharacterRoleSchema = z.enum(['Hero', 'Villain', 'Side', 'Narrator']);

export const VisualStylePresetSchema = z.enum([
  'Hyper-Realistic Cinematic',
  'Stylized 3D Animation',
  'Moody Film Noir',
  'Vibrant Commercial Gloss',
  'Vintage 90s Camcorder',
]);

export const CastMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Character name is required'),
  role: CharacterRoleSchema,
  description: z.string(),
  dnaPrompt: z.string().min(5, 'Character visual DNA anchor prompt or ref image directive is required'),
  usesReferenceImage: z.boolean().optional(),
  personalityVibe: z.string().optional(),
  baseIdentity: z.string().optional(),
});

import { WorkflowPipelineSchema } from './workflow-pipeline.schema';

export const StorySpecSchema = z.object({
  id: z.string(),
  format: ContentFormatSchema,
  genres: z.array(GenreThemeSchema).min(1, 'Select at least one genre'),
  tone: ContentToneSchema,
  castCount: z.number().int().min(0).max(5).default(0),
  cast: z.array(CastMemberSchema).default([]),
  visualStyle: VisualStylePresetSchema,
  formatLength: z.enum(['single_video', 'multi_episode_series']),
  episodeCount: z.number().int().min(1).max(20).optional(),
  locationSettings: z.array(z.string()).min(1, 'At least one location setting is required'),
  customStoryIdea: z.string().optional(),
  workflowPipeline: WorkflowPipelineSchema.optional(),
  seasonNumber: z.number().int().min(1).max(20).optional(),
  seasonTitle: z.string().optional(),
  stakesTier: z.string().optional(),
  previousSeasonRecap: z.string().optional(),
  unresolvedMysteries: z.array(z.string()).optional(),
  clipDurationSeconds: z.union([z.literal(30), z.literal(45), z.literal(60)]).optional(),
  autonomousCast: z.boolean().optional(),
  createdAt: z.string(),
});

export type StorySpecInput = z.infer<typeof StorySpecSchema>;

