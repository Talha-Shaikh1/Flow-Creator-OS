import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      personaId,
      customTopic,
      imagePostType = 'carousel (3-5 slides, 4:5 vertical)',
      step = 'full',
      aiConfig,
    }: {
      personaId: string;
      customTopic?: string;
      imagePostType?: string;
      step?: 'variants' | 'full';
      aiConfig?: AIProviderConfig;
    } = body;

    if (!personaId) {
      return NextResponse.json({ error: 'personaId is required' }, { status: 400 });
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const isMushaira = persona.name.includes('mushaira');
    const isElena = persona.name.includes('elena');
    const isPet = persona.name.includes('petcomedy');
    const isDrama = persona.name.includes('drama');

    // 1. If step is 'variants' -> Generate 3 dynamic Mind Map angles via LLM (NO static fallback)
    if (step === 'variants') {
      const prompt = `You are an elite short-form video director and viral strategist.
Generate 3 distinct, high-engagement Mind Map episode angles for the following persona:
- Persona Name: ${persona.displayName || persona.name}
- Niche: ${persona.niche}
- Language: ${persona.language}
- Target Audience: ${persona.targetAudience}
- Visual Style: ${persona.visualStyle}
- Custom Topic / Seed: ${customTopic || 'Daily Trending Concept'} (Timestamp Seed: ${Date.now()})

${isMushaira ? 'SPECIAL INSTRUCTIONS: Urdu Animal Shayari Mushaira. Give humorous animal contestant titles (e.g. "Janab Bakra Be-Qaraar-ud-Din", "Janab Kachwa Sust-ul-Mulk", etc.), witty Babbar Sher host roast hooks, and satirical verses.' : ''}
${isElena ? 'SPECIAL INSTRUCTIONS: UK/European luxury lifestyle & mindset podcast influencer. Vulnerable reflections, emotional boundary realizations, high-value standards, Shure SM7B studio setting.' : ''}
${isPet ? 'SPECIAL INSTRUCTIONS: Hilarious pet comedy dynamic. Slapstick, unexpected pet inner monologues, chaos vs dignified demeanor.' : ''}

CRITICAL: Return strictly valid JSON matching this schema with exactly 3 creative variants:
{
  "variants": [
    {
      "id": "var-1",
      "title": "Creative Episode Title",
      "contestantTitle": "Character / Contestant Title (if applicable)",
      "hook": "0-3s high-retention verbal/visual hook",
      "angleSynopsis": "2-sentence synopsis of narrative conflict, revelation, and setup",
      "tone": "Specific emotional tone (e.g. Satirical Comedy, Deep Vulnerability, High Tension)"
    },
    {
      "id": "var-2",
      "title": "Creative Episode Title",
      "contestantTitle": "Character / Contestant Title (if applicable)",
      "hook": "0-3s high-retention verbal/visual hook",
      "angleSynopsis": "2-sentence synopsis of narrative conflict, revelation, and setup",
      "tone": "Specific emotional tone"
    },
    {
      "id": "var-3",
      "title": "Creative Episode Title",
      "contestantTitle": "Character / Contestant Title (if applicable)",
      "hook": "0-3s high-retention verbal/visual hook",
      "angleSynopsis": "2-sentence synopsis of narrative conflict, revelation, and setup",
      "tone": "Specific emotional tone"
    }
  ]
}`;

      try {
        const llmRes = await callUniversalLLM({
          config: aiConfig,
          prompt,
          systemInstruction: 'You are an autonomous viral media director. Generate 3 unique, fresh, high-performing episode angles every time. Return valid JSON only.',
          temperature: 0.85,
          responseJson: true,
        });

        const parsed = llmRes.parsed;
        const variants = parsed?.variants || (Array.isArray(parsed) ? parsed : null);
        if (variants && variants.length > 0) {
          return NextResponse.json({ variants });
        }
        throw new Error('LLM did not return a valid variants array');
      } catch (err: any) {
        console.error('Dynamic Mind Map generation error:', err);
        return NextResponse.json(
          { error: `Dynamic Mind Map Generation Failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Generate Full Production Pack dynamically via Live LLM (NO static template fallback)
    const prompt = buildContentPlanPrompt(persona, customTopic, imagePostType, isMushaira, isElena, isPet, isDrama);
    try {
      const llmRes = await callUniversalLLM({
        config: aiConfig,
        prompt,
        systemInstruction: 'You are the Master AI Creative Director for CreatorOps Hub. Always return strictly valid JSON matching the requested schema. Do not wrap in markdown code blocks.',
        temperature: 0.75,
        responseJson: true,
      });

      const generatedPack = llmRes.parsed;
      if (!generatedPack || !generatedPack.trendingTopic) {
        throw new Error('LLM did not return a valid content plan object');
      }

      return NextResponse.json({ plan: generatedPack });
    } catch (llmError: any) {
      console.error('LLM Pack generation error:', llmError);
      return NextResponse.json(
        { error: `Content Pack Generation Failed via AI: ${llmError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in creator-ops generate route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function buildContentPlanPrompt(
  persona: any,
  customTopic?: string,
  imagePostType?: string,
  isMushaira?: boolean,
  isElena?: boolean,
  isPet?: boolean,
  isDrama?: boolean
) {
  const sessionSeed = Date.now().toString(36);

  return `You are the Master AI Creative Director for CreatorOps Hub.
Generate a complete, production-ready daily content plan for the persona below in STRICT JSON format (no markdown, no backticks, just raw valid JSON):

PERSONA SPECS:
Name: ${persona.displayName || persona.name}
Niche: ${persona.niche}
Language: ${persona.language}
Target Audience: ${persona.targetAudience}
Visual Style: ${persona.visualStyle}
Custom Topic / Angle: ${customTopic || 'Daily Viral Momentum'} (Session Seed: ${sessionSeed})
Selected Image Post Type: ${imagePostType}

${isMushaira ? `
SPECIAL RULES FOR AI MUSHAIRA (URDU ANIMAL SHAYARI):
- Traditional Urdu Mehfil-e-Sukhan atmosphere with 3D anthropomorphic animals in sherwanis & pagris.
- Lion Host (Babbar Sher) MUST have a funny, witty introduction giving the animal contestant a hilarious title (e.g. "Janab Bakra Be-Qaraar-ud-Din Sahab", "Janab Kachwa Sust-ul-Mulk", "Janab Oont Bawandar-ud-Din").
- Provide the actual 2-line Sher written in Urdu characters AND roman Urdu phonetics.
- reelScript MUST be divided into 6 continuous 10-second Google Flow Veo clips:
  [0:00-0:10] Lion host humorous title intro & poet stepping up to vintage brass mic
  [0:10-0:20] First line recitation + audience "واہ واہ! کیا کہنے!"
  [0:20-0:30] Second line punchline recitation
  [0:30-0:40] Energetic animal audience ovation ("مکرر! مکرر!")
  [0:40-0:50] Lion host amazed reaction & contestant bow
  [0:50-0:60] Wide cinematic stage shot with Persian carpets & warm chandeliers
- Image prompt MUST specify the anthropomorphic animal poet in ornate velvet sherwani on wooden stage.
` : ''}

${isElena ? `
SPECIAL RULES FOR ELENA (UK/EU AI INFLUENCER):
- Podcast style 4-clip setup with Shure SM7B mic, gold layered necklace, locked cheek beauty mole, 85mm portrait bokeh.
- reelScript MUST have 4 timestamps:
  [0:00-0:05] 3-Second Scroll Stopper Hook
  [0:05-0:18] Relatable Setup & Nuance
  [0:18-0:32] Vulnerable revelation
  [0:32-0:45] Actionable CTA
- Image prompt MUST be an anti-AI photorealistic lifestyle outfit completely different from the reel.
` : ''}

REQUIRED JSON KEYS:
{
  "trendingTopic": string,
  "trendingAudio": string,
  "hook": string,
  "reelScript": string,
  "imagePostType": "${imagePostType}",
  "imagePrompt": string,
  "carouselSlides": [
    { "slide": 1, "title": string, "text": string, "visual": string },
    { "slide": 2, "title": string, "text": string, "visual": string },
    { "slide": 3, "title": string, "text": string, "visual": string },
    { "slide": 4, "title": string, "text": string, "visual": string },
    { "slide": 5, "title": string, "text": string, "visual": string }
  ],
  "storiesPlan": [
    { "storyNumber": 1, "type": "Morning Vibe", "caption": string, "sticker": string },
    { "storyNumber": 2, "type": "Poll / Interactive", "caption": string, "sticker": string },
    { "storyNumber": 3, "type": "Reel Reshare Tease", "caption": string, "sticker": string },
    { "storyNumber": 4, "type": "BTS / Reflection", "caption": string, "sticker": string },
    { "storyNumber": 5, "type": "Evening Q&A Box", "caption": string, "sticker": string }
  ],
  "ytTitle": string,
  "ytDescription": string,
  "ytTags": string,
  "tiktokCaption": string,
  "tiktokHashtags": string,
  "instaCaption": string,
  "instaHashtags": string,
  "facebookCaption": string,
  "facebookHashtags": string
}
`;
}
