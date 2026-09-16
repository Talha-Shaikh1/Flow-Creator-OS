'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TokenUsageReport } from '@/types';
import {
  getLifetimeTokenStats,
  resetLifetimeTokenStats,
  LifetimeTokenStats,
} from '@/lib/engine/tokens';
import {
  Zap,
  DollarSign,
  Flame,
  Clock,
  RotateCcw,
  Check,
  Copy,
  X,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentReport?: TokenUsageReport;
}

export function TokenBurnModal({ isOpen, onClose, currentReport }: Props) {
  const [stats, setStats] = useState<LifetimeTokenStats | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStats(getLifetimeTokenStats());
      setConfirmReset(false);
    }
  }, [isOpen, currentReport]);

  if (!isOpen || !mounted) return null;

  const handleReset = () => {
    const fresh = resetLifetimeTokenStats();
    setStats(fresh);
    setConfirmReset(false);
  };

  const handleCopySummary = () => {
    if (!stats) return;
    const text =
      `=== FLOWCREATOR OS — TOKEN BURN REPORT ===\n` +
      `Current Generation: ${currentReport?.totalTokens.toLocaleString() || '0'} tokens ($${currentReport?.estimatedCostUsd.toFixed(5) || '0.00000'})\n` +
      `Lifetime Total Burned: ${stats.lifetimeTotalTokens.toLocaleString()} tokens\n` +
      `Lifetime Estimated Cost: $${stats.lifetimeCostUsd.toFixed(5)}\n` +
      `Total Completed Generations: ${stats.totalGenerations}\n` +
      `Pricing Benchmark: Gemini 2.0/1.5 Flash ($0.075/1M input, $0.30/1M output)\n` +
      `Timestamp: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const totalCurrentTokens = currentReport?.totalTokens || 0;
  const currentCost = currentReport?.estimatedCostUsd || 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Token Burn & Production Resource Tracker
              </h3>
              <p className="text-xs text-neutral-400">
                Live cost and token consumption metrics for AI generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Active Generation Card */}
          <div className="bg-neutral-950/80 border border-amber-500/30 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Latest Generation Burn
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                Model: {currentReport?.model || 'Gemini Flash / Procedural'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg">
                <span className="text-[11px] text-neutral-400 block mb-1">Prompt Tokens</span>
                <span className="text-base font-bold text-neutral-100 font-mono">
                  {currentReport ? currentReport.promptTokens.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Rules + Context</span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg">
                <span className="text-[11px] text-neutral-400 block mb-1">Output Tokens</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {currentReport ? currentReport.completionTokens.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Clips + Photos</span>
              </div>

              <div className="bg-neutral-900/90 border border-amber-500/20 p-3 rounded-lg">
                <span className="text-[11px] text-amber-300/80 block mb-1">Total Burned</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {currentReport ? totalCurrentTokens.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-amber-500/70 block mt-0.5">Combined</span>
              </div>

              <div className="bg-neutral-900/90 border border-indigo-500/20 p-3 rounded-lg">
                <span className="text-[11px] text-indigo-300/80 block mb-1">Estimated Cost</span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  {currentReport ? `$${currentCost.toFixed(5)}` : '—'}
                </span>
                <span className="text-[10px] text-indigo-400/60 block mt-0.5">Gemini Flash Rates</span>
              </div>
            </div>
          </div>

          {/* Lifetime Cumulative Counter */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Cumulative Lifetime Token Burn
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {stats?.totalGenerations || 0} Generations Tracked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-neutral-900/70 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Total Tokens Burned</span>
                <p className="text-xl font-bold text-white font-mono">
                  {stats ? stats.lifetimeTotalTokens.toLocaleString() : 0}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1.5 pt-1 border-t border-neutral-800">
                  <span>Input: {stats?.lifetimePromptTokens.toLocaleString() || 0}</span>
                  <span>Output: {stats?.lifetimeCompletionTokens.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-900/70 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Cumulative USD Cost</span>
                <p className="text-xl font-bold text-emerald-400 font-mono">
                  ${stats ? stats.lifetimeCostUsd.toFixed(4) : '0.0000'}
                </p>
                <span className="text-[10px] text-neutral-500 block mt-1.5 pt-1 border-t border-neutral-800">
                  Ultra-cost efficient AI pipeline
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1">Average Cost / Episode</span>
                  <p className="text-xl font-bold text-indigo-400 font-mono">
                    ~${stats && stats.totalGenerations > 0 ? (stats.lifetimeCostUsd / (stats.totalGenerations * 7)).toFixed(5) : '0.00020'}
                  </p>
                </div>
                <span className="text-[10px] text-neutral-500 block pt-1 border-t border-neutral-800">
                  Includes 4 clips + 4 candid photo posts
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Economics Card */}
          <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Token Pricing Economics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400">
              <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-800/60">
                <span className="text-neutral-200 font-medium block">Google Gemini 2.0 / 1.5 Flash:</span>
                <span>$0.075 / 1M Input Tokens ($0.000075 / 1K)</span><br />
                <span>$0.300 / 1M Output Tokens ($0.000300 / 1K)</span>
              </div>
              <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-800/60">
                <span className="text-neutral-200 font-medium block">FlowCreator Production Efficiency:</span>
                <span>1 Full 7-Day Package (21 reels + 28 photos) costs less than <strong>$0.002</strong></span><br />
                <span>Over <strong>500+ episodes</strong> can be generated for just $1.00!</span>
              </div>
            </div>
          </div>

          {/* Recent History Table */}
          {stats && stats.history && stats.history.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Recent Generation History ({stats.history.length} events)
              </span>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {stats.history.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="text-xs bg-neutral-950/70 border border-neutral-800 p-2.5 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-neutral-200 block">{item.label}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.model}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-amber-400 font-semibold block">
                        {item.totalTokens.toLocaleString()} tokens
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        ${item.estimatedCostUsd.toFixed(5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400">Reset all lifetime token logs?</span>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white transition"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs rounded text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-neutral-500 hover:text-rose-400 transition flex items-center gap-1"
                title="Reset lifetime token counter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Lifetime Stats</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied Report' : 'Copy Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
