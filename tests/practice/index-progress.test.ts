import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lightweightEditingMission,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
} from '../../src/data_files/lightweight-editing-practice.ts';
import {
  practiceCatalog,
  practiceEntryById,
} from '../../src/data_files/practice-catalog.ts';
import { missions } from '../../src/data_files/practice.ts';
import {
  createPracticeIndexStore,
  PRACTICE_PROGRESS_KEYS,
} from '../../src/utils/practice/index-progress.ts';
import {
  createLightweightEditingStore,
  emptyLightweightEditingProgress,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
} from '../../src/utils/practice/lightweight-editing-progress.ts';
import {
  createPracticeStore,
  emptyMissionProgress,
  PRACTICE_STORAGE_KEY,
} from '../../src/utils/practice/progress.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const writes: string[] = [];
  const removals: string[] = [];
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear() {
      assert.fail('Practice progress must never clear unrelated browser data.');
    },
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem(key) {
      removals.push(key);
      values.delete(key);
    },
    setItem(key, value) {
      writes.push(key);
      values.set(key, value);
    },
  };
  return { values, writes, removals, storage };
}

function savedShared() {
  const mission = missions[0];
  return JSON.stringify({
    version: 1,
    missions: {
      [mission.id]: {
        ...emptyMissionProgress(mission),
        status: 'completed',
        prediction: {
          choiceId: mission.copy.en.prediction.correctChoiceId,
          solved: true,
          revealed: true,
        },
        observationStepIds: mission.copy.en.observation.steps.map(
          step => step.id
        ),
        reflectionCheckIds: mission.copy.en.reflection.checks.map(
          check => check.id
        ),
      },
    },
  });
}

function savedEditing(status: 'not-started' | 'in-progress' | 'completed') {
  return JSON.stringify({
    ...emptyLightweightEditingProgress(),
    status,
    ...(status === 'not-started'
      ? {}
      : {
          prediction: {
            choiceId:
              lightweightEditingMission.copy.en.prediction.correctChoiceId,
            solved: true,
            revealed: true,
          },
          observationStepIds: lightweightEditingMission.copy.en.steps.map(
            step => step.id
          ),
          reflectionCheckIds:
            lightweightEditingMission.copy.en.reflection.checks.map(
              check => check.id
            ),
        }),
  });
}

test('catalog adds C6 summaries without registering it in the shared mission store', () => {
  assert.equal(missions.length, 5);
  assert.equal(practiceCatalog.length, 6);
  assert.equal(new Set(practiceCatalog.map(entry => entry.id)).size, 6);
  assert.deepEqual(
    practiceCatalog.map(entry => entry.number),
    [1, 2, 3, 4, 5, 6]
  );
  for (const mission of missions) {
    const entry = practiceEntryById(mission.id)!;
    assert.equal(entry.articlePath, mission.articlePath);
    for (const locale of ['en', 'zh-cn'] as const)
      for (const key of [
        'title',
        'lessonTitle',
        'intro',
        'goal',
        'duration',
      ] as const)
        assert.equal(entry.copy[locale][key], mission.copy[locale][key]);
  }
  const editing = practiceEntryById('lightweight-editing')!;
  assert.equal(editing.articlePath, '/learn/workflow/lightweight-editing/');
  assert.equal(editing.copy.en.lessonTitle, 'Lightweight Editing');
  assert.equal(editing.copy['zh-cn'].lessonTitle, '轻量后期');
  for (const locale of ['en', 'zh-cn'] as const) {
    assert.equal(
      editing.copy[locale].title,
      lightweightEditingMission.copy[locale].title
    );
    assert.deepEqual(Object.keys(editing.copy[locale]).sort(), [
      'duration',
      'goal',
      'intro',
      'lessonTitle',
      'title',
    ]);
  }
  assert.equal(practiceEntryById('missing'), undefined);
});

