'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StorySpec, WeeklyBatchDelivery } from '@/types';
import { WeeklyBatchView } from '@/components/studio/WeeklyBatchView';
import { TokenBurnBadge } from '@/components/studio/TokenBurnBadge';
import { getStoredAIConfig } from '@/lib/ai/ai-settings';
import { recordTokenBurn } from '@/lib/engine/tokens';
import {
  COZY_LIVING_ROOM_PROMPT,
  JOE_CAT_REFERENCE_PROMPT,
  NOVA_CORGI_REFERENCE_PROMPT,
  ZARA_OWNER_REFERENCE_PROMPT,
} from '@/lib/engine/templates/pet-comedy';
import {
  Film,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Copy,
  Check,
  ArrowLeft,
  Tv,
  Clapperboard,
  Cat,
  Dog,
  User,
  Home,
  Camera,
  Calendar as CalendarIcon,
  ShieldCheck,
  History,
  AlertCircle,
} from 'lucide-react';
import { ContentCalendarModal } from '@/components/calendar/ContentCalendarModal';
import { GenerationHistoryModal } from '@/components/studio/GenerationHistoryModal';
import { GenerationProgressModal } from '@/components/studio/GenerationProgressModal';
import { AISettingsModal } from '@/components/settings/AISettingsModal';
import { AIProviderConfig } from '@/lib/engine/llm-provider';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import { getOrCreateClientGuestId } from '@/lib/auth/session';
import { AdminAccessGuard } from '@/components/auth/AdminAccessGuard';

const PET_COMEDY_LOCAL_STORAGE_KEY = 'flowcreator_pet_comedy_persona2_batch';

const MASTER_PET_COMEDY_SPEC: StorySpec = {
  id: 'spec-pet-comedy-persona2-master',
  format: 'pet_comedy',
  genres: ['Comedy', 'Family Drama'],
  tone: 'Light / Fun',
  castCount: 3,
  cast: [
    {
      id: 'char-joe-cat',
      name: 'Joe (Cat)',
      role: 'Hero',
      description: 'Grey British Shorthair cat, sarcastic, overconfident, witty one-liners. Collar with round tag JOE.',
      dnaPrompt: JOE_CAT_REFERENCE_PROMPT,
      usesReferenceImage: true,
      personalityVibe: 'Deadpan, sarcastic, judgmental, superior',
    },
    {
      id: 'char-nova-corgi',
      name: 'Nova (Dog)',
      role: 'Side',
      description: 'Cream-colored corgi, hyper, loyal, takes things literally. Wearing red bowtie.',
      dnaPrompt: NOVA_CORGI_REFERENCE_PROMPT,
      usesReferenceImage: true,
      personalityVibe: 'Hyper, chaotic, earnest, comic relief',
    },
    {
      id: 'char-zara-owner',
      name: 'Zara (Owner)',
      role: 'Side',
      description: 'Young woman mid-20s, wavy brown hair, casual navy tank top, layered silver necklaces.',
      dnaPrompt: ZARA_OWNER_REFERENCE_PROMPT,
      usesReferenceImage: true,
      personalityVibe: 'Exasperated, loving, expressive pet parent',
    },
  ],
  visualStyle: 'Hyper-Realistic Cinematic',
  formatLength: 'multi_episode_series',
  locationSettings: [
    'Cozy traditional living room with cream sectional sofa, wooden coffee table, lit fireplace, tall bookshelf, parquet floors',
  ],
  createdAt: new Date().toISOString(),
};

export default function PetComedyStudioPage() {
  return (
    <AdminAccessGuard personaName="Pet Comedy (Joe, Nova, Zara)" isStudioPage>
      <PetComedyStudioContent />
    </AdminAccessGuard>
  );
}

