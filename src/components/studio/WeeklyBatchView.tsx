'use client';

import React, { useState } from 'react';
import { WeeklyBatchDelivery, VideoVariation, ClipPrompt } from '@/types';
import { CharacterAnchorCard } from './CharacterAnchorCard';
import { ClipCard } from './ClipCard';
import { CritiqueInspector } from './CritiqueInspector';
import { DailyPhotoPostsView } from './DailyPhotoPostsView';
import { TokenBurnBadge } from './TokenBurnBadge';
import { VariantMindMapCard } from './VariantMindMapCard';
import { MasterCastDeck } from './MasterCastDeck';
import { recordTokenBurn } from '@/lib/engine/tokens';
import { exportBatchToMarkdown, exportBatchToJson } from '@/lib/utils/export';
import {
  Calendar,
  Sparkles,
  SlidersHorizontal,
  FileText,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Download,
  RefreshCw,
  BookOpen,
  Layers,
  CheckCircle2,
  X,
  Share2,
  Image as ImageIcon,
  Clapperboard,
  CheckCheck,
  History,
} from 'lucide-react';
import { ContentCalendarModal } from '@/components/calendar/ContentCalendarModal';
import { GenerationHistoryModal } from './GenerationHistoryModal';
import { getOrCreateClientGuestId } from '@/lib/auth/session';

interface Props {
  batch: WeeklyBatchDelivery;
  onReset: () => void;
  onUpdateBatch: (newBatch: WeeklyBatchDelivery) => void;
}

