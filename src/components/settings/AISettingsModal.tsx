'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Zap,
  Flame,
  ArrowRight,
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
  const [mounted, setMounted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('mistral');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OMNIROUTE_BASE_URL);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.mistral);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load stored settings on mount or open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAIConfig();
      setSelectedProvider(stored.provider || 'mistral');
      setApiKey(stored.apiKey || '');
      setBaseUrl(stored.baseUrl || DEFAULT_OMNIROUTE_BASE_URL);
      const defaultMod = DEFAULT_MODELS[stored.provider || 'mistral'];
      const currentModel = stored.model || defaultMod;

      const providerOpt = PROVIDER_OPTIONS.find((p) => p.id === (stored.provider || 'mistral'));
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

  if (!isOpen || !mounted) return null;

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
          message: data.message || `Connected successfully in ${data.latencyMs}ms!`,
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
    }, 700);
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

  const freeProviders: AIProvider[] = ['mistral', 'groq', 'omniroute'];
  const standardProviders: AIProvider[] = ['gemini', 'openai', 'anthropic', 'openrouter'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#0c0d12] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                AI Engine & Provider Setup
              </h2>
              <p className="text-[11px] text-neutral-400">
                Choose your AI engine or switch to Mistral for 1 Billion free tokens.
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

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              1. Choose AI Provider
            </label>

            {/* Free Tiers Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Free High-Quota Providers (Recommended)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDER_OPTIONS.filter((p) => freeProviders.includes(p.id)).map((prov) => {
                  const isSelected = selectedProvider === prov.id;
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => handleProviderChange(prov.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 relative ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 text-white ring-1 ring-orange-500/50 shadow-md shadow-orange-500/10'
                          : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold truncate">{prov.name.split(' ')[0]}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />}
                      </div>
                      <span className="text-[9px] font-semibold text-orange-400 truncate">
                        {prov.id === 'mistral' ? '1B Free / mo' : prov.id === 'groq' ? 'Free Ultra-Fast' : 'Local Gateway'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Providers Group */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Standard Cloud Models
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {PROVIDER_OPTIONS.filter((p) => standardProviders.includes(p.id)).map((prov) => {
                  const isSelected = selectedProvider === prov.id;
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => handleProviderChange(prov.id)}
                      className={`py-2 px-2 rounded-xl border text-center transition text-xs font-medium ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                      }`}
                    >
                      <span className="truncate block">{prov.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MISTRAL AI STEP-BY-STEP GUIDE (If Mistral Selected) */}
          {selectedProvider === 'mistral' && (
            <div className="p-4 rounded-xl bg-orange-950/25 border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-200">
                    How to get your free 1 Billion tokens key:
                  </span>
                </div>
                <a
                  href="https://console.mistral.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-orange-500 text-black hover:bg-orange-400 transition flex items-center gap-1 shadow-sm"
                >
                  Open Mistral Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline font-semibold">console.mistral.ai</a> par free sign up karein (Credit card required nahi hai).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Left menu se <strong>&quot;API Keys&quot;</strong> par jayein aur <strong>&quot;Create new key&quot;</strong> dabayein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Key copy kar ke neeche paste karein aur <strong>&quot;Save Settings&quot;</strong> kar dein.</span>
                </div>
              </div>
            </div>
          )}

          {/* OMNIROUTE STEP-BY-STEP (If OmniRoute Selected) */}
          {selectedProvider === 'omniroute' && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Local OmniRoute Gateway
                </div>
                <a
                  href="http://localhost:20128"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-xs text-emerald-300">
                <code>npx omniroute</code>
                <button
                  type="button"
                  onClick={() => handleCopyCmd('npx omniroute')}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                  title="Copy command"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* GROQ QUICK NOTE (If Groq Selected) */}
          {selectedProvider === 'groq' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Groq Cloud Free Tier
                </div>
                <div className="text-[11px] text-neutral-300">
                  Lightning-fast sub-second Llama 3.3 70B inference. Free account at console.groq.com.
                </div>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-500 text-black shrink-0 hover:bg-emerald-400 transition"
              >
                Get Groq Key
              </a>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-neutral-400" />
                2. {currentProviderConfig.name} API Key
              </label>
              {selectedProvider === 'gemini' && (
                <span className="text-[10px] text-neutral-500">Optional (Uses server key if empty)</span>
              )}
              {selectedProvider === 'omniroute' && (
                <span className="text-[10px] text-neutral-500">Optional for local gateway</span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  selectedProvider === 'mistral'
                    ? 'Paste your Mistral key (e.g. sK...)'
                    : selectedProvider === 'groq'
                    ? 'gsk_...'
                    : selectedProvider === 'gemini'
                    ? 'Leave blank to use default server key'
                    : 'Paste API Key...'
                }
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
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
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                3. Model
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomModelActive(!isCustomModelActive);
                  if (!isCustomModelActive && !customModel) {
                    setCustomModel(selectedModel);
                  }
                }}
                className="text-[11px] text-orange-400 hover:underline"
              >
                {isCustomModelActive ? 'Use Presets' : 'Custom Model ID'}
              </button>
            </div>

            {isCustomModelActive ? (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={`e.g., ${currentProviderConfig.defaultModel}`}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {currentProviderConfig.popularModels.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === currentProviderConfig.defaultModel ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Base URL (Only for OmniRoute) */}
          {selectedProvider === 'omniroute' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3 h-3 text-neutral-400" /> OmniRoute Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:20128/v1"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs font-mono focus:outline-none"
              />
            </div>
          )}

          {/* Real-time Test Result Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
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
                  {testResult.success ? 'Connection Working!' : 'Connection Failed'}
                </div>
                <div className="text-[11px] opacity-90 break-words">
                  {testResult.message || testResult.error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800/80 bg-neutral-900/50 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-neutral-800"
            title="Reset to Gemini server key"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  Testing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Test Connection
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-400 text-black font-extrabold'
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
    </div>,
    document.body
  );
}
