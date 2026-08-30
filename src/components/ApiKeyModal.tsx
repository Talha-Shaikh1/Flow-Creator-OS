'use client';

import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Gemini API Key</h2>
              <p className="text-xs text-zinc-400">100% Free • 1 Million Tokens / Min</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-zinc-300">
          <p>
            You can use your <strong>100% Free Gemini Flash API Key</strong> from Google AI Studio. No credit card is required.
          </p>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-3 text-indigo-300 hover:bg-indigo-950/50 hover:text-white transition-colors"
          >
            <span className="font-semibold">Get Free API Key from Google AI Studio</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Key is stored securely in your browser's LocalStorage only.</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {saved ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>{saved ? 'Saved!' : 'Save & Activate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
