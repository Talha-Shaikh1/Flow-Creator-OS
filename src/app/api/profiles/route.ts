import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { sql, ensureDbInit } from '../../../lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ profiles: [], source: 'neon_not_configured' });
    }

    await ensureDbInit();

    const user = await currentUser().catch(() => null);
    const userId = user?.id || 'default_user';

    const rows = await sql`
      SELECT * FROM creator_profiles 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    const profiles = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      archetype: r.archetype,
      niche: r.niche,
      objectName: r.object_name,
      objectMetaphor: r.object_metaphor,
      characterDna: r.character_dna,
      aspectRatio: r.aspect_ratio,
      visualStyle: r.visual_style,
      tone: r.tone,
      targetAudience: r.target_audience,
      createdAt: Number(r.created_at),
    }));

    return NextResponse.json({ profiles, source: 'neon_postgres' });
  } catch (error: any) {
    console.warn('Neon DB profiles GET warning:', error.message);
    return NextResponse.json({ profiles: [], error: error.message });
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
    const profile = await req.json();

    await sql`
      INSERT INTO creator_profiles (
        id, user_id, name, archetype, niche, object_name, object_metaphor, 
        character_dna, aspect_ratio, visual_style, tone, target_audience, created_at
      ) VALUES (
        ${profile.id}, ${userId}, ${profile.name}, ${profile.archetype}, ${profile.niche}, 
        ${profile.objectName || null}, ${profile.objectMetaphor || null}, 
        ${profile.characterDna}, ${profile.aspectRatio}, ${profile.visualStyle}, 
        ${profile.tone}, ${profile.targetAudience}, ${profile.createdAt || Date.now()}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        archetype = EXCLUDED.archetype,
        niche = EXCLUDED.niche,
        object_name = EXCLUDED.object_name,
        object_metaphor = EXCLUDED.object_metaphor,
        character_dna = EXCLUDED.character_dna,
        aspect_ratio = EXCLUDED.aspect_ratio,
        visual_style = EXCLUDED.visual_style,
        tone = EXCLUDED.tone,
        target_audience = EXCLUDED.target_audience;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('Neon DB profiles POST warning:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
