'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Flame,
  Music,
  Edit3,
  Bot,
  User,
} from 'lucide-react';
import { AIProviderConfig } from '@/lib/engine/llm-provider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface DirectorCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productionContext: {
    seasonStory?: any | null;
    characterBible?: any | null;
    selectedEpisodeNumber?: number | null;
    episodeProduction?: any | null;
    clipsBreakdown?: any[] | null;
    framePrompts?: any[] | null;
    videoPrompts?: any[] | null;
  };
  aiConfig?: AIProviderConfig;
}

const QUICK_PROMPTS = [
  {
    icon: ImageIcon,
    label: 'Thumbnail Prompts',
    query:
      'Generate 2 concise, high-CTR YouTube thumbnail prompts in 16:9 format (--ar 16:9) for Midjourney/Flux for this episode, with a bold 2-word text overlay.',
  },
  {
    icon: Flame,
    label: '5 Punchy Viral Titles',
    query:
      'Suggest 5 short, viral YouTube titles for this episode for A/B testing. Keep each title punchy and under 60 characters.',
  },
  {
    icon: Music,
    label: 'Music & Sound Cues',
    query:
      'Give a concise 3-bullet breakdown of the background music (mood, instruments, and 1 AI music prompt) for this episode. Keep it brief and simple.',
  },
  {
    icon: Edit3,
    label: 'Cliffhanger Polish',
    query:
      'Give 2 short, powerful variations of the ending cliffhanger dialogue for this episode.',
  },
];

function FormattedChatMessage({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim();
          const code = lines.replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <div
              key={idx}
              className="my-2 rounded-xl bg-black/80 border border-neutral-800 p-2.5 font-mono text-[11px] text-purple-200 select-all"
            >
              <pre className="whitespace-pre-wrap overflow-x-auto">{code}</pre>
            </div>
          );
        }

        const cleanLines = part.split('\n').map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1" />;

          const isHeading = trimmed.startsWith('#');
          const headingText = trimmed.replace(/^#+\s*/, '').replace(/[*_~`]/g, '');
          if (isHeading) {
            return (
              <div key={lIdx} className="font-bold text-white text-xs pt-1 text-purple-300">
                {headingText}
              </div>
            );
          }

          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
          const bulletText = trimmed.replace(/^[-*•]\s*/, '');

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-1.5 pl-1 text-neutral-300">
                <span className="text-purple-400 font-bold shrink-0">•</span>
                <span>{bulletText.replace(/[*_~`]/g, '')}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className="text-neutral-200">
              {trimmed.replace(/[*_~`]/g, '')}
            </p>
          );
        });

        return <div key={idx} className="space-y-1">{cleanLines}</div>;
      })}
    </div>
  );
}

export function DirectorCopilotDrawer({
  isOpen,
  onClose,
  productionContext,
  aiConfig,
}: DirectorCopilotDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello Director! AI Copilot ready hai live episode context k sath.\n\nKoi bhi sawal pochein, jaise:\n- YouTube thumbnail prompts\n- 5 viral titles\n- Background music & sound cues\n- Dialogue polish',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/drama-series/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: productionContext,
          aiConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from Director AI');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Director Agent Notice:** ${err.message || 'Error communicating with AI'}. Please check your AI API key in settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0c0c0e] border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Director AI Copilot</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Live Context
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 truncate max-w-[280px]">
                {productionContext.episodeProduction
                  ? `Episode ${productionContext.episodeProduction.episodeNumber}: ${productionContext.episodeProduction.episodeTitle}`
                  : productionContext.seasonStory?.seasonTitle || 'Active Production'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/40 overflow-x-auto flex gap-2 no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                disabled={isSending}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-[11px] text-neutral-300 hover:text-purple-200 transition shrink-0 flex items-center gap-1.5 font-medium disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 border ${
                    isUser
                      ? 'bg-purple-950/70 border-purple-500/50 text-purple-100'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
                  }`}
                >
                  <FormattedChatMessage content={m.content} />

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="hover:text-purple-300 transition flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-2.5 items-center text-xs text-purple-300 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Director AI is generating response with live episode context...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for YouTube thumbnails, viral titles, dialogue tweaks..."
              disabled={isSending}
              className="flex-1 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition shadow-md shadow-purple-600/20 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
