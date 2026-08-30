'use client';

import React, { useState } from 'react';
import { X, Sparkles, Video, Image, Mic, Film, Check, UploadCloud } from 'lucide-react';
import { CreatorProfile, CreatorArchetype, AspectRatio, VideoFormatMode, ContentType } from '../types';
import { PRESET_PROFILES } from '../data/presetTemplates';

interface CreatorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: CreatorProfile) => void;
}

export const CreatorSetupModal: React.FC<CreatorSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState('☕ Sarcastic Coffee Mug');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [videoFormatMode, setVideoFormatMode] = useState<VideoFormatMode>('podcast_fixed');
  const [hasReferenceImage, setHasReferenceImage] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [niche, setNiche] = useState('Sarcastic coffee mug roasting corporate 9-to-5 culture');
  const [archetype, setArchetype] = useState<CreatorArchetype>('talking_object');
  const [characterDna, setCharacterDna] = useState(
    'Ceramic navy-blue coffee mug, expressive 3D mouth, rising steam, macro cinematic lighting, shallow depth of field, 8k resolution.'
  );

  if (!isOpen) return null;

  const handleApplyPreset = (preset: CreatorProfile) => {
    setName(preset.name);
    setArchetype(preset.archetype);
    setContentType(preset.contentType);
    setVideoFormatMode(preset.videoFormatMode);
    setHasReferenceImage(preset.hasReferenceImage);
    setNiche(preset.niche);
    setCharacterDna(preset.characterDna);
    setAspectRatio(preset.aspectRatio);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CreatorProfile = {
      id: `profile_${Date.now()}`,
      name,
      archetype,
      contentType,
      videoFormatMode,
      hasReferenceImage,
      niche,
      characterDna,
      aspectRatio,
      visualStyle: archetype === 'talking_object' ? 'Photorealistic Macro with 3D animation' : 'Hyper-Realistic 8k Cinematic',
      tone: 'Engaging, authentic, high-retention',
      targetAudience: 'Reels, TikTok & YouTube Shorts audience',
      createdAt: Date.now(),
    };
    onSaveProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Create New Channel Persona</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Click Presets */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-zinc-400">Popular Creator Presets:</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESET_PROFILES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left text-xs hover:border-indigo-500 hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <div className="font-bold text-zinc-200 line-clamp-1">{preset.name}</div>
                <div className="text-[10px] text-zinc-400 line-clamp-1">{preset.niche}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Persona Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Persona / Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarcastic Coffee Mug or Ayla AI"
              required
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 1. Content Type & Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">Content Type</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContentType('video')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold border transition-all ${
                    contentType === 'video'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <Video className="h-3.5 w-3.5 text-indigo-400" /> Video
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('post')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold border transition-all ${
                    contentType === 'post'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <Image className="h-3.5 w-3.5 text-pink-400" /> Post
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="9:16">9:16 (Reels / TikTok / Shorts)</option>
                <option value="16:9">16:9 (Landscape YouTube)</option>
                <option value="1:1">1:1 (Square Feed)</option>
              </select>
            </div>
          </div>

          {/* 2. Format Mode (Fixed Setup / Podcast vs Multi-Scene Story) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Video Scene Architecture</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVideoFormatMode('podcast_fixed')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                  videoFormatMode === 'podcast_fixed'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Mic className="h-3.5 w-3.5 text-amber-400" />
                  <span>Podcast / Fixed Frame</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  1 Master Image frame used for all 10s clips (100% character & background consistency)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVideoFormatMode('cinematic_multi')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                  videoFormatMode === 'cinematic_multi'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Film className="h-3.5 w-3.5 text-purple-400" />
                  <span>Cinematic Multi-Scene</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Different locations/actions per 10s clip with character DNA locked
                </p>
              </button>
            </div>
          </div>

          {/* 3. Perspective / Concept description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Channel Perspective & Content Theme (In your own words)
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Sarcastic talking potato giving gym motivation, or AI girl teaching marketing"
              required
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 4. Reference Image Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Character Already Created?</div>
                <div className="text-[10px] text-zinc-400">
                  Generates prompts tailored for uploading your reference image into Google Flow
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasReferenceImage}
              onChange={(e) => setHasReferenceImage(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Character DNA Anchor */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Visual Appearance / Prompt Details
            </label>
            <textarea
              value={characterDna}
              onChange={(e) => setCharacterDna(e.target.value)}
              rows={2}
              required
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
