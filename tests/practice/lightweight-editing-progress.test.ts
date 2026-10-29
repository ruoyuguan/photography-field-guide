import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lightweightEditingPredictionFeedback,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
  LIGHTWEIGHT_EDITING_STEP_IDS,
} from '../../src/data_files/lightweight-editing-practice.ts';
import {
  type LightweightEditingProgress,
  createLightweightEditingStore,
  emptyLightweightEditingProgress,
  isLightweightEditingReady,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
  parseLightweightEditingProgress,
  sanitizeLightweightEditingProgress,
} from '../../src/utils/practice/lightweight-editing-progress.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  return { values, storage };
}

function validProgress(): LightweightEditingProgress {
  return {
    ...emptyLightweightEditingProgress(),
    status: 'completed' as const,
    prediction: {
      choiceId: 'compare-without-assuming-recovery',
      solved: false,
      revealed: true,
    },
    observationStepIds: [...LIGHTWEIGHT_EDITING_STEP_IDS],
    reflectionCheckIds: [...LIGHTWEIGHT_EDITING_REFLECTION_IDS],
  };
}

test('C6 starts empty and supports persistent, bilingual-safe IDs without photo data', () => {
  assert.deepEqual(parseLightweightEditingProgress(null), {
    progress: emptyLightweightEditingProgress(),
    recovered: false,
  });
  const { storage, values } = memoryStorage();
  const store = createLightweightEditingStore(storage);
  store.update(progress => {
    progress.prediction.choiceId = 'compare-without-assuming-recovery';
    progress.prediction.revealed = true;
    progress.observationStepIds = [...LIGHTWEIGHT_EDITING_STEP_IDS];
    progress.reflectionCheckIds = [...LIGHTWEIGHT_EDITING_REFLECTION_IDS];
    progress.status = 'completed';
    Object.assign(progress, {
      photos: ['private.jpg'],
      fileNames: ['private.jpg'],
      dimensions: [1200, 800],
      reflectionText: 'private note',
    });
  });
  const saved = JSON.parse(values.get(LIGHTWEIGHT_EDITING_STORAGE_KEY)!);
  assert.equal(saved.missionId, 'lightweight-editing');
  assert.equal(saved.prediction.solved, true);
  assert.equal(saved.observationStepIds.length, 3);
  assert.equal(saved.reflectionCheckIds.length, 3);
  for (const key of ['photos', 'fileNames', 'dimensions', 'reflectionText'])
    assert.equal(key in saved, false);
  assert.deepEqual(createLightweightEditingStore(storage).getState(), saved);
});

test('C6 corrupt JSON, incompatible versions, and wrong mission IDs recover safely', () => {
  for (const raw of [
    '{bad json',
    'null',
    JSON.stringify({ ...validProgress(), version: 0 }),
    JSON.stringify({ ...validProgress(), missionId: 'another-mission' }),
  ]) {
    const parsed = parseLightweightEditingProgress(raw);
    assert.deepEqual(parsed.progress, emptyLightweightEditingProgress());
    assert.equal(parsed.recovered, true);
  }
});

test('C6 stored truth claims, invalid choices, and unknown checklist IDs are not trusted', () => {
  const sanitized = sanitizeLightweightEditingProgress({
    ...validProgress(),
    status: 'nonsense',
    prediction: {
      choiceId: 'unknown-choice',
      solved: true,
      revealed: 'yes',
    },
    observationStepIds: [LIGHTWEIGHT_EDITING_STEP_IDS[0], 'unknown', null],
    reflectionCheckIds: [LIGHTWEIGHT_EDITING_REFLECTION_IDS[0], 'unknown'],
  });
  assert.equal(sanitized.recovered, true);
  assert.equal(sanitized.progress.status, 'in-progress');
  assert.equal(sanitized.progress.prediction.choiceId, undefined);
  assert.equal(sanitized.progress.prediction.solved, false);
  assert.equal(sanitized.progress.prediction.revealed, false);
  assert.deepEqual(sanitized.progress.observationStepIds, [
    LIGHTWEIGHT_EDITING_STEP_IDS[0],
  ]);
  assert.deepEqual(sanitized.progress.reflectionCheckIds, [
    LIGHTWEIGHT_EDITING_REFLECTION_IDS[0],
  ]);
});

