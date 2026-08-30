import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { sql, ensureDbInit } from '../../../lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ items: [], source: 'neon_not_configured' });
    }

    await ensureDbInit();

    const user = await currentUser().catch(() => null);
    const userId = user?.id || 'default_user';

    const rows = await sql`
      SELECT * FROM vault_items 
      WHERE user_id = ${userId}
      ORDER BY id DESC
      LIMIT 100
    `;

    const items = rows.map((r: any) => ({
      id: r.id,
      topic: r.topic,
      angle: r.angle,
      emotionalTrigger: r.emotional_trigger || r.angle,
      archetype: r.archetype,
      usedInDate: r.used_in_date,
    }));

    return NextResponse.json({ items, source: 'neon_postgres' });
  } catch (error: any) {
    console.warn('Neon DB vault GET warning:', error.message);
    return NextResponse.json({ items: [], error: error.message });
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
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      await sql`
        INSERT INTO vault_items (id, user_id, topic, angle, emotional_trigger, archetype, used_in_date)
        VALUES (${item.id}, ${userId}, ${item.topic}, ${item.angle}, ${item.emotionalTrigger || item.angle}, ${item.archetype}, ${item.usedInDate})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('Neon DB vault POST warning:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
