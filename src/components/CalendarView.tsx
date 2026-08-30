'use client';

import React from 'react';
import { Download, Check, Copy, Flame } from 'lucide-react';
import { WeeklyPlan } from '../types';

interface CalendarViewProps {
  plan: WeeklyPlan;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  plan,
  selectedDayNumber,
  onSelectDay,
}) => {
  const [copiedAll, setCopiedAll] = React.useState(false);

  const handleExportMarkdown = () => {
    let md = `# FlowCreator OS - 7-Day Content Plan for ${plan.profileName}\n`;
    md += `Niche: ${plan.niche} | Archetype: ${plan.archetype}\n`;
    md += `Format: ${plan.videoFormatMode === 'podcast_fixed' ? 'Fixed Frame / Podcast (1 Master Keyframe)' : 'Cinematic Multi-Scene'}\n\n---\n\n`;

    plan.days.forEach((d) => {
      md += `## Day ${d.dayNumber} (${d.dayName}): ${d.title}\n`;
      md += `**Emotional Trigger:** ${d.emotionalTrigger?.icon || '🎭'} ${d.emotionalTrigger?.label || d.angleArchetype}\n`;
      md += `**Viral Score:** ${d.viralScore}% | **Algorithmic Goal:** ${d.emotionalTrigger?.algorithmicGoal || d.targetEmotion}\n\n`;
      md += `### Master Keyframe Image Prompt:\n\`${d.masterKeyframePrompt}\`\n\n`;
      md += `### Google Flow 10-Second Scenes:\n`;
      d.scenes.forEach((s) => {
        md += `#### Scene ${s.sceneNumber} (${s.duration}) - ${s.phase}\n`;
        md += `- **Visual Prompt:** ${s.visualPrompt}\n`;
        md += `- **Acting / Eye-Contact:** ${s.actingDirection}\n`;
        md += `- **Dialogue:** "${s.dialogue}"\n`;
        md += `- **Camera & Lighting:** ${s.cameraMotion} | ${s.lightingAndMood}\n\n`;
      });
      md += `### Music / BGM Prompt:\n\`${d.bgmPrompt}\`\n\n`;
      if (d.lifestylePhotoPrompt) {
        md += `### Daily Lifestyle Static Photo Prompt:\n\`${d.lifestylePhotoPrompt}\`\n`;
        md += `**Caption:** ${d.lifestyleCaption}\n\n`;
      }
      md += `### Cross-Platform SEO Metadata:\n`;
      md += `- **Instagram:** ${d.platformMetadata.instagram.hookCaption}\n`;
      md += `- **TikTok:** ${d.platformMetadata.tiktok.textOverlayHook}\n`;
      md += `- **YouTube Shorts:** ${d.platformMetadata.youtubeShorts.title}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowCreator_${plan.profileName.replace(/\s+/g, '_')}_7DayPlan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFullPlan = () => {
    const text = JSON.stringify(plan, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const activeDay = plan.days.find((d) => d.dayNumber === selectedDayNumber) || plan.days[0];

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3.5 backdrop-blur-xl shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        {/* Horizontal Day Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {plan.days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => onSelectDay(day.dayNumber)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400'
                    : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{day.emotionalTrigger?.icon || '🎭'}</span>
                <span>{day.dayName.slice(0, 3)}</span>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-zinc-500'}`}>
                  D{day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFullPlan}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Copy entire 7-day plan as JSON"
          >
            {copiedAll ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="text-[11px]">{copiedAll ? 'Copied' : 'JSON'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 hover:text-white transition-colors cursor-pointer"
            title="Download formatted Markdown plan"
          >
            <Download className="h-3 w-3" />
            <span className="text-[11px]">Export (.MD)</span>
          </button>
        </div>
      </div>

      {/* Selected Day Topic Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
            <Flame className="h-3 w-3" /> {activeDay.viralScore}% Viral Score
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            {activeDay.emotionalTrigger?.label || activeDay.angleArchetype}
          </span>
        </div>
        <div className="text-xs text-zinc-400 italic line-clamp-1">
          Goal: {activeDay.emotionalTrigger?.algorithmicGoal || activeDay.targetEmotion}
        </div>
      </div>
    </div>
  );
};
