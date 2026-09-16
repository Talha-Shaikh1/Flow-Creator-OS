import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getEffectiveUserId } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const sql = getDb();
    const rows = await sql`
      SELECT id, spec, batch, created_at as "createdAt", updated_at as "updatedAt"
      FROM saved_batches
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    return NextResponse.json({ success: true, userId, batches: rows });
  } catch (error: any) {
    console.error('Failed to fetch batches from Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message, batches: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const body = await req.json();
    const { batch, spec } = body;

    if (!batch || !batch.id) {
      return NextResponse.json({ error: 'Valid batch is required' }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO saved_batches (id, user_id, spec, batch, updated_at)
      VALUES (${batch.id}, ${userId}, ${JSON.stringify(spec || batch.spec)}, ${JSON.stringify(batch)}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        spec = EXCLUDED.spec,
        batch = EXCLUDED.batch,
        updated_at = NOW();
    `;

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error('Failed to save batch to Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
