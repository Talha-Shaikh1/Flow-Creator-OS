import { DramaSeriesState } from '@/types/drama-series';

export interface DramaFilmHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  genre: string;
  targetRuntime: '60s' | '90s' | '120s';
  clipsCount: number;
  cast: string[];
  world: string;
  highestGate: number;
  isProductionReady: boolean;
  state: DramaSeriesState;
}

export const DRAMA_FILMS_HISTORY_STORAGE_KEY = 'flowcreator_drama_films_history_v1';

export function getDramaFilmHistory(): DramaFilmHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAMA_FILMS_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read drama film history:', e);
    return [];
  }
}

export function saveDramaFilmToHistory(state: DramaSeriesState): DramaFilmHistoryItem | null {
  if (typeof window === 'undefined') return null;
  if (!state.seasonStory && !state.seedTopic) return null;

  try {
    const history = getDramaFilmHistory();
    const title =
      state.seasonStory?.seasonTitle ||
      state.seedTopic.slice(0, 45) ||
      'Untitled Mini-Film';

    const runtime = state.targetRuntime || '60s';
    const clipsCount =
      state.clipsBreakdown?.length ||
      (runtime === '120s' ? 12 : runtime === '90s' ? 9 : 6);

    const cast =
      state.characterBible?.characters?.map((c) => c.name) ||
      state.seasonStory?.charactersInvolved ||
      [];

    const world = state.seasonStory?.worldEnvironment || 'Prestige Real-World Setting';
    const highestGate = state.completedGates?.length
      ? Math.max(...state.completedGates, state.currentGate || 1)
      : state.currentGate || 1;

    const isProductionReady = state.directorQA?.overallStatus === 'PRODUCTION READY';

    // Find if a record with the same title or same seed exists to update it, or create new
    const existingIndex = history.findIndex(
      (item) =>
        item.title.trim().toLowerCase() === title.trim().toLowerCase() ||
        (item.state.seedTopic &&
          state.seedTopic &&
          item.state.seedTopic.trim().toLowerCase() === state.seedTopic.trim().toLowerCase())
    );

    const nowIso = new Date().toISOString();

    const newItem: DramaFilmHistoryItem = {
      id: existingIndex >= 0 ? history[existingIndex].id : `film_${Date.now()}`,
      createdAt: existingIndex >= 0 ? history[existingIndex].createdAt : nowIso,
      updatedAt: nowIso,
      title,
      genre: state.genre || 'Cinematic Emotional Drama & Revenge Romance',
      targetRuntime: runtime,
      clipsCount,
      cast,
      world,
      highestGate,
      isProductionReady,
      state,
    };

    let updatedHistory: DramaFilmHistoryItem[];
    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = newItem;
    } else {
      updatedHistory = [newItem, ...history];
    }

    // Keep up to 50 films in history
    if (updatedHistory.length > 50) {
      updatedHistory = updatedHistory.slice(0, 50);
    }

    localStorage.setItem(DRAMA_FILMS_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    return newItem;
  } catch (e) {
    console.warn('Failed to save drama film to history:', e);
    return null;
  }
}

export function deleteDramaFilmFromHistory(id: string): DramaFilmHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getDramaFilmHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(DRAMA_FILMS_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.warn('Failed to delete drama film from history:', e);
    return [];
  }
}

export function clearDramaFilmHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAMA_FILMS_HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear drama film history:', e);
  }
}
