import { GoogleGenAI } from '@google/genai';

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'anthropic' | 'openrouter' | 'omniroute';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface UniversalLLMResponse {
  text: string;
  parsed?: any;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  omniroute: 'auto',
  gemini: 'gemini-3.6-flash',
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  anthropic: 'claude-3-5-sonnet-20241022',
  openrouter: 'google/gemini-2.0-flash-001',
};

export const DEFAULT_OMNIROUTE_BASE_URL = 'http://localhost:20128/v1';

export const PROVIDER_OPTIONS: Array<{
  id: AIProvider;
  name: string;
  description: string;
  defaultModel: string;
  popularModels: string[];
  badge?: string;
}> = [
  {
    id: 'omniroute',
    name: 'OmniRoute Gateway',
    description: 'Open-source self-hosted AI gateway pooling 90+ free tiers (Mistral 1B tokens, Cerebras, Groq).',
    defaultModel: 'auto',
    popularModels: ['auto', 'mistral-large-latest', 'llama-3.3-70b-versatile', 'gemini-2.5-flash', 'deepseek-chat'],
    badge: '1B FREE TOKENS POOL',
  },
  {
    id: 'groq',
    name: 'Groq (Ultra-Fast LPU)',
    description: 'Sub-second real-time inference on open-source weights (Llama 3.3 70B).',
    defaultModel: 'llama-3.3-70b-versatile',
    popularModels: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'],
    badge: 'FREE & LIGHTNING FAST',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Multimodal intelligence via Gemini 3.6 Flash & 1.5 Pro.',
    defaultModel: 'gemini-3.6-flash',
    popularModels: ['gemini-3.6-flash', 'gemini-1.5-pro'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'State-of-the-art GPT-4o and o3 reasoning models.',
    defaultModel: 'gpt-4o-mini',
    popularModels: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Nuanced dialogue, creative storytelling and script doctoring.',
    defaultModel: 'claude-3-5-sonnet-20241022',
    popularModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified gateway to 200+ AI models with single key.',
    defaultModel: 'google/gemini-2.0-flash-001',
    popularModels: [
      'google/gemini-2.0-flash-001',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct',
      'openai/gpt-4o',
    ],
  },
];

export function resolveServerKey(provider: AIProvider): string | null {
  switch (provider) {
    case 'gemini':
      return (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        null
      );
    case 'openai':
      return process.env.OPENAI_API_KEY || null;
    case 'groq':
      return process.env.GROQ_API_KEY || null;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || null;
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || null;
    case 'omniroute':
      return process.env.OMNIROUTE_API_KEY || null;
  }
}

export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

export function parseFlexibleJson<T = any>(raw: string): T {
  const cleaned = cleanJsonText(raw);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try to locate first '{' and last '}' or '[' and ']'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      const candidate = cleaned.slice(firstBracket, lastBracket + 1);
      return JSON.parse(candidate);
    }
    throw new Error(`LLM output was not valid JSON: ${raw.slice(0, 200)}...`);
  }
}

