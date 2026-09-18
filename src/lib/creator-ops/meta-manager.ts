import { GoogleGenAI } from '@google/genai';

export interface SocialMetaPack {
  personaSlug: string;
  format: 'reel' | 'carousel' | 'stories';
  topic: string;
  bestPktTimes: string[];
  youtube: {
    title: string;
    description: string;
    tags: string[];
    pinnedComment: string;
  };
  instagram: {
    firstLineHook: string;
    captionBody: string;
    carouselSlidesMeta?: { slideNumber: number; heading: string; caption: string }[];
    callToAction: string;
    pinnedComment: string;
    hashtags: string[];
  };
  tiktok: {
    caption: string;
    recommendedSound: string;
    hashtags: string[];
  };
  facebook: {
    postHeadline: string;
    discussionPrompt: string;
    fullText: string;
    hashtags: string[];
  };
  monetizationTips: string[];
}

export async function generateSocialMetaPack(params: {
  personaSlug: string;
  format: 'reel' | 'carousel' | 'stories';
  topic?: string;
  sherLines?: { oola: string; sani: string };
  characterName?: string;
}): Promise<SocialMetaPack> {
  const { personaSlug, format, topic, sherLines, characterName } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an elite Social Media Growth & Monetization Director for 4 AI-driven short-form accounts (YouTube Shorts, Instagram Reels & Carousels, TikTok, Facebook Reels).
Your objective: Maximize view retention, comment velocity, saves, and reach 30-60 day monetization thresholds.

Input Parameters:
- Persona: ${personaSlug}
- Post Format: ${format.toUpperCase()}
- Topic/Context: ${topic || 'Daily Viral Content'}
${sherLines ? `- Urdu Sher: Misra-e-Oola: "${sherLines.oola}", Misra-e-Sani: "${sherLines.sani}"` : ''}
${characterName ? `- Character: ${characterName}` : ''}

Generate a JSON object matching this exact TypeScript structure:
{
  "personaSlug": "${personaSlug}",
  "format": "${format}",
  "topic": "${topic || 'Daily Viral Content'}",
  "bestPktTimes": ["2:30 PM PKT", "8:30 PM PKT"],
  "youtube": {
    "title": "High CTR Title (<70 chars with emoji)",
    "description": "SEO-rich description with keywords, hashtags, and subscribe CTA",
    "tags": ["tag1", "tag2", "tag3"],
    "pinnedComment": "Comment question to drive replies"
  },
  "instagram": {
    "firstLineHook": "First 5 words that stop scrolling before the '...more' button",
    "captionBody": "Deep storytelling or breakdown",
    "carouselSlidesMeta": [
      { "slideNumber": 1, "heading": "Slide 1 Hook", "caption": "Slide 1 text" },
      { "slideNumber": 2, "heading": "Slide 2", "caption": "Slide 2 text" },
      { "slideNumber": 3, "heading": "Slide 3", "caption": "Slide 3 text" },
      { "slideNumber": 4, "heading": "Slide 4", "caption": "Slide 4 text" },
      { "slideNumber": 5, "heading": "Slide 5 CTA", "caption": "Save & Share CTA" }
    ],
    "callToAction": "Save this post for later 📌 and share with someone who needs this!",
    "pinnedComment": "Provocative question for comment section",
    "hashtags": ["#tag1", "#tag2", ... 25 hashtags]
  },
  "tiktok": {
    "caption": "Punchy under 140 chars with emoji",
    "recommendedSound": "Audio recommendation name or vibe",
    "hashtags": ["#fyp", "#viral", "#foryou", ...]
  },
  "facebook": {
    "postHeadline": "Engaging Headline",
    "discussionPrompt": "Question that sparks debate among older/broader Facebook audience",
    "fullText": "Full engaging post text",
    "hashtags": ["#facebookreels", "#viral"]
  },
  "monetizationTips": [
    "Tip 1: Reply to first 10 comments within 15 mins to double algorithmic push.",
    "Tip 2: Cross-link in pinned comment."
  ]
}

Respond ONLY with the JSON object.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini Meta generation failed, using procedural fallback:', err);
    }
  }

  // Procedural Fallback Engine
  return generateProceduralMetaPack(params);
}

