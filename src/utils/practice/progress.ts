import {
  missionById,
  missions,
  type PracticeMission,
} from '../../data_files/practice.ts';

export const PRACTICE_STORAGE_KEY = 'photography-field-guide:practice:v1';
export const PRACTICE_PROGRESS_VERSION = 1;

export type MissionStatus = 'not-started' | 'in-progress' | 'completed';

export interface MissionProgress {
  version: number;
  status: MissionStatus;
  prediction: {
    choiceId?: string;
    solved: boolean;
    revealed: boolean;
  };
  observationStepIds: string[];
  reflectionCheckIds: string[];
}

export interface PracticeProgress {
  version: typeof PRACTICE_PROGRESS_VERSION;
  missions: Record<string, MissionProgress>;
}

export type StorageNotice = 'persistent' | 'memory' | 'recovered';

export interface PracticeStore {
  getState(): PracticeProgress;
  getNotice(): StorageNotice;
  update(
    missionId: string,
    change: (progress: MissionProgress) => void
  ): PracticeProgress;
  resetMission(missionId: string): PracticeProgress;
  clearAll(): PracticeProgress;
}

export function emptyMissionProgress(
  mission: PracticeMission
): MissionProgress {
  return {
    version: mission.version,
    status: 'not-started',
    prediction: { solved: false, revealed: false },
    observationStepIds: [],
    reflectionCheckIds: [],
  };
}

export function emptyPracticeProgress(): PracticeProgress {
  return { version: PRACTICE_PROGRESS_VERSION, missions: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(
  value: unknown,
  allowed: Set<string>
): { values: string[]; dropped: boolean } {
  if (value === undefined) return { values: [], dropped: false };
  if (!Array.isArray(value)) return { values: [], dropped: true };
  const values = [
    ...new Set(
      value.filter(
        (item): item is string => typeof item === 'string' && allowed.has(item)
      )
    ),
  ];
  return { values, dropped: values.length !== new Set(value).size };
}

function sanitizeMission(
  value: unknown,
  mission: PracticeMission
): { progress: MissionProgress; recovered: boolean } {
  const empty = emptyMissionProgress(mission);
  if (!isRecord(value)) return { progress: empty, recovered: true };
  let recovered = value.version !== mission.version;
  if (recovered) return { progress: empty, recovered };

  const english = mission.copy.en;
  const choiceIds = new Set(
    english.prediction.choices.map(choice => choice.id)
  );
  const stepIds = new Set(english.observation.steps.map(step => step.id));
  const checkIds = new Set(english.reflection.checks.map(check => check.id));
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

  const observed = stringArray(value.observationStepIds, stepIds);
  const reflected = stringArray(value.reflectionCheckIds, checkIds);
  recovered ||= observed.dropped || reflected.dropped;
  const hasActivity = Boolean(
    choiceId ||
    revealed ||
    observed.values.length ||
    reflected.values.length ||
    value.status === 'completed'
  );
  if (
    value.status !== undefined &&
    !['not-started', 'in-progress', 'completed'].includes(String(value.status))
  )
    recovered = true;

  return {
    recovered,
    progress: {
      version: mission.version,
      // Completion is an explicit reader marker, never a claim of mastery.
      status:
        value.status === 'completed'
          ? 'completed'
          : hasActivity
            ? 'in-progress'
            : 'not-started',
      prediction: {
        choiceId,
        // Derive correctness from the current mission, not stored truth claims.
        solved: choiceId === english.prediction.correctChoiceId,
        revealed,
      },
      observationStepIds: observed.values,
      reflectionCheckIds: reflected.values,
    },
  };
}

export function sanitizePracticeProgress(value: unknown): {
  progress: PracticeProgress;
  recovered: boolean;
} {
  if (
    !isRecord(value) ||
    value.version !== PRACTICE_PROGRESS_VERSION ||
    (value.missions !== undefined && !isRecord(value.missions))
  )
    return { progress: emptyPracticeProgress(), recovered: true };

  const progress = emptyPracticeProgress();
  let recovered = false;
  const storedMissions = isRecord(value.missions) ? value.missions : {};
  for (const mission of missions) {
    const stored = storedMissions[mission.id];
    if (stored === undefined) continue;
    const sanitized = sanitizeMission(stored, mission);
    progress.missions[mission.id] = sanitized.progress;
    recovered ||= sanitized.recovered;
  }
  for (const id of Object.keys(storedMissions))
    if (!missionById(id)) recovered = true;
  return { progress, recovered };
}

export function parsePracticeProgress(raw: string | null): {
  progress: PracticeProgress;
  recovered: boolean;
} {
  if (raw === null)
    return { progress: emptyPracticeProgress(), recovered: false };
  try {
    return sanitizePracticeProgress(JSON.parse(raw));
  } catch {
    // Corrupt JSON and incompatible versions safely become an empty state.
    return { progress: emptyPracticeProgress(), recovered: true };
  }
}

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function createPracticeStore(
  suppliedStorage?: Storage | null
): PracticeStore {
  const storage =
    suppliedStorage === undefined ? browserStorage() : suppliedStorage;
  let persistent = Boolean(storage);
  let recovered = false;
  let state = emptyPracticeProgress();

  if (storage) {
    try {
      const parsed = parsePracticeProgress(
        storage.getItem(PRACTICE_STORAGE_KEY)
      );
      state = parsed.progress;
      recovered = parsed.recovered;
    } catch {
      persistent = false;
    }
  }

  const save = () => {
    if (!storage) {
      persistent = false;
      return;
    }
    try {
      storage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state));
      persistent = true;
      recovered = false;
    } catch {
      // The in-memory state remains usable when storage is full or blocked.
      persistent = false;
    }
  };

  return {
    getState: () => state,
    getNotice: () =>
      !persistent ? 'memory' : recovered ? 'recovered' : 'persistent',
    update(missionId, change) {
      const mission = missionById(missionId);
      if (!mission) return state;
      const current =
        state.missions[missionId] ?? emptyMissionProgress(mission);
      const draft: MissionProgress = {
        ...current,
        prediction: { ...current.prediction },
        observationStepIds: [...current.observationStepIds],
        reflectionCheckIds: [...current.reflectionCheckIds],
      };
      change(draft);
      const sanitized = sanitizeMission(draft, mission);
      state.missions[missionId] = sanitized.progress;
      save();
      return state;
    },
    resetMission(missionId) {
      if (missionById(missionId)) {
        delete state.missions[missionId];
        save();
      }
      return state;
    },
    clearAll() {
      state = emptyPracticeProgress();
      recovered = false;
      if (!storage) {
        persistent = false;
        return state;
      }
      try {
        // Never call Storage.clear(): unrelated preferences must survive.
        storage.removeItem(PRACTICE_STORAGE_KEY);
        persistent = true;
      } catch {
        persistent = false;
      }
      return state;
    },
  };
}
