import {
  LIGHTWEIGHT_EDITING_MISSION_ID,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
  LIGHTWEIGHT_EDITING_STEP_IDS,
  LIGHTWEIGHT_EDITING_VERSION,
  lightweightEditingMission,
} from '../../data_files/lightweight-editing-practice.ts';

/** Dedicated C6 storage; the catalog coordinates clearing without changing this key. */
export const LIGHTWEIGHT_EDITING_STORAGE_KEY =
  'photography-field-guide:practice:lightweight-editing:v1';

export type EditingMissionStatus = 'not-started' | 'in-progress' | 'completed';
export type EditingStorageNotice = 'persistent' | 'memory' | 'recovered';

export interface LightweightEditingProgress {
  version: typeof LIGHTWEIGHT_EDITING_VERSION;
  missionId: typeof LIGHTWEIGHT_EDITING_MISSION_ID;
  status: EditingMissionStatus;
  prediction: {
    choiceId?: string;
    solved: boolean;
    revealed: boolean;
  };
  observationStepIds: string[];
  reflectionCheckIds: string[];
}

export function isLightweightEditingReady(
  progress: LightweightEditingProgress
): boolean {
  const content = lightweightEditingMission.copy.en;
  return (
    progress.prediction.choiceId === content.prediction.correctChoiceId &&
    content.steps.every(step =>
      progress.observationStepIds.includes(step.id)
    ) &&
    content.reflection.checks.every(check =>
      progress.reflectionCheckIds.includes(check.id)
    )
  );
}

