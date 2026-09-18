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
      const allUploads = await prisma.dailyUpload.findMany({
        where: { date },
        include: { persona: true },
      });
      return NextResponse.json({ uploads: allUploads, date });
    }

    const upload = await prisma.dailyUpload.findUnique({
      where: {
        date_personaId: { date, personaId },
      },
      include: { persona: true },
    });

    return NextResponse.json({ upload, date, personaId });
  } catch (error: any) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      personaId,
      date = getPKTDateString(),
      videoTitle,
      notes,
      youtubeDone,
      instaDone,
      tiktokDone,
      facebookDone,
      youtubeUrl,
      instaUrl,
      tiktokUrl,
      facebookUrl,
      feedPostsCount,
      storiesCount,
      markAllDone,
    } = body;

    if (!personaId) {
      return NextResponse.json({ error: 'personaId is required' }, { status: 400 });
    }

    // Existing record lookup or default
    const existing = await prisma.dailyUpload.findUnique({
      where: {
        date_personaId: { date, personaId },
      },
    });

    let yt = youtubeDone !== undefined ? Boolean(youtubeDone) : existing?.youtubeDone || false;
    let ig = instaDone !== undefined ? Boolean(instaDone) : existing?.instaDone || false;
    let tt = tiktokDone !== undefined ? Boolean(tiktokDone) : existing?.tiktokDone || false;
    let fb = facebookDone !== undefined ? Boolean(facebookDone) : existing?.facebookDone || false;

    if (markAllDone) {
      yt = true;
      ig = true;
      tt = true;
      fb = true;
    }

    const allCompleted = yt && ig && tt && fb;

    const upload = await prisma.dailyUpload.upsert({
      where: {
        date_personaId: { date, personaId },
      },
      update: {
        videoTitle: videoTitle !== undefined ? videoTitle : existing?.videoTitle,
        notes: notes !== undefined ? notes : existing?.notes,
        youtubeDone: yt,
        instaDone: ig,
        tiktokDone: tt,
        facebookDone: fb,
        youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : existing?.youtubeUrl,
        instaUrl: instaUrl !== undefined ? instaUrl : existing?.instaUrl,
        tiktokUrl: tiktokUrl !== undefined ? tiktokUrl : existing?.tiktokUrl,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : existing?.facebookUrl,
        allCompleted,
        feedPostsCount: feedPostsCount !== undefined ? parseInt(feedPostsCount) : existing?.feedPostsCount || 0,
        storiesCount: storiesCount !== undefined ? parseInt(storiesCount) : existing?.storiesCount || 0,
      },
      create: {
        date,
        personaId,
        videoTitle: videoTitle || null,
        notes: notes || null,
        youtubeDone: yt,
        instaDone: ig,
        tiktokDone: tt,
        facebookDone: fb,
        youtubeUrl: youtubeUrl || null,
        instaUrl: instaUrl || null,
        tiktokUrl: tiktokUrl || null,
        facebookUrl: facebookUrl || null,
        allCompleted,
        feedPostsCount: feedPostsCount !== undefined ? parseInt(feedPostsCount) : 0,
        storiesCount: storiesCount !== undefined ? parseInt(storiesCount) : 0,
      },
      include: { persona: true },
    });

    return NextResponse.json({ upload, success: true });
  } catch (error: any) {
    console.error('Error updating upload:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
