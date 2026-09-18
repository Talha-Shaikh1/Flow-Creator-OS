import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          provider: 'greenapi',
          cronSecret: 'creatorops_super_secret_cron_token_2025',
          startHourPKT: 14,
          endHourPKT: 23,
        },
      });
    }

    const effectiveSettings = {
      ...settings,
      whatsappPhone: settings?.whatsappPhone || process.env.WHATSAPP_PHONE || null,
      greenApiIdInstance: settings?.greenApiIdInstance || process.env.GREEN_API_ID_INSTANCE || null,
      greenApiApiToken: settings?.greenApiApiToken || process.env.GREEN_API_API_TOKEN || null,
      callmebotApiKey: settings?.callmebotApiKey || process.env.CALLMEBOT_API_KEY || null,
      provider: settings?.provider || process.env.WHATSAPP_PROVIDER || 'greenapi',
    };

    return NextResponse.json({ settings: effectiveSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider = 'greenapi',
      whatsappPhone,
      callmebotApiKey,
      greenApiIdInstance,
      greenApiApiToken,
      geminiApiKey,
      cronSecret,
      startHourPKT,
      endHourPKT,
      appUrl,
    } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        provider,
        whatsappPhone,
        callmebotApiKey,
        greenApiIdInstance,
        greenApiApiToken,
        geminiApiKey,
        cronSecret: cronSecret || 'creatorops_super_secret_cron_token_2025',
        startHourPKT: startHourPKT !== undefined ? parseInt(startHourPKT) : 14,
        endHourPKT: endHourPKT !== undefined ? parseInt(endHourPKT) : 23,
        appUrl,
      },
      create: {
        id: 'default',
        provider,
        whatsappPhone,
        callmebotApiKey,
        greenApiIdInstance,
        greenApiApiToken,
        geminiApiKey,
        cronSecret: cronSecret || 'creatorops_super_secret_cron_token_2025',
        startHourPKT: startHourPKT !== undefined ? parseInt(startHourPKT) : 14,
        endHourPKT: endHourPKT !== undefined ? parseInt(endHourPKT) : 23,
        appUrl,
      },
    });

    return NextResponse.json({ settings, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
