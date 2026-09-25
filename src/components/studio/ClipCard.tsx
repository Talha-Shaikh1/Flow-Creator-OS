'use client';

import React, { useState } from 'react';
import { ClipPrompt, StorySpec } from '@/types';
import { sanitizeForGoogleFlow } from '@/lib/engine/rules/temporal';
import {
  Copy,
  Check,
  Video,
  Mic,
  VolumeX,
  Clock,
  Film,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Headphones,
  CheckCircle2,
  Circle,
  ShieldAlert,
  Sliders,
  Layers,
  Lock,
  MapPin,
} from 'lucide-react';
import { getStoredAIConfig } from '@/lib/ai/ai-settings';

interface Props {
  clip: ClipPrompt;
  spec?: StorySpec;
  dayNumber?: number;
  onClipRegenerated?: (newClip: ClipPrompt) => void;
  isGenerated?: boolean;
  onToggleGenerated?: (clipIndex: number) => void;
  isPodcastSingleFrame?: boolean;
}

export function ClipCard({
  clip,
  spec,
  dayNumber,
  onClipRegenerated,
  isGenerated = false,
  onToggleGenerated,
  isPodcastSingleFrame = false,
}: Props) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedFrameImage, setCopiedFrameImage] = useState(false);
  const [copiedLocationPlate, setCopiedLocationPlate] = useState(false);
  const [copiedDialogue, setCopiedDialogue] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [copiedClipBundle, setCopiedClipBundle] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showModifiers, setShowModifiers] = useState(false);
  const [showFramePromptDetails, setShowFramePromptDetails] = useState(false);

  // Quick Modifiers
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string>('Default Style');

  const atmospherePresets = [
    'Default Style',
    'Cinematic 24fps 85mm Anamorphic',
    'Moody Atmospheric Rain & Fog',
    'Golden Hour Warm Rim-Light',
    'Cyberpunk Neon Noir Lighting',
  ];

  // Compute modified prompts if modifiers are active
  const getEnrichedFramePrompt = () => {
    let text = clip.frameImagePrompt;
    if (selectedAtmosphere !== 'Default Style') {
      text += ` --style ${selectedAtmosphere}`;
    }
    text += ` --ar ${selectedAspectRatio}`;
    return text;
  };

  const getEnrichedFlowPrompt = () => {
    let text = sanitizeForGoogleFlow(clip.flowPromptText);
    if (selectedAtmosphere !== 'Default Style') {
      text += ` Atmosphere: ${selectedAtmosphere}.`;
    }
    return text;
  };

  const handleCopy = (
    text: string,
    type: 'prompt' | 'frameImage' | 'locationPlate' | 'dialogue' | 'negative' | 'bundle'
  ) => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else if (type === 'frameImage') {
      setCopiedFrameImage(true);
      setTimeout(() => setCopiedFrameImage(false), 2000);
    } else if (type === 'locationPlate') {
      setCopiedLocationPlate(true);
      setTimeout(() => setCopiedLocationPlate(false), 2000);
    } else if (type === 'dialogue') {
      setCopiedDialogue(true);
      setTimeout(() => setCopiedDialogue(false), 2000);
    } else if (type === 'negative') {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    } else if (type === 'bundle') {
      setCopiedClipBundle(true);
      setTimeout(() => setCopiedClipBundle(false), 2000);
    }
  };

  const handleCopyCompleteClipBundle = () => {
    const bundleText =
      `=== CLIP ${clip.clipIndex} PRODUCTION BUNDLE ===\n` +
      `[SCENE]: ${clip.sceneName} (${clip.shotType})\n` +
      `[LOCATION]: ${clip.sceneLocation || clip.locationAnchor}\n` +
      `[ACTIVE SPEAKER]: ${clip.speakerIsolation.activeSpeaker}\n` +
      `[DIALOGUE]: "${clip.speakerIsolation.speakingDialogue}"\n\n` +
      (clip.cleanPlateStartFramePrompt
        ? `--- STEP 1: CLEAN LOCATION PLATE PROMPT (ZERO HUMANS) ---\n${clip.cleanPlateStartFramePrompt}\n\n`
        : '') +
      `--- STEP 2: STARTING FRAME IMAGE PROMPT (CHARACTERS & WARDROBE) ---\n` +
      `${getEnrichedFramePrompt()}\n\n` +
      `--- STEP 3: GOOGLE FLOW / OMNI FLASH 1.1 VIDEO MOTION DIRECTIVE ---\n` +
      `${getEnrichedFlowPrompt()}\n\n` +
      `--- NEGATIVE PROMPT DIRECTIVES ---\n` +
      `${clip.negativePromptDirectives || 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching'}\n\n` +
      `--- FOLEY & AUDIO DESIGN ---\n` +
      `${clip.foleySoundDesign || 'Cinematic room acoustic ambience, directional dialogue resonance'}`;

    handleCopy(bundleText, 'bundle');
  };

  const handleRegenerate = async () => {
    if (!spec || !onClipRegenerated) return;
    setIsRegenerating(true);
    try {
      const aiConfig = getStoredAIConfig();
      const res = await fetch('/api/generate/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'clip',
          spec,
          dayNumber: dayNumber || 1,
          clipIndex: clip.clipIndex,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.clip) {
        onClipRegenerated(data.clip);
      } else {
        alert(`AI Error: ${data.error || 'Failed to regenerate clip with AI'}`);
      }
    } catch (err: any) {
      console.error('Failed to regenerate single clip:', err);
      alert(`Network error: ${err.message || 'Failed to connect to AI'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all shadow-xl space-y-4 ${
        isGenerated
          ? 'bg-neutral-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Header with Workflow Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          {onToggleGenerated && (
            <button
              type="button"
              onClick={() => onToggleGenerated(clip.clipIndex)}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                isGenerated
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
              title="Click to track generation progress"
            >
              {isGenerated ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4 text-neutral-500" />
              )}
              <span>{isGenerated ? 'Generated in Flow ✓' : 'Mark as Generated'}</span>
            </button>
          )}

          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            CLIP {clip.clipIndex} OF {clip.totalClips} (10s)
          </span>

          {clip.sceneNumber && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              📍 Scene {clip.sceneNumber}
            </span>
          )}

          {clip.eyelineDirection && (
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded flex items-center gap-1 border ${
                clip.eyelineDirection === 'screen-right'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
              title="180-degree cinema match: guarantees characters face each other directly across cuts"
            >
              {clip.eyelineDirection === 'screen-right' ? '➔ Facing Screen-Right (Eyes Locked on Counterpart)' : '⬅ Facing Screen-Left (Eyes Locked on Counterpart)'}
            </span>
          )}

          {clip.continuityRole === 'master_anchor' || clip.clipIndex === 1 ? (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              🎯 Master Anchor Keyframe
            </span>
          ) : clip.continuityRole === 'reverse_angle_match' || clip.clipIndex === 2 ? (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              🔄 Reverse Angle Continuity
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              ⚡ Scene Culmination Match
            </span>
          )}

          <h4 className="font-semibold text-white text-sm">{clip.sceneName}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/90 text-neutral-300 font-mono flex items-center gap-1.5 border border-neutral-700/50">
            <Film className="w-3.5 h-3.5 text-neutral-400" />
            {clip.shotType}
          </span>

          <button
            type="button"
            onClick={() => setShowModifiers(!showModifiers)}
            className={`px-2.5 py-1 text-xs rounded-lg transition flex items-center gap-1.5 border ${
              showModifiers || selectedAtmosphere !== 'Default Style'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
            title="Quick Prompt Tweakers"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tweaks</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCompleteClipBundle}
            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700 shadow-sm"
            title="Copy everything for this clip"
          >
            {copiedClipBundle ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{copiedClipBundle ? 'Clip Stack Copied' : 'Copy Clip Stack'}</span>
          </button>

          {onClipRegenerated && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1 border border-neutral-700/60 disabled:opacity-50"
              title="Regenerate this specific clip only"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-400 ${isRegenerating ? 'animate-spin' : ''}`}
              />
              <span>{isRegenerating ? 'Re-rolling...' : 'Re-roll Clip'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Modifiers Drawer */}
      {showModifiers && (
        <div className="bg-neutral-950/90 border border-indigo-500/30 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              On-The-Fly Prompt Tweakers (Auto-injected into copy buttons)
            </span>
            <span className="text-[11px] text-neutral-500">Affects copy prompts below</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Aspect Ratio */}
            <div>
              <span className="text-neutral-400 text-[11px] block mb-1">Target Aspect Ratio:</span>
              <div className="flex gap-1.5">
                {(['9:16', '16:9', '1:1'] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ar)}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition ${
                      selectedAspectRatio === ar
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {ar} {ar === '9:16' ? '(Shorts/Reels)' : ar === '16:9' ? '(Cinematic)' : '(Square)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Atmosphere / Lighting preset */}
            <div>
              <span className="text-neutral-400 text-[11px] block mb-1">Visual Mood Preset:</span>
              <select
                value={selectedAtmosphere}
                onChange={(e) => setSelectedAtmosphere(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {atmospherePresets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Isolation Directives & Dialogue */}
      <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              <Mic className="w-3.5 h-3.5" />
              Active: {clip.speakerIsolation.activeSpeaker}
            </span>
            {clip.speakerIsolation.silentCharacters.length > 0 && (
              <span className="text-neutral-400 flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                Silent: {clip.speakerIsolation.silentCharacters.join(', ')}
              </span>
            )}
          </div>
          <button
            onClick={() => handleCopy(clip.speakerIsolation.speakingDialogue, 'dialogue')}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
          >
            {copiedDialogue ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedDialogue ? 'Dialogue Copied' : 'Copy Dialogue'}
          </button>
        </div>

        <p className="text-sm font-medium text-neutral-100 italic bg-neutral-900/80 p-3 rounded-lg border border-neutral-800/80">
          "{clip.speakerIsolation.speakingDialogue}"
        </p>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
          <span>
            Pacing: <strong className="text-neutral-200">{clip.pacingWordCount} words</strong> (18–22 optimal for 10s clip)
          </span>
          {clip.retentionHookReasoning && (
            <span className="text-amber-400/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {clip.retentionHookReasoning}
            </span>
          )}
        </div>

        {/* Adaptive Scene Wardrobe & Reference Image Indicator */}
        {(clip.requiresReferenceImageAttachment || clip.sceneWardrobe) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800/60 text-[11px]">
            {clip.requiresReferenceImageAttachment && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                📎 Attach Character Reference Image in Google Flow
              </span>
            )}
            {clip.sceneWardrobe && (
              <span className="text-neutral-400 italic">
                Wardrobe: <span className="text-neutral-300">{clip.sceneWardrobe}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sec-by-Sec Timeline & Audio / Foley Cues */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Second-by-Second Action & Audio Breakdown
          </span>
          {clip.foleySoundDesign && (
            <span className="text-[11px] text-indigo-400 flex items-center gap-1 font-mono">
              <Headphones className="w-3 h-3" />
              Sound Design Integrated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {clip.timeline.map((act, i) => (
            <div
              key={i}
              className="text-xs bg-neutral-950/50 border border-neutral-800/70 p-2.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 text-neutral-300"
            >
              <div className="flex items-start md:items-center gap-2">
                <span className="font-mono font-bold text-blue-400 shrink-0 w-20 bg-blue-500/10 px-1.5 py-0.5 rounded text-center">
                  {act.timeRange}
                </span>
                <div>
                  <span>{act.visualAction}</span>
                  {act.sfxCue && (
                    <p className="text-[11px] text-indigo-300/80 flex items-center gap-1 mt-0.5">
                      <Headphones className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{act.sfxCue}</span>
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 italic shrink-0 bg-neutral-900 px-2 py-0.5 rounded">
                {act.cameraMovement}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Clean Location Plate Prompt (Zero Humans) */}
      {clip.cleanPlateStartFramePrompt && (
        <div className="bg-neutral-950/90 border border-teal-500/30 rounded-xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                Step 1: Location Plate Prompt (Zero Humans / Clean Background Anchor)
              </label>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Generate this empty architectural room/plate in Midjourney / Flux first to lock 100% room geometry and lighting.
              </p>
            </div>
            <button
              onClick={() => handleCopy(clip.cleanPlateStartFramePrompt || '', 'locationPlate')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm ${
                copiedLocationPlate
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20'
              }`}
            >
              {copiedLocationPlate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLocationPlate ? 'Copied Location Plate!' : '1-Click Copy Location Prompt'}
            </button>
          </div>
          <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-teal-100 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {clip.cleanPlateStartFramePrompt}
          </pre>
          <span className="text-[11px] text-teal-300/80 block">
            📍 <strong>Master Clean Plate:</strong> 100% human-free scene backdrop. Guarantees the vault, penthouse, or kitchen has zero furniture distortion across all 7 episodes!
          </span>
        </div>
      )}

      {/* STEP 2: Video Frame Image Prompt (Characters & Wardrobe) */}
      {isPodcastSingleFrame ? (
        <div className="bg-neutral-950/80 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <ImageIcon className="w-4 h-4" />
              </span>
              <div className="text-xs">
                <span className="font-semibold text-amber-300">
                  Step 2: Uses Day {dayNumber || 1} Master Starting Keyframe 👆
                </span>
                <p className="text-[11px] text-neutral-400">
                  Reusing the single studio keyframe from above for 100% face and room consistency.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowFramePromptDetails(!showFramePromptDetails)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 underline px-2 py-1"
              >
                {showFramePromptDetails ? 'Hide Prompt' : 'View Frame Prompt'}
              </button>
              <button
                onClick={() => handleCopy(getEnrichedFramePrompt(), 'frameImage')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                  copiedFrameImage
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                }`}
              >
                {copiedFrameImage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFrameImage ? 'Copied' : 'Copy Frame Prompt'}</span>
              </button>
            </div>
          </div>

          {showFramePromptDetails && (
            <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-amber-100 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto animate-in fade-in duration-150">
              {getEnrichedFramePrompt()}
            </pre>
          )}
        </div>
      ) : (
        <div className="bg-neutral-950/90 border border-amber-500/20 rounded-xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Step 2: Generate Starting Frame Image (Midjourney / Flux)
              </label>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Paste this prompt in Midjourney / Flux. Characters are placed inside the exact room geometry with locked wardrobe.
              </p>
            </div>
            <button
              onClick={() => handleCopy(getEnrichedFramePrompt(), 'frameImage')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm ${
                copiedFrameImage
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
              }`}
            >
              {copiedFrameImage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFrameImage ? 'Copied Frame Prompt!' : '1-Click Copy Frame Image Prompt'}
            </button>
          </div>
          <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-amber-100 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {getEnrichedFramePrompt()}
          </pre>
          {clip.clipIndex > 1 ? (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-amber-200">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Visual Continuity Chain:</strong> To lock character clothes, room background, and lighting to Clip 1, append Midjourney reference:
                <div className="mt-1 font-mono text-[10px] bg-neutral-950/80 px-2 py-1 rounded text-amber-300 border border-amber-900/50">
                  --sref [PASTE_CLIP_1_IMAGE_URL] --sw 100
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-amber-300/80 block">
              🎯 <strong>Master Anchor Frame:</strong> Generate this frame image first. This sets the character wardrobe and lighting anchor for the whole episode!
            </span>
          )}
        </div>
      )}

      {/* STEP 3: Google Flow Video Motion Prompt */}
      <div className="bg-neutral-950/90 border border-blue-500/20 rounded-xl p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-blue-400" />
              Step 3: 10s Video Motion Directive (Gemini Omni Flash 1.1 / Google Flow)
            </label>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Upload Step 2 Keyframe (or Step 1 Plate) as Start Frame into Google Flow, paste this lean camera & dialogue directive.
            </p>
          </div>
          <button
            onClick={() => handleCopy(getEnrichedFlowPrompt(), 'prompt')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm ${
              copiedPrompt
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPrompt ? 'Copied Video Motion Prompt!' : '1-Click Copy Video Motion Prompt'}
          </button>
        </div>
        <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {getEnrichedFlowPrompt()}
        </pre>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-blue-300/90 block">
            🎬 <strong>Google Flow Instruction:</strong> Upload the keyframe from Step 2, paste this prompt, and render 10s video.
          </span>
          {clip.negativePromptDirectives && (
            <button
              onClick={() =>
                handleCopy(
                  clip.negativePromptDirectives ||
                    'morphing, distorted faces, duplicate characters, lip drift',
                  'negative'
                )
              }
              className="text-[11px] text-rose-400/90 hover:text-rose-300 flex items-center gap-1 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/40"
              title="Copy Negative Prompt Directives"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>{copiedNegative ? 'Copied Negative Tags!' : 'Copy Negative Prompt'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
