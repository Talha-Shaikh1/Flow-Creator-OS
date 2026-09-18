'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { GUEST_STORAGE_KEY } from '@/lib/auth/session';
import { LogIn } from 'lucide-react';

import { ClerkErrorBoundary } from './ClerkErrorBoundary';

export function ClerkAuthSync() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if we have an anonymous guest session in this browser that needs migration
      try {
        const guestId = localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestId && guestId.startsWith('guest_')) {
          fetch('/api/auth/migrate-guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestId }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                console.log('Successfully migrated guest data to Clerk account:', data);
                // Remove guest key so we do not re-migrate repeatedly
                localStorage.removeItem(GUEST_STORAGE_KEY);
              }
            })
            .catch((err) => {
              console.warn('Could not auto-migrate guest session:', err);
            });
        }
      } catch (e) {}
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
        title="Sign in with Google to permanently save and sync your prompts across devices"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const userInitials = (user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase();

  return (
    <ClerkErrorBoundary
      compact
      fallback={
        <div
          className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm"
          title={`Signed in as ${user?.primaryEmailAddress?.emailAddress || 'User'}`}
        >
          {userInitials}
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-7 h-7 rounded-xl ring-1 ring-white/20',
            },
          }}
        />
      </div>
    </ClerkErrorBoundary>
  );
}