export function emptyLightweightEditingProgress(): LightweightEditingProgress {
  return {
    version: LIGHTWEIGHT_EDITING_VERSION,
    missionId: LIGHTWEIGHT_EDITING_MISSION_ID,
    status: 'not-started',
    prediction: { solved: false, revealed: false },
    observationStepIds: [],
    reflectionCheckIds: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(
  value: unknown,
  allowed: readonly string[]
): { values: string[]; dropped: boolean } {
  if (value === undefined) return { values: [], dropped: false };
  if (!Array.isArray(value)) return { values: [], dropped: true };
  const accepted = new Set(allowed);
  const values = [
    ...new Set(
      value.filter(
        (item): item is string => typeof item === 'string' && accepted.has(item)
      )
    ),
  ];
  return { values, dropped: values.length !== new Set(value).size };
}

export function sanitizeLightweightEditingProgress(value: unknown): {
  progress: LightweightEditingProgress;
  recovered: boolean;
} {
  const empty = emptyLightweightEditingProgress();
  if (
    !isRecord(value) ||
    value.version !== LIGHTWEIGHT_EDITING_VERSION ||
    value.missionId !== LIGHTWEIGHT_EDITING_MISSION_ID
  )
    return { progress: empty, recovered: true };

  let recovered = false;
  const choiceIds = new Set<string>(
    lightweightEditingMission.copy.en.prediction.choices.map(
      choice => choice.id
    )
  );
  const rawPrediction = isRecord(value.prediction) ? value.prediction : {};
  if (!isRecord(value.prediction) && value.prediction !== undefined)
    recovered = true;

  let choiceId: string | undefined;
  if (rawPrediction.choiceId !== undefined) {
    if (
      typeof rawPrediction.choiceId === 'string' &&
      choiceIds.has(rawPrediction.choiceId)
    )
      choiceId = rawPrediction.choiceId;
    else recovered = true;
  }
  const revealed = rawPrediction.revealed === true;
  if (
    rawPrediction.revealed !== undefined &&
    typeof rawPrediction.revealed !== 'boolean'
  )
    recovered = true;

  const observed = stringArray(
    value.observationStepIds,
    LIGHTWEIGHT_EDITING_STEP_IDS
  );
  const reflected = stringArray(
    value.reflectionCheckIds,
    LIGHTWEIGHT_EDITING_REFLECTION_IDS
  );
  recovered ||= observed.dropped || reflected.dropped;
  if (
    value.status !== undefined &&
    !['not-started', 'in-progress', 'completed'].includes(String(value.status))
  )
    recovered = true;

  const hasActivity = Boolean(
    choiceId ||
    revealed ||
    observed.values.length ||
    reflected.values.length ||
    value.status === 'in-progress' ||
    value.status === 'completed'
  );
  const progress: LightweightEditingProgress = {
    ...empty,
    // Completion is only the reader's explicit process-review marker.
    status:
      value.status === 'completed'
        ? 'completed'
        : hasActivity
          ? 'in-progress'
          : 'not-started',
    prediction: {
      choiceId,
      // Correctness comes from current content, never a stored truth claim.
      solved:
        choiceId ===
        lightweightEditingMission.copy.en.prediction.correctChoiceId,
      revealed,
    },
    observationStepIds: observed.values,
    reflectionCheckIds: reflected.values,
  };
  if (progress.status === 'completed' && !isLightweightEditingReady(progress)) {
    progress.status = 'in-progress';
    recovered = true;
  }
  return { recovered, progress };
}

export function parseLightweightEditingProgress(raw: string | null): {
  progress: LightweightEditingProgress;
  recovered: boolean;
} {
  if (raw === null)
    return {
      progress: emptyLightweightEditingProgress(),
      recovered: false,
    };
  try {
    return sanitizeLightweightEditingProgress(JSON.parse(raw));
  } catch {
    return {
      progress: emptyLightweightEditingProgress(),
      recovered: true,
    };
  }
}

export interface LightweightEditingStore {
  getState(): LightweightEditingProgress;
  getNotice(): EditingStorageNotice;
  update(
    change: (progress: LightweightEditingProgress) => void
  ): LightweightEditingProgress;
  reset(): LightweightEditingProgress;
}

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function createLightweightEditingStore(
  suppliedStorage?: Storage | null
): LightweightEditingStore {
  const storage =
    suppliedStorage === undefined ? browserStorage() : suppliedStorage;
  let persistent = Boolean(storage);
  let recovered = false;
  let state = emptyLightweightEditingProgress();

  const refresh = () => {
    if (!storage || !persistent) return;
    try {
      const parsed = parseLightweightEditingProgress(
        storage.getItem(LIGHTWEIGHT_EDITING_STORAGE_KEY)
      );
      state = parsed.progress;
      recovered = parsed.recovered;
    } catch {
      // Never overwrite saved data that this page could not read.
      persistent = false;
    }
  };
  refresh();

  const save = () => {
    if (!storage || !persistent) {
      persistent = false;
      return;
    }
    try {
      storage.setItem(LIGHTWEIGHT_EDITING_STORAGE_KEY, JSON.stringify(state));
      persistent = true;
      recovered = false;
    } catch {
      // Keep later in-memory changes instead of reloading stale saved data.
      persistent = false;
    }
  };

  return {
    getState: () => {
      refresh();
      return state;
    },
    getNotice: () =>
      !persistent ? 'memory' : recovered ? 'recovered' : 'persistent',
    update(change) {
      refresh();
      const draft: LightweightEditingProgress = {
        ...state,
        prediction: { ...state.prediction },
        observationStepIds: [...state.observationStepIds],
        reflectionCheckIds: [...state.reflectionCheckIds],
      };
      change(draft);
      state = sanitizeLightweightEditingProgress(draft).progress;
      save();
      return state;
    },
    reset() {
      state = emptyLightweightEditingProgress();
      recovered = false;
      if (!storage) {
        persistent = false;
        return state;
      }
      try {
        // Remove only C6; shared mission progress and preferences stay intact.
        storage.removeItem(LIGHTWEIGHT_EDITING_STORAGE_KEY);
        persistent = true;
      } catch {
        persistent = false;
      }
      return state;
    },
  };
}