test('C6 readiness checks the current answer and every required ID instead of stored truth or counts', () => {
  const progress = validProgress();
  assert.equal(isLightweightEditingReady(progress), true);
  progress.prediction.choiceId = 'brighter-adds-captured-light';
  progress.prediction.solved = true;
  assert.equal(isLightweightEditingReady(progress), false);
  progress.prediction.choiceId = 'compare-without-assuming-recovery';
  for (const stepId of LIGHTWEIGHT_EDITING_STEP_IDS) {
    progress.observationStepIds = LIGHTWEIGHT_EDITING_STEP_IDS.filter(
      id => id !== stepId
    );
    assert.equal(isLightweightEditingReady(progress), false);
  }
  progress.observationStepIds = [...LIGHTWEIGHT_EDITING_STEP_IDS];
  for (const checkId of LIGHTWEIGHT_EDITING_REFLECTION_IDS) {
    progress.reflectionCheckIds = LIGHTWEIGHT_EDITING_REFLECTION_IDS.filter(
      id => id !== checkId
    );
    assert.equal(isLightweightEditingReady(progress), false);
  }
  progress.reflectionCheckIds = [...LIGHTWEIGHT_EDITING_REFLECTION_IDS];
  progress.observationStepIds = ['unknown-a', 'unknown-b', 'unknown-c'];
  assert.equal(isLightweightEditingReady(progress), false);
});

test('C6 restores valid completed v1 progress and downgrades incomplete or forged completion', () => {
  const valid = sanitizeLightweightEditingProgress(validProgress());
  assert.equal(valid.recovered, false);
  assert.equal(valid.progress.status, 'completed');
  assert.equal(valid.progress.prediction.solved, true);
  assert.equal(valid.progress.version, 1);
  assert.equal(
    LIGHTWEIGHT_EDITING_STORAGE_KEY,
    'photography-field-guide:practice:lightweight-editing:v1'
  );
  const incomplete = [
    { ...emptyLightweightEditingProgress(), status: 'completed' },
    { ...validProgress(), observationStepIds: [] },
    { ...validProgress(), reflectionCheckIds: [] },
    {
      ...validProgress(),
      prediction: {
        choiceId: 'brighter-adds-captured-light',
        solved: true,
        revealed: true,
      },
    },
    {
      ...validProgress(),
      observationStepIds: ['removed-a', 'removed-b', 'removed-c'],
    },
    {
      ...validProgress(),
      reflectionCheckIds: ['removed-a', 'removed-b', 'removed-c'],
    },
  ];
  for (const saved of incomplete) {
    const restored = parseLightweightEditingProgress(JSON.stringify(saved));
    assert.equal(restored.recovered, true);
    assert.equal(restored.progress.status, 'in-progress');
    assert.equal(isLightweightEditingReady(restored.progress), false);
  }
});

test('C6 unchecking a completed review requires an explicit completion after rechecking', () => {
  for (const group of ['observationStepIds', 'reflectionCheckIds'] as const) {
    const { storage } = memoryStorage();
    const store = createLightweightEditingStore(storage);
    store.update(progress => Object.assign(progress, validProgress()));
    const removedId = store.getState()[group][0];
    store.update(progress => {
      progress[group] = progress[group].filter(id => id !== removedId);
    });
    assert.equal(store.getState().status, 'in-progress');
    assert.equal(isLightweightEditingReady(store.getState()), false);
    store.update(progress => {
      progress[group].push(removedId);
    });
    assert.equal(isLightweightEditingReady(store.getState()), true);
    assert.equal(store.getState().status, 'in-progress');
    store.update(progress => {
      progress.status = 'completed';
    });
    assert.equal(store.getState().status, 'completed');
    assert.equal(
      createLightweightEditingStore(storage).getState().status,
      'completed'
    );
  }
});

test('C6 submitting a wrong answer reopens a completed review while explanation-only activity preserves it', () => {
  const store = createLightweightEditingStore(null);
  store.update(progress => Object.assign(progress, validProgress()));
  store.update(progress => {
    progress.prediction.revealed = true;
  });
  assert.equal(store.getState().status, 'completed');
  store.update(progress => {
    progress.prediction.choiceId = 'neutralize-and-crop-together';
  });
  assert.equal(store.getState().prediction.solved, false);
  assert.equal(store.getState().status, 'in-progress');
  assert.equal(isLightweightEditingReady(store.getState()), false);
});

test('C6 wrong answers remain retryable and completion is only an explicit marker', () => {
  const store = createLightweightEditingStore(null);
  store.update(progress => {
    progress.prediction.choiceId = 'brighter-adds-captured-light';
    progress.prediction.revealed = true;
    progress.status = 'in-progress';
  });
  assert.equal(store.getState().prediction.solved, false);
  store.update(progress => {
    progress.prediction.choiceId = undefined;
    progress.status = 'in-progress';
  });
  assert.equal(store.getState().status, 'in-progress');
  assert.equal(store.getState().prediction.choiceId, undefined);
  assert.equal(store.getState().prediction.revealed, true);
});

