import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { sql, ensureDbInit } from '../../../lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ logs: [], source: 'neon_not_configured' });
    }

    await ensureDbInit();

    const user = await currentUser().catch(() => null);
    const userId = user?.id || 'default_user';

    const rows = await sql`
      SELECT * FROM performance_logs 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const logs = rows.map((r: any) => ({
      id: r.id,
      planId: r.plan_id,
      videoTitle: r.video_title,
      dayNumber: r.day_number,
      result: r.result,
      viewsCount: r.views_count,
      retentionRate: r.retention_rate,
      userNotes: r.user_notes,
      keyLearnings: r.key_learnings,
      createdAt: Number(r.created_at),
    }));

    return NextResponse.json({ logs, source: 'neon_postgres' });
  } catch (error: any) {
    console.warn('Neon DB flywheel GET warning:', error.message);
    return NextResponse.json({ logs: [], error: error.message });
  }
}

export async function POST(req: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, reason: 'neon_not_configured' });
    }

    await ensureDbInit();

    const user = await currentUser().catch(() => null);
    const userId = user?.id || 'default_user';
    const log = await req.json();

    await sql`
      INSERT INTO performance_logs (
        id, user_id, plan_id, video_title, day_number, emotional_trigger, result, 
        views_count, retention_rate, user_notes, key_learnings, created_at
      ) VALUES (
        ${log.id}, ${userId}, ${log.planId}, ${log.videoTitle}, ${log.dayNumber}, 
        ${log.emotionalTrigger || null}, ${log.result}, ${log.viewsCount || null}, 
        ${log.retentionRate || null}, ${log.userNotes || null}, ${log.keyLearnings}, 
        ${log.createdAt || Date.now()}
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('Neon DB flywheel POST warning:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
