'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WeeklyBatchDelivery } from '@/types';
import { useUserRole } from '@/lib/auth/useUserRole';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import { TokenBurnBadge } from '@/components/studio/TokenBurnBadge';
import {
  Clapperboard,
  Sparkles,
  ShieldCheck,
  Calendar as CalendarIcon,
  Users,
  History,
  RefreshCw,
  Zap,
  Menu,
  X,
  Crown,
  ChevronDown,
  Layers,
  Camera,
  Tv,
  Wrench,
} from 'lucide-react';

interface AppNavbarProps {
  batch?: WeeklyBatchDelivery | null;
  onOpenCalendar?: () => void;
  onOpenVault?: () => void;
  onOpenHistory?: () => void;
  onReset?: () => void;
}

export function AppNavbar({
  batch,
  onOpenCalendar,
  onOpenVault,
  onOpenHistory,
  onReset,
}: AppNavbarProps) {
  const pathname = usePathname();
  const { isSuperAdmin, isLoading } = useUserRole();

  // Dropdown states
  const [personasOpen, setPersonasOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const personasRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personasRef.current && !personasRef.current.contains(event.target as Node)) {
        setPersonasOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setPersonasOpen(false);
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const isPersonaActive =
    pathname.startsWith('/influencer') || pathname.startsWith('/pet-comedy');

  const hasTools = Boolean(onOpenCalendar || onOpenVault || onOpenHistory);

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/95 sticky top-0 z-40 backdrop-blur-md w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-lg blur-[2px] opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/70 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src="/logo-emblem.png"
                  alt="Flow Creator OS"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                FlowCreator
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent font-black text-sm sm:text-base">
                OS
              </span>
              {isSuperAdmin && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 ml-1">
                  ADMIN
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* 2. Center: Minimalist Primary Tabs */}
        <nav className="hidden md:flex items-center bg-neutral-900/80 p-1 rounded-xl border border-neutral-800/80 text-xs shadow-inner gap-1">
          {/* Studio Tab */}
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
              isActive('/')
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Clapperboard className={`w-3.5 h-3.5 ${isActive('/') ? 'text-indigo-400' : 'text-neutral-400'}`} />
            <span>Studio</span>
          </Link>

          {/* CreatorOps Tab */}
          <Link
            href="/creator-ops"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              isActive('/creator-ops')
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-emerald-300 hover:bg-neutral-800/50'
            }`}
            title="Daily Multi-Account Operations Hub & WhatsApp Reminders"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>CreatorOps</span>
          </Link>

          {/* Personas / Dedicated Studios Dropdown */}
          <div className="relative" ref={personasRef}>
            <button
              type="button"
              onClick={() => setPersonasOpen(!personasOpen)}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 font-medium ${
                isPersonaActive || personasOpen
                  ? 'bg-neutral-800 text-white border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Personas</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${personasOpen ? 'rotate-180' : ''}`} />
            </button>

            {personasOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Select Studio Persona
                </div>

                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition"
                >
                  <Clapperboard className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-semibold">General Studio</div>
                    <div className="text-[10px] text-neutral-400">Multi-Character Drama & Noir</div>
                  </div>
                </Link>

                <Link
                  href="/influencer"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition"
                >
                  <Camera className="w-4 h-4 text-pink-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-pink-300">Elena VIP Influencer</div>
                    <div className="text-[10px] text-neutral-400">UK/EU Podcast & Lifestyle</div>
                  </div>
                </Link>

                <Link
                  href="/pet-comedy"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition"
                >
                  <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-300">Pet Comedy Series</div>
                    <div className="text-[10px] text-neutral-400">Joe & Nova Sitcom Studio</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Admin OS (Only for Super Admins) */}
          {isSuperAdmin && (
            <Link
              href="/admin"
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-bold ${
                isActive('/admin')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'text-amber-400/90 hover:text-amber-200 hover:bg-amber-500/10'
              }`}
              title="Master Governance Command Center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin OS</span>
            </Link>
          )}
        </nav>

        {/* 3. Right: Consolidated Tools & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Consolidated Studio Tools Dropdown (Calendar, Vault, History) */}
          {hasTools && (
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`px-2.5 py-1.5 text-xs rounded-xl transition flex items-center gap-1.5 border shadow-sm ${
                  toolsOpen
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800'
                }`}
                title="Studio Tools (Calendar, Vault, History)"
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-medium">Tools</span>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Studio Modals
                  </div>

                  {onOpenCalendar && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCalendar();
                        setToolsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition text-left"
                    >
                      <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Content Calendar</div>
                        <div className="text-[10px] text-neutral-400">7-Day schedule & sync</div>
                      </div>
                    </button>
                  )}

                  {onOpenVault && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenVault();
                        setToolsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition text-left"
                    >
                      <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-semibold">DNA Vault</div>
                        <div className="text-[10px] text-neutral-400">Characters & seed library</div>
                      </div>
                    </button>
                  )}

                  {onOpenHistory && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenHistory();
                        setToolsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition text-left"
                    >
                      <History className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Production History</div>
                        <div className="text-[10px] text-neutral-400">Generated batches & stats</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Token Burn Badge */}
          <TokenBurnBadge currentReport={batch?.tokenUsage} />

          {/* Reset / New Spec Button (only if batch active) */}
          {batch && onReset && (
            <button
              onClick={onReset}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 border border-neutral-800"
              title="Create New Story Spec"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Spec</span>
            </button>
          )}

          {/* Clerk Auth Sync (Login or Avatar) */}
          <ClerkAuthSync />

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800/80 bg-neutral-950/98 px-4 py-4 space-y-3 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                isActive('/')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clapperboard className="w-4 h-4 text-indigo-400" />
                <span>General Studio</span>
              </div>
            </Link>

            <Link
              href="/creator-ops"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/creator-ops')
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                  : 'text-emerald-400/90 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>CreatorOps Hub</span>
              </div>
            </Link>

            <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Persona Studios
            </div>

            <Link
              href="/influencer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-neutral-300 hover:bg-neutral-900"
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-pink-400" />
                <span>Elena VIP Influencer</span>
              </div>
            </Link>

            <Link
              href="/pet-comedy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-neutral-300 hover:bg-neutral-900"
            >
              <div className="flex items-center gap-2.5">
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Pet Comedy Studio</span>
              </div>
            </Link>

            {isSuperAdmin && (
              <>
                <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Admin OS Controls
                </div>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive('/admin')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-amber-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Command Center</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Super</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Quick Action Buttons */}
          {hasTools && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80">
              {onOpenCalendar && (
                <button
                  onClick={() => {
                    onOpenCalendar();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
                >
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span>Calendar</span>
                </button>
              )}

              {onOpenVault && (
                <button
                  onClick={() => {
                    onOpenVault();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Vault</span>
                </button>
              )}

              {onOpenHistory && (
                <button
                  onClick={() => {
                    onOpenHistory();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
                >
                  <History className="w-4 h-4 text-purple-400" />
                  <span>History</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
