'use client';

import React, { useState, useEffect } from 'react';
import {
  Film,
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Search,
  Clock,
  Users,
  Compass,
  Download,
  Play,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { DramaSeriesState } from '@/types/drama-series';
import {
  DramaFilmHistoryItem,
  getDramaFilmHistory,
  deleteDramaFilmFromHistory,
} from '@/lib/history/drama-history';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilm: (state: DramaSeriesState) => void;
}

export function DramaHistoryModal({ isOpen, onClose, onSelectFilm }: Props) {
  const [historyItems, setHistoryItems] = useState<DramaFilmHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistoryItems(getDramaFilmHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.world.toLowerCase().includes(q) ||
      item.genre.toLowerCase().includes(q) ||
      item.cast.some((c) => c.toLowerCase().includes(q))
    );
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteDramaFilmFromHistory(id);
    setHistoryItems(updated);
    setDeletingId(null);
  };

  const handleExportMarkdown = (item: DramaFilmHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = item.state;
    const md = `# ${item.title} — Mini-Film Production Package
**Runtime Target:** ${item.targetRuntime} (${item.clipsCount} clips)
**Genre:** ${item.genre}
**Created:** ${new Date(item.createdAt).toLocaleDateString()}
**World:** ${item.world}

---

## 1. CAST & CHARACTERS
${
  s.characterBible?.characters
    ?.map(
      (c) => `### ${c.id}: ${c.name} (${c.speciesObject})
- **Outfit:** ${typeof c.clothing === 'string' ? c.clothing : c.clothing?.exactOutfit}
- **Voice:** ${typeof c.voice === 'string' ? c.voice : c.voice?.voiceType}
- **Personality:** ${c.personality}`
    )
    .join('\n\n') || item.cast.join(', ')
}

---

## 2. 10-SECOND CLIPS & PROMPTS
${
  s.clipsBreakdown
    ?.map((clip, idx) => {
      const fp = s.framePrompts?.[idx]?.prompt || 'N/A';
      const vp = s.videoPrompts?.[idx]?.prompt || 'N/A';
      return `### CLIP ${clip.clipNumber} (10s) — ${clip.activeSpeaker}
- **Dialogue:** "${clip.dialogue}"
- **Listener:** ${clip.listenerCharacter}
- **Location Continuity:** ${clip.locationContinuityType} (${clip.frameReferenceStrategy})

**Starting Frame Prompt (Midjourney / Flow):**
\`\`\`
${fp}
\`\`\`

**Veo Video Motion Prompt:**
\`\`\`
${vp}
\`\`\`
`;
    })
    .join('\n\n') || 'No clips breakdown generated yet.'
}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-production-package.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Drama Mini-Film Archive</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-mono">
                  {historyItems.length} Films Saved
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Saved mini-films, character bibles, scene breakdowns, and ready-to-copy prompts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Stats Filter */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, actor, or setting..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 w-full sm:w-auto justify-end">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {historyItems.reduce((acc, it) => acc + it.clipsCount, 0)} Total Clips
              </span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center mx-auto text-neutral-500">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-300">
                {searchQuery ? 'No matching films found' : 'No saved mini-films yet'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? 'Try searching with a different title, actor name, or location setting.'
                  : 'Whenever you generate a story, character bible, or mini-film in the Studio, it automatically saves right here so you never lose it.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((item) => {
                const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectFilm(item.state);
                      onClose();
                    }}
                    className="p-5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/50 transition cursor-pointer group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                            {item.targetRuntime === '120s'
                              ? '👑 120s (12 Clips)'
                              : item.targetRuntime === '90s'
                              ? '🎬 90s (9 Clips)'
                              : '⚡ 60s (6 Clips)'}
                          </span>
                          {item.isProductionReady && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>PRODUCTION READY</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1">{item.world}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleExportMarkdown(item, e)}
                          title="Download Markdown Production Package"
                          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete Film from Archive"
                          className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Cast Pills */}
                    {item.cast.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <Users className="w-3.5 h-3.5 text-neutral-500" />
                        {item.cast.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>Gate {item.highestGate} of 8</span>
                      </span>

                      <span className="text-purple-400 group-hover:translate-x-1 transition font-bold flex items-center gap-1">
                        <span>Load into Studio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
