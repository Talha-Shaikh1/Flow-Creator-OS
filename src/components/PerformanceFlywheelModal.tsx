'use client';

import React, { useState } from 'react';
import { X, TrendingUp, Flame, ThumbsUp, TrendingDown, Sparkles, Plus, AlertCircle, CheckCircle2, Search, Eye, Share2 } from 'lucide-react';
import { PerformanceLog, WeeklyPlan, DiagnosticFeedback } from '../types';

interface PerformanceFlywheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WeeklyPlan | null;
  logs: PerformanceLog[];
  onAddLog: (log: PerformanceLog) => void;
}

export const PerformanceFlywheelModal: React.FC<PerformanceFlywheelModalProps> = ({
  isOpen,
  onClose,
  plan,
  logs,
  onAddLog,
}) => {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [result, setResult] = useState<'viral' | 'good' | 'flop'>('good');
  const [dropOffDiagnosis, setDropOffDiagnosis] = useState<DiagnosticFeedback['dropOffDiagnosis']>('hook_issue');
  const [viewsCount, setViewsCount] = useState('');
  const [retentionRate, setRetentionRate] = useState('');
  const [userNotes, setUserNotes] = useState('');

  if (!isOpen) return null;

  const currentDay = plan?.days.find((d) => d.dayNumber === selectedDayNum) || plan?.days[0];

  const getAiRecommendation = (diagnosis: string, outcome: string): string => {
    switch (diagnosis) {
      case 'hook_issue':
        return 'Story is good! Keep this emotional theme, but make the first 3s frame visually contrasting with a stronger curiosity question. (3-Video rule: Test 2 more videos before pivoting)';
      case 'seo_distribution_issue':
        return 'Low algorithmic impressions. Story is not the issue—optimize SEO search keywords, post at peak evening hours, and use trending audio.';
      case 'cta_engagement_issue':
        return 'High watch completion but low comments/shares. Add an open-ended provocative question in the last 3 seconds and pin it as the top comment.';
      case 'viral_winner':
        return '🔥 WINNING FORMULA DETECTED: This emotional archetype produced high engagement. AI will increase this pattern in next week\'s plan.';
      default:
        return 'Maintain consistency across at least 3 videos to confirm statistical audience trends.';
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDay) return;

    const newLog: PerformanceLog = {
      id: `log_${Date.now()}`,
      planId: plan?.id || 'manual',
      videoTitle: currentDay.title,
      dayNumber: currentDay.dayNumber,
      emotionalTrigger: currentDay.emotionalTrigger?.label || 'Curiosity',
      result,
      viewsCount,
      retentionRate,
      diagnostic: {
        dropOffDiagnosis,
        consecutiveTestsCount: logs.filter((l) => l.emotionalTrigger === currentDay.emotionalTrigger?.label).length + 1,
        aiGrowthRecommendation: getAiRecommendation(dropOffDiagnosis, result),
      },
      userNotes,
      keyLearnings: getAiRecommendation(dropOffDiagnosis, result),
      createdAt: Date.now(),
    };

    onAddLog(newLog);
    setViewsCount('');
    setRetentionRate('');
    setUserNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Algorithmic Performance & Diagnostic Engine</h2>
              <p className="text-xs text-zinc-400">Scientifically diagnose why videos perform and optimize your reach</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3-Video Scientific Principle */}
        <div className="mt-4 rounded-xl bg-indigo-950/30 p-3.5 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>The 3-Video Trend Rule (No Panic Pivots!)</span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
            Never change your content niche after 1 flop. If views drop, diagnose whether it's the <strong>First 3-Second Hook</strong>, <strong>SEO Distribution</strong>, or <strong>CTA</strong> before altering your story themes.
          </p>
        </div>

        {/* Log a Result Form */}
        {plan && (
          <form onSubmit={handleSaveLog} className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Diagnose Video Performance
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400">Select Video</label>
                <select
                  value={selectedDayNum}
                  onChange={(e) => setSelectedDayNum(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {plan.days.map((d) => (
                    <option key={d.dayNumber} value={d.dayNumber}>
                      Day {d.dayNumber} ({d.dayName}): {d.title.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400">Outcome Rating</label>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResult('viral');
                      setDropOffDiagnosis('viral_winner');
                    }}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      result === 'viral'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Flame className="h-3 w-3" /> Viral
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult('good')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      result === 'good'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" /> Good
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult('flop')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      result === 'flop'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <TrendingDown className="h-3 w-3" /> Flop
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Diagnosis Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300">
                Where was the biggest struggle or win? (Smart Algorithm Diagnostic)
              </label>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDropOffDiagnosis('hook_issue')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    dropOffDiagnosis === 'hook_issue'
                      ? 'border-amber-500 bg-amber-950/30 text-white ring-1 ring-amber-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Eye className="h-3.5 w-3.5" /> 3-Second Drop-off (Hook Issue)
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    People swiped away immediately. Story wasn't tested—first visual was too slow.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDropOffDiagnosis('seo_distribution_issue')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    dropOffDiagnosis === 'seo_distribution_issue'
                      ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                    <Search className="h-3.5 w-3.5" /> Low Impressions (SEO / Keyword Issue)
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    Algorithm didn't index the keywords or hashtags properly.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDropOffDiagnosis('cta_engagement_issue')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    dropOffDiagnosis === 'cta_engagement_issue'
                      ? 'border-purple-500 bg-purple-950/30 text-white ring-1 ring-purple-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-purple-400">
                    <Share2 className="h-3.5 w-3.5" /> Watched Till End But Low Comments (CTA Issue)
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    Audience loved the video, but didn't know what to comment or share.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDropOffDiagnosis('viral_winner')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    dropOffDiagnosis === 'viral_winner'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Viral Winner (Scale This Formula)
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    High retention + High comments/shares. Double down on this archetype.
                  </p>
                </button>
              </div>
            </div>

            {/* AI Real-time Growth Advice */}
            <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-300">💡 AI Growth Recommendation:</span>
              <p className="mt-1 text-zinc-200">{getAiRecommendation(dropOffDiagnosis, result)}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400">Views Reached (Optional)</label>
                <input
                  type="text"
                  value={viewsCount}
                  onChange={(e) => setViewsCount(e.target.value)}
                  placeholder="e.g. 85,000"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400">Retention % (Optional)</label>
                <input
                  type="text"
                  value={retentionRate}
                  onChange={(e) => setRetentionRate(e.target.value)}
                  placeholder="e.g. 74%"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Diagnosis to AI Memory</span>
              </button>
            </div>
          </form>
        )}

        {/* History of Diagnostics */}
        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Past Diagnosed Videos & AI Memory ({logs.length})
          </span>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 rounded-xl border border-zinc-800 bg-zinc-900/30">
                No video performance logs recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.videoTitle}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        log.result === 'viral'
                          ? 'bg-amber-500/20 text-amber-400'
                          : log.result === 'good'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.result} {log.viewsCount ? `(${log.viewsCount} views)` : ''}
                    </span>
                  </div>
                  <p className="text-amber-300/90 text-[11px]">
                    <strong>AI Growth Advice:</strong> "{log.keyLearnings}"
                  </p>
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
