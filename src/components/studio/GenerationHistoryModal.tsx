'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Sparkles,
  Video,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { WeeklyBatchDelivery } from '@/types';
import { getOrCreateClientGuestId } from '@/lib/auth/session';
import {
  BatchHistoryItem,
  HistoryStatsSummary as StatsSummary,
  getLocalBatchHistory,
  saveBatchToLocalHistory,
  deleteBatchFromLocalHistory,
  computeHistoryStats,
} from '@/lib/history/batch-history';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBatch: (batch: WeeklyBatchDelivery) => void;
}

export function GenerationHistoryModal({ isOpen, onClose, onSelectBatch }: Props) {
  const [batches, setBatches] = useState<BatchHistoryItem[]>([]);
  const [stats, setStats] = useState<StatsSummary>({
    totalBatches: 0,
    totalClips: 0,
    totalPrompts: 0,
    totalVideosGenerated: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Immediately load local history from localStorage (instant rendering)
    const local = getLocalBatchHistory();
    if (local.length > 0) {
      setBatches(local);
      setStats(computeHistoryStats(local));
    }

    // 2. Fetch and merge cloud batches in the background
    const fetchHistory = async () => {
      if (local.length === 0) setIsLoading(true);
      try {
        const guestId = getOrCreateClientGuestId();
        const res = await fetch('/api/batches', {
          headers: { 'x-creator-guest-id': guestId },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.batches) && data.batches.length > 0) {
          // Merge cloud batches with local
          const currentLocal = getLocalBatchHistory();
          const merged = [...currentLocal];
          data.batches.forEach((cloudB: BatchHistoryItem) => {
            const idx = merged.findIndex((m) => m.id === cloudB.id);
            if (idx >= 0) {
              merged[idx] = cloudB;
            } else {
              merged.push(cloudB);
            }
          });
          // Save merged back to local storage
          try {
            localStorage.setItem('flowcreator_batches_history_v2', JSON.stringify(merged.slice(0, 50)));
          } catch {}
          setBatches(merged);
          setStats(computeHistoryStats(merged));
        }
      } catch (err) {
        console.warn('Failed to sync cloud batch history, relying on local:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteBatch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this batch from your history?')) return;

    setDeletingId(id);
    // Immediately remove from local history
    const remaining = deleteBatchFromLocalHistory(id);
    setBatches(remaining);
    setStats(computeHistoryStats(remaining));

    try {
      const guestId = getOrCreateClientGuestId();
      await fetch(`/api/batches?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-creator-guest-id': guestId },
      });
    } catch (err) {
      console.warn('Failed to delete batch from cloud:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.format.toLowerCase().includes(q) ||
      b.premise.toLowerCase().includes(q) ||
      b.genres.some((g) => g.toLowerCase().includes(q))
    );
  });

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Production & Prompt Generation History</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {stats.totalVideosGenerated} Videos Produced
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Track all engineered prompts, production batches, and created videos across your account.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-950/40 border-b border-neutral-800">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Batches</span>
              <span className="text-base font-bold text-white">{stats.totalBatches}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Prompts Engineered</span>
              <span className="text-base font-bold text-white">{stats.totalPrompts}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Videos Created</span>
              <span className="text-base font-bold text-emerald-400">{stats.totalVideosGenerated}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Production Rate</span>
              <span className="text-base font-bold text-white">{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/20">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by series title, premise, genre or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-neutral-500 shrink-0">
            {filteredBatches.length} {filteredBatches.length === 1 ? 'batch' : 'batches'}
          </span>
        </div>

        {/* Batches Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-400">Loading your production history from database...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-neutral-950/40 rounded-xl border border-dashed border-neutral-800">
              <History className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">No generation history found</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Generate your first 7-Day production batch from the studio wizard to track engineered prompts and created videos here.
              </p>
            </div>
          ) : (
            filteredBatches.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectBatch(item.batch);
                  onClose();
                }}
                className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-950 transition cursor-pointer group space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {item.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase font-mono">
                        {item.format.replace('_', ' ')}
                      </span>
                      {item.genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/50 text-indigo-300"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    {item.premise && (
                      <p className="text-xs text-neutral-400 line-clamp-1 italic">
                        &ldquo;{item.premise}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-neutral-600" />
                      {formatDate(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteBatch(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cast Avatars Preview */}
                {item.cast && item.cast.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-900">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase">Cast:</span>
                    {item.cast.map((c, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          c.role === 'Hero'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : c.role === 'Villain'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <User className="w-2.5 h-2.5" />
                        <strong>{c.name}</strong>
                        <span className="text-[9px] opacity-75">({c.role})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Video Generation Progress & Metrics */}
                <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-neutral-400">
                    <span>
                      Total Prompts: <strong className="text-neutral-200">{item.totalPrompts}</strong>
                    </span>
                    <span>
                      Video Clips: <strong className="text-neutral-200">{item.totalClips}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      Videos Created:{' '}
                      <strong className={item.generatedVideosCount > 0 ? 'text-emerald-400' : 'text-neutral-400'}>
                        {item.generatedVideosCount} / {item.totalClips}
                      </strong>
                      {item.generatedVideosCount === item.totalClips && item.totalClips > 0 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-28 h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                      {item.completionRate}%
                    </span>

                    <button
                      type="button"
                      className="ml-2 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Open Batch</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 bg-neutral-950/60">
          <span>Click on any batch to resume your session and copy remaining video prompts.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
