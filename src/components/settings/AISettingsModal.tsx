'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Key,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Server,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import {
  AIProvider,
  AIProviderConfig,
  PROVIDER_OPTIONS,
  DEFAULT_MODELS,
  DEFAULT_OMNIROUTE_BASE_URL,
} from '@/lib/engine/llm-provider';
import {
  getStoredAIConfig,
  saveStoredAIConfig,
  clearStoredAIConfig,
} from '@/lib/ai/ai-settings';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('omniroute');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OMNIROUTE_BASE_URL);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.omniroute);
  const [customModel, setCustomModel] = useState('');
  const [isCustomModelActive, setIsCustomModelActive] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Test Connection State
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load stored settings on mount or open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAIConfig();
      setSelectedProvider(stored.provider || 'omniroute');
      setApiKey(stored.apiKey || '');
      setBaseUrl(stored.baseUrl || DEFAULT_OMNIROUTE_BASE_URL);
      const defaultMod = DEFAULT_MODELS[stored.provider || 'omniroute'];
      const currentModel = stored.model || defaultMod;

      const providerOpt = PROVIDER_OPTIONS.find((p) => p.id === (stored.provider || 'omniroute'));
      const isPreset = providerOpt?.popularModels.includes(currentModel);

      if (isPreset) {
        setSelectedModel(currentModel);
        setIsCustomModelActive(false);
        setCustomModel('');
      } else {
        setSelectedModel('custom');
        setIsCustomModelActive(true);
        setCustomModel(currentModel);
      }
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProviderConfig =
    PROVIDER_OPTIONS.find((p) => p.id === selectedProvider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (prov: AIProvider) => {
    setSelectedProvider(prov);
    const defModel = DEFAULT_MODELS[prov];
    setSelectedModel(defModel);
    setIsCustomModelActive(false);
    setCustomModel('');
    setTestResult(null);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const modelToUse = isCustomModelActive && customModel.trim() ? customModel.trim() : selectedModel;
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey.trim() || undefined,
          model: modelToUse,
          baseUrl: selectedProvider === 'omniroute' ? baseUrl.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Successfully connected in ${data.latencyMs}ms!`,
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Connection test failed',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network error while testing connection',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const modelToUse = isCustomModelActive && customModel.trim() ? customModel.trim() : selectedModel;
    const configToSave: AIProviderConfig = {
      provider: selectedProvider,
      apiKey: apiKey.trim() || undefined,
      model: modelToUse,
      baseUrl: selectedProvider === 'omniroute' ? baseUrl.trim() || DEFAULT_OMNIROUTE_BASE_URL : undefined,
    };
    saveStoredAIConfig(configToSave);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetToDefault = () => {
    clearStoredAIConfig();
    setSelectedProvider('gemini');
    setApiKey('');
    setBaseUrl(DEFAULT_OMNIROUTE_BASE_URL);
    setSelectedModel(DEFAULT_MODELS.gemini);
    setIsCustomModelActive(false);
    setCustomModel('');
    setTestResult({
      success: true,
      message: 'Reset to default server configuration (Gemini 3.6 Flash).',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Engine & Multi-Provider Settings
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  BYOK Active
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Choose OmniRoute (1B+ Free Tokens), Groq, Gemini, OpenAI, Claude, or OpenRouter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Provider Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Select AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PROVIDER_OPTIONS.map((prov) => {
                const isSelected = selectedProvider === prov.id;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleProviderChange(prov.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    {prov.badge && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 self-start mb-0.5">
                        {prov.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-neutral-200">{prov.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-neutral-400 line-clamp-2">
                      {prov.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* OmniRoute Quick Setup Helper (If OmniRoute Selected) */}
          {selectedProvider === 'omniroute' && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-200">
                    OmniRoute Gateway — 1 Billion Free Monthly Tokens
                  </span>
                </div>
                <a
                  href="http://localhost:20128"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                >
                  Open Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed">
                OmniRoute runs locally on your PC and pools 90+ free AI tiers (Mistral 1B, Cerebras, Groq, Cohere) with automatic rate-limit failover and RTK token compression.
              </p>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" /> Run in your terminal to start OmniRoute:
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-xs text-emerald-300">
                  <code>npx omniroute</code>
                  <button
                    type="button"
                    onClick={() => handleCopyCmd('npx omniroute')}
                    className="p-1 rounded text-neutral-400 hover:text-white transition"
                    title="Copy command"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mistral AI Direct 1B Tokens Helper */}
          {selectedProvider === 'mistral' && (
            <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-200">
                    Mistral AI Official — 1 Billion Free Monthly Tokens
                  </span>
                </div>
                <a
                  href="https://console.mistral.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 hover:underline font-semibold"
                >
                  Get Free API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Mistral AI provides up to <strong className="text-orange-300">1,000,000,000 free tokens/month</strong> on their &quot;Free Experiment Tier&quot; with zero credit card required! Ideal for short-form video scripts and deep prompt packages.
              </p>

              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                <span>📍 Sign up at <strong className="text-neutral-300">console.mistral.ai</strong>, create a key under &quot;API Keys&quot;, and paste it below.</span>
              </div>
            </div>
          )}

          {/* Base URL (For OmniRoute or Custom Proxies) */}
          {selectedProvider === 'omniroute' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-neutral-400" />
                OmniRoute Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:20128/v1"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-neutral-400">
                Default local endpoint is <code className="text-indigo-300">http://localhost:20128/v1</code>.
              </span>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                2. AI Model
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomModelActive(!isCustomModelActive);
                  if (!isCustomModelActive && !customModel) {
                    setCustomModel(selectedModel);
                  }
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                {isCustomModelActive ? 'Switch to Preset Models' : 'Enter Custom Model ID'}
              </button>
            </div>

            {isCustomModelActive ? (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={`e.g., ${currentProviderConfig.defaultModel}`}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currentProviderConfig.popularModels.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === currentProviderConfig.defaultModel ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-400" />
                3. Custom API Key (BYOK)
              </label>
              {selectedProvider === 'omniroute' && (
                <span className="text-[10px] text-neutral-400">
                  Optional (Leave blank if local OmniRoute has no password)
                </span>
              )}
              {selectedProvider === 'gemini' && (
                <span className="text-[10px] text-neutral-400">
                  Optional (Leave blank to use server environment key)
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  selectedProvider === 'omniroute'
                    ? 'Optional auth token (Leave blank if none)...'
                    : selectedProvider === 'gemini'
                    ? 'AIzaSy... (Leave empty to use server default key)'
                    : `Enter your ${currentProviderConfig.name} API Key...`
                }
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 pt-0.5">
              <span className="text-emerald-400 shrink-0">🔒</span>
              <span>
                Your key is stored securely in your browser&apos;s local storage and sent only for your generation requests. Never stored in our database.
              </span>
            </div>
          </div>

          {/* Real-time Test Connection Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 flex-1">
                <div className="font-semibold">
                  {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                </div>
                <div className="text-[11px] opacity-90 break-words">
                  {testResult.message || testResult.error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-neutral-800"
            title="Clear custom keys and return to server default"
          >
            <RefreshCw className="w-3 h-3" />
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Testing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Test Connection
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
