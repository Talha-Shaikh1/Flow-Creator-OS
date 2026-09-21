'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Sparkles,
  Calendar,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  Clock,
  Video,
  Camera,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: any) => void;
  personas: Array<{ id: string; name: string; displayName?: string | null }>;
  activePersonaId?: string;
}

export function PersonaHistoryModal({
  isOpen,
  onClose,
  onSelectPlan,
  personas,
  activePersonaId,
}: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersonaFilter, setSelectedPersonaFilter] = useState<string>(
    activePersonaId || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedPersonaFilter && selectedPersonaFilter !== 'all'
          ? `/api/creator-ops/plans?personaId=${selectedPersonaFilter}&history=true`
          : `/api/creator-ops/plans?history=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load persona history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedPersonaFilter(activePersonaId || 'all');
      fetchHistory();
    }
  }, [isOpen, activePersonaId]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [selectedPersonaFilter]);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    const topic = (item.trendingTopic || '').toLowerCase();
    const hook = (item.hook || '').toLowerCase();
    const script = (item.reelScript || '').toLowerCase();
    const pName = (item.persona?.displayName || item.persona?.name || '').toLowerCase();
    const date = (item.date || '').toLowerCase();
    return topic.includes(q) || hook.includes(q) || script.includes(q) || pName.includes(q) || date.includes(q);
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this generated plan from history?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/creator-ops/plans?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete plan:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#11131c] border border-neutral-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-[#0d0f17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Persona Generation History
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Cloud Archive
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Browse, restore, or copy any past AI script, frame prompt, or multi-channel pack.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-[#11131c] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, hook, script or date..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedPersonaFilter}
              onChange={(e) => setSelectedPersonaFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Personas ({history.length})</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName || p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={isLoading}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              title="Refresh history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* List of Plans */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-neutral-400">Loading persona history from database...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
              <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-300">No Generated History Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Whenever you click "Generate Daily Pack" in AI Content Studio, your complete generation is automatically archived here permanently.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const personaName = item.persona?.displayName || item.persona?.name || 'Persona';
              const formattedDate = item.date || (item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Past Date');
              const carouselCount = item.carouselSlides
                ? (() => {
                    try {
                      const parsed = JSON.parse(item.carouselSlides);
                      return Array.isArray(parsed) ? parsed.length : 0;
                    } catch {
                      return 0;
                    }
                  })()
                : 0;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-cyan-500/40 transition space-y-3 relative group"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                        @{personaName}
                      </span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{formattedDate}</span>
                      </span>
                      {carouselCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                          {carouselCount}-Slide Carousel
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPlan(item);
                          onClose();
                        }}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                        title="Restore this plan into AI Content Studio"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Restore into Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topic & Hook */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {item.trendingTopic || 'Untitled Topic'}
                    </h4>
                    {item.hook && (
                      <p className="text-xs text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        &ldquo;{item.hook}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Reel Script Preview */}
                  {item.reelScript && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Spoken Reel Script (60s):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.reelScript, `script-${item.id}`)}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedId === `script-${item.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === `script-${item.id}` ? 'Copied' : 'Copy Script'}</span>
                        </button>
                      </div>
                      <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto leading-relaxed">
                        {item.reelScript}
                      </pre>
                    </div>
                  )}

                  {/* Image Prompt Preview */}
                  {item.imagePrompt && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-purple-400" />
                          <span>Midjourney / Flux Frame Prompt ({item.imagePostType || 'Master Still'}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.imagePrompt, `prompt-${item.id}`)}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedId === `prompt-${item.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === `prompt-${item.id}` ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-purple-200 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto leading-relaxed">
                        {item.imagePrompt}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
