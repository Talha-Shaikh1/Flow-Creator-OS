import { TokenUsageReport } from '@/types';

// Pricing benchmarks for Gemini 2.0 / 1.5 Flash (USD per 1,000,000 tokens)
const INPUT_PRICE_PER_1M = 0.075; // $0.075 / 1M tokens
const OUTPUT_PRICE_PER_1M = 0.30; // $0.30 / 1M tokens

/**
 * Accurately estimates token count from text (~3.8 to 4 chars per token)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Blended average for English prose, punctuation, and prompt code blocks
  return Math.ceil(text.length / 3.8);
}

/**
 * Calculates estimated API cost in USD based on Gemini Flash pricing
 */
export function calculateTokenCostUsd(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (completionTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Creates a standard TokenUsageReport
 */
export function createTokenReport(
  promptTokens: number,
  completionTokens: number,
  model: string = 'gemini-2.0-flash',
  source: 'gemini-api' | 'procedural-engine' | 'regenerate-clip' = 'procedural-engine'
): TokenUsageReport {
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUsd = calculateTokenCostUsd(promptTokens, completionTokens);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd,
    model,
    source,
    timestamp: new Date().toISOString(),
  };
}

export interface TokenBurnHistoryItem {
  id: string;
  timestamp: string;
  label: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  source: string;
}

export interface LifetimeTokenStats {
  lifetimePromptTokens: number;
  lifetimeCompletionTokens: number;
  lifetimeTotalTokens: number;
  lifetimeCostUsd: number;
  totalGenerations: number;
  history: TokenBurnHistoryItem[];
}

const TOKEN_STORAGE_KEY = 'flowcreator_token_burn_v1';

export function getLifetimeTokenStats(): LifetimeTokenStats {
  if (typeof window === 'undefined') {
    return {
      lifetimePromptTokens: 0,
      lifetimeCompletionTokens: 0,
      lifetimeTotalTokens: 0,
      lifetimeCostUsd: 0,
      totalGenerations: 0,
      history: [],
    };
  }

  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read token stats from localStorage:', e);
  }

  return {
    lifetimePromptTokens: 0,
    lifetimeCompletionTokens: 0,
    lifetimeTotalTokens: 0,
    lifetimeCostUsd: 0,
    totalGenerations: 0,
    history: [],
  };
}

export function recordTokenBurn(
  report: TokenUsageReport,
  label: string = 'Weekly Batch Generation'
): LifetimeTokenStats {
  if (typeof window === 'undefined') {
    return getLifetimeTokenStats();
  }

  try {
    const current = getLifetimeTokenStats();
    const historyItem: TokenBurnHistoryItem = {
      id: `tb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: report.timestamp,
      label,
      model: report.model,
      promptTokens: report.promptTokens,
      completionTokens: report.completionTokens,
      totalTokens: report.totalTokens,
      estimatedCostUsd: report.estimatedCostUsd,
      source: report.source,
    };

    const updated: LifetimeTokenStats = {
      lifetimePromptTokens: current.lifetimePromptTokens + report.promptTokens,
      lifetimeCompletionTokens: current.lifetimeCompletionTokens + report.completionTokens,
      lifetimeTotalTokens: current.lifetimeTotalTokens + report.totalTokens,
      lifetimeCostUsd: Number((current.lifetimeCostUsd + report.estimatedCostUsd).toFixed(6)),
      totalGenerations: current.totalGenerations + 1,
      history: [historyItem, ...current.history].slice(0, 50), // Keep last 50 events
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save token stats to localStorage:', e);
    return getLifetimeTokenStats();
  }
}

export function resetLifetimeTokenStats(): LifetimeTokenStats {
  const fresh: LifetimeTokenStats = {
    lifetimePromptTokens: 0,
    lifetimeCompletionTokens: 0,
    lifetimeTotalTokens: 0,
    lifetimeCostUsd: 0,
    totalGenerations: 0,
    history: [],
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(fresh));
    } catch (e) {}
  }

  return fresh;
}
