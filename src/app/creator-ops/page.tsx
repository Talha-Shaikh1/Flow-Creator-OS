'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Send,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit,
  Shield,
  Search,
  AlertCircle,
  HelpCircle,
  Video,
  Camera,
  Music,
  Share2,
  TrendingUp,
  RefreshCw,
  Sliders,
  ChevronRight,
  Tv,
  Film,
  Zap,
} from 'lucide-react';
import { YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/creator-ops/SocialIcons';

interface Persona {
  id: string;
  name: string;
  displayName: string | null;
  assignedDay: number | null;
  niche: string | null;
  language: string | null;
  targetAudience: string | null;
  visualStyle: string | null;
  framePrompt: string | null;
  masterVideoPrompt: string | null;
  weeklyReelsTarget: number;
  weeklyFeedTarget: number;
  dailyStoriesTarget: number;
  youtubeHandle: string | null;
  youtubeUrl: string | null;
  instaHandle: string | null;
  instaUrl: string | null;
  tiktokHandle: string | null;
  tiktokUrl: string | null;
  facebookHandle: string | null;
  facebookUrl: string | null;
  dailyUploads?: any[];
}

interface DailyUpload {
  id: string;
  date: string;
  personaId: string;
  videoTitle: string | null;
  notes: string | null;
  youtubeDone: boolean;
  instaDone: boolean;
  tiktokDone: boolean;
  facebookDone: boolean;
  youtubeUrl: string | null;
  instaUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  allCompleted: boolean;
  feedPostsCount: number;
  storiesCount: number;
}

interface GmailAccount {
  id: string;
  email: string;
  subscription: string;
  renewalDate: string | null;
  browserProfile: string | null;
  notes: string | null;
  personas?: Persona[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CreatorOpsPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'studio' | 'rotation' | 'vault' | 'streak' | 'settings'>('mission');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [currentUpload, setCurrentUpload] = useState<DailyUpload | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Time & Status State
  const [pktTime, setPktTime] = useState<string>('');
  const [todayDateStr, setTodayDateStr] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Studio State
  const [studioPersonaId, setStudioPersonaId] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [imagePostType, setImagePostType] = useState<string>('carousel (3-5 slides, 4:5 vertical)');
  const [contentPlan, setContentPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Live PKT Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ' PKT';
      setPktTime(timeString);

      const pktDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
      const yyyy = pktDate.getFullYear();
      const mm = String(pktDate.getMonth() + 1).padStart(2, '0');
      const dd = String(pktDate.getDate()).padStart(2, '0');
      setTodayDateStr(`${yyyy}-${mm}-${dd}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [personasRes, streakRes, gmailRes, settingsRes] = await Promise.all([
        fetch('/api/creator-ops/personas'),
        fetch('/api/creator-ops/streak'),
        fetch('/api/creator-ops/gmail'),
        fetch('/api/creator-ops/settings'),
      ]);

      const personasData = await personasRes.json();
      const streakData = await streakRes.json();
      const gmailData = await gmailRes.json();
      const settingsData = await settingsRes.json();

      if (personasData.personas) {
        setPersonas(personasData.personas);

        // Detect active persona based on today's PKT day of week
        const now = new Date();
        const pktDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
        const currentDayIndex = pktDate.getDay();

        let active = personasData.personas.find((p: Persona) => p.assignedDay === currentDayIndex);
        if (!active && personasData.personas.length > 0) active = personasData.personas[0];
        setActivePersona(active || null);
        if (active) setStudioPersonaId(active.id);

        if (active) {
          // Fetch upload for this persona
          const uploadRes = await fetch(`/api/creator-ops/uploads?personaId=${active.id}&date=${personasData.today}`);
          const uploadData = await uploadRes.json();
          setCurrentUpload(uploadData.upload || null);

          // Fetch plan
          const planRes = await fetch(`/api/creator-ops/plans?personaId=${active.id}&date=${personasData.today}`);
          const planData = await planRes.json();
          if (planData.plan) setContentPlan(planData.plan);
        }
      }

      if (streakData.streak !== undefined) {
        setStreak(streakData.streak);
        setHistory(streakData.history || []);
      }

      if (gmailData.accounts) setGmailAccounts(gmailData.accounts);
      if (settingsData.settings) setSettings(settingsData.settings);
    } catch (err) {
      console.error('Failed to load CreatorOps data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Switch Active Persona
  const handleSelectPersona = async (persona: Persona) => {
    setActivePersona(persona);
    setStudioPersonaId(persona.id);
    try {
      const uploadRes = await fetch(`/api/creator-ops/uploads?personaId=${persona.id}&date=${todayDateStr}`);
      const uploadData = await uploadRes.json();
      setCurrentUpload(uploadData.upload || null);

      const planRes = await fetch(`/api/creator-ops/plans?personaId=${persona.id}&date=${todayDateStr}`);
      const planData = await planRes.json();
      setContentPlan(planData.plan || null);
    } catch (e) {}
  };

  // Toggle channel completion
  const handleToggleChannel = async (channel: 'youtubeDone' | 'instaDone' | 'tiktokDone' | 'facebookDone') => {
    if (!activePersona) return;
    const currentVal = currentUpload ? currentUpload[channel] : false;
    const nextVal = !currentVal;

    try {
      const res = await fetch('/api/creator-ops/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: activePersona.id,
          date: todayDateStr,
          [channel]: nextVal,
        }),
      });

      const data = await res.json();
      if (data.upload) {
        setCurrentUpload(data.upload);
        if (data.upload.allCompleted) {
          triggerCelebration();
        }
      }
    } catch (err) {
      console.error('Error toggling channel:', err);
    }
  };

  // Mark all done
  const handleMarkAllDone = async () => {
    if (!activePersona) return;
    try {
      const res = await fetch('/api/creator-ops/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: activePersona.id,
          date: todayDateStr,
          markAllDone: true,
        }),
      });
      const data = await res.json();
      if (data.upload) {
        setCurrentUpload(data.upload);
        triggerCelebration();
      }
    } catch (e) {}
  };

  const triggerCelebration = () => {
    setCelebration(true);
    setActionNotice({ type: 'success', message: '🎉 Booom! All 4 channels completed! Streak updated.' });
    setTimeout(() => setCelebration(false), 5000);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Save Post Details
  const handleSaveDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activePersona) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/creator-ops/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: activePersona.id,
          date: todayDateStr,
          videoTitle: formData.get('videoTitle'),
          notes: formData.get('notes'),
          youtubeUrl: formData.get('youtubeUrl'),
          instaUrl: formData.get('instaUrl'),
          tiktokUrl: formData.get('tiktokUrl'),
          facebookUrl: formData.get('facebookUrl'),
        }),
      });
      const data = await res.json();
      if (data.upload) {
        setCurrentUpload(data.upload);
        setActionNotice({ type: 'success', message: 'Post details saved successfully!' });
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: 'Failed to save details.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate Daily Pack
  const handleGeneratePack = async () => {
    const targetPersona = personas.find((p) => p.id === studioPersonaId) || activePersona;
    if (!targetPersona) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/creator-ops/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: targetPersona.id,
          customTopic,
          imagePostType,
        }),
      });

      const data = await res.json();
      if (data.plan) {
        setContentPlan(data.plan);
        setActionNotice({ type: 'success', message: `✨ Complete daily pack generated for ${targetPersona.displayName || targetPersona.name}!` });
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {
      setActionNotice({ type: 'error', message: 'Generation failed. Please check Gemini API key.' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Content Plan
  const handleSavePlan = async () => {
    if (!contentPlan || !studioPersonaId) return;
    try {
      const res = await fetch('/api/creator-ops/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: studioPersonaId,
          date: todayDateStr,
          ...contentPlan,
        }),
      });
      if (res.ok) {
        setActionNotice({ type: 'success', message: 'Content plan permanently saved to cloud database!' });
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {}
  };

  // Send Manual WhatsApp Alert
  const handleSendReminderNow = async () => {
    try {
      setActionNotice({ type: 'success', message: 'Sending test WhatsApp alert...' });
      const res = await fetch('/api/creator-ops/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', message: '✅ WhatsApp reminder delivered to your phone!' });
      } else {
        setActionNotice({ type: 'error', message: data.error || 'Could not send WhatsApp message. Check Tab 6.' });
      }
    } catch (e) {
      setActionNotice({ type: 'error', message: 'Failed to trigger reminder.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Calculate completion percentage
  const completedChannelsCount = currentUpload
    ? [currentUpload.youtubeDone, currentUpload.instaDone, currentUpload.tiktokDone, currentUpload.facebookDone].filter(Boolean).length
    : 0;
  const progressPercent = Math.round((completedChannelsCount / 4) * 100);

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 antialiased pb-28 selection:bg-emerald-500/30">
      {/* Top Header & Ticking PKT Clock */}
      <header className="border-b border-neutral-800/80 bg-[#11131c]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  CreatorOps <span className="text-emerald-400">Hub</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operations OS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Daily 4-Channel Production & WhatsApp Reminder Engine
              </p>
            </div>
          </div>

          {/* Center: Live Real-time PKT Clock & Today's Brand Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-medium">{pktTime || '03:45:00 PM PKT'}</span>
            </div>

            {activePersona && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Today: @{activePersona.displayName || activePersona.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {currentUpload?.allCompleted ? 'Done ✅' : `${completedChannelsCount}/4 Done`}
                </span>
              </div>
            )}
          </div>

          {/* Right: Streak & Return to Studio */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>{streak} Day Streak</span>
            </div>

            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition border border-neutral-800"
            >
              Flow Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 animate-in fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
        )}

        {/* 6 Tabs Navigation Bar */}
        <nav className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'mission'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Today's Mission</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Content Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('rotation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'rotation'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Brand Rotation ({personas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Gmail & AI Vault ({gmailAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('streak')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'streak'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Streak & History (28D)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp & Cron</span>
          </button>
        </nav>

        {/* TAB 1: TODAY'S MISSION (DAILY UPLOAD MATRIX) */}
        {activeTab === 'mission' && (
          <div className="space-y-6">
            {/* Active Persona Hero Card */}
            {activePersona ? (
              <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assigned Day: {activePersona.assignedDay !== null ? DAYS_OF_WEEK[activePersona.assignedDay] : 'Daily'}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                      <span>{activePersona.displayName || activePersona.name}</span>
                      <span className="text-xs font-mono font-normal text-neutral-400 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                        @{activePersona.name}
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                      {activePersona.niche || 'Multi-platform AI influencer production'} • Target: {activePersona.targetAudience}
                    </p>
                  </div>

                  {/* Persona Selector Chips */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-neutral-400 mr-1 font-medium">Switch Brand:</span>
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPersona(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          p.id === activePersona.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {p.displayName || p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar & Mark All Done Action */}
                <div className="mt-8 pt-6 border-t border-neutral-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                        4-Platform Upload Progress
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        ({completedChannelsCount} of 4 Channels Done)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendReminderNow}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                        title="Send manual WhatsApp alert to test"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Send Reminder Now</span>
                      </button>

                      <button
                        onClick={handleMarkAllDone}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark All Done</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* 4 Social Platforms Interactive Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* YouTube Shorts */}
              <div
                onClick={() => handleToggleChannel('youtubeDone')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  currentUpload?.youtubeDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#11131c] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <YouTubeIcon className="w-7 h-7" />
                    <div>
                      <h4 className="font-bold text-sm text-white">YouTube Shorts</h4>
                      <span className="text-[11px] text-neutral-400">9:16 Vertical Video</span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      currentUpload?.youtubeDone ? 'bg-emerald-500 text-white' : 'border-2 border-neutral-700'
                    }`}
                  >
                    {currentUpload?.youtubeDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800/60">
                  <span className={currentUpload?.youtubeDone ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {currentUpload?.youtubeDone ? 'Uploaded ✅' : 'Pending Upload'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">1/1 Reel</span>
                </div>
              </div>

              {/* Instagram Reels */}
              <div
                onClick={() => handleToggleChannel('instaDone')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  currentUpload?.instaDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#11131c] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <InstagramIcon className="w-7 h-7" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Instagram Reel</h4>
                      <span className="text-[11px] text-neutral-400">Reels & Story Reshare</span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      currentUpload?.instaDone ? 'bg-emerald-500 text-white' : 'border-2 border-neutral-700'
                    }`}
                  >
                    {currentUpload?.instaDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800/60">
                  <span className={currentUpload?.instaDone ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {currentUpload?.instaDone ? 'Uploaded ✅' : 'Pending Upload'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">1/1 Reel</span>
                </div>
              </div>

              {/* TikTok Video */}
              <div
                onClick={() => handleToggleChannel('tiktokDone')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  currentUpload?.tiktokDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#11131c] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TikTokIcon className="w-7 h-7" />
                    <div>
                      <h4 className="font-bold text-sm text-white">TikTok Video</h4>
                      <span className="text-[11px] text-neutral-400">Hook-first Viral</span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      currentUpload?.tiktokDone ? 'bg-emerald-500 text-white' : 'border-2 border-neutral-700'
                    }`}
                  >
                    {currentUpload?.tiktokDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800/60">
                  <span className={currentUpload?.tiktokDone ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {currentUpload?.tiktokDone ? 'Uploaded ✅' : 'Pending Upload'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">1/1 Reel</span>
                </div>
              </div>

              {/* Facebook Video */}
              <div
                onClick={() => handleToggleChannel('facebookDone')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  currentUpload?.facebookDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#11131c] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FacebookIcon className="w-7 h-7" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Facebook Video</h4>
                      <span className="text-[11px] text-neutral-400">Discussion Community</span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      currentUpload?.facebookDone ? 'bg-emerald-500 text-white' : 'border-2 border-neutral-700'
                    }`}
                  >
                    {currentUpload?.facebookDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800/60">
                  <span className={currentUpload?.facebookDone ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {currentUpload?.facebookDone ? 'Uploaded ✅' : 'Pending Upload'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">1/1 Video</span>
                </div>
              </div>
            </div>

            {/* Post Details & Live Upload URLs Form */}
            <form onSubmit={handleSaveDetails} className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-cyan-400" />
                <span>Today's Video Meta & Live Links</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Video Title / Topic</label>
                  <input
                    type="text"
                    name="videoTitle"
                    defaultValue={currentUpload?.videoTitle || ''}
                    placeholder="e.g. Bakra Be-Qaraar Ki Mehfil Shayari"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Production Notes</label>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={currentUpload?.notes || ''}
                    placeholder="e.g. 6x10s Google Flow clips merged, audio Foley boosted"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* 4 URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">YouTube Video Link</label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    defaultValue={currentUpload?.youtubeUrl || ''}
                    placeholder="https://youtube.com/shorts/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Instagram Reel Link</label>
                  <input
                    type="url"
                    name="instaUrl"
                    defaultValue={currentUpload?.instaUrl || ''}
                    placeholder="https://instagram.com/reel/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">TikTok Video Link</label>
                  <input
                    type="url"
                    name="tiktokUrl"
                    defaultValue={currentUpload?.tiktokUrl || ''}
                    placeholder="https://tiktok.com/@..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Facebook Video Link</label>
                  <input
                    type="url"
                    name="facebookUrl"
                    defaultValue={currentUpload?.facebookUrl || ''}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Meta & Links'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: AI CONTENT OPERATIONS STUDIO (7-STEP WORKFLOW) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top Studio Controls */}
            <div className="p-5 rounded-2xl bg-[#11131c] border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Persona Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Selected Persona</label>
                  <select
                    value={studioPersonaId}
                    onChange={(e) => setStudioPersonaId(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  >
                    {personas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Topic Input */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Angle / Topic (Optional)</label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Ghaas Ki Mehngaai / Outgrowing Relationships"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Image Post Type */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Feed Post Type</label>
                  <select
                    value={imagePostType}
                    onChange={(e) => setImagePostType(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="carousel (3-5 slides, 4:5 vertical)">4:5 Vertical Carousel (5 Slides)</option>
                    <option value="casual candid">Casual Candid</option>
                    <option value="OOTD">OOTD (Outfit of the Day)</option>
                    <option value="podcast BTS">Podcast Studio BTS</option>
                    <option value="quote card">Quote Card</option>
                    <option value="photo dump">Photo Dump</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGeneratePack}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating Pack...' : 'Generate Daily Pack'}</span>
                </button>

                {contentPlan && (
                  <button
                    onClick={handleSavePlan}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition border border-neutral-700 cursor-pointer"
                  >
                    Save Plan
                  </button>
                )}
              </div>
            </div>

            {/* Generated 7-Step Plan Display */}
            {contentPlan ? (
              <div className="space-y-6 animate-in fade-in">
                {/* Step 1: Persona Master Specs */}
                <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                      Active Persona Specs
                    </span>
                    <button
                      onClick={() => copyToClipboard(contentPlan.imagePrompt || '', 'step1')}
                      className="text-neutral-400 hover:text-white text-xs flex items-center gap-1"
                    >
                      {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step1' ? 'Copied' : 'Copy Frame Prompt'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">Locked Starting Frame Prompt:</span>
                      <p className="text-neutral-200 leading-relaxed font-mono">{contentPlan.imagePrompt}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">Topic & Viral Angle:</span>
                      <p className="text-white font-bold mb-1">{contentPlan.trendingTopic}</p>
                      <p className="text-neutral-400 leading-relaxed">{contentPlan.hook}</p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Trend Radar & Audio */}
                <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
                      Trend Radar & Trending Audio
                    </span>
                    <button
                      onClick={() => copyToClipboard(contentPlan.trendingAudio || '', 'audio')}
                      className="text-neutral-400 hover:text-white text-xs flex items-center gap-1"
                    >
                      {copiedKey === 'audio' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'audio' ? 'Copied' : 'Copy Audio Name'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Music className="w-4 h-4 text-pink-400" />
                      <span className="font-semibold text-white">{contentPlan.trendingAudio}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">Search exact name on TikTok / IG</span>
                  </div>
                </div>

                {/* Step 3: Reel Production Plan (Timestamps / Google Flow clips) */}
                <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                      Timed Production Script (Google Flow Veo 10s Continuous Clips)
                    </span>
                    <button
                      onClick={() => copyToClipboard(contentPlan.reelScript || '', 'script')}
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'script' ? 'Copied Script' : 'Copy Full Script'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 whitespace-pre-wrap font-mono text-xs text-neutral-200 leading-relaxed max-h-96 overflow-y-auto">
                    {contentPlan.reelScript}
                  </div>
                </div>

                {/* Step 4: 4:5 Vertical Carousel Breakdown */}
                {contentPlan.carouselSlides && (
                  <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">4</span>
                      4:5 Vertical Carousel (5-Slide Breakdown)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {(Array.isArray(contentPlan.carouselSlides)
                        ? contentPlan.carouselSlides
                        : JSON.parse(contentPlan.carouselSlides || '[]')
                      ).map((slide: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">
                              Slide {slide.slide || idx + 1}: {slide.title}
                            </span>
                            <p className="text-neutral-200 leading-relaxed font-medium mb-2">{slide.text}</p>
                          </div>
                          <p className="text-[10px] text-neutral-500 italic border-t border-neutral-800 pt-1.5 mt-2">
                            {slide.visual}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Daily 5-Story Pack */}
                {contentPlan.storiesPlan && (
                  <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">5</span>
                      Daily 5-Story Sequence
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {(Array.isArray(contentPlan.storiesPlan)
                        ? contentPlan.storiesPlan
                        : JSON.parse(contentPlan.storiesPlan || '[]')
                      ).map((st: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase text-amber-400">Story {st.storyNumber || idx + 1}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">{st.type}</span>
                            </div>
                            <p className="text-neutral-200 leading-relaxed mt-2">{st.caption}</p>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-medium border-t border-neutral-800 pt-1.5 mt-2">
                            Sticker: {st.sticker}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: 1-Click Publishing Vault */}
                <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px]">6</span>
                    1-Click Publishing Vault (All 4 Social Channels)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* YouTube Shorts */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <YouTubeIcon className="w-4 h-4" />
                          YouTube Shorts SEO
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${contentPlan.ytTitle}\n\n${contentPlan.ytDescription}\n\nTags: ${contentPlan.ytTags}`, 'yt')}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'yt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'yt' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                      <p className="text-white font-semibold">{contentPlan.ytTitle}</p>
                      <p className="text-neutral-400 text-[11px] line-clamp-3">{contentPlan.ytDescription}</p>
                    </div>

                    {/* Instagram Reel */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <InstagramIcon className="w-4 h-4" />
                          Instagram Reel Caption
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${contentPlan.instaCaption}\n\n${contentPlan.instaHashtags}`, 'ig')}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'ig' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                      <p className="text-neutral-200 line-clamp-3">{contentPlan.instaCaption}</p>
                      <p className="text-indigo-400 text-[11px] truncate">{contentPlan.instaHashtags}</p>
                    </div>

                    {/* TikTok */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <TikTokIcon className="w-4 h-4" />
                          TikTok Hook & Hashtags
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${contentPlan.tiktokCaption} ${contentPlan.tiktokHashtags}`, 'tt')}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'tt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'tt' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                      <p className="text-neutral-200 line-clamp-2">{contentPlan.tiktokCaption}</p>
                      <p className="text-cyan-400 text-[11px] truncate">{contentPlan.tiktokHashtags}</p>
                    </div>

                    {/* Facebook */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <FacebookIcon className="w-4 h-4" />
                          Facebook Discussion Caption
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${contentPlan.facebookCaption} ${contentPlan.facebookHashtags}`, 'fb')}
                          className="text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'fb' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                      <p className="text-neutral-200 line-clamp-2">{contentPlan.facebookCaption}</p>
                      <p className="text-blue-400 text-[11px] truncate">{contentPlan.facebookHashtags}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#11131c] border border-neutral-800 text-neutral-400">
                Click <strong>"Generate Daily Pack"</strong> above to produce complete 7-step scripts, Urdu poetry/dialogue, 6x10s continuous clips, and 4-platform publishing copies.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BRAND ROTATION SCHEDULE */}
        {activeTab === 'rotation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">7-Day Weekly Brand Rotation</h3>
                <p className="text-xs text-neutral-400">Manage which AI persona is directed on which day of the week.</p>
              </div>
            </div>

            {/* 7-Day Visual Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const assigned = personas.filter((p) => p.assignedDay === idx);
                const isToday = new Date().getDay() === idx;

                return (
                  <div
                    key={dayName}
                    className={`p-4 rounded-2xl border min-h-[160px] flex flex-col justify-between ${
                      isToday
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#11131c] border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">{dayName.slice(0, 3)}</span>
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Today
                          </span>
                        )}
                      </div>

                      {assigned.length > 0 ? (
                        assigned.map((p) => (
                          <div key={p.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 mb-2">
                            <div className="font-bold text-xs text-white truncate">{p.displayName || p.name}</div>
                            <div className="text-[10px] text-neutral-400 line-clamp-1">{p.niche}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-neutral-500 italic mt-4">Rest / Content Prep</div>
                      )}
                    </div>

                    <div className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-800/60">
                      Target: {assigned[0]?.weeklyReelsTarget || 2} Reels / Wk
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Persona List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {personas.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-white">{p.displayName || p.name}</h4>
                      <span className="text-xs font-mono text-cyan-400">@{p.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                      Day: {p.assignedDay !== null ? DAYS_OF_WEEK[p.assignedDay] : 'Unassigned'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">{p.niche}</p>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{p.visualStyle}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] block">Reels Goal</span>
                      <span className="text-white font-bold">{p.weeklyReelsTarget} / Wk</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] block">Carousels</span>
                      <span className="text-white font-bold">{p.weeklyFeedTarget} / Wk</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] block">Stories</span>
                      <span className="text-white font-bold">{p.dailyStoriesTarget} / Day</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GMAIL & AI TOOL SUBSCRIPTIONS VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Gmail & AI Subscription Vault</h3>
                <p className="text-xs text-neutral-400">Manage Google Gemini, ChatGPT Plus, and Chrome Browser Profiles.</p>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gmailAccounts.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-[#11131c] border border-neutral-800 text-neutral-400 text-xs">
                  No Gmail accounts registered yet. Use the system to add and track AI tool renewals.
                </div>
              ) : (
                gmailAccounts.map((acc) => (
                  <div key={acc.id} className="p-5 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-white truncate">{acc.email}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {acc.subscription}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-400">
                      <div>Profile: <span className="text-neutral-200 font-mono">{acc.browserProfile || 'Profile 1'}</span></div>
                      <div>Renewal: <span className="text-emerald-400 font-mono">{acc.renewalDate ? new Date(acc.renewalDate).toLocaleDateString() : 'Active'}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: STREAK & HISTORY MATRIX (28-DAY HEATMAP) */}
        {activeTab === 'streak' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span>28-Day Consistency Matrix</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Green = 100% (All 4 channels uploaded), Yellow = Partial, Red = Missed.</p>
                </div>
                <span className="text-xl font-black text-amber-400 font-mono">{streak} Days Streak</span>
              </div>

              {/* 28 Day Heatmap Grid */}
              <div className="grid grid-cols-7 gap-2.5 pt-2">
                {history.map((day) => (
                  <div
                    key={day.date}
                    className={`p-3 rounded-xl border text-center transition ${
                      day.status === 'completed'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : day.status === 'partial'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono block mb-1">{day.date.slice(5)}</span>
                    <span className="text-xs font-bold">
                      {day.status === 'completed' ? '100% ✅' : day.status === 'partial' ? 'Partial' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WHATSAPP & CRON AUTOMATION SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#11131c] border border-neutral-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp Cloud Notification Engine</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Switch between Green-API (WhatsApp Instance) or CallMeBot. When daily tasks are pending, automated reminders are delivered to your phone.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    const res = await fetch('/api/creator-ops/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        provider: fd.get('provider'),
                        whatsappPhone: fd.get('whatsappPhone'),
                        greenApiIdInstance: fd.get('greenApiIdInstance'),
                        greenApiApiToken: fd.get('greenApiApiToken'),
                        callmebotApiKey: fd.get('callmebotApiKey'),
                        startHourPKT: fd.get('startHourPKT'),
                        endHourPKT: fd.get('endHourPKT'),
                      }),
                    });
                    if (res.ok) {
                      setActionNotice({ type: 'success', message: 'WhatsApp configuration saved!' });
                      setTimeout(() => setActionNotice(null), 4000);
                    }
                  } catch (err) {}
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Provider</label>
                    <select
                      name="provider"
                      defaultValue={settings?.provider || 'greenapi'}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="greenapi">Green-API (Recommended for Pakistan)</option>
                      <option value="callmebot">CallMeBot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Recipient WhatsApp Phone Number</label>
                    <input
                      type="text"
                      name="whatsappPhone"
                      defaultValue={settings?.whatsappPhone || '923399336639'}
                      placeholder="e.g. 923121964939"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Green-API Specific Fields */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 block">Green-API Instance Credentials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">idInstance</label>
                      <input
                        type="text"
                        name="greenApiIdInstance"
                        defaultValue={settings?.greenApiIdInstance || ''}
                        placeholder="e.g. 1101823..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">apiTokenInstance</label>
                      <input
                        type="password"
                        name="greenApiApiToken"
                        defaultValue={settings?.greenApiApiToken || ''}
                        placeholder="e.g. d7b29a8f..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Reminder Start Hour (PKT)</label>
                    <input
                      type="number"
                      name="startHourPKT"
                      defaultValue={settings?.startHourPKT ?? 14}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">14 = 2:00 PM PKT</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Reminder End Hour (PKT)</label>
                    <input
                      type="number"
                      name="endHourPKT"
                      defaultValue={settings?.endHourPKT ?? 23}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">23 = 11:00 PM PKT</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSendReminderNow}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send Test WhatsApp Message</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>

              {/* External Cron Guide */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Automated Cron Setup (cron-job.org / Vercel Cron)</span>
                <p className="text-neutral-400 leading-relaxed">
                  Trigger reminders every hour using this webhook endpoint:
                </p>
                <div className="p-2.5 rounded-lg bg-neutral-900 font-mono text-[11px] text-cyan-300 overflow-x-auto select-all">
                  GET https://your-domain.vercel.app/api/cron/remind?token=creatorops_super_secret_cron_token_2025
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
