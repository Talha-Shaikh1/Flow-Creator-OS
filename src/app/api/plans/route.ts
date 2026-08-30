import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { sql, ensureDbInit } from '../../../lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ plans: [], source: 'neon_not_configured' });
    }

    await ensureDbInit();

    const user = await currentUser().catch(() => null);
    const userId = user?.id || 'default_user';

    const rows = await sql`
      SELECT * FROM weekly_plans 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const plans = rows.map((r: any) => ({
      id: r.id,
      profileId: r.profile_id,
      profileName: r.profile_name,
      archetype: r.archetype,
      niche: r.niche,
      createdAt: Number(r.created_at),
      days: r.days_json,
    }));

    return NextResponse.json({ plans, source: 'neon_postgres' });
  } catch (error: any) {
    console.warn('Neon DB plans GET warning:', error.message);
    return NextResponse.json({ plans: [], error: error.message });
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
    const plan = await req.json();

    await sql`
      INSERT INTO weekly_plans (
        id, user_id, profile_id, profile_name, archetype, niche, days_json, created_at
      ) VALUES (
        ${plan.id}, ${userId}, ${plan.profileId}, ${plan.profileName}, 
        ${plan.archetype}, ${plan.niche}, ${JSON.stringify(plan.days)}, ${plan.createdAt || Date.now()}
      )
      ON CONFLICT (id) DO UPDATE SET
        days_json = EXCLUDED.days_json;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('Neon DB plans POST warning:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
