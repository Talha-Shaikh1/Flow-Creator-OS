import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/lib/auth/server';
import { getSystemMetrics } from '@/lib/db/users';
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

    const metrics = await getSystemMetrics();
    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Error in /api/admin/stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
