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
import { getScheduledTasksForDay, ScheduledTask, getWeeklyTargetBreakdown } from '@/lib/creator-ops/schedule';
import { SocialMetaPack } from '@/lib/creator-ops/meta-manager';

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
  const [providerType, setProviderType] = useState<'greenapi' | 'callmebot'>('greenapi');

  // Scheduled Tasks for Today
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Social Meta Manager State
  const [socialMeta, setSocialMeta] = useState<SocialMetaPack | null>(null);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [metaActivePlatform, setMetaActivePlatform] = useState<'youtube' | 'instagram' | 'tiktok' | 'facebook'>('youtube');

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

        // Detect active persona and scheduled tasks based on today's PKT day of week
        const now = new Date();
        const pktDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
        const currentDayIndex = pktDate.getDay();

        const tasksToday = getScheduledTasksForDay(currentDayIndex);
        setScheduledTasks(tasksToday);

        let active: Persona | undefined;
        if (tasksToday.length > 0) {
          active = personasData.personas.find((p: Persona) => p.name === tasksToday[0].personaSlug);
          setSelectedTaskId(tasksToday[0].id);
        }
        if (!active) {
          active = personasData.personas.find((p: Persona) => p.assignedDay === currentDayIndex);
        }
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

          // Auto-load Social Meta Pack
          loadSocialMeta(active.name, tasksToday[0]?.taskType || 'carousel');
        }
      }

      if (streakData.streak !== undefined) {
        setStreak(streakData.streak);
        setHistory(streakData.history || []);
      }

      if (gmailData.accounts) setGmailAccounts(gmailData.accounts);
      if (settingsData.settings) {
        setSettings(settingsData.settings);
        if (settingsData.settings.provider) {
          setProviderType(settingsData.settings.provider as any);
        }
      }
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
    loadSocialMeta(persona.name, 'carousel');
  };

  // Select Scheduled Task for Today
  const handleSelectScheduledTask = async (task: ScheduledTask) => {
    setSelectedTaskId(task.id);
    const target = personas.find((p) => p.name === task.personaSlug);
    if (target) {
      setActivePersona(target);
      setStudioPersonaId(target.id);
      try {
        const uploadRes = await fetch(`/api/creator-ops/uploads?personaId=${target.id}&date=${todayDateStr}`);
        const uploadData = await uploadRes.json();
        setCurrentUpload(uploadData.upload || null);

        const planRes = await fetch(`/api/creator-ops/plans?personaId=${target.id}&date=${todayDateStr}`);
        const planData = await planRes.json();
        setContentPlan(planData.plan || null);
      } catch (e) {}
    }
    loadSocialMeta(task.personaSlug, task.taskType);
  };

  // Load Social Meta Pack
  const loadSocialMeta = async (personaSlug: string, format: 'reel' | 'carousel' | 'stories', topic?: string) => {
    try {
      setIsGeneratingMeta(true);
      const res = await fetch('/api/creator-ops/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaSlug, format, topic }),
      });
      const data = await res.json();
      if (data.metaPack) {
        setSocialMeta(data.metaPack);
      }
    } catch (err) {
      console.warn('Error loading social meta:', err);
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  // Copy helpers
  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleCopyEntireMetaPack = () => {
    if (!socialMeta) return;
    const fullText = `=== CREATOROPS SOCIAL META PACK ===
Brand: ${socialMeta.personaSlug}
Format: ${socialMeta.format.toUpperCase()}
Topic: ${socialMeta.topic}
Best PKT Posting Times: ${socialMeta.bestPktTimes.join(' | ')}

--- 🔴 YOUTUBE SHORTS ---
Title: ${socialMeta.youtube.title}

Description:
${socialMeta.youtube.description}

Tags:
${socialMeta.youtube.tags.join(', ')}

Pinned Comment:
${socialMeta.youtube.pinnedComment}

--- 🟣 INSTAGRAM ---
Hook: ${socialMeta.instagram.firstLineHook}

Caption Body:
${socialMeta.instagram.captionBody}

${socialMeta.instagram.carouselSlidesMeta ? socialMeta.instagram.carouselSlidesMeta.map(s => `[Slide ${s.slideNumber}: ${s.heading}]\n${s.caption}`).join('\n\n') : ''}

CTA: ${socialMeta.instagram.callToAction}

Pinned Comment: ${socialMeta.instagram.pinnedComment}

Hashtags:
${socialMeta.instagram.hashtags.join(' ')}

--- 🎵 TIKTOK ---
Caption: ${socialMeta.tiktok.caption}
Sound: ${socialMeta.tiktok.recommendedSound}
Tags: ${socialMeta.tiktok.hashtags.join(' ')}

--- 🔵 FACEBOOK ---
Headline: ${socialMeta.facebook.postHeadline}
Discussion Prompt: ${socialMeta.facebook.discussionPrompt}

Full Text:
${socialMeta.facebook.fullText}

Tags: ${socialMeta.facebook.hashtags.join(' ')}
`;
    navigator.clipboard.writeText(fullText);
    setCopiedSection('entire_pack');
    setTimeout(() => setCopiedSection(null), 2500);
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
  const handleSendReminderNow = async (customPayload?: any) => {
    try {
      setActionNotice({ type: 'success', message: 'Sending test WhatsApp alert...' });
      const res = await fetch('/api/creator-ops/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customPayload || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setActionNotice({ type: 'success', message: '✅ WhatsApp reminder delivered to your phone!' });
      } else {
        setActionNotice({ type: 'error', message: data.error || 'Could not send WhatsApp message. Please check Tab 6 settings.' });
      }
    } catch (e: any) {
      setActionNotice({ type: 'error', message: e?.message || 'Failed to trigger reminder.' });
    }
    setTimeout(() => setActionNotice(null), 8000);
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
            {/* Today's Scheduled Content Tasks Queue (7-Day Timetable) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#11131c] via-[#141824] to-[#11131c] border border-cyan-500/20 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Today's Production Schedule</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold uppercase tracking-wider border border-cyan-500/30">
                        {DAYS_OF_WEEK[new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })).getDay()]} Tasks
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-emerald-400">30-60 Days Monetization Engine Active</span>
                </div>
              </div>

              {/* Task Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {scheduledTasks.map((task) => {
                  const isSelected = selectedTaskId === task.id || activePersona?.name === task.personaSlug;
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleSelectScheduledTask(task)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border-emerald-500/50 shadow-md shadow-emerald-500/10'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                              task.taskType === 'carousel'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {task.taskType === 'carousel' ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                            <span>{task.taskType === 'carousel' ? 'Carousel (4-5 Slides)' : 'Reel (60s)'}</span>
                          </span>

                          <span className="text-xs font-bold text-white font-mono">@{task.personaSlug}</span>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-black shadow-sm">
                            Active Task
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-100">{task.title}</h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">{task.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-[11px]">
                        <span className="text-cyan-300 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>Best Times: {task.recommendedPktTimes.join(' | ')}</span>
                        </span>
                        <span className="text-neutral-400 font-medium">Click to Load & Deploy ⚡</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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

            {/* ⚡ SOCIAL META MANAGER: HIGH-CTR & MONETIZATION PACK */}
            <div className="p-6 rounded-2xl bg-[#11131c] border border-cyan-500/30 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Social Meta Manager • 30-60 Days Earning Acceleration</span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Ready-to-Publish Multi-Platform Meta Pack</span>
                    {activePersona && (
                      <span className="text-xs font-mono font-normal text-cyan-400 px-2.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
                        @{activePersona.name}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Never repost duplicate captions. Each platform has tailored SEO tags, engagement-velocity questions, and peak PKT upload slots.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (activePersona) {
                        loadSocialMeta(activePersona.name, 'carousel');
                      }
                    }}
                    disabled={isGeneratingMeta}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition border border-neutral-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isGeneratingMeta ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingMeta ? 'Generating...' : 'Regenerate Meta'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEntireMetaPack}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSection === 'entire_pack' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>All Meta Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy All 4 Channels Pack</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Meta Platform Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setMetaActivePlatform('youtube')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    metaActivePlatform === 'youtube'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <YouTubeIcon className="w-4 h-4" />
                  <span>YouTube Shorts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetaActivePlatform('instagram')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    metaActivePlatform === 'instagram'
                      ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram (Reels & Carousels)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetaActivePlatform('tiktok')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    metaActivePlatform === 'tiktok'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <TikTokIcon className="w-4 h-4" />
                  <span>TikTok</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetaActivePlatform('facebook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    metaActivePlatform === 'facebook'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <FacebookIcon className="w-4 h-4" />
                  <span>Facebook Reels & Posts</span>
                </button>
              </div>

              {/* Active Platform Content Card */}
              {socialMeta ? (
                <div className="space-y-4">
                  {/* YOUTUBE SHORTS PANEL */}
                  {metaActivePlatform === 'youtube' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                        <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          <span>Optimal PKT Upload Window:</span>
                          <strong className="text-white">{socialMeta.bestPktTimes.join(' or ')}</strong>
                        </span>
                        <span className="text-[11px] text-red-400 font-semibold">Max Reach Algorithm Slot</span>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">High-CTR Title (&lt;70 chars)</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(socialMeta.youtube.title, 'yt_title')}
                            className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'yt_title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'yt_title' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-white font-medium select-all">
                          {socialMeta.youtube.title}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">SEO-Rich Description &amp; Hashtags</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(socialMeta.youtube.description, 'yt_desc')}
                            className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'yt_desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'yt_desc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-neutral-900 text-xs text-neutral-300 font-sans whitespace-pre-wrap select-all leading-relaxed">
                          {socialMeta.youtube.description}
                        </pre>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-300">YouTube Search Tags</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(socialMeta.youtube.tags.join(', '), 'yt_tags')}
                              className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSection === 'yt_tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSection === 'yt_tags' ? 'Copied' : 'Copy Tags'}</span>
                            </button>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-900 text-[11px] text-cyan-300 font-mono select-all">
                            {socialMeta.youtube.tags.join(', ')}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-300">Pinned Comment (Reply Accelerator)</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(socialMeta.youtube.pinnedComment, 'yt_comment')}
                              className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSection === 'yt_comment' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSection === 'yt_comment' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-amber-300 italic select-all">
                            {socialMeta.youtube.pinnedComment}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INSTAGRAM PANEL */}
                  {metaActivePlatform === 'instagram' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-pink-400">First-Line Scroll Stopper Hook</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(socialMeta.instagram.firstLineHook, 'ig_hook')}
                            className="text-xs text-neutral-400 hover:text-pink-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'ig_hook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'ig_hook' ? 'Copied' : 'Copy Hook'}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-white font-semibold select-all">
                          {socialMeta.instagram.firstLineHook}
                        </div>
                      </div>

                      {/* Carousel Slides Breakdown if available */}
                      {socialMeta.instagram.carouselSlidesMeta && socialMeta.instagram.carouselSlidesMeta.length > 0 && (
                        <div className="p-4 rounded-xl bg-neutral-950 border border-purple-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-300">5-Slide Carousel Copy Breakdown (Friday Special)</span>
                            <button
                              type="button"
                              onClick={() => {
                                const slidesText = socialMeta.instagram.carouselSlidesMeta!
                                  .map((s) => `[Slide ${s.slideNumber}: ${s.heading}]\n${s.caption}`)
                                  .join('\n\n');
                                handleCopyText(slidesText, 'ig_slides');
                              }}
                              className="text-xs text-neutral-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSection === 'ig_slides' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSection === 'ig_slides' ? 'Copied' : 'Copy All Slides'}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                            {socialMeta.instagram.carouselSlidesMeta.map((slide) => (
                              <div key={slide.slideNumber} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] space-y-1">
                                <span className="font-bold text-purple-400 block">Slide {slide.slideNumber}</span>
                                <strong className="text-white block text-[11px]">{slide.heading}</strong>
                                <p className="text-neutral-300 text-[10px] leading-relaxed line-clamp-3">{slide.caption}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">Storytelling Caption Body &amp; Call To Action</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`${socialMeta.instagram.captionBody}\n\n${socialMeta.instagram.callToAction}`, 'ig_body')}
                            className="text-xs text-neutral-400 hover:text-pink-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'ig_body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'ig_body' ? 'Copied' : 'Copy Caption'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-neutral-900 text-xs text-neutral-300 font-sans whitespace-pre-wrap select-all leading-relaxed">
                          {socialMeta.instagram.captionBody}
                          {'\n\n'}
                          <span className="text-pink-300 font-medium">{socialMeta.instagram.callToAction}</span>
                        </pre>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">25-30 Tiered Algorithm Hashtags</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(socialMeta.instagram.hashtags.join(' '), 'ig_hashtags')}
                            className="text-xs text-neutral-400 hover:text-pink-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'ig_hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'ig_hashtags' ? 'Copied' : 'Copy Hashtags'}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-[11px] text-cyan-300 font-mono select-all leading-relaxed">
                          {socialMeta.instagram.hashtags.join(' ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TIKTOK PANEL */}
                  {metaActivePlatform === 'tiktok' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-400">TikTok Short Caption (&lt;140 chars)</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`${socialMeta.tiktok.caption} ${socialMeta.tiktok.hashtags.join(' ')}`, 'tt_caption')}
                            className="text-xs text-neutral-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'tt_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'tt_caption' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-white font-medium select-all">
                          {socialMeta.tiktok.caption} <span className="text-cyan-400">{socialMeta.tiktok.hashtags.join(' ')}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <span className="text-xs font-bold text-neutral-300">Recommended Audio / Sound Vibe</span>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-pink-300 font-mono flex items-center gap-2">
                          <Music className="w-4 h-4 text-pink-400" />
                          <span>{socialMeta.tiktok.recommendedSound}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FACEBOOK PANEL */}
                  {metaActivePlatform === 'facebook' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-neutral-950 border border-blue-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">High-Engagement Discussion Question (Comment Velocity Payout Booster)</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(socialMeta.facebook.discussionPrompt, 'fb_prompt')}
                            className="text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'fb_prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'fb_prompt' ? 'Copied' : 'Copy Question'}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-neutral-900 text-xs text-white font-semibold select-all">
                          "{socialMeta.facebook.discussionPrompt}"
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">Facebook Full Post Text &amp; Tags</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`${socialMeta.facebook.postHeadline}\n\n${socialMeta.facebook.fullText}\n\n${socialMeta.facebook.hashtags.join(' ')}`, 'fb_full')}
                            className="text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === 'fb_full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'fb_full' ? 'Copied' : 'Copy Post'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-neutral-900 text-xs text-neutral-300 font-sans whitespace-pre-wrap select-all leading-relaxed">
                          <strong>{socialMeta.facebook.postHeadline}</strong>
                          {'\n\n'}
                          {socialMeta.facebook.fullText}
                          {'\n\n'}
                          <span className="text-blue-400">{socialMeta.facebook.hashtags.join(' ')}</span>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Monetization Pro Tips Banner */}
                  {socialMeta.monetizationTips && socialMeta.monetizationTips.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="font-bold block text-emerald-200">30-60 Days Monetization Pro Tip:</strong>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          {socialMeta.monetizationTips.join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-neutral-400">Generating tailored social meta pack for today's mission...</p>
                </div>
              )}
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

            {/* 30-60 DAYS MONETIZATION QUOTA & TARGET TRACKER */}
            <div className="p-6 rounded-2xl bg-[#11131c] border border-amber-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>30 to 60 Days Monetization Quota Matrix</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
                      Weekly Targets
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Consistent weekly volume required to qualify for YouTube Shorts Monetization, Instagram Gifts/Bonuses, and TikTok Creator Rewards.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <span>🎯 Minimum Cadence: 10-12 Posts / Week</span>
                </div>
              </div>

              {/* 4 Personas Quota Progress Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {personas.map((p) => {
                  return (
                    <div key={p.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono truncate max-w-[130px]">
                          @{p.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold">
                          {p.assignedDay !== null ? DAYS_OF_WEEK[p.assignedDay] : 'Flex'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Reels Target:</span>
                          <strong className="text-emerald-400 font-mono">{p.weeklyReelsTarget || 3} / week</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Carousel Post:</span>
                          <strong className="text-purple-400 font-mono">1 / week (4-5 slides)</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Daily Stories:</span>
                          <strong className="text-cyan-400 font-mono">{p.dailyStoriesTarget || 5} / day</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500">Monetization Status</span>
                        <span className="text-emerald-400 font-bold">On Track 🔥</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                const tasksForDay = getScheduledTasksForDay(idx);
                const isToday = new Date().getDay() === idx;

                return (
                  <div
                    key={dayName}
                    className={`p-4 rounded-2xl border min-h-[180px] flex flex-col justify-between ${
                      isToday
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#11131c] border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">{dayName}</span>
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Today
                          </span>
                        )}
                      </div>

                      {tasksForDay.length > 0 ? (
                        <div className="space-y-1.5">
                          {tasksForDay.map((task) => (
                            <div key={task.id} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] text-white truncate max-w-[85px]">{task.personaName}</span>
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    task.taskType === 'carousel'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {task.taskType}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 line-clamp-1">{task.title}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-500 italic mt-4">Flex Planning</div>
                      )}
                    </div>

                    <div className="text-[10px] text-cyan-400 font-mono pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      <span>{tasksForDay.length} Post{tasksForDay.length > 1 ? 's' : ''}</span>
                      <span className="text-neutral-500">Scheduled</span>
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
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Provider Engine</label>
                    <select
                      name="provider"
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="greenapi">Green-API (Dedicated WhatsApp Web Instance)</option>
                      <option value="callmebot">CallMeBot (Free & Instant Setup via WhatsApp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Recipient WhatsApp Phone Number</label>
                    <input
                      type="text"
                      name="whatsappPhone"
                      defaultValue={settings?.whatsappPhone || '923399336639'}
                      placeholder="e.g. 923399336639 (Country code + number, no +)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Bina '+' ke country code ke sath likhein (e.g. 923121234567)</span>
                  </div>
                </div>

                {/* Conditional Provider Fields */}
                {providerType === 'greenapi' ? (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 block">Green-API Instance Credentials</span>
                      <a
                        href="https://green-api.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline"
                      >
                        green-api.com ↗
                      </a>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Green-API console se instance create karein aur phone se QR code scan karein. Yaad rahe: <span className="text-white font-mono">idInstance</span> (10-12 numbers) aur <span className="text-white font-mono">apiTokenInstance</span> (50-character alphanumeric token) alag alag hotay hain!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">idInstance (Numeric)</label>
                        <input
                          type="text"
                          name="greenApiIdInstance"
                          defaultValue={settings?.greenApiIdInstance || ''}
                          placeholder="e.g. 7107227374"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">apiTokenInstance (50-char hex token)</label>
                        <input
                          type="text"
                          name="greenApiApiToken"
                          defaultValue={settings?.greenApiApiToken || ''}
                          placeholder="e.g. d7b29a8f4c5e... (Console se copy karein)"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-cyan-500/20 space-y-3">
                    <span className="text-xs font-bold text-cyan-400 block">CallMeBot Free WhatsApp API Key</span>
                    <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                      <p className="font-semibold text-cyan-300">⚡ 10 Seconds Free Activation:</p>
                      <p>1. Apne WhatsApp se is number ko message karein: <span className="text-white font-mono bg-neutral-900 px-1.5 py-0.5 rounded select-all">+34 941 080 523</span></p>
                      <p>2. Message text yeh likhein: <span className="text-white font-mono bg-neutral-900 px-1.5 py-0.5 rounded select-all">I allow callmebot to send me messages</span></p>
                      <p>3. CallMeBot reply mein aapko API Key send kar dega. Woh key neeche paste karein!</p>
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">CallMeBot API Key</label>
                      <input
                        type="text"
                        name="callmebotApiKey"
                        defaultValue={settings?.callmebotApiKey || ''}
                        placeholder="e.g. 1234567"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Reminder Start Hour (PKT)</label>
                    <input
                      type="number"
                      name="startHourPKT"
                      defaultValue={settings?.startHourPKT ?? 14}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">14 = 2:00 PM PKT (Reminders start)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Reminder End Hour (PKT)</label>
                    <input
                      type="number"
                      name="endHourPKT"
                      defaultValue={settings?.endHourPKT ?? 23}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">23 = 11:00 PM PKT (Reminders end)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      const form = (e.currentTarget as HTMLButtonElement).closest('form');
                      if (form) {
                        const fd = new FormData(form);
                        handleSendReminderNow({
                          provider: fd.get('provider') || providerType,
                          phone: fd.get('whatsappPhone'),
                          greenApiIdInstance: fd.get('greenApiIdInstance'),
                          greenApiApiToken: fd.get('greenApiApiToken'),
                          callmebotApiKey: fd.get('callmebotApiKey'),
                        });
                      } else {
                        handleSendReminderNow();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition border border-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send Test WhatsApp Message</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Settings</span>
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
