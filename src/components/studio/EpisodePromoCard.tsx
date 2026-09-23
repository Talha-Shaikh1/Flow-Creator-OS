'use client';

import React, { useState } from 'react';
import { EpisodePromo } from '@/types';
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  Headphones,
  Film,
  FastForward,
  Clock,
  Layers,
} from 'lucide-react';

interface Props {
  promo: EpisodePromo;
  currentDayNumber: number;
}

export function EpisodePromoCard({ promo, currentDayNumber }: Props) {
  const [copiedFrame, setCopiedFrame] = useState(false);
  const [copiedFlow, setCopiedFlow] = useState(false);
  const [copiedDialogue, setCopiedDialogue] = useState(false);

  const handleCopy = (text: string, type: 'frame' | 'flow' | 'dialogue') => {
    navigator.clipboard.writeText(text);
    if (type === 'frame') {
      setCopiedFrame(true);
      setTimeout(() => setCopiedFrame(false), 2000);
    } else if (type === 'flow') {
      setCopiedFlow(true);
      setTimeout(() => setCopiedFlow(false), 2000);
    } else if (type === 'dialogue') {
      setCopiedDialogue(true);
      setTimeout(() => setCopiedDialogue(false), 2000);
    }
  };

  const isFinale = currentDayNumber >= 7;

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-purple-950/40 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <FastForward className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isFinale ? 'Season Finale Cliffhanger • Next Season Teaser' : `Next Episode Sneak Peek (Day ${promo.targetDayNumber} Promo)`}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                10s Viral Retention Teaser
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Attach this 10-second promo at the end of Day {currentDayNumber}&apos;s video or publish as a teaser reel to force binge-watching loop.
            </p>
          </div>
        </div>

        {promo.estimatedAirTime && (
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-neutral-950 text-indigo-300 border border-indigo-500/30">
            {promo.estimatedAirTime}
          </span>
        )}
      </div>

      {/* Duration & Production Specs Badge Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-neutral-950/90 border border-indigo-500/40 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Video Duration</span>
            <span className="font-extrabold text-white text-xs">10 Seconds (1 Clip)</span>
          </div>
        </div>

        <div className="bg-neutral-950/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-800 text-amber-400 border border-neutral-700">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Aspect Ratio</span>
            <span className="font-bold text-neutral-200 text-xs">9:16 Vertical Reel</span>
          </div>
        </div>

        <div className="bg-neutral-950/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 border border-neutral-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Frame Rate</span>
            <span className="font-bold text-neutral-200 text-xs">24fps Hollywood Blur</span>
          </div>
        </div>

        <div className="bg-neutral-950/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-800 text-purple-400 border border-neutral-700">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Audio Design</span>
            <span className="font-bold text-neutral-200 text-xs">Dialogue + SFX Riser</span>
          </div>
        </div>
      </div>

      {/* Target Episode Title & Teaser Dialogue */}
      <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            Upcoming: {promo.targetEpisodeTitle}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(promo.teaserDialogue, 'dialogue')}
            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition"
          >
            {copiedDialogue ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedDialogue ? 'Copied Dialogue' : 'Copy Teaser Dialogue'}</span>
          </button>
        </div>

        <p className="text-sm font-medium italic text-neutral-200">
          &ldquo;{promo.teaserDialogue}&rdquo;
        </p>

        <p className="text-xs text-neutral-400">
          <strong className="text-neutral-300">Hook Reason:</strong> {promo.teaserHook}
        </p>
      </div>

      {/* Episode Highlights & Quick Cuts (Jhalkiyan) */}
      {promo.teaserHighlights && promo.teaserHighlights.length > 0 && (
        <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Upcoming Episode Highlights & Teaser Montages (Jhalkiyan):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {promo.teaserHighlights.map((hl, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-neutral-800/90 p-2.5 rounded-lg text-neutral-300 flex flex-col justify-between"
              >
                <span className="text-amber-400 font-bold text-[10px] font-mono block mb-1">
                  MONTAGE CUT {i + 1}
                </span>
                <span className="text-neutral-200 text-xs leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Step Production: Step 1 (Frame) & Step 2 (Google Flow) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Step 1: Teaser Frame Image */}
        <div className="bg-neutral-950/90 border border-amber-500/20 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Step 1: Sneak Peek Frame (Midjourney/Flux)
              </label>
              <button
                type="button"
                onClick={() => handleCopy(promo.startingFramePrompt, 'frame')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
                  copiedFrame
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {copiedFrame ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFrame ? 'Copied' : 'Copy Frame Prompt'}</span>
              </button>
            </div>
            <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-amber-100 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {promo.startingFramePrompt}
            </pre>
          </div>
          <span className="text-[10px] text-amber-400/80 block mt-1">
            💡 High-contrast teaser keyframe. Render in Midjourney as starting frame.
          </span>
        </div>

        {/* Step 2: Google Flow Veo Motion Directive */}
        <div className="bg-neutral-950/90 border border-blue-500/20 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                Step 2: 10s Promo Motion Directive (Google Flow)
              </label>
              <button
                type="button"
                onClick={() => handleCopy(promo.flowMotionPrompt, 'flow')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
                  copiedFlow
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {copiedFlow ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFlow ? 'Copied' : 'Copy Motion Prompt'}</span>
              </button>
            </div>
            <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {promo.flowMotionPrompt}
            </pre>
          </div>
          <span className="text-[10px] text-blue-300/80 block mt-1">
            🎬 Fast camera push with abrupt cutoff at 0:09.5s for peak retention.
          </span>
        </div>
      </div>

      {/* Foley & Audio Cue */}
      <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
        <Headphones className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong className="text-indigo-300">Teaser Sound Design:</strong> {promo.soundDesignCue}
        </span>
      </div>
    </div>
  );
}
