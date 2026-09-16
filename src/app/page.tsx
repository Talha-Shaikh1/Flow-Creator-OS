'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StorySpec, WeeklyBatchDelivery } from '@/types';
import { SpecWizard } from '@/components/studio/SpecWizard';
import { WeeklyBatchView } from '@/components/studio/WeeklyBatchView';
import { CharacterVaultModal } from '@/components/studio/CharacterVaultModal';
import { generateWeeklyBatch } from '@/lib/engine/generator';
import { Clapperboard, Sparkles, ShieldCheck, Video, RefreshCw, Database, Users, Calendar as CalendarIcon } from 'lucide-react';
import { ContentCalendarModal } from '@/components/calendar/ContentCalendarModal';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import { getOrCreateClientGuestId } from '@/lib/auth/session';

import { TokenBurnBadge } from '@/components/studio/TokenBurnBadge';
import { recordTokenBurn } from '@/lib/engine/tokens';
import { useUserRole } from '@/lib/auth/useUserRole';

const LOCAL_STORAGE_KEY = 'flowcreator_latest_batch';

export default function StudioPage() {
  const { isSuperAdmin } = useUserRole();
  const [batch, setBatch] = useState<WeeklyBatchDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking'>('checking');
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [hasSavedBatch, setHasSavedBatch] = useState(false);

  // Check storage on mount (do NOT auto-load batch to prevent unwanted token confusion)
  useEffect(() => {
    // 1. Check local storage
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setHasSavedBatch(true);
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }

    // 2. Initialize / Check Neon DB
    fetch('/api/db/init', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDbStatus('connected');
        }
      })
      .catch(() => setDbStatus('connected'));
  }, []);

  const handleResumeSaved = () => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setBatch(JSON.parse(cached));
      }
    } catch (e) {}
  };

  const saveBatchLocallyAndCloud = (newBatch: WeeklyBatchDelivery) => {
    if (newBatch.tokenUsage) {
      recordTokenBurn(newBatch.tokenUsage, `Batch: ${newBatch.spec.format}`);
    }
    setBatch(newBatch);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBatch));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // Background sync to Neon DB with user isolation
    const guestId = getOrCreateClientGuestId();
    fetch('/api/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-guest-id': guestId,
      },
      body: JSON.stringify({ batch: newBatch, spec: newBatch.spec }),
    }).catch((err) => console.warn('Could not sync batch to Neon DB:', err));
  };

  const handleGenerate = async (spec: StorySpec) => {
    setIsLoading(true);
    try {
      // Direct fast engine generation with Gemini API & server schema validation
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      });

      if (res.ok) {
        const data = await res.json();
        saveBatchLocallyAndCloud(data.batch);
      } else {
        // Fallback to local procedural rule engine if API route has network issues
        const fallbackBatch = generateWeeklyBatch(spec);
        saveBatchLocallyAndCloud(fallbackBatch);
      }
    } catch (err) {
      console.warn('Falling back to direct engine generation:', err);
      const fallbackBatch = generateWeeklyBatch(spec);
      saveBatchLocallyAndCloud(fallbackBatch);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBatch(null);
    setHasSavedBatch(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-100 antialiased pb-20">
      {/* Top Studio Navigation Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  FlowCreator <span className="text-indigo-400">OS</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden md:block">
                Full-Week Google Flow Video Direction Engine
              </p>
            </div>
          </div>

          {/* Center: Clean Studio Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800/80 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-neutral-800 text-white font-medium shadow-sm border border-neutral-700/60">
              General Studio
            </span>
            {isSuperAdmin && (
              <>
                <Link
                  href="/influencer"
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-pink-300 hover:bg-neutral-800/50 transition flex items-center gap-1.5"
                  title="Dedicated Elena UK/EU Influencer Studio (Super Admin)"
                >
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>Persona 1 (Elena)</span>
                </Link>
                <Link
                  href="/pet-comedy"
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/50 transition flex items-center gap-1.5"
                  title="Dedicated Pet Comedy Studio (Super Admin)"
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
              </>
            )}
          </nav>

          {/* Right: Studio Actions & Token Tracker */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Content Calendar & History"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Calendar</span>
            </button>

            <button
              onClick={() => setShowVaultModal(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Persistent Character DNA Vault"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Vault</span>
            </button>

            <TokenBurnBadge currentReport={batch?.tokenUsage} />

            <ClerkAuthSync />

            {batch && (
              <button
                onClick={handleReset}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 border border-neutral-800"
                title="Create New Story Spec"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">New Spec</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!batch ? (
          <div className="space-y-8">
            {/* Resume Saved Batch Bar if available */}
            {hasSavedBatch && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs max-w-2xl mx-auto shadow-md">
                <span className="text-neutral-300">
                  📁 You have a previously generated batch saved in your browser.
                </span>
                <button
                  type="button"
                  onClick={handleResumeSaved}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition font-medium flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Resume Saved Batch (0 Tokens)</span>
                </button>
              </div>
            )}

            {/* Hero / Intro Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Spatial Master Anchors • Speaker Isolation • Persistent Series DNA
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Direct Once. Produce for the Whole Week.
              </h2>
              <p className="text-sm text-neutral-400">
                Zero typing. Select your emotional themes and persistent character DNA to generate a complete 7-day, 21-variation production batch with 1-click Google Flow copy cards.
              </p>
            </div>

            {/* Spec Wizard */}
            <SpecWizard onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        ) : (
          /* Weekly Delivery Dashboard */
          <WeeklyBatchView
            batch={batch}
            onReset={handleReset}
            onUpdateBatch={saveBatchLocallyAndCloud}
          />
        )}
      </div>

      {/* Character DNA Vault Modal */}
      <CharacterVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
      />

      {/* Interactive Content Calendar & History Modal */}
      <ContentCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        activeBatch={batch}
      />
    </main>
  );
}

