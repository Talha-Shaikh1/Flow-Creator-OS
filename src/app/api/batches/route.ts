import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getEffectiveUserId } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: true,
      isLocalOnly: true,
      userId: 'guest_local',
      stats: {
        totalBatches: 0,
        totalClips: 0,
        totalPrompts: 0,
        totalVideosGenerated: 0,
        completionRate: 0,
      },
      batches: [],
    });
  }

  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const sql = getDb();
    const rows = await sql`
      SELECT id, spec, batch, created_at as "createdAt", updated_at as "updatedAt"
      FROM saved_batches
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
      LIMIT 50
    `;

    let totalBatches = rows.length;
    let totalAllClips = 0;
    let totalAllPrompts = 0;
    let totalAllVideosGenerated = 0;

    const formattedBatches = rows.map((r: any) => {
      const b = r.batch || {};
      const s = r.spec || b.spec || {};
      const days = Array.isArray(b.days) ? b.days : [];
      const generatedClips = b.generatedClips || {};

      let batchClips = 0;
      let batchPhotos = 0;
      let batchProduced = 0;

      days.forEach((day: any) => {
        const variations = day.variations || [];
        variations.forEach((v: any) => {
          if (Array.isArray(v.clips) && v.clips.length > 0) {
            batchClips += v.clips.length;
          }
        });
        if (day.dailyPhotoPosts && Array.isArray(day.dailyPhotoPosts)) {
          batchPhotos += day.dailyPhotoPosts.length;
        }
      });

      Object.keys(generatedClips).forEach((k) => {
        if (generatedClips[k]) batchProduced++;
      });

      const batchPrompts = batchClips * 2 + batchPhotos;

      totalAllClips += batchClips;
      totalAllPrompts += batchPrompts;
      totalAllVideosGenerated += batchProduced;

      const title =
        days[0]?.variations?.[0]?.title ||
        s.seriesTitle ||
        s.customStoryIdea?.slice(0, 40) ||
        `${s.format ? s.format.replace('_', ' ').toUpperCase() : 'Series Batch'}`;

      return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        title,
        format: s.format || 'character_drama',
        genres: s.genres || [],
        tone: s.tone || 'Intense / Suspenseful',
        premise: s.customStoryIdea || '',
        cast: s.cast || [],
        totalClips: batchClips,
        totalPrompts: batchPrompts,
        generatedVideosCount: batchProduced,
        completionRate: batchClips > 0 ? Math.round((batchProduced / batchClips) * 100) : 0,
        spec: s,
        batch: b,
      };
    });

    const completionRate =
      totalAllClips > 0
        ? Math.round((totalAllVideosGenerated / totalAllClips) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      userId,
      stats: {
        totalBatches,
        totalClips: totalAllClips,
        totalPrompts: totalAllPrompts,
        totalVideosGenerated: totalAllVideosGenerated,
        completionRate,
      },
      batches: formattedBatches,
    });
  } catch (error: any) {
    console.warn('Neon DB unavailable, falling back to local history gracefully:', error?.message);
    return NextResponse.json({
      success: true,
      isLocalOnly: true,
      warning: error?.message,
      stats: { totalBatches: 0, totalClips: 0, totalPrompts: 0, totalVideosGenerated: 0, completionRate: 0 },
      batches: [],
    });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, isLocalOnly: true });
  }

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
    console.warn('Failed to sync batch to Neon DB (running offline/local mode):', error?.message);
    return NextResponse.json({ success: true, isLocalOnly: true, warning: error?.message });
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, isLocalOnly: true });
  }

  try {
    await initDb();
    const userId = await getEffectiveUserId(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Batch id is required' }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      DELETE FROM saved_batches
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.warn('Failed to delete batch from Neon DB (running offline/local mode):', error?.message);
    return NextResponse.json({ success: true, isLocalOnly: true, warning: error?.message });
  }
}
