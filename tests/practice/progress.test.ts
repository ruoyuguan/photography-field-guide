import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRACTICE_STORAGE_KEY,
  createPracticeStore,
  emptyPracticeProgress,
  parsePracticeProgress,
  sanitizePracticeProgress,
} from '../../src/utils/practice/progress.ts';

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

const validProgress = {
  version: 1,
  missions: {
    'light-direction': {
      version: 1,
      status: 'completed',
      prediction: {
        choiceId: 'left-surfaces-right-shadow',
        solved: true,
        revealed: false,
      },
      observationStepIds: ['compare-model', 'make-front-photo'],
      reflectionCheckIds: ['surface-evidence'],
    },
  },
};

test('empty and missing storage start without any completed mission', () => {
  assert.deepEqual(parsePracticeProgress(null), {
    progress: emptyPracticeProgress(),
    recovered: false,
  });
  const store = createPracticeStore(null);
  assert.equal(store.getNotice(), 'memory');
  assert.deepEqual(store.getState(), emptyPracticeProgress());
});

test('valid progress round-trips with stable mission and step IDs', () => {
  const { storage, values } = memoryStorage();
  const store = createPracticeStore(storage);
  store.update('light-direction', progress => {
    progress.prediction.choiceId = 'left-surfaces-right-shadow';
    progress.observationStepIds.push('compare-model');
    progress.reflectionCheckIds.push('surface-evidence');
    progress.status = 'completed';
  });
  assert.equal(store.getNotice(), 'persistent');
  const saved = JSON.parse(values.get(PRACTICE_STORAGE_KEY)!);
  assert.equal(saved.missions['light-direction'].prediction.solved, true);
  assert.equal(saved.missions['light-direction'].status, 'completed');
  const restored = createPracticeStore(storage).getState();
  assert.deepEqual(restored, store.getState());
  assert.equal('photos' in saved, false);
  assert.equal('reflectionText' in saved.missions['light-direction'], false);
});

test('corrupt JSON and old root versions reset safely', () => {
  for (const raw of [
    '{bad json',
    'null',
    JSON.stringify({ version: 0, completedMissionIds: ['light-direction'] }),
    JSON.stringify({ version: 99, missions: validProgress.missions }),
  ]) {
    const parsed = parsePracticeProgress(raw);
    assert.deepEqual(parsed.progress, emptyPracticeProgress());
    assert.equal(parsed.recovered, true);
  }
});

test('unknown IDs, invalid steps, and forged answer flags are not trusted', () => {
  const sanitized = sanitizePracticeProgress({
    version: 1,
    missions: {
      'unknown-mission': { version: 1, status: 'completed' },
      'light-direction': {
        version: 1,
        status: 'nonsense',
        prediction: {
          choiceId: 'always-brighter',
          solved: true,
          revealed: 'yes',
        },
        observationStepIds: ['compare-model', 'unknown-step', 'compare-model'],
        reflectionCheckIds: [null, 'surface-evidence'],
      },
    },
  });
  assert.equal(sanitized.recovered, true);
  assert.equal(sanitized.progress.missions['unknown-mission'], undefined);
  const mission = sanitized.progress.missions['light-direction'];
  assert.equal(mission.status, 'in-progress');
  assert.equal(mission.prediction.solved, false);
  assert.equal(mission.prediction.revealed, false);
  assert.deepEqual(mission.observationStepIds, ['compare-model']);
  assert.deepEqual(mission.reflectionCheckIds, ['surface-evidence']);
});

test('an outdated mission resets only that mission', () => {
  const sanitized = sanitizePracticeProgress({
    version: 1,
    missions: {
      'light-direction': {
        ...validProgress.missions['light-direction'],
        version: 0,
      },
    },
  });
  assert.equal(sanitized.recovered, true);
  assert.equal(
    sanitized.progress.missions['light-direction'].status,
    'not-started'
  );
  assert.equal(
    sanitized.progress.missions['light-direction'].prediction.choiceId,
    undefined
  );
});

