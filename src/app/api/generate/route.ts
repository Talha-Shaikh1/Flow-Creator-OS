import { NextRequest, NextResponse } from 'next/server';
import { StorySpecSchema } from '@/lib/schemas/story-spec.schema';
import { generateWeeklyBatchWithGemini } from '@/lib/engine/gemini';
import { AIProviderConfig } from '@/lib/engine/llm-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawSpec = body?.spec ? body.spec : body;
    const aiConfig: AIProviderConfig | undefined = body?.aiConfig;

    const parseResult = StorySpecSchema.safeParse(rawSpec);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid Story Spec input',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const spec = parseResult.data;
    if ((spec.format === 'character_drama' || spec.format === 'pet_comedy') && !spec.clipDurationSeconds) {
      spec.clipDurationSeconds = 90;
    }

    const batch = await generateWeeklyBatchWithGemini(spec, {
      mode: (spec.format === 'character_drama' || spec.format === 'pet_comedy') ? 'full' : 'mind_maps',
      aiConfig,
    });

    return NextResponse.json({
      success: true,
      batch,
    });
  } catch (error: any) {
    console.error('Error generating weekly batch with LLM:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate weekly batch via AI',
        message: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