test('index reads saved C1 and dedicated C6 status without writes or migration', () => {
  for (const status of ['not-started', 'in-progress', 'completed'] as const) {
    const initial = {
      [PRACTICE_STORAGE_KEY]: savedShared(),
      [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing(status),
      hs_theme: 'dark',
    };
    const { storage, values, writes, removals } = memoryStorage(initial);
    const index = createPracticeIndexStore(storage);
    assert.equal(index.getStatus('light-direction'), 'completed');
    assert.equal(index.getStatus('lightweight-editing'), status);
    assert.equal(index.getStatus('subject-background'), 'not-started');
    assert.equal(index.getStatus('missing'), 'not-started');
    assert.equal(index.getNotice(), 'persistent');
    assert.deepEqual(Object.fromEntries(values), initial);
    assert.deepEqual(writes, []);
    assert.deepEqual(removals, []);
  }
});

test('dedicated C6 is authoritative even if a stray shared C6 record exists', () => {
  const shared = JSON.parse(savedShared());
  shared.missions['lightweight-editing'] = { status: 'completed', version: 1 };
  const { storage, values, writes } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: JSON.stringify(shared),
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('in-progress'),
  });
  const original = values.get(PRACTICE_STORAGE_KEY);
  const index = createPracticeIndexStore(storage);
  assert.equal(index.getStatus('lightweight-editing'), 'in-progress');
  assert.equal(index.getNotice(), 'recovered');
  assert.equal(values.get(PRACTICE_STORAGE_KEY), original);
  assert.deepEqual(writes, []);
});

test('index does not present an incomplete or malformed C6 record as completed', () => {
  const valid = JSON.parse(savedEditing('completed'));
  const wrongChoiceId =
    lightweightEditingMission.copy.en.prediction.choices.find(
      choice =>
        choice.id !==
        lightweightEditingMission.copy.en.prediction.correctChoiceId
    )!.id;
  const incompleteRecords = [
    { ...emptyLightweightEditingProgress(), status: 'completed' },
    { ...valid, observationStepIds: valid.observationStepIds.slice(1) },
    { ...valid, reflectionCheckIds: valid.reflectionCheckIds.slice(1) },
    {
      ...valid,
      prediction: { ...valid.prediction, choiceId: wrongChoiceId },
    },
    { ...valid, observationStepIds: ['unknown-step'] },
  ];
  for (const progress of incompleteRecords) {
    const initial = {
      [PRACTICE_STORAGE_KEY]: savedShared(),
      [LIGHTWEIGHT_EDITING_STORAGE_KEY]: JSON.stringify(progress),
    };
    const { storage, values, writes, removals } = memoryStorage(initial);
    const index = createPracticeIndexStore(storage);
    assert.equal(index.getStatus('lightweight-editing'), 'in-progress');
    assert.equal(index.getStatus('light-direction'), 'completed');
    assert.deepEqual(Object.fromEntries(values), initial);
    assert.deepEqual(writes, []);
    assert.deepEqual(removals, []);
  }
});

test('index reflects later writes and resets from both existing task stores', () => {
  const { storage } = memoryStorage();
  const index = createPracticeIndexStore(storage);
  const shared = createPracticeStore(storage);
  const editing = createLightweightEditingStore(storage);
  assert.equal(index.getStatus('lightweight-editing'), 'not-started');
  editing.update(progress => {
    progress.prediction.choiceId =
      lightweightEditingMission.copy.en.prediction.correctChoiceId;
  });
  shared.update('light-direction', progress => {
    progress.status = 'in-progress';
  });
  assert.equal(index.getStatus('lightweight-editing'), 'in-progress');
  assert.equal(index.getStatus('light-direction'), 'in-progress');
  editing.reset();
  shared.resetMission('light-direction');
  assert.equal(index.getStatus('lightweight-editing'), 'not-started');
  assert.equal(index.getStatus('light-direction'), 'not-started');
});

test('clear all removes exactly both practice keys and preserves preferences', () => {
  const { storage, values, writes, removals } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: savedShared(),
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('completed'),
    hs_theme: 'dark',
    preferred_locale: 'zh-cn',
    unrelated: 'keep',
  });
  const index = createPracticeIndexStore(storage);
  index.clearAll();
  assert.deepEqual(
    [...PRACTICE_PROGRESS_KEYS],
    [PRACTICE_STORAGE_KEY, LIGHTWEIGHT_EDITING_STORAGE_KEY]
  );
  assert.deepEqual(removals, [...PRACTICE_PROGRESS_KEYS]);
  assert.deepEqual(Object.fromEntries(values), {
    hs_theme: 'dark',
    preferred_locale: 'zh-cn',
    unrelated: 'keep',
  });
  assert.deepEqual(writes, []);
  assert.equal(index.getStatus('light-direction'), 'not-started');
  assert.equal(index.getStatus('lightweight-editing'), 'not-started');
  assert.equal(index.getNotice(), 'persistent');
  assert.equal(
    createPracticeIndexStore(storage).getStatus('lightweight-editing'),
    'not-started'
  );
});

