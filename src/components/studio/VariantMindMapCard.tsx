'use client';

import React, { useState } from 'react';
import { VideoVariation, ContentFormat } from '@/types';
import {
  GitCommit,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Compass,
  Heart,
  Flame,
  Zap,
  Volume2,
  Smile,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  variation: VideoVariation;
  format: ContentFormat;
}

export function VariantMindMapCard({ variation, format }: Props) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedMindMap, setCopiedMindMap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Format full dialogue script for 1-click copying
  const handleCopyScript = () => {
    let scriptText = `🎬 SCRIPT: ${variation.title}\n`;
    scriptText += `Strategy / Angle: ${variation.variationLabel} (${variation.critique.overallScore}% Score)\n`;
    scriptText += `Hook Premise: ${variation.hookDescription}\n\n`;
    scriptText += `--- FULL CONVERSATIONAL DIALOGUE ---\n`;

    variation.dialogueScript.forEach((d, idx) => {
      const clip = variation.clips[idx];
      scriptText += `[${d.timing}] ${d.speaker.toUpperCase()}:\n`;
      scriptText += `"${d.line}"\n`;
      if (clip) {
        scriptText += `↳ Camera & Acting: ${clip.flowPromptText.slice(0, 140)}...\n`;
      }
      scriptText += `\n`;
    });

    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Format visual mind map summary for 1-click copying
  const handleCopyMindMap = () => {
    let mindMap = `🗺️ STORYBOARD MIND MAP: ${variation.title} (${variation.variationLabel})\n\n`;
    variation.clips.forEach((c) => {
      mindMap += `Step ${c.clipIndex}/4 (${(c.clipIndex - 1) * 10}s-${c.clipIndex * 10}s): ${c.sceneName}\n`;
      mindMap += `• Speaker: ${c.speakerIsolation.activeSpeaker}\n`;
      mindMap += `• Dialogue: "${c.speakerIsolation.speakingDialogue}"\n`;
      mindMap += `• Shot: ${c.shotType} | Pacing: ${c.pacingWordCount} words\n\n`;
    });
    mindMap += `Audio Vibe: ${variation.metadata.audioVibe}\n`;
    mindMap += `Caption: ${variation.metadata.caption}\n`;

    navigator.clipboard.writeText(mindMap);
    setCopiedMindMap(true);
    setTimeout(() => setCopiedMindMap(false), 2000);
  };

  // Character color helper for speaker pills
  const getSpeakerBadgeClass = (speaker: string) => {
    const s = speaker.toLowerCase();
    if (s.includes('joe') || s.includes('cat')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (s.includes('nova') || s.includes('corgi') || s.includes('dog')) {
      return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    }
    if (s.includes('zara') || s.includes('owner')) {
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
    if (s.includes('elena') || s.includes('influencer')) {
      return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
    }
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  };

  // Beat description helpers based on clip index
  const getBeatStage = (index: number) => {
    switch (index) {
      case 0:
        return { label: 'The Hook (0–10s)', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
      case 1:
        return { label: 'The Setup / Tension (10–20s)', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
      case 2:
        return { label: 'The Turn / Core (20–30s)', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' };
      case 3:
      default:
        return { label: 'Punchline & Bonding (30–40s)', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    }
  };

  return (
    <div className="bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur">
      {/* Background subtle ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shrink-0">
            <div className="w-full h-full rounded-[11px] bg-neutral-950 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Episode Storyboard & Dialogue Mind Map
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
                {variation.variationLabel} Angle
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {variation.title}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleCopyMindMap}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
            title="Copy visual mind map summary"
          >
            {copiedMindMap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <GitCommit className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedMindMap ? 'Mind Map Copied' : 'Copy Mind Map'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyScript}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 hover:text-white transition flex items-center gap-1.5"
            title="Copy continuous dialogue script"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedScript ? 'Script Copied' : 'Copy Full Script'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
            title={isExpanded ? 'Collapse Mind Map' : 'Expand Mind Map'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 pt-5 animate-in fade-in duration-200">
          {/* 1. VISUAL STORY ARC (Horizontal Timeline Nodes) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                1. 40-Second Story Arc (How the Reel Evolves)
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                Continuous Single-Scene Flow
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {variation.clips.map((clip, idx) => {
                const beat = getBeatStage(idx);
                const dialogue = variation.dialogueScript[idx] || { speaker: clip.speakerIsolation.activeSpeaker, line: clip.speakerIsolation.speakingDialogue };

                return (
                  <div
                    key={clip.clipIndex}
                    className={`rounded-xl border ${beat.border} bg-neutral-900/60 p-3.5 flex flex-col justify-between space-y-2.5 relative group hover:border-neutral-700 transition`}
                  >
                    <div>
                      {/* Step Badge & Timing */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${beat.bg} ${beat.color} border ${beat.border}`}>
                          {beat.label}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Clip {clip.clipIndex}/4
                        </span>
                      </div>

                      {/* Scene Title */}
                      <h4 className="text-xs font-bold text-neutral-200 leading-snug line-clamp-1">
                        {clip.sceneName}
                      </h4>

                      {/* Micro Camera & Dynamic Movement */}
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                        {clip.flowPromptText.split('.')[0]}.
                      </p>
                    </div>

                    {/* Speaker Preview */}
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSpeakerBadgeClass(dialogue.speaker)}`}>
                        {dialogue.speaker}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {clip.pacingWordCount} Words
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CONTINUOUS FULL SCRIPT & ACTING CUES (The Full Story Read-Through) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                2. Continuous Master Script (Read-Through)
              </span>
              <span className="text-[11px] text-neutral-500">
                Pacing locked to natural breathing & emotional rhythm
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-4 space-y-3.5 font-sans">
              {variation.dialogueScript.map((scriptItem, sIdx) => {
                const clip = variation.clips[sIdx];

                return (
                  <div
                    key={sIdx}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 pb-3 border-b border-neutral-900 last:border-0 last:pb-0"
                  >
                    {/* Speaker & Timing Column */}
                    <div className="sm:w-44 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getSpeakerBadgeClass(scriptItem.speaker)}`}>
                          {scriptItem.speaker}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {scriptItem.timing}
                      </span>
                    </div>

                    {/* Dialogue Line & Acting Delivery Notes */}
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium text-neutral-100 leading-relaxed">
                        &ldquo;{scriptItem.line}&rdquo;
                      </p>

                      {/* Acting & Camera Action Micro-Note */}
                      {clip && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/60">
                          <span className="text-indigo-400 font-semibold shrink-0">Choreography:</span>
                          <span className="line-clamp-1">{clip.flowPromptText.slice(0, 110)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. STRATEGIC WHY / OBJECTIVE FOOTER */}
          <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-neutral-400">Why this variation works:</span>
              <span className="font-semibold text-neutral-200">{variation.hookDescription}</span>
            </div>

            <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
              <span>Audio Vibe: <strong className="text-neutral-300">{variation.metadata.audioVibe}</strong></span>
              <span>•</span>
              <span>Quality Score: <strong className="text-emerald-400">{variation.critique.overallScore}%</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
