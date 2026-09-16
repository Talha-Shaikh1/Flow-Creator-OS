import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getEffectiveUserId } from '@/lib/auth/server';
import { syncUserAndGetRole, updateUserRole } from '@/lib/db/users';
import {
  setClerkUserSuperAdmin,
  isClerkUserSuperAdmin,
  verifySuperAdminDualLayer,
} from '@/lib/auth/clerk-admin';

export async function POST(req: NextRequest) {
  try {
    let clerkUserId: string | null = null;
    let email: string | null = null;
    let name: string | null = null;
    let imageUrl: string | null = null;
    let clerkUserObj: any = null;

    // 1. Try server-side Clerk resolution
    try {
      const authData = await auth();
      clerkUserId = authData?.userId || null;
      if (clerkUserId) {
        clerkUserObj = await currentUser();
        if (clerkUserObj) {
          email = clerkUserObj.emailAddresses?.[0]?.emailAddress || null;
          name =
            [clerkUserObj.firstName, clerkUserObj.lastName].filter(Boolean).join(' ') ||
            clerkUserObj.username ||
            null;
          imageUrl = clerkUserObj.imageUrl || null;
        }
      }
    } catch (e) {
      // Clerk auth server lookup fallback
    }

    // 2. Read body payload from client if sent
    try {
      const body = await req.json();
      if (!clerkUserId && body.userId) clerkUserId = body.userId;
      if (!email && body.email) email = body.email;
      if (!name && body.name) name = body.name;
      if (!imageUrl && body.imageUrl) imageUrl = body.imageUrl;
    } catch (e) {}

    // 3. Fallback to effective user ID (could be guest)
    const effectiveUserId = clerkUserId || (await getEffectiveUserId(req));

    if (!effectiveUserId || effectiveUserId.startsWith('guest_') || effectiveUserId === 'guest_anonymous') {
      return NextResponse.json({
        user: {
          id: effectiveUserId || 'guest_anonymous',
          email: null,
          name: 'Guest Creator',
          role: 'creator',
          isSuperAdmin: false,
        },
      });
    }

    // 4. Check Clerk publicMetadata layer FIRST
    const hasClerkSuperAdmin = await isClerkUserSuperAdmin(effectiveUserId, clerkUserObj);

    // 5. Sync with DB — first user auto-promoted, or if Clerk publicMetadata already says superadmin
    const dbUser = await syncUserAndGetRole({
      userId: effectiveUserId,
      email,
      name,
      imageUrl,
    });

    let isSuper = dbUser.role === 'super_admin' || hasClerkSuperAdmin;

    // If Clerk metadata says superadmin but DB was creator, upgrade DB
    if (hasClerkSuperAdmin && dbUser.role !== 'super_admin') {
      await updateUserRole(effectiveUserId, 'super_admin');
      isSuper = true;
    }

    // If DB is super_admin, guarantee Clerk publicMetadata is also updated!
    if (isSuper && !hasClerkSuperAdmin) {
      setClerkUserSuperAdmin(effectiveUserId, true).catch(() => {});
    }

    return NextResponse.json({
      user: {
        ...dbUser,
        role: isSuper ? 'super_admin' : 'creator',
        isSuperAdmin: isSuper,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const effectiveUserId = await getEffectiveUserId(req);
    if (!effectiveUserId || effectiveUserId.startsWith('guest_') || effectiveUserId === 'guest_anonymous') {
      return NextResponse.json({
        user: {
          id: effectiveUserId || 'guest_anonymous',
          email: null,
          name: 'Guest Creator',
          role: 'creator',
          isSuperAdmin: false,
        },
      });
    }

    const isSuper = await verifySuperAdminDualLayer(effectiveUserId);
    return NextResponse.json({
      user: {
        id: effectiveUserId,
        role: isSuper ? 'super_admin' : 'creator',
        isSuperAdmin: isSuper,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
