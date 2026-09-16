'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  Check,
  X,
  Sparkles,
  Video,
  ImageIcon,
  Mic,
  Clapperboard,
  Filter,
  RefreshCw,
  Layers,
  CheckCheck,
} from 'lucide-react';
import { getOrCreateClientGuestId } from '@/lib/auth/session';

export interface CalendarEvent {
  id: string;
  userId: string;
  batchId: string;
  dayNumber: number;
  scheduledDate: string;
  variationId: string;
  variationTitle: string;
  format: string;
  isAdopted: boolean;
  status: 'draft' | 'produced' | 'adopted' | 'filmed';
  clipsSummary?: {
    clips?: any[];
    dialogueScript?: Array<{ speaker: string; line: string; timing: string }>;
    masterFrameImagePrompt?: string;
    hookDescription?: string;
  };
  metadata?: {
    caption?: string;
    hashtags?: string[];
    audioVibe?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeBatch?: any;
}

export function ContentCalendarModal({ isOpen, onClose, activeBatch }: Props) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'adopted' | 'pending'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const guestId = getOrCreateClientGuestId();
      const res = await fetch('/api/calendar', {
        headers: {
          'x-creator-guest-id': guestId,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync batch to calendar if provided and events empty
  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const handleSyncCurrentBatch = async () => {
    if (!activeBatch) return;
    setIsLoading(true);
    try {
      const guestId = getOrCreateClientGuestId();
      await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-guest-id': guestId,
        },
        body: JSON.stringify({
          batch: activeBatch,
          startDate: new Date().toISOString().split('T')[0],
        }),
      });
      await loadEvents();
    } catch (err) {
      console.error('Failed to sync batch to calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdopt = async (event: CalendarEvent) => {
    const nextAdopted = !event.isAdopted;
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? {
              ...e,
              isAdopted: nextAdopted,
              status: nextAdopted ? 'adopted' : 'produced',
            }
          : e
      )
    );

    if (selectedEvent?.id === event.id) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, isAdopted: nextAdopted, status: nextAdopted ? 'adopted' : 'produced' } : null
      );
    }

    try {
      const guestId = getOrCreateClientGuestId();
      await fetch('/api/calendar/adopt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-guest-id': guestId,
        },
        body: JSON.stringify({
          eventId: event.id,
          isAdopted: nextAdopted,
          status: nextAdopted ? 'adopted' : 'produced',
        }),
      });
    } catch (err) {
      console.error('Failed to update adoption status:', err);
      loadEvents(); // Revert on failure
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen || !mounted) return null;

  const totalEvents = events.length;
  const adoptedCount = events.filter((e) => e.isAdopted).length;
  const progressPercent = totalEvents > 0 ? Math.round((adoptedCount / totalEvents) * 100) : 0;

  const filteredEvents = events.filter((e) => {
    if (filter === 'adopted') return e.isAdopted;
    if (filter === 'pending') return !e.isAdopted;
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Content Calendar & Production History
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {adoptedCount}/{totalEvents} Filmed ✅
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Schedule, track filmed episodes with green ticks, and retrieve any historical prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeBatch && (
              <button
                onClick={handleSyncCurrentBatch}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="Sync current active batch into calendar dates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Active Batch</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar & Filters */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Progress Tracker */}
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 font-medium">Production Progress:</span>
            <div className="w-36 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filter === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Episodes ({events.length})
            </button>
            <button
              onClick={() => setFilter('adopted')}
              className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                filter === 'adopted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Filmed ({adoptedCount})</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filter === 'pending'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              Pending ({events.length - adoptedCount})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-800/80 text-neutral-400 mx-auto flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Scheduled Episodes Yet</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Generate a 7-day video batch in the studio, then click <strong>"Sync Active Batch"</strong> above to schedule your week and track filmed episodes.
              </p>
              {activeBatch && (
                <button
                  onClick={handleSyncCurrentBatch}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sync Current 7-Day Batch to Calendar</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEvents.map((evt) => {
                const dateObj = new Date(evt.scheduledDate);
                const dateLabel = isNaN(dateObj.getTime())
                  ? evt.scheduledDate
                  : dateObj.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <div
                    key={evt.id}
                    className={`border rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 ${
                      evt.isAdopted
                        ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Event Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            Day {evt.dayNumber}
                          </span>
                          <span className="text-neutral-400 font-mono">{dateLabel}</span>
                          <span className="text-[10px] text-neutral-500 uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                            {evt.format.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {evt.variationTitle}
                        </h4>
                      </div>

                      {/* Adopted Status Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          evt.isAdopted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        {evt.isAdopted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Filmed ✅</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Pending</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Dialogue Script Snippet or Hook */}
                    {evt.clipsSummary?.dialogueScript && evt.clipsSummary.dialogueScript.length > 0 && (
                      <p className="text-xs text-neutral-300 italic bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/80 line-clamp-2">
                        &ldquo;{evt.clipsSummary.dialogueScript[0].line}&rdquo;
                      </p>
                    )}

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/70 text-xs">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View Prompts</span>
                      </button>

                      <button
                        onClick={() => handleToggleAdopt(evt)}
                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                          evt.isAdopted
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                            : 'bg-neutral-800 hover:bg-emerald-950/40 text-neutral-300 hover:text-emerald-400 border border-neutral-700 hover:border-emerald-500/40'
                        }`}
                      >
                        {evt.isAdopted ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Filmed & Adopted ✅</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Filmed ✅</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historical Prompt Inspector Modal Drawer */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
            <div
              className="bg-neutral-900 border border-indigo-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Day {selectedEvent.dayNumber}
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    {selectedEvent.variationTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAdopt(selectedEvent)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                      selectedEvent.isAdopted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:text-emerald-400'
                    }`}
                  >
                    {selectedEvent.isAdopted ? 'Filmed ✅' : 'Mark as Filmed ✅'}
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-4 overflow-y-auto">
                {/* Master Frame Image Prompt */}
                {selectedEvent.clipsSummary?.masterFrameImagePrompt && (
                  <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        Step 1: Starting Frame Image Prompt
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            selectedEvent.clipsSummary?.masterFrameImagePrompt || '',
                            'masterFrame'
                          )
                        }
                        className="text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800"
                      >
                        {copiedKey === 'masterFrame' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'masterFrame' ? 'Copied' : 'Copy Frame Prompt'}</span>
                      </button>
                    </div>
                    <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-amber-100 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {selectedEvent.clipsSummary.masterFrameImagePrompt}
                    </pre>
                  </div>
                )}

                {/* Clips Directives */}
                {selectedEvent.clipsSummary?.clips && selectedEvent.clipsSummary.clips.length > 0 ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-400" />
                      Google Flow 10s Video Directives ({selectedEvent.clipsSummary.clips.length} Clips)
                    </span>

                    {selectedEvent.clipsSummary.clips.map((clip: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-400">
                            Clip {clip.clipIndex || idx + 1}: {clip.sceneName || `Part ${idx + 1}`}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(clip.flowPromptText || '', `clip-${idx}`)
                            }
                            className="text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800"
                          >
                            {copiedKey === `clip-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedKey === `clip-${idx}` ? 'Copied' : 'Copy Motion Prompt'}</span>
                          </button>
                        </div>
                        <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                          {clip.flowPromptText}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                    Clips are currently stored as a Mind Map. Open this episode in the studio and click &ldquo;Produce Full Prompts&rdquo; to unlock 10s Google Flow motion directives.
                  </div>
                )}

                {/* Caption & Hashtags */}
                {selectedEvent.metadata && (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
                    <span className="font-semibold text-neutral-300 block">Social Media Caption & Tags:</span>
                    <p className="text-neutral-300">{selectedEvent.metadata.caption}</p>
                    {selectedEvent.metadata.hashtags && (
                      <p className="text-blue-400 font-mono">
                        {selectedEvent.metadata.hashtags.join(' ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
