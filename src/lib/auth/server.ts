import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const GUEST_STORAGE_KEY = 'flowcreator_guest_id';

/**
 * Server-side resolver for effective user ID.
 * Priority:
 * 1. Clerk authenticated userId (if signed in)
 * 2. x-creator-guest-id header from client
 * 3. flowcreator_guest_id cookie
 * 4. 'guest_anonymous' fallback
 */
export async function getEffectiveUserId(req?: NextRequest): Promise<string> {
  // 1. Try Clerk authentication
  try {
    const authData = await auth();
    if (authData && authData.userId) {
      return authData.userId;
    }
  } catch (e) {
    // Clerk not configured or user not logged in
  }

  // 2. Check x-creator-guest-id header
  if (req) {
    const guestHeader = req.headers.get('x-creator-guest-id');
    if (guestHeader && guestHeader.trim()) {
      return guestHeader.trim();
    }

    // 3. Check cookie
    const guestCookie = req.cookies.get(GUEST_STORAGE_KEY)?.value;
    if (guestCookie && guestCookie.trim()) {
      return guestCookie.trim();
    }
  }

  return 'guest_anonymous';
}
