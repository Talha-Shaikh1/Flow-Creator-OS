import { WeeklyBatchDelivery, StorySpec } from '@/types';

export interface BatchHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  format: string;
  genres: string[];
  tone: string;
  premise: string;
  cast: Array<{ name: string; role: string }>;
  totalClips: number;
  totalPrompts: number;
  generatedVideosCount: number;
  completionRate: number;
  spec: StorySpec;
  batch: WeeklyBatchDelivery;
}

export interface HistoryStatsSummary {
  totalBatches: number;
  totalClips: number;
  totalPrompts: number;
  totalVideosGenerated: number;
  completionRate: number;
}

export const LOCAL_HISTORY_STORAGE_KEY = 'flowcreator_batches_history_v2';

export function formatBatchToHistoryItem(
  batch: WeeklyBatchDelivery,
  customSpec?: StorySpec
): BatchHistoryItem {
  const spec = customSpec || batch.spec || ({} as StorySpec);
  const days = Array.isArray(batch.days) ? batch.days : [];
  const generatedClips = (batch as any).generatedClips || {};

  let batchClips = 0;
  let batchPhotos = 0;
  let batchProduced = 0;

  days.forEach((day: any) => {
    const variations = day.variations || [];
    variations.forEach((v: any) => {
      if (Array.isArray(v.clips) && v.clips.length > 0) {
        batchClips += v.clips.length;
      }
    });
    if (day.dailyPhotoPosts && Array.isArray(day.dailyPhotoPosts)) {
      batchPhotos += day.dailyPhotoPosts.length;
    }
  });

  Object.keys(generatedClips).forEach((k) => {
    if (generatedClips[k]) batchProduced++;
  });

  const batchPrompts = batchClips * 2 + batchPhotos;
  const title =
    days[0]?.variations?.[0]?.title ||
    spec.seriesTitle ||
    spec.customStoryIdea?.slice(0, 45) ||
    (spec.format ? `${spec.format.replace('_', ' ').toUpperCase()} Series` : 'Production Batch');

  const nowIso = new Date().toISOString();

  return {
    id: batch.id || `batch-${Date.now()}`,
    createdAt: batch.createdAt || nowIso,
    updatedAt: nowIso,
    title,
    format: spec.format || 'character_drama',
    genres: spec.genres || [],
    tone: spec.tone || 'Cinematic',
    premise: spec.customStoryIdea || '',
    cast: (spec.cast || []).map((c: any) => ({ name: c.name, role: c.role || 'Cast' })),
    totalClips: batchClips,
    totalPrompts: batchPrompts,
    generatedVideosCount: batchProduced,
    completionRate: batchClips > 0 ? Math.round((batchProduced / batchClips) * 100) : 0,
    spec,
    batch,
  };
}

export function computeHistoryStats(items: BatchHistoryItem[]): HistoryStatsSummary {
  let totalBatches = items.length;
  let totalClips = 0;
  let totalPrompts = 0;
  let totalVideosGenerated = 0;

  items.forEach((item) => {
    totalClips += item.totalClips || 0;
    totalPrompts += item.totalPrompts || 0;
    totalVideosGenerated += item.generatedVideosCount || 0;
  });

  const completionRate =
    totalClips > 0 ? Math.round((totalVideosGenerated / totalClips) * 100) : 0;

  return {
    totalBatches,
    totalClips,
    totalPrompts,
    totalVideosGenerated,
    completionRate,
  };
}

export function getLocalBatchHistory(): BatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Auto-migrate single batches if history array is empty
    const migrated: BatchHistoryItem[] = [];
    const legacyKeys = [
      'flowcreator_latest_batch',
      'flowcreator_elena_latest_batch',
      'flowcreator_pet_comedy_latest_batch',
    ];

    legacyKeys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          const legacyBatch = JSON.parse(itemStr);
          if (legacyBatch && legacyBatch.id) {
            migrated.push(formatBatchToHistoryItem(legacyBatch));
          }
        }
      } catch {}
    });

    if (migrated.length > 0) {
      localStorage.setItem(LOCAL_HISTORY_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return [];
  } catch (err) {
    console.warn('Failed to load local batch history:', err);
    return [];
  }
}

export function saveBatchToLocalHistory(
  batch: WeeklyBatchDelivery,
  customSpec?: StorySpec
): BatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const historyItem = formatBatchToHistoryItem(batch, customSpec);
    const existing = getLocalBatchHistory();

    const existingIndex = existing.findIndex((item) => item.id === batch.id);
    let updated: BatchHistoryItem[];

    if (existingIndex >= 0) {
      // Update in place and preserve original creation time
      historyItem.createdAt = existing[existingIndex].createdAt || historyItem.createdAt;
      updated = [...existing];
      updated[existingIndex] = historyItem;
    } else {
      // Prepend to front
      updated = [historyItem, ...existing];
    }

    // Keep max 50 items to manage quota
    const capped = updated.slice(0, 50);
    localStorage.setItem(LOCAL_HISTORY_STORAGE_KEY, JSON.stringify(capped));
    return capped;
  } catch (err) {
    console.warn('Failed to save batch to local history:', err);
    return [];
  }
}

export function deleteBatchFromLocalHistory(id: string): BatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalBatchHistory();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to delete batch from local history:', err);
    return [];
  }
}
