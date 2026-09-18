export interface WhatsAppSendParams {
  provider: 'greenapi' | 'callmebot';
  phone: string;
  message: string;
  greenApiIdInstance?: string | null;
  greenApiApiToken?: string | null;
  callmebotApiKey?: string | null;
}

export async function sendWhatsAppMessage(params: WhatsAppSendParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const { provider, phone, message, greenApiIdInstance, greenApiApiToken, callmebotApiKey } = params;

  console.log(`[WHATSAPP][INIT] Provider: ${provider}, Phone: ${phone ? phone.slice(0, 5) + '***' : 'MISSING'}`);

  if (!phone) {
    console.error('[WHATSAPP][ERROR] Recipient phone number is missing');
    return { success: false, error: 'Recipient phone number is required.' };
  }

  // Clean phone number: remove +, -, spaces
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  // Auto-format Pakistani local numbers: 03XXXXXXXXX (11 digits) -> 923XXXXXXXXX (12 digits)
  if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
    cleanPhone = '92' + cleanPhone.substring(1);
    console.log(`[WHATSAPP][FORMAT] Converted local Pakistani number to international: ${cleanPhone.slice(0, 5)}***`);
  }

  if (provider === 'greenapi') {
    if (!greenApiIdInstance || !greenApiApiToken) {
      console.error('[WHATSAPP][GREEN-API][ERROR] Missing credentials:', {
        hasIdInstance: !!greenApiIdInstance,
        hasApiToken: !!greenApiApiToken,
      });
      return {
        success: false,
        error: 'Green-API Instance ID or API Token is missing. Configure in Tab 6 (WhatsApp Settings) ya Vercel ENV mein set karein.',
      };
    }

    try {
      const endpoint = `https://api.green-api.com/waInstance${greenApiIdInstance.trim()}/sendMessage/${greenApiApiToken.trim()}`;
      const chatId = `${cleanPhone}@c.us`;

      console.log(`[WHATSAPP][GREEN-API] Outgoing POST to https://api.green-api.com/waInstance${greenApiIdInstance.trim()}/sendMessage/*** for chatId: ${chatId}`);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { raw: rawText };
      }

      console.log(`[WHATSAPP][GREEN-API] Response Status: ${res.status} ${res.statusText}`);
      console.log(`[WHATSAPP][GREEN-API] Response Body:`, rawText);

      if (!res.ok) {
        console.error(`[WHATSAPP][GREEN-API] HTTP ERROR ${res.status}:`, data);
        if (res.status === 401) {
          return {
            success: false,
            error: 'Green-API 401 Unauthorized: idInstance ya apiTokenInstance ghalat hai. Green-API dashboard se apna 50-character apiTokenInstance copy karke Tab 6 mein enter karein.',
            data,
          };
        }
        if (res.status === 403) {
          return {
            success: false,
            error: 'Green-API 403 Forbidden: Instance WhatsApp se link/authorized nahi hai! Hal: console.green-api.com par login karein, apne instance par click karein aur "QR code" open karke apne mobile WhatsApp (Linked Devices) se scan karein. Status "authorized" (Green) hotay hi message chala jayega.',
            data,
          };
        }
        return { success: false, error: data?.message || `Green-API error (HTTP ${res.status}): ${rawText}`, data };
      }

      console.log(`[WHATSAPP][GREEN-API] Message sent successfully! ID:`, data?.idMessage || 'OK');
      return { success: true, data };
    } catch (err: any) {
      console.error('[WHATSAPP][GREEN-API] Network/Fetch Exception:', err);
      return { success: false, error: err.message || 'Failed to connect to Green-API.' };
    }
  }

  if (provider === 'callmebot') {
    if (!callmebotApiKey) {
      console.error('[WHATSAPP][CALLMEBOT][ERROR] Missing CallMeBot API Key');
      return { success: false, error: 'CallMeBot API Key is missing. Configure in Tab 6 (WhatsApp Settings).' };
    }

    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotApiKey.trim()}`;
      console.log(`[WHATSAPP][CALLMEBOT] Outgoing GET request for phone: ${cleanPhone.slice(0, 5)}***`);
      
      const res = await fetch(url);
      const text = await res.text();

      console.log(`[WHATSAPP][CALLMEBOT] Response Status: ${res.status}, Body: ${text}`);

      if (!res.ok || text.toLowerCase().includes('error')) {
        console.error(`[WHATSAPP][CALLMEBOT] HTTP Error:`, text);
        return { success: false, error: `CallMeBot Error: ${text}`, data: text };
      }

      console.log(`[WHATSAPP][CALLMEBOT] Message sent successfully!`);
      return { success: true, data: text };
    } catch (err: any) {
      console.error('[WHATSAPP][CALLMEBOT] Network Exception:', err);
      return { success: false, error: err.message || 'Failed to connect to CallMeBot.' };
    }
  }

  console.error(`[WHATSAPP][ERROR] Unsupported provider: ${provider}`);
  return { success: false, error: `Unsupported provider: ${provider}` };
}
