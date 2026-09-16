import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/lib/auth/server';
import { getGlobalSystemBatches } from '@/lib/db/users';
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const batches = await getGlobalSystemBatches(limit);
    return NextResponse.json({ batches });
  } catch (error: any) {
    console.error('Error in /api/admin/batches:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
