import {
  StorySpec,
  WeeklyBatchDelivery,
  DayContentPackage,
  VideoVariation,
  CastMember,
  SEASON_ESCALATION_LADDER,
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

export function resolveAutonomousCast(spec: StorySpec): CastMember[] {
  const idea = (spec.customStoryIdea || '').toLowerCase();

  if (idea.includes('cyber') || idea.includes('hacker') || idea.includes('tech') || idea.includes('ai') || idea.includes('tokyo') || idea.includes('code')) {
    return [
      {
        id: 'char-kaelen',
        name: 'Kaelen Chen',
        role: 'Hero',
        description: '30yo lead cybersecurity architect fighting rogue syndicate infiltration.',
        dnaPrompt: 'Original fictional character, 30-year-old Asian man with distinct non-celebrity digital human facial structure, sharp angular jawline, obsidian eyes, textured undercut charcoal hair. Matte-black tactical turtleneck, carbon-fiber wrist chronometer. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Methodical, razor-sharp intellect, quiet intensity',
      },
      {
        id: 'char-vespera',
        name: 'Vespera Cross',
        role: 'Villain',
        description: '32yo rogue AI architect orchestrating unauthorized biometric data exfiltration.',
        dnaPrompt: 'Original fictional character, 32-year-old woman with distinct non-celebrity digital human facial structure, high symmetrical cheekbones, piercing icy-gray eyes, sleek platinum-blonde bob haircut, minimalist structured slate-gray designer blazer. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Chilling composure, calculating, dismissive smirk',
      },
      {
        id: 'char-dax',
        name: 'Dax Mercer',
        role: 'Side',
        description: '42yo back-channel hardware fixer operating out of subterranean data clusters.',
        dnaPrompt: 'Original fictional character, 42-year-old weathered man with distinct non-celebrity digital human facial structure, tired hazel eyes, rugged short beard, dark olive canvas utility jacket over faded black henley. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Cynical, gravelly voice, speaks only when critical',
      },
    ];
  }

  if (idea.includes('doctor') || idea.includes('medical') || idea.includes('hospital') || idea.includes('bio') || idea.includes('pharma') || idea.includes('trial')) {
    return [
      {
        id: 'char-aris',
        name: 'Dr. Aris Thorne',
        role: 'Hero',
        description: '34yo neurosurgeon uncovering falsified clinical trial results.',
        dnaPrompt: 'Original fictional character, 34-year-old man with distinct non-celebrity digital human facial structure, tired dark brown eyes, short wavy brown hair, navy surgical scrubs under tailored white lab coat with hospital credential badge. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Ethical, unwavering resolve, suppressed exhaustion',
      },
      {
        id: 'char-nadia',
        name: 'Director Nadia Cross',
        role: 'Villain',
        description: '45yo pharmaceutical board director protecting multi-billion patent equity.',
        dnaPrompt: 'Original fictional character, 45-year-old woman with distinct non-celebrity digital human facial structure, sharp sculpted cheekbones, cold hazel eyes, slicked-back auburn chignon, bespoke emerald-green double-breasted blazer. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Authoritative, polite yet ruthless, velvet threat',
      },
      {
        id: 'char-sloan',
        name: 'Nurse Sloan Miller',
        role: 'Side',
        description: '28yo clinical research coordinator acting as confidential whistleblower.',
        dnaPrompt: 'Original fictional character, 28-year-old woman with distinct non-celebrity digital human facial structure, warm hazel eyes, dark hair tied in practical ponytail, dark navy clinical scrubs, lanyard with encrypted flash drive. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Anxious, brave, cautious whispering cadence',
      },
    ];
  }

  if (idea.includes('detective') || idea.includes('police') || idea.includes('crime') || idea.includes('investigation') || idea.includes('agent') || idea.includes('fbi')) {
    return [
      {
        id: 'char-marcus-det',
        name: 'Detective Marcus Hayes',
        role: 'Hero',
        description: '38yo senior homicide and financial crimes inspector following dirty ledger trails.',
        dnaPrompt: 'Original fictional character, 38-year-old man with distinct non-celebrity digital human facial structure, scarred brow, piercing amber-brown eyes, heavy 5 o\'clock shadow, dark charcoal overcoat over rumpled white shirt and loose tie. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Relentless, cynical humor, observant detective intuition',
      },
      {
        id: 'char-victor',
        name: 'Victor Sterling',
        role: 'Villain',
        description: '50yo untouchable financial oligarch controlling municipal procurement.',
        dnaPrompt: 'Original fictional character, 50-year-old man with distinct non-celebrity digital human facial structure, silver-streaked dark hair combed back, piercing steel-blue eyes, tailored midnight-navy pinstripe three-piece suit. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Imperial composure, soft-spoken intimidation, absolute control',
      },
      {
        id: 'char-tara',
        name: 'Tara Lin',
        role: 'Side',
        description: '31yo forensic auditor leaking internal wire transfers to the inspector.',
        dnaPrompt: 'Original fictional character, 31-year-old woman with distinct non-celebrity digital human facial structure, wire-rimmed glasses, alert dark eyes, charcoal trench coat over cream silk blouse. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Nervous, high-speed intellectual speech, cautious',
      },
    ];
  }

  // Default High-Stakes Corporate / Legal Noir
  return [
    {
      id: 'char-julian',
      name: 'Julian Vance',
      role: 'Hero',
      description: '32yo high-profile corporate defense attorney fighting betrayal from within.',
      dnaPrompt: 'Original fictional character, 32-year-old aristocratic man with distinct non-celebrity digital human facial structure, sharp chiseled jawline, intense deep-set dark obsidian eyes, slicked-back charcoal pompadour hair, light tailored 5 o\'clock shadow, sharp cheekbones. Tailored charcoal bespoke three-piece wool suit, crisp white spread collar, silk slate-gray tie. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Stoic, razor-sharp intellect, fierce restrained anger',
    },
    {
      id: 'char-elena',
      name: 'Elena Sterling',
      role: 'Villain',
      description: '30yo ruthless venture partner orchestrating an aggressive hostile takeover.',
      dnaPrompt: 'Original fictional character, 30-year-old cold and calculating woman with distinct non-celebrity digital human facial structure, chiseled symmetrical cheekbones, piercing icy-hazel eyes, slicked-back raven hair in an immaculate low chignon, flawless matte porcelain complexion, subtle plum lipstick. Minimalist structured midnight-navy double-breasted designer blazer with platinum cuff buttons. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Unflinching, icy composure, dismissive smirk, calculating',
    },
    {
      id: 'char-marcus',
      name: 'Marcus Kane',
      role: 'Side',
      description: '45yo private intelligence fixer with connections to high-level power brokers.',
      dnaPrompt: 'Original fictional character, 45-year-old weathered private investigator, silver-streaked hair swept back, scarred left eyebrow, piercing hawk-like hazel eyes, tired hollows under eyes. Worn dark cashmere turtleneck under a distressed black leather trench coat. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Cynical, gravelly voice, enigmatic, sees right through lies',
    },
  ];
}

export function resolveSeriesTitle(spec: StorySpec): string {
  if (spec.seriesTitle && spec.seriesTitle.trim().length > 0) {
    return spec.seriesTitle.trim();
  }
  const idea = (spec.customStoryIdea || '').toLowerCase();
  if (idea.includes('pharma') || idea.includes('patent') || idea.includes('medical') || idea.includes('vaccine') || idea.includes('cure')) {
    return 'Lethal Dose';
  }
  if (idea.includes('cyber') || idea.includes('hacker') || idea.includes('tech') || idea.includes('ai') || idea.includes('tokyo') || idea.includes('code')) {
    return 'Neon Protocol';
  }
  if (idea.includes('detective') || idea.includes('police') || idea.includes('crime') || idea.includes('investigation') || idea.includes('murder')) {
    return 'The Cold Trail';
  }
  if (idea.includes('bank') || idea.includes('heist') || idea.includes('vault')) {
    return 'The Vault Protocol';
  }
  return 'The Shadow Trust';
}

export const EPISODE_TITLES: Record<number, string> = {
  1: 'The Forged Will',
  2: 'The Erased Drive',
  3: 'The Blackmail Recording',
  4: 'The Midnight Exchange',
  5: 'Box 409',
  6: 'The Wiretapped Standoff',
  7: 'The Federal Ambush',
};

export function produceVariationDirectives(
  spec: StorySpec,
  dayNum: number,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook',
  existingVariation?: any
): {
  title?: string;
  hookDescription?: string;
  dialogueScript?: any[];
  masterFrameImagePrompt?: string;
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  clips: any[];
  tokenUsage?: any;
} {
  if (!spec.cast || spec.cast.length === 0) {
    spec.cast = resolveAutonomousCast(spec);
    spec.castCount = spec.cast.length;
  }
  spec.seriesTitle = resolveSeriesTitle(spec);
  spec.seasonNumber = spec.seasonNumber || 1;
  spec.seasonTitle =
    spec.seasonTitle ||
    SEASON_ESCALATION_LADDER.find((s) => s.seasonNumber === spec.seasonNumber)?.seasonTitle ||
    'The Local Betrayal';

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
      builtOutput = buildCharacterDramaClips(spec, arc.dailyEmotion, variationType, dayNum, existingVariation);
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
    title: builtOutput.title,
    hookDescription: builtOutput.hookDescription,
    dialogueScript: builtOutput.dialogueScript,
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
  if (!spec.cast || spec.cast.length === 0) {
    spec.cast = resolveAutonomousCast(spec);
    spec.castCount = spec.cast.length;
  }
  spec.seriesTitle = resolveSeriesTitle(spec);
  spec.seasonNumber = spec.seasonNumber || 1;
  spec.seasonTitle =
    spec.seasonTitle ||
    SEASON_ESCALATION_LADDER.find((s) => s.seasonNumber === spec.seasonNumber)?.seasonTitle ||
    'The Local Betrayal';

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
        inUniversePosts: (builtOutput as any).inUniversePosts,
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
      arc.dailyEmotion,
      spec.format,
      spec.locationSettings[0]
    );

    days.push({
      dayNumber: dayNum,
      episodeTitle: EPISODE_TITLES[dayNum] || `Episode ${dayNum}`,
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

