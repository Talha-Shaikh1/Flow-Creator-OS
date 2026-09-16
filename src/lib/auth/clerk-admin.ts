import { createClerkClient } from '@clerk/nextjs/server';
import { isUserSuperAdmin, updateUserRole } from '@/lib/db/users';

/**
 * Returns an instance of Clerk Admin Client using the secret key.
 */
export function getClerkAdminClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('CLERK_SECRET_KEY is missing.');
    return null;
  }
  return createClerkClient({ secretKey });
}

/**
 * Updates Clerk publicMetadata with the superadmin role.
 */
export async function setClerkUserSuperAdmin(userId: string, isSuper: boolean): Promise<boolean> {
  if (!userId || userId.startsWith('guest_') || userId === 'guest_anonymous') {
    return false;
  }
  try {
    const clerk = getClerkAdminClient();
    if (!clerk) return false;

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: isSuper ? 'superadmin' : 'creator',
      },
    });
    return true;
  } catch (err) {
    console.warn(`Could not set Clerk publicMetadata for ${userId}:`, err);
    return false;
  }
}

/**
 * Inspects Clerk publicMetadata to check if user has superadmin role.
 */
export async function isClerkUserSuperAdmin(userId: string, userObj?: any): Promise<boolean> {
  if (!userId || userId.startsWith('guest_') || userId === 'guest_anonymous') {
    return false;
  }

  // 1. Direct check on provided Clerk User object (from currentUser())
  if (userObj?.publicMetadata?.role) {
    const role = String(userObj.publicMetadata.role).toLowerCase();
    if (role === 'superadmin' || role === 'super_admin' || role === 'admin') {
      return true;
    }
  }

  // 2. Query Clerk Backend API
  try {
    const clerk = getClerkAdminClient();
    if (clerk) {
      const u = await clerk.users.getUser(userId);
      const role = String(u.publicMetadata?.role || '').toLowerCase();
      if (role === 'superadmin' || role === 'super_admin' || role === 'admin') {
        return true;
      }
    }
  } catch (err) {
    // Non-fatal if Clerk API is unreachable or rate limited
  }

  return false;
}

/**
 * Dual-Layer Super Admin Verifier.
 * Does NOT rely solely on DB.
 * Checks BOTH Clerk publicMetadata and Neon DB.
 * If either one confirms Super Admin, access is GRANTED, and two-way sync is performed!
 */
export async function verifySuperAdminDualLayer(userId: string, userObj?: any): Promise<boolean> {
  if (!userId || userId.startsWith('guest_') || userId === 'guest_anonymous') {
    return false;
  }

  // Check 1: Clerk publicMetadata
  const clerkSuper = await isClerkUserSuperAdmin(userId, userObj);
  if (clerkSuper) {
    // Ensure DB also reflects super_admin
    try {
      await updateUserRole(userId, 'super_admin');
    } catch (e) {}
    return true;
  }

  // Check 2: Neon Database system_users
  const dbSuper = await isUserSuperAdmin(userId);
  if (dbSuper) {
    // Ensure Clerk publicMetadata also reflects superadmin
    setClerkUserSuperAdmin(userId, true).catch(() => {});
    return true;
  }

  return false;
}
