'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { ApiKeyModal } from '../../components/ApiKeyModal';
import { storageService } from '../../services/storageService';
import { aiGenerator } from '../../services/aiGenerator';
import { 
  CreatorProfile, WeeklyPlan, CreatorArchetype, ContentType, 
  VideoFormatMode, AspectRatio, VideoDuration, ContentLanguage, PerformanceLog, ProductionMode, DramaCharacter 
} from '../../types';
import { 
  Sparkles, Film, Copy, Check, Download, Video, MessageSquare, 
  Eye, Music, Share2, UploadCloud, Mic, Clock, 
  Plus, Zap, Monitor, Smartphone, Square, RefreshCw, Globe, Trash2, Smile, Activity, BarChart3, TrendingUp, ShieldCheck, FastForward, Clapperboard, Users, User, Flame, UserCheck 
} from 'lucide-react';

export default function StudioPage() {
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<CreatorProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreationForm, setShowCreationForm] = useState(true);

  // Production Mode (Standalone Daily vs Episodic Season Drama)
  const [productionMode, setProductionMode] = useState<ProductionMode>('standalone_daily');

  // Drama Cast Ensemble State (Hero, Villain, Supporting Ally)
  const [heroName, setHeroName] = useState('Leo');
  const [villainName, setVillainName] = useState('Marcus');
  const [supportingName, setSupportingName] = useState('Ayla');
  const [seasonPremise, setSeasonPremise] = useState('');

  // Quota & Rate Limit State
  const [quota, setQuota] = useState<{ allowed: boolean; remaining: number; totalDailyLimit: number; isByok: boolean }>({
    allowed: true,
    remaining: 3,
    totalDailyLimit: 3,
    isByok: false,
  });

  // 24h Feedback & Performance Log State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<'viral' | 'good' | 'flop'>('good');
  const [feedbackDiagnosis, setFeedbackDiagnosis] = useState<'hook_issue' | 'seo_distribution_issue' | 'cta_engagement_issue' | 'viral_winner'>('hook_issue');
  const [feedbackViews, setFeedbackViews] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState(false);

  // Re-roll modal/inline state
  const [reRollingSceneNum, setReRollingSceneNum] = useState<number | null>(null);
  const [customReRollPrompt, setCustomReRollPrompt] = useState('');
  const [isReRolling, setIsReRolling] = useState(false);

  // Form Inputs
  const [nicheInput, setNicheInput] = useState('');
  const [archetype, setArchetype] = useState<CreatorArchetype>('talking_object');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [formatMode, setFormatMode] = useState<VideoFormatMode>('podcast_fixed');
  const [duration, setDuration] = useState<VideoDuration>('30s');
  const [language, setLanguage] = useState<ContentLanguage>('english_global');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [hasRefImage, setHasRefImage] = useState(false);

  // Modals
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  useEffect(() => {
    // Purge any legacy presets from browser localStorage
    if (typeof window !== 'undefined') {
      const rawPlan = localStorage.getItem('flowcreator_current_plan');
      if (rawPlan && (rawPlan.includes('sample_plan') || rawPlan.includes('preset_') || rawPlan.includes('The "Always Available" Trap'))) {
        localStorage.removeItem('flowcreator_current_plan');
      }
      const rawProfiles = localStorage.getItem('flowcreator_profiles');
      if (rawProfiles && (rawProfiles.includes('preset_') || rawProfiles.includes('Grumpy Coffee Mug') || rawProfiles.includes('Dark Mindset'))) {
        localStorage.removeItem('flowcreator_profiles');
      }
    }

    const p = storageService.getProfiles();
    setProfiles(p);
    const active = storageService.getActiveProfile();
    setActiveProfile(active);

    const storedKey = storageService.getApiKey();
    setApiKey(storedKey);

    const q = storageService.checkGenerationQuota();
    setQuota(q);

    const plan = storageService.getCurrentPlan();
    setCurrentPlan(plan);
    setShowCreationForm(!plan);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearPlan = () => {
    if (confirm('Are you sure you want to clear current plan and start fresh?')) {
      storageService.clearCurrentPlan();
      setCurrentPlan(null);
      setShowCreationForm(true);
    }
  };

  const handleQuickPreset = (topic: string, arch: CreatorArchetype, mode: VideoFormatMode, lang: ContentLanguage = 'english_global') => {
    setNicheInput(topic);
    setArchetype(arch);
    setFormatMode(mode);
    setLanguage(lang);
    setAspectRatio('9:16');
  };

  const DRAMA_PRESETS = [
    {
      genre: '🏢 Corporate Revenge (Silicon Valley)',
      premise: 'A junior AI engineer exposes a $50B corporate algorithm theft inside a corrupt Silicon Valley boardroom',
      hero: 'Leo (Junior Dev)',
      villain: 'Marcus (Corrupt CEO)',
      ally: 'Ayla (Cyber Analyst)',
      arch: 'human_influencer' as CreatorArchetype,
      lang: 'english_global' as ContentLanguage,
    },
    {
      genre: '🕵️ Cyberpunk Neural Heist (Sci-Fi)',
      premise: 'An underground neural hacker discovers a megacorp is secretly erasing memories of rogue AI artists',
      hero: 'Jax (Neural Runner)',
      villain: 'Victor Vance (Corp Chief)',
      ally: 'Kora (Tech Broker)',
      arch: 'human_influencer' as CreatorArchetype,
      lang: 'english_global' as ContentLanguage,
    },
    {
      genre: '🇵🇰 Desi Startup Badla (Roman Urdu)',
      premise: 'Raat ke 2 baje founding investor ne secret patent chori kiya aur junior developer ne live broadcast kardia',
      hero: 'Bilal (Hero Developer)',
      villain: 'Dawood (Boss Villain)',
      ally: 'Zara (Office Hacker)',
      arch: 'human_influencer' as CreatorArchetype,
      lang: 'roman_urdu_hindi' as ContentLanguage,
    },
    {
      genre: '🥑 Mug vs Energy Drink (Comedy Duo)',
      premise: 'Bob the sarcastic coffee mug and Marcus the hyperactive energy drink battle over office wellness culture',
      hero: 'Bob (Caffeine Mug)',
      villain: 'Marcus (Energy Drink)',
      ally: 'Leo (Healthy Avocado)',
      arch: 'talking_object' as CreatorArchetype,
      lang: 'english_global' as ContentLanguage,
    },
    {
      genre: '♟️ Dark Billionaire Frame Control (Noir)',
      premise: 'A reclusive billionaire prodigy uses psychological silence to dismantle an aggressive hostile takeover',
      hero: 'Julian (Silent Prodigy)',
      villain: 'Sterling (Hostile Raider)',
      ally: 'Elena (Secret Auditor)',
      arch: 'faceless_niche' as CreatorArchetype,
      lang: 'english_global' as ContentLanguage,
    },
  ];

  const [surpriseIndex, setSurpriseIndex] = useState(0);

  const handleShuffleDramaPreset = () => {
    const nextIdx = (surpriseIndex + 1) % DRAMA_PRESETS.length;
    setSurpriseIndex(nextIdx);
    const item = DRAMA_PRESETS[nextIdx];
    handleQuickDramaPreset(
      item.premise,
      item.hero,
      item.villain,
      item.ally,
      item.arch,
      item.lang
    );
  };

  const handleQuickDramaPreset = (premise: string, hero: string, villain: string, ally: string, arch: CreatorArchetype, lang: ContentLanguage = 'english_global') => {
    setSeasonPremise(premise);
    setHeroName(hero);
    setVillainName(villain);
    setSupportingName(ally);
    setNicheInput(premise);
    setArchetype(arch);
    setLanguage(lang);
  };

  const handleExportMarkdown = (plan: WeeklyPlan) => {
    const isDrama = plan.productionMode === 'episodic_season';
    let md = `# FlowCreator OS - ${isDrama ? `${plan.seasonTitle || 'AI Drama Season 1'} (7 Episodes)` : `7-Day Content Plan for ${plan.profileName}`}\n`;
    md += `Mode: ${plan.productionMode || 'standalone_daily'} | Format: ${plan.videoFormatMode} | Duration: ${plan.videoDuration || '30s'} | Language: ${plan.language || 'english_global'}\n\n---\n\n`;

    plan.days.forEach((d) => {
      md += `## Day ${d.dayNumber} (${d.dayName}): ${isDrama ? `Episode ${d.episodeNumber}: ${d.title}` : d.title}\n`;
      md += `**Emotion:** ${d.emotionalTrigger?.icon || '🎭'} ${d.emotionalTrigger?.label || d.angleArchetype} | **Score:** ${d.viralScore}%\n`;
      if (d.cliffhangerHook) {
        md += `**⚡ Cliffhanger Hook:** ${d.cliffhangerHook}\n`;
      }
      md += `\n### Master Keyframe / Multi-Character Prompt:\n\`${d.masterKeyframePrompt}\`\n\n`;
      md += `### Google Flow 10s Scenes (Directing Blueprint):\n`;
      d.scenes.forEach((s) => {
        md += `#### Scene ${s.sceneNumber} (${s.duration}) - ${s.phase}\n`;
        if (s.speaker) {
          md += `- **Active Speaker:** ${s.speaker} (${s.speakerRole || 'Speaker'})\n`;
        }
        if (s.listenerReaction) {
          md += `- **Listener Reaction:** ${s.listenerReaction}\n`;
        }
        md += `- **Visual Motion:** ${s.visualPrompt}\n`;
        md += `- **Face & Expression:** ${s.facialExpression || 'N/A'}\n`;
        md += `- **Body Language:** ${s.bodyLanguage || 'N/A'}\n`;
        md += `- **Eye-Contact Cue:** ${s.eyeContactCue || 'N/A'}\n`;
        md += `- **Dialogue:** "${s.dialogue}"\n\n`;
      });
      md += `### BGM Prompt:\n\`${d.bgmPrompt}\`\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowCreator_${(plan.seasonTitle || plan.profileName).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = productionMode === 'episodic_season' ? seasonPremise : nicheInput;
    if (!topic.trim()) {
      alert('Please enter your topic / story premise or click one of the inspiration chips.');
      return;
    }

    // Rate Limit Check
    const currentQuota = storageService.checkGenerationQuota();
    if (!currentQuota.allowed) {
      setIsApiKeyOpen(true);
      alert('⚡ Daily Free Limit Reached (3/3 Plans). Please enter your free Gemini API Key to enjoy Unlimited Generations!');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedName = productionMode === 'episodic_season'
        ? `${heroName} vs ${villainName} (Season 1)`
        : nicheInput.split(' ').slice(0, 4).join(' ') + (archetype === 'talking_object' ? ' (Object)' : ' Studio');

      const castEnsemble: DramaCharacter[] = productionMode === 'episodic_season'
        ? [
            {
              id: 'char_hero',
              name: heroName.trim() || 'Leo',
              role: 'protagonist',
              roleLabel: 'Protagonist / Hero',
              visualAnchor: `Screen-Left: ${heroName.trim()} in navy hoodie with sharp determined focus`,
              color: '#26D9E6',
            },
            {
              id: 'char_villain',
              name: villainName.trim() || 'Marcus',
              role: 'antagonist',
              roleLabel: 'Antagonist / Villain',
              visualAnchor: `Screen-Right: ${villainName.trim()} in charcoal suit with cold cynical smirk`,
              color: '#FF4D6D',
            },
            {
              id: 'char_supporting',
              name: supportingName.trim() || 'Ayla',
              role: 'supporting',
              roleLabel: 'Supporting Ally / Insider',
              visualAnchor: `Screen-Center: ${supportingName.trim()} in dark blazer with holographic tablet`,
              color: '#D84DFF',
            },
          ]
        : [];

      const newProfile: CreatorProfile = {
        id: `profile_${Date.now()}`,
        name: generatedName,
        productionMode,
        seasonNumber: 1,
        seasonTitle: productionMode === 'episodic_season' ? `${topic.split(' ').slice(0, 4).join(' ')}: Season 1` : undefined,
        seasonSynopsis: topic,
        castEnsemble,
        archetype,
        contentType,
        videoFormatMode: formatMode,
        videoDuration: duration,
        language,
        hasReferenceImage: hasRefImage,
        niche: topic,
        objectName: archetype === 'talking_object' ? 'Ceramic Coffee Mug' : undefined,
        objectMetaphor: archetype === 'talking_object' ? 'Burned-out corporate philosopher' : undefined,
        characterDna: archetype === 'talking_object' ? 'A photorealistic navy-blue ceramic coffee mug with 3D expressive facial rigging' : archetype === 'human_influencer' ? 'Ayla Khan, 24yo South-Asian tech & lifestyle creator in aesthetic studio' : 'Cinematic noir silhouette and statues with obsidian lighting',
        aspectRatio,
        visualStyle: 'Cinematic 8k photorealistic hyper-detailed',
        tone: productionMode === 'episodic_season' ? 'High-tension suspense drama with cliffhangers' : (archetype === 'talking_object' ? 'Sarcastic & relatable' : 'Inspiring & authoritative'),
        targetAudience: 'Reels & TikTok viewers seeking binge-worthy content',
        createdAt: Date.now(),
      };

      storageService.saveProfile(newProfile);
      setProfiles(storageService.getProfiles());
      setActiveProfile(newProfile);

      const vault = storageService.getVaultItems();
      const logs = storageService.getPerformanceLogs();

      const newPlan = await aiGenerator.generateWeeklyPlan(newProfile, apiKey, vault, logs);
      newPlan.videoDuration = duration;
      newPlan.language = language;
      newPlan.hasReferenceImage = hasRefImage;
      setCurrentPlan(newPlan);
      storageService.saveCurrentPlan(newPlan);

      // Increment quota if on free tier
      if (!currentQuota.isByok) {
        storageService.incrementDailyGenerationsCount();
      }
      setQuota(storageService.checkGenerationQuota());

      setSelectedDayNum(1);
      setShowCreationForm(false);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Generate Next Season / Series Continuation
  const handleGenerateNextWeekOrSeason = async () => {
    if (!currentPlan) return;
    const currentQuota = storageService.checkGenerationQuota();
    if (!currentQuota.allowed) {
      setIsApiKeyOpen(true);
      alert('⚡ Daily Free Limit Reached (3/3 Plans). Please enter your free Gemini API Key for Unlimited Generations!');
      return;
    }

    setIsGenerating(true);
    try {
      const isDrama = currentPlan.productionMode === 'episodic_season';
      const nextSeasonNum = (currentPlan.seasonNumber || 1) + 1;

      const profileToUse = activeProfile || {
        id: currentPlan.profileId,
        name: isDrama ? `${currentPlan.profileName.split('(')[0].trim()} (Season ${nextSeasonNum})` : currentPlan.profileName,
        productionMode: currentPlan.productionMode,
        seasonNumber: nextSeasonNum,
        seasonTitle: isDrama ? `${currentPlan.seasonTitle?.split('(')[0].trim()} (Season ${nextSeasonNum})` : undefined,
        seasonSynopsis: currentPlan.seasonSynopsis,
        castEnsemble: currentPlan.castEnsemble,
        archetype: currentPlan.archetype,
        contentType: currentPlan.contentType,
        videoFormatMode: currentPlan.videoFormatMode,
        videoDuration: currentPlan.videoDuration,
        language: currentPlan.language,
        hasReferenceImage: currentPlan.hasReferenceImage,
        niche: currentPlan.niche,
        characterDna: currentPlan.archetype === 'talking_object' ? 'A photorealistic ceramic coffee mug with 3D expressions' : 'Aesthetic creator in studio',
        aspectRatio: '9:16',
        visualStyle: 'Cinematic 8k',
        tone: isDrama ? 'High-tension suspense drama' : 'Authentic & viral',
        targetAudience: 'Short-form viewers',
        createdAt: Date.now(),
      };

      const vault = storageService.getVaultItems();
      const logs = storageService.getPerformanceLogs();

      const nextPlan = await aiGenerator.generateWeeklyPlan(profileToUse, apiKey, vault, logs);
      nextPlan.videoDuration = currentPlan.videoDuration;
      nextPlan.language = currentPlan.language;
      nextPlan.hasReferenceImage = currentPlan.hasReferenceImage;
      setCurrentPlan(nextPlan);
      storageService.saveCurrentPlan(nextPlan);

      if (!currentQuota.isByok) {
        storageService.incrementDailyGenerationsCount();
      }
      setQuota(storageService.checkGenerationQuota());
      setSelectedDayNum(1);
    } catch (err: any) {
      alert(`Next batch generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Live in-place edit updates
  const handleUpdateMasterFramePrompt = (text: string) => {
    if (!currentPlan) return;
    const updatedDays = currentPlan.days.map((d) => {
      if (d.dayNumber === selectedDayNum) {
        return { ...d, masterKeyframePrompt: text };
      }
      return d;
    });
    const updatedPlan = { ...currentPlan, days: updatedDays };
    setCurrentPlan(updatedPlan);
    storageService.saveCurrentPlan(updatedPlan);
  };

  const handleUpdateScene = (
    sceneNum: number, 
    field: 'visualPrompt' | 'dialogue' | 'actingDirection' | 'facialExpression' | 'bodyLanguage' | 'eyeContactCue', 
    text: string
  ) => {
    if (!currentPlan) return;
    const updatedDays = currentPlan.days.map((d) => {
      if (d.dayNumber === selectedDayNum) {
        const updatedScenes = d.scenes.map((s) => {
          if (s.sceneNumber === sceneNum) {
            return { ...s, [field]: text };
          }
          return s;
        });
        return { ...d, scenes: updatedScenes };
      }
      return d;
    });
    const updatedPlan = { ...currentPlan, days: updatedDays };
    setCurrentPlan(updatedPlan);
    storageService.saveCurrentPlan(updatedPlan);
  };

  // Re-roll single scene
  const handleExecuteReRoll = async (sceneNum: number) => {
    if (!currentPlan) return;
    const activeDay = currentPlan.days.find((d) => d.dayNumber === selectedDayNum);
    if (!activeDay) return;

    setIsReRolling(true);
    try {
      const reRolled = await aiGenerator.reRollScene(activeDay, sceneNum, customReRollPrompt);
      const updatedDays = currentPlan.days.map((d) => {
        if (d.dayNumber === selectedDayNum) {
          const updatedScenes = d.scenes.map((s) => (s.sceneNumber === sceneNum ? reRolled : s));
          return { ...d, scenes: updatedScenes };
        }
        return d;
      });
      const updatedPlan = { ...currentPlan, days: updatedDays };
      setCurrentPlan(updatedPlan);
      storageService.saveCurrentPlan(updatedPlan);
      setReRollingSceneNum(null);
      setCustomReRollPrompt('');
    } catch (err: any) {
      alert(`Re-roll failed: ${err.message}`);
    } finally {
      setIsReRolling(false);
    }
  };

  // Save 24h Performance Log & Train AI
  const handleSavePerformanceFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan || !selectedDayContent) return;

    const newLog: PerformanceLog = {
      id: `log_${Date.now()}`,
      planId: currentPlan.id,
      videoTitle: selectedDayContent.title,
      dayNumber: selectedDayContent.dayNumber,
      emotionalTrigger: selectedDayContent.emotionalTrigger?.label || selectedDayContent.angleArchetype,
      result: feedbackResult,
      viewsCount: feedbackViews.trim() || undefined,
      userNotes: feedbackNotes.trim() || undefined,
      keyLearnings: feedbackNotes.trim() || (feedbackResult === 'viral' ? 'High retention opening hook' : 'Need stronger curiosity gap in first 2.5s'),
      diagnostic: {
        dropOffDiagnosis: feedbackResult === 'viral' ? 'viral_winner' : feedbackDiagnosis,
        consecutiveTestsCount: 1,
        aiGrowthRecommendation: feedbackResult === 'viral' 
          ? 'Replicate this tone & emotional angle in future batches' 
          : 'Tighten Scene 1 hook pacing and sharpen visual contrast',
      },
      createdAt: Date.now(),
    };

    storageService.addPerformanceLog(newLog);
    setFeedbackSuccessMsg(true);
    setTimeout(() => {
      setFeedbackSuccessMsg(false);
      setShowFeedbackModal(false);
      setFeedbackNotes('');
      setFeedbackViews('');
    }, 1500);
  };

  const getFormattedDateForDay = (dayIndex: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dayIndex);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const selectedDayContent = currentPlan?.days.find((d) => d.dayNumber === selectedDayNum) || currentPlan?.days[0];
  const isDramaMode = currentPlan?.productionMode === 'episodic_season';

  return (
    <div className="min-h-screen bg-[#050816] text-[#F5F7FA] selection:bg-[#26D9E6] selection:text-[#050816]">
      {/* Navbar */}
      <Navbar
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={(id) => {
          storageService.setActiveProfileId(id);
          const found = profiles.find((p) => p.id === id) || null;
          setActiveProfile(found);
        }}
        onOpenNewProfileModal={() => setShowCreationForm(true)}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenVaultModal={() => { window.location.href = '/dashboard'; }}
        onOpenFlywheelModal={() => { window.location.href = '/dashboard'; }}
        onGeneratePlan={() => setShowCreationForm(true)}
        isGenerating={isGenerating}
        hasApiKey={!!apiKey}
        vaultCount={0}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* STATE 1: CREATOR INPUT FORM */}
        {showCreationForm || !currentPlan ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-cyan-950/80 bg-[#080d26]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-950/80 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#26D9E6]/30 bg-[#26D9E6]/10 px-3 py-0.5 text-xs font-semibold text-[#26D9E6]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Video Director Studio</span>
                </div>
                <h1 className="text-2xl font-black text-white sm:text-3xl">
                  {productionMode === 'episodic_season' ? 'Direct 7-Episode AI Drama' : 'Generate 7-Day Plan'}
                </h1>
              </div>

              {/* Quota Indicator Pill */}
              <div>
                {quota.isByok ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#26D9E6]/40 bg-[#26D9E6]/10 px-3 py-1 text-xs font-bold text-[#26D9E6]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Unlimited BYOK
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsApiKeyOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer transition-all"
                    title="Click to enter free Gemini Key for Unlimited"
                  >
                    <span>⚡ {quota.remaining}/{quota.totalDailyLimit} Free Daily Plans</span>
                    <span className="text-[10px] text-amber-400 underline">(Unlimited)</span>
                  </button>
                )}
              </div>
            </div>

            {/* TOP PRODUCTION MODE SWITCHER: Standalone Reels vs Drama Seasons */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Clapperboard className="h-4 w-4 text-[#9B4DFF]" /> Choose Production Format:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProductionMode('standalone_daily')}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    productionMode === 'standalone_daily'
                      ? 'border-[#26D9E6] bg-[#0c153b] text-white ring-1 ring-[#26D9E6]'
                      : 'border-cyan-950 bg-black/40 text-zinc-400 hover:bg-[#0c1438]'
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-[#26D9E6] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">📱 Standalone Reels</div>
                    <div className="text-[10px] text-zinc-400">7 Independent Daily Viral Videos</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProductionMode('episodic_season')}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    productionMode === 'episodic_season'
                      ? 'border-[#D84DFF] bg-[#0c153b] text-white ring-1 ring-[#D84DFF]'
                      : 'border-cyan-950 bg-black/40 text-zinc-400 hover:bg-[#0c1438]'
                  }`}
                >
                  <Film className="h-5 w-5 text-[#D84DFF] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">🎬 AI Drama & Seasons</div>
                    <div className="text-[10px] text-zinc-400">7-Episode Story Arc with Cliffhangers</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-[#26D9E6]" /> Quick 1-Click Inspirations:
              </span>
              
              {productionMode === 'standalone_daily' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Sarcastic coffee mug roasting 9-to-5 corporate burnout and urgent weekend emails',
                        'talking_object',
                        'podcast_fixed',
                        'english_global'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#26D9E6] hover:text-white transition-all cursor-pointer"
                  >
                    ☕ Sarcastic Coffee Mug (EN)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Weekend pe boss ka urgent message aur corporate life ka funny roast',
                        'talking_object',
                        'podcast_fixed',
                        'roman_urdu_hindi'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#26D9E6] hover:text-white transition-all cursor-pointer"
                  >
                    🇵🇰 9-to-5 Roast (Roman Urdu)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'AI girl creator sharing solopreneur automation workflows and aesthetic desk setup',
                        'human_influencer',
                        'podcast_fixed',
                        'english_global'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#9B4DFF] hover:text-white transition-all cursor-pointer"
                  >
                    ✨ AI Influencer Podcast
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Dark psychology rules on silent frame control and stoic emotional mastery in negotiations',
                        'faceless_niche',
                        'cinematic_multi',
                        'english_global'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#D84DFF] hover:text-white transition-all cursor-pointer"
                  >
                    ♟️ Dark Stoic Psychology
                  </button>
                </div>
              ) : (
                /* Drama Inspirations */
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleDramaPreset}
                    className="rounded-xl border border-[#26D9E6]/60 bg-[#0c1840] px-3 py-1.5 text-xs font-black text-[#26D9E6] hover:border-[#26D9E6] hover:text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    title="Click to shuffle through completely different viral storylines & casts!"
                  >
                    <span>🎲 Shuffle / Surprise Me</span>
                    <span className="text-[10px] text-[#26D9E6]/70 font-mono">({surpriseIndex + 1}/{DRAMA_PRESETS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDramaPreset(
                        'A junior AI engineer exposes a $50B corporate algorithm theft inside a corrupt Silicon Valley boardroom',
                        'Leo (Junior Dev)',
                        'Marcus (Corrupt CEO)',
                        'Ayla (Cyber Analyst)',
                        'human_influencer',
                        'english_global'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#D84DFF] hover:text-white transition-all cursor-pointer"
                  >
                    🏢 Corporate Revenge (EN)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDramaPreset(
                        'Raat ke 2 baje boss ne secret patent chori kiya aur junior developer ne live broadcast kardia',
                        'Bilal (Hero Developer)',
                        'Dawood (Boss Villain)',
                        'Zara (Office Hacker)',
                        'human_influencer',
                        'roman_urdu_hindi'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#D84DFF] hover:text-white transition-all cursor-pointer"
                  >
                    🇵🇰 Corporate Badla (Roman Urdu)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDramaPreset(
                        'Bob the sarcastic coffee mug and Leo the healthy avocado argue over office wellness propaganda',
                        'Bob (Caffeine Mug)',
                        'Marcus (Energy Drink)',
                        'Leo (Healthy Avocado)',
                        'talking_object',
                        'english_global'
                      )
                    }
                    className="rounded-xl border border-cyan-950 bg-[#0a0f2e] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#26D9E6] hover:text-white transition-all cursor-pointer"
                  >
                    🥑 Mug vs Avocado Comedy Trio
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateAndGenerate} className="space-y-5">
              {/* Question 1: Topic or Season Premise */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {productionMode === 'episodic_season' ? '1. What is your drama series about? (Or pick a 1-click preset above)' : '1. What is your channel topic or idea?'} <span className="text-[#26D9E6]">*</span>
                </label>
                <textarea
                  value={productionMode === 'episodic_season' ? seasonPremise : nicheInput}
                  onChange={(e) => {
                    if (productionMode === 'episodic_season') {
                      setSeasonPremise(e.target.value);
                    } else {
                      setNicheInput(e.target.value);
                    }
                  }}
                  placeholder={
                    productionMode === 'episodic_season'
                      ? 'Type your series idea (e.g. AI intern vs corrupt CEO) or simply click a preset above...'
                      : 'Describe your video perspective or click an inspiration chip above...'
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-cyan-950/80 bg-[#0a0f2e] p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#26D9E6] focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* DRAMA MODE SPECIFIC: 3-CHARACTER ENSEMBLE (HERO, VILLAIN, SUPPORTING ALLY) */}
              {productionMode === 'episodic_season' && (
                <div className="rounded-2xl border border-cyan-950/80 bg-[#090e29] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#D84DFF]" /> 3-Character Cast Ensemble (Strict Speaker Isolation):
                    </span>
                    <span className="text-[10px] text-zinc-400">Zero Dialogue Mix-Ups</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#26D9E6] flex items-center gap-1">
                        <User className="h-3 w-3" /> 🔵 Protagonist / Hero:
                      </label>
                      <input
                        type="text"
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                        placeholder="e.g. Leo (Junior Dev)"
                        className="w-full rounded-xl border border-cyan-950 bg-black/50 p-2 text-xs text-white placeholder-zinc-500 focus:border-[#26D9E6] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#FF4D6D] flex items-center gap-1">
                        <User className="h-3 w-3" /> 🔴 Antagonist / Villain:
                      </label>
                      <input
                        type="text"
                        value={villainName}
                        onChange={(e) => setVillainName(e.target.value)}
                        placeholder="e.g. Marcus (Corrupt CEO)"
                        className="w-full rounded-xl border border-cyan-950 bg-black/50 p-2 text-xs text-white placeholder-zinc-500 focus:border-[#FF4D6D] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#D84DFF] flex items-center gap-1">
                        <User className="h-3 w-3" /> 🟣 Supporting Ally / Insider:
                      </label>
                      <input
                        type="text"
                        value={supportingName}
                        onChange={(e) => setSupportingName(e.target.value)}
                        placeholder="e.g. Ayla (Cyber Insider)"
                        className="w-full rounded-xl border border-cyan-950 bg-black/50 p-2 text-xs text-white placeholder-zinc-500 focus:border-[#D84DFF] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Question 2: Persona Archetype */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {productionMode === 'episodic_season' ? '2. Visual Style & Universe Archetype' : '2. Choose Character Archetype'}
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setArchetype('talking_object')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      archetype === 'talking_object'
                        ? 'border-[#26D9E6] bg-[#0c153b] text-white ring-1 ring-[#26D9E6]'
                        : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                    }`}
                  >
                    <span className="text-2xl mb-1">🥑</span>
                    <span className="text-xs font-bold">Talking Object</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Coffee mug, Avocado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArchetype('human_influencer')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      archetype === 'human_influencer'
                        ? 'border-[#9B4DFF] bg-[#0c153b] text-white ring-1 ring-[#9B4DFF]'
                        : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                    }`}
                  >
                    <span className="text-2xl mb-1">✨</span>
                    <span className="text-xs font-bold">Human Cast</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Realistic Characters</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArchetype('faceless_niche')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      archetype === 'faceless_niche'
                        ? 'border-[#D84DFF] bg-[#0c153b] text-white ring-1 ring-[#D84DFF]'
                        : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                    }`}
                  >
                    <span className="text-2xl mb-1">🕶️</span>
                    <span className="text-xs font-bold">Dark Noir</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Shadows & Statues</span>
                  </button>
                </div>
              </div>

              {/* Question 3: Duration & Language */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Duration Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    3. Episode Duration
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDuration('30s')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        duration === '30s'
                          ? 'border-[#26D9E6] bg-[#0c153b] text-white ring-1 ring-[#26D9E6]'
                          : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                      }`}
                    >
                      <Clock className="h-4 w-4 text-[#26D9E6] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">⚡ 30s (3 Scenes / Ep)</div>
                        <div className="text-[10px] text-zinc-400">Fast Viral Cliffhanger Pacing</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDuration('60s')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        duration === '60s'
                          ? 'border-[#9B4DFF] bg-[#0c153b] text-white ring-1 ring-[#9B4DFF]'
                          : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                      }`}
                    >
                      <Clock className="h-4 w-4 text-[#9B4DFF] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">🎬 60s (6 Scenes / Ep)</div>
                        <div className="text-[10px] text-zinc-400">Full Cinematic Dialogue Depth</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language / Slang Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    4. Dialogue Language
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setLanguage('english_global')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        language === 'english_global'
                          ? 'border-[#26D9E6] bg-[#0c153b] text-white ring-1 ring-[#26D9E6]'
                          : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                      }`}
                    >
                      <Globe className="h-4 w-4 text-[#26D9E6] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">English (Global)</div>
                        <div className="text-[10px] text-zinc-400">Hollywood Script Dialogues</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('roman_urdu_hindi')}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        language === 'roman_urdu_hindi'
                          ? 'border-[#D84DFF] bg-[#0c153b] text-white ring-1 ring-[#D84DFF]'
                          : 'border-cyan-950/70 bg-[#0a0f2b]/60 text-zinc-400 hover:bg-[#0c1438]'
                      }`}
                    >
                      <Globe className="h-4 w-4 text-[#D84DFF] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Roman Urdu/Hindi</div>
                        <div className="text-[10px] text-zinc-400">Desi Drama Dialogues</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reference Image Checkbox */}
              <div className="flex items-center justify-between rounded-2xl border border-cyan-950/70 bg-[#0a0f2b]/70 p-3.5">
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="h-4 w-4 text-[#26D9E6]" />
                  <div>
                    <div className="text-xs font-bold text-white">I have my Master Frame Photo ready</div>
                    <div className="text-[10px] text-zinc-400">Prompts will instruct Google Flow to animate your uploaded start-frame photo</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasRefImage}
                  onChange={(e) => setHasRefImage(e.target.checked)}
                  className="h-4 w-4 accent-[#26D9E6] cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-3">
                {currentPlan && (
                  <button
                    type="button"
                    onClick={() => setShowCreationForm(false)}
                    className="flex-1 rounded-2xl border border-zinc-800 bg-[#0a0f2b] py-3 text-xs font-bold text-zinc-300 hover:bg-[#121a44] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] py-3.5 text-xs font-extrabold text-white shadow-xl shadow-[#26D9E6]/25 hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 text-[#26D9E6] ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>
                    {isGenerating 
                      ? 'Synthesizing with Loop Engineering...' 
                      : (productionMode === 'episodic_season' ? '🎬 Direct 7-Episode Season 1' : 'Generate 7-Day Plan')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STATE 2: GENERATED 7-DAY / 7-EPISODE CONTENT */
          <div className="space-y-6">
            {/* Top Bar with Plan Details & Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 backdrop-blur-xl">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-bold text-white">
                    {isDramaMode ? (currentPlan.seasonTitle || currentPlan.profileName) : currentPlan.profileName}
                  </h1>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold border uppercase ${
                    isDramaMode ? 'bg-[#D84DFF]/15 text-[#D84DFF] border-[#D84DFF]/30' : 'bg-[#26D9E6]/15 text-[#26D9E6] border-[#26D9E6]/30'
                  }`}>
                    {isDramaMode ? `Season ${currentPlan.seasonNumber || 1} • 7 Episodes` : 'Standalone 7-Day'}
                  </span>
                  <span className="rounded bg-[#9B4DFF]/15 px-2 py-0.5 text-[10px] font-bold text-[#9B4DFF] border border-[#9B4DFF]/30">
                    {currentPlan.videoDuration || '30s'} • {currentPlan.days[0]?.scenes.length || 3} Clips
                  </span>
                  <span className="rounded bg-[#26D9E6]/15 px-2 py-0.5 text-[10px] font-bold text-[#26D9E6] border border-[#26D9E6]/30">
                    {currentPlan.language === 'roman_urdu_hindi' ? '🇵🇰 Roman Urdu' : '🌐 English'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{currentPlan.seasonSynopsis || currentPlan.niche}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1-Click Generate Next Season / Series */}
                <button
                  onClick={handleGenerateNextWeekOrSeason}
                  disabled={isGenerating}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title={isDramaMode ? "Generate Season 2 continuing the cliffhanger" : "Generate next 7 days"}
                >
                  <FastForward className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {isGenerating ? 'Synthesizing...' : (isDramaMode ? `🎬 Direct Season ${(currentPlan.seasonNumber || 1) + 1}` : 'Next 7 Days')}
                  </span>
                </button>

                {/* New Project (Different Character / Idea) */}
                <button
                  onClick={() => setShowCreationForm(true)}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#26D9E6] to-[#9B4DFF] px-3.5 py-1.5 text-xs font-extrabold text-[#050816] hover:opacity-95 cursor-pointer shadow-md"
                  title="Start a new character or fresh topic"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Plan</span>
                </button>

                <button
                  onClick={() => handleExportMarkdown(currentPlan)}
                  className="flex items-center gap-1 rounded-lg bg-[#26D9E6]/15 border border-[#26D9E6]/30 px-3 py-1.5 text-xs font-semibold text-[#26D9E6] hover:bg-[#26D9E6]/25 hover:text-white cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export (.MD)</span>
                </button>

                <button
                  onClick={handleClearPlan}
                  className="flex items-center gap-1 rounded-lg border border-rose-900/50 bg-rose-950/20 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/50 cursor-pointer"
                  title="Clear plan and start fresh"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Clean Date / Episode Pill Selector */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-3 backdrop-blur-xl">
              {currentPlan.days.map((day, idx) => {
                const isSelected = day.dayNumber === selectedDayNum;
                const formattedDate = getFormattedDateForDay(idx);
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayNum(day.dayNumber)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#26D9E6] to-[#9B4DFF] text-[#050816] shadow-md shadow-[#26D9E6]/25 font-extrabold ring-1 ring-[#26D9E6]'
                        : 'bg-[#0a0f2b] text-zinc-400 hover:text-zinc-200 border border-cyan-950/70'
                    }`}
                  >
                    <span>{day.emotionalTrigger?.icon || (isDramaMode ? '⚡' : '🎭')}</span>
                    <span>{isDramaMode ? `Ep ${day.episodeNumber || idx + 1}` : day.dayName} ({formattedDate})</span>
                    <span className={`text-[10px] ${isSelected ? 'text-[#050816]' : 'text-[#D84DFF]'}`}>
                      🔥 {day.viralScore}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day / Episode View */}
            {selectedDayContent && (
              <div className="space-y-5">
                {/* Title & Cliffhanger Bar */}
                <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#9B4DFF]/20 px-2 py-0.5 text-xs font-bold text-[#9B4DFF] border border-[#9B4DFF]/30">
                        {isDramaMode ? `Episode ${selectedDayContent.episodeNumber || selectedDayContent.dayNumber}` : `Day ${selectedDayContent.dayNumber} • ${selectedDayContent.dayName}`}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {selectedDayContent.emotionalTrigger?.label || selectedDayContent.angleArchetype}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-bold text-white">{selectedDayContent.title}</h2>
                    {selectedDayContent.cliffhangerHook && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#D84DFF] font-semibold">
                        <Flame className="h-3.5 w-3.5" />
                        <span>Cliffhanger: "{selectedDayContent.cliffhangerHook}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#9B4DFF]/20 to-[#D84DFF]/20 border border-[#9B4DFF]/40 px-3.5 py-1.5 text-xs font-bold text-white hover:border-[#D84DFF] transition-all cursor-pointer shadow-sm"
                    >
                      <BarChart3 className="h-4 w-4 text-[#D84DFF]" />
                      <span>📊 Log 24h Video Feedback</span>
                    </button>
                  </div>
                </div>

                {/* STEP 1: Video Frame Image Prompt Box OR Multi-Character Prompt */}
                <div className="rounded-2xl border border-[#26D9E6]/40 bg-[#081232]/80 p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#26D9E6]/20 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#26D9E6] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> 
                      {isDramaMode 
                        ? 'Step 1: Master Three-Shot Frame Prompt (Hero on Left, Villain on Right, Ally in Center)' 
                        : (currentPlan.hasReferenceImage ? 'Step 1: Master Character Image Active' : 'Step 1: Video Frame Image Prompt')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedDayContent.masterKeyframePrompt, 'frame_prompt')}
                        className="flex items-center gap-1 rounded-lg bg-[#26D9E6] px-3 py-1 text-xs font-extrabold text-[#050816] hover:opacity-90 cursor-pointer shadow-sm"
                      >
                        {copiedKey === 'frame_prompt' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === 'frame_prompt' ? 'Copied!' : 'Copy Frame Prompt'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={selectedDayContent.masterKeyframePrompt}
                    onChange={(e) => handleUpdateMasterFramePrompt(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-zinc-100 focus:border-[#26D9E6] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* STEP 2: Google Flow 10-Second Clips (With Strict Speaker Isolation & Directing) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Film className="h-4 w-4 text-[#9B4DFF]" /> Step 2: Google Flow 10-Second Scene Motion Prompts & Dialogues ({selectedDayContent.scenes.length} Clips)
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {selectedDayContent.scenes.map((scene) => (
                      <div
                        key={scene.sceneNumber}
                        className="flex flex-col justify-between rounded-2xl border border-cyan-950/70 bg-[#080d26]/90 p-4 shadow-lg space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2">
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9B4DFF]/20 text-[10px] text-[#9B4DFF] border border-[#9B4DFF]/30">
                                {scene.sceneNumber}
                              </span>
                              <span>{scene.phase}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-zinc-500 font-mono">{scene.duration}</span>
                              <button
                                onClick={() => setReRollingSceneNum(reRollingSceneNum === scene.sceneNumber ? null : scene.sceneNumber)}
                                className="flex items-center gap-1 rounded bg-[#9B4DFF]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#9B4DFF] hover:bg-[#9B4DFF]/25 cursor-pointer border border-[#9B4DFF]/30"
                                title="Re-roll this scene with custom direction"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>Re-Roll</span>
                              </button>
                            </div>
                          </div>

                          {/* SPEAKER ATTRIBUTION BADGE (Strict Multi-Character Speaker Isolation) */}
                          {scene.speaker && (
                            <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl bg-black/50 p-2 border border-white/5">
                              <div className="flex items-center gap-1.5">
                                <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  scene.speakerRole === 'protagonist'
                                    ? 'bg-[#26D9E6]/20 text-[#26D9E6] border border-[#26D9E6]/40'
                                    : (scene.speakerRole === 'antagonist' ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40' : 'bg-[#D84DFF]/20 text-[#D84DFF] border border-[#D84DFF]/40')
                                }`}>
                                  <User className="h-3 w-3" />
                                  <span>
                                    {scene.speakerRole === 'protagonist' ? '🔵 Hero Speaking:' : (scene.speakerRole === 'antagonist' ? '🔴 Villain Speaking:' : '🟣 Ally Speaking:')} {scene.speaker}
                                  </span>
                                </span>
                              </div>
                              {scene.cameraAngleType && (
                                <span className="text-[9px] text-zinc-400 font-mono">{scene.cameraAngleType}</span>
                              )}
                            </div>
                          )}

                          {/* Inline Re-Roll Custom Input Box */}
                          {reRollingSceneNum === scene.sceneNumber && (
                            <div className="rounded-xl bg-[#0e1742] p-2.5 border border-[#9B4DFF]/40 space-y-2">
                              <div className="text-[10px] font-bold text-[#9B4DFF]">Custom Re-Roll Instruction (Optional):</div>
                              <input
                                type="text"
                                value={customReRollPrompt}
                                onChange={(e) => setCustomReRollPrompt(e.target.value)}
                                placeholder="e.g. Make him shout angrily, or add dramatic rim light..."
                                className="w-full rounded-lg border border-cyan-950 bg-black/60 p-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#9B4DFF] focus:outline-none"
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setReRollingSceneNum(null)}
                                  className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isReRolling}
                                  onClick={() => handleExecuteReRoll(scene.sceneNumber)}
                                  className="rounded bg-[#9B4DFF] px-2.5 py-1 text-[10px] font-bold text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
                                >
                                  {isReRolling ? 'Generating...' : 'Re-Roll Now'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Video Motion Prompt (With Strict Speaker Isolation Command) */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3 text-[#26D9E6]" /> Video Motion Prompt
                              </span>
                              <button
                                onClick={() => copyToClipboard(scene.visualPrompt, `vis_${scene.sceneNumber}`)}
                                className="text-[#26D9E6] hover:underline text-[11px] cursor-pointer"
                              >
                                {copiedKey === `vis_${scene.sceneNumber}` ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <textarea
                              value={scene.visualPrompt}
                              onChange={(e) => handleUpdateScene(scene.sceneNumber, 'visualPrompt', e.target.value)}
                              rows={3}
                              className="mt-1 w-full rounded-lg border border-white/5 bg-black/50 p-2 text-xs font-mono text-zinc-200 focus:border-[#26D9E6] focus:outline-none leading-relaxed"
                            />
                          </div>

                          {/* Spoken Dialogue */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> Spoken Dialogue ({scene.speaker || 'Voice'})
                              </span>
                              <button
                                onClick={() => copyToClipboard(scene.dialogue, `dial_${scene.sceneNumber}`)}
                                className="text-emerald-400 hover:underline text-[11px] cursor-pointer"
                              >
                                {copiedKey === `dial_${scene.sceneNumber}` ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <textarea
                              value={scene.dialogue}
                              onChange={(e) => handleUpdateScene(scene.sceneNumber, 'dialogue', e.target.value)}
                              rows={2}
                              className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2 text-xs text-emerald-200 italic focus:border-emerald-400 focus:outline-none leading-relaxed"
                            />
                          </div>

                          {/* Listener Silent Reaction */}
                          {scene.listenerReaction && (
                            <div className="rounded-xl bg-[#140b28] p-2 border border-[#9B4DFF]/30 text-[10px]">
                              <span className="font-bold text-[#D84DFF]">🤐 Silent Reaction ({scene.listenerName || 'Listener'}):</span>
                              <div className="text-zinc-300 mt-0.5 italic">{scene.listenerReaction}</div>
                            </div>
                          )}

                          {/* Face & Eye Directing Box */}
                          <div className="rounded-xl bg-[#0c1438] p-2.5 border border-cyan-950 space-y-2 text-[11px]">
                            <div>
                              <div className="text-[10px] font-bold text-[#26D9E6] flex items-center gap-1">
                                <Smile className="h-3 w-3" /> Face & Micro-Expression:
                              </div>
                              <input
                                type="text"
                                value={scene.facialExpression || ''}
                                onChange={(e) => handleUpdateScene(scene.sceneNumber, 'facialExpression', e.target.value)}
                                className="mt-0.5 w-full rounded border border-transparent bg-black/30 p-1 text-[10px] text-zinc-300 focus:border-[#26D9E6] focus:outline-none"
                              />
                            </div>

                            <div>
                              <div className="text-[10px] font-bold text-[#D84DFF] flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Eye-Contact Cue:
                              </div>
                              <input
                                type="text"
                                value={scene.eyeContactCue || ''}
                                onChange={(e) => handleUpdateScene(scene.sceneNumber, 'eyeContactCue', e.target.value)}
                                className="mt-0.5 w-full rounded border border-transparent bg-black/30 p-1 text-[10px] text-zinc-300 focus:border-[#D84DFF] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social SEO & BGM Audio Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Instagram & TikTok SEO */}
                  <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#26D9E6] flex items-center gap-1.5">
                        <Share2 className="h-4 w-4" /> Instagram & TikTok Caption Pack
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${selectedDayContent.platformMetadata.instagram.hookCaption}\n\n${selectedDayContent.platformMetadata.instagram.bodyCaption}\n\n${selectedDayContent.platformMetadata.instagram.hashtags.join(' ')}`,
                            'insta_seo'
                          )
                        }
                        className="text-xs text-[#26D9E6] hover:underline cursor-pointer"
                      >
                        {copiedKey === 'insta_seo' ? 'Copied' : 'Copy Caption & Tags'}
                      </button>
                    </div>
                    <div className="text-xs text-zinc-300 bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                      <p className="font-semibold text-white">{selectedDayContent.platformMetadata.instagram.hookCaption}</p>
                      <p className="text-zinc-400">{selectedDayContent.platformMetadata.instagram.bodyCaption}</p>
                      <p className="text-[#26D9E6] text-[11px]">{selectedDayContent.platformMetadata.instagram.hashtags.join(' ')}</p>
                    </div>
                  </div>

                  {/* BGM Music Audio Prompt */}
                  <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9B4DFF] flex items-center gap-1.5">
                        <Music className="h-4 w-4" /> Scene Music / BGM Prompt
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedDayContent.bgmPrompt, 'bgm_seo')}
                        className="text-xs text-[#9B4DFF] hover:underline cursor-pointer"
                      >
                        {copiedKey === 'bgm_seo' ? 'Copied' : 'Copy BGM'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                      {selectedDayContent.bgmPrompt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 24-HOUR PERFORMANCE FEEDBACK & AI MEMORY MODAL */}
      {showFeedbackModal && selectedDayContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-cyan-950/80 bg-[#080d26] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-950/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#D84DFF]" />
                <h3 className="text-sm font-bold text-white">Log 24h Video Performance</h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-[#0c1438] p-3 border border-cyan-950 text-xs">
              <span className="text-zinc-400 font-semibold">Video Title:</span>
              <div className="font-bold text-white mt-0.5">{selectedDayContent.title}</div>
            </div>

            <form onSubmit={handleSavePerformanceFeedback} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">1. How did this video perform after 24 hours?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackResult('viral')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      feedbackResult === 'viral' ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold ring-1 ring-emerald-400' : 'border-cyan-950 bg-black/40 text-zinc-400'
                    }`}
                  >
                    🚀 Viral Hit
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackResult('good')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      feedbackResult === 'good' ? 'border-[#26D9E6] bg-[#0c163d] text-[#26D9E6] font-bold ring-1 ring-[#26D9E6]' : 'border-cyan-950 bg-black/40 text-zinc-400'
                    }`}
                  >
                    👍 Steady Growth
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackResult('flop')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      feedbackResult === 'flop' ? 'border-rose-400 bg-rose-950/40 text-rose-300 font-bold ring-1 ring-rose-400' : 'border-cyan-950 bg-black/40 text-zinc-400'
                    }`}
                  >
                    📉 Low Drop-Off
                  </button>
                </div>
              </div>

              {feedbackResult !== 'viral' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300">2. What was the main drop-off reason?</label>
                  <select
                    value={feedbackDiagnosis}
                    onChange={(e: any) => setFeedbackDiagnosis(e.target.value)}
                    className="w-full rounded-xl border border-cyan-950 bg-[#0a0f2e] p-2.5 text-xs text-white focus:border-[#9B4DFF] focus:outline-none"
                  >
                    <option value="hook_issue">3-Second Hook Issue (Viewer skipped immediately)</option>
                    <option value="seo_distribution_issue">SEO & Hashtags Issue (Algorithm didn't push to feed)</option>
                    <option value="cta_engagement_issue">CTA Issue (Good views, but low comments/shares)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">3. Estimated Views (Optional)</label>
                <input
                  type="text"
                  value={feedbackViews}
                  onChange={(e) => setFeedbackViews(e.target.value)}
                  placeholder="e.g. 45,000 views or 800 views"
                  className="w-full rounded-xl border border-cyan-950 bg-[#0a0f2e] p-2 text-xs text-white placeholder-zinc-500 focus:border-[#9B4DFF] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">4. Key Learning / Note for AI Memory (Optional)</label>
                <input
                  type="text"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="e.g. Sarcastic tone got 200+ shares, make next hook more provocative"
                  className="w-full rounded-xl border border-cyan-950 bg-[#0a0f2e] p-2 text-xs text-white placeholder-zinc-500 focus:border-[#9B4DFF] focus:outline-none"
                />
              </div>

              {feedbackSuccessMsg && (
                <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30 animate-pulse">
                  ✅ Feedback logged into AI Learning Memory! Future plans will automatically adapt.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded-xl border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#9B4DFF] to-[#D84DFF] px-4 py-2 text-xs font-bold text-white hover:opacity-95 cursor-pointer shadow-md"
                >
                  Save to AI Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => {
          setIsApiKeyOpen(false);
          const storedKey = storageService.getApiKey();
          setApiKey(storedKey);
          setQuota(storageService.checkGenerationQuota());
        }}
        currentKey={apiKey}
        onSaveKey={(k) => {
          storageService.setApiKey(k);
          setApiKey(k);
          setQuota(storageService.checkGenerationQuota());
        }}
      />
    </div>
  );
}
