'use client';

import React, { useState } from 'react';
import {
  WorkflowPipeline,
  NicheWorkflowCategory,
  HookArchetype,
  PacingCadence,
  VisualStylePreset,
} from '@/types';
import {
  X,
  Sparkles,
  Camera,
  Layers,
  User,
  Zap,
  Mic,
  Palette,
  MapPin,
  Save,
  Sliders,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkflow: (workflow: WorkflowPipeline) => Promise<void>;
  initialWorkflow?: WorkflowPipeline | null;
}

const NICHE_OPTIONS: Array<{
  id: NicheWorkflowCategory;
  label: string;
  desc: string;
  icon: string;
}> = [
  {
    id: 'ai_influencer_ugc',
    label: 'AI Influencer / UGC Creator',
    desc: 'Selfie 4K vlogs, product reactions, GRWM, direct-to-camera eye contact.',
    icon: '🤳',
  },
  {
    id: 'talking_object',
    label: 'Talking 3D Object / Mascot',
    desc: 'Expressive anthropomorphic objects with Pixar-style micro-expressions.',
    icon: '☕',
  },
  {
    id: 'cinematic_drama',
    label: 'Cinematic Series Drama / Crime',
    desc: 'Multi-character confrontation, shot-reverse-shot, high tension standoff.',
    icon: '🎬',
  },
  {
    id: 'faceless_aesthetic',
    label: 'Faceless / Stoic / Ambient',
    desc: 'Hypnotic slow-motion aesthetic visuals with poetic voiceovers and high save-rates.',
    icon: '🌌',
  },
  {
    id: 'podcast_debate',
    label: 'Podcast & Contrarian Debates',
    desc: 'Studio multi-cam setup with Shure mic arms, debates, and insider secrets.',
    icon: '🎙️',
  },
  {
    id: 'custom',
    label: 'Custom Creator Niche',
    desc: 'Define your own unique custom video production recipe.',
    icon: '⚡',
  },
];

const HOOK_OPTIONS: Array<{ id: HookArchetype; label: string; example: string }> = [
  {
    id: 'curiosity_gap',
    label: 'Curiosity Gap Opener',
    example: '"Nobody is talking about why this 1 mistake ruins everything..."',
  },
  {
    id: 'shock_reversal',
    label: 'Visual Shock & Perspective Flip',
    example: 'Sudden unexpected prop drop or reaction followed by instant reveal.',
  },
  {
    id: 'secret_expose',
    label: 'Industry Secret / Expose',
    example: '"The real reason top creators never reveal their daily prompt stack..."',
  },
  {
    id: 'cold_open_standoff',
    label: 'Cold Open Climax Standoff',
    example: 'Starts directly in the middle of a fierce accusation or confrontation.',
  },
  {
    id: 'controversial_opinion',
    label: 'High-Retention Polarizing Opinion',
    example: '"Stop doing standard prompt engineering in 2026. Here is why..."',
  },
];

const PACING_OPTIONS: Array<{ id: PacingCadence; label: string; desc: string }> = [
  {
    id: 'rapid_tiktok_22w',
    label: 'Rapid TikTok / Shorts (20–22 words/10s)',
    desc: 'Fast energetic cadence, zero dead air, high audience retention.',
  },
  {
    id: 'measured_cinematic_16w',
    label: 'Measured Dramatic (15–18 words/10s)',
    desc: 'Natural cinematic pauses, room for facial acting and micro-reactions.',
  },
  {
    id: 'ambient_voiceover_12w',
    label: 'Ambient Poetic Flow (10–12 words/10s)',
    desc: 'Deep reflective voiceover, atmospheric pacing with lingering visuals.',
  },
];

const STYLE_OPTIONS: VisualStylePreset[] = [
  'Hyper-Realistic Cinematic',
  'Stylized 3D Animation',
  'Moody Film Noir',
  'Vibrant Commercial Gloss',
  'Vintage 90s Camcorder',
];