test('C6 failed reads are never overwritten and later changes remain in memory', () => {
  let writes = 0;
  const blocked = {
    getItem() {
      throw new Error('blocked read');
    },
    setItem() {
      writes++;
    },
    removeItem() {
      throw new Error('blocked remove');
    },
  } as unknown as Storage;
  const store = createLightweightEditingStore(blocked);
  store.update(progress => {
    progress.observationStepIds.push(LIGHTWEIGHT_EDITING_STEP_IDS[0]);
  });
  store.update(progress => {
    progress.reflectionCheckIds.push(LIGHTWEIGHT_EDITING_REFLECTION_IDS[0]);
  });
  assert.equal(writes, 0);
  assert.equal(store.getNotice(), 'memory');
  assert.deepEqual(store.getState().observationStepIds, [
    LIGHTWEIGHT_EDITING_STEP_IDS[0],
  ]);
  assert.deepEqual(store.getState().reflectionCheckIds, [
    LIGHTWEIGHT_EDITING_REFLECTION_IDS[0],
  ]);
});

test('C6 failed writes do not reload stale storage on later operations', () => {
  const original = JSON.stringify(validProgress());
  const { storage, values } = memoryStorage({
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: original,
  });
  storage.setItem = () => {
    throw new Error('quota exceeded');
  };
  const store = createLightweightEditingStore(storage);
  store.update(progress => {
    progress.observationStepIds = [LIGHTWEIGHT_EDITING_STEP_IDS[0]];
  });
  store.update(progress => {
    progress.reflectionCheckIds = [LIGHTWEIGHT_EDITING_REFLECTION_IDS[1]];
  });
  assert.equal(store.getNotice(), 'memory');
  assert.deepEqual(store.getState().observationStepIds, [
    LIGHTWEIGHT_EDITING_STEP_IDS[0],
  ]);
  assert.deepEqual(store.getState().reflectionCheckIds, [
    LIGHTWEIGHT_EDITING_REFLECTION_IDS[1],
  ]);
  assert.equal(values.get(LIGHTWEIGHT_EDITING_STORAGE_KEY), original);
});

test('C6 reset removes only its own key and preserves shared tasks and theme', () => {
  const { storage, values } = memoryStorage({
    hs_theme: 'dark',
    'photography-field-guide:practice:v1': '{"keep":true}',
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: JSON.stringify(validProgress()),
  });
  const store = createLightweightEditingStore(storage);
  assert.equal(store.getState().status, 'completed');
  store.reset();
  assert.deepEqual(store.getState(), emptyLightweightEditingProgress());
  assert.equal(values.has(LIGHTWEIGHT_EDITING_STORAGE_KEY), false);
  assert.equal(values.get('hs_theme'), 'dark');
  assert.equal(
    values.get('photography-field-guide:practice:v1'),
    '{"keep":true}'
  );
});

test('C6 failed reset still clears this page memory and reports storage honestly', () => {
  const saved = JSON.stringify(validProgress());
  const { storage, values } = memoryStorage({
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: saved,
    hs_theme: 'dark',
  });
  storage.removeItem = () => {
    throw new Error('remove blocked');
  };
  const store = createLightweightEditingStore(storage);
  store.reset();
  assert.deepEqual(store.getState(), emptyLightweightEditingProgress());
  assert.equal(store.getNotice(), 'memory');
  assert.equal(values.get(LIGHTWEIGHT_EDITING_STORAGE_KEY), saved);
  assert.equal(values.get('hs_theme'), 'dark');
});

test('C6 interleaved stores refresh before each operation', () => {
  const { storage } = memoryStorage();
  const first = createLightweightEditingStore(storage);
  const second = createLightweightEditingStore(storage);
  first.update(progress => {
    progress.prediction.choiceId = 'brighter-adds-captured-light';
  });
  second.update(progress => {
    progress.observationStepIds.push(LIGHTWEIGHT_EDITING_STEP_IDS[0]);
  });
  first.update(progress => {
    progress.prediction.choiceId = 'compare-without-assuming-recovery';
  });
  const restored = second.getState();
  assert.equal(restored.prediction.solved, true);
  assert.deepEqual(restored.observationStepIds, [
    LIGHTWEIGHT_EDITING_STEP_IDS[0],
  ]);
});

test('C6 prediction feedback is contextual in both languages', () => {
  for (const locale of ['en', 'zh-cn'] as const) {
    assert.equal(lightweightEditingPredictionFeedback(locale, undefined), null);
    assert.equal(lightweightEditingPredictionFeedback(locale, 'unknown'), null);
    assert.ok(
      lightweightEditingPredictionFeedback(
        locale,
        'brighter-adds-captured-light'
      )?.length
    );
    assert.ok(
      lightweightEditingPredictionFeedback(
        locale,
        'compare-without-assuming-recovery'
      )?.length
    );
  }
});
