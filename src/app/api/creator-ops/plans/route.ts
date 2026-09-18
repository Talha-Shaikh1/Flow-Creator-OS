import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPKTDateString } from '@/lib/creator-ops/time';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getPKTDateString();
    const personaId = searchParams.get('personaId');

    if (!personaId) {
      return NextResponse.json({ error: 'personaId is required' }, { status: 400 });
    }

    const plan = await prisma.dailyContentPlan.findUnique({
      where: {
        date_personaId: { date, personaId },
      },
      include: { persona: true },
    });

    return NextResponse.json({ plan, date, personaId });
  } catch (error: any) {
    console.error('Error fetching content plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      personaId,
      date = getPKTDateString(),
      trendingTopic,
      trendingAudio,
      hook,
      reelScript,
      imagePostType,
      imagePrompt,
      carouselSlides,
      storiesPlan,
      ytTitle,
      ytDescription,
      ytTags,
      tiktokCaption,
      tiktokHashtags,
      instaCaption,
      instaHashtags,
      facebookCaption,
      facebookHashtags,
    } = body;

    if (!personaId) {
      return NextResponse.json({ error: 'personaId is required' }, { status: 400 });
    }

    const plan = await prisma.dailyContentPlan.upsert({
      where: {
        date_personaId: { date, personaId },
      },
      update: {
        trendingTopic,
        trendingAudio,
        hook,
        reelScript,
        imagePostType,
        imagePrompt,
        carouselSlides: typeof carouselSlides === 'object' ? JSON.stringify(carouselSlides) : carouselSlides,
        storiesPlan: typeof storiesPlan === 'object' ? JSON.stringify(storiesPlan) : storiesPlan,
        ytTitle,
        ytDescription,
        ytTags,
        tiktokCaption,
        tiktokHashtags,
        instaCaption,
        instaHashtags,
        facebookCaption,
        facebookHashtags,
      },
      create: {
        date,
        personaId,
        trendingTopic,
        trendingAudio,
        hook,
        reelScript,
        imagePostType,
        imagePrompt,
        carouselSlides: typeof carouselSlides === 'object' ? JSON.stringify(carouselSlides) : carouselSlides,
        storiesPlan: typeof storiesPlan === 'object' ? JSON.stringify(storiesPlan) : storiesPlan,
        ytTitle,
        ytDescription,
        ytTags,
        tiktokCaption,
        tiktokHashtags,
        instaCaption,
        instaHashtags,
        facebookCaption,
        facebookHashtags,
      },
      include: { persona: true },
    });

    return NextResponse.json({ plan, success: true });
  } catch (error: any) {
    console.error('Error saving content plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