export async function callUniversalLLM({
  config,
  prompt,
  systemInstruction,
  temperature = 0.7,
  responseJson = true,
}: {
  config?: AIProviderConfig;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  responseJson?: boolean;
}): Promise<UniversalLLMResponse> {
  const provider: AIProvider = config?.provider || 'gemini';
  const apiKey = (config?.apiKey && config.apiKey.trim().length > 0)
    ? config.apiKey.trim()
    : resolveServerKey(provider);

  const model = config?.model?.trim() || DEFAULT_MODELS[provider];

  // For OmniRoute, apiKey is optional if running local instance without auth
  if (!apiKey && provider !== 'omniroute') {
    throw new Error(
      `No API key configured for provider "${provider}". Please add your API key in the AI Engine Settings modal (top navbar) or configure environment variables.`
    );
  }

  // 1. Google Gemini
  if (provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          responseMimeType: responseJson ? 'application/json' : undefined,
          temperature,
        },
      });

      const text = response.text?.trim() || '';
      if (!text) {
        throw new Error('Gemini API returned an empty response.');
      }

      const usage = (response as any)?.usageMetadata;
      const promptTokens = usage?.promptTokenCount || Math.ceil((prompt.length + (systemInstruction?.length || 0)) / 4);
      const completionTokens = usage?.candidatesTokenCount || Math.ceil(text.length / 4);

      let parsed: any;
      if (responseJson) {
        parsed = parseFlexibleJson(text);
      }

      return {
        text,
        parsed,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        model,
        provider,
      };
    } catch (err: any) {
      throw new Error(`[Gemini Error (${model})]: ${err?.message || err}`);
    }
  }

  // 2. OmniRoute AI Gateway (Self-hosted 1B+ Free Tokens Pool)
  if (provider === 'omniroute') {
    const rawBaseUrl = config?.baseUrl || process.env.OMNIROUTE_BASE_URL || DEFAULT_OMNIROUTE_BASE_URL;
    const cleanBase = rawBaseUrl.trim().replace(/\/+$/, '');
    const endpoint = cleanBase.endsWith('/chat/completions')
      ? cleanBase
      : `${cleanBase}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey && apiKey.trim().length > 0) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const payload: any = {
      model: model || 'auto',
      messages,
      temperature,
    };

    if (responseJson) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text();
        let parsedErr = errBody;
        try {
          const j = JSON.parse(errBody);
          parsedErr = j.error?.message || errBody;
        } catch (e) {}
        throw new Error(`[OmniRoute Error HTTP ${res.status} (${model})]: ${parsedErr}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      if (!text) {
        throw new Error('OmniRoute returned an empty message candidate.');
      }

      let parsed: any;
      if (responseJson) {
        parsed = parseFlexibleJson(text);
      }

      const promptTokens = data.usage?.prompt_tokens || Math.ceil((prompt.length + (systemInstruction?.length || 0)) / 4);
      const completionTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

      return {
        text,
        parsed,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        model,
        provider,
      };
    } catch (err: any) {
      if (
        err.message?.includes('fetch failed') ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('ENOTFOUND')
      ) {
        throw new Error(
          `[OmniRoute Not Reachable]: Could not connect to OmniRoute gateway at "${cleanBase}". Make sure OmniRoute is running locally (Run: "npx omniroute" or "docker run -p 20128:20128 diegosouzapw/omniroute").`
        );
      }
      throw err;
    }
  }

  // 3. OpenAI / Groq / OpenRouter (Standard OpenAI-compatible Chat Completions API)
  if (provider === 'openai' || provider === 'groq' || provider === 'openrouter') {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      headers['HTTP-Referer'] = 'https://flowcreator.ai';
      headers['X-Title'] = 'FlowCreator OS';
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const payload: any = {
      model,
      messages,
      temperature,
    };

    if (responseJson) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let parsedErr = errBody;
      try {
        const j = JSON.parse(errBody);
        parsedErr = j.error?.message || errBody;
      } catch (e) {}
      throw new Error(`[${provider.toUpperCase()} Error HTTP ${res.status} (${model})]: ${parsedErr}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (!text) {
      throw new Error(`${provider.toUpperCase()} returned an empty message candidate.`);
    }

    let parsed: any;
    if (responseJson) {
      parsed = parseFlexibleJson(text);
    }

    const promptTokens = data.usage?.prompt_tokens || Math.ceil((prompt.length + (systemInstruction?.length || 0)) / 4);
    const completionTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

    return {
      text,
      parsed,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      model,
      provider,
    };
  }

  // 4. Anthropic Claude
  if (provider === 'anthropic') {
    const endpoint = 'https://api.anthropic.com/v1/messages';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01',
    };

    const payload: any = {
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    };

    if (systemInstruction) {
      payload.system = systemInstruction;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let parsedErr = errBody;
      try {
        const j = JSON.parse(errBody);
        parsedErr = j.error?.message || errBody;
      } catch (e) {}
      throw new Error(`[Anthropic Error HTTP ${res.status} (${model})]: ${parsedErr}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || '';
    if (!text) {
      throw new Error('Anthropic returned an empty text content.');
    }

    let parsed: any;
    if (responseJson) {
      parsed = parseFlexibleJson(text);
    }

    const promptTokens = data.usage?.input_tokens || Math.ceil((prompt.length + (systemInstruction?.length || 0)) / 4);
    const completionTokens = data.usage?.output_tokens || Math.ceil(text.length / 4);

    return {
      text,
      parsed,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      model,
      provider,
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
