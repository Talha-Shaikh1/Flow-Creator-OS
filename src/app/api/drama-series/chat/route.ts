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

    const prompt = `You are a helpful, professional, and concise AI Creative Director & Co-Producer for this Real Human Drama Series.

${contextSummary}

PAST CONVERSATION:
${conversationHistoryText ? conversationHistoryText : 'None'}

USER REQUEST:
"${message}"

STRICT FORMATTING & CONCISENESS RULES:
1. KEEP IT SHORT, CRISP & EFFORTLESS TO READ:
   - Maximum 120 to 180 words total! Never output a wall of text.
   - ABSOLUTELY NO cheesy theatrical headers (NEVER write "GODMODE ACTIVATED", "READY? LET'S GO", "I'm in your Slack/Teams"). Start immediately with the direct answer.
   - Speak in simple, respectful, direct Roman Urdu or clean simple English so it is instantly readable.
   - Avoid messy nested symbols (no crazy combination of bold, italics, emojis, and tables). Keep it clean.

2. SPECIFIC REQUEST GUIDELINES:
   - If user asks for Background Music / Sound Design:
     Give only 3 short, practical bullet points:
     * 🎵 Mood / Track: (1 short sentence, e.g. "Slow melancholic cello with subtle rain ambience")
     * 🎻 Key Instruments: (e.g. "Low detuned cello, soft piano keys, sub-bass pulse at 75 BPM")
     * 🔊 Foley SFX: (e.g. "Heavy breath, footsteps on wet floor, clock ticking")
     * 📋 AI Music Prompt: (Provide 1 short copyable prompt in a single code block)
   - If user asks for YouTube Thumbnails:
     Give 2 clean Midjourney/Flux prompts in code blocks with 2-word text overlay (e.g. "THE BETRAYAL", "TOO LATE").
   - If user asks for Titles:
     Give exactly 5 short, high-CTR titles (one line each).
   - If user asks for Dialogue / Cliffhangers:
     Give 2 punchy, emotional line options.

Respond directly and cleanly now:`;

    const res = await callUniversalLLM({
      config: aiConfig,
      prompt,
      systemInstruction:
        'You are a concise, helpful AI Drama Director. You provide short, clean, crisp, and readable answers under 180 words. Never output walls of text, tables, or cheesy roleplay headers.',
      temperature: 0.6,
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
