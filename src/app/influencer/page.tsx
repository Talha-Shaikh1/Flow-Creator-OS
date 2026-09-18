'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StorySpec, WeeklyBatchDelivery } from '@/types';
import { WeeklyBatchView } from '@/components/studio/WeeklyBatchView';
import { generateWeeklyBatch } from '@/lib/engine/generator';
import {
  Sparkles,
  Camera,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Share2,
  HeartHandshake,
  Brain,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Eye,
} from 'lucide-react';

import { TokenBurnBadge } from '@/components/studio/TokenBurnBadge';
import { recordTokenBurn } from '@/lib/engine/tokens';
import { ContentCalendarModal } from '@/components/calendar/ContentCalendarModal';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import { getOrCreateClientGuestId } from '@/lib/auth/session';
import { AdminAccessGuard } from '@/components/auth/AdminAccessGuard';

const INFLUENCER_LOCAL_STORAGE_KEY = 'flowcreator_influencer_persona1_batch';

const MASTER_PERSONA_SPEC: StorySpec = {
  id: 'spec-influencer-persona1-master',
  format: 'podcast_style',
  genres: ['Motivational', 'Family Drama'],
  tone: 'Emotional / Heavy',
  castCount: 1,
  cast: [
    {
      id: 'persona-1-uk-eu',
      name: 'Elena (UK/EU Persona 1)',
      role: 'Hero',
      description: 'UK/Europe AI Influencer — Brunette, green eyes, signature cheek mole, gold jewelry, Shure mic.',
      dnaPrompt:
        '24yo woman with brunette hair, green eyes, natural subtle makeup, distinct signature cheek beauty mole on cheekbone. Styling: gold layered necklace, small stud earrings, off-shoulder dark knit top. Warm, relatable, authentic real skin texture with visible pores. Lock 100% to uploaded master reference image.',
      usesReferenceImage: true,
      personalityVibe: 'Warm, thoughtful, grounded, slow and deliberate',
    },
  ],
  visualStyle: 'Hyper-Realistic Cinematic',
  formatLength: 'multi_episode_series',
  locationSettings: [
    'Podcast studio setting with soft warm ring light, blurred bookshelf, and ambient lamp glow in background',
  ],
  createdAt: new Date().toISOString(),
};

export default function InfluencerStudioPage() {
  return (
    <AdminAccessGuard personaName="Elena (UK/EU Influencer)" isStudioPage>
      <InfluencerStudioContent />
    </AdminAccessGuard>
  );
}

function InfluencerStudioContent() {
  const [batch, setBatch] = useState<WeeklyBatchDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topicPillar, setTopicPillar] = useState<'relationship' | 'mindset' | 'hybrid'>('relationship');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [hasSavedBatch, setHasSavedBatch] = useState(false);

  // Check if a previously generated batch exists in LocalStorage (do NOT auto-load to prevent accidental token confusion)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(INFLUENCER_LOCAL_STORAGE_KEY);
      if (cached) {
        setHasSavedBatch(true);
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
  }, []);

  const handleGenerate = (pillar = topicPillar) => {
    setIsLoading(true);
    try {
      const specToUse: StorySpec = {
        ...MASTER_PERSONA_SPEC,
        genres:
          pillar === 'relationship'
            ? ['Romance', 'Family Drama']
            : pillar === 'mindset'
            ? ['Motivational']
            : ['Romance', 'Motivational'],
      };

      const newBatch = generateWeeklyBatch(specToUse);
      if (newBatch.tokenUsage) {
        recordTokenBurn(newBatch.tokenUsage, `Persona 1 Weekly Batch (${pillar})`);
      }
      setBatch(newBatch);
      setHasSavedBatch(true);
      try {
        localStorage.setItem(INFLUENCER_LOCAL_STORAGE_KEY, JSON.stringify(newBatch));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to generate batch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSaved = () => {
    try {
      const cached = localStorage.getItem(INFLUENCER_LOCAL_STORAGE_KEY);
      if (cached) {
        setBatch(JSON.parse(cached));
      }
    } catch (e) {}
  };

  const handleReset = () => {
    setBatch(null);
    setHasSavedBatch(false);
    try {
      localStorage.removeItem(INFLUENCER_LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-100 antialiased pb-20">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Studio Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Elena Studio</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-semibold">UK/EU AI Influencer</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Dedicated
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden md:block">
                4-Clip Podcast Reels • Anti-AI Lifestyle Photos • Locked Signature Mole
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
            <span className="px-3 py-1.5 rounded-lg bg-pink-500/15 text-pink-300 font-semibold shadow-sm border border-pink-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Persona 1 (Elena)</span>
            </span>
            <Link
              href="/pet-comedy"
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/50 transition flex items-center gap-1.5"
              title="Dedicated Pet Comedy Studio"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Persona 2 (Pets)</span>
            </Link>
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
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Content Calendar & History"
            >
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Calendar</span>
            </button>

            <TokenBurnBadge currentReport={batch?.tokenUsage} />

            <ClerkAuthSync />

            {batch && (
              <button
                onClick={handleReset}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 border border-neutral-800"
                title="Reset batch and pick new topic"
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
        {/* Persona Identity Bar */}
        <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 p-[1px] shrink-0">
              <div className="w-full h-full rounded-[11px] bg-neutral-950 flex items-center justify-center font-bold text-sm text-pink-300">
                P1
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-white">Elena (UK/EU Persona 1)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Brunette • Green Eyes • Signature Cheek Mole
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Gold Layered Necklace Locked
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Studio: Shure SM7B Mic • Blurred Bookshelf • Soft Ring Light • Gaze Directed Off-Camera • No Head Tilt
              </p>
            </div>
          </div>

          {/* Pillar Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setTopicPillar('relationship');
                if (batch) handleGenerate('relationship');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                topicPillar === 'relationship'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Relationship Hot-Takes</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTopicPillar('mindset');
                if (batch) handleGenerate('mindset');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                topicPillar === 'mindset'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Mindset & Growth</span>
            </button>
          </div>
        </div>

        {/* Dashboard View or Empty State Hero */}
        {!batch ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Ready to Direct Persona 1 (Elena) Batch</h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Tokens are not burned automatically on page load. Choose your topic pillar above and click below to direct a 7-day podcast reel & daily anti-AI photo campaign.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleGenerate(topicPillar)}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Directing Persona 1 Batch...' : 'Generate 7-Day Influencer Batch'}</span>
              </button>

              {hasSavedBatch && (
                <button
                  type="button"
                  onClick={handleResumeSaved}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold text-sm border border-neutral-700 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-pink-400" />
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
                localStorage.setItem(INFLUENCER_LOCAL_STORAGE_KEY, JSON.stringify(updated));
              } catch (e) {}
            }}
          />
        )}
      </div>

      {/* Interactive Content Calendar & History Modal */}
      <ContentCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        activeBatch={batch}
      />
    </main>
  );
}
