'use client';

import React, { useState } from 'react';
import { Copy, Check, Eye, MessageSquare, Video, Music, Camera, Image, Info, Sparkles, Film } from 'lucide-react';
import { DayContent } from '../types';

interface SceneStudioProps {
  dayContent: DayContent;
  isHumanInfluencer: boolean;
  hasReferenceImage?: boolean;
}

export const SceneStudio: React.FC<SceneStudioProps> = ({
  dayContent,
  isHumanInfluencer,
  hasReferenceImage = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isPodcastFixed = dayContent.videoFormatMode === 'podcast_fixed';

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30">
                Day {dayContent.dayNumber} • {dayContent.dayName}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">
                <span>{dayContent.emotionalTrigger?.icon || '🎭'}</span>
                <span>{dayContent.emotionalTrigger?.label || dayContent.angleArchetype}</span>
              </span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" />
                Viral Goal: {dayContent.emotionalTrigger?.algorithmicGoal || dayContent.targetEmotion}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {dayContent.title}
            </h1>
          </div>
        </div>

        {/* STEP 1: VIDEO FRAME IMAGE PROMPT BOX */}
        <div className="mt-4 rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/25 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                {isPodcastFixed
                  ? 'Step 1: Master Video Frame Image Prompt (Generate This Image First)'
                  : 'Step 1: Primary Keyframe Image Prompt (Starting Image)'}
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(dayContent.masterKeyframePrompt, 'master_keyframe')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/30 transition-all cursor-pointer"
            >
              {copiedKey === 'master_keyframe' ? (
                <Check className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedKey === 'master_keyframe' ? 'Copied Frame Prompt!' : 'Copy Video Frame Image Prompt'}</span>
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-zinc-300">
            <Info className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
            <p>
              {hasReferenceImage ? (
                <span className="text-emerald-300 font-medium">
                  <strong>Reference Image Mode Active:</strong> Apni character image ko Midjourney/Google Flow mein upload karein aur is prompt ke sath generate karein.
                </span>
              ) : isPodcastFixed ? (
                <span>
                  <strong>Fixed Studio Rule:</strong> Is prompt se Midjourney / Flux mein <strong>1 High-Res Image</strong> generate karein. Phir Google Flow mein <strong>yehi image upload karke</strong> teeno 10s video clips animate karein!
                </span>
              ) : (
                <span>
                  Is prompt se starting video frame image generate karein aur Google Flow mein Start Frame upload karein.
                </span>
              )}
            </p>
          </div>

          <p className="mt-2.5 font-mono text-xs text-zinc-100 leading-relaxed bg-black/60 p-3 rounded-lg border border-white/10 select-all">
            {dayContent.masterKeyframePrompt}
          </p>
        </div>
      </div>

      {/* STEP 2: GOOGLE FLOW 10-SECOND SCENE CLIPS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
              2
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Step 2: Google Flow 10-Second Scene Motion Prompts & Lip-Sync Dialogues
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {isPodcastFixed ? '⚡ 1 Master Frame + 3 Timed Dialogues' : '🎬 Multi-Scene Sequence'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dayContent.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 shadow-lg"
            >
              <div className="space-y-3">
                {/* Scene Header */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                      {scene.sceneNumber}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">{scene.phase}</span>
                  </div>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                    {scene.duration}
                  </span>
                </div>

                {/* Individual Scene Frame Prompt (if Multi-Scene) */}
                {scene.keyframeImagePrompt && !isPodcastFixed && (
                  <div className="rounded-lg bg-indigo-950/20 p-2.5 border border-indigo-500/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Image className="h-3 w-3" /> Scene {scene.sceneNumber} Frame Image Prompt
                      </span>
                      <button
                        onClick={() => copyToClipboard(scene.keyframeImagePrompt || '', `frame_${scene.sceneNumber}`)}
                        className="text-indigo-300 hover:text-white cursor-pointer"
                      >
                        {copiedKey === `frame_${scene.sceneNumber}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-mono line-clamp-2">
                      {scene.keyframeImagePrompt}
                    </p>
                  </div>
                )}

                {/* Video Motion Prompt */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3 text-indigo-400" /> Video Motion Prompt (Google Flow)
                    </span>
                    <button
                      onClick={() => copyToClipboard(scene.visualPrompt, `visual_${scene.sceneNumber}`)}
                      className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      title="Copy Motion Prompt"
                    >
                      {copiedKey === `visual_${scene.sceneNumber}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-200 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[11px]">
                    {scene.visualPrompt}
                  </p>
                </div>

                {/* Spoken Dialogue Box */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Exact Spoken Dialogue (Lip-Sync)
                    </span>
                    <button
                      onClick={() => copyToClipboard(scene.dialogue, `dialogue_${scene.sceneNumber}`)}
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      title="Copy Dialogue"
                    >
                      {copiedKey === `dialogue_${scene.sceneNumber}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-medium text-emerald-200 leading-relaxed bg-emerald-950/25 p-2.5 rounded-lg border border-emerald-500/20 italic">
                    "{scene.dialogue}"
                  </p>
                </div>

                {/* Acting & Eye-Contact Cue */}
                <div className="rounded-lg bg-amber-500/5 p-2 border border-amber-500/15">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                    <Eye className="h-3 w-3" /> Acting & Eye-Contact Cue
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-300">{scene.actingDirection}</p>
                </div>
              </div>

              {/* Camera & Lighting info */}
              <div className="mt-3 border-t border-zinc-850 pt-2 text-[10px] text-zinc-400 space-y-1">
                <p>
                  <span className="font-semibold text-zinc-300">Camera:</span> {scene.cameraMotion}
                </p>
                <p>
                  <span className="font-semibold text-zinc-300">Lighting:</span> {scene.lightingAndMood}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
