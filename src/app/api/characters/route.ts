import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { CastMember } from '@/types';

export async function GET() {
  try {
    await initDb();
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, role, description, dna_prompt as "dnaPrompt", is_pinned as "isPinned", created_at as "createdAt"
      FROM saved_characters
      ORDER BY is_pinned DESC, created_at DESC
    `;
    return NextResponse.json({ success: true, characters: rows });
  } catch (error: any) {
    console.error('Failed to fetch characters from Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message, characters: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { id, name, role, description, dnaPrompt, isPinned } = body;

    if (!name || !dnaPrompt) {
      return NextResponse.json({ error: 'Name and DNA prompt are required' }, { status: 400 });
    }

    const charId = id || `char-${Date.now()}`;
    const sql = getDb();

    await sql`
      INSERT INTO saved_characters (id, name, role, description, dna_prompt, is_pinned)
      VALUES (${charId}, ${name}, ${role || 'Hero'}, ${description || ''}, ${dnaPrompt}, ${Boolean(isPinned)})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        description = EXCLUDED.description,
        dna_prompt = EXCLUDED.dna_prompt,
        is_pinned = EXCLUDED.is_pinned;
    `;

    return NextResponse.json({
      success: true,
      character: { id: charId, name, role, description, dnaPrompt, isPinned },
    });
  } catch (error: any) {
    console.error('Failed to save character to Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    const sql = getDb();
    await sql`DELETE FROM saved_characters WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete character from Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
