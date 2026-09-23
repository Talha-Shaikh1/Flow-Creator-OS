'use client';

import React, { useState } from 'react';
import { SeasonTrailerPromo } from '@/types';
import {
  X,
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  Headphones,
  Film,
  Play,
  Layers,
  Clock,
} from 'lucide-react';

interface Props {
  trailer: SeasonTrailerPromo;
  seriesTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SeasonTrailerModal({ trailer, seriesTitle, isOpen, onClose }: Props) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{ idx: number; type: 'frame' | 'flow' } | null>(null);
  const [copiedTitleCard, setCopiedTitleCard] = useState(false);

  if (!isOpen) return null;

  const handleCopySingle = (text: string, idx: number, type: 'frame' | 'flow') => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ idx, type });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCompleteTrailerStack = () => {
    let script = `=== ${seriesTitle.toUpperCase()} — OFFICIAL SEASON ${trailer.seasonNumber} TEASER TRAILER ===\n`;
    script += `TITLE: Season ${trailer.seasonNumber}: ${trailer.seasonTitle}\n`;
    script += `LOGLINE: ${trailer.trailerLogline}\n\n`;
    script += `--- TRAILER SOUND DESIGN & FOLEY ATMOSPHERE ---\n`;
    script += trailer.soundDesignCues.map((c) => `• ${c}`).join('\n') + '\n\n';

    trailer.trailerClips.forEach((clip) => {
      script += `===============================================\n`;
      script += `TRAILER SHOT ${clip.clipIndex}/4: ${clip.phaseLabel.toUpperCase()} (${clip.shotType})\n`;
      script += `VOICEOVER / DIALOGUE: "${clip.dialogueOrVoiceover}"\n`;
      script += `VISUAL ACTION: ${clip.visualAction}\n`;
      script += `SOUND CUE: ${clip.soundDesignCue}\n\n`;
      script += `[STEP 1: STARTING FRAME PROMPT]:\n${clip.frameImagePrompt}\n\n`;
      script += `[STEP 2: GOOGLE FLOW MOTION PROMPT]:\n${clip.flowMotionPrompt}\n\n`;
    });

    script += `===============================================\n`;
    script += `OFFICIAL TITLE CARD IMAGE PROMPT:\n${trailer.titleCardPrompt}\n`;

    navigator.clipboard.writeText(script);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-amber-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-amber-500/20">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-indigo-950/40 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clapperboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest font-mono">
                  SEASON {trailer.seasonNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  4-Shot Cinematic Teaser Trailer Montage
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {seriesTitle}: {trailer.seasonTitle}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                {trailer.trailerLogline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCompleteTrailerStack}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm border ${
                copiedAll
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 font-extrabold'
              }`}
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              <span>{copiedAll ? 'Trailer Stack Copied!' : 'Copy Full Trailer Stack'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
              title="Close Trailer View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Trailer Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Duration & Production Spec Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-neutral-900/90 border border-amber-500/40 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Trailer Duration</span>
                <span className="font-extrabold text-white text-xs">40 Seconds (4 x 10s Cuts)</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-neutral-800 text-indigo-400 border border-neutral-700">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Shot Breakdown</span>
                <span className="font-bold text-neutral-200 text-xs">4 Independent 10s Shots</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 border border-neutral-700">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Aspect Ratio</span>
                <span className="font-bold text-neutral-200 text-xs">9:16 Vertical Reel</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-neutral-800 text-purple-400 border border-neutral-700">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Sound & Voiceover</span>
                <span className="font-bold text-neutral-200 text-xs">Full VO Script + Braam SFX</span>
              </div>
            </div>
          </div>

          {/* Audio Cues & Sound Design Bar */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
              <strong className="text-amber-300 font-medium">Trailer Sound Signature:</strong>
              <span className="text-neutral-400">{trailer.soundDesignCues.join(' • ')}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(trailer.titleCardPrompt);
                setCopiedTitleCard(true);
                setTimeout(() => setCopiedTitleCard(false), 2000);
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium self-start md:self-auto"
            >
              {copiedTitleCard ? 'Title Card Prompt Copied!' : 'Copy Official Title Card Frame Prompt'}
            </button>
          </div>

          {/* 4 Sequenced Trailer Shots */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              Sequenced Trailer Montage Shots (Day 1 to Day 7 Highlights)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {trailer.trailerClips.map((clip) => (
                <div
                  key={clip.clipIndex}
                  className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 space-y-3.5 transition"
                >
                  {/* Shot Top Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <span>SHOT {clip.clipIndex}/4</span>
                        <span className="text-[10px] text-amber-400/80 font-mono font-normal">⏱️ 10s</span>
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {clip.phaseLabel}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {clip.shotType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[11px] line-clamp-1 max-w-xs">{clip.soundDesignCue}</span>
                    </div>
                  </div>

                  {/* Voiceover line & Visual Action */}
                  <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-indigo-400 font-semibold">Trailer Voiceover / Line:</span>
                    </div>
                    <p className="text-sm italic font-medium text-amber-100">
                      &ldquo;{clip.dialogueOrVoiceover}&rdquo;
                    </p>
                    <p className="text-xs text-neutral-400">
                      <strong className="text-neutral-300">Action:</strong> {clip.visualAction}
                    </p>
                  </div>

                  {/* Prompts: Step 1 (Frame) & Step 2 (Google Flow) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Frame Prompt */}
                    <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-3 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Step 1: Frame Image
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(clip.frameImagePrompt, clip.clipIndex, 'frame')}
                            className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800"
                          >
                            {copiedIndex?.idx === clip.clipIndex && copiedIndex?.type === 'frame' ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedIndex?.idx === clip.clipIndex && copiedIndex?.type === 'frame' ? 'Copied' : 'Copy Frame'}</span>
                          </button>
                        </div>
                        <pre className="text-[11px] text-amber-100/90 font-mono mt-1 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                          {clip.frameImagePrompt}
                        </pre>
                      </div>
                    </div>

                    {/* Flow Prompt */}
                    <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Step 2: Google Flow Veo
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(clip.flowMotionPrompt, clip.clipIndex, 'flow')}
                            className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800"
                          >
                            {copiedIndex?.idx === clip.clipIndex && copiedIndex?.type === 'flow' ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedIndex?.idx === clip.clipIndex && copiedIndex?.type === 'flow' ? 'Copied' : 'Copy Motion'}</span>
                          </button>
                        </div>
                        <pre className="text-[11px] text-neutral-300 font-mono mt-1 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                          {clip.flowMotionPrompt}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <span>
            💡 <strong>Editing Recipe:</strong> Cut these 4 shots sequentially into a 40-second high-energy teaser trailer to launch your series on TikTok, Reels & YouTube Shorts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