export function WeeklyBatchView({ batch, onReset, onUpdateBatch }: Props) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [copiedAllScript, setCopiedAllScript] = useState(false);
  const [copiedFullFlowBundle, setCopiedFullFlowBundle] = useState(false);
  const [copiedMasterFrame, setCopiedMasterFrame] = useState(false);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isGeneratingNextSeason, setIsGeneratingNextSeason] = useState(false);
  const [showSeriesBibleModal, setShowSeriesBibleModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [adoptedDays, setAdoptedDays] = useState<Record<number, boolean>>({});

  // Track generated clips: key is `${dayNumber}-${variationId}-clip-${clipIndex}`
  const [generatedClips, setGeneratedClips] = useState<Record<string, boolean>>({});

  // Sync / fetch adoption status and generated clips on load
  React.useEffect(() => {
    if (batch.generatedClips) {
      setGeneratedClips(batch.generatedClips);
    }
  }, [batch.id]);

  React.useEffect(() => {
    try {
      const guestId = getOrCreateClientGuestId();
      fetch('/api/calendar', {
        headers: { 'x-creator-guest-id': guestId },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.events)) {
            const map: Record<number, boolean> = {};
            data.events.forEach((evt: any) => {
              if (evt.isAdopted) {
                map[evt.dayNumber] = true;
              }
            });
            setAdoptedDays(map);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, [batch.id]);

  const handleToggleAdoptDay = async (dayNumber: number) => {
    const nextState = !adoptedDays[dayNumber];
    setAdoptedDays((prev) => ({ ...prev, [dayNumber]: nextState }));

    try {
      const guestId = getOrCreateClientGuestId();
      const eventId = `event-${batch.id}-day-${dayNumber}`;

      // First sync batch to calendar
      await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-guest-id': guestId,
        },
        body: JSON.stringify({
          batch,
          startDate: new Date().toISOString().split('T')[0],
        }),
      });

      // Then toggle adoption
      await fetch('/api/calendar/adopt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-guest-id': guestId,
        },
        body: JSON.stringify({
          eventId,
          isAdopted: nextState,
          status: nextState ? 'adopted' : 'produced',
        }),
      });
    } catch (err) {
      console.error('Failed to toggle adopt status:', err);
    }
  };

  const activeDay = batch.days[activeDayIndex] || batch.days[0];
  const activeVariation: VideoVariation =
    activeDay.variations[activeVariationIndex] || activeDay.variations[0];

  const handleProduceVariation = async () => {
    setIsProducing(true);
    try {
      let varType: 'High Tension' | 'Emotional Core' | 'Fast Hook' = 'High Tension';
      if (activeVariation.variationLabel.includes('Emotional Core')) {
        varType = 'Emotional Core';
      } else if (activeVariation.variationLabel.includes('Fast Hook')) {
        varType = 'Fast Hook';
      }

      const res = await fetch('/api/generate/produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: batch.spec,
          dayNumber: activeDay.dayNumber,
          variationType: varType,
          variationId: activeVariation.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.produced) {
        const { masterFrameImagePrompt, characterAnchors, locationAnchors, clips, tokenUsage } = data.produced;

        if (tokenUsage) {
          recordTokenBurn(tokenUsage, `Produced: ${activeVariation.title}`);
        }

        const updatedVariation: VideoVariation = {
          ...activeVariation,
          masterFrameImagePrompt,
          characterAnchors,
          locationAnchors,
          clips,
          isProduced: true,
        };

        const updatedVariations = activeDay.variations.map((v, i) =>
          i === activeVariationIndex ? updatedVariation : v
        );

        const updatedDays = batch.days.map((d, i) =>
          i === activeDayIndex ? { ...d, variations: updatedVariations } : d
        );

        const newBatch: WeeklyBatchDelivery = {
          ...batch,
          days: updatedDays,
        };

        onUpdateBatch(newBatch);
      }
    } catch (err) {
      console.error('Failed to produce variation:', err);
    } finally {
      setIsProducing(false);
    }
  };

  const getClipKey = (clipIndex: number) =>
    `day-${activeDay.dayNumber}-${activeVariation.id}-clip-${clipIndex}`;

  const toggleClipGenerated = (clipIndex: number) => {
    const key = getClipKey(clipIndex);
    const nextVal = !generatedClips[key];
    const updatedMap = {
      ...generatedClips,
      [key]: nextVal,
    };
    setGeneratedClips(updatedMap);

    const updatedBatch: WeeklyBatchDelivery = {
      ...batch,
      generatedClips: updatedMap,
    };
    onUpdateBatch(updatedBatch);

    try {
      localStorage.setItem('flowcreator_latest_batch', JSON.stringify(updatedBatch));
    } catch {}

    const guestId = getOrCreateClientGuestId();
    fetch('/api/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-guest-id': guestId,
      },
      body: JSON.stringify({ batch: updatedBatch, spec: updatedBatch.spec }),
    }).catch(() => {});
  };

  const completedCount = activeVariation.clips.filter(
    (c) => generatedClips[getClipKey(c.clipIndex)]
  ).length;

  const handleCopyMasterFrame = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMasterFrame(true);
    setTimeout(() => setCopiedMasterFrame(false), 2000);
  };

  // 1-Click Copy Complete Google Flow Production Bundle
  const handleCopyFlowBundle = async () => {
    if (!activeVariation.isProduced || !activeVariation.clips || activeVariation.clips.length === 0) {
      await handleProduceVariation();
      return;
    }

    const isPodcast = batch.spec.format === 'podcast_style';
    const masterFrame = activeVariation.masterFrameImagePrompt || activeVariation.clips[0]?.frameImagePrompt;

    let bundle = `==========================================================\n`;
    bundle += `FLOWCREATOR OS — GOOGLE FLOW PRODUCTION BUNDLE\n`;
    bundle += `DAY ${activeDay.dayNumber}: ${activeDay.dayName.toUpperCase()} — ${activeVariation.title}\n`;
    bundle += `==========================================================\n\n`;

    bundle += `📍 LOCATION ANCHOR:\n`;
    activeVariation.locationAnchors.forEach((l) => {
      bundle += `${l.anchorPrompt}\n`;
    });
    bundle += `\n🧬 CHARACTER ANCHORS:\n`;
    activeVariation.characterAnchors.forEach((c) => {
      bundle += `${c.anchorPrompt}\n`;
    });
    bundle += `\n==========================================================\n`;

    if (isPodcast && masterFrame) {
      bundle += `🎯 DAY ${activeDay.dayNumber} MASTER STARTING KEYFRAME IMAGE PROMPT:\n`;
      bundle += `(IMPORTANT: Generate this image ONCE in Midjourney/Flow. Feed this EXACT same image as the starting frame for all ${activeVariation.clips.length} clips below in Google Flow):\n\n`;
      bundle += `${masterFrame}\n\n`;
      bundle += `==========================================================\n`;
      bundle += `SEQUENCED 10s MOTION CLIPS (UPLOAD MASTER FRAME + PASTE DIRECTIVE)\n`;
      bundle += `==========================================================\n\n`;

      activeVariation.clips.forEach((c) => {
        bundle += `>>> CLIP ${c.clipIndex}/${c.totalClips}: ${c.sceneName} (${c.pacingWordCount} words) <<<\n`;
        bundle += `[ACTIVE SPEAKER]: ${c.speakerIsolation.activeSpeaker}\n`;
        bundle += `[DIALOGUE]: "${c.speakerIsolation.speakingDialogue}"\n\n`;
        bundle += `[GOOGLE FLOW 10s MOTION DIRECTIVE]:\n${c.flowPromptText}\n\n`;

        if (c.negativePromptDirectives) {
          bundle += `[NEGATIVE DIRECTIVES]: ${c.negativePromptDirectives}\n\n`;
        }
        bundle += `----------------------------------------------------------\n\n`;
      });
    } else {
      bundle += `SEQUENCED CLIPS (STEP 1: FRAME IMAGE | STEP 2: FLOW MOTION)\n`;
      bundle += `==========================================================\n\n`;

      activeVariation.clips.forEach((c) => {
        bundle += `>>> CLIP ${c.clipIndex}/${c.totalClips}: ${c.sceneName} (${c.shotType}) <<<\n`;
        bundle += `[ACTIVE SPEAKER]: ${c.speakerIsolation.activeSpeaker}\n`;
        bundle += `[DIALOGUE]: "${c.speakerIsolation.speakingDialogue}"\n\n`;

        bundle += `[STEP 1 - STARTING FRAME IMAGE PROMPT]:\n${c.frameImagePrompt}\n\n`;
        bundle += `[STEP 2 - GOOGLE FLOW 10s MOTION DIRECTIVE]:\n${c.flowPromptText}\n\n`;

        if (c.negativePromptDirectives) {
          bundle += `[NEGATIVE DIRECTIVES]: ${c.negativePromptDirectives}\n\n`;
        }
        bundle += `----------------------------------------------------------\n\n`;
      });
    }

    bundle += `📱 SOCIAL CAPTION & HASHTAGS:\n${activeVariation.metadata.caption}\n${activeVariation.metadata.hashtags.join(' ')}`;

    navigator.clipboard.writeText(bundle);
    setCopiedFullFlowBundle(true);
    setTimeout(() => setCopiedFullFlowBundle(false), 2000);
  };

  const handleCopyFullScript = () => {
    const fullText =
      `=== ${activeVariation.title} ===\n\n` +
      `[HOOK DESCRIPTION]: ${activeVariation.hookDescription}\n\n` +
      `--- DIALOGUE SCRIPT ---\n` +
      activeVariation.dialogueScript
        .map((d) => `[${d.speaker}] (${d.timing}): "${d.line}"`)
        .join('\n') +
      `\n\n--- GOOGLE FLOW CLIPS ---\n` +
      activeVariation.clips
        .map((c) => `CLIP ${c.clipIndex} (${c.sceneName}):\n${c.flowPromptText}\n`)
        .join('\n---\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAllScript(true);
    setTimeout(() => setCopiedAllScript(false), 2000);
  };

  const handleExportMarkdown = () => {
    exportBatchToMarkdown(batch);
  };

  const handleExportJson = () => {
    exportBatchToJson(batch);
  };

  const handleRegenerateActiveDay = async () => {
    setIsRegeneratingDay(true);
    try {
      const res = await fetch('/api/generate/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'day',
          spec: batch.spec,
          dayNumber: activeDay.dayNumber,
        }),
      });

      const data = await res.json();
      if (data.success && data.day) {
        const updatedDays = [...batch.days];
        updatedDays[activeDayIndex] = data.day;
        const newBatch: WeeklyBatchDelivery = {
          ...batch,
          days: updatedDays,
        };
        onUpdateBatch(newBatch);
      }
    } catch (err) {
      console.error('Failed to regenerate day:', err);
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  const handleClipRegenerated = (newClip: ClipPrompt) => {
    const updatedClips = activeVariation.clips.map((c) =>
      c.clipIndex === newClip.clipIndex ? newClip : c
    );
    const updatedVariation: VideoVariation = {
      ...activeVariation,
      clips: updatedClips,
    };
    const updatedVariations = activeDay.variations.map((v, i) =>
      i === activeVariationIndex ? updatedVariation : v
    );
    const updatedDays = batch.days.map((d, i) =>
      i === activeDayIndex ? { ...d, variations: updatedVariations } : d
    );
    onUpdateBatch({
      ...batch,
      days: updatedDays,
    });
  };

  const handleGenerateNextSeason = async () => {
    setIsGeneratingNextSeason(true);
    try {
      const res = await fetch('/api/generate/next-season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBatch: batch }),
      });
      const data = await res.json();
      if (data.success && data.batch) {
        onUpdateBatch(data.batch);
        setActiveDayIndex(0);
        setActiveVariationIndex(0);
      } else {
        alert(data.error || 'Failed to generate next season');
      }
    } catch (e: any) {
      alert(e?.message || 'Error generating next season');
    } finally {
      setIsGeneratingNextSeason(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Batch Ready
            </span>
            <span className="text-xs text-neutral-400">
              Format: <strong className="text-neutral-200 uppercase">{batch.spec.format.replace('_', ' ')}</strong>
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">
              Style: <strong className="text-neutral-200">{batch.spec.visualStyle}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            7-Day Content Engine & Production Dashboard
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TokenBurnBadge currentReport={batch.tokenUsage} />

          <button
            onClick={() => setShowCalendarModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1.5 border border-indigo-500/30 shadow-sm"
            title="Open Interactive Content Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calendar</span>
            {Object.values(adoptedDays).filter(Boolean).length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {Object.values(adoptedDays).filter(Boolean).length}/7 ✅
              </span>
            )}
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-purple-300 hover:text-purple-200 transition flex items-center gap-1.5 border border-purple-500/30 shadow-sm"
            title="View Production & Prompt Generation History"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>History</span>
          </button>

          {batch.seriesBible && (
            <button
              onClick={() => setShowSeriesBibleModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1.5 border border-indigo-500/30"
              title="View 7-Day Plot & Character Continuity"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Series Bible</span>
            </button>
          )}
          <button
            onClick={handleCopyFlowBundle}
            disabled={isProducing}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
            title="Copy all Frame Image & Video Motion prompts for this episode"
          >
            {copiedFullFlowBundle ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            <span>
              {copiedFullFlowBundle
                ? 'Flow Bundle Copied!'
                : activeVariation.isProduced && activeVariation.clips && activeVariation.clips.length > 0
                ? '1-Click Flow Bundle'
                : 'Produce & Copy Flow Bundle'}
            </span>
          </button>
          {/* Generate Next Season Button */}
          {batch.spec.format === 'character_drama' && (
            <button
              onClick={handleGenerateNextSeason}
              disabled={isGeneratingNextSeason}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-amber-600/20 disabled:opacity-50"
              title="Escalate storyline into the next 7-day arc"
            >
              {isGeneratingNextSeason ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Directing Season {(batch.spec.seasonNumber || 1) + 1}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>🎬 Generate Season {(batch.spec.seasonNumber || 1) + 1}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleExportMarkdown}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700"
            title="Download formatted Markdown package for Notion or docs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export (.md)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700"
            title="Download raw production batch JSON"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export (.json)</span>
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1.5 border border-neutral-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>New Spec</span>
          </button>
        </div>
      </div>

      {/* Multi-Season Continuity & Stakes Escalation Banner */}
      {batch.spec.format === 'character_drama' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm shrink-0">
              S{batch.spec.seasonNumber || 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Season {batch.spec.seasonNumber || 1}: {batch.spec.seasonTitle || 'The Local Betrayal'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  {batch.spec.stakesTier || 'Corporate Fraud'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                {batch.spec.previousSeasonRecap
                  ? batch.spec.previousSeasonRecap
                  : 'Season 1: 40% Stolen Shares, Boardroom Forgery, & Vault CCTV Standoff.'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-neutral-400">Continuous Arc</span>
            <div className="text-xs text-amber-300 font-medium">Days 1–7 • Dynamic Arc (30s–50s / Episode)</div>
          </div>
        </div>
      )}

      {/* Master Cast & Character DNA Deck (Central Reference Prompt Hub) */}
      {batch.spec.cast && batch.spec.cast.length > 0 && (
        <MasterCastDeck
          cast={batch.spec.cast}
          title={batch.spec.customStoryIdea || `${batch.spec.genres.join(' & ')} Series`}
          seriesLogline={batch.spec.customStoryIdea}
        />
      )}

      {/* 7-Day Horizontal Arc Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {batch.days.map((d, idx) => {
          const isActive = activeDayIndex === idx;
          return (
            <button
              key={d.dayNumber}
              onClick={() => {
                setActiveDayIndex(idx);
                setActiveVariationIndex(0);
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Day {d.dayNumber}
                </span>
                <Calendar className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
              </div>
              <span className="text-xs font-semibold truncate text-neutral-100">{d.dayName}</span>
              <span className={`text-[10px] truncate mt-1 ${isActive ? 'text-indigo-100' : 'text-neutral-500'}`}>
                {d.dailyEmotion.replace(/^[A-Za-z]+ Arc: /, '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner & Production Progress */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {activeDay.dayName} Emotional Dynamic
            </span>
            <p className="text-sm font-semibold text-neutral-200">{activeDay.dailyEmotion}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Generation Progress Indicator */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                completedCount === activeVariation.clips.length ? 'text-emerald-400' : 'text-neutral-500'
              }`}
            />
            <span className="text-neutral-400">
              Progress: <strong className="text-white">{completedCount}/{activeVariation.clips.length}</strong> Clips
            </span>
          </div>

          <button
            onClick={handleRegenerateActiveDay}
            disabled={isRegeneratingDay}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700 disabled:opacity-50"
            title="Re-roll only this day's 3 variations"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-400 ${isRegeneratingDay ? 'animate-spin' : ''}`}
            />
            <span>{isRegeneratingDay ? 'Re-rolling...' : `Re-roll ${activeDay.dayName}`}</span>
          </button>
        </div>
      </div>

      {/* 3 Variation Selection Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Step 1: Choose Your Story Variation for {activeDay.dayName}
          </span>
          <span className="text-xs text-neutral-500">
            Click any variation to load its Frame Images & Video Prompts
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeDay.variations.map((v, vIdx) => {
            const isSelected = activeVariationIndex === vIdx;
            return (
              <div
                key={v.id}
                onClick={() => setActiveVariationIndex(vIdx)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-800/95 border-blue-500 text-white shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/50'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {v.variationLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        v.isProduced && v.clips && v.clips.length > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {v.isProduced && v.clips && v.clips.length > 0 ? '🎬 Produced' : '📋 Mind Map'}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-300">
                        {v.critique.overallScore}% Score
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-100 mb-1.5">{v.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{v.hookDescription}</p>

                  {/* Compact Mind Map Preview */}
                  {v.dialogueScript && v.dialogueScript.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-neutral-800/70 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                        <span className="text-neutral-500">Arc:</span>
                        {v.dialogueScript.map((d, dIdx) => (
                          <React.Fragment key={dIdx}>
                            <span className="font-semibold text-neutral-300 truncate max-w-[45px]">{d.speaker}</span>
                            {dIdx < v.dialogueScript.length - 1 && <span className="text-neutral-600">➔</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      {v.dialogueScript[0] && (
                        <p className="text-[11px] text-neutral-400 italic line-clamp-1">
                          &ldquo;{v.dialogueScript[0].line}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">
                    {v.isProduced && v.clips && v.clips.length > 0
                      ? `${v.clips.length} Clips (${v.clips.length * 10}s Arc)`
                      : 'Stage 1: Mind Map Ready'}
                  </span>
                  <span className={isSelected ? 'text-blue-400 font-semibold' : 'text-neutral-500'}>
                    {isSelected ? (v.isProduced && v.clips && v.clips.length > 0 ? '✓ Prompts Ready' : '✓ Viewing Mind Map') : 'Click to View'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Director Studio for Selected Variation */}
      <div className="space-y-6 pt-2 border-t border-neutral-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Step 2: Directing Studio for {activeVariation.variationLabel}
            </h3>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              &ldquo;{activeVariation.title}&rdquo;
            </span>
          </div>

          {/* Adopt for Calendar & History Toggle */}
          <button
            onClick={() => handleToggleAdoptDay(activeDay.dayNumber)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
              adoptedDays[activeDay.dayNumber]
                ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-1 ring-emerald-400/40'
                : 'bg-neutral-900 hover:bg-emerald-950/40 text-neutral-300 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-500/40'
            }`}
            title="Mark this episode as Adopted / Filmed in your Content Calendar"
          >
            {adoptedDays[activeDay.dayNumber] ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-white" />
                <span>Adopted for Day {activeDay.dayNumber} ✅</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-neutral-400" />
                <span>Mark Day {activeDay.dayNumber} as Filmed ✅</span>
              </>
            )}
          </button>
        </div>

        {/* Global Story & Dialogue Mind Map Card */}
        <VariantMindMapCard variation={activeVariation} format={batch.spec.format} />

        {/* Quality Gate & Produced Prompts Section (Two-Stage Pipeline) */}
        {(!activeVariation.isProduced || !activeVariation.clips || activeVariation.clips.length === 0) ? (
          /* ON-DEMAND PRODUCTION CALL TO ACTION BANNER (Stage 2) */
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-neutral-900 to-indigo-950/40 p-8 text-center space-y-4 shadow-xl ring-1 ring-blue-500/20">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Clapperboard className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Stage 1: Mind Map Ready • Stage 2: On-Demand Prompts
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">Produce Full Google Flow & Midjourney Prompts</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Tokens are protected! Review the 40-second story arc and dialogue script above. When you are ready to film this episode in Google Flow, click below to generate all 4 clips, camera choreography, and master keyframe.
              </p>
            </div>
            <button
              type="button"
              onClick={handleProduceVariation}
              disabled={isProducing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProducing ? 'animate-spin' : ''}`} />
              <span>{isProducing ? 'Producing Google Flow Prompts...' : '🎬 Produce Full Prompts & Camera Directives'}</span>
            </button>
            <p className="text-[11px] text-neutral-500 font-mono">
              ⚡ Burns ~450 tokens only for this chosen video • Saves ~75% tokens weekly
            </p>
          </div>
        ) : (
          /* FULL PRODUCED PROMPTS VIEW (Stage 2 Complete) */
          <>
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-300">
                  Variation Fully Produced! All 4 Google Flow 10s Motion Prompts & Master Frame are unlocked below.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Ready to Film
              </span>
            </div>

            {/* Quality Gate Inspector */}
            <CritiqueInspector critique={activeVariation.critique} />

            {/* Spatial & Character Anchors (For multi-character dramatic cinema) */}
            {batch.spec.format !== 'podcast_style' && (
              <CharacterAnchorCard
                characterAnchors={activeVariation.characterAnchors}
                locationAnchors={activeVariation.locationAnchors}
              />
            )}

            {/* For Podcast Style: Single Master Starting Keyframe Image Banner */}
            {batch.spec.format === 'podcast_style' && (
              <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-lg ring-1 ring-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                        Day {activeDay.dayNumber} Master Starting Frame Image (Golden Consistency Rule)
                      </span>
                      <p className="text-xs text-neutral-300 font-medium">
                        Generate this image <strong>ONCE</strong> in Midjourney/Flow. Use this <strong>exact same image</strong> as the starting frame for all {activeVariation.clips.length} clips below!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyMasterFrame(
                        activeVariation.masterFrameImagePrompt ||
                          activeVariation.clips[0]?.frameImagePrompt
                      )
                    }
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md shrink-0 self-start sm:self-auto ${
                      copiedMasterFrame
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    }`}
                  >
                    {copiedMasterFrame ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedMasterFrame ? 'Copied Master Frame!' : '1-Click Copy Master Frame Prompt'}</span>
                  </button>
                </div>

                <pre className="bg-neutral-950 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-100 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto selection:bg-amber-500/30">
                  {activeVariation.masterFrameImagePrompt || activeVariation.clips[0]?.frameImagePrompt}
                </pre>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-300/80 pt-2 border-t border-amber-500/20">
                  <span>💡 Why 1 image? Separate frames cause character face & room drift. Single-frame podcast guarantees 100% facial and microphone stability.</span>
                  <span className="font-semibold text-neutral-300">Outfit: Today's locked aesthetic knitwear</span>
                </div>
              </div>
            )}

            {/* Clips Grid */}
            <div className="space-y-4">
              {/* Proactive 3-Step Production Guide Ribbon */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-blue-950/40 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>🎬 Master Workflow: How Character Consistency is Locked Across Clips</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-neutral-300">
                  <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800">
                    <span className="font-semibold text-amber-400 block mb-1">0. Character DNA Reference</span>
                    <p className="text-[11px] text-neutral-400">Generate character once using the DNA prompt from the top vault to establish face & wardrobe anchor.</p>
                  </div>
                  <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800">
                    <span className="font-semibold text-amber-400 block mb-1">1. Generate Starting Frame</span>
                    <p className="text-[11px] text-neutral-400">In Midjourney/Flux, paste Step 1&apos;s prompt and attach your character reference image to lock facial features.</p>
                  </div>
                  <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800">
                    <span className="font-semibold text-blue-400 block mb-1">2. Google Flow 10s Video</span>
                    <p className="text-[11px] text-neutral-400">Upload Step 1&apos;s generated frame into Google Flow (Image-to-Video), paste Step 2&apos;s motion prompt & render.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  10-Second Flow Video Prompts (Sequenced)
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{activeVariation.clips.length} Clips (40-second arc)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {activeVariation.clips.map((clip) => (
                  <ClipCard
                    key={clip.clipIndex}
                    clip={clip}
                    spec={batch.spec}
                    dayNumber={activeDay.dayNumber}
                    onClipRegenerated={handleClipRegenerated}
                    isGenerated={Boolean(generatedClips[getClipKey(clip.clipIndex)])}
                    onToggleGenerated={toggleClipGenerated}
                    isPodcastSingleFrame={batch.spec.format === 'podcast_style'}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Daily Lifestyle Photo Posts (Anti-AI Realism) */}
        {activeDay.dailyPhotoPosts && activeDay.dailyPhotoPosts.length > 0 && (
          <DailyPhotoPostsView
            photoPosts={activeDay.dailyPhotoPosts}
            dayName={activeDay.dayName}
            dayNumber={activeDay.dayNumber}
          />
        )}

        {/* Metadata & Script Footer */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">

          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            Social Publishing Metadata
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-500">Suggested Caption:</span>
              <p className="text-neutral-300 mt-1 font-mono bg-neutral-950 p-2.5 rounded border border-neutral-800">
                {activeVariation.metadata.caption}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Optimized Hashtags:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {activeVariation.metadata.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-indigo-400 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Series Continuity Bible Modal */}
      {showSeriesBibleModal && batch.seriesBible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  7-Day Series Continuity Bible & Narrative Memory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSeriesBibleModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Arc Overview */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Weekly Arc Overview
              </h4>
              <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-800 leading-relaxed">
                {batch.seriesBible.arcOverview}
              </p>
            </div>

            {/* Character Development Arcs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Weekly Character Progression
              </h4>
              <div className="space-y-2">
                {batch.seriesBible.characterArcs.map((c, i) => (
                  <div
                    key={i}
                    className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-lg text-xs"
                  >
                    <span className="font-semibold text-indigo-300 block mb-1">{c.name}</span>
                    <p className="text-neutral-400 leading-relaxed">{c.weekArc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Cliffhangers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Key Multi-Episode Cliffhangers
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {batch.seriesBible.keyCliffhangers.map((k, i) => (
                  <li
                    key={i}
                    className="bg-neutral-950/60 border border-neutral-800/80 p-2.5 rounded-lg flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowSeriesBibleModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
              >
                Close Bible
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Content Calendar & History Modal */}
      <ContentCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        activeBatch={batch}
      />

      <GenerationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectBatch={onUpdateBatch}
      />
    </div>
  );
}
