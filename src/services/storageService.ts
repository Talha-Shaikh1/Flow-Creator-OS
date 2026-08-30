import { CreatorProfile, WeeklyPlan, VaultItem, PerformanceLog, RecurringCharacter } from '../types';

const KEYS = {
  GEMINI_API_KEY: 'flowcreator_gemini_key',
  PROFILES: 'flowcreator_profiles',
  ACTIVE_PROFILE_ID: 'flowcreator_active_profile_id',
  CURRENT_PLAN: 'flowcreator_current_plan',
  SAVED_PLANS: 'flowcreator_saved_plans',
  VAULT_ITEMS: 'flowcreator_vault_items',
  PERFORMANCE_LOGS: 'flowcreator_performance_logs',
  CHARACTERS: 'flowcreator_characters_vault',
  DAILY_GENERATIONS: 'flowcreator_daily_gens',
};

export const storageService = {
  getApiKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(KEYS.GEMINI_API_KEY) || '';
  },

  setApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.GEMINI_API_KEY, key.trim());
  },

  // 2-Tier Generation Limit Logic
  getDailyGenerationsCount(): { count: number; date: string } {
    if (typeof window === 'undefined') return { count: 0, date: '' };
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(KEYS.DAILY_GENERATIONS);
    if (!raw) return { count: 0, date: today };
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date !== today) return { count: 0, date: today };
      return parsed;
    } catch {
      return { count: 0, date: today };
    }
  },

  incrementDailyGenerationsCount(): number {
    if (typeof window === 'undefined') return 0;
    const current = this.getDailyGenerationsCount();
    const newCount = current.count + 1;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(KEYS.DAILY_GENERATIONS, JSON.stringify({ count: newCount, date: today }));
    return newCount;
  },

  checkGenerationQuota(): { allowed: boolean; remaining: number; totalDailyLimit: number; isByok: boolean } {
    const DAILY_LIMIT = 3;
    const apiKey = this.getApiKey();
    const isByok = !!apiKey && apiKey.trim().length > 8;

    if (isByok) {
      return { allowed: true, remaining: 999, totalDailyLimit: DAILY_LIMIT, isByok: true };
    }

    const { count } = this.getDailyGenerationsCount();
    const remaining = Math.max(0, DAILY_LIMIT - count);
    return { allowed: remaining > 0, remaining, totalDailyLimit: DAILY_LIMIT, isByok: false };
  },

  getProfiles(): CreatorProfile[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.PROFILES);
    if (!data) return [];
    try {
      const parsed: CreatorProfile[] = JSON.parse(data);
      return parsed.filter((p) => !p.id.startsWith('preset_'));
    } catch {
      return [];
    }
  },

  saveProfile(profile: CreatorProfile): void {
    if (typeof window === 'undefined') return;
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.unshift(profile);
    }
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
    this.setActiveProfileId(profile.id);

    // Sync to Neon DB in background
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }).catch(() => {});
  },

  getActiveProfile(): CreatorProfile | null {
    const profiles = this.getProfiles();
    const activeId = localStorage.getItem(KEYS.ACTIVE_PROFILE_ID);
    if (!activeId && profiles.length > 0) return profiles[0];
    return profiles.find((p) => p.id === activeId) || null;
  },

  setActiveProfileId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.ACTIVE_PROFILE_ID, id);
  },

  // Recurring Character Cast Vault
  getRecurringCharacters(): RecurringCharacter[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.CHARACTERS);
    return data ? JSON.parse(data) : [];
  },

  saveRecurringCharacter(char: RecurringCharacter): void {
    if (typeof window === 'undefined') return;
    const chars = this.getRecurringCharacters();
    const index = chars.findIndex((c) => c.id === char.id);
    if (index >= 0) {
      chars[index] = char;
    } else {
      chars.push(char);
    }
    localStorage.setItem(KEYS.CHARACTERS, JSON.stringify(chars));
  },

  deleteRecurringCharacter(id: string): void {
    if (typeof window === 'undefined') return;
    const chars = this.getRecurringCharacters().filter((c) => c.id !== id);
    localStorage.setItem(KEYS.CHARACTERS, JSON.stringify(chars));
  },

  getCurrentPlan(): WeeklyPlan | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(KEYS.CURRENT_PLAN);
    if (!data) return null;
    try {
      const plan: WeeklyPlan = JSON.parse(data);
      if (plan.id.startsWith('preset_') || plan.id === 'sample_plan_1') {
        localStorage.removeItem(KEYS.CURRENT_PLAN);
        return null;
      }
      return plan;
    } catch {
      return null;
    }
  },

  clearCurrentPlan(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.CURRENT_PLAN);
  },

  saveCurrentPlan(plan: WeeklyPlan): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CURRENT_PLAN, JSON.stringify(plan));
    
    // Also record into Vault to prevent repetition
    const vaultItems = this.getVaultItems();
    const newItems: VaultItem[] = plan.days.map((d) => ({
      id: `${plan.id}_${d.dayNumber}`,
      topic: d.title,
      angle: d.angleArchetype,
      emotionalTrigger: d.emotionalTrigger?.label || d.angleArchetype,
      archetype: plan.archetype,
      usedInDate: new Date().toISOString().split('T')[0],
    }));

    const merged = [...newItems, ...vaultItems].slice(0, 100);
    localStorage.setItem(KEYS.VAULT_ITEMS, JSON.stringify(merged));

    // Sync to Neon DB in background
    fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    }).catch(() => {});

    fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItems),
    }).catch(() => {});
  },

  getVaultItems(): VaultItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.VAULT_ITEMS);
    return data ? JSON.parse(data) : [];
  },

  clearVault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.VAULT_ITEMS);
  },

  getPerformanceLogs(): PerformanceLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.PERFORMANCE_LOGS);
    return data ? JSON.parse(data) : [];
  },

  addPerformanceLog(log: PerformanceLog): void {
    if (typeof window === 'undefined') return;
    const logs = this.getPerformanceLogs();
    logs.unshift(log);
    localStorage.setItem(KEYS.PERFORMANCE_LOGS, JSON.stringify(logs));

    // Sync to Neon DB in background
    fetch('/api/flywheel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    }).catch(() => {});
  },
};
