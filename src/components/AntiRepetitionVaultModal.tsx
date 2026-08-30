'use client';

import React from 'react';
import { X, Brain, Trash2, ShieldCheck, Ban, Sparkles } from 'lucide-react';
import { VaultItem } from '../types';

interface AntiRepetitionVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultItems: VaultItem[];
  onClearVault: () => void;
}

export const AntiRepetitionVaultModal: React.FC<AntiRepetitionVaultModalProps> = ({
  isOpen,
  onClose,
  vaultItems,
  onClearVault,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Anti-Repetition Memory Vault</h2>
              <p className="text-xs text-zinc-400">Guarantees 100% fresh, non-repetitive viral angles</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* How It Protects */}
        <div className="mt-4 rounded-xl bg-emerald-500/5 p-3.5 border border-emerald-500/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Active Exclusion Rules Engine</span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
            Every time a 7-day plan is created, its core topics, metaphors, and angles are locked into this memory bank. Subsequent AI generations automatically exclude these patterns to prevent repetitive concepts.
          </p>
        </div>

        {/* Banned Clichés */}
        <div className="mt-4 rounded-xl bg-rose-500/5 p-3 border border-rose-500/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Ban className="h-4 w-4" />
            <span>Blacklisted AI Clichés (Permanently Blocked)</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              '"In today\'s fast-paced world"',
              '"Are you tired of the 9 to 5"',
              '"5 AI tools to change your life"',
              '"Imagine a world where..."',
              'Generic motivational quotes',
            ].map((cliche, idx) => (
              <span key={idx} className="rounded bg-rose-950/40 px-2 py-0.5 text-[11px] text-rose-300 border border-rose-500/20">
                {cliche}
              </span>
            ))}
          </div>
        </div>

        {/* Recorded Past Topics */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Tracked Past Concepts ({vaultItems.length})
            </span>
            {vaultItems.length > 0 && (
              <button
                onClick={onClearVault}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3 w-3" />
                <span>Reset Memory</span>
              </button>
            )}
          </div>

          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 space-y-1.5">
            {vaultItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No past topics tracked yet. Generate your first 7-day plan!
              </div>
            ) : (
              vaultItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 text-xs border border-white/5"
                >
                  <span className="font-medium text-zinc-200">{item.topic}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {item.angle}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
