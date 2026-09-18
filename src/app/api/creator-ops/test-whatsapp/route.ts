import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/creator-ops/whatsapp';
import { formatPKTTime } from '@/lib/creator-ops/time';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    const provider = (body.provider || settings?.provider || 'greenapi') as 'greenapi' | 'callmebot';
    const phone = body.phone || settings?.whatsappPhone || process.env.WHATSAPP_PHONE;
    const greenApiIdInstance = body.greenApiIdInstance || settings?.greenApiIdInstance;
    const greenApiApiToken = body.greenApiApiToken || settings?.greenApiApiToken;
    const callmebotApiKey = body.callmebotApiKey || settings?.callmebotApiKey;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number missing hai! Tab 6 (WhatsApp Settings) mein recipient WhatsApp number enter karein.' },
        { status: 400 }
      );
    }

    if (provider === 'greenapi') {
      if (!greenApiIdInstance || !greenApiApiToken) {
        return NextResponse.json(
          { error: 'Green-API idInstance ya apiTokenInstance missing hai. Tab 6 (WhatsApp Settings) mein credentials enter karein.' },
          { status: 400 }
        );
      }
      if (greenApiIdInstance.trim() === greenApiApiToken.trim()) {
        return NextResponse.json(
          { error: 'idInstance aur apiTokenInstance donon same hain! Green-API Console se apna 50-character "apiTokenInstance" (hex token) copy karke Tab 6 mein enter karein.' },
          { status: 400 }
        );
      }
    }

    if (provider === 'callmebot' && !callmebotApiKey) {
      return NextResponse.json(
        { error: 'CallMeBot API Key missing hai. Tab 6 mein CallMeBot API key enter karein.' },
        { status: 400 }
      );
    }

    const pktTime = formatPKTTime();
    const testMessage = `🔔 *CreatorOps Test Notification*\n━━━━━━━━━━━━━━━━━━━━\nAssalam-o-Alaikum Bhai!\n\nYeh CreatorOps Hub & WhatsApp Automation ka test message hai.\n\n⏰ *Time:* ${pktTime}\n⚡ *Provider:* ${provider.toUpperCase()}\n✅ *System Status:* 100% Operational\n\nSab set hai, automated reminders on ho chuke hain!\n━━━━━━━━━━━━━━━━━━━━`;

    const result = await sendWhatsAppMessage({
      provider,
      phone,
      message: testMessage,
      greenApiIdInstance,
      greenApiApiToken,
      callmebotApiKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, data: result.data }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Test message sent successfully!', data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
