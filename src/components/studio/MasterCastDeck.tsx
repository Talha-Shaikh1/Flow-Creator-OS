'use client';

import React, { useState } from 'react';
import { CastMember } from '@/types';
import { Users, Copy, Check, Sparkles, Shield, Camera, Film, Layers } from 'lucide-react';

interface Props {
  cast: CastMember[];
  title?: string;
  seriesLogline?: string;
}

export function MasterCastDeck({ cast, title, seriesLogline }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!cast || cast.length === 0) return null;

  const handleCopySingle = (char: CastMember) => {
    const text = `=== CHARACTER MASTER DNA: ${char.name.toUpperCase()} (${char.role.toUpperCase()}) ===
Biometrics & Face DNA:
${char.dnaPrompt}

Wardrobe Baseline:
${char.description || 'Dynamic Netflix Noir styling'}

Reference Image Usage Directive:
Generate this character's portrait in Midjourney / Flux. Save as reference image. Attach to Google Flow/Veo clip generations to maintain 100% facial consistency.`;

    navigator.clipboard.writeText(text);
    setCopiedId(char.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    const fullText = `=== MASTER SERIES CAST DNA DECK ===
Series: ${title || 'Hollywood Netflix Noir Series'}
Logline: ${seriesLogline || 'High-stakes cinematic episodic narrative'}
Total Characters: ${cast.length}

${cast
  .map(
    (c, idx) => `[CHARACTER ${idx + 1}: ${c.name.toUpperCase()} - ${c.role.toUpperCase()}]
${c.dnaPrompt}
Role / Description: ${c.description || 'Dynamic character'}
Reference Directive: Attach initial generated portrait as Reference Image in Google Flow.
--------------------------------------------------`
  )
  .join('\n\n')}

INSTRUCTION FOR CONSISTENCY:
Generate each character's portrait once. In all subsequent video frame prompts, reference these images instead of re-prompting faces.`;

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-[#12141f] to-[#0c0e17] border border-indigo-500/30 shadow-2xl space-y-5 relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Global Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Master Cast &amp; Character DNA Vault • Netflix Noir Continuity</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>Series Characters &amp; Face Anchor Prompts</span>
            <span className="text-xs font-mono font-normal text-indigo-400 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
              {cast.length} Characters Auto-Generated
            </span>
          </h3>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Generate these reference images once in Midjourney / Flux. In all video frame image prompts, use the attached Image Reference to lock faces with zero drift.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {copiedAll ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>All Cast DNA Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy All Characters DNA</span>
            </>
          )}
        </button>
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {cast.map((char, index) => {
          const isCopied = copiedId === char.id;
          const roleBadgeColor =
            char.role === 'Hero'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : char.role === 'Villain'
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';

          return (
            <div
              key={char.id}
              className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Character Role & Index */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                    {char.role}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Character #{index + 1}</span>
                </div>

                {/* Character Name */}
                <div>
                  <h4 className="font-extrabold text-sm text-white">{char.name}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{char.description}</p>
                </div>

                {/* Master DNA Prompt Box */}
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold block uppercase tracking-wider">
                    Master Reference Generation Prompt:
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans select-all line-clamp-4">
                    {char.dnaPrompt}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                  <Camera className="w-3 h-3 text-indigo-400" />
                  <span>Image-Ref Anchored</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleCopySingle(char)}
                  className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition border border-neutral-800 flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy DNA'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
