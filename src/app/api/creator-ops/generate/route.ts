import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personaId, customTopic, imagePostType = 'carousel (3-5 slides, 4:5 vertical)', step = 'full' } = body;

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

    // 1. If step is 'variants' -> Generate 3 token-saving Mind Map angles
    if (step === 'variants') {
      const variants = generateMindMapVariants(persona, customTopic, isMushaira, isElena, isPet);
      return NextResponse.json({ variants });
    }

    // 2. Generate Full Production Pack (AI or Smart Procedural Fallback)
    const gemini = getGeminiClient();
    let generatedPack = null;

    if (gemini) {
      try {
        const prompt = buildGeminiPrompt(persona, customTopic, imagePostType, isMushaira, isElena, isPet, isDrama);
        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        generatedPack = JSON.parse(cleaned);
      } catch (geminiError) {
        console.warn('Gemini generation fallback triggered:', geminiError);
      }
    }

    // Fallback if Gemini is unconfigured or rate limited
    if (!generatedPack) {
      generatedPack = generateProceduralPack(persona, customTopic, imagePostType, isMushaira, isElena, isPet, isDrama);
    }

    return NextResponse.json({ plan: generatedPack });
  } catch (error: any) {
    console.error('Error generating content plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateMindMapVariants(persona: any, customTopic?: string, isMushaira?: boolean, isElena?: boolean, isPet?: boolean) {
  if (isMushaira) {
    return [
      {
        id: 'var-mushaira-1',
        title: 'Bakra Be-Qaraar & Ghaas Ka Mehngaai Sher',
        contestantTitle: 'Janab Bakra Be-Qaraar-ud-Din Sahab',
        hook: 'Babbar Sher host ka roast: "Ghaas kam aur sher zyada chabaate hain!"',
        angleSynopsis: 'Bakra in velvet sherwani speaks about inflation and goat life struggles. Animal audience wah-wah frenzy.',
        tone: 'Satirical Comedy & Relatable Laughter',
      },
      {
        id: 'var-mushaira-2',
        title: 'Kachwa Sust-ul-Mulk: Ishq Mein Dheemi Raftaar',
        contestantTitle: 'Janab Kachwa Sust-ul-Mulk Sahab',
        hook: '"Sadiyon purani thakan ke sath... aglay sher tak aadhe log so chuke hongay!"',
        angleSynopsis: 'Slow motion philosophical sher about how fast love fades while he remains steady and heartbroken.',
        tone: 'Deep Philosophical & Melodramatic',
      },
      {
        id: 'var-mushaira-3',
        title: 'Ghadha Dildar: Suron Ke Dushman Ki Dard Bhari Shayari',
        contestantTitle: 'Janab Ghadha Dildar Sahab',
        hook: 'Babbar Sher: "Kaan band karlein ya dil thaam lein... aa rahe hain Ghadha Dildar!"',
        angleSynopsis: 'Heartfelt emotional ghazal with unexpected genius punchline that stuns the lion host.',
        tone: 'Emotional Twist & High Retention Shock',
      },
    ];
  }

  if (isElena) {
    return [
      {
        id: 'var-elena-1',
        title: 'The Silent Signs Someone Is Outgrowing You',
        hook: 'If you constantly feel like an option, this 30-second reality check is for you.',
        angleSynopsis: 'Vulnerable podcast clip breaking down subtle emotional disconnection before breakup.',
        tone: 'Deep Empathy & Heavy Relationship Truth',
      },
      {
        id: 'var-elena-2',
        title: 'Why You Keep Attracting Emotionally Unavailable People',
        hook: 'You are not unlovable. You are just addicted to people who make you earn their love.',
        angleSynopsis: 'Psychological mindset breakdown from personal studio reflection with gold jewelry shimmer.',
        tone: 'Empowerment & Introspective Mindset',
      },
      {
        id: 'var-elena-3',
        title: 'The Day I Stopped Explaining My Peace to Loud People',
        hook: 'Maturity is realizing silence is not weakness; it is emotional luxury.',
        angleSynopsis: 'Anti-burnout self-worth revelation with Shure SM7B mic close-up.',
        tone: 'Calm Authority & Inspiring Daily Vlog',
      },
    ];
  }

  return [
    {
      id: 'var-general-1',
      title: 'High Stakes Revelation',
      hook: 'Watch what happens when you reveal the hidden truth.',
      angleSynopsis: 'Intense narrative focus with dramatic pacing.',
      tone: 'Dramatic & High Energy',
    },
    {
      id: 'var-general-2',
      title: 'Comedy & Unexpected Relatable Twist',
      hook: 'Nobody saw this punchline coming.',
      angleSynopsis: 'Fast paced comedic timing and character reactions.',
      tone: 'Fun & Engaging',
    },
    {
      id: 'var-general-3',
      title: 'Deep Reflection & Community Conversation',
      hook: 'Tell me in the comments if you ever felt this way.',
      angleSynopsis: 'Viral conversation starter driving massive comments.',
      tone: 'Relatable & Viral',
    },
  ];
}

function buildGeminiPrompt(persona: any, customTopic?: string, imagePostType?: string, isMushaira?: boolean, isElena?: boolean, isPet?: boolean, isDrama?: boolean) {
  return `You are the Master AI Creative Director for CreatorOps Hub.
Generate a complete, production-ready daily content plan for the persona below in STRICT JSON format (no markdown, no backticks, just raw valid JSON):

PERSONA SPECS:
Name: ${persona.displayName || persona.name}
Niche: ${persona.niche}
Language: ${persona.language}
Target Audience: ${persona.targetAudience}
Visual Style: ${persona.visualStyle}
Custom Topic / Angle: ${customTopic || 'Daily Viral Momentum'}
Selected Image Post Type: ${imagePostType}

${isMushaira ? `
SPECIAL RULES FOR AI MUSHAIRA (URDU ANIMAL SHAYARI):
- Traditional Urdu Mehfil-e-Sukhan atmosphere with 3D anthropomorphic animals in sherwanis & pagris.
- Lion Host (Babbar Sher) MUST have a funny, witty introduction giving the animal contestant a hilarious title (e.g. "Janab Bakra Be-Qaraar-ud-Din Sahab", "Janab Bakra Aando Sahab", "Janab Kachwa Sust-ul-Mulk").
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
  "ytTitle": string (SEO Title <60 chars),
  "ytDescription": string (1500+ char description with timestamps & hashtags),
  "ytTags": string (15 comma-separated tags),
  "tiktokCaption": string (Hook-first caption + 4-6 hashtags),
  "tiktokHashtags": string,
  "instaCaption": string (Story-driven caption + 8-12 hashtags + CTA),
  "instaHashtags": string,
  "facebookCaption": string (Discussion-triggering question),
  "facebookHashtags": string
}
`;
}

function generateProceduralPack(persona: any, customTopic?: string, imagePostType?: string, isMushaira?: boolean, isElena?: boolean, isPet?: boolean, isDrama?: boolean) {
  if (isMushaira) {
    const contestantTitle = 'Janab Bakra Be-Qaraar-ud-Din Sahab';
    const sherUrdu = 'دل کے ارمان گھاس کے بھاؤ میں بک گئے\nہم جو بکرا تھے، قسائی کے داؤ میں پھنس گئے';
    const sherRoman = 'Dil ke armaan ghaas ke bhaao mein bik gaye,\nHum jo bakra thay, qasai ke daao mein phans gaye!';

    return {
      trendingTopic: 'Mehfil-e-Sukhan: Ghaas Ki Mehngaai Aur Bakray Ki Faryad',
      trendingAudio: 'Traditional Harmonium & Sitar Mehfil Drone (Original Sound)',
      hook: `Babbar Sher: "Khawateen-o-hazraat! Ghaas kam aur sher zyada chabanay walay... tashreef la rahe hain ${contestantTitle}!"`,
      reelScript: `[0:00-0:10] (Google Flow Clip 1)
Lion host Babbar Sher in royal gold sherwani adjusts vintage brass microphone: "Khawateen-o-hazraat! Tashreef la rahe hain ${contestantTitle}!" Camera pans as a stylish anthropomorphic Bakra in maroon velvet sherwani and silk pagri nervously walks up to the stage.

[0:10-0:20] (Google Flow Clip 2)
Bakra taps the vintage mic, clears throat: "Hazraat, arz kiya hai..." Audience of rabbits, deer, and monkeys hushes. Bakra recites: "${sherRoman.split('\n')[0]}". Seated monkey poet nods approvingly, shouting: "واہ واہ! کیا کہنے جناب!"

[0:20-0:30] (Google Flow Clip 3)
Bakra gestures with embroidered silk sleeve, delivering the punchline with dramatic emotional eyes: "${sherRoman.split('\n')[1]}" Close up on realistic goat whiskers and expressive amber eyes under golden chandelier glow.

[0:30-0:40] (Google Flow Clip 4)
Mehfil explodes in applause! Old Tortoise poet bangs his walking stick: "مکرر! مکرر! سبحان اللہ!" A sophisticated Fox in shawl wipes a fake tear. Rack focus between cheering animal audience.

[0:40-0:50] (Google Flow Clip 5)
Lion host laughs heartily, roaring gently: "Bakra Sahab, qasai se pehle aapne mehfil loot li!" Bakra places right hand on chest, bowing gracefully with a modest smirk.

[0:50-1:00] (Google Flow Clip 6)
Wide cinematic pull-back shot showing the majestic wooden amphitheater, Persian silk carpets, incense smoke gently drifting across golden lanterns. Fade to black with Mushaira title card.`,
      imagePostType: imagePostType || 'carousel (3-5 slides, 4:5 vertical)',
      imagePrompt: 'Cinematic 3D animation, anthropomorphic goat poet (Bakra) in opulent emerald green and gold velvet sherwani with diamond brooch, standing dignified on an antique wooden Mushaira stage holding handwritten Urdu poetry scroll. Persian carpets, warm glowing amber chandeliers, photorealistic animal fur texture, 8k render, octane style lighting --ar 4:5',
      carouselSlides: [
        { slide: 1, title: 'مہفل کی خاص غزل', text: contestantTitle + ' ki aag laga dene wali peshkash.', visual: 'Ornate title card with Urdu calligraphy and Lion silhouette' },
        { slide: 2, title: 'پہلا مصرعہ', text: sherUrdu.split('\n')[0], visual: 'Close up of Bakra poet reciting into vintage mic' },
        { slide: 3, title: 'دوسرا مصرعہ', text: sherUrdu.split('\n')[1], visual: 'Dramatic expression with warm lantern bokeh' },
        { slide: 4, title: 'محفل کا ردعمل', text: 'Audience reaction: "واہ واہ! مکرر مکرر!"', visual: 'Tortoise and Deer cheering in Persian balcony' },
        { slide: 5, title: 'آپ کی باری', text: 'Comments mein batayein, Bakra sahab ko kitnay number dengay?', visual: 'Interactive poll card with Babbar Sher holding ballot box' }
      ],
      storiesPlan: [
        { storyNumber: 1, type: 'Morning Vibe', caption: 'Aaj shaam mehfil saj rahi hai... Bakra sahab mic par aa rahe hain! 📜✨', sticker: 'Countdown 6:00 PM' },
        { storyNumber: 2, type: 'Poll / Interactive', caption: 'Aapki favorite poetry konsi hai? Comedy ya Dard-bhari? 👇', sticker: 'Poll: Mazahiya vs Dard' },
        { storyNumber: 3, type: 'Reel Reshare Tease', caption: 'New Mehfil Video drops now! Watch Bakra Be-Qaraar roast the audience 🔥', sticker: 'Tap to Watch' },
        { storyNumber: 4, type: 'BTS / Reflection', caption: 'Google Flow Veo 10s animation renders looking insanely cinematic today 🎬', sticker: 'Reaction Slider' },
        { storyNumber: 5, type: 'Evening Q&A Box', caption: 'Agli mehfil mein kis animal poet ko bulayein? Billi ya Oont? 🦁', sticker: 'Questions Box' }
      ],
      ytTitle: 'Bakra Be-Qaraar Ki Mehfil Shayari! 🐐😂 | Urdu Animal Mushaira Shorts',
      ytDescription: `Janab Bakra Be-Qaraar-ud-Din Sahab delivers the most hilarious poetry in the Royal Animal Mehfil-e-Sukhan! Hosted by Babbar Sher.

Timestamps:
0:00 - Babbar Sher Roasts Bakra Poet
0:10 - First Line Recitation
0:25 - The Viral Punchline
0:40 - Audience Wah-Wah Reactions

Produced with Google Flow Veo 10s Continuous Cinematic Engine.

#UrduShayari #Mushaira #AnimalAnimation #UrduPoetry #ViralShorts`,
      ytTags: 'Urdu Shayari, Animal Mushaira, Bakra Shayari, Funny Urdu Poetry, Google Flow Veo, 3D Animation Urdu, Mehfil e Sukhan, Urdu Comedy, Pakistani Shorts, Trending Poetry, Babbar Sher, Urdu Ghazal, Anthropomorphic Animals, Cinematic 3D, Viral Poetry',
      tiktokCaption: `Bakra Be-Qaraar sahab ne aaj mehfil hi loot li! 🐐😭 Tag that friend jo aisi shayari karta hai! #UrduPoetry #BakraShayari #AnimalMushaira #ComedyShayari #ViralTikTok`,
      tiktokHashtags: '#UrduPoetry #AnimalMushaira #BakraShayari #ViralTikTok #ComedyReels',
      instaCaption: `جب دل کے ارمان گھاس کے بھاؤ میں بک جائیں تو ایسی ہی شاعری نکلتی ہے! 🐐📜

Janab Bakra Be-Qaraar-ud-Din Sahab bringing down the house at Mehfil-e-Sukhan! Watch till the end for Babbar Sher's reaction! 😂

Save & Share with your poetry squad! 

#UrduPoetry #UrduShayari #AnimalMushaira #CinematicAnimation #ReelsPakistan #MehfilESukhan #ShayariLovers`,
      instaHashtags: '#UrduPoetry #UrduShayari #AnimalMushaira #ReelsPakistan #MehfilESukhan #AIAnimation #ShayariQuotes',
      facebookCaption: `Kya aapne kabhi Bakray ko sherwani pehan kar aisi zabardast shayari karte dekha hai? 😂 Comments mein batayein Bakra sahab ki shayari 10 mein se kitne number deserving hai?`,
      facebookHashtags: '#UrduMushaira #FunnyUrdu #TrendingVideos #PoetryCommunity'
    };
  }

  // Elena Default Procedural Pack
  return {
    trendingTopic: 'The Quiet Luxury of Emotional Boundaries in 2026',
    trendingAudio: 'Soft Melodic Piano Reflection (Trending UK Audio)',
    hook: 'If you constantly feel like an option to someone you treated as a priority, pause and listen to this.',
    reelScript: `[0:00-0:05] (Clip 1 - Hook)
Camera slow push-in on Elena in warm podcast studio. Shure SM7B mic in foreground. Signature cheek beauty mole visible, natural skin texture with subtle glow. Elena speaks deliberately: "You are not hard to love. You were just loving someone who required you to shrink."

[0:05-0:18] (Clip 2 - Nuance & Setup)
Cut to tight 85mm portrait angle. Soft bokeh bookshelf in background. "When you spend months over-explaining your basic needs, you aren't fighting for love—you're begging for permission to exist in their world."

[0:18-0:32] (Clip 3 - Vulnerable Revelation)
Subtle camera pan, warm golden studio fill light catches Elena's layered necklace. "The hardest realization is that their inability to see your value does not decrease your worth. It just reveals their limitation."

[0:32-0:45] (Clip 4 - Actionable CTA)
Direct eye contact to lens, calm grounded breath. "Save this for the next time you feel tempted to text someone who left you in doubt. Choose your peace. You've earned it."`,
    imagePostType: imagePostType || 'carousel (3-5 slides, 4:5 vertical)',
    imagePrompt: 'Hyper-realistic cinematic 35mm film photo of a 24-year-old European woman (Elena), brunette hair casually tied in effortless claw clip, green eyes, distinct beauty mole on cheekbone. Wearing charcoal wool trench coat and cream turtleneck holding a matcha latte on London Mayfair street, natural morning rain reflections on pavement, visible real skin texture, authentic lifestyle photography --ar 4:5',
    carouselSlides: [
      { slide: 1, title: '5 Silent Signs', text: 'How to know when you have outgrown a dynamic without feeling guilty.', visual: 'Charcoal aesthetic text cover with muted coffee tone background' },
      { slide: 2, title: '1. Over-Communicating', text: 'You find yourself drafting paragraphs to explain things that should be natural.', visual: 'Minimalist quote card with soft cream typography' },
      { slide: 3, title: '2. Post-Hangout Exhaustion', text: 'Instead of feeling energized, you feel drained and need 48 hours to recover.', visual: 'Subtle film grain background with dark slate border' },
      { slide: 4, title: '3. Silence Feels Safer', text: 'You stop sharing good news because their reaction is lukewarm.', visual: 'Clean serif text overlay with elegant line break' },
      { slide: 5, title: 'The Permission Slip', text: 'Walking away in silence is the loudest self-respect you can ever give yourself.', visual: 'Portrait photo card with Elena soft profile and signature' }
    ],
    storiesPlan: [
      { storyNumber: 1, type: 'Morning Vibe', caption: 'London rain & quiet coffee before recording today’s podcast batch ☕🌧️', sticker: 'Location: London UK' },
      { storyNumber: 2, type: 'Poll / Interactive', caption: 'Quick question for the girls: Is intuition ever wrong? 👇', sticker: 'Poll: Never vs Sometimes' },
      { storyNumber: 3, type: 'Reel Reshare Tease', caption: 'This one was hard to record but needed to be said. New reel up now 🤍', sticker: 'Tap Here' },
      { storyNumber: 4, type: 'BTS / Reflection', caption: 'Studio setup today: soft amber ring light + Shure SM7B combo is magic.', sticker: 'Slider' },
      { storyNumber: 5, type: 'Evening Q&A Box', caption: 'Drop what you’re struggling to let go of tonight. Answering a few privately 🕯️', sticker: 'Questions Box' }
    ],
    ytTitle: 'When Being "Understanding" Becomes Self-Betrayal | Elena Podcast',
    ytDescription: `Stop excusing inconsistent behavior. In today’s episode, Elena breaks down why boundary-setting feels like guilt, and how to reclaim your peace.

Timestamps:
0:00 - The Reality Check
0:15 - Over-Explaining Your Worth
0:30 - The Cost of Peace
0:42 - Reclaiming Yourself

Connect on Instagram: @elena.uk.eu
Podcast Audio available on all platforms.

#Mindset #Relationships #PersonalGrowth #SelfWorth #ElenaPodcast`,
    ytTags: 'Elena Influencer, Podcast Reel, Self Worth, Relationship Advice, Mindset Shift, UK Influencer, Female Motivation, Dating Truths, Emotional Growth, Mental Health, Boundaries, Life Advice, London Creator, Aesthetic Shorts, Viral Podcast',
    tiktokCaption: 'Stop watering dead plants and wondering why they aren’t blooming ☕ Save this when you need reminding 🤍 #relationshipadvice #mindset #selfworth #boundaries #femalegrowth',
    tiktokHashtags: '#mindset #selfworth #boundaries #relationshipadvice #elena',
    instaCaption: `The hardest pill to swallow is that you cannot love someone into treating you right. 

When you spend your energy anticipating someone else's moods, you abandon yourself in the process. True peace begins the moment you stop begging to be understood.

Save this for the days you feel tempted to break your own boundaries. 

Tag a friend who needs this reminder today 🤍

#PersonalGrowth #Mindset #SelfWorth #Boundaries #ElenaPodcast #LondonLiving #ModernRelationships`,
    instaHashtags: '#PersonalGrowth #Mindset #SelfWorth #Boundaries #ElenaPodcast #MindsetShift #HealingJourney',
    facebookCaption: 'Ladies, let’s have an honest discussion: what was the hardest boundary you ever had to set with someone you loved? Did you feel guilty at first?',
    facebookHashtags: '#WomenSupportWomen #LifeLessons #EmotionalWellness #Boundaries'
  };
}
