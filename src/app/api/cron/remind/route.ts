import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPKTDateString, getPKTDayOfWeek, getPKTHour, formatPKTTime } from '@/lib/creator-ops/time';
import { sendWhatsAppMessage } from '@/lib/creator-ops/whatsapp';

export const dynamic = 'force-dynamic';

async function handleReminder(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenParam = searchParams.get('token');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const providedToken = tokenParam || bearerToken;
    const force = searchParams.get('force') === 'true';

    // 1. Fetch system settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    const cronSecret = settings?.cronSecret || process.env.CRON_SECRET || 'creatorops_super_secret_cron_token_2025';

    // Verify token
    if (providedToken !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET token' }, { status: 401 });
    }

    // 2. Check PKT hour window
    const currentHourPKT = getPKTHour();
    const startHour = settings?.startHourPKT ?? 14;
    const endHour = settings?.endHourPKT ?? 23;

    if (!force && (currentHourPKT < startHour || currentHourPKT > endHour)) {
      return NextResponse.json({
        status: 'skipped',
        reason: `Outside PKT reminder window (${startHour}:00 - ${endHour}:00 PKT). Current PKT hour: ${currentHourPKT}:00. Use ?force=true to override.`,
        currentPKTHour: currentHourPKT,
      });
    }

    // 3. Find active persona for today's PKT day of week
    const todayDayOfWeek = getPKTDayOfWeek();
    const todayDate = getPKTDateString();

    let activePersona = await prisma.persona.findFirst({
      where: { assignedDay: todayDayOfWeek },
    });

    // Fallback if no persona assigned to this day
    if (!activePersona) {
      activePersona = await prisma.persona.findFirst();
    }

    if (!activePersona) {
      return NextResponse.json({ error: 'No personas found in the database.' }, { status: 404 });
    }

    // 4. Fetch or create today's DailyUpload record
    let upload = await prisma.dailyUpload.findUnique({
      where: {
        date_personaId: { date: todayDate, personaId: activePersona.id },
      },
    });

    if (!upload) {
      upload = await prisma.dailyUpload.create({
        data: {
          date: todayDate,
          personaId: activePersona.id,
        },
      });
    }

    // If all 4 platforms are already uploaded, skip alert!
    if (upload.allCompleted || (upload.youtubeDone && upload.instaDone && upload.tiktokDone && upload.facebookDone)) {
      return NextResponse.json({
        status: 'completed',
        message: `All 4 platforms are already uploaded for today (${activePersona.displayName || activePersona.name}). No reminder needed!`,
        upload,
      });
    }

    // 5. Format WhatsApp Reminder Message
    const pktTime = formatPKTTime();
    const brandName = activePersona.displayName || activePersona.name;
    const appUrl = settings?.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://flowcreator-os.vercel.app';

    const ytStatus = upload.youtubeDone ? '✅' : '❌';
    const instaStatus = upload.instaDone ? '✅' : '❌';
    const tiktokStatus = upload.tiktokDone ? '✅' : '❌';
    const fbStatus = upload.facebookDone ? '✅' : '❌';

    const storiesTarget = activePersona.dailyStoriesTarget || 5;
    const storiesCount = upload.storiesCount || 0;
    const storiesStatus = storiesCount >= storiesTarget ? '✅' : '⏳';

    const feedTarget = activePersona.weeklyFeedTarget || 4;
    const feedCount = upload.feedPostsCount || 0;
    const feedStatus = feedCount >= feedTarget ? '✅' : '⏳';

    const message = `🔔 *CreatorOps Daily Content Alert (PKT: ${pktTime})*
━━━━━━━━━━━━━━━━━━━━
Bhai! Aaj *@${brandName}* ke daily tasks complete karne ka time hai!

🎬 *Today's Reel (4 Platforms):*
  ${ytStatus} YouTube Shorts
  ${instaStatus} Instagram Reel
  ${tiktokStatus} TikTok
  ${fbStatus} Facebook Video

📱 *Daily Stories (IG & FB):*
  ${storiesStatus} ${storiesCount}/${storiesTarget} Stories Uploaded

🖼️ *Weekly Feed Posts / Carousels:*
  ${feedStatus} ${feedCount}/${feedTarget} Posts This Week

⚡ *AI Content Studio:*
Open dashboard for 1-click script, hook, prompts & platform copy:
${appUrl}/creator-ops
━━━━━━━━━━━━━━━━━━━━`;

    // 6. Send WhatsApp alert
    const phone = settings?.whatsappPhone || process.env.WHATSAPP_PHONE;
    if (!phone) {
      return NextResponse.json({
        status: 'skipped',
        reason: 'No recipient WhatsApp phone number configured in SystemSettings or WHATSAPP_PHONE env.',
        formattedMessage: message,
      });
    }

    const sendResult = await sendWhatsAppMessage({
      provider: (settings?.provider || process.env.WHATSAPP_PROVIDER || 'greenapi') as 'greenapi' | 'callmebot',
      phone,
      message,
      greenApiIdInstance: settings?.greenApiIdInstance || process.env.GREEN_API_ID_INSTANCE,
      greenApiApiToken: settings?.greenApiApiToken || process.env.GREEN_API_API_TOKEN,
      callmebotApiKey: settings?.callmebotApiKey || process.env.CALLMEBOT_API_KEY,
    });

    return NextResponse.json({
      status: sendResult.success ? 'sent' : 'failed',
      activePersona: activePersona.name,
      pktTime,
      sendResult,
      upload,
    });
  } catch (error: any) {
    console.error('Error in /api/cron/remind:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleReminder(req);
}

export async function POST(req: NextRequest) {
  return handleReminder(req);
}
