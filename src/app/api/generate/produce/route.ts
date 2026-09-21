import { NextRequest, NextResponse } from 'next/server';
import { produceVariationWithLLM } from '@/lib/engine/llm-produce';
import { StorySpec } from '@/types';
import { AIProviderConfig } from '@/lib/engine/llm-provider';
import { evaluatePromptCritique } from '@/lib/engine/critique';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec, dayNumber, variationType, variationId, existingVariation, forceFresh, aiConfig } = body;

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
      existingVariation: forceFresh ? undefined : existingVariation,
      forceFresh: Boolean(forceFresh),
      aiConfig: aiConfig as AIProviderConfig | undefined,
    });

    const unvalidated = {
      id: variationId || `day-${dayNumber}-${variationType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      variationLabel: existingVariation?.variationLabel || (`Variation (${variationType})` as any),
      title: produced.title,
      hookDescription: produced.hookDescription,
      characterAnchors: produced.characterAnchors,
      locationAnchors: produced.locationAnchors,
      clips: produced.clips,
      dialogueScript: produced.dialogueScript,
      masterFrameImagePrompt: produced.masterFrameImagePrompt,
      isProduced: true,
      metadata: existingVariation?.metadata || {
        caption: `${produced.title} 🎬 Generated with FlowCreator OS. #AIcinema #GoogleFlow`,
        hashtags: ['#GoogleFlow', '#Veo', '#AIFilmmaking', '#ShortFilm'],
        audioVibe: spec.tone,
      },
    };

    const critique = evaluatePromptCritique(unvalidated);

    return NextResponse.json({
      success: true,
      variationId,
      produced: {
        ...produced,
        critique,
      },
    });
  } catch (err: any) {
    console.error('Error producing variation directives via LLM:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to produce variation directives via AI' },
      { status: 500 }
    );
  }
}