export function WorkflowPipelineModal({
  isOpen,
  onClose,
  onSaveWorkflow,
  initialWorkflow,
}: Props) {
  const [name, setName] = useState(initialWorkflow?.name || '');
  const [nicheType, setNicheType] = useState<NicheWorkflowCategory>(
    initialWorkflow?.nicheType || 'ai_influencer_ugc'
  );
  const [customNicheTitle, setCustomNicheTitle] = useState(
    initialWorkflow?.customNicheTitle || ''
  );
  const [description, setDescription] = useState(
    initialWorkflow?.description || 'Custom production pipeline tailored for channel scalability.'
  );
  const [personaAnchor, setPersonaAnchor] = useState(
    initialWorkflow?.personaSubjectAnchor ||
      '24yo charismatic digital creator with natural makeup, oversized crewneck, direct eye contact with camera, photorealistic skin pores.'
  );
  const [cameraStyle, setCameraStyle] = useState(
    initialWorkflow?.cameraShootingStyle ||
      'Handheld iPhone 16 Pro 4K front-facing camera, subtle handheld motion, eye-level framing, ring-light illumination.'
  );
  const [hookArchetype, setHookArchetype] = useState<HookArchetype>(
    initialWorkflow?.hookArchetype || 'curiosity_gap'
  );
  const [pacingCadence, setPacingCadence] = useState<PacingCadence>(
    initialWorkflow?.pacingCadence || 'rapid_tiktok_22w'
  );
  const [audioFoleyMood, setAudioFoleyMood] = useState(
    initialWorkflow?.audioFoleyMood ||
      'Crisp proximity vocal isolation, punchy bass sub-drop, subtle room reverb.'
  );
  const [visualStyle, setVisualStyle] = useState<VisualStylePreset>(
    initialWorkflow?.visualStylePreset || 'Hyper-Realistic Cinematic'
  );
  const [locations, setLocations] = useState<string>(
    initialWorkflow?.defaultLocations.join(', ') ||
      'Sunlit Modern Studio, Minimalist Aesthetic Desk'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const locArray = locations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const workflow: WorkflowPipeline = {
        id: initialWorkflow?.id || `workflow-${Date.now()}`,
        name: name.trim(),
        nicheType,
        customNicheTitle: nicheType === 'custom' ? customNicheTitle.trim() : undefined,
        description: description.trim(),
        personaSubjectAnchor: personaAnchor.trim(),
        cameraShootingStyle: cameraStyle.trim(),
        hookArchetype,
        pacingCadence,
        audioFoleyMood: audioFoleyMood.trim() || undefined,
        visualStylePreset: visualStyle,
        defaultLocations: locArray.length > 0 ? locArray : ['Main Cinematic Studio'],
        isPinned: true,
        createdAt: initialWorkflow?.createdAt || new Date().toISOString(),
      };

      await onSaveWorkflow(workflow);
      onClose();
    } catch (err) {
      console.error('Failed to save custom workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Custom Niche Workflow & Pipeline Builder
              </h3>
              <p className="text-xs text-neutral-400">
                Design your repeatable production blueprint for your specific content niche
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Workflow Name & Niche Category */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>1. Workflow Identity & Niche</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Pipeline Name:</span>
                <input
                  type="text"
                  placeholder="e.g., My Daily Tech AI Influencer UGC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Short Description:</span>
                <input
                  type="text"
                  placeholder="e.g., High-retention vertical vlogs for TikTok/Reels"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Niche Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {NICHE_OPTIONS.map((opt) => {
                const isSelected = nicheType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setNicheType(opt.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{opt.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-100">{opt.label}</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {nicheType === 'custom' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Enter your custom niche title (e.g., Luxury Watch Reviews, 2D Animated Horror Stories)..."
                  value={customNicheTitle}
                  onChange={(e) => setCustomNicheTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* 2. Persona / Subject DNA Anchor */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              <span>2. Persona & Visual Subject DNA Anchor</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g., 24yo charismatic digital creator with natural makeup, pastel hoodie, direct eye contact with camera, photorealistic skin texture..."
              value={personaAnchor}
              onChange={(e) => setPersonaAnchor(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
              required
            />
            <span className="text-[11px] text-neutral-500 block">
              This master visual lock is injected across all 7 days to guarantee character/object consistency.
            </span>
          </div>

          {/* 3. Camera & Shooting Style */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>3. Camera Blocking & Shooting Style</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Handheld iPhone 16 Pro 4K front-facing camera, subtle handheld motion, eye-level framing, ring-light illumination..."
              value={cameraStyle}
              onChange={(e) => setCameraStyle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          {/* 4. Hook Recipe & Pacing Cadence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
            {/* Hook Archetype */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>4. Hook Archetype</span>
              </label>
              <div className="space-y-1.5">
                {HOOK_OPTIONS.map((h) => {
                  const isSelected = hookArchetype === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setHookArchetype(h.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-neutral-200">
                        <span>{h.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-neutral-500 italic mt-0.5">{h.example}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pacing Cadence & Style Preset */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>5. Pacing & Dialogue Cadence</span>
                </label>
                <div className="space-y-1.5">
                  {PACING_OPTIONS.map((p) => {
                    const isSelected = pacingCadence === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPacingCadence(p.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-200">
                          <span>{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Style Preset */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Visual Style Preset</span>
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as VisualStylePreset)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {STYLE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Locations & Audio Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                Default Locations (Comma separated):
              </label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="e.g. Modern Apartment Living Room, Minimalist Studio"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1 flex items-center gap-1">
                <Mic className="w-3 h-3 text-indigo-400" />
                Audio & Foley Mood Directives:
              </label>
              <input
                type="text"
                value={audioFoleyMood}
                onChange={(e) => setAudioFoleyMood(e.target.value)}
                placeholder="e.g. Crisp vocal isolation, punchy bass sub-drop, subtle room reverb"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Pipeline...' : 'Save & Pin Workflow Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
