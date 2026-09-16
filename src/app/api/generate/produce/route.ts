import { NextRequest, NextResponse } from 'next/server';
import { produceVariationDirectives } from '@/lib/engine/generator';
import { StorySpec } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec, dayNumber, variationType, variationId } = body;

    if (!spec || !dayNumber || !variationType) {
      return NextResponse.json(
        { error: 'Missing required parameters (spec, dayNumber, variationType)' },
        { status: 400 }
      );
    }

    const produced = produceVariationDirectives(
      spec as StorySpec,
      dayNumber,
      variationType as 'High Tension' | 'Emotional Core' | 'Fast Hook'
    );

    return NextResponse.json({
      success: true,
      variationId,
      produced,
    });
  } catch (err: any) {
    console.error('Error producing variation directives:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to produce variation directives' },
      { status: 500 }
    );
  }
}
