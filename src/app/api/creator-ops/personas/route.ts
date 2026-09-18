import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPKTDateString } from '@/lib/creator-ops/time';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const today = getPKTDateString();

    const personas = await prisma.persona.findMany({
      include: {
        gmailAccount: true,
        dailyUploads: {
          where: { date: today },
        },
      },
      orderBy: [
        { assignedDay: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ personas, today });
  } catch (error: any) {
    console.error('Error fetching personas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      displayName,
      assignedDay,
      niche,
      language,
      targetAudience,
      visualStyle,
      framePrompt,
      masterVideoPrompt,
      weeklyReelsTarget,
      weeklyFeedTarget,
      dailyStoriesTarget,
      gmailAccountId,
      youtubeHandle,
      youtubeUrl,
      instaHandle,
      instaUrl,
      tiktokHandle,
      tiktokUrl,
      facebookHandle,
      facebookUrl,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Persona name is required' }, { status: 400 });
    }

    const persona = await prisma.persona.upsert({
      where: { name },
      update: {
        displayName: displayName || name,
        assignedDay: assignedDay !== undefined ? parseInt(assignedDay) : null,
        niche,
        language: language || 'English',
        targetAudience,
        visualStyle,
        framePrompt,
        masterVideoPrompt,
        weeklyReelsTarget: weeklyReelsTarget !== undefined ? parseInt(weeklyReelsTarget) : 3,
        weeklyFeedTarget: weeklyFeedTarget !== undefined ? parseInt(weeklyFeedTarget) : 4,
        dailyStoriesTarget: dailyStoriesTarget !== undefined ? parseInt(dailyStoriesTarget) : 5,
        gmailAccountId: gmailAccountId || null,
        youtubeHandle,
        youtubeUrl,
        instaHandle,
        instaUrl,
        tiktokHandle,
        tiktokUrl,
        facebookHandle,
        facebookUrl,
      },
      create: {
        name,
        displayName: displayName || name,
        assignedDay: assignedDay !== undefined ? parseInt(assignedDay) : null,
        niche,
        language: language || 'English',
        targetAudience,
        visualStyle,
        framePrompt,
        masterVideoPrompt,
        weeklyReelsTarget: weeklyReelsTarget !== undefined ? parseInt(weeklyReelsTarget) : 3,
        weeklyFeedTarget: weeklyFeedTarget !== undefined ? parseInt(weeklyFeedTarget) : 4,
        dailyStoriesTarget: dailyStoriesTarget !== undefined ? parseInt(dailyStoriesTarget) : 5,
        gmailAccountId: gmailAccountId || null,
        youtubeHandle,
        youtubeUrl,
        instaHandle,
        instaUrl,
        tiktokHandle,
        tiktokUrl,
        facebookHandle,
        facebookUrl,
      },
    });

    return NextResponse.json({ persona });
  } catch (error: any) {
    console.error('Error saving persona:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
