'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  ChevronRight,
  Copy,
  Check,
  ArrowLeft,
  Tv,
  Layers,
  ShieldCheck,
  AlertCircle,
  Play,
  FileText,
  SlidersHorizontal,
  Eye,
  Camera,
  Compass,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import {
  DramaSeriesState,
  DramaPipelineGate,
  SeasonStory,
  CharacterBible,
  EpisodeProductionSheet,
  SceneContinuityPlan,
  TenSecClipDef,
  FramePromptItem,
  VideoPromptItem,
  DirectorQAPackage,
} from '@/types/drama-series';
import { getStoredAIConfig } from '@/lib/ai/ai-settings';
import { AISettingsModal } from '@/components/settings/AISettingsModal';
import { AIProviderConfig } from '@/lib/engine/llm-provider';
import { AdminAccessGuard } from '@/components/auth/AdminAccessGuard';
import { DirectorCopilotDrawer } from '@/components/drama-series/DirectorCopilotDrawer';

const DRAMA_SERIES_STORAGE_KEY = 'flowcreator_drama_series_production_state';

const DRAMA_PRESETS = [
  {
    title: 'Echoes of Betrayal (Romance & Revenge)',
    topic:
      'Two estranged lovers and former partners—a brilliant female architect and a brooding corporate strategist—meet in a rain-drenched luxury penthouse years after a calculated betrayal destroyed her family. As her ruthless plan for revenge unfolds, their deep, unresolved love and tearful secrets resurface.',
    genre: 'Cinematic Emotional Drama & Revenge Romance',
  },
  {
    title: 'The Broken Vow (Dynasty Romance & Vendetta)',
    topic:
      'A forbidden love between heirs of two warring empires turns into a deadly game of revenge when an orchestrated corporate scandal ruins his family. Forced into midnight confrontations, she must choose between ruthless family loyalty and the man she still desperately loves.',
    genre: 'High-Tension Romantic Thriller & Family Melodrama',
  },
  {
    title: 'Tears in the Penthouse (Second Chance Romance)',
    topic:
      'Five years after walking away at the altar to secretly protect her from a dangerous syndicate, a brooding tycoon returns into her life. Trapped together in a high-stakes corporate takeover, five years of heartbreak, unspoken tears, and suppressed passion explode into fierce emotional confrontations.',
    genre: 'Prestige Melodrama & Second-Chance Emotional Romance',
  },
];

export default function DramaSeriesStudioPage() {
  return (
    <AdminAccessGuard personaName="Drama Series (Cinematic Human Drama)" isStudioPage>
      <DramaSeriesStudioContent />
    </AdminAccessGuard>
  );
}

