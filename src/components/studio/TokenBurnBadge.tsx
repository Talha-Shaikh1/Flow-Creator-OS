'use client';

import React, { useState, useEffect } from 'react';
import { TokenUsageReport } from '@/types';
import { getLifetimeTokenStats } from '@/lib/engine/tokens';
import { TokenBurnModal } from './TokenBurnModal';
import { Flame, Zap } from 'lucide-react';

interface Props {
  currentReport?: TokenUsageReport;
}

export function TokenBurnBadge({ currentReport }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [lifetimeCost, setLifetimeCost] = useState(0);

  useEffect(() => {
    const stats = getLifetimeTokenStats();
    setLifetimeTotal(stats.lifetimeTotalTokens);
    setLifetimeCost(stats.lifetimeCostUsd);
  }, [currentReport, isOpen]);

  const isIdle = !currentReport || currentReport.totalTokens === 0;
  const displayTokens = currentReport ? currentReport.totalTokens : 0;
  const displayCost = currentReport ? currentReport.estimatedCostUsd : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-mono shadow-sm group ${
          isIdle
            ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-amber-200'
        }`}
        title="Click to view Token Burn & Cost Inspector"
      >
        <Flame className={`w-3.5 h-3.5 ${isIdle ? 'text-neutral-500' : 'text-amber-400 group-hover:animate-bounce transition-transform'}`} />
        <span className={`font-semibold ${isIdle ? 'text-neutral-300' : 'text-amber-200'}`}>
          {isIdle ? '⚡ 0 Active Tokens (Idle)' : `${displayTokens.toLocaleString()} Tokens`}
        </span>
        {!isIdle && (
          <span className="text-[11px] text-amber-400/70 hidden sm:inline">
            (${displayCost.toFixed(4)})
          </span>
        )}
      </button>

      <TokenBurnModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentReport={currentReport}
      />
    </>
  );
}
