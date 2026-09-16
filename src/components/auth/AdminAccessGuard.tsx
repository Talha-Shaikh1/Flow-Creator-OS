'use client';

import React from 'react';
import Link from 'next/link';
import { useUserRole } from '@/lib/auth/useUserRole';
import { ShieldAlert, ArrowLeft, LogIn, Lock, Sparkles, UserCheck } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';

interface AdminAccessGuardProps {
  children: React.ReactNode;
  personaName?: string;
  isStudioPage?: boolean;
}

export function AdminAccessGuard({
  children,
  personaName = 'Private Master Persona',
  isStudioPage = false,
}: AdminAccessGuardProps) {
  const { isSuperAdmin, isLoading, role, email } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Verifying Studio Permissions...</span>
        </div>
      </div>
    );
  }

  // Super Admin has full unlocked access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Locked Gate Screen for Guests and Non-Admin Creators
  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        {/* Icon & Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Super Admin Access Only</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          {personaName} Locked
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          {isStudioPage ? (
            <>
              This dedicated production studio was tailored specifically as a private master persona for the 
              <strong className="text-neutral-200"> Studio Owner / Super Admin</strong>. 
              Only the platform administrator can direct batches for this persona.
            </>
          ) : (
            <>
              Access to this Command Center is strictly reserved for the 
              <strong className="text-neutral-200"> Super Administrator</strong> of Flow Creator OS.
            </>
          )}
        </p>

        {/* User Status Notice */}
        {email ? (
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 mb-6 flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Logged in as: <span className="text-neutral-200 font-mono font-medium">{email}</span> ({role})</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to General Studio</span>
          </Link>

          {!email && (
            <Link
              href="/sign-in"
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm transition flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Super Admin</span>
            </Link>
          )}
        </div>

        <p className="mt-6 text-[11px] text-neutral-400">
          Want to direct your own characters? Design custom characters with spatial anchors in the General Studio!
        </p>
      </div>
    </div>
  );
}
