'use client';

import React from 'react';
import { QualityCritique } from '@/types';
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface Props {
  critique: QualityCritique;
}

export function CritiqueInspector({ critique }: Props) {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header with Score */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Automated Quality Gate & Critique</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              critique.passedQualityGate
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {critique.passedQualityGate ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {critique.passedQualityGate ? 'QUALITY GATE PASSED' : 'REFINEMENT NEEDED'}
          </span>
          <span className="text-sm font-bold text-neutral-100 bg-neutral-800 px-2.5 py-0.5 rounded-md">
            {critique.overallScore}%
          </span>
        </div>
      </div>

      {/* 3 Pillars Score Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pillar 1 */}
        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">1. Spatial Lock</span>
            <span className="font-bold text-emerald-400">{critique.spatialLockScore}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${critique.spatialLockScore}%` }}
            />
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">2. Speaker Isolation</span>
            <span className="font-bold text-blue-400">{critique.speakerIsolationScore}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${critique.speakerIsolationScore}%` }}
            />
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">3. Retention Dynamics</span>
            <span className="font-bold text-purple-400">{critique.retentionHookScore}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${critique.retentionHookScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Critique notes & Refinements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-lg p-3 space-y-1.5">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Directing Checks Verified
          </span>
          <ul className="space-y-1 text-neutral-400">
            {critique.critiqueNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-lg p-3 space-y-1.5">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            Automatic Refinements Applied
          </span>
          <ul className="space-y-1 text-neutral-400">
            {critique.refinementsApplied.map((refine, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">↳</span>
                <span>{refine}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
