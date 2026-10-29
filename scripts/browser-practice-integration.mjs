import assert from 'node:assert/strict';
import { practiceCatalog } from '../src/data_files/practice-catalog.ts';
import {
  lightweightEditingMission,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
  LIGHTWEIGHT_EDITING_STEP_IDS,
} from '../src/data_files/lightweight-editing-practice.ts';
import {
  missionById,
  missions,
  practiceCopy,
} from '../src/data_files/practice.ts';
import {
  emptyLightweightEditingProgress,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
} from '../src/utils/practice/lightweight-editing-progress.ts';
import {
  emptyMissionProgress,
  PRACTICE_STORAGE_KEY,
} from '../src/utils/practice/progress.ts';

// Existing records must remain readable in their original namespaces.
const SHARED_KEY = 'photography-field-guide:practice:v1';
const EDITING_KEY = 'photography-field-guide:practice:lightweight-editing:v1';
const PREFERENCE_KEY = 'pfg-integration:unrelated-preference';
const PREFERENCE_VALUE = 'keep-this-preference';
const EDITING_ROUTE = '/practice/lightweight-editing/';
const INDEX_READY = '[data-practice-index][data-initialized="true"]';
const EDITING_READY =
  '[data-lightweight-editing-practice][data-initialized="true"]';
const IDS = [
  'light-direction',
  'subject-background',
  'neighborhood-story',
  'photo-review',
  'backup-and-export',
  'lightweight-editing',
];

function sharedReady(id) {
  return `[data-practice-mission][data-mission-id="${id}"][data-initialized="true"]`;
}

function feedbackIs(choiceId, explanation) {
  return `(() => {
    const feedback = document.querySelector('[data-quiz-feedback]');
    return feedback?.dataset.choiceId === ${JSON.stringify(choiceId)} &&
      !feedback.hidden && feedback.textContent === ${JSON.stringify(explanation)};
  })()`;
}

