import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getEffectiveUserId } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const body = await req.json();
    const { eventId, isAdopted, status } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const nextAdopted = Boolean(isAdopted);
    const nextStatus = status || (nextAdopted ? 'adopted' : 'draft');

    const sql = getDb();
    const result = await sql`
      UPDATE content_calendar_events
      SET 
        is_adopted = ${nextAdopted},
        status = ${nextStatus},
        updated_at = NOW()
      WHERE id = ${eventId} AND user_id = ${userId}
      RETURNING id, is_adopted, status;
    `;

    return NextResponse.json({
      success: true,
      updated: result[0] || null,
      message: nextAdopted ? 'Episode adopted and marked as filmed! ✅' : 'Adoption status removed.',
    });
  } catch (error: any) {
    console.error('Failed to update adoption status:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
