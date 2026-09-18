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

  if (!phone) {
    return { success: false, error: 'Recipient phone number is required.' };
  }

  // Clean phone number: remove +, -, spaces
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  if (provider === 'greenapi') {
    if (!greenApiIdInstance || !greenApiApiToken) {
      return {
        success: false,
        error: 'Green-API Instance ID or API Token is missing. Configure in Tab 6 (WhatsApp Settings).',
      };
    }

    try {
      const endpoint = `https://api.green-api.com/waInstance${greenApiIdInstance.trim()}/sendMessage/${greenApiApiToken.trim()}`;
      const chatId = `${cleanPhone}@c.us`;

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

      if (!res.ok) {
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
            error: 'Green-API 403 Forbidden: Aapka WhatsApp QR code scan/authorized nahi hai ya instance inactive hai.',
            data,
          };
        }
        return { success: false, error: data?.message || `Green-API responded with status ${res.status}: ${rawText}`, data };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to Green-API.' };
    }
  }

  if (provider === 'callmebot') {
    if (!callmebotApiKey) {
      return { success: false, error: 'CallMeBot API Key is missing. Configure in Tab 6 (WhatsApp Settings).' };
    }

    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotApiKey.trim()}`;
      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok || text.toLowerCase().includes('error')) {
        return { success: false, error: `CallMeBot Error: ${text}`, data: text };
      }

      return { success: true, data: text };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to CallMeBot.' };
    }
  }

  return { success: false, error: `Unsupported provider: ${provider}` };
}
