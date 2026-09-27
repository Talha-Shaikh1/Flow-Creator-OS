import { NextRequest, NextResponse } from 'next/server';
import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      context = {},
      aiConfig,
    }: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      context?: {
        seasonStory?: any;
        characterBible?: any;
        selectedEpisodeNumber?: number;
        episodeProduction?: any;
        clipsBreakdown?: any[];
        framePrompts?: any[];
        videoPrompts?: any[];
      };
      aiConfig?: AIProviderConfig;
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build rich context about the active drama series production
    let contextSummary = 'CURRENT PRODUCTION CONTEXT:\n';
    if (context.seasonStory) {
      contextSummary += `- Series Title: "${context.seasonStory.seasonTitle}" (${context.seasonStory.genre})\n`;
      contextSummary += `- World / Setting: "${context.seasonStory.worldEnvironment}"\n`;
      contextSummary += `- Main Conflict: "${context.seasonStory.mainTheme}"\n`;
    }
    if (context.characterBible?.characters) {
      contextSummary += `- Cast: ${context.characterBible.characters
        .map((c: any) => `${c.id} (${c.name} - ${c.speciesObject || c.personality})`)
        .join(', ')}\n`;
    }
    if (context.episodeProduction) {
      contextSummary += `- Current Episode ${context.episodeProduction.episodeNumber}: "${context.episodeProduction.episodeTitle}"\n`;
      contextSummary += `- Story Summary: "${context.episodeProduction.storySummary}"\n`;
      contextSummary += `- Climax / Conflict: "${context.episodeProduction.emotionalProgression}"\n`;
    }
    if (context.clipsBreakdown && context.clipsBreakdown.length > 0) {
      contextSummary += `- Total 10s Clips in this episode: ${context.clipsBreakdown.length}\n`;
      contextSummary += `- Spoken Dialogues:\n${context.clipsBreakdown
        .map((c: any) => `  * Clip ${c.clipNumber} [${c.activeSpeaker}]: "${c.dialogue}"`)
        .join('\n')}\n`;
    }

    const conversationHistoryText = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'USER' : 'DIRECTOR AI'}: ${h.content}`)
      .join('\n\n');

    const prompt = `You are the Lead Creative Director, Showrunner, and YouTube Viral Strategist for this high-stakes 3D / Cinematic Drama Series.

${contextSummary}

PAST CONVERSATION:
${conversationHistoryText ? conversationHistoryText : 'None'}

USER REQUEST:
"${message}"

DIRECTOR GUIDELINES:
1. You have complete context of the characters, current episode, dialogue, and camera angles. Always reference them directly!
2. If the user asks for YouTube Thumbnail prompts:
   - Provide 2 to 3 distinct High-CTR Midjourney / Flux / Imagen prompts in 16:9 widescreen format (--ar 16:9).
   - Design them for maximum click-through rate: extreme psychological tension, high-contrast lighting, intense facial micro-expressions / eye contact, visual curiosity gaps.
   - Suggest bold 2-3 word text overlays (e.g. "HE KNEW.", "TOO LATE", "THE BETRAYAL").
3. If the user asks for titles, give 5 punchy YouTube A/B test variations (curiosity gap, high stakes, emotional punch).
4. If the user asks for music or sound design, specify cinematic instruments (deep cello drone, ticking clock tension riser, sub-bass drop).
5. Always respond in a crisp, collaborative, enthusiastic Director tone (bilingual English / Roman Urdu friendly). Format with clean markdown and copyable prompt code blocks!`;

    const res = await callUniversalLLM({
      config: aiConfig,
      prompt,
      systemInstruction:
        'You are the Master AI Creative Director and Co-Producer for this drama series. Provide world-class cinematic advice, high-CTR thumbnail prompts, and creative polish.',
      temperature: 0.75,
      responseJson: false,
    });

    return NextResponse.json({
      success: true,
      reply: res.text,
      model: res.model,
      usage: res.usage,
    });
  } catch (error: any) {
    console.error('Error in drama series chat endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI Copilot response' },
      { status: 500 }
    );
  }
}