function PetComedyStudioContent() {
  const [batch, setBatch] = useState<WeeklyBatchDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRefDrawer, setShowRefDrawer] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [hasSavedBatch, setHasSavedBatch] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [currentAIConfig, setCurrentAIConfig] = useState<AIProviderConfig>({ provider: 'mistral' });

  // Check if a previously generated batch exists in LocalStorage (do NOT auto-load to prevent accidental token confusion)
  useEffect(() => {
    try {
      setCurrentAIConfig(getStoredAIConfig());
      const cached = localStorage.getItem(PET_COMEDY_LOCAL_STORAGE_KEY);
      if (cached) {
        setHasSavedBatch(true);
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGenerationError(null);
    try {
      const uniqueSeed = Date.now().toString(36);
      const specToUse: StorySpec = {
        ...MASTER_PET_COMEDY_SPEC,
        customStoryIdea: `Pet Comedy Duo (Barnaby the Golden Retriever & Sir Reginald the aristocratic Persian Cat) episodic escapades. Unique creative seed: ${uniqueSeed}. Generate completely fresh daily mind maps, slapstick humor, and witty pet inner dialogues.`,
      };

      const aiConfig = getStoredAIConfig();
      setCurrentAIConfig(aiConfig);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: specToUse, aiConfig }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        const cleanSnippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
        throw new Error(`Server returned HTTP ${res.status}: ${cleanSnippet || 'Failed to parse JSON response'}`);
      }

      if (!res.ok || !data?.success || !data?.batch) {
        throw new Error(data?.message || data?.error || `Generation failed via AI Engine (HTTP ${res.status}). Please check API key in settings.`);
      }

      const newBatch: WeeklyBatchDelivery = data.batch;
      if (newBatch.tokenUsage) {
        recordTokenBurn(newBatch.tokenUsage, 'Pet Comedy Series 7-Day Batch');
      }
      setBatch(newBatch);
      setHasSavedBatch(true);
      try {
        localStorage.setItem(PET_COMEDY_LOCAL_STORAGE_KEY, JSON.stringify(newBatch));
      } catch (e) {}

      // Auto-save batch into database history archive
      try {
        const guestId = getOrCreateClientGuestId();
        fetch('/api/batches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-creator-guest-id': guestId,
          },
          body: JSON.stringify({ batch: newBatch, spec: specToUse }),
        }).catch((e) => console.warn('Failed to sync batch to database:', e));
      } catch (e) {}
    } catch (err: any) {
      console.error('Failed to generate batch:', err);
      setGenerationError(err?.message || 'Failed to generate weekly batch via AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSaved = () => {
    try {
      const cached = localStorage.getItem(PET_COMEDY_LOCAL_STORAGE_KEY);
      if (cached) {
        setBatch(JSON.parse(cached));
      }
    } catch (e) {}
  };

  const handleReset = () => {
    setBatch(null);
    setHasSavedBatch(false);
    try {
      localStorage.removeItem(PET_COMEDY_LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-100 antialiased pb-20">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Studio Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Pet Comedy</span>
                  <span className="text-amber-400 text-xs sm:text-sm font-semibold">Joe & Nova</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hidden sm:inline-flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  Series
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden md:block">
                Cozy Living Room • Cinematic Pans & Rack Focus • Single Speaker Isolation
              </p>
            </div>
          </div>

          {/* Center: Clean Studio Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800/80 text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition flex items-center gap-1.5"
              title="Return to Multi-Format Studio"
            >
              <span>General Studio</span>
            </Link>
            <Link
              href="/creator-ops"
              className="px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition flex items-center gap-1.5 font-bold border border-emerald-500/20 shadow-sm"
              title="Daily Multi-Account Operations Hub & WhatsApp Reminders"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ CreatorOps Hub</span>
            </Link>
            <Link
              href="/influencer"
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-pink-300 hover:bg-neutral-800/50 transition flex items-center gap-1.5"
              title="Dedicated Elena UK/EU Influencer Studio"
            >
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Persona 1 (Elena)</span>
            </Link>
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 font-semibold shadow-sm border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Persona 2 (Pets)</span>
            </span>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition flex items-center gap-1.5 font-semibold"
              title="Flow Creator OS Admin Command Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin OS</span>
            </Link>
          </nav>

          {/* Right: Studio Actions & Token Tracker */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowRefDrawer(!showRefDrawer)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 shadow-sm ${
                showRefDrawer
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reference Prompts</span>
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Generation History & Saved Batches"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Content Calendar & Schedule"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Calendar</span>
            </button>

            <button
              onClick={() => setShowAISettingsModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5 border border-neutral-800 hover:border-cyan-500/30 shadow-sm"
              title="Configure AI Engine Provider & API Key"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-semibold">AI Engine</span>
            </button>

            <TokenBurnBadge currentReport={batch?.tokenUsage} />

            <ClerkAuthSync />

            {batch && (
              <button
                onClick={handleReset}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 border border-neutral-800"
                title="Reset batch and pick new scenario"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Generation Error Alert */}
        {generationError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-200">AI Directing Engine Error</p>
              <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed">{generationError}</p>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cast & Environment Bible Bar */}
        <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Pet Comedy Content Bible (Cozy Living Room Universe)
              </h2>
            </div>
            <span className="text-xs text-neutral-500">
              9:16 Vertical • Shot on 85mm / 50mm Lens • Lived-in Realism
            </span>
          </div>

          {/* 3 Characters + Environment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Joe Cat */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2 group hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Cat className="w-3.5 h-3.5 text-amber-400" />
                    Joe — Cat (Star)
                  </span>
                  <button
                    onClick={() => handleCopy(JOE_CAT_REFERENCE_PROMPT, 'joe')}
                    className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copy Joe's Midjourney Reference Prompt"
                  >
                    {copiedKey === 'joe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  British Shorthair, copper eyes, brown leather collar with "JOE" tag. Deadpan sarcasm.
                </p>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">Delivers all punchlines</span>
            </div>

            {/* Nova Corgi */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2 group hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Dog className="w-3.5 h-3.5 text-amber-400" />
                    Nova — Dog (Sidekick)
                  </span>
                  <button
                    onClick={() => handleCopy(NOVA_CORGI_REFERENCE_PROMPT, 'nova')}
                    className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copy Nova's Midjourney Reference Prompt"
                  >
                    {copiedKey === 'nova' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Cream corgi, fluffy fur, red bowtie, big round eyes. Hyper-loyal, chaotic comic relief.
                </p>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">Innocent energetic chaos</span>
            </div>

            {/* Zara Human */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2 group hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Zara — Owner (Human)
                  </span>
                  <button
                    onClick={() => handleCopy(ZARA_OWNER_REFERENCE_PROMPT, 'zara')}
                    className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copy Zara's Midjourney Reference Prompt"
                  >
                    {copiedKey === 'zara' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Woman mid-20s, wavy brown hair, navy tank top, silver necklaces. Expressive pet parent.
                </p>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">Sets up the premise</span>
            </div>

            {/* Living Room Environment */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2 group hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    Cozy Living Room (Base)
                  </span>
                  <button
                    onClick={() => handleCopy(COZY_LIVING_ROOM_PROMPT, 'room')}
                    className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copy Living Room Empty Set Reference Prompt"
                  >
                    {copiedKey === 'room' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Cream sectional sofa, wooden coffee table, lit fireplace mantel, parquet floor.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Status: ✅ Final Environment</span>
            </div>
          </div>

          {/* Reference Prompt Drawer */}
          {showRefDrawer && (
            <div className="bg-neutral-950 border border-amber-500/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Full Midjourney / Google Flow Character & Environment Prompts
                </span>
                <span className="text-[11px] text-neutral-500">Generate references once before animating</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-neutral-300 block mb-1">Joe (Cat) Reference:</span>
                  <pre className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono whitespace-pre-wrap text-[11px]">
                    {JOE_CAT_REFERENCE_PROMPT}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-neutral-300 block mb-1">Nova (Corgi) Reference:</span>
                  <pre className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono whitespace-pre-wrap text-[11px]">
                    {NOVA_CORGI_REFERENCE_PROMPT}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-neutral-300 block mb-1">Zara (Owner) Reference:</span>
                  <pre className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono whitespace-pre-wrap text-[11px]">
                    {ZARA_OWNER_REFERENCE_PROMPT}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-neutral-300 block mb-1">Living Room Base Reference:</span>
                  <pre className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono whitespace-pre-wrap text-[11px]">
                    {COZY_LIVING_ROOM_PROMPT}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Episodes View or Empty State Hero */}
        {!batch ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clapperboard className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Ready to Direct Pet Comedy Episodes</h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Zero automatic token burn. Click below when you are ready to direct the multi-clip comedy series featuring Joe&apos;s deadpan humor, Zara&apos;s warm reactions, and Nova&apos;s hyper energy.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Directing Pet Comedy Batch...' : 'Direct First Episode / Generate Week'}</span>
              </button>

              {hasSavedBatch && (
                <button
                  type="button"
                  onClick={handleResumeSaved}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold text-sm border border-neutral-700 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Resume Saved Batch (0 Tokens)</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              ⚡ Zero Token Burn on Load • 100% User-Triggered Generation
            </p>
          </div>
        ) : (
          <WeeklyBatchView
            batch={batch}
            onReset={handleReset}
            onUpdateBatch={(updated) => {
              setBatch(updated);
              try {
                localStorage.setItem(PET_COMEDY_LOCAL_STORAGE_KEY, JSON.stringify(updated));
              } catch (e) {}
            }}
          />
        )}
      </div>

      {/* Interactive Content Calendar Modal */}
      <ContentCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        activeBatch={batch}
      />

      {/* Cloud Generation History Archive Modal */}
      <GenerationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectBatch={(selected) => {
          setBatch(selected);
          setHasSavedBatch(true);
          setShowHistoryModal(false);
        }}
      />

      {/* Real-time AI Directing Progress Modal */}
      <GenerationProgressModal
        isOpen={isLoading || Boolean(generationError)}
        title="Directing Pet Comedy (Joe & Nova) Batch"
        subtitle="Generating 7-Day Mind Maps, dialogues, 4K keyframe prompts & goofy pet photo posts..."
        aiConfig={currentAIConfig}
        error={generationError}
        onRetry={handleGenerate}
        onClose={() => {
          setIsLoading(false);
          setGenerationError(null);
        }}
        onOpenSettings={() => setShowAISettingsModal(true)}
      />

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={showAISettingsModal}
        onClose={() => {
          setShowAISettingsModal(false);
          setCurrentAIConfig(getStoredAIConfig());
        }}
      />
    </main>
  );
}
