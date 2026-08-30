'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { ApiKeyModal } from '../../components/ApiKeyModal';
import { storageService } from '../../services/storageService';
import { CreatorProfile, WeeklyPlan, VaultItem, PerformanceLog } from '../../types';
import { 
  Film, Sparkles, ArrowRight, Download, Copy, Check, 
  Flame, Layers, User, Plus, Search, Trash2, Calendar 
} from 'lucide-react';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<CreatorProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  useEffect(() => {
    const p = storageService.getProfiles();
    setProfiles(p);
    const active = storageService.getActiveProfile() || p[0] || null;
    setActiveProfile(active);

    const current = storageService.getCurrentPlan();
    if (current) {
      setSavedPlans([current]);
    }

    setApiKey(storageService.getApiKey());
  }, []);

  const handleCopyPlanJson = (plan: WeeklyPlan) => {
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    setCopiedId(plan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportMarkdown = (plan: WeeklyPlan) => {
    let md = `# FlowCreator OS - 7-Day Plan for ${plan.profileName}\n`;
    md += `Niche: ${plan.niche} | Format: ${plan.videoFormatMode}\n\n---\n\n`;

    plan.days.forEach((d) => {
      md += `## Day ${d.dayNumber} (${d.dayName}): ${d.title}\n`;
      md += `**Emotion:** ${d.emotionalTrigger?.icon || '🎭'} ${d.emotionalTrigger?.label || d.angleArchetype} | **Score:** ${d.viralScore}%\n\n`;
      md += `### Master Keyframe Prompt:\n\`${d.masterKeyframePrompt}\`\n\n`;
      md += `### Google Flow Scenes:\n`;
      d.scenes.forEach((s) => {
        md += `#### Scene ${s.sceneNumber} (${s.duration})\n`;
        md += `- **Visual Motion:** ${s.visualPrompt}\n`;
        md += `- **Dialogue:** "${s.dialogue}"\n`;
        md += `- **Acting:** ${s.actingDirection}\n\n`;
      });
      md += `### BGM Audio:\n\`${d.bgmPrompt}\`\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowCreator_${plan.profileName.replace(/\s+/g, '_')}_Vault.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalScenesCount = savedPlans.reduce((acc, plan) => acc + plan.days.reduce((dAcc, d) => dAcc + d.scenes.length, 0), 0);

  const filteredPlans = savedPlans.filter((plan) => {
    const q = searchQuery.toLowerCase();
    return (
      plan.profileName.toLowerCase().includes(q) ||
      plan.niche.toLowerCase().includes(q) ||
      plan.days.some((d) => d.title.toLowerCase().includes(q))
    );
  });

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
        onOpenNewProfileModal={() => { window.location.href = '/studio'; }}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenVaultModal={() => {}}
        onOpenFlywheelModal={() => {}}
        onGeneratePlan={() => { window.location.href = '/studio'; }}
        isGenerating={false}
        hasApiKey={!!apiKey}
        vaultCount={0}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Header with Studio Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white sm:text-2xl">Creator History & Prompt Vault</h1>
              <span className="rounded-md bg-[#26D9E6]/15 px-2 py-0.5 text-xs font-semibold text-[#26D9E6] border border-[#26D9E6]/30">
                Saved Batches
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">View and export all previously generated 7-day Google Flow production schedules</p>
          </div>

          <Link
            href="/studio"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-[#26D9E6]/20 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4 text-[#26D9E6]" />
            <span>Generate New 7-Day Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Simple Overview Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Saved Batches</span>
              <Layers className="h-4 w-4 text-[#26D9E6]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">{savedPlans.length} Plans</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">7-Day production schedules</div>
          </div>

          <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Google Flow Scene Clips</span>
              <Film className="h-4 w-4 text-[#9B4DFF]" />
            </div>
            <div className="mt-2 text-2xl font-black text-[#9B4DFF]">{totalScenesCount} Clips</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">10-Second motion prompts & dialogues</div>
          </div>

          <div className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Creator Personas</span>
              <User className="h-4 w-4 text-[#D84DFF]" />
            </div>
            <div className="mt-2 text-2xl font-black text-[#D84DFF]">{profiles.length} Channels</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Objects, Influencers & Faceless</div>
          </div>
        </div>

        {/* Search Bar & History List */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#26D9E6]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Generation History</h2>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics or channels..."
                className="w-full rounded-xl border border-cyan-950/80 bg-[#090e29] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#26D9E6] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-950 py-16 text-center space-y-3">
                <Layers className="h-10 w-10 text-zinc-600" />
                <h3 className="text-sm font-bold text-zinc-300">No prompt history found</h3>
                <Link
                  href="/studio"
                  className="rounded-xl bg-[#26D9E6] px-4 py-2 text-xs font-bold text-[#050816] hover:opacity-95"
                >
                  Generate Your First Batch
                </Link>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-cyan-950/70 bg-[#080d26]/80 p-5 backdrop-blur-xl transition-all hover:border-[#26D9E6]/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cyan-950/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{plan.profileName}</span>
                        <span className="rounded bg-[#26D9E6]/20 px-2 py-0.5 text-[10px] font-bold text-[#26D9E6] border border-[#26D9E6]/30 uppercase">
                          {plan.videoFormatMode === 'podcast_fixed' ? 'Fixed Master Frame' : 'Cinematic Multi-Scene'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{plan.niche}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPlanJson(plan)}
                        className="flex items-center gap-1 rounded-lg border border-cyan-950 bg-[#090e29] px-3 py-1.5 text-xs text-zinc-300 hover:bg-[#121a44] hover:text-white cursor-pointer"
                      >
                        {copiedId === plan.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === plan.id ? 'Copied' : 'Copy JSON'}</span>
                      </button>

                      <button
                        onClick={() => handleExportMarkdown(plan)}
                        className="flex items-center gap-1 rounded-lg bg-[#26D9E6]/15 border border-[#26D9E6]/30 px-3 py-1.5 text-xs font-semibold text-[#26D9E6] hover:bg-[#26D9E6]/25 hover:text-white cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download .MD</span>
                      </button>

                      <Link
                        href="/studio"
                        className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#26D9E6] to-[#9B4DFF] px-3.5 py-1.5 text-xs font-extrabold text-[#050816] hover:opacity-95 cursor-pointer shadow-md"
                      >
                        <span>Open in Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* 7 Days Preview List */}
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-7 pt-1">
                    {plan.days.map((d) => (
                      <div
                        key={d.dayNumber}
                        className="rounded-xl border border-cyan-950/60 bg-[#090e29]/70 p-2.5 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                            <span>{d.dayName.slice(0, 3)}</span>
                            <span className="text-[#D84DFF]">🔥 {d.viralScore}%</span>
                          </div>
                          <div className="mt-1 font-semibold text-zinc-200 line-clamp-2 text-[11px]">
                            {d.title}
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-[#26D9E6] line-clamp-1">
                          {d.emotionalTrigger?.icon || '🎭'} {d.emotionalTrigger?.label || d.angleArchetype}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        currentKey={apiKey}
        onSaveKey={(k) => {
          storageService.setApiKey(k);
          setApiKey(k);
        }}
      />
    </div>
  );
}