test('wrong answers stay retryable and revealing an answer is not mastery', () => {
  const store = createPracticeStore(null);
  store.update('light-direction', progress => {
    progress.prediction.choiceId = 'always-brighter';
    progress.prediction.revealed = true;
  });
  const mission = store.getState().missions['light-direction'];
  assert.equal(mission.prediction.solved, false);
  assert.equal(mission.prediction.revealed, true);
  assert.equal(mission.status, 'in-progress');
});

test('read and write failures retain an in-memory task', () => {
  const blocked = {
    getItem() {
      throw new Error('blocked read');
    },
    setItem() {
      throw new Error('blocked write');
    },
    removeItem() {
      throw new Error('blocked remove');
    },
  } as unknown as Storage;
  const store = createPracticeStore(blocked);
  assert.equal(store.getNotice(), 'memory');
  store.update('light-direction', progress => {
    progress.observationStepIds.push('compare-model');
  });
  assert.equal(store.getNotice(), 'memory');
  assert.deepEqual(
    store.getState().missions['light-direction'].observationStepIds,
    ['compare-model']
  );
});

test('clearing practice removes only this project key', () => {
  const { storage, values } = memoryStorage({
    hs_theme: 'dark',
    'another-app': 'keep',
    [PRACTICE_STORAGE_KEY]: JSON.stringify(validProgress),
  });
  const store = createPracticeStore(storage);
  assert.equal(
    store.getState().missions['light-direction'].status,
    'completed'
  );
  store.clearAll();
  assert.equal(values.has(PRACTICE_STORAGE_KEY), false);
  assert.equal(values.get('hs_theme'), 'dark');
  assert.equal(values.get('another-app'), 'keep');
  assert.deepEqual(store.getState(), emptyPracticeProgress());
});

test('single-mission reset leaves unrelated preferences and other data intact', () => {
  const { storage, values } = memoryStorage({ hs_theme: 'dark' });
  const store = createPracticeStore(storage);
  store.update('light-direction', progress => {
    progress.status = 'completed';
  });
  store.resetMission('light-direction');
  assert.equal(store.getState().missions['light-direction'], undefined);
  assert.equal(values.get('hs_theme'), 'dark');
});

test('framing progress is validated, restored, and reset independently', () => {
  const { storage } = memoryStorage();
  const store = createPracticeStore(storage);
  store.update('light-direction', progress => {
    progress.status = 'completed';
  });
  store.update('subject-background', progress => {
    progress.prediction.choiceId = 'relative-alignment';
    progress.observationStepIds.push('compare-frames', 'make-initial-photo');
    progress.reflectionCheckIds.push('context-review');
    progress.status = 'completed';
  });

  const restored = createPracticeStore(storage);
  const framing = restored.getState().missions['subject-background'];
  assert.equal(framing.prediction.solved, true);
  assert.deepEqual(framing.observationStepIds, [
    'compare-frames',
    'make-initial-photo',
  ]);
  assert.deepEqual(framing.reflectionCheckIds, ['context-review']);
  assert.equal(framing.status, 'completed');

  restored.resetMission('subject-background');
  assert.equal(restored.getState().missions['subject-background'], undefined);
  assert.equal(
    restored.getState().missions['light-direction'].status,
    'completed'
  );
});

test('story progress restores three actions and resets without removing C1 or C2', () => {
  const { storage } = memoryStorage();
  const store = createPracticeStore(storage);
  for (const id of ['light-direction', 'subject-background']) {
    store.update(id, progress => {
      progress.status = 'completed';
    });
  }
  store.update('neighborhood-story', progress => {
    progress.prediction.choiceId = 'complementary-information';
    progress.observationStepIds.push(
      'make-environment-photo',
      'make-subject-photo',
      'make-detail-photo'
    );
    progress.reflectionCheckIds.push(
      'distinct-roles',
      'intentional-sequence',
      'technical-review'
    );
    progress.status = 'completed';
  });

  const restored = createPracticeStore(storage);
  const story = restored.getState().missions['neighborhood-story'];
  assert.equal(story.prediction.solved, true);
  assert.equal(story.observationStepIds.length, 3);
  assert.equal(story.reflectionCheckIds.length, 3);
  assert.equal(story.status, 'completed');
  assert.equal('photos' in story, false);
  assert.equal('reflectionText' in story, false);

  restored.resetMission('neighborhood-story');
  assert.equal(restored.getState().missions['neighborhood-story'], undefined);
  assert.equal(
    restored.getState().missions['light-direction'].status,
    'completed'
  );
  assert.equal(
    restored.getState().missions['subject-background'].status,
    'completed'
  );
});

