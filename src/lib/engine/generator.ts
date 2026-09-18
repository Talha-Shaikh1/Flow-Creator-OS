import {
  StorySpec,
  WeeklyBatchDelivery,
  DayContentPackage,
  VideoVariation,
} from '@/types';
import { getWeeklyEmotionArc } from './rules/retention';
import { buildObjectTalkingClips } from './templates/object-talking';
import { buildCharacterDramaClips } from './templates/character-drama';
import { buildPodcastStyleClips } from './templates/podcast-style';
import { buildFacelessAmbientClips } from './templates/faceless-ambient';
import { buildPetComedyClips } from './templates/pet-comedy';
import { evaluatePromptCritique } from './critique';
import { generateDailyPhotoPosts } from './rules/photos';
import { WeeklyBatchDeliverySchema } from '../schemas/prompt-output.schema';
import { createTokenReport, estimateTokenCount } from './tokens';

export function produceVariationDirectives(
  spec: StorySpec,
  dayNum: number,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook'
): {
  masterFrameImagePrompt?: string;
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  clips: any[];
  tokenUsage?: any;
} {
  const arc = getWeeklyEmotionArc(dayNum);
  let builtOutput: ReturnType<typeof buildCharacterDramaClips>;

  switch (spec.format) {
    case 'object_talking':
      builtOutput = buildObjectTalkingClips(spec, arc.dailyEmotion, variationType);
      break;
    case 'podcast_style':
      builtOutput = buildPodcastStyleClips(spec, arc.dailyEmotion, variationType, dayNum);
      break;
    case 'pet_comedy':
      builtOutput = buildPetComedyClips(spec, arc.dailyEmotion, variationType, dayNum);
      break;
    case 'faceless_ambient':
      builtOutput = buildFacelessAmbientClips(spec, arc.dailyEmotion, variationType);
      break;
    case 'character_drama':
    default:
      builtOutput = buildCharacterDramaClips(spec, arc.dailyEmotion, variationType, dayNum);
      break;
  }

  const clips = builtOutput.clips.map((c) => ({
    ...c,
    foleySoundDesign:
      c.foleySoundDesign ||
      'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
    negativePromptDirectives:
      c.negativePromptDirectives ||
      'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
  }));

  const masterFrameImagePrompt =
    (builtOutput as any).masterFrameImagePrompt || clips[0]?.frameImagePrompt;

  // Single variation token report (~450 tokens)
  const promptTokens = 350;
  const completionTokens = estimateTokenCount(JSON.stringify(clips));
  const tokenUsage = createTokenReport(
    promptTokens,
    completionTokens,
    'flowcreator-procedural-v1',
    'procedural-engine'
  );

  return {
    masterFrameImagePrompt,
    characterAnchors: builtOutput.characterAnchors,
    locationAnchors: builtOutput.locationAnchors,
    clips,
    tokenUsage,
  };
}