test('partial clear failure still attempts both keys and reports memory state', () => {
  for (const blockedKey of PRACTICE_PROGRESS_KEYS) {
    const { storage, values, removals } = memoryStorage({
      [PRACTICE_STORAGE_KEY]: savedShared(),
      [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('completed'),
      hs_theme: 'dark',
    });
    const remove = storage.removeItem;
    storage.removeItem = key => {
      if (key === blockedKey) {
        removals.push(key);
        throw new Error('Removal blocked');
      }
      remove(key);
    };
    const index = createPracticeIndexStore(storage);
    index.clearAll();
    assert.deepEqual(removals, [...PRACTICE_PROGRESS_KEYS]);
    assert.equal(index.getStatus('light-direction'), 'not-started');
    assert.equal(index.getStatus('lightweight-editing'), 'not-started');
    assert.equal(index.getNotice(), 'memory');
    assert.equal(values.has(blockedKey), true);
    assert.equal(
      values.has(PRACTICE_PROGRESS_KEYS.find(key => key !== blockedKey)!),
      false
    );
    assert.equal(values.get('hs_theme'), 'dark');
    const reloaded = createPracticeIndexStore(storage);
    assert.equal(
      reloaded.getStatus(
        blockedKey === PRACTICE_STORAGE_KEY
          ? 'light-direction'
          : 'lightweight-editing'
      ),
      'completed'
    );
  }
});

test('corruption in either namespace is reported without overwriting it', () => {
  for (const corruptKey of PRACTICE_PROGRESS_KEYS) {
    const initial = {
      [PRACTICE_STORAGE_KEY]: savedShared(),
      [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('completed'),
      [corruptKey]: '{bad JSON',
    };
    const { storage, values, writes } = memoryStorage(initial);
    const index = createPracticeIndexStore(storage);
    assert.equal(index.getNotice(), 'recovered');
    assert.equal(
      index.getStatus(
        corruptKey === PRACTICE_STORAGE_KEY
          ? 'light-direction'
          : 'lightweight-editing'
      ),
      'not-started'
    );
    assert.equal(
      index.getStatus(
        corruptKey === PRACTICE_STORAGE_KEY
          ? 'lightweight-editing'
          : 'light-direction'
      ),
      'completed'
    );
    assert.deepEqual(Object.fromEntries(values), initial);
    assert.deepEqual(writes, []);
  }
});

test('memory notice wins over recovery and blocked reads never trigger writes', () => {
  const { storage, values, writes } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: '{bad JSON',
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('completed'),
  });
  const read = storage.getItem;
  storage.getItem = key => {
    if (key === LIGHTWEIGHT_EDITING_STORAGE_KEY)
      throw new Error('Read blocked');
    return read(key);
  };
  const index = createPracticeIndexStore(storage);
  assert.equal(index.getNotice(), 'memory');
  assert.equal(index.getStatus('lightweight-editing'), 'not-started');
  assert.equal(
    values.get(LIGHTWEIGHT_EDITING_STORAGE_KEY),
    savedEditing('completed')
  );
  assert.deepEqual(writes, []);
  const unavailable = createPracticeIndexStore(null);
  assert.equal(unavailable.getNotice(), 'memory');
  unavailable.clearAll();
  assert.equal(unavailable.getStatus('lightweight-editing'), 'not-started');
  assert.equal(unavailable.getNotice(), 'memory');
});

test('an already-open C6 store cannot restore its old checklist after global clear', () => {
  const { storage } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: savedShared(),
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: savedEditing('completed'),
  });
  const editing = createLightweightEditingStore(storage);
  createPracticeIndexStore(storage).clearAll();
  editing.update(progress => {
    progress.reflectionCheckIds.push(LIGHTWEIGHT_EDITING_REFLECTION_IDS[0]);
  });
  const after = editing.getState();
  assert.equal(after.status, 'in-progress');
  assert.equal(after.prediction.choiceId, undefined);
  assert.deepEqual(after.observationStepIds, []);
  assert.deepEqual(after.reflectionCheckIds, [
    LIGHTWEIGHT_EDITING_REFLECTION_IDS[0],
  ]);
  assert.equal(
    createPracticeIndexStore(storage).getStatus('light-direction'),
    'not-started'
  );
});