test('photo review restores three actions and resets without removing C1–C3', () => {
  const { storage } = memoryStorage();
  const store = createPracticeStore(storage);
  for (const id of [
    'light-direction',
    'subject-background',
    'neighborhood-story',
  ]) {
    store.update(id, progress => {
      progress.status = 'completed';
    });
  }
  store.update('photo-review', progress => {
    progress.prediction.choiceId = 'purpose-and-evidence';
    progress.observationStepIds.push(
      'group-similar-frames',
      'compare-purpose-and-technique',
      'plan-next-experiment'
    );
    progress.reflectionCheckIds.push(
      'explain-selection',
      'review-technical-purpose',
      'choose-next-change'
    );
    progress.status = 'completed';
  });

  const restored = createPracticeStore(storage);
  const review = restored.getState().missions['photo-review'];
  assert.equal(review.prediction.solved, true);
  assert.equal(review.observationStepIds.length, 3);
  assert.equal(review.reflectionCheckIds.length, 3);
  assert.equal(review.status, 'completed');
  assert.equal('photos' in review, false);
  assert.equal('fileNames' in review, false);
  assert.equal('reflectionText' in review, false);

  restored.resetMission('photo-review');
  assert.equal(restored.getState().missions['photo-review'], undefined);
  for (const id of [
    'light-direction',
    'subject-background',
    'neighborhood-story',
  ]) {
    assert.equal(restored.getState().missions[id].status, 'completed');
  }
});

test('interleaved stores preserve other missions and refresh their snapshots', () => {
  const { storage } = memoryStorage();
  const first = createPracticeStore(storage);
  const second = createPracticeStore(storage);
  first.update('light-direction', progress => {
    progress.status = 'completed';
  });
  second.update('photo-review', progress => {
    progress.observationStepIds.push('group-similar-frames');
  });
  assert.equal(
    second.getState().missions['light-direction'].status,
    'completed'
  );
  assert.deepEqual(
    first.getState().missions['photo-review'].observationStepIds,
    ['group-similar-frames']
  );
  first.resetMission('light-direction');
  assert.equal(second.getState().missions['light-direction'], undefined);
  assert.deepEqual(
    second.getState().missions['photo-review'].observationStepIds,
    ['group-similar-frames']
  );
});

test('a stale store cannot resurrect unrelated missions after clear-all', () => {
  const { storage } = memoryStorage();
  const first = createPracticeStore(storage);
  for (const id of ['light-direction', 'subject-background', 'photo-review']) {
    first.update(id, progress => {
      progress.status = 'completed';
    });
  }
  const second = createPracticeStore(storage);
  second.clearAll();
  first.update('light-direction', progress => {
    progress.prediction.choiceId = 'always-brighter';
  });
  const restored = createPracticeStore(storage).getState();
  assert.deepEqual(Object.keys(restored.missions), ['light-direction']);
  assert.equal(restored.missions['light-direction'].status, 'in-progress');
  assert.equal(restored.missions['light-direction'].prediction.solved, false);
});

test('same-mission operations use the latest state and the last choice wins', () => {
  const { storage } = memoryStorage();
  const first = createPracticeStore(storage);
  const second = createPracticeStore(storage);
  first.update('light-direction', progress => {
    progress.prediction.choiceId = 'left-surfaces-right-shadow';
    progress.observationStepIds.push('compare-model');
  });
  second.update('light-direction', progress => {
    progress.prediction.choiceId = 'always-brighter';
    progress.reflectionCheckIds.push('surface-evidence');
  });
  first.update('light-direction', progress => {
    progress.observationStepIds.push('make-front-photo');
  });
  const mission = second.getState().missions['light-direction'];
  assert.equal(mission.prediction.choiceId, 'always-brighter');
  assert.equal(mission.prediction.solved, false);
  assert.deepEqual(mission.observationStepIds, [
    'compare-model',
    'make-front-photo',
  ]);
  assert.deepEqual(mission.reflectionCheckIds, ['surface-evidence']);
});

