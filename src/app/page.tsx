'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { 
  Sparkles, ArrowRight, CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-[#F5F7FA] selection:bg-[#26D9E6] selection:text-[#050816]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-cyan-950/60 bg-[#050816]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[#26D9E6]/30 shadow-lg shadow-[#26D9E6]/20 bg-[#050816] flex items-center justify-center">
              <img src="/logo.png" alt="FlowCreator OS" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] bg-clip-text text-transparent">
                FlowCreator
              </span>
              <span className="rounded bg-[#9B4DFF]/20 px-1.5 py-0.2 text-xs font-bold text-[#26D9E6] border border-[#26D9E6]/30">
                OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              My Vault
            </Link>

            {mounted && isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center rounded-full border border-[#26D9E6]/30 p-0.5">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'h-7 w-7 rounded-full border border-[#26D9E6]/40',
                        },
                      }}
                    />
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-lg border border-zinc-800 bg-[#090d22] px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-[#121a42] transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}

            <Link
              href="/studio"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#26D9E6] to-[#9B4DFF] px-4 py-1.5 text-xs font-extrabold text-[#050816] shadow-lg shadow-[#26D9E6]/25 hover:opacity-95 active:scale-98 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#26D9E6]/20 via-[#9B4DFF]/25 to-[#D84DFF]/20 blur-[140px]" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#26D9E6]/30 bg-[#090e28]/80 px-4 py-1 text-xs font-semibold text-[#26D9E6] shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-[#26D9E6] animate-pulse" />
            <span>Built Specifically for Google Flow (Veo) & Short-Form Video</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
            Automate Your Content. <br />
            <span className="bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] bg-clip-text text-transparent">
              Direct Every 10-Second Scene.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
            Stop wasting hours writing repetitive prompts. Generate a full 7-day content schedule tailored with 
            <strong className="text-zinc-200"> 10s Google Flow scene prompts</strong>, 
            <strong className="text-zinc-200"> eye-contact acting cues</strong>, 
            <strong className="text-zinc-200"> lip-sync dialogues</strong>, and 
            <strong className="text-zinc-200"> cross-platform SEO metadata</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/studio"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#26D9E6]/25 hover:opacity-95 active:scale-98 transition-all"
            >
              <Sparkles className="h-4 w-4 text-[#26D9E6]" />
              <span>Generate 7-Day Plan (Free)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#0a0f2b]/80 px-6 py-3.5 text-sm font-bold text-zinc-300 hover:bg-[#121a44] hover:text-white transition-all"
            >
              <Layers className="h-4 w-4 text-[#26D9E6]" />
              <span>Explore Prompt Vault</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#26D9E6]" /> 100% Free Gemini Flash Tier
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#9B4DFF]" /> Google Flow 10s Architecture
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D84DFF]" /> 1-Click Multi-Platform Copy
            </span>
          </div>
        </div>
      </section>

      {/* How It Works (3 Simple Steps) */}
      <section className="border-t border-cyan-950/40 bg-[#070b20]/60 py-16 sm:py-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#26D9E6]">Streamlined Workflow</span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">How FlowCreator OS Works</h2>
            <p className="mt-2 text-xs text-zinc-400">From zero idea to 7 ready-to-render viral videos in under 60 seconds</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border border-cyan-950/60 bg-[#0a0f2a]/70 p-6 space-y-3 hover:border-[#26D9E6]/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26D9E6]/15 text-[#26D9E6] font-black text-base border border-[#26D9E6]/30">
                1
              </div>
              <h3 className="text-base font-bold text-white">Define Your Persona & Format</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose between a <strong className="text-zinc-200">Talking Object</strong> (e.g. Sarcastic Coffee Mug), <strong className="text-zinc-200">AI Human Influencer</strong> (Ayla AI), or <strong className="text-zinc-200">Faceless Niche</strong>. Choose <em>Fixed Podcast Frame</em> or <em>Cinematic Multi-Scene</em>.
              </p>
            </div>

            <div className="relative rounded-2xl border border-purple-950/60 bg-[#0a0f2a]/70 p-6 space-y-3 hover:border-[#9B4DFF]/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B4DFF]/15 text-[#9B4DFF] font-black text-base border border-[#9B4DFF]/30">
                2
              </div>
              <h3 className="text-base font-bold text-white">AI Directs 10-Second Scenes</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                FlowCreator synthesizes a 7-day calendar. Each day is split into 3 micro-clips with <strong className="text-zinc-200">exact spoken dialogue</strong>, <strong className="text-zinc-200">eye-contact cues</strong>, camera motion, and BGM music prompts.
              </p>
            </div>

            <div className="relative rounded-2xl border border-pink-950/60 bg-[#0a0f2a]/70 p-6 space-y-3 hover:border-[#D84DFF]/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D84DFF]/15 text-[#D84DFF] font-black text-base border border-[#D84DFF]/30">
                3
              </div>
              <h3 className="text-base font-bold text-white">1-Click Copy & Post Everywhere</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste prompts into Google Flow or Midjourney to render. Copy tailored SEO captions & hashtags for <strong className="text-zinc-200">Instagram Reels, TikTok, YouTube Shorts, Threads, and Pinterest</strong> with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-16 sm:py-20 border-t border-cyan-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B4DFF]">Why It Outperforms Generic Tools</span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Engineered for Social Media Algorithms</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800/80 bg-[#080d26]/80 p-5 space-y-3 hover:border-[#26D9E6]/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26D9E6]/10 text-[#26D9E6] border border-[#26D9E6]/25 text-xl">
                🥑
              </div>
              <h3 className="text-sm font-bold text-white">Talking Objects & Metaphors</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Turn coffee mugs, avocados, and gadgets into high-retention satirical philosophers giving career & dating advice.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-[#080d26]/80 p-5 space-y-3 hover:border-[#9B4DFF]/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B4DFF]/10 text-[#9B4DFF] border border-[#9B4DFF]/25 text-xl">
                🎙️
              </div>
              <h3 className="text-sm font-bold text-white">100% Studio Consistency</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Podcast mode generates 1 Master Keyframe to reuse across all 10s clips, locking character faces and studio backgrounds.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-[#080d26]/80 p-5 space-y-3 hover:border-[#D84DFF]/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D84DFF]/10 text-[#D84DFF] border border-[#D84DFF]/25 text-xl">
                🎭
              </div>
              <h3 className="text-sm font-bold text-white">7-Day Emotional Diversity</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rotates 7 viral psychological triggers (Shock, Empathy, Controversy, Satire, Epiphany, Reality Check, Inspiration).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-[#080d26]/80 p-5 space-y-3 hover:border-[#26D9E6]/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26D9E6]/10 text-[#26D9E6] border border-[#26D9E6]/25 text-xl">
                🔬
              </div>
              <h3 className="text-sm font-bold text-white">Smart Growth Diagnostics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Diagnoses whether a drop-off was a 3-second hook issue, SEO tag problem, or CTA issue without panic niche-pivoting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-cyan-950/40 bg-[#070b20]/70 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-white sm:text-3xl">FlowCreator OS vs. ChatGPT</h2>
            <p className="mt-2 text-xs text-zinc-400">Why specialized video directing beats generic chatbot outputs</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cyan-950/60 bg-[#0a0f2b]/60">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyan-950/80 bg-[#0c1333] text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5 sm:p-4">Feature</th>
                  <th className="p-3.5 sm:p-4 text-rose-400">Generic Chatbots</th>
                  <th className="p-3.5 sm:p-4 text-[#26D9E6] bg-[#26D9E6]/10">FlowCreator OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-950/40 text-zinc-300">
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-white">Google Flow 10s Timing</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">❌ Long random paragraphs</td>
                  <td className="p-3.5 sm:p-4 text-[#26D9E6] font-bold bg-[#26D9E6]/5">✅ Timed 0-10s scenes & lip-sync</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-white">Character & Studio Consistency</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">❌ Faces & rooms change every time</td>
                  <td className="p-3.5 sm:p-4 text-[#26D9E6] font-bold bg-[#26D9E6]/5">✅ Master Frame & Anchor DNA</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-white">Anti-Repetition Memory</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">❌ Repeats the same 5 ideas</td>
                  <td className="p-3.5 sm:p-4 text-[#26D9E6] font-bold bg-[#26D9E6]/5">✅ Auto-locks past topics in vault</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-white">Cross-Platform SEO Matrix</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">❌ 1 generic caption</td>
                  <td className="p-3.5 sm:p-4 text-[#26D9E6] font-bold bg-[#26D9E6]/5">✅ 6 Tailored packs (Insta, TikTok, YT...)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="relative py-16 sm:py-20 border-t border-cyan-950/60">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 space-y-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to scale your AI channel in 2026?
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Launch the studio and generate your first 7-day Google Flow ready production batch in seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#26D9E6]/25 hover:opacity-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Creator Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-950/60 py-8 text-center text-xs text-zinc-600 bg-[#030611]">
        <p>© 2026 FlowCreator OS. Built for AI creators & Google Flow.</p>
      </footer>
    </div>
  );
}
