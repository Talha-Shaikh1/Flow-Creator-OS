'use client';

import { useState, useEffect } from 'react';
import { AIProvider, AIProviderConfig, DEFAULT_MODELS, PROVIDER_OPTIONS } from '@/lib/engine/llm-provider';

export const AI_SETTINGS_STORAGE_KEY = 'flowcreator_ai_settings';
export const AI_SETTINGS_EVENT = 'flowcreator-ai-settings-changed';

export function getStoredAIConfig(): AIProviderConfig {
  if (typeof window === 'undefined') {
    return { provider: 'gemini', model: DEFAULT_MODELS.gemini };
  }

  try {
    const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { provider: 'gemini', model: DEFAULT_MODELS.gemini };
    }
    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || 'gemini',
      apiKey: parsed.apiKey || undefined,
      model: parsed.model || DEFAULT_MODELS[parsed.provider as AIProvider] || DEFAULT_MODELS.gemini,
      baseUrl: parsed.baseUrl || undefined,
    };
  } catch (e) {
    return { provider: 'gemini', model: DEFAULT_MODELS.gemini };
  }
}

export function saveStoredAIConfig(config: AIProviderConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_EVENT, { detail: config }));
  } catch (e) {
    console.error('Failed to save AI config to localStorage:', e);
  }
}

export function clearStoredAIConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(AI_SETTINGS_EVENT, {
        detail: { provider: 'gemini', model: DEFAULT_MODELS.gemini },
      })
    );
  } catch (e) {
    console.error('Failed to clear AI config:', e);
  }
}

export function useAISettings() {
  const [config, setConfig] = useState<AIProviderConfig>({
    provider: 'gemini',
    model: DEFAULT_MODELS.gemini,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setConfig(getStoredAIConfig());
    setIsLoaded(true);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<AIProviderConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getStoredAIConfig());
      }
    };

    window.addEventListener(AI_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(AI_SETTINGS_EVENT, handler);
  }, []);

  return { config, isLoaded, saveConfig: saveStoredAIConfig, clearConfig: clearStoredAIConfig };
}
