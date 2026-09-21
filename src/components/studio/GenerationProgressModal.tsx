'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Film,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  X,
  Clock,
  Cpu,
} from 'lucide-react';
import { AIProviderConfig } from '@/lib/engine/llm-provider';

interface GenerationProgressModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  aiConfig?: AIProviderConfig;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

const GENERATION_STEPS = [
  {
    id: 1,
    title: 'Connecting to AI Engine',
    desc: 'Validating story spec, persona anchors, and API authorization...',
    icon: Cpu,
  },
  {
    id: 2,
    title: 'Directing 7-Day Mind Maps',
    desc: 'Generating 3 distinct variations per day with retention psychological hooks...',
    icon: Brain,
  },
  {
    id: 3,
    title: 'Composing Dialogue & Audio Foley',
    desc: 'Synthesizing Sakhti/Narmi vocal modulations and strict speaker isolation...',
    icon: Film,
  },
  {
    id: 4,
    title: 'Crafting 4K Keyframes & Photo Posts',
    desc: 'Generating photorealistic Flux/Midjourney image prompts & persona photo series...',
    icon: Camera,
  },
];

export function GenerationProgressModal({
  isOpen,
  title = 'Directing Autonomous Production Package',
  subtitle = 'FlowCreator OS AI Directing Engine is synthesizing your weekly production batch...',
  aiConfig,
  error,
  onRetry,
  onClose,
  onOpenSettings,
}: GenerationProgressModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Timer and step progression
  useEffect(() => {
    if (!isOpen || error) return;

    setSeconds(0);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (next < 4) {
          setCurrentStepIndex(0);
        } else if (next < 12) {
          setCurrentStepIndex(1);
        } else if (next < 22) {
          setCurrentStepIndex(2);
        } else {
          setCurrentStepIndex(3);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, error]);

  if (!isOpen) return null;

  // Compute smooth progress percentage
  let progressPercent = Math.min(95, Math.round(15 + (seconds / 25) * 80));
  if (error) progressPercent = 100;

  const providerLabel = (aiConfig?.provider || 'mistral').toUpperCase();
  const modelLabel = aiConfig?.model || (aiConfig?.provider === 'mistral' ? 'open-mistral-nemo' : 'default');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl bg-[#0f1118] border shadow-2xl p-6 sm:p-7 space-y-6 relative overflow-hidden ${
          error ? 'border-red-500/50 shadow-red-500/10' : 'border-neutral-800 shadow-cyan-500/10'
        }`}
      >
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none ${
            error ? 'bg-red-500/15' : 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15'
          }`}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  error
                    ? 'bg-red-500/10 text-red-300 border-red-500/25'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{error ? 'Generation Paused' : 'Live LLM Directing'}</span>
              </span>

              {/* Provider & Model Badge */}
              <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                {providerLabel}: <span className="text-white font-medium">{modelLabel}</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">{title}</h3>
            <p className="text-xs text-neutral-400 max-w-md">{subtitle}</p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ERROR STATE */}
        {error ? (
          <div className="space-y-4 relative z-10 animate-in fade-in">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>AI Directing Engine Error</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 font-mono text-xs text-red-300/90 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed border border-red-500/20">
                {error}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center gap-2 border border-neutral-700"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Configure API Key / Model</span>
                </button>
              )}

              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition flex items-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Generation</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE PROGRESS STATE */
          <div className="space-y-5 relative z-10">
            {/* Progress Bar & Elapsed Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Synthesis in Progress...</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>{seconds}s elapsed</span>
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step Checkpoints List */}
            <div className="space-y-2.5">
              {GENERATION_STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isCurrent = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-neutral-900/90 border-cyan-500/40 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                        : 'bg-neutral-950/30 border-transparent text-neutral-500 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                      ) : (
                        <IconComponent className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : ''}`}>{step.title}</p>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            Active
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400">Done ✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Friendly Helpful Tip */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-neutral-500 font-mono">
                ⚡ Generating complete 7-Day Mind Maps + Episode Variations + Photorealistic Lifestyle Prompts via {providerLabel}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
