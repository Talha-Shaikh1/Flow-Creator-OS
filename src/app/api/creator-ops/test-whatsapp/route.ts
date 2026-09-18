import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/creator-ops/whatsapp';
import { formatPKTTime } from '@/lib/creator-ops/time';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const reqTime = new Date().toISOString();
  console.log(`[TEST-WHATSAPP][${reqTime}] Incoming test WhatsApp request`);

  try {
    const body = await req.json().catch(() => ({}));
    console.log(`[TEST-WHATSAPP] Request payload received:`, {
      provider: body.provider || 'default',
      phone: body.phone ? body.phone.slice(0, 5) + '***' : 'none',
      hasIdInstance: !!body.greenApiIdInstance,
      hasApiToken: !!body.greenApiApiToken,
      hasCallmebotKey: !!body.callmebotApiKey,
    });

    let settings = null;
    try {
      settings = await prisma.systemSettings.findUnique({
        where: { id: 'default' },
      });
      console.log(`[TEST-WHATSAPP] Loaded DB settings:`, {
        provider: settings?.provider,
        hasPhone: !!settings?.whatsappPhone,
        hasIdInstance: !!settings?.greenApiIdInstance,
        hasApiToken: !!settings?.greenApiApiToken,
      });
    } catch (dbErr: any) {
      console.warn(`[TEST-WHATSAPP] DB lookup warning (using env fallbacks):`, dbErr.message);
    }

    const provider = (body.provider || settings?.provider || process.env.WHATSAPP_PROVIDER || 'greenapi') as 'greenapi' | 'callmebot';
    const phone = body.phone || settings?.whatsappPhone || process.env.WHATSAPP_PHONE;
    const greenApiIdInstance = body.greenApiIdInstance || settings?.greenApiIdInstance || process.env.GREEN_API_ID_INSTANCE;
    const greenApiApiToken = body.greenApiApiToken || settings?.greenApiApiToken || process.env.GREEN_API_API_TOKEN;
    const callmebotApiKey = body.callmebotApiKey || settings?.callmebotApiKey || process.env.CALLMEBOT_API_KEY;

    console.log(`[TEST-WHATSAPP] Resolved credentials:`, {
      provider,
      phone: phone ? phone.slice(0, 5) + '***' : 'MISSING',
      greenApiIdInstance: greenApiIdInstance ? greenApiIdInstance.slice(0, 4) + '***' : 'MISSING',
      apiTokenLength: greenApiApiToken ? greenApiApiToken.length : 0,
      hasCallmebotKey: !!callmebotApiKey,
    });

    if (!phone) {
      console.error('[TEST-WHATSAPP] FAILED: Phone number is missing');
      return NextResponse.json(
        { error: 'Phone number missing hai! Tab 6 (WhatsApp Settings) mein recipient WhatsApp number enter karein.' },
        { status: 400 }
      );
    }

    if (provider === 'greenapi') {
      if (!greenApiIdInstance || !greenApiApiToken) {
        console.error('[TEST-WHATSAPP] FAILED: Green-API credentials missing');
        return NextResponse.json(
          { error: 'Green-API idInstance ya apiTokenInstance missing hai. Tab 6 (WhatsApp Settings) mein credentials enter karein.' },
          { status: 400 }
        );
      }
      if (greenApiIdInstance.trim() === greenApiApiToken.trim()) {
        console.error('[TEST-WHATSAPP] FAILED: idInstance and apiTokenInstance are identical');
        return NextResponse.json(
          { error: 'idInstance aur apiTokenInstance donon same hain! Green-API Console se apna 50-character "apiTokenInstance" (hex token) copy karke Tab 6 mein enter karein.' },
          { status: 400 }
        );
      }
    }

    if (provider === 'callmebot' && !callmebotApiKey) {
      console.error('[TEST-WHATSAPP] FAILED: CallMeBot API key missing');
      return NextResponse.json(
        { error: 'CallMeBot API Key missing hai. Tab 6 mein CallMeBot API key enter karein.' },
        { status: 400 }
      );
    }

    const pktTime = formatPKTTime();
    const testMessage = `🔔 *CreatorOps Test Notification*\n━━━━━━━━━━━━━━━━━━━━\nAssalam-o-Alaikum Bhai!\n\nYeh CreatorOps Hub & WhatsApp Automation ka test message hai.\n\n⏰ *Time:* ${pktTime}\n⚡ *Provider:* ${provider.toUpperCase()}\n✅ *System Status:* 100% Operational\n\nSab set hai, automated reminders on ho chuke hain!\n━━━━━━━━━━━━━━━━━━━━`;

    console.log(`[TEST-WHATSAPP] Sending message via sendWhatsAppMessage helper...`);
    const result = await sendWhatsAppMessage({
      provider,
      phone,
      message: testMessage,
      greenApiIdInstance,
      greenApiApiToken,
      callmebotApiKey,
    });

    if (!result.success) {
      console.error(`[TEST-WHATSAPP] sendWhatsAppMessage failed:`, {
        error: result.error,
        data: result.data,
      });
      return NextResponse.json(
        {
          error: result.error,
          data: result.data,
          debug: {
            provider,
            phoneMasked: phone.slice(0, 5) + '***',
            idInstanceMasked: greenApiIdInstance ? greenApiIdInstance.slice(0, 4) + '***' : null,
          }
        },
        { status: 400 }
      );
    }

    console.log(`[TEST-WHATSAPP] Test message successfully delivered!`);
    return NextResponse.json({ success: true, message: 'Test message sent successfully!', data: result.data });
  } catch (error: any) {
    console.error(`[TEST-WHATSAPP] FATAL ERROR in route handler:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
