import { NextRequest, NextResponse } from 'next/server';
import { generateSocialMetaPack } from '@/lib/creator-ops/meta-manager';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personaSlug, format, topic, sherLines, characterName } = body;

    if (!personaSlug) {
      return NextResponse.json({ error: 'personaSlug is required' }, { status: 400 });
    }

    const metaPack = await generateSocialMetaPack({
      personaSlug,
      format: format || 'carousel',
      topic,
      sherLines,
      characterName,
    });

    return NextResponse.json({ success: true, metaPack });
  } catch (error: any) {
    console.error('Error generating social meta:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
