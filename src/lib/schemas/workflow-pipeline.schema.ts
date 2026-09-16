import { z } from 'zod';

export const VisualStylePresetSchema = z.enum([
  'Hyper-Realistic Cinematic',
  'Stylized 3D Animation',
  'Moody Film Noir',
  'Vibrant Commercial Gloss',
  'Vintage 90s Camcorder',
]);

export const NicheWorkflowCategorySchema = z.enum([
  'ai_influencer_ugc',
  'talking_object',
  'cinematic_drama',
  'faceless_aesthetic',
  'podcast_debate',
  'custom',
]);

export const HookArchetypeSchema = z.enum([
  'curiosity_gap',
  'shock_reversal',
  'secret_expose',
  'cold_open_standoff',
  'controversial_opinion',
]);

export const PacingCadenceSchema = z.enum([
  'rapid_tiktok_22w',
  'measured_cinematic_16w',
  'ambient_voiceover_12w',
]);

export const WorkflowPipelineSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Workflow name is required'),
  nicheType: NicheWorkflowCategorySchema,
  customNicheTitle: z.string().optional(),
  description: z.string(),
  personaSubjectAnchor: z.string().min(5, 'Persona or subject visual definition is required'),
  cameraShootingStyle: z.string().min(3, 'Camera & shooting style is required'),
  hookArchetype: HookArchetypeSchema,
  pacingCadence: PacingCadenceSchema,
  audioFoleyMood: z.string().optional(),
  visualStylePreset: VisualStylePresetSchema,
  defaultLocations: z.array(z.string()).min(1, 'At least one location is required'),
  isPinned: z.boolean().optional(),
  createdAt: z.string(),
});

export type WorkflowPipelineInput = z.infer<typeof WorkflowPipelineSchema>;
