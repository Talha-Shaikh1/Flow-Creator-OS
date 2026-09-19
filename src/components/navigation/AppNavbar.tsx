'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Flame,
  Menu,
  X,
  Crown,
  ChevronRight,
  ExternalLink,
  Activity,
  Layers,
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
  const { isSuperAdmin, role, isLoading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: VIP Brand Logo & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            {/* VIP Glowing Logo Container */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-xl blur-[3px] opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700/60 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/10">
                <img
                  src="/logo-emblem.png"
                  alt="Flow Creator OS"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center">
                  <span>FlowCreator</span>
                  <span className="ml-1 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent font-black">
                    OS
                  </span>
                </h1>

                {isSuperAdmin ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10 flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    <span>ADMIN OS</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>VIP PRO</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 hidden lg:block leading-tight">
                Autonomous Video Directing & Production Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800/80 text-xs shadow-inner">
          {/* Studio Tab (For All Users) */}
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

          {/* CreatorOps Tab (For All Users) */}
          <Link
            href="/creator-ops"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              isActive('/creator-ops')
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
            title="Daily Multi-Account Operations Hub & WhatsApp Reminders"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>CreatorOps</span>
          </Link>

          {/* Admin OS & VIP Persona Personas (Super Admin Only) */}
          {isSuperAdmin && (
            <>
              <span className="w-px h-4 bg-neutral-800 mx-1" />

              <Link
                href="/influencer"
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  isActive('/influencer')
                    ? 'bg-pink-950/60 text-pink-300 border border-pink-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-pink-300 hover:bg-pink-500/10'
                }`}
                title="Dedicated Elena UK/EU Persona Studio"
              >
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Elena VIP</span>
              </Link>

              <Link
                href="/pet-comedy"
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  isActive('/pet-comedy')
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
                title="Dedicated Pet Comedy Studio"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pet Comedy</span>
              </Link>

              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-bold ${
                  isActive('/admin')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-amber-400/90 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25'
                }`}
                title="Master Governance Command Center"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin OS</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right: Studio Quick Actions & Token Tracker & User Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Studio Modals (if provided via props) */}
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Content Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          )}

          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Character DNA Vault"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Vault</span>
            </button>
          )}

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm"
              title="Open Production & Video Generation History"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {/* Token Burn Badge */}
          <TokenBurnBadge currentReport={batch?.tokenUsage} />

          {/* Reset / New Spec Button */}
          {batch && onReset && (
            <button
              onClick={onReset}
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 border border-neutral-800"
              title="Create New Story Spec"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">New Spec</span>
            </button>
          )}

          {/* User Role Indicator Pill */}
          {!isLoading && (
            <div className="hidden lg:flex items-center">
              {isSuperAdmin ? (
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Super Admin</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Creator</span>
                </span>
              )}
            </div>
          )}

          {/* Clerk Auth Sync (Login or Avatar) */}
          <ClerkAuthSync />

          {/* Mobile Menu Toggle Button */}
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clapperboard className="w-4 h-4 text-indigo-400" />
                <span>General Studio</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </Link>

            <Link
              href="/creator-ops"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/creator-ops')
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                  : 'text-emerald-400/90 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>CreatorOps Hub</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Daily OS</span>
            </Link>

            {isSuperAdmin && (
              <>
                <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Admin OS Controls
                </div>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold ${
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

                <Link
                  href="/influencer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-neutral-900"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Elena VIP Persona</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </Link>

                <Link
                  href="/pet-comedy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-neutral-900"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Pet Comedy Studio</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80">
            {onOpenCalendar && (
              <button
                onClick={() => {
                  onOpenCalendar();
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
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
                className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Vault</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                onClick={() => {
                  onOpenHistory();
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex flex-col items-center gap-1 border border-neutral-800"
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span>History</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
