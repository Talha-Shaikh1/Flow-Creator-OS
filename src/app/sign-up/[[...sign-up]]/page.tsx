'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { flowCreatorClerkTheme } from '@/lib/auth/clerk-theme';
import { Clapperboard, Sparkles, Film, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none translate-y-1/2" />

      {/* Top Bar with Return Link */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-neutral-400 hover:text-white transition group"
        >
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition">
            <ArrowLeft className="w-4 h-4 text-neutral-300 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs font-semibold">Back to Studio</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono text-neutral-400">FlowCreator OS Registration</span>
        </div>
      </header>

      {/* Main Content: Split / Centered Layout */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 flex-1">
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join FlowCreator OS Today</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Clapperboard className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Start Directing <span className="text-indigo-400">Now</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
              Create an account to unlock full-week Google Flow Veo batch generations, persistent character vaults, and cloud calendar sync.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <Film className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Infinite Creative Continuity</h4>
                <p className="text-[11px] text-neutral-400">Keep character clothing, spatial anchors, and narrative flow intact.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">First User Auto-Admin Promotion</h4>
                <p className="text-[11px] text-neutral-400">The first creator to register claims Super Admin governance for the platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Clerk Sign Up Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <SignUp
              appearance={flowCreatorClerkTheme}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 text-center text-xs text-neutral-500 relative z-10 border-t border-neutral-900">
        FlowCreator OS • Powered by Google Gemini 2.5 Flash & Veo 2 Prompt Direction
      </footer>
    </div>
  );
}
