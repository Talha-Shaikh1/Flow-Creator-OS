import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getEffectiveUserId } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const effectiveUserId = await getEffectiveUserId(req);

    // Only migrate if user is truly signed in (not a guest)
    if (effectiveUserId.startsWith('guest_')) {
      return NextResponse.json(
        { error: 'User must be signed in with an authenticated account to claim guest data' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { guestId } = body;

    if (!guestId || typeof guestId !== 'string' || !guestId.startsWith('guest_')) {
      return NextResponse.json(
        { error: 'Valid guestId is required for migration' },
        { status: 400 }
      );
    }

    const sql = getDb();

    // 1. Migrate saved_batches
    await sql`
      UPDATE saved_batches
      SET user_id = ${effectiveUserId}, updated_at = NOW()
      WHERE user_id = ${guestId};
    `;

    // 2. Migrate saved_characters
    await sql`
      UPDATE saved_characters
      SET user_id = ${effectiveUserId}
      WHERE user_id = ${guestId};
    `;

    // 3. Migrate content_calendar_events
    await sql`
      UPDATE content_calendar_events
      SET user_id = ${effectiveUserId}, updated_at = NOW()
      WHERE user_id = ${guestId};
    `;

    return NextResponse.json({
      success: true,
      migratedTo: effectiveUserId,
      fromGuestId: guestId,
      message: 'Guest batches, characters, and calendar successfully migrated to authenticated account!',
    });
  } catch (error: any) {
    console.error('Failed to migrate guest session:', error);
    return NextResponse.json(
      { error: error?.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