export async function checkPracticeIntegration({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  assert.equal(PRACTICE_STORAGE_KEY, SHARED_KEY);
  assert.equal(LIGHTWEIGHT_EDITING_STORAGE_KEY, EDITING_KEY);
  assert.deepEqual(
    practiceCatalog.map(entry => entry.id),
    IDS
  );
  assert.deepEqual(
    practiceCatalog.map(entry => entry.number),
    [1, 2, 3, 4, 5, 6]
  );

  const lightMission = missionById('light-direction');
  const backupMission = missionById('backup-and-export');
  assert.ok(lightMission && backupMission);
  const sharedRecord = JSON.stringify({
    version: 1,
    missions: {
      'light-direction': {
        ...emptyMissionProgress(lightMission),
        status: 'completed',
      },
      'backup-and-export': {
        ...emptyMissionProgress(backupMission),
        status: 'in-progress',
      },
    },
  });
  const editingRecord = JSON.stringify({
    ...emptyLightweightEditingProgress(),
    status: 'completed',
    prediction: {
      choiceId: lightweightEditingMission.copy.en.prediction.correctChoiceId,
      solved: true,
      revealed: true,
    },
    observationStepIds: [...LIGHTWEIGHT_EDITING_STEP_IDS],
    reflectionCheckIds: [...LIGHTWEIGHT_EDITING_REFLECTION_IDS],
  });

  async function seedExistingRecords() {
    await evaluate(`(() => {
      localStorage.setItem(${JSON.stringify(SHARED_KEY)}, ${JSON.stringify(sharedRecord)});
      localStorage.setItem(${JSON.stringify(EDITING_KEY)}, ${JSON.stringify(editingRecord)});
      localStorage.setItem('hs_theme', 'light');
      localStorage.setItem(${JSON.stringify(PREFERENCE_KEY)}, ${JSON.stringify(PREFERENCE_VALUE)});
    })()`);
  }

  async function assertPreservedPreferences() {
    assert.equal(await evaluate(`localStorage.getItem('hs_theme')`), 'light');
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(PREFERENCE_KEY)})`),
      PREFERENCE_VALUE
    );
  }

  async function cardStatuses() {
    return evaluate(`Object.fromEntries(
      [...document.querySelectorAll('[data-practice-card]')].map(card => [
        card.dataset.practiceCard, card.querySelector('[data-card-status]').textContent,
      ])
    )`);
  }

  async function assertCatalog(locale, statuses) {
    const prefix = locale === 'en' ? '' : '/zh-cn';
    await navigate(`${prefix}/practice/`);
    await until(`!!document.querySelector('${INDEX_READY}')`);
    assert.deepEqual(
      await evaluate(
        `[...document.querySelectorAll('[data-practice-card]')].map(card => card.dataset.practiceCard)`
      ),
      IDS,
      `${locale}: all six catalog cards in order`
    );
    assert.deepEqual(
      await cardStatuses(),
      statuses,
      `${locale}: catalog statuses`
    );
    for (const entry of practiceCatalog) {
      const card = `[data-practice-card="${entry.id}"]`;
      for (const path of [`/practice/${entry.id}/`, entry.articlePath]) {
        assert.equal(
          await evaluate(
            `!!document.querySelector(${JSON.stringify(`${card} a[href="${prefix}${path}"]`)})`
          ),
          true,
          `${locale}/${entry.id}: missing catalog link ${prefix}${path}`
        );
      }
    }
    await noOverflow(`${prefix}/practice/`);
  }

  await viewport(1366, 768);
  await navigate('/practice/');
  await seedExistingRecords();
  for (const locale of ['en', 'zh-cn']) {
    const prefix = locale === 'en' ? '' : '/zh-cn';
    await navigate(`${prefix}/practice/backup-and-export/`);
    await until(
      `!!document.querySelector('${sharedReady('backup-and-export')}')`
    );
    assert.equal(
      await evaluate(
        `document.querySelector('[data-next-mission]')?.getAttribute('href')`
      ),
      `${prefix}${EDITING_ROUTE}`,
      `${locale}: C5 continues to the existing C6 route`
    );
    await click('[data-next-mission]');
    await until(
      `location.pathname === ${JSON.stringify(`${prefix}${EDITING_ROUTE}`)} && !!document.querySelector('${EDITING_READY}')`
    );
    assert.equal(
      await evaluate(
        `document.querySelector('[data-mission-status]').textContent`
      ),
      locale === 'en' ? 'Review completed' : '复盘已完成'
    );
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-observation-step]:checked, [data-reflection-check]:checked').length`
      ),
      6,
      `${locale}: the complete version-1 C6 record restores all evidence`
    );
    const copy = practiceCopy[locale];
    await assertCatalog(locale, {
      'light-direction': copy.completed,
      'subject-background': copy.notStarted,
      'neighborhood-story': copy.notStarted,
      'photo-review': copy.notStarted,
      'backup-and-export': copy.inProgress,
      'lightweight-editing': copy.completed,
    });
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
      editingRecord,
      `${locale}: visiting the catalog must preserve the dedicated record exactly`
    );
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
      sharedRecord,
      `${locale}: visiting the catalog must preserve shared progress exactly`
    );
  }
  console.log(
    'OK bilingual C5 → existing C6, six catalog cards, and original-key progress restoration'
  );

  await navigate(EDITING_ROUTE);
  await until(`!!document.querySelector('${EDITING_READY}')`);
  await click(`[data-observation-step="${LIGHTWEIGHT_EDITING_STEP_IDS[0]}"]`);
  await until(
    `document.querySelector('[data-mission-status]').textContent === 'In progress'`
  );
  await assertCatalog('en', {
    'light-direction': practiceCopy.en.completed,
    'subject-background': practiceCopy.en.notStarted,
    'neighborhood-story': practiceCopy.en.notStarted,
    'photo-review': practiceCopy.en.notStarted,
    'backup-and-export': practiceCopy.en.inProgress,
    'lightweight-editing': practiceCopy.en.inProgress,
  });
  assert.equal(
    await evaluate(
      `JSON.parse(localStorage.getItem(${JSON.stringify(EDITING_KEY)})).status`
    ),
    'in-progress',
    'Removing completed C6 evidence updates the original dedicated record'
  );
  await navigate(EDITING_ROUTE);
  await until(`!!document.querySelector('${EDITING_READY}')`);
  await evaluate('window.confirm = () => true');
  await click('[data-reset-mission]');
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
    null
  );
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
    sharedRecord,
    'C6 reset must preserve every shared task record'
  );
  await assertPreservedPreferences();
  console.log(
    'OK C6 evidence removal updates catalog status and C6-only reset preserves shared progress'
  );

  for (const locale of ['en', 'zh-cn']) {
    await seedExistingRecords();
    const copy = practiceCopy[locale];
    const prefix = locale === 'en' ? '' : '/zh-cn';
    await navigate(`${prefix}/practice/`);
    await until(`!!document.querySelector('${INDEX_READY}')`);
    await evaluate('window.confirm = () => true');
    await click('[data-clear-all]');
    for (const key of [SHARED_KEY, EDITING_KEY]) {
      assert.equal(
        await evaluate(`localStorage.getItem(${JSON.stringify(key)})`),
        null,
        `${locale}: clear all must remove the exact key ${key}`
      );
    }
    await assertPreservedPreferences();
    const emptyStatuses = Object.fromEntries(
      IDS.map(id => [id, copy.notStarted])
    );
    assert.deepEqual(await cardStatuses(), emptyStatuses);
    assert.equal(
      await evaluate(
        `document.querySelector('[data-clear-feedback]').textContent`
      ),
      copy.cleared
    );
    await assertCatalog(locale, emptyStatuses);
    await assertPreservedPreferences();
  }
  console.log(
    'OK bilingual clear-all removes both exact progress keys and preserves unrelated preferences after reload'
  );

  for (const locale of ['en', 'zh-cn']) {
    const prefix = locale === 'en' ? '' : '/zh-cn';
    for (const mission of missions) {
      const path = `${prefix}/practice/${mission.id}/`;
      const ready = sharedReady(mission.id);
      await navigate(path);
      await until(`!!document.querySelector('${ready}')`);
      for (const choice of mission.copy[locale].prediction.choices) {
        assert.ok(
          choice.explanation?.trim(),
          `${locale}/${mission.id}/${choice.id}: explanation`
        );
        const selector = `[data-prediction-choice][value="${choice.id}"]`;
        await click(selector);
        await click('[data-check-answer]');
        await until(feedbackIs(choice.id, choice.explanation.trim()));
        const savedExpression = `JSON.parse(localStorage.getItem(${JSON.stringify(SHARED_KEY)})).missions[${JSON.stringify(mission.id)}].prediction`;
        const expectedPrediction = {
          choiceId: choice.id,
          solved: choice.id === mission.copy[locale].prediction.correctChoiceId,
          revealed: false,
        };
        assert.deepEqual(
          await evaluate(savedExpression),
          expectedPrediction,
          `${locale}/${mission.id}/${choice.id}: submitted choice and derived correctness`
        );
        const previousTimeOrigin = await evaluate('performance.timeOrigin');
        await call('Page.reload', { ignoreCache: true });
        await until(
          `performance.timeOrigin !== ${JSON.stringify(previousTimeOrigin)} && document.readyState === 'complete' && !!document.querySelector('${ready}')`
        );
        await until(feedbackIs(choice.id, choice.explanation.trim()));
        assert.equal(
          await evaluate(
            `document.querySelector(${JSON.stringify(selector)}).checked`
          ),
          true,
          `${locale}/${mission.id}/${choice.id}: selected ID survives reload`
        );
        assert.deepEqual(await evaluate(savedExpression), expectedPrediction);
        assert.equal(
          await evaluate(
            `localStorage.getItem(${JSON.stringify(EDITING_KEY)})`
          ),
          null,
          'Shared prediction feedback must not create or modify dedicated C6 progress'
        );
      }
    }
  }
  console.log(
    'OK all 30 C1–C5 localized choice explanations match their IDs before and after reload'
  );

  await viewport(390, 844);
  for (const path of ['/practice/', '/zh-cn/practice/']) {
    await navigate(path);
    await until(`!!document.querySelector('${INDEX_READY}')`);
    await noOverflow(path);
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-practice-card]').length`
      ),
      6
    );
  }
  await viewport(683, 384);
  await noOverflow('six-card practice catalog at 200% equivalent viewport');
  await assertPreservedPreferences();
  await viewport(1366, 768);
  console.log('OK six-card catalog mobile and narrow layouts');
}
