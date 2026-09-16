import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/lib/auth/server';
import { updateUserRole } from '@/lib/db/users';
import { verifySuperAdminDualLayer, setClerkUserSuperAdmin } from '@/lib/auth/clerk-admin';

export async function POST(req: NextRequest) {
  try {
    const userId = await getEffectiveUserId(req);
    const isSuper = await verifySuperAdminDualLayer(userId);

    if (!isSuper) {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin privileges required.' },
        { status: 403 }
      );
    }

    const { targetUserId, newRole } = await req.json();
    if (!targetUserId || !['super_admin', 'creator'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid targetUserId or newRole.' },
        { status: 400 }
      );
    }

    // Update DB
    const success = await updateUserRole(targetUserId, newRole);

    // Also sync to Clerk publicMetadata
    await setClerkUserSuperAdmin(targetUserId, newRole === 'super_admin');

    return NextResponse.json({ success, targetUserId, newRole });
  } catch (error: any) {
    console.error('Error in /api/admin/users/role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
