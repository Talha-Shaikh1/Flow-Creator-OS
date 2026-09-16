import { NextRequest, NextResponse } from 'next/server';
import { StorySpecSchema } from '@/lib/schemas/story-spec.schema';
import { generateWeeklyBatchWithGemini } from '@/lib/engine/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = StorySpecSchema.safeParse(body);

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
    const batch = await generateWeeklyBatchWithGemini(spec, { mode: 'mind_maps' });

    return NextResponse.json({
      success: true,
      batch,
    });
  } catch (error: any) {
    console.error('Error generating weekly batch:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate weekly batch',
        message: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
