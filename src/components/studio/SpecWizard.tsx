'use client';

import React, { useState, useEffect } from 'react';
import {
  ContentFormat,
  GenreTheme,
  ContentTone,
  VisualStylePreset,
  StorySpec,
  CastMember,
  CharacterRole,
  WorkflowPipeline,
} from '@/types';
import { WorkflowPipelineSelector } from './WorkflowPipelineSelector';

import {
  Sparkles,
  Layers,
  Film,
  Mic,
  Smile,
  Tv,
  Check,
  ChevronRight,
  Palette,
  UserPlus,
  Pin,
  Trash2,
  BookmarkCheck,
  MapPin,
  Plus,
  X,
} from 'lucide-react';


interface Props {
  onGenerate: (spec: StorySpec) => void;
  isLoading: boolean;
}

const FORMAT_OPTIONS: Array<{
  id: ContentFormat;
  title: string;
  desc: string;
  icon: any;
}> = [
  {
    id: 'character_drama',
    title: 'Character Drama',
    desc: 'Multi-character cinematic dialogue with strict speaker isolation and shot-reverse-shot cuts.',
    icon: Film,
  },
  {
    id: 'object_talking',
    title: 'Object-Talking',
    desc: 'Expressive anthropomorphic objects with high emotional relatability and psychological hooks.',
    icon: Smile,
  },
  {
    id: 'podcast_style',
    title: 'Podcast-Style',
    desc: 'Multi-cam studio setup with deep industry secrets, debates, and contrarian wisdom.',
    icon: Mic,
  },
  {
    id: 'faceless_ambient',
    title: 'Faceless-Ambient',
    desc: 'Hypnotic slow-motion aesthetic visuals with poetic voiceover and high save-rate pacing.',
    icon: Layers,
  },
];

const GENRE_OPTIONS: GenreTheme[] = [
  'Family Drama',
  'Revenge',
  'Romance',
  'Comedy',
  'Rivalry',
  'Redemption',
  'Mystery',
  'Motivational',
];

const TONE_OPTIONS: ContentTone[] = [
  'Emotional / Heavy',
  'Light / Fun',
  'Intense / Suspenseful',
  'Inspirational',
];

const STYLE_OPTIONS: VisualStylePreset[] = [
  'Hyper-Realistic Cinematic',
  'Stylized 3D Animation',
  'Moody Film Noir',
  'Vibrant Commercial Gloss',
  'Vintage 90s Camcorder',
];

const LOCATION_PRESETS: string[] = [
  'Penthouse Study at Night',
  'Modern High-End Boardroom',
  'Rain-Drenched Cyberpunk Alley',
  'Dimly Lit Underground Vault',
  'Modern Acoustic Podcast Studio',
  'Minimalist Concrete Gallery',
  'Sunlit Rooftop Garden',
  'Warm Morning Kitchen',
  'Luxury Private Jet Cabin',
  'Grand Courthouse Corridor',
];

