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

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.message || `Green-API responded with status ${res.status}`, data };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to Green-API.' };
    }
  }

  if (provider === 'callmebot') {
    if (!callmebotApiKey) {
      return { success: false, error: 'CallMeBot API Key is missing.' };
    }

    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotApiKey.trim()}`;
      const res = await fetch(url);
      const text = await res.text();

      return { success: true, data: text };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to CallMeBot.' };
    }
  }

  return { success: false, error: `Unsupported provider: ${provider}` };
}