export function generateWeeklyBatch(
  spec: StorySpec,
  options: { mode?: 'mind_maps' | 'full' } = { mode: 'mind_maps' }
): WeeklyBatchDelivery {
  // If character drama and cast is empty/unspecified, autonomously generate Hollywood Netflix Noir cast
  if (spec.format === 'character_drama' && (!spec.cast || spec.cast.length === 0)) {
    spec.cast = [
      {
        id: 'char-julian',
        name: 'Julian Vance',
        role: 'Hero',
        description: '32yo high-profile corporate defense attorney fighting betrayal from within.',
        dnaPrompt: '32-year-old aristocratic man, sharp chiseled jawline, intense deep-set dark obsidian eyes, slicked-back charcoal pompadour hair, light tailored 5 o\'clock shadow, sharp cheekbones. Tailored charcoal bespoke three-piece wool suit, crisp white spread collar, silk slate-gray tie. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Stoic, razor-sharp intellect, fierce restrained anger'
      },
      {
        id: 'char-elena',
        name: 'Elena Sterling',
        role: 'Villain',
        description: '30yo ruthless venture partner orchestrating an aggressive hostile takeover.',
        dnaPrompt: '30-year-old cold and calculating woman, chiseled symmetrical cheekbones, piercing icy-hazel eyes, slicked-back raven hair in an immaculate low chignon, flawless matte porcelain complexion, subtle plum lipstick. Minimalist structured midnight-navy double-breasted designer blazer with platinum cuff buttons. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Unflinching, icy composure, dismissive smirk, calculating'
      },
      {
        id: 'char-marcus',
        name: 'Marcus Kane',
        role: 'Side',
        description: '45yo private intelligence fixer with connections to high-level power brokers.',
        dnaPrompt: '45-year-old weathered private investigator, silver-streaked hair swept back, scarred left eyebrow, piercing hawk-like hazel eyes, tired hollows under eyes. Worn dark cashmere turtleneck under a distressed black leather trench coat. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Cynical, gravelly voice, enigmatic, sees right through lies'
      }
    ];
  }

  const days: DayContentPackage[] = [];
  const isMindMapOnly = options.mode === 'mind_maps';

  const variationTypes: Array<{
    label: 'Variation A (High Tension)' | 'Variation B (Emotional Core)' | 'Variation C (Fast Hook)';
    type: 'High Tension' | 'Emotional Core' | 'Fast Hook';
  }> = [
    { label: 'Variation A (High Tension)', type: 'High Tension' },
    { label: 'Variation B (Emotional Core)', type: 'Emotional Core' },
    { label: 'Variation C (Fast Hook)', type: 'Fast Hook' },
  ];

  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const arc = getWeeklyEmotionArc(dayNum);
    const dayVariations: VideoVariation[] = [];

    for (const v of variationTypes) {
      let builtOutput: ReturnType<typeof buildCharacterDramaClips>;

      switch (spec.format) {
        case 'object_talking':
          builtOutput = buildObjectTalkingClips(spec, arc.dailyEmotion, v.type);
          break;
        case 'podcast_style':
          builtOutput = buildPodcastStyleClips(spec, arc.dailyEmotion, v.type, dayNum);
          break;
        case 'pet_comedy':
          builtOutput = buildPetComedyClips(spec, arc.dailyEmotion, v.type, dayNum);
          break;
        case 'faceless_ambient':
          builtOutput = buildFacelessAmbientClips(spec, arc.dailyEmotion, v.type);
          break;
        case 'character_drama':
        default:
          builtOutput = buildCharacterDramaClips(spec, arc.dailyEmotion, v.type, dayNum);
          break;
      }

      // If mind-maps mode (Stage 1), do NOT build full clip prompts yet (saves 75% tokens!)
      const clips = isMindMapOnly
        ? []
        : builtOutput.clips.map((c) => ({
            ...c,
            foleySoundDesign:
              c.foleySoundDesign ||
              'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
            negativePromptDirectives:
              c.negativePromptDirectives ||
              'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
          }));

      const unvalidatedVariation = {
        id: `day-${dayNum}-${v.type.toLowerCase().replace(/\s+/g, '-')}`,
        variationLabel: v.label,
        title: builtOutput.title,
        hookDescription: builtOutput.hookDescription,
        masterFrameImagePrompt: isMindMapOnly
          ? undefined
          : (builtOutput as any).masterFrameImagePrompt || builtOutput.clips[0]?.frameImagePrompt,
        characterAnchors: isMindMapOnly ? [] : builtOutput.characterAnchors,
        locationAnchors: isMindMapOnly ? [] : builtOutput.locationAnchors,
        clips,
        dialogueScript: builtOutput.dialogueScript,
        seriesContinuityRecap: `Day ${dayNum} Continuity: ${arc.dailyEmotion}. Culminates in a psychological cliffhanger leading into Day ${(dayNum % 7) + 1}.`,
        metadata: {
          caption: `${builtOutput.title} 🎬 Generated with FlowCreator OS. #AIcinema #GoogleFlow #Storytelling #ViralContent`,
          hashtags: ['#GoogleFlow', '#Veo', '#AIFilmmaking', '#ShortFilm', '#CreatorEconomy'],
          audioVibe: spec.tone,
        },
        isProduced: !isMindMapOnly,
      };

      // Run Quality Gate & Self-Critique
      const critique = evaluatePromptCritique(unvalidatedVariation);

      dayVariations.push({
        ...unvalidatedVariation,
        critique,
      });
    }

    const dailyPhotos = generateDailyPhotoPosts(
      spec.cast[0],
      dayNum,
      arc.dayName,
      arc.dailyEmotion
    );

    days.push({
      dayNumber: dayNum,
      dayName: arc.dayName,
      dailyEmotion: `${arc.dayName} Arc: ${arc.dailyEmotion}`,
      variations: dayVariations,
      selectedVariationId: dayVariations[0]?.id,
      dailyPhotoPosts: dailyPhotos,
    });
  }

  const seriesBible = {
    arcOverview: `7-Day Story Arc for ${spec.format.replace('_', ' ').toUpperCase()} in ${spec.visualStyle}. Follows a rising tension progression from initial curiosity on Monday to a climactic standoff on Friday and cliffhanger resolution on Sunday.`,
    characterArcs: spec.cast.map((c) => ({
      name: c.name,
      weekArc: `${c.name} (${c.role}): Starts in control, faces escalating betrayal across the week, reaches emotional climax by Day 5.`,
    })),
    keyCliffhangers: [
      'Day 1: The initial accusation and concealed evidence.',
      'Day 3: Sudden appearance of an unexpected third party.',
      'Day 5: Direct confrontation with irreversible ultimatum.',
      'Day 7: Final plot twist setting up the next season / arc.',
    ],
  };

  // Calculate Token Burn for this stage (Mind Map vs Full)
  const promptTokens = isMindMapOnly ? 450 : estimateTokenCount(JSON.stringify(spec)) + 1450;
  const completionTokens = estimateTokenCount(JSON.stringify(days));
  const tokenUsage = createTokenReport(
    promptTokens,
    completionTokens,
    'flowcreator-procedural-v1',
    'procedural-engine'
  );

  const rawBatch: WeeklyBatchDelivery = {
    id: `batch-${Date.now()}`,
    spec,
    createdAt: new Date().toISOString(),
    days,
    seriesBible,
    tokenUsage,
  };

  // Strict Schema Validation
  const validated = WeeklyBatchDeliverySchema.safeParse(rawBatch);
  if (!validated.success) {
    console.error('Validation Errors in Batch Generation:', validated.error.format());
  }

  return rawBatch;
}

