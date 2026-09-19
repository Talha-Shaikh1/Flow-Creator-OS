'use client';

import React, { useState } from 'react';
import { DailyPhotoPost } from '@/types';
import {
  Camera,
  Copy,
  Check,
  Coffee,
  Sparkles,
  Sun,
  Laptop,
  Image as ImageIcon,
  Share2,
  Bookmark,
  Shirt,
  Clapperboard,
  Search,
  Building2,
} from 'lucide-react';

interface Props {
  photoPosts?: DailyPhotoPost[];
  dayName: string;
  dayNumber: number;
}

export function DailyPhotoPostsView({ photoPosts, dayName, dayNumber }: Props) {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  if (!photoPosts || photoPosts.length === 0) {
    return null;
  }

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyCaption = (post: DailyPhotoPost) => {
    const text = `${post.caption}\n\n${post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedCaptionId(post.id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };

  const getCategoryIcon = (category: DailyPhotoPost['category']) => {
    switch (category) {
      case 'Film Set BTS':
        return <Clapperboard className="w-4 h-4 text-violet-400" />;
      case 'Forensic Prop Clue':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'Candid Set Lore':
        return <Building2 className="w-4 h-4 text-sky-400" />;
      case 'Desk / BTS Flatlay':
        return <Laptop className="w-4 h-4 text-emerald-400" />;
      case 'Cafe Candid':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'Mirror OOTD':
        return <Shirt className="w-4 h-4 text-indigo-400" />;
      case 'Golden Hour Street':
        return <Sun className="w-4 h-4 text-orange-400" />;
      default:
        return <Camera className="w-4 h-4 text-emerald-400" />;
    }
  };

  const isDramaBTS = photoPosts.some(
    (p) =>
      p.category === 'Film Set BTS' ||
      p.category === 'Forensic Prop Clue' ||
      p.category === 'Candid Set Lore'
  );

  return (
    <div className="space-y-4 pt-4 border-t border-neutral-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
              isDramaBTS
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
            }`}
          >
            {isDramaBTS ? <Clapperboard className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>
                {isDramaBTS
                  ? `Day ${dayNumber} Hollywood On-Set BTS & Forensic Prop Clues`
                  : `Day ${dayNumber} Daily Lifestyle Photo Posts`}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  isDramaBTS
                    ? 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                    : 'bg-pink-500/10 text-pink-300 border-pink-500/20'
                }`}
              >
                {isDramaBTS ? 'In-Universe Production Deck • 4 Authentic Stills' : 'Anti-AI Realism • 4 Posts'}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              {isDramaBTS
                ? 'Hollywood soundstage BTS, macro evidence props & mood stills from varying episode set angles.'
                : 'Photorealistic candid prompts (35mm/iPhone UGC) engineered with natural skin texture, visible pores & cheek mole lock.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {photoPosts.map((post, idx) => {
          const isExpanded = expandedPromptId === post.id;
          return (
            <div
              key={post.id}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                      {getCategoryIcon(post.category)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-200">
                        {idx + 1}. {post.title}
                      </span>
                      <span className="text-[10px] block text-neutral-400 font-mono">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      post.category === 'Film Set BTS'
                        ? 'bg-violet-950/60 text-violet-300 border-violet-800/60'
                        : post.category === 'Forensic Prop Clue'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        : post.category === 'Candid Set Lore'
                        ? 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {post.category === 'Film Set BTS'
                      ? '🎬 On-Set BTS'
                      : post.category === 'Forensic Prop Clue'
                      ? '🔍 Forensic Clue'
                      : post.category === 'Candid Set Lore'
                      ? '🌃 In-Universe Lore'
                      : 'Feed Post'}
                  </span>
                </div>

                {/* Outfit / Subject Focus preview */}
                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-300 flex items-start gap-2">
                  {post.category === 'Forensic Prop Clue' ? (
                    <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : post.category === 'Film Set BTS' ? (
                    <Clapperboard className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                  ) : (
                    <Shirt className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-2">
                    <strong className="text-neutral-200">
                      {post.category === 'Forensic Prop Clue'
                        ? 'Evidence Focus:'
                        : post.category === 'Film Set BTS'
                        ? 'On-Set Action:'
                        : 'Outfit / Style:'}
                    </strong>{' '}
                    {post.outfit}
                  </span>
                </div>

                {/* Caption preview */}
                <div className="p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800/50 text-[11px] text-neutral-300 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Caption & Hashtags:
                  </span>
                  <p className="italic text-neutral-300 line-clamp-2">&ldquo;{post.caption}&rdquo;</p>
                  <p className="text-[10px] text-indigo-400 font-mono truncate">
                    {post.hashtags.join(' ')}
                  </p>
                </div>

                {/* Prompt Preview */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Anti-AI Photorealistic Prompt:
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedPromptId(isExpanded ? null : post.id)}
                      className="text-[10px] text-neutral-400 hover:text-neutral-200"
                    >
                      {isExpanded ? 'Collapse' : 'Expand full prompt'}
                    </button>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 ${
                      isExpanded ? 'max-h-60 overflow-y-auto' : 'line-clamp-3'
                    }`}
                  >
                    {post.imagePrompt}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCaption(post)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-800 transition flex items-center gap-1.5"
                  title="Copy caption and hashtags to clipboard"
                >
                  {copiedCaptionId === post.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span>{copiedCaptionId === post.id ? 'Copied Caption' : 'Copy Caption'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(post.imagePrompt, post.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  title="Copy photorealistic image prompt for Midjourney / Flux / Flow"
                >
                  {copiedPromptId === post.id ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedPromptId === post.id ? 'Copied Image Prompt' : 'Copy Image Prompt'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
