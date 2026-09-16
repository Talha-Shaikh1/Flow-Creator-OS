'use client';

import React, { useState } from 'react';
import { Copy, Check, User, MapPin } from 'lucide-react';

interface Props {
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
}

export function CharacterAnchorCard({ characterAnchors, locationAnchors }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 backdrop-blur shadow-lg mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Pillar 1: Spatial & Character DNA Anchors
        </h3>
        <span className="text-xs text-neutral-500">Fixed Master Keyframes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character DNA Locks */}
        {characterAnchors.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Character DNA Locks
            </span>
            {characterAnchors.map((anchor, idx) => {
              const key = `char-${idx}`;
              const isCopied = copiedKey === key;
              return (
                <div
                  key={key}
                  className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 relative group transition hover:border-indigo-500/40"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-indigo-300">{anchor.characterName}</span>
                    <button
                      onClick={() => handleCopy(anchor.anchorPrompt, key)}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-indigo-600 text-neutral-300 hover:text-white transition flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Copy Anchor'}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono leading-relaxed line-clamp-3 group-hover:line-clamp-none">
                    {anchor.anchorPrompt}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Location Anchors */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Location Master Coordinates
          </span>
          {locationAnchors.map((loc, idx) => {
            const key = `loc-${idx}`;
            const isCopied = copiedKey === key;
            return (
              <div
                key={key}
                className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 relative group transition hover:border-amber-500/40"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-amber-300">{loc.locationName}</span>
                  <button
                    onClick={() => handleCopy(loc.anchorPrompt, key)}
                    className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-amber-600 text-neutral-300 hover:text-white transition flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? 'Copied' : 'Copy Location'}
                  </button>
                </div>
                <p className="text-xs text-neutral-300 font-mono leading-relaxed line-clamp-3 group-hover:line-clamp-none">
                  {loc.anchorPrompt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
