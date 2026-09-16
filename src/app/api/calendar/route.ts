import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getEffectiveUserId } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const sql = getDb();

    const rows = await sql`
      SELECT 
        id,
        user_id as "userId",
        batch_id as "batchId",
        day_number as "dayNumber",
        scheduled_date as "scheduledDate",
        variation_id as "variationId",
        variation_title as "variationTitle",
        format,
        is_adopted as "isAdopted",
        status,
        clips_summary as "clipsSummary",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM content_calendar_events
      WHERE user_id = ${userId}
      ORDER BY scheduled_date ASC
      LIMIT 100;
    `;

    return NextResponse.json({ success: true, userId, events: rows });
  } catch (error: any) {
    console.error('Failed to fetch calendar events:', error);
    return NextResponse.json({ success: false, error: error?.message, events: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const body = await req.json();
    const { batch, startDate } = body;

    if (!batch || !batch.id || !Array.isArray(batch.days)) {
      return NextResponse.json({ error: 'Valid batch delivery with days is required' }, { status: 400 });
    }

    const sql = getDb();
    const baseDate = startDate ? new Date(startDate) : new Date();

    for (let i = 0; i < batch.days.length; i++) {
      const day = batch.days[i];
      const scheduled = new Date(baseDate);
      scheduled.setDate(scheduled.getDate() + i);
      const dateString = scheduled.toISOString().split('T')[0];

      // Use selected or first variation
      const variation = day.variations.find((v: any) => v.id === day.selectedVariationId) || day.variations[0];
      if (!variation) continue;

      const eventId = `event-${batch.id}-day-${day.dayNumber}`;

      await sql`
        INSERT INTO content_calendar_events (
          id, user_id, batch_id, day_number, scheduled_date, variation_id,
          variation_title, format, is_adopted, status, clips_summary, metadata, updated_at
        ) VALUES (
          ${eventId},
          ${userId},
          ${batch.id},
          ${day.dayNumber},
          ${dateString},
          ${variation.id},
          ${variation.title},
          ${batch.spec?.format || 'character_drama'},
          ${variation.isAdopted || false},
          ${variation.isAdopted ? 'adopted' : variation.isProduced ? 'produced' : 'draft'},
          ${JSON.stringify({
            clips: variation.clips || [],
            dialogueScript: variation.dialogueScript || [],
            masterFrameImagePrompt: variation.masterFrameImagePrompt,
            hookDescription: variation.hookDescription,
          })},
          ${JSON.stringify(variation.metadata || {})},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          scheduled_date = EXCLUDED.scheduled_date,
          variation_id = EXCLUDED.variation_id,
          variation_title = EXCLUDED.variation_title,
          clips_summary = EXCLUDED.clips_summary,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      `;
    }

    return NextResponse.json({ success: true, message: 'Calendar schedule synchronized successfully' });
  } catch (error: any) {
    console.error('Failed to sync calendar events:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
