'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { Sparkles, Key, Brain, UserPlus, TrendingUp, LogIn, LayoutDashboard, Film, ChevronDown } from 'lucide-react';
import { CreatorProfile } from '../types';

interface NavbarProps {
  activeProfile: CreatorProfile | null;
  profiles: CreatorProfile[];
  onSelectProfile: (id: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenVaultModal: () => void;
  onOpenFlywheelModal: () => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  hasApiKey: boolean;
  vaultCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenNewProfileModal,
  onOpenApiKeyModal,
  onOpenVaultModal,
  onOpenFlywheelModal,
  onGeneratePlan,
  isGenerating,
  hasApiKey,
  vaultCount,
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-[#050816]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 gap-2">
        {/* Left: Brand & Navigation Tabs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-[#26D9E6]/30 shadow-md bg-[#050816] flex items-center justify-center">
              <img
                src="/logo.png"
                alt="FlowCreator OS Logo"
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] bg-clip-text text-transparent">
                FlowCreator
              </span>
              <span className="rounded bg-[#9B4DFF]/20 px-1 py-0.2 text-[10px] font-bold text-[#26D9E6] border border-[#26D9E6]/30">
                OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 ml-1 sm:ml-3 border-l border-cyan-950/80 pl-2 sm:pl-3">
            <Link
              href="/studio"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pathname === '/studio'
                  ? 'bg-[#26D9E6]/15 text-[#26D9E6] border border-[#26D9E6]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Studio</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-[#9B4DFF]/15 text-[#9B4DFF] border border-[#9B4DFF]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vault</span>
            </Link>
          </nav>
        </div>

        {/* Center: Compact Persona Selector */}
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          {profiles.length > 0 && (
            <div className="relative max-w-[130px] sm:max-w-[200px]">
              <select
                value={activeProfile?.id || ''}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="w-full appearance-none truncate rounded-lg border border-cyan-950/80 bg-[#0a0f2b] px-2.5 py-1 pr-6 text-xs font-semibold text-zinc-200 hover:border-[#26D9E6]/50 focus:border-[#26D9E6] focus:outline-none cursor-pointer"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-zinc-400" />
            </div>
          )}

          <button
            onClick={onOpenNewProfileModal}
            className="flex items-center gap-1 rounded-lg border border-cyan-950/80 bg-[#0a0f2b] p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium text-zinc-300 hover:bg-[#121a44] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Create New Persona"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#26D9E6]" />
            <span className="hidden md:inline text-[11px]">New</span>
          </button>
        </div>

        {/* Right: Action Controls & User Account */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenVaultModal}
            className="relative flex items-center gap-1 rounded-lg border border-cyan-950/80 bg-[#0a0f2b] p-1.5 sm:px-2 sm:py-1 text-xs text-zinc-300 hover:bg-[#121a44] hover:text-white transition-colors cursor-pointer"
            title="Anti-Repetition Memory Vault"
          >
            <Brain className="h-3.5 w-3.5 text-emerald-400" />
            {vaultCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                {vaultCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenFlywheelModal}
            className="flex items-center gap-1 rounded-lg border border-cyan-950/80 bg-[#0a0f2b] p-1.5 sm:px-2 sm:py-1 text-xs text-zinc-300 hover:bg-[#121a44] hover:text-white transition-colors cursor-pointer"
            title="Growth Diagnostics & Learning Flywheel"
          >
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1 rounded-lg border border-cyan-950/80 bg-[#0a0f2b] p-1.5 sm:px-2 sm:py-1 text-xs text-zinc-300 hover:bg-[#121a44] hover:text-white transition-colors cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="h-3.5 w-3.5 text-[#26D9E6]" />
            <span className={`h-1.5 w-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-500'}`} />
          </button>

          <button
            onClick={onGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#26D9E6] via-[#9B4DFF] to-[#D84DFF] px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-white shadow-md shadow-[#26D9E6]/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 text-[#26D9E6] ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate Plan'}</span>
            <span className="sm:hidden">{isGenerating ? '...' : 'Plan'}</span>
          </button>

          {/* User Account / Profile Button */}
          {mounted && isLoaded && (
            <div className="flex items-center pl-1">
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
                  className="flex items-center gap-1 rounded-lg border border-[#26D9E6]/30 bg-[#090f2b] px-2.5 py-1 text-xs font-semibold text-[#26D9E6] hover:bg-[#131e50] hover:text-white transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