export function SpecWizard({ onGenerate, isLoading }: Props) {
  const [format, setFormat] = useState<ContentFormat>('character_drama');
  const [selectedGenres, setSelectedGenres] = useState<GenreTheme[]>(['Family Drama', 'Rivalry']);
  const [tone, setTone] = useState<ContentTone>('Intense / Suspenseful');
  const [visualStyle, setVisualStyle] = useState<VisualStylePreset>('Moody Film Noir');
  const [formatLength, setFormatLength] = useState<'single_video' | 'multi_episode_series'>('multi_episode_series');
  const [autonomousCast, setAutonomousCast] = useState<boolean>(true);
  const [castCount, setCastCount] = useState<number>(3);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'Penthouse Study at Night',
    'Modern High-End Boardroom',
  ]);
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowPipeline | null>(null);

  // Custom Story Premise & Idea (Optional)
  const [customStoryIdea, setCustomStoryIdea] = useState('');

  const handleSelectWorkflow = (wf: WorkflowPipeline | null) => {
    setSelectedWorkflow(wf);
    if (wf) {
      if (wf.nicheType === 'ai_influencer_ugc') {
        setFormat('character_drama');
      } else if (wf.nicheType === 'talking_object') {
        setFormat('object_talking');
      } else if (wf.nicheType === 'faceless_aesthetic') {
        setFormat('faceless_ambient');
      } else if (wf.nicheType === 'podcast_debate') {
        setFormat('podcast_style');
      } else {
        setFormat('character_drama');
      }
      setVisualStyle(wf.visualStylePreset);
      if (wf.defaultLocations && wf.defaultLocations.length > 0) {
        setSelectedLocations(wf.defaultLocations);
      }
    }
  };

  // Saved / Custom Characters State (Neon DB + Local)
  const [savedCharacters, setSavedCharacters] = useState<CastMember[]>([]);

  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [showCustomCharModal, setShowCustomCharModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<CharacterRole>('Hero');
  const [usesRefImage, setUsesRefImage] = useState(true);
  const [personalityVibe, setPersonalityVibe] = useState('');
  const [customDna, setCustomDna] = useState('');
  const [pinForFuture, setPinForFuture] = useState(true);

  // Fetch saved characters from Neon DB
  useEffect(() => {
    fetch('/api/characters')
      .then((res) => res.json())
      .then((data) => {
        if (data.characters && data.characters.length > 0) {
          setSavedCharacters(data.characters);
          // Auto-select pinned characters if any
          const pinned = data.characters.filter((c: any) => c.isPinned).map((c: any) => c.id);
          if (pinned.length > 0) {
            setSelectedCharacterIds(pinned);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch characters from DB:', err));
  }, []);

  const toggleGenre = (genre: GenreTheme) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      if (selectedLocations.length > 1) {
        setSelectedLocations(selectedLocations.filter((l) => l !== loc));
      }
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleAddCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customLocationInput.trim();
    if (trimmed && !selectedLocations.includes(trimmed)) {
      setSelectedLocations([...selectedLocations, trimmed]);
      setCustomLocationInput('');
    }
  };


  const handleSaveCustomCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const dnaText = usesRefImage
      ? `[FACE & IDENTITY]: Use attached Reference Image in Google Flow. Personality: ${personalityVibe || 'Charismatic & Intense'}. Wardrobe: Dynamic scene-appropriate.`
      : customDna.trim() || `${customName} - Fixed facial biometric description.`;

    const newChar: CastMember = {
      id: `char-${Date.now()}`,
      name: customName.trim(),
      role: customRole,
      description: `${customName} (${customRole}) - ${usesRefImage ? 'Reference Image Anchored' : 'Text DNA Anchored'}`,
      dnaPrompt: dnaText,
      usesReferenceImage: usesRefImage,
      personalityVibe: personalityVibe.trim(),
    };

    try {
      await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChar, isPinned: pinForFuture }),
      });
    } catch (err) {
      console.warn('Saved to local state only:', err);
    }

    setSavedCharacters([newChar, ...savedCharacters]);
    setSelectedCharacterIds([newChar.id, ...selectedCharacterIds]);
    setCustomName('');
    setCustomDna('');
    setPersonalityVibe('');
    setShowCustomCharModal(false);
  };

  const getPresetCast = (fmt: ContentFormat, count: number): CastMember[] => {
    // If user has selected saved custom characters, use them!
    const customChosen = savedCharacters.filter((c) => selectedCharacterIds.includes(c.id));
    if (customChosen.length > 0) {
      return customChosen.slice(0, count);
    }

    if (fmt === 'object_talking') {
      const objCast: CastMember[] = [
        {
          id: 'char-1',
          name: 'Coffee Mug',
          role: 'Hero',
          description: 'A weathered ceramic espresso mug with subtle expressive animated facial features.',
          dnaPrompt: 'Weathered ceramic espresso cup with glossy glaze, warm steam rising, expressive micro-expressions.',
        },
      ];
      return objCast;
    }

    if (fmt === 'faceless_ambient') {
      return [];
    }

    if (fmt === 'podcast_style') {
      const podcastCast: CastMember[] = [
        {
          id: 'char-1',
          name: 'Host Alex',
          role: 'Hero',
          description: '32yo charismatic podcast host with black studio headphones and grey hoodie.',
          dnaPrompt: '32yo host with black headphones, slate grey hoodie, Shure microphone arm foreground.',
        },
        {
          id: 'char-2',
          name: 'Guest Marcus',
          role: 'Side',
          description: '40yo investor with navy tailored blazer and silver-streaked hair.',
          dnaPrompt: '40yo investor with navy blazer, silver-streaked hair, sharp facial profile.',
        },
      ];
      return podcastCast;
    }

    // Character Drama default (Global Hollywood / Netflix Noir)
    const dramaCast: CastMember[] = [
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

    if (autonomousCast) {
      return dramaCast;
    }
    return dramaCast.slice(0, count);
  };

  const handleGenerateClick = () => {
    const defaultLocations =
      format === 'podcast_style'
        ? ['Modern Dark Podcast Studio']
        : format === 'faceless_ambient'
        ? ['Rain-Drenched Midnight City']
        : format === 'object_talking'
        ? ['Warm Morning Kitchen Table']
        : ['Penthouse Study at Night', 'Boardroom Corridor'];

    const activeCast = getPresetCast(format, castCount);

    const spec: StorySpec = {
      id: `spec-${Date.now()}`,
      format,
      genres: selectedGenres,
      tone,
      castCount: format === 'faceless_ambient' ? 1 : activeCast.length || castCount,
      cast: activeCast,
      visualStyle,
      formatLength,
      episodeCount: formatLength === 'multi_episode_series' ? 7 : 1,
      locationSettings: selectedLocations.length > 0 ? selectedLocations : defaultLocations,
      customStoryIdea: customStoryIdea.trim() || undefined,
      workflowPipeline: selectedWorkflow || undefined,
      createdAt: new Date().toISOString(),
    };

    onGenerate(spec);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-8">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Zero-Typing Studio
            </span>
            <span className="text-xs text-neutral-400">100% Select UI</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Story Specification & Production Setup
          </h2>
        </div>
        <div className="text-xs text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Produces 7-Day Arc × 3 Variations (21 Videos)</span>
        </div>
      </div>

      {/* Niche Workflow Pipeline Selector (Industry Presets + Custom Workflows) */}
      <WorkflowPipelineSelector
        selectedWorkflow={selectedWorkflow}
        onSelectWorkflow={handleSelectWorkflow}
      />

      {/* Optional: Custom Story Concept / Premise */}

      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-2 transition hover:border-indigo-500/30">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Have a Specific Story Idea or Premise? (Optional)
          </label>
          <span className="text-[11px] text-neutral-500">Leave blank for auto-directed arcs</span>
        </div>
        <input
          type="text"
          placeholder="e.g., Two brothers fighting over an inherited AI empire, or a coffee mug terrified of cold mornings..."
          value={customStoryIdea}
          onChange={(e) => setCustomStoryIdea(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Step 1: Content Format */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
            1
          </span>
          Select Content Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = format === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormat(opt.id)}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-neutral-400'}`} />
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-100 mb-1">{opt.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Genre/Theme (Multi-select) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
              2
            </span>
            Genre / Emotional Core (Multi-Select)
          </label>
          <span className="text-xs text-neutral-500">Selected: {selectedGenres.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Tone & Visual Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
              3
            </span>
            Pacing Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((t) => {
              const isSelected = tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`p-3 rounded-lg border text-xs font-medium text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-indigo-500 text-white'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span>{t}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Style Preset */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
              4
            </span>
            Visual Style Preset
          </label>
          <div className="grid grid-cols-1 gap-2">
            {STYLE_OPTIONS.map((st) => {
              const isSelected = visualStyle === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVisualStyle(st)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-indigo-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{st}</span>
                    {st === 'Moody Film Noir' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                        Global Hollywood / Netflix Noir
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 5: Location Settings & Master Spatial Anchors */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
              5
            </span>
            Location Settings & Spatial Master Anchors
          </label>
          <span className="text-xs text-neutral-500">Selected: {selectedLocations.length} locations</span>
        </div>

        {/* Preset Location Buttons */}
        <div className="flex flex-wrap gap-2">
          {LOCATION_PRESETS.map((loc) => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => toggleLocation(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected ? 'text-blue-400' : 'text-neutral-500'}`} />
                <span>{loc}</span>
                {isSelected && <Check className="w-3 h-3 text-blue-400 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Custom Location Input */}
        <form onSubmit={handleAddCustomLocation} className="flex gap-2 pt-1 max-w-md">
          <input
            type="text"
            placeholder="Add custom location (e.g. Neon Cyber Diner)..."
            value={customLocationInput}
            onChange={(e) => setCustomLocationInput(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1 border border-neutral-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Step 6: Persistent Character DNA & Cast Setup */}
      {format !== 'faceless_ambient' && (
        <div className="space-y-4 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[11px]">
                6
              </span>
              Cast & Character DNA Lock (Carried across whole week)
            </label>
            <button
              type="button"
              onClick={() => setShowCustomCharModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Fixed Character</span>
            </button>
          </div>


          {/* Autonomous Cast vs Manual Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAutonomousCast(true)}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                autonomousCast
                  ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border-indigo-500/80 text-white shadow-lg shadow-indigo-900/20'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${autonomousCast ? 'text-amber-400' : 'text-neutral-500'}`} />
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <span>✨ AI Autonomous Cast Generation</span>
                    <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-500/30 text-indigo-300 uppercase tracking-wide">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] font-normal text-neutral-400">
                    Auto-generates Hollywood Noir cast based on your story conflict
                  </p>
                </div>
              </div>
              {autonomousCast && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
            </button>

            <button
              type="button"
              onClick={() => setAutonomousCast(false)}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                !autonomousCast
                  ? 'bg-neutral-800 border-indigo-500 text-white shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className={`w-4 h-4 ${!autonomousCast ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <div>
                  <div className="text-neutral-200 font-bold">Manual Cast / Saved Library</div>
                  <p className="text-[11px] font-normal text-neutral-400">
                    Pick presets or select from your pinned characters
                  </p>
                </div>
              </div>
              {!autonomousCast && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
            </button>
          </div>

          {/* Autonomous Cast Intelligence Banner */}
          {autonomousCast ? (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Netflix Noir Cast Engine Active
                  </span>
                  <span className="text-xs text-neutral-300 font-medium">3 Autonomous Characters Generated</span>
                </div>
                <span className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Consistent Reference Anchors
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                The AI Director autonomously binds 3 deep Hollywood Noir characters to your story premise. Their Master Prompts are grouped in the <strong className="text-white font-semibold">Master Cast Deck</strong> at the top of your series, and all video frame keyframes use <strong className="text-white font-semibold">Reference Image Anchoring</strong> to guarantee 100% facial consistency without face morphing.
              </p>

              {/* Character Preview Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    H
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Julian Vance</p>
                    <p className="text-[10px] text-neutral-400 truncate">Lead Defense Counsel • Charcoal suit</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    V
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Elena Sterling</p>
                    <p className="text-[10px] text-neutral-400 truncate">Venture Partner • Raven chignon</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Marcus Kane</p>
                    <p className="text-[10px] text-neutral-400 truncate">Intelligence Fixer • Leather coat</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Saved Characters Library */}
              {savedCharacters.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] text-neutral-400">Your Saved / Pinned Character Library:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedCharacters.map((c) => {
                      const isSelected = selectedCharacterIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCharacterIds(selectedCharacterIds.filter((id) => id !== c.id));
                            } else {
                              setSelectedCharacterIds([...selectedCharacterIds, c.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{c.name} ({c.role})</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-1">{c.dnaPrompt}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preset Cast Selector */}
              {selectedCharacterIds.length === 0 && (
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCastCount(num)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition ${
                        castCount === num
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      Default Preset: {num} Character{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Format Length */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Tv className="w-4 h-4 text-indigo-400" />
          Delivery Schedule
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormatLength('multi_episode_series')}
            className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition ${
              formatLength === 'multi_episode_series'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            Full 7-Day Weekly Arc (21 Variations)
          </button>
          <button
            type="button"
            onClick={() => setFormatLength('single_video')}
            className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition ${
              formatLength === 'single_video'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            Single Episode
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Directing Prompts & Enforcing Quality Gate...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Generate Full Production Batch</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {/* Custom Character Modal */}
      {showCustomCharModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-indigo-400" />
                Define Fixed Series Character DNA
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomCharModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomCharacter} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Character Name</label>
                <input
                  type="text"
                  placeholder="e.g. Captain Zara"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Role in Story</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as CharacterRole)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hero">Hero / Protagonist</option>
                  <option value="Villain">Villain / Antagonist</option>
                  <option value="Side">Side / Supporting</option>
                  <option value="Narrator">Narrator / Host</option>
                </select>
              </div>

              {/* Reference Image Option Toggle */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    📎 Reference Image Facial Likeness
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usesRefImage}
                      onChange={(e) => setUsesRefImage(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {usesRefImage ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Speech & Personality Vibe
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Cynical, sharp-tongued, calm under pressure, intense"
                        value={personalityVibe}
                        onChange={(e) => setPersonalityVibe(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 space-y-1">
                      <p className="font-semibold">✨ How this works in Google Flow:</p>
                      <p className="text-neutral-400">
                        1. Facial DNA is 100% locked to your uploaded reference image.
                      </p>
                      <p className="text-neutral-400">
                        2. <strong>Story-Adaptive Wardrobe:</strong> Our engine will automatically dress your character to match each specific scene (e.g. courtroom suit, casual hoodie, trench coat) while maintaining the exact same face.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Manual Text Biometrics & Clothing
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 30yo sharp-featured man with charcoal wool coat, intense dark eyes..."
                      value={customDna}
                      onChange={(e) => setCustomDna(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin"
                  checked={pinForFuture}
                  onChange={(e) => setPinForFuture(e.target.checked)}
                  className="rounded border-neutral-800 text-indigo-600 focus:ring-0 bg-neutral-950"
                />
                <label htmlFor="pin" className="text-xs text-neutral-300 cursor-pointer">
                  Pin to Neon DB (Available across all 7 days & future episodes)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCustomCharModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Character DNA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