function DramaSeriesStudioContent() {
  // Production State
  const [currentGate, setCurrentGate] = useState<DramaPipelineGate>(1);
  const [completedGates, setCompletedGates] = useState<DramaPipelineGate[]>([]);
  const [seedTopic, setSeedTopic] = useState('');
  const [genre, setGenre] = useState('Cinematic Emotional Drama & Revenge Romance');
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // Phase Data
  const [seasonStory, setSeasonStory] = useState<SeasonStory | null>(null);
  const [characterBible, setCharacterBible] = useState<CharacterBible | null>(null);
  const [episodeProduction, setEpisodeProduction] = useState<EpisodeProductionSheet | null>(null);
  const [sceneContinuity, setSceneContinuity] = useState<SceneContinuityPlan[] | null>(null);
  const [clipsBreakdown, setClipsBreakdown] = useState<TenSecClipDef[] | null>(null);
  const [framePrompts, setFramePrompts] = useState<FramePromptItem[] | null>(null);
  const [videoPrompts, setVideoPrompts] = useState<VideoPromptItem[] | null>(null);
  const [directorQA, setDirectorQA] = useState<DirectorQAPackage | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepText, setActiveStepText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [currentAIConfig, setCurrentAIConfig] = useState<AIProviderConfig>({ provider: 'mistral' });
  const [optionalLocationHint, setOptionalLocationHint] = useState<string>('');

  // Load cached state on mount
  useEffect(() => {
    try {
      setCurrentAIConfig(getStoredAIConfig());
      const cached = localStorage.getItem(DRAMA_SERIES_STORAGE_KEY);
      if (cached) {
        const parsed: DramaSeriesState = JSON.parse(cached);
        if (parsed.seasonStory) setSeasonStory(parsed.seasonStory);
        if (parsed.characterBible) setCharacterBible(parsed.characterBible);
        if (parsed.episodeProduction) setEpisodeProduction(parsed.episodeProduction);
        if (parsed.sceneContinuity) setSceneContinuity(parsed.sceneContinuity);
        if (parsed.clipsBreakdown) setClipsBreakdown(parsed.clipsBreakdown);
        if (parsed.framePrompts) setFramePrompts(parsed.framePrompts);
        if (parsed.videoPrompts) setVideoPrompts(parsed.videoPrompts);
        if (parsed.directorQA) setDirectorQA(parsed.directorQA);
        if (parsed.currentGate) setCurrentGate(parsed.currentGate);
        if (parsed.completedGates) setCompletedGates(parsed.completedGates);
        if (parsed.seedTopic) setSeedTopic(parsed.seedTopic);
        if (parsed.selectedEpisodeNumber) setSelectedEpisodeNumber(parsed.selectedEpisodeNumber);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
      }
    } catch (e) {
      console.warn('Could not read cached drama state:', e);
    }
  }, []);

  // Save state helper
  const saveStateToStorage = (updates: Partial<DramaSeriesState>) => {
    try {
      const stateToSave: DramaSeriesState = {
        currentGate: updates.currentGate ?? currentGate,
        completedGates: updates.completedGates ?? completedGates,
        seedTopic: updates.seedTopic ?? seedTopic,
        seasonStory: updates.seasonStory ?? seasonStory ?? undefined,
        characterBible: updates.characterBible ?? characterBible ?? undefined,
        selectedEpisodeNumber: updates.selectedEpisodeNumber ?? selectedEpisodeNumber,
        episodeProduction: updates.episodeProduction ?? episodeProduction ?? undefined,
        sceneContinuity: updates.sceneContinuity ?? sceneContinuity ?? undefined,
        clipsBreakdown: updates.clipsBreakdown ?? clipsBreakdown ?? undefined,
        framePrompts: updates.framePrompts ?? framePrompts ?? undefined,
        videoPrompts: updates.videoPrompts ?? videoPrompts ?? undefined,
        directorQA: updates.directorQA ?? directorQA ?? undefined,
        aspectRatio: updates.aspectRatio ?? aspectRatio,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAMA_SERIES_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save drama state to local storage:', e);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // API Call Wrapper
  const callDramaPipeline = async (action: string, payload: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const aiConfig = getStoredAIConfig();
      setCurrentAIConfig(aiConfig);

      const res = await fetch('/api/drama-series/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, aiConfig, ...payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Pipeline failed on action: ${action}`);
      }
      return data;
    } catch (err: any) {
      console.error(`Error in action ${action}:`, err);
      setErrorMsg(err.message || 'Pipeline execution failed.');
      throw err;
    } finally {
      setIsLoading(false);
      setActiveStepText('');
    }
  };

  // PHASE 1: Generate Season Story
  const handleGenerateSeason = async () => {
    setActiveStepText('Architecting Story-Driven Real Drama World & Episode Arcs...');
    try {
      const data = await callDramaPipeline('season_story', {
        seedTopic,
        genre,
        optionalLocationHint: optionalLocationHint.trim() || undefined,
      });
      setSeasonStory(data.seasonStory);
      saveStateToStorage({ seasonStory: data.seasonStory });
    } catch (e) {}
  };

  // GATE 1 APPROVAL -> MOVE TO GATE 2
  const handleApproveGate1 = () => {
    if (!completedGates.includes(1)) setCompletedGates([...completedGates, 1]);
    setCurrentGate(2);
    saveStateToStorage({
      currentGate: 2,
      completedGates: Array.from(new Set([...completedGates, 1])),
    });
  };

  // PHASE 2: Generate Character Bible
  const handleGenerateCharacterBible = async () => {
    if (!seasonStory) return;
    setActiveStepText('Designing Character Bible & Morphology Specs (CHAR-01, CHAR-02)...');
    try {
      const data = await callDramaPipeline('character_bible', { seasonStory });
      setCharacterBible(data.characterBible);
      saveStateToStorage({ characterBible: data.characterBible });
    } catch (e) {}
  };

  // GATE 2 APPROVAL -> MOVE TO GATE 3
  const handleApproveGate2 = () => {
    if (!completedGates.includes(2)) setCompletedGates([...completedGates, 2]);
    setCurrentGate(3);
    saveStateToStorage({
      currentGate: 3,
      completedGates: Array.from(new Set([...completedGates, 2])),
    });
  };

  // PHASE 3: Generate Episode Production Breakdown
  const handleGenerateEpisodeSheet = async () => {
    if (!seasonStory || !characterBible) return;
    setActiveStepText(`Deconstructing Episode ${selectedEpisodeNumber} into Scenes & Beats...`);
    try {
      const data = await callDramaPipeline('episode_breakdown', {
        seasonStory,
        characterBible,
        episodeNumber: selectedEpisodeNumber,
      });
      setEpisodeProduction(data.episodeSheet);
      saveStateToStorage({ episodeProduction: data.episodeSheet });
    } catch (e) {}
  };

  // GATE 3 APPROVAL -> MOVE TO GATE 4
  const handleApproveGate3 = () => {
    if (!completedGates.includes(3)) setCompletedGates([...completedGates, 3]);
    setCurrentGate(4);
    saveStateToStorage({
      currentGate: 4,
      completedGates: Array.from(new Set([...completedGates, 3])),
    });
  };

  // PHASE 4 & 5: Generate Scene Continuity & 10s Clip Breakdown
  const handleGenerateClipsAndContinuity = async () => {
    if (!episodeProduction || !characterBible) return;
    setActiveStepText('Enforcing 180° Spatial Axis & 10s Clip Speaker Isolation...');
    try {
      const data = await callDramaPipeline('clips_continuity', {
        episodeSheet: episodeProduction,
        characterBible,
      });
      setSceneContinuity(data.sceneContinuity);
      setClipsBreakdown(data.clipsBreakdown);
      saveStateToStorage({
        sceneContinuity: data.sceneContinuity,
        clipsBreakdown: data.clipsBreakdown,
      });
    } catch (e) {}
  };

  // GATE 4 & 5 APPROVAL -> MOVE TO GATE 6
  const handleApproveGate4And5 = () => {
    const newCompleted = Array.from(new Set([...completedGates, 4, 5])) as DramaPipelineGate[];
    setCompletedGates(newCompleted);
    setCurrentGate(6);
    saveStateToStorage({
      currentGate: 6,
      completedGates: newCompleted,
    });
  };

  // PHASE 6 & 7: Generate Frame & Video Prompts
  const handleGeneratePrompts = async () => {
    if (!clipsBreakdown || !characterBible || !sceneContinuity) return;
    setActiveStepText('Synthesizing Starting Frame Prompts & Google Flow (Veo) Motion Prompts...');
    try {
      const data = await callDramaPipeline('prompts', {
        clipsBreakdown,
        characterBible,
        sceneContinuity,
        aspectRatio,
      });
      setFramePrompts(data.framePrompts);
      setVideoPrompts(data.videoPrompts);
      saveStateToStorage({
        framePrompts: data.framePrompts,
        videoPrompts: data.videoPrompts,
      });
    } catch (e) {}
  };

  // GATE 6 & 7 APPROVAL -> MOVE TO GATE 8
  const handleApproveGate6And7 = () => {
    const newCompleted = Array.from(new Set([...completedGates, 6, 7])) as DramaPipelineGate[];
    setCompletedGates(newCompleted);
    setCurrentGate(8);
    saveStateToStorage({
      currentGate: 8,
      completedGates: newCompleted,
    });
  };

  // PHASE 8: Run Director QA
  const handleRunDirectorQA = async () => {
    if (!clipsBreakdown || !framePrompts || !videoPrompts || !characterBible || !sceneContinuity)
      return;
    setActiveStepText('Activating Director Agent: Auditing 9 Continuity Dimensions...');
    try {
      const data = await callDramaPipeline('director_qa', {
        clipsBreakdown,
        framePrompts,
        videoPrompts,
        characterBible,
        sceneContinuity,
      });
      setDirectorQA(data.directorQA);
      saveStateToStorage({ directorQA: data.directorQA });
    } catch (e) {}
  };

  // POWER USER: Run Gates 3 to 8 for the selected episode in 1 Click
  const handleRunFullEpisode = async () => {
    if (!seasonStory || !characterBible) return;
    setActiveStepText(`Directing Full Production for Episode ${selectedEpisodeNumber} (Gates 3-8)...`);
    try {
      const data = await callDramaPipeline('run_full_episode', {
        seasonStory,
        characterBible,
        episodeNumber: selectedEpisodeNumber,
        aspectRatio,
      });
      setEpisodeProduction(data.episodeSheet);
      setSceneContinuity(data.sceneContinuity);
      setClipsBreakdown(data.clipsBreakdown);
      setFramePrompts(data.framePrompts);
      setVideoPrompts(data.videoPrompts);
      setDirectorQA(data.directorQA);

      const allGates: DramaPipelineGate[] = [1, 2, 3, 4, 5, 6, 7, 8];
      setCompletedGates(allGates);
      setCurrentGate(8);
      saveStateToStorage({
        episodeProduction: data.episodeSheet,
        sceneContinuity: data.sceneContinuity,
        clipsBreakdown: data.clipsBreakdown,
        framePrompts: data.framePrompts,
        videoPrompts: data.videoPrompts,
        directorQA: data.directorQA,
        completedGates: allGates,
        currentGate: 8,
      });
    } catch (e) {}
  };

  const handleResetProduction = () => {
    if (confirm('Are you sure you want to reset the entire drama production pipeline state? This clears all cached data to start fresh.')) {
      localStorage.removeItem(DRAMA_SERIES_STORAGE_KEY);
      setSeasonStory(null);
      setCharacterBible(null);
      setEpisodeProduction(null);
      setSceneContinuity(null);
      setClipsBreakdown(null);
      setFramePrompts(null);
      setVideoPrompts(null);
      setDirectorQA(null);
      setCurrentGate(1);
      setCompletedGates([]);
      setSeedTopic('');
      setGenre('Cinematic Emotional Drama & Revenge Romance');
      setOptionalLocationHint('');
    }
  };

  // Helper for Exporting Full Production Package
  const handleExportPackage = () => {
    if (!episodeProduction || !framePrompts || !videoPrompts) return;
    let md = `# PRODUCTION PACKAGE: EPISODE ${episodeProduction.episodeNumber} - ${episodeProduction.episodeTitle}\n\n`;
    md += `**Series:** ${seasonStory?.seasonTitle || 'Prestige Cinematic Drama Series'}\n`;
    md += `**Target Runtime:** ${episodeProduction.runtimeTarget}\n`;
    md += `**Story:** ${episodeProduction.storySummary}\n\n`;
    md += `## 1. CAST INVOLVED\n`;
    characterBible?.characters.forEach((c) => {
      md += `- **${c.id} (${c.name})**: ${c.speciesObject} (${c.personality})\n`;
    });
    md += `\n## 2. 10-SECOND CLIPS & PROMPTS\n\n`;
    videoPrompts.forEach((vp, idx) => {
      const fp = framePrompts[idx];
      const clip = clipsBreakdown?.[idx];
      md += `### CLIP ${vp.clipNumber} (10 SECONDS)\n`;
      if (clip?.locationContinuityType === 'SAME_LOCATION_CONTINUOUS' || fp?.isContinuousFromPrevious) {
        md += `> **🔄 LOCATION CONTINUITY DIRECTIVE:** Location does NOT change from Clip ${vp.clipNumber - 1}. Use the **Ending Frame (last frame) of Clip ${vp.clipNumber - 1}** as the starting frame input in Google Flow (Veo) Image-to-Video mode for 100% actor and environment continuity.\n\n`;
      } else {
        md += `> **🎬 NEW SCENE CUT / ESTABLISHING FRAME:** Generate fresh starting frame using the prompt below.\n\n`;
      }
      md += `- **Active Speaker:** ${vp.activeSpeaker}\n`;
      md += `- **Dialogue:** "${vp.dialogueLine}"\n`;
      md += `- **Listener Tag:** ${vp.listenerDirective}\n\n`;
      md += `**Still Frame Prompt (Google Flow / Midjourney):**\n\`\`\`\n${fp?.prompt}\n\`\`\`\n\n`;
      md += `**Motion Video Prompt (Google Flow / Veo):**\n\`\`\`\n${vp.prompt}\n\`\`\`\n\n---\n\n`;
    });
    if (directorQA) {
      md += `## 3. DIRECTOR QA AUDIT\n`;
      md += `**Status:** ${directorQA.overallStatus}\n`;
      md += `**Summary:** ${directorQA.summary}\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Episode-${episodeProduction.episodeNumber}-Production-Package.md`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#08080a] text-neutral-100 antialiased pb-28">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Studio Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Drama Series Studio</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-semibold">Emotional Romance & Revenge</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                  Master Pipeline
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 hidden sm:block">
                Prestige Human Drama • Google Flow (Veo) 10s Choreography • 180° Spatial Axis Lock
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCopilot(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs flex items-center gap-1.5 shadow-sm transition font-bold"
              title="Open AI Director Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setShowAISettingsModal(true)}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs flex items-center gap-1.5 transition"
              title="AI Engine Settings"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline font-mono text-[11px]">{currentAIConfig.provider}</span>
            </button>

            <button
              onClick={handleResetProduction}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/50 hover:text-red-300 text-neutral-400 border border-neutral-800 text-xs transition"
              title="Reset Pipeline"
            >
              Reset
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Hub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner & Pipeline Gate Tracker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Pipeline Stepper Navigation */}
        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 shadow-xl backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              Production Pipeline Gates (Strict Approval Flow)
            </span>
            <span className="text-xs text-purple-300 font-semibold">
              Gate {currentGate} of 8 {completedGates.includes(currentGate) ? '• Approved' : '• Pending Approval'}
            </span>
          </div>

          {/* Gates Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { gate: 1, label: '1. Season Story', icon: Layers },
              { gate: 2, label: '2. Character Bible', icon: Lock },
              { gate: 3, label: '3. Episode Sheet', icon: FileText },
              { gate: 4, label: '4. Scene 180° Axis', icon: Compass },
              { gate: 5, label: '5. 10s Clips Break', icon: Tv },
              { gate: 6, label: '6. Frame Prompts', icon: Camera },
              { gate: 7, label: '7. Video Prompts', icon: Film },
              { gate: 8, label: '8. Director QA', icon: ShieldCheck },
            ].map(({ gate, label, icon: Icon }) => {
              const isCurrent = currentGate === gate;
              const isCompleted = completedGates.includes(gate as DramaPipelineGate);

              return (
                <button
                  key={gate}
                  onClick={() => isCompleted && setCurrentGate(gate as DramaPipelineGate)}
                  disabled={!isCompleted && currentGate !== gate}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-purple-950/60 border-purple-500/80 shadow-md shadow-purple-500/10 text-white'
                      : isCompleted
                      ? 'bg-neutral-900/90 border-emerald-500/40 text-neutral-200 hover:border-emerald-400 cursor-pointer'
                      : 'bg-neutral-950/60 border-neutral-800/60 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isCurrent
                          ? 'text-purple-400'
                          : isCompleted
                          ? 'text-emerald-400'
                          : 'text-neutral-600'
                      }`}
                    />
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    ) : (
                      <Lock className="w-3 h-3 text-neutral-600" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold leading-tight truncate">{label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Loading Spinner / Status Alert */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3 text-purple-200 mb-6 animate-pulse">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
            <div className="text-xs font-semibold">{activeStepText || 'Processing AI Pipeline Stage...'}</div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center justify-between gap-3 text-red-200 mb-6">
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-neutral-400 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 1: SEASON STORY DEVELOPMENT */}
        {/* ======================================================== */}
        {currentGate === 1 && (
          <div className="space-y-6">
            {/* Input Config Card */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Phase 1: Season Story & World Architecture
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Define the high-level world, emotional stakes, and serialized multi-episode narrative arc.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DRAMA_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSeedTopic(p.topic);
                        setGenre(p.genre);
                        saveStateToStorage({ seedTopic: p.topic });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition"
                      title={p.title}
                    >
                      {p.title.split(' (')[0]}
                    </button>
                  ))}
                  {seedTopic && (
                    <button
                      onClick={() => {
                        setSeedTopic('');
                        saveStateToStorage({ seedTopic: '' });
                      }}
                      className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[11px] font-medium border border-red-500/30 transition"
                      title="Clear textarea"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Creative Seed / Series Concept
                  </label>
                  <textarea
                    rows={3}
                    value={seedTopic}
                    onChange={(e) => {
                      setSeedTopic(e.target.value);
                      saveStateToStorage({ seedTopic: e.target.value });
                    }}
                    placeholder="Apna real human emotional drama, romance, betrayal ya revenge concept yahan likhein (ya upar diye gaye buttons me sy koi example load krein)..."
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <div className="flex flex-col gap-1 text-[11px] text-purple-300 mt-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Story-Driven World & Multi-Layered Drama Mixup</span>
                    </div>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      AI story engine har drama men <strong>Romance, Emotional Heartbreak, Revenge Vendetta aur Pride</strong> ka balanced mixup banata hai. Story sirf revenge par flat nahi hogi, balky deep love aur tears ka zabardast drama banegi.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Atmosphere / Setting Note <span className="text-neutral-500 font-normal">(Optional — AI designs automatically if left blank)</span>
                  </label>
                  <input
                    type="text"
                    value={optionalLocationHint}
                    onChange={(e) => setOptionalLocationHint(e.target.value)}
                    placeholder="e.g. Midnight rainstorm in Manhattan, or coastal family mansion at dusk (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-bold">Aspect Ratio:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatio('16:9');
                        saveStateToStorage({ aspectRatio: '16:9' });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        aspectRatio === '16:9'
                          ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-sm shadow-purple-500/20'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      <span>16:9 Widescreen (Landscape)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatio('9:16');
                        saveStateToStorage({ aspectRatio: '9:16' });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        aspectRatio === '9:16'
                          ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-sm shadow-purple-500/20'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      <span>9:16 Vertical (Reels/Shorts)</span>
                    </button>
                  </div>

                  <button
                    onClick={handleGenerateSeason}
                    disabled={isLoading || !seedTopic}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{seasonStory ? 'Regenerate Season Story' : 'Generate Season Story (Phase 1)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Season Story Output View */}
            {seasonStory && (
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-purple-500/30 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Approved Season Concept
                    </span>
                    <h3 className="text-lg font-extrabold text-white">{seasonStory.seasonTitle}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{seasonStory.worldEnvironment}</p>
                  </div>
                  <button
                    onClick={handleApproveGate1}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Gate 1 & Unlock Character Bible</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Core Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase font-bold block mb-1">
                      Main Theme & Tone
                    </span>
                    <p className="text-neutral-300 leading-relaxed font-medium">{seasonStory.mainTheme}</p>
                    <p className="text-neutral-400 mt-2 text-[11px]">{seasonStory.overallTone}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase font-bold block mb-1">
                      Comedy & Emotional Style
                    </span>
                    <p className="text-neutral-300 leading-relaxed">{seasonStory.comedyStyle}</p>
                    <p className="text-neutral-400 mt-2 text-[11px]">{seasonStory.emotionalStyle}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase font-bold block mb-1">
                      Season Climax & Ending
                    </span>
                    <p className="text-neutral-300 leading-relaxed">{seasonStory.seasonClimax}</p>
                    <p className="text-neutral-400 mt-2 text-[11px]">{seasonStory.seasonEnding}</p>
                  </div>
                </div>

                {/* Serialized Episodes List */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
                    Serialized Episode Arcs ({seasonStory.episodes.length} Episodes)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seasonStory.episodes.map((ep) => (
                      <div
                        key={ep.episodeNumber}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-400">
                            Episode {ep.episodeNumber}: {ep.episodeTitle}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                            {ep.charactersInvolved.join(', ')}
                          </span>
                        </div>
                        <p className="text-neutral-300">{ep.mainStory}</p>
                        <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-900 flex justify-between">
                          <span>
                            <strong>Hook:</strong> {ep.beginning.slice(0, 45)}...
                          </span>
                          <span className="text-purple-300 font-mono">End: {ep.ending.slice(0, 30)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 2: CHARACTER BIBLE */}
        {/* ======================================================== */}
        {currentGate === 2 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Phase 2: Locked Character Bible & Object Morphology
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Permanent character IDs (CHAR-01, CHAR-02), exact anatomy, materials, voice, and continuity rules.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCharacterBible}
                  disabled={isLoading || !seasonStory}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{characterBible ? 'Regenerate Character Bible' : 'Synthesize Character Bible (Phase 2)'}</span>
                </button>
              </div>

              {characterBible && (
                <div className="space-y-6 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Found {characterBible.characters.length} core characters across the season.
                    </span>
                    <button
                      onClick={handleApproveGate2}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lock Bible & Move to Episode Breakdown (Gate 3)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {characterBible.characters.map((char) => (
                      <div
                        key={char.id}
                        className="p-5 rounded-2xl bg-neutral-950 border border-purple-500/20 space-y-4 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-extrabold text-xs">
                              {char.id}
                            </span>
                            <h4 className="font-extrabold text-white text-sm">{char.name}</h4>
                          </div>
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            {char.roleInStory}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-neutral-300 mb-1">
                            Role / Archetype: <span className="text-purple-300">{char.speciesObject}</span>
                          </div>
                          <p className="text-neutral-400 leading-relaxed">{char.personality}</p>
                        </div>

                        {/* Actor DNA Specs */}
                        <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5 text-[11px]">
                          <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px] block">
                            Actor Visual DNA & Facial Lock (Veo Master Identity)
                          </span>
                          <div>
                            <strong>Eyes & Emotion:</strong> {char.morphologySpec.eyeType}
                          </div>
                          <div>
                            <strong>Lips & Expression:</strong> {char.morphologySpec.mouthPlacement}
                          </div>
                          <div>
                            <strong>Body Language / Presence:</strong> {char.morphologySpec.limbPhysics}
                          </div>
                          <div>
                            <strong>Skin & Texture:</strong> {char.morphologySpec.materialTexture}
                          </div>
                        </div>

                        {/* Outfit & Voice */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                            <strong className="text-neutral-400 block mb-0.5">Wardrobe / Outfit:</strong>
                            <p className="text-neutral-300">{char.clothing.exactOutfit}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                            <strong className="text-neutral-400 block mb-0.5">Voice Profile:</strong>
                            <p className="text-neutral-300">
                              {char.voice.voiceType} ({char.voice.speakingSpeed})
                            </p>
                          </div>
                        </div>

                        {/* Continuity Rules */}
                        <div className="text-[10px] text-neutral-400 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/80">
                          <strong className="text-emerald-400">Lock Rule:</strong> {char.continuityRules.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 3: EPISODE PRODUCTION BREAKDOWN */}
        {/* ======================================================== */}
        {currentGate === 3 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Phase 3: Episode Production Breakdown
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Select an episode to direct. Work on ONE episode at a time (strict pipeline rule).
                  </p>
                </div>

                {seasonStory && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Episode:</span>
                    <select
                      value={selectedEpisodeNumber}
                      onChange={(e) => setSelectedEpisodeNumber(Number(e.target.value))}
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-bold focus:outline-none focus:border-purple-500"
                    >
                      {seasonStory.episodes.map((ep) => (
                        <option key={ep.episodeNumber} value={ep.episodeNumber}>
                          Ep {ep.episodeNumber}: {ep.episodeTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">
                  Target runtime: 40-60 seconds (4 to 6 continuous 10s clips)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateEpisodeSheet}
                    disabled={isLoading || !characterBible}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Breakdown for Ep {selectedEpisodeNumber}</span>
                  </button>

                  <button
                    onClick={handleRunFullEpisode}
                    disabled={isLoading || !characterBible}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
                    title="Auto-run Gates 3 to 8 for this episode"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Full Episode (Gates 3-8)</span>
                  </button>
                </div>
              </div>

              {episodeProduction && (
                <div className="space-y-6 pt-6 mt-6 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-400">Episode Production Sheet</span>
                      <h3 className="text-base font-extrabold text-white">
                        Ep {episodeProduction.episodeNumber}: {episodeProduction.episodeTitle}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">{episodeProduction.storySummary}</p>
                    </div>
                    <button
                      onClick={handleApproveGate3}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Gate 3 & Move to Scene Planning</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scenes List */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Scene-By-Scene Production Flow
                    </span>
                    {episodeProduction.scenes.map((scene) => (
                      <div
                        key={scene.sceneNumber}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-300">
                            Scene {scene.sceneNumber}: {scene.location}
                          </span>
                          <span className="text-neutral-500 text-[11px]">{scene.timeOfDay}</span>
                        </div>
                        <p className="text-neutral-300">{scene.scenePurpose}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-neutral-900 text-[11px]">
                          <div>
                            <strong className="text-neutral-400">Blocking & Positions:</strong> {scene.characterPositions}
                          </div>
                          <div>
                            <strong className="text-neutral-400">Camera Concept:</strong> {scene.cameraConcept}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 4 & 5: SCENE CONTINUITY & 10-SECOND CLIP BREAKDOWN */}
        {/* ======================================================== */}
        {(currentGate === 4 || currentGate === 5) && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-purple-400" />
                    Phase 4 & 5: 180° Spatial Axis & 10s Clip Speaker Isolation
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Strict left/right blocking, eye contact vectors, and 14-18 word budget per 10s clip.
                  </p>
                </div>
                <button
                  onClick={handleGenerateClipsAndContinuity}
                  disabled={isLoading || !episodeProduction}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {clipsBreakdown ? 'Regenerate Clips & Continuity' : 'Breakdown into 10s Clips (Phase 4 & 5)'}
                  </span>
                </button>
              </div>

              {clipsBreakdown && (
                <div className="space-y-6 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Generated {clipsBreakdown.length} sequential 10-second clips for Ep{' '}
                      {episodeProduction?.episodeNumber}.
                    </span>
                    <button
                      onClick={handleApproveGate4And5}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Spatial Plan & Move to Frame Prompts (Gate 6)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 180° Axis Locking Box */}
                  {sceneContinuity && sceneContinuity.length > 0 && (
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-purple-300 font-bold">
                        <Compass className="w-4 h-4" />
                        <span>180-Degree Axis & Spatial Geometry Lock</span>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        {sceneContinuity[0].axisOfAction180}
                      </p>
                      <div className="text-[11px] text-purple-300/90 font-mono">
                        {sceneContinuity[0].characterSpatialMapping}
                      </div>
                    </div>
                  )}

                  {/* Clips Cards */}
                  <div className="space-y-3">
                    {clipsBreakdown.map((clip) => (
                      <div
                        key={clip.clipNumber}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                              CLIP {clip.clipNumber} (10s)
                            </span>
                            <span className="text-neutral-300 font-bold">
                              Speaker: <span className="text-white">{clip.activeSpeaker}</span>
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              clip.wordCount <= 18
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-950 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {clip.wordCount} words (Budget: 14-18 max)
                          </span>
                        </div>

                        {/* Dialogue Line */}
                        <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                          <span className="text-[10px] font-bold text-neutral-500 block mb-0.5">SPOKEN DIALOGUE:</span>
                          <p className="text-neutral-100 font-medium italic">"{clip.dialogue}"</p>
                          {clip.listenerCharacter && (
                            <span className="text-[10px] text-neutral-400 block mt-1">
                              <strong>Listener Directive:</strong> {clip.listenerCharacter}
                            </span>
                          )}
                        </div>

                        {/* Location Continuity & Frame Reference Strategy */}
                        {clip.locationContinuityType === 'SAME_LOCATION_CONTINUOUS' ? (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 text-[11px]">
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>
                              <strong className="text-indigo-300">Same Location:</strong> Location change nahi ho rahi. Agli clip generate krny k liye <strong>Clip {clip.clipNumber - 1} ka Ending Frame</strong> use krein.
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-400 text-[10px]">
                            <span>🎬 {clip.clipNumber === 1 ? 'Episode opening shot — generate fresh establishing frame' : 'Scene transition / new location cut'}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-neutral-400 pt-1">
                          <div>
                            <strong>Eye Contact:</strong> {clip.eyeDirection}
                          </div>
                          <div>
                            <strong>Camera:</strong> {clip.cameraPosition} ({clip.cameraMovement})
                          </div>
                          <div>
                            <strong>Ending State:</strong> {clip.endingState}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 6 & 7: STILL FRAME & VIDEO PROMPTS */}
        {/* ======================================================== */}
        {(currentGate === 6 || currentGate === 7) && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-400" />
                    Phase 6 & 7: Starting Frame Prompts & Google Flow (Veo) Prompts
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Frame-first generation: Establish the still frame first, then animate strictly from that state.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatio('16:9');
                        saveStateToStorage({ aspectRatio: '16:9' });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        aspectRatio === '16:9'
                          ? 'bg-purple-950 text-purple-200 border border-purple-500/80 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      16:9 Widescreen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatio('9:16');
                        saveStateToStorage({ aspectRatio: '9:16' });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        aspectRatio === '9:16'
                          ? 'bg-purple-950 text-purple-200 border border-purple-500/80 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      9:16 Vertical
                    </button>
                  </div>

                  <button
                    onClick={handleGeneratePrompts}
                    disabled={isLoading || !clipsBreakdown}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{framePrompts ? 'Regenerate Prompts' : 'Synthesize Frame & Video Prompts'}</span>
                  </button>
                </div>
              </div>

              {videoPrompts && framePrompts && (
                <div className="space-y-6 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Prompts compiled for Google Flow / Veo with 1-click copy buttons.
                    </span>
                    <button
                      onClick={handleApproveGate6And7}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Prompts & Run Director QA (Gate 8)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {videoPrompts.map((vp, idx) => {
                      const fp = framePrompts[idx];
                      return (
                        <div
                          key={vp.clipNumber}
                          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                            <span className="font-extrabold text-sm text-purple-300">
                              CLIP {vp.clipNumber} (10 SECONDS)
                            </span>
                            <span className="text-xs text-neutral-400">
                              Active Speaker: <strong className="text-white">{vp.activeSpeaker}</strong>
                            </span>
                          </div>

                          {/* Phase 6: Still Frame Prompt */}
                          {fp && (
                            <div className="space-y-2">
                              {/* Workflow Reference Strategy Banner */}
                              {fp.isContinuousFromPrevious ? (
                                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/70 to-purple-950/40 border border-indigo-500/50 space-y-1">
                                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span>SAME LOCATION CONTINUATION — USE PREVIOUS CLIP END FRAME</span>
                                  </div>
                                  <p className="text-[11px] text-neutral-200 leading-relaxed">
                                    Location change nahi ho rahi! Clip {vp.clipNumber} usi scene men banti hai. Google Flow (Veo) Image-to-Video mode men <strong>Clip {fp.previousClipReference || vp.clipNumber - 1} ka Ending Frame (Last Frame)</strong> upload krein ta k character, lighting aur environment 100% match rahay.
                                  </p>
                                  <div className="text-[10px] text-neutral-400 pt-0.5">
                                    Fallback Text Prompt (agar naya still generate krna hu):
                                  </div>
                                </div>
                              ) : (
                                <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] flex items-center gap-1.5 w-fit">
                                  <span>🎬 New scene cut / establishing frame — generate fresh starting frame</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                                  Phase 6: Still Frame Prompt (Google Flow / Midjourney Starting Image)
                                </span>
                                <button
                                  onClick={() => handleCopy(fp.prompt, `frame-${vp.clipNumber}`)}
                                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 border border-neutral-800 transition"
                                >
                                  {copiedKey === `frame-${vp.clipNumber}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Frame Prompt</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="p-3 rounded-xl bg-neutral-900 text-xs text-neutral-300 leading-relaxed font-mono border border-neutral-800/80 select-all">
                                {fp.prompt}
                              </div>
                            </div>
                          )}

                          {/* Phase 7: Video Motion Prompt */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-purple-400" />
                                Phase 7: 10s Video Motion Prompt (Google Flow / Veo Motion Prompt)
                              </span>
                              <button
                                onClick={() => handleCopy(vp.prompt, `video-${vp.clipNumber}`)}
                                className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs flex items-center gap-1 border border-purple-500/30 transition"
                              >
                                {copiedKey === `video-${vp.clipNumber}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Veo Prompt</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-3 rounded-xl bg-neutral-900 text-xs text-purple-200 leading-relaxed font-mono border border-purple-500/20 select-all">
                              {vp.prompt}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GATE 8: DIRECTOR AGENT QA & FINAL APPROVAL */}
        {/* ======================================================== */}
        {currentGate === 8 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Phase 8: Director Agent QA & Continuity Audit
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Automated audit of all 9 continuity dimensions before declaring PRODUCTION READY.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunDirectorQA}
                    disabled={isLoading || !videoPrompts}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{directorQA ? 'Re-Run Director Audit' : 'Run Director QA Audit (Phase 8)'}</span>
                  </button>

                  {directorQA?.overallStatus === 'PRODUCTION READY' && (
                    <button
                      onClick={handleExportPackage}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Download Production Package (.md)</span>
                    </button>
                  )}
                </div>
              </div>

              {directorQA && (
                <div className="space-y-6 pt-4 border-t border-neutral-800">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      directorQA.overallStatus === 'PRODUCTION READY'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        className={`w-6 h-6 ${
                          directorQA.overallStatus === 'PRODUCTION READY'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      />
                      <div>
                        <div className="text-sm font-extrabold uppercase tracking-wide">
                          STATUS: {directorQA.overallStatus}
                        </div>
                        <div className="text-xs opacity-90 mt-0.5">{directorQA.summary}</div>
                      </div>
                    </div>
                  </div>

                  {/* Clip Audits */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Clip-By-Clip Continuity Verification
                    </span>
                    {directorQA.clipReviews.map((rev) => (
                      <div
                        key={rev.clipNumber}
                        className={`p-4 rounded-xl border space-y-3 text-xs ${
                          rev.status === 'PASS'
                            ? 'bg-neutral-950 border-neutral-800'
                            : 'bg-amber-950/20 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-white">CLIP {rev.clipNumber}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              rev.status === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>

                        {/* Checklist badges */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[10px]">
                          {Object.entries(rev.checks).map(([key, val]) => (
                            <div
                              key={key}
                              className={`p-1.5 rounded flex items-center gap-1 font-mono ${
                                val ? 'bg-neutral-900 text-neutral-300' : 'bg-red-950 text-red-300'
                              }`}
                            >
                              {val ? (
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                              )}
                              <span className="truncate">{key}</span>
                            </div>
                          ))}
                        </div>

                        {rev.issuesIdentified && rev.issuesIdentified.length > 0 && (
                          <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300">
                            <strong>Identified Issue:</strong> {rev.issuesIdentified.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Floating Director Copilot FAB */}
      <button
        onClick={() => setShowCopilot(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-2xl shadow-purple-600/40 border border-purple-400/40 transition hover:scale-105 active:scale-95 group"
      >
        <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
        <span>Ask Director AI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Director AI Copilot Drawer */}
      <DirectorCopilotDrawer
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        productionContext={{
          seasonStory,
          characterBible,
          selectedEpisodeNumber,
          episodeProduction,
          clipsBreakdown,
          framePrompts,
          videoPrompts,
        }}
        aiConfig={currentAIConfig}
      />

      {/* AI Settings Modal */}
      {showAISettingsModal && (
        <AISettingsModal
          isOpen={showAISettingsModal}
          onClose={() => {
            setShowAISettingsModal(false);
            setCurrentAIConfig(getStoredAIConfig());
          }}
        />
      )}
    </main>
  );
}
