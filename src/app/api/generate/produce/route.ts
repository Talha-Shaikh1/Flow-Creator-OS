import { NextRequest, NextResponse } from 'next/server';
import { produceVariationWithLLM } from '@/lib/engine/llm-produce';
import { StorySpec } from '@/types';
import { AIProviderConfig } from '@/lib/engine/llm-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec, dayNumber, variationType, variationId, existingVariation, aiConfig } = body;

    if (!spec || !dayNumber || !variationType) {
      return NextResponse.json(
        { error: 'Missing required parameters (spec, dayNumber, variationType)' },
        { status: 400 }
      );
    }

    const produced = await produceVariationWithLLM({
      spec: spec as StorySpec,
      dayNum: dayNumber,
      variationType: variationType as 'High Tension' | 'Emotional Core' | 'Fast Hook',
      existingVariation,
      aiConfig: aiConfig as AIProviderConfig | undefined,
    });

    return NextResponse.json({
      success: true,
      variationId,
      produced,
    });
  } catch (err: any) {
    console.error('Error producing variation directives via LLM:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to produce variation directives via AI' },
      { status: 500 }
    );
  }
}
