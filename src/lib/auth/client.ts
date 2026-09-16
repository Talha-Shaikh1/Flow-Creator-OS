'use client';

export const GUEST_STORAGE_KEY = 'flowcreator_guest_id';

/**
 * Generates or retrieves a persistent client-side guest ID.
 * Stored in localStorage and cookies so it is accessible across requests.
 */
export function getOrCreateClientGuestId(): string {
  if (typeof window === 'undefined') {
    return 'guest_server_render';
  }

  try {
    let guestId = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      localStorage.setItem(GUEST_STORAGE_KEY, guestId);
      document.cookie = `${GUEST_STORAGE_KEY}=${guestId}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return guestId;
  } catch (e) {
    return 'guest_fallback_storage';
  }
}