test('retry preserves an explicit in-progress marker without a selected answer', () => {
  const { storage } = memoryStorage();
  const store = createPracticeStore(storage);
  store.update('light-direction', progress => {
    progress.prediction.choiceId = 'always-brighter';
    progress.status = 'in-progress';
  });
  store.update('light-direction', progress => {
    progress.prediction.choiceId = undefined;
    progress.status = 'in-progress';
  });
  const restored =
    createPracticeStore(storage).getState().missions['light-direction'];
  assert.equal(restored.status, 'in-progress');
  assert.equal(restored.prediction.choiceId, undefined);
  assert.equal(restored.prediction.solved, false);
});

test('a failed write keeps later operations in memory instead of reloading stale data', () => {
  const { storage, values } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: JSON.stringify(validProgress),
  });
  storage.setItem = () => {
    throw new Error('quota exceeded');
  };
  const store = createPracticeStore(storage);
  store.update('photo-review', progress => {
    progress.observationStepIds.push('group-similar-frames');
  });
  store.update('photo-review', progress => {
    progress.reflectionCheckIds.push('explain-selection');
  });
  assert.equal(store.getNotice(), 'memory');
  const review = store.getState().missions['photo-review'];
  assert.deepEqual(review.observationStepIds, ['group-similar-frames']);
  assert.deepEqual(review.reflectionCheckIds, ['explain-selection']);
  assert.equal(
    store.getState().missions['light-direction'].status,
    'completed'
  );
  assert.equal(values.get(PRACTICE_STORAGE_KEY), JSON.stringify(validProgress));
});

test('an unreadable saved state is never overwritten by a later task update', () => {
  let writes = 0;
  const storage = {
    getItem() {
      throw new Error('read unavailable');
    },
    setItem() {
      writes++;
    },
  } as unknown as Storage;
  const store = createPracticeStore(storage);
  store.update('light-direction', progress => {
    progress.observationStepIds.push('compare-model');
  });
  assert.equal(writes, 0);
  assert.equal(store.getNotice(), 'memory');
  assert.deepEqual(
    store.getState().missions['light-direction'].observationStepIds,
    ['compare-model']
  );
});

test('failed clear-all remains empty in memory and reports unavailable storage', () => {
  const { storage, values } = memoryStorage({
    [PRACTICE_STORAGE_KEY]: JSON.stringify(validProgress),
    hs_theme: 'dark',
  });
  storage.removeItem = () => {
    throw new Error('remove unavailable');
  };
  const store = createPracticeStore(storage);
  store.clearAll();
  assert.deepEqual(store.getState(), emptyPracticeProgress());
  assert.equal(store.getNotice(), 'memory');
  assert.equal(values.get(PRACTICE_STORAGE_KEY), JSON.stringify(validProgress));
  assert.equal(values.get('hs_theme'), 'dark');
});

test('C5 restores its own actions without saving file information and resets independently of C4', () => {
  const { storage } = memoryStorage();
  const store = createPracticeStore(storage);
  store.update('photo-review', p => {
    p.status = 'completed';
  });
  store.update('backup-and-export', p => {
    p.prediction.choiceId = 'retain-backup-export-inspect';
    p.observationStepIds = [
      'retain-and-check-backup',
      'export-for-purpose',
      'inspect-export-locally',
    ];
    p.reflectionCheckIds = [
      'originals-and-recovery',
      'purposeful-export',
      'export-privacy-review',
    ];
    p.status = 'completed';
    Object.assign(p, {
      fileNames: ['private.jpg'],
      gps: [1, 2],
      reflectionText: 'private',
    });
  });
  const restored = createPracticeStore(storage);
  const progress = restored.getState().missions['backup-and-export'];
  assert.equal(progress.prediction.solved, true);
  assert.equal(progress.status, 'completed');
  assert.equal(progress.observationStepIds.length, 3);
  assert.equal(progress.reflectionCheckIds.length, 3);
  for (const key of ['fileNames', 'gps', 'reflectionText'])
    assert.equal(key in progress, false);
  restored.resetMission('backup-and-export');
  assert.equal(restored.getState().missions['backup-and-export'], undefined);
  assert.equal(
    restored.getState().missions['photo-review'].status,
    'completed'
  );
});
