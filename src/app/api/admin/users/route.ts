import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/lib/auth/server';
import { getAllSystemUsers } from '@/lib/db/users';
import { verifySuperAdminDualLayer } from '@/lib/auth/clerk-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = await getEffectiveUserId(req);
    const isSuper = await verifySuperAdminDualLayer(userId);

    if (!isSuper) {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin privileges required.' },
        { status: 403 }
      );
    }

    const users = await getAllSystemUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in /api/admin/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
