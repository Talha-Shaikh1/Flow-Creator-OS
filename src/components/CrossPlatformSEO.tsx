'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Hash, Sparkles } from 'lucide-react';
import { PlatformMetadata } from '../types';

interface CrossPlatformSEOProps {
  metadata: PlatformMetadata;
}

type PlatformTab = 'instagram' | 'tiktok' | 'youtube' | 'threads' | 'pinterest' | 'facebook';

export const CrossPlatformSEO: React.FC<CrossPlatformSEOProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('instagram');
  const [copied, setCopied] = useState(false);

  const getPlatformContent = (tab: PlatformTab) => {
    switch (tab) {
      case 'instagram':
        return `${metadata.instagram.hookCaption}\n\n${metadata.instagram.bodyCaption}\n\n${metadata.instagram.callToAction}\n\n${metadata.instagram.hashtags.join(' ')}`;
      case 'tiktok':
        return `[TEXT OVERLAY HOOK]: ${metadata.tiktok.textOverlayHook}\n\n[CAPTION]: ${metadata.tiktok.caption}\n\n[SEO SEARCH KEYWORDS]: ${metadata.tiktok.seoKeywords.join(', ')}\n\n[AUDIO VIBE]: ${metadata.tiktok.audioVibe}`;
      case 'youtube':
        return `[TITLE]: ${metadata.youtubeShorts.title}\n\n[DESCRIPTION]:\n${metadata.youtubeShorts.description}\n\n[TAGS]:\n${metadata.youtubeShorts.tags.join(', ')}\n\n[PINNED COMMENT]:\n${metadata.youtubeShorts.pinnedComment}`;
      case 'threads':
        return metadata.threads.threadPost;
      case 'pinterest':
        return `[PIN TITLE]: ${metadata.pinterest.pinTitle}\n\n[DESCRIPTION]:\n${metadata.pinterest.pinDescription}\n\n[SUGGESTED BOARD]: ${metadata.pinterest.suggestedBoard}\n\n[KEYWORDS]: ${metadata.pinterest.keywords.join(', ')}`;
      case 'facebook':
        return metadata.facebook.storyCaption;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const text = getPlatformContent(activeTab);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: PlatformTab; label: string; icon: string; badge: string }[] = [
    { id: 'instagram', label: 'Instagram', icon: '📸', badge: 'Reels & Hashtags' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵', badge: 'SEO & Text Hook' },
    { id: 'youtube', label: 'YouTube Shorts', icon: '▶️', badge: 'High CTR Title' },
    { id: 'threads', label: 'Threads / X', icon: '🧵', badge: 'Viral Thread' },
    { id: 'pinterest', label: 'Pinterest', icon: '📌', badge: 'Search Pin' },
    { id: 'facebook', label: 'Facebook', icon: '📘', badge: 'Story Post' },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Share2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Cross-Platform Growth & SEO Matrix</h2>
            <p className="text-xs text-zinc-400">Tailored metadata optimized for platform search algorithms</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied to Clipboard!' : `Copy ${tabs.find((t) => t.id === activeTab)?.label} Pack`}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white shadow-md ring-1 ring-zinc-700'
                : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">({tab.badge})</span>
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="mt-4 rounded-xl border border-zinc-850 bg-zinc-900/60 p-4">
        {activeTab === 'instagram' && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-zinc-400">Hook Line:</span>
              <p className="mt-1 font-semibold text-zinc-100">{metadata.instagram.hookCaption}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Body Caption:</span>
              <p className="mt-1 text-zinc-300 whitespace-pre-line">{metadata.instagram.bodyCaption}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Call to Action:</span>
              <p className="mt-1 text-amber-300">{metadata.instagram.callToAction}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {metadata.instagram.hashtags.map((tag, i) => (
                <span key={i} className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-400 border border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tiktok' && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-zinc-400">On-Screen 3s Text Hook Overlay:</span>
              <p className="mt-1 font-mono font-bold text-amber-300 bg-black/40 p-2 rounded border border-white/5">
                {metadata.tiktok.textOverlayHook}
              </p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">TikTok Caption:</span>
              <p className="mt-1 text-zinc-200">{metadata.tiktok.caption}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">TikTok SEO Keywords (Search-Optimized):</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {metadata.tiktok.seoKeywords.map((kw, i) => (
                  <span key={i} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 border border-emerald-500/20">
                    🔍 {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Recommended Audio Vibe:</span>
              <p className="mt-1 text-zinc-300 italic">🎵 {metadata.tiktok.audioVibe}</p>
            </div>
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-zinc-400">High CTR Clickable Title:</span>
              <p className="mt-1 font-bold text-white text-sm bg-black/40 p-2 rounded border border-white/5">
                {metadata.youtubeShorts.title}
              </p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">SEO Description:</span>
              <p className="mt-1 text-zinc-300 whitespace-pre-line">{metadata.youtubeShorts.description}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Tags:</span>
              <p className="mt-1 text-zinc-400 font-mono text-[11px]">{metadata.youtubeShorts.tags.join(', ')}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Pinned Comment (Engagement Provoker):</span>
              <p className="mt-1 text-indigo-300 italic bg-indigo-950/20 p-2 rounded border border-indigo-500/20">
                💬 {metadata.youtubeShorts.pinnedComment}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'threads' && (
          <div className="space-y-2 text-xs">
            <span className="font-bold text-zinc-400">Threads / X Post:</span>
            <p className="text-zinc-200 whitespace-pre-line leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
              {metadata.threads.threadPost}
            </p>
          </div>
        )}

        {activeTab === 'pinterest' && (
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-zinc-400">Pin Title:</span>
              <p className="mt-1 font-bold text-white">{metadata.pinterest.pinTitle}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Pin Description:</span>
              <p className="mt-1 text-zinc-300">{metadata.pinterest.pinDescription}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Suggested Board:</span>
              <p className="mt-1 text-pink-300">📌 {metadata.pinterest.suggestedBoard}</p>
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="space-y-2 text-xs">
            <span className="font-bold text-zinc-400">Facebook Story / Long-form Post:</span>
            <p className="text-zinc-200 whitespace-pre-line leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
              {metadata.facebook.storyCaption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
