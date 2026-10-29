import { LIGHTWEIGHT_EDITING_MISSION_ID } from '../../data_files/lightweight-editing-practice.ts';
import {
  createLightweightEditingStore,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
} from './lightweight-editing-progress.ts';
import {
  createPracticeStore,
  PRACTICE_STORAGE_KEY,
  type MissionStatus,
  type StorageNotice,
} from './progress.ts';

export const PRACTICE_PROGRESS_KEYS = [
  PRACTICE_STORAGE_KEY,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
] as const;

export interface PracticeIndexStore {
  getStatus(id: string): MissionStatus;
  getNotice(): StorageNotice;
  clearAll(): void;
}

/** Read both existing namespaces without migrating or copying saved progress. */
export function createPracticeIndexStore(
  storage?: Storage | null
): PracticeIndexStore {
  const shared = createPracticeStore(storage);
  const editing = createLightweightEditingStore(storage);

  return {
    getStatus(id) {
      if (id === LIGHTWEIGHT_EDITING_MISSION_ID)
        return editing.getState().status;
      return shared.getState().missions[id]?.status ?? 'not-started';
    },
    getNotice() {
      // Refresh both so a change in either tab or namespace is reflected here.
      shared.getState();
      editing.getState();
      const notices = [shared.getNotice(), editing.getNotice()];
      if (notices.includes('memory')) return 'memory';
      if (notices.includes('recovered')) return 'recovered';
      return 'persistent';
    },
    clearAll() {
      // Each store handles failure independently. Always attempt both exact keys.
      shared.clearAll();
      editing.reset();
    },
  };
}
