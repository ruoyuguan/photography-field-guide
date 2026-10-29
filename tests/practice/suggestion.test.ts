import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceCatalog } from '../../src/data_files/practice-catalog.ts';
import { missions } from '../../src/data_files/practice.ts';
import {
  lightweightEditingMission,
  LIGHTWEIGHT_EDITING_STEP_IDS,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
} from '../../src/data_files/lightweight-editing-practice.ts';
import { createPracticeIndexStore } from '../../src/utils/practice/index-progress.ts';
import {
  emptyLightweightEditingProgress,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
} from '../../src/utils/practice/lightweight-editing-progress.ts';
import {
  emptyMissionProgress,
  PRACTICE_STORAGE_KEY,
  type MissionStatus,
} from '../../src/utils/practice/progress.ts';
import { selectPracticeSuggestion } from '../../src/utils/practice/suggestion.ts';

const ids = practiceCatalog.map(entry => entry.id);
const all = (status: MissionStatus): Record<string, MissionStatus> =>
  Object.fromEntries(ids.map(id => [id, status]));

test('first visit suggests the first available experiment without recording progress', () => {
  const statuses = Object.freeze({});
  assert.deepEqual(selectPracticeSuggestion(statuses), {
    missionId: 'light-direction',
    kind: 'start',
    completedCount: 0,
    totalCount: 6,
  });
  assert.deepEqual(statuses, {});
});

test('explicit not-started records have the same meaning as missing records', () => {
  assert.deepEqual(
    selectPracticeSuggestion(all('not-started')),
    selectPracticeSuggestion({})
  );
});

test('an in-progress mission is preferred over earlier untouched missions', () => {
  assert.deepEqual(
    selectPracticeSuggestion({ 'photo-review': 'in-progress' }),
    {
      missionId: 'photo-review',
      kind: 'continue',
      completedCount: 0,
      totalCount: 6,
    }
  );
});

test('multiple in-progress records follow curriculum order rather than object insertion order', () => {
  const statuses: Readonly<Record<string, MissionStatus>> = Object.freeze({
    'lightweight-editing': 'in-progress',
    'neighborhood-story': 'in-progress',
    'subject-background': 'completed',
  });
  const suggestion = selectPracticeSuggestion(statuses);
  assert.equal(suggestion.missionId, 'neighborhood-story');
  assert.equal(suggestion.kind, 'continue');
  assert.equal(suggestion.completedCount, 1);
});

test('completion gaps suggest the first untouched mission without requiring earlier completion', () => {
  assert.deepEqual(
    selectPracticeSuggestion({
      'light-direction': 'completed',
      'neighborhood-story': 'completed',
    }),
    {
      missionId: 'subject-background',
      kind: 'next',
      completedCount: 2,
      totalCount: 6,
    }
  );
});

test('a reader who completed C1–C5 is offered the existing C6 task', () => {
  const statuses = all('completed');
  statuses['lightweight-editing'] = 'not-started';
  assert.deepEqual(selectPracticeSuggestion(statuses), {
    missionId: 'lightweight-editing',
    kind: 'next',
    completedCount: 5,
    totalCount: 6,
  });
});

test('all completed checklists offer a revisit instead of claiming mastery or inventing a new task', () => {
  assert.deepEqual(selectPracticeSuggestion(all('completed')), {
    missionId: 'light-direction',
    kind: 'revisit',
    completedCount: 6,
    totalCount: 6,
  });
});

test('unknown record IDs cannot inflate totals or hijack the suggestion', () => {
  const statuses: Record<string, MissionStatus> = {
    'unpublished-task': 'in-progress',
    'old-task': 'completed',
  };
  assert.deepEqual(
    selectPracticeSuggestion(statuses),
    selectPracticeSuggestion({})
  );
});

test('an in-progress record remains the suggestion when every other task is marked complete', () => {
  const statuses = Object.freeze({
    ...all('completed'),
    'lightweight-editing': 'in-progress' as const,
  });
  assert.deepEqual(selectPracticeSuggestion(statuses), {
    missionId: 'lightweight-editing',
    kind: 'continue',
    completedCount: 5,
    totalCount: 6,
  });
});

test('the catalog adapter supplies authoritative C6 progress without migrating or writing its saved key', () => {
  const shared = {
    version: 1,
    missions: Object.fromEntries(
      missions.map(mission => [
        mission.id,
        {
          ...emptyMissionProgress(mission),
          status: 'completed',
        },
      ])
    ),
  };
  // An obsolete shared-namespace C6 record must not shadow the dedicated store.
  shared.missions['lightweight-editing'] = {
    ...emptyMissionProgress(missions[0]),
    status: 'completed',
  };
  const editing = {
    ...emptyLightweightEditingProgress(),
    status: 'in-progress',
    prediction: {
      choiceId: lightweightEditingMission.copy.en.prediction.correctChoiceId,
      solved: true,
      revealed: true,
    },
    observationStepIds: [...LIGHTWEIGHT_EDITING_STEP_IDS],
    reflectionCheckIds: [...LIGHTWEIGHT_EDITING_REFLECTION_IDS],
  };
  const initial = {
    [PRACTICE_STORAGE_KEY]: JSON.stringify(shared),
    [LIGHTWEIGHT_EDITING_STORAGE_KEY]: JSON.stringify(editing),
    hs_theme: 'dark',
  };
  const values = new Map(Object.entries(initial));
  const storage: Storage = {
    get length() {
      return values.size;
    },
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    setItem: () =>
      assert.fail('Suggestion reads must not write browser storage.'),
    removeItem: () =>
      assert.fail('Suggestion reads must not remove saved progress.'),
    clear: () =>
      assert.fail('Suggestion reads must preserve unrelated preferences.'),
  };
  const index = createPracticeIndexStore(storage);
  const statuses = Object.fromEntries(ids.map(id => [id, index.getStatus(id)]));
  assert.deepEqual(selectPracticeSuggestion(statuses), {
    missionId: 'lightweight-editing',
    kind: 'continue',
    completedCount: 5,
    totalCount: 6,
  });
  assert.deepEqual(Object.fromEntries(values), initial);
});