function generateProceduralMetaPack(params: {
  personaSlug: string;
  format: 'reel' | 'carousel' | 'stories';
  topic?: string;
  sherLines?: { oola: string; sani: string };
  characterName?: string;
}): SocialMetaPack {
  const { personaSlug, format, topic, sherLines, characterName } = params;

  if (personaSlug === 'mushaira.animals.urdu') {
    const poet = characterName || 'Janab Bakra Be-Qaraar-ud-Din';
    const sher = sherLines || {
      oola: 'دل کے بازار میں ہر چیز خریدار کے ساتھ',
      sani: 'ہم وفا بیچنے نکلے تھے خسارے کے ساتھ',
    };

    return {
      personaSlug,
      format,
      topic: topic || 'Friday Mehfil-e-Sukhan Special',
      bestPktTimes: ['2:30 PM PKT (Jumma Peak)', '8:45 PM PKT (Family Prime)'],
      youtube: {
        title: `جب جانوروں نے مشاعرہ لوٹ لیا! 😂🔥 ${poet} کی زبردست شاعری #Shorts`,
        description: `بابر شیر میزبان اور ${poet} کا شاندار کلام!\n\nمصرع اولیٰ: ${sher.oola}\nمصرع ثانی: ${sher.sani}\n\nمزید تفریحی اور باکمال مشاعروں کے لیے ابھی سبسکرائب کریں! ❤️\n\n#AIMushaira #UrduPoetry #UrduShayari #UrduStatus #Shorts #FunnyUrdu`,
        tags: ['Urdu Mushaira', 'AI Animals', 'Urdu Poetry', 'Bakra Shayari', 'Funny Urdu', 'Mehfil e Sukhan', 'Shorts', 'Viral'],
        pinnedComment: `کیا آپ کو ${poet} کا کلام پسند آیا یا بابر شیر کی میزبانی؟ کمنٹ میں واہ واہ ضرور لکھیں! 🦁🐐`,
      },
      instagram: {
        firstLineHook: `محفل میں سناٹا چھا گیا جب ${poet} مائیک پر آئے... 🎙️✨`,
        captionBody: `محفلِ سخن میں روایتی شیروانی زیب تن کیے جب ہمارے شاعر نے اپنا دل کھول کر رکھ دیا!\n\n"${sher.oola}\n${sher.sani}"\n\nسامعین جانوروں کی داد اور بابر شیر کی مسکراہٹ نے سماں باندھ دیا۔ آپ کو یہ شعر کیسا لگا؟`,
        carouselSlidesMeta: [
          { slideNumber: 1, heading: 'محفلِ سخن کا آغاز', caption: 'بابر شیر کا پرمزاح تعارف اور شاعر کا استقبال' },
          { slideNumber: 2, heading: 'مصرعِ اولیٰ', caption: `"${sher.oola}"` },
          { slideNumber: 3, heading: 'مصرعِ ثانی (حاصلِ کلام)', caption: `"${sher.sani}"` },
          { slideNumber: 4, heading: 'سامعین کا ردِ عمل', caption: 'واہ واہ! کیا کہنے! مکرر مکرر کی گونج!' },
          { slideNumber: 5, heading: 'پسند آیا؟', caption: 'اس پوسٹ کو سیو کریں 📌 اور اپنے شعر و ادب کے شوقین دوستوں کے ساتھ شیئر کریں!' },
        ],
        callToAction: 'اگر آپ کو اردو شاعری سے لگاؤ ہے تو اس پوسٹ کو سیو کریں 📌 اور شیئر کریں!',
        pinnedComment: 'اس شعر کا کون سا مصرع آپ کے دل کو چھو گیا؟ کمنٹ کریں! 👇',
        hashtags: [
          '#UrduShayari', '#UrduPoetry', '#AIMushaira', '#MehfilESukhan', '#UrduLiterature',
          '#UrduQuotes', '#UrduAdab', '#UrduLines', '#ShayariLovers', '#UrduDesign',
          '#PakistanCreators', '#Lahore', '#Karachi', '#Islamabad', '#Delhi',
          '#Lucknow', '#UrduReels', '#CarouselPost', '#ShayariReels', '#PoetryCommunity',
          '#InstaUrdu', '#UrduPosts', '#UrduGhazal', '#UrduLovers', '#DailyUrdu'
        ],
      },
      tiktok: {
        caption: `جب ببر شیر نے بکرا صاحب کو مائیک دیا تو مشاعرہ الٹ گیا! 😂🐐🔥 #UrduPoetry #AIMushaira #Bakra`,
        recommendedSound: 'Traditional Classical Harmonium & Tabla (Slow Mehfil Vibe)',
        hashtags: ['#fyp', '#urdupoetry', '#aimushaira', '#foryoupage', '#tiktokpakistan', '#urdushayari'],
      },
      facebook: {
        postHeadline: 'جانوروں کا روایتی مشاعرہ: ایسا کلام کہ دل باغ باغ ہو جائے!',
        discussionPrompt: 'کیا آپ نے کبھی ایسا انوکھا مشاعرہ دیکھا ہے؟ آپ کی نظر میں سب سے بہترین شاعر کون سا جانور بن سکتا ہے؟',
        fullText: `محفلِ سخن کی روایات کو ایک نئے روپ میں پیش کیا گیا ہے۔ ${poet} کی یہ لاجواب پیشکش ملاحظہ فرمائیں!\n\n"${sher.oola}\n${sher.sani}"\n\nاگر پسند آئے تو پیج کو فالو کریں اور ویڈیو کو شیئر ضرور کریں!`,
        hashtags: ['#UrduMushaira', '#FacebookReels', '#UrduPoetry', '#UrduShayari', '#Pakistan'],
      },
      monetizationTips: [
        'Tip 1: First 30 mins mein comments ka foran reply dein taake Facebook & YouTube algorithm boost kare.',
        'Tip 2: Carousel post par "Save" ka CTA zaroor dhyan se check karein (Instagram saves algorithm ka sabse bada ranking factor hai).',
      ],
    };
  }

  if (personaSlug === 'elena.uk.eu') {
    return {
      personaSlug,
      format,
      topic: topic || 'Friday Aesthetic Photo Dump & Dating Realities',
      bestPktTimes: ['6:00 PM PKT', '9:15 PM PKT'],
      youtube: {
        title: `The 1 Habit That Changed My Entire Dating Mindset ☕✨ #Shorts`,
        description: `Unfiltered conversation on standards, self-worth, and European living.\n\nSubscribe for daily raw lifestyle insights & relationship psychology.\n\n#Elena #Mindset #RelationshipAdvice #LifestyleVlog #Shorts`,
        tags: ['Elena', 'Dating Advice', 'Mindset', 'Female Empowerment', 'European Aesthetic', 'Lifestyle Vlog', 'Shorts'],
        pinnedComment: 'Do you agree with this boundary? Let me know your experience in the comments! 👇',
      },
      instagram: {
        firstLineHook: `Normalize walking away the first time someone shows you who they are. 🕊️`,
        captionBody: `Friday mood in London. Over coffee this morning, I realized how much peace comes from no longer explaining yourself to people committed to misunderstanding you.\n\nSwipe through for today’s photo dump & thoughts on emotional maturity. Which slide speaks to you most?`,
        carouselSlidesMeta: [
          { slideNumber: 1, heading: 'The Raw Truth', caption: 'Cozy morning coffee corner in Kensington, dark knit top, looking into lens.' },
          { slideNumber: 2, heading: 'Unfiltered Thoughts', caption: 'Street candid, natural warm daylight, authentic skin texture & signature mole.' },
          { slideNumber: 3, heading: 'The Mindset Shift', caption: 'Close-up portrait with gold layered necklace, soft focus background.' },
          { slideNumber: 4, heading: 'Friday Night Prep', caption: 'Evening city lights reflecting on cafe window, serene confident expression.' },
          { slideNumber: 5, heading: 'Reminder for You', caption: 'Save this post 📌 whenever you need a reminder to choose your peace.' },
        ],
        callToAction: 'Save this post 📌 whenever you need a reminder to choose your peace, and share with your bestie!',
        pinnedComment: 'Drop a ☕ if you needed to hear this today!',
        hashtags: [
          '#ElenaLifestyle', '#EuropeanAesthetic', '#MindsetShift', '#DatingAdviceForWomen',
          '#HighValueWoman', '#SelfLoveJourney', '#LondonAesthetic', '#ParisVibes',
          '#PhotoDumpFriday', '#CarouselPost', '#AestheticFeed', '#FemaleMindset',
          '#RelationshipAdvice', '#CleanGirlAesthetic', '#WarmTones', '#SlowLiving',
          '#AuthenticSelf', '#SelfWorth', '#ConfidenceQuotes', '#EmotionalMaturity',
          '#DailyVlog', '#CozyVibes', '#LifestyleBlogger', '#ReelsInstagram', '#CreatorEconomy'
        ],
      },
      tiktok: {
        caption: `The harsh dating truth nobody wants to say out loud ☕🖤 #datingadvice #mindset #femalecreator #relatable`,
        recommendedSound: 'Lana Del Rey / Billie Eilish slowed reverb instrumental',
        hashtags: ['#fyp', '#datingadvice', '#mindset', '#foryou', '#aesthetic', '#london'],
      },
      facebook: {
        postHeadline: 'A Friday reminder for anyone feeling drained by relationships:',
        discussionPrompt: 'What is the number one lesson you learned the hard way in relationships? Share below!',
        fullText: `Peace is expensive. Don't waste it on people who can't afford your depth.\n\nSwipe through today’s photo dump and let me know your thoughts in the comments! Follow for daily honest reflections.`,
        hashtags: ['#Elena', '#Mindset', '#Relationships', '#LifeLessons', '#FacebookReels'],
      },
      monetizationTips: [
        'Tip 1: Instagram Carousel saves are the primary driver of explore page recommendations.',
        'Tip 2: On TikTok, ensure the text hook is visible on the video cover thumbnail.',
      ],
    };
  }

  // Generic / Pet / Drama fallback
  return {
    personaSlug,
    format,
    topic: topic || 'Daily Operations Mission',
    bestPktTimes: ['6:30 PM PKT', '9:30 PM PKT'],
    youtube: {
      title: `${topic || 'Must Watch Episode'} | FlowCreator Daily #Shorts`,
      description: `Watch this full clip and subscribe for daily episodes!\n\n#Shorts #Viral #CreatorOps`,
      tags: ['Shorts', 'Viral', 'Episode', 'Trending'],
      pinnedComment: 'What was your favorite moment? Comment below!',
    },
    instagram: {
      firstLineHook: `You won't believe what happened next... 🎬👀`,
      captionBody: `Daily high-production short form series. Turn on notifications so you never miss an episode!\n\n#CreatorOps`,
      callToAction: 'Save & Share with a friend!',
      pinnedComment: 'Drop your theories in the comments! 👇',
      hashtags: ['#Reels', '#TrendingReels', '#ShortFormContent', '#ViralVideos', '#CreatorEconomy'],
    },
    tiktok: {
      caption: `Watch till the end... 😳🔥 #fyp #viral #foryou`,
      recommendedSound: 'Trending Suspense / High Energy Beat',
      hashtags: ['#fyp', '#viral', '#trending', '#foryoupage'],
    },
    facebook: {
      postHeadline: 'Today\'s Featured Story:',
      discussionPrompt: 'What would you do in this situation? Let us know in the comments!',
      fullText: 'Watch and share with your family and friends!',
      hashtags: ['#FacebookReels', '#ViralStory'],
    },
    monetizationTips: [
      'Consistent daily uploads ensure YouTube algorithm maintains your impression velocity.',
      'Pin the most provocative comment to drive replies.',
    ],
  };
}
