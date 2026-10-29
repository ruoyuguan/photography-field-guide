import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { practiceCatalog } from '../src/data_files/practice-catalog.ts';
import { missions } from '../src/data_files/practice.ts';
import {
  lightweightEditingMission,
  LIGHTWEIGHT_EDITING_REFLECTION_IDS,
  LIGHTWEIGHT_EDITING_STEP_IDS,
} from '../src/data_files/lightweight-editing-practice.ts';
import {
  emptyLightweightEditingProgress,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
} from '../src/utils/practice/lightweight-editing-progress.ts';
import {
  emptyMissionProgress,
  PRACTICE_STORAGE_KEY,
} from '../src/utils/practice/progress.ts';

const INDEX_READY = '[data-practice-index][data-initialized="true"]';
const SHARED_KEY = 'photography-field-guide:practice:v1';
const EDITING_KEY = 'photography-field-guide:practice:lightweight-editing:v1';
const PREFERENCE_KEY = 'pfg-learning-paths:unrelated-preference';
const PREFERENCE_VALUE = 'preserve-without-migration';
const IDS = [
  'light-direction',
  'subject-background',
  'neighborhood-story',
  'photo-review',
  'backup-and-export',
  'lightweight-editing',
];
const START_ROUTES = {
  beginner: '/learn/getting-started/what-is-photography/',
  shoot: '/practice/light-direction/',
  review: '/practice/photo-review/',
};

function sharedRecord(statuses) {
  return JSON.stringify({
    version: 1,
    missions: Object.fromEntries(
      missions
        .filter(mission => statuses[mission.id])
        .map(mission => [
          mission.id,
          {
            ...emptyMissionProgress(mission),
            status: statuses[mission.id],
            ...(statuses[mission.id] === 'completed'
              ? {
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
                }
              : {}),
          },
        ])
    ),
  });
}

function editingRecord(status) {
  return JSON.stringify({
    ...emptyLightweightEditingProgress(),
    status,
    ...(status === 'completed'
      ? {
          prediction: {
            choiceId:
              lightweightEditingMission.copy.en.prediction.correctChoiceId,
            solved: true,
            revealed: true,
          },
          observationStepIds: [...LIGHTWEIGHT_EDITING_STEP_IDS],
          reflectionCheckIds: [...LIGHTWEIGHT_EDITING_REFLECTION_IDS],
        }
      : {}),
  });
}

async function capture(call, evaluate, name, selector) {
  const directory = process.env.PFG_SCREENSHOT_DIR;
  if (!directory) return;
  if (selector)
    await evaluate(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      const header = document.querySelector('header.sticky');
      window.scrollBy({ top: -(header?.getBoundingClientRect().bottom ?? 96) - 16, behavior: 'instant' });
    })()`);
  await evaluate(`(async () => {
    let deadline;
    const target = document.querySelector(${JSON.stringify(selector ?? 'body')});
    const animations = document.getAnimations().filter(animation => {
      const element = animation.effect?.target;
      const timing = animation.effect?.getTiming();
      return element instanceof Element && target?.contains(element) &&
        animation.playState === 'running' && Number.isFinite(timing?.iterations) &&
        Number.isFinite(timing?.duration);
    });
    try {
      await Promise.race([
        Promise.all([document.fonts.ready, ...animations.map(animation => animation.finished.catch(() => {}))]),
        new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Screenshot region did not settle: ' + JSON.stringify(animations.map(animation => ({ target: animation.effect.target.tagName, state: animation.playState, pending: animation.pending }))))), 3000); }),
      ]);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    } finally {
      clearTimeout(deadline);
    }
  })()`);
  await mkdir(directory, { recursive: true });
  const { data } = await call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  await writeFile(
    resolve(directory, `${name}.png`),
    Buffer.from(data, 'base64')
  );
}

/** Checks reader journeys through the existing routes; not a human study. */
export async function checkLearningPaths({
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

  await viewport(1366, 768);
  await navigate('/practice/');
  await until(`!!document.querySelector('${INDEX_READY}')`);
  const retainedKeys = [SHARED_KEY, EDITING_KEY, PREFERENCE_KEY, 'hs_theme'];
  const original = await evaluate(`Object.fromEntries(
    ${JSON.stringify(retainedKeys)}.map(key => [key, localStorage.getItem(key)])
  )`);

  async function setRecords(shared = null, editing = null) {
    await evaluate(`(() => {
      for (const [key, value] of ${JSON.stringify([
        [SHARED_KEY, shared],
        [EDITING_KEY, editing],
      ])}) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
      localStorage.setItem(${JSON.stringify(PREFERENCE_KEY)}, ${JSON.stringify(PREFERENCE_VALUE)});
    })()`);
  }

  async function assertSuggestion(kind, id, completed, prefix = '') {
    await until(`(() => {
      const panel = document.querySelector('[data-practice-suggestion]');
      return !!document.querySelector('${INDEX_READY}') && panel && !panel.hidden &&
        panel.dataset.suggestionKind === ${JSON.stringify(kind)} &&
        panel.dataset.missionId === ${JSON.stringify(id)};
    })()`);
    assert.equal(
      await evaluate(
        `document.querySelector('[data-suggestion-link]').getAttribute('href')`
      ),
      `${prefix}/practice/${id}/`,
      `${prefix}: the suggested link must reach the selected task`
    );
    assert.deepEqual(
      await evaluate(
        `[...document.querySelector('[data-practice-summary]').textContent.matchAll(/[0-9]+/g)].map(match => Number(match[0]))`
      ),
      [completed, 6],
      `${prefix}: summary counts the actual known task checklists`
    );
    assert.ok(
      await evaluate(
        `document.querySelector('[data-suggestion-title]').textContent.trim().length > 0 && document.querySelector('[data-suggestion-reason]').textContent.trim().length > 0`
      ),
      `${prefix}: a suggestion needs an explanation, not only a destination`
    );
  }

  async function enter(selector) {
    await evaluate(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      target.scrollIntoView({ behavior: 'instant', block: 'center' });
      target.focus({ preventScroll: true });
    })()`);
    for (const type of ['keyDown', 'keyUp'])
      await call('Input.dispatchKeyEvent', {
        type,
        key: 'Enter',
        code: 'Enter',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
      });
  }

  async function assertAnchorTarget(id) {
    await until(
      `location.hash === ${JSON.stringify(`#${id}`)} && document.activeElement?.id === ${JSON.stringify(id)}`
    );
    await until(`(() => {
      const target = document.getElementById(${JSON.stringify(id)});
      const rect = target.getBoundingClientRect();
      const heading = target.querySelector('h2')?.getBoundingClientRect() ?? rect;
      const headerBottom = document.querySelector('header.sticky')?.getBoundingClientRect().bottom ?? 0;
      return rect.top >= headerBottom + 4 && heading.top < innerHeight - 16;
    })()`);
  }

  async function assertStarters(prefix, path) {
    await navigate(path);
    assert.deepEqual(
      await evaluate(
        `[...document.querySelectorAll('[data-learning-starts] [data-start-route]')].map(card => card.dataset.startRoute)`
      ),
      Object.keys(START_ROUTES),
      `${path}: the same three reader intents are available`
    );
    for (const [id, target] of Object.entries(START_ROUTES)) {
      assert.equal(
        await evaluate(
          `document.querySelector('[data-start-route="${id}"] [data-start-link]').getAttribute('href')`
        ),
        `${prefix}${target}`,
        `${path}: ${id} route preserves the current language`
      );
    }
    await noOverflow(path);
  }

  try {
    await setRecords();
    for (const prefix of ['', '/zh-cn']) {
      for (const path of [`${prefix}/`, `${prefix}/learn/`]) {
        await assertStarters(prefix, path);
        await enter('[data-start-route="review"] [data-start-link]');
        await until(
          `location.pathname === ${JSON.stringify(`${prefix}${START_ROUTES.review}`)}`
        );
        await assertStarters(prefix, path);
        await click('[data-start-route="shoot"] [data-start-link]');
        await until(
          `location.pathname === ${JSON.stringify(`${prefix}${START_ROUTES.shoot}`)}`
        );
      }
      await navigate(`${prefix}/practice/`);
      await assertSuggestion('start', IDS[0], 0, prefix);
      assert.deepEqual(
        await evaluate(
          `[...document.querySelectorAll('[data-mission-jump]')].map(link => link.getAttribute('href'))`
        ),
        IDS.map(id => `#mission-${id}`)
      );
      assert.equal(
        await evaluate(
          `document.querySelector('[data-practice-map]').tabIndex`
        ),
        -1
      );
      await enter('[data-mission-jump][href="#mission-lightweight-editing"]');
      await assertAnchorTarget('mission-lightweight-editing');
      await enter(
        '[data-practice-card="lightweight-editing"] [data-return-map]'
      );
      await assertAnchorTarget('practice-map');
    }
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
      null
    );
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
      null
    );
    console.log(
      'OK bilingual Home/Learn intent links, new-photo and existing-photo journeys, native mission-map keyboard anchors'
    );

    const partial = sharedRecord({
      'light-direction': 'completed',
      'neighborhood-story': 'completed',
    });
    await setRecords(partial);
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/practice/`);
      await assertSuggestion('next', 'subject-background', 2, prefix);
      assert.equal(
        await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
        partial
      );
    }
    const active = sharedRecord({
      'light-direction': 'completed',
      'photo-review': 'completed',
      'backup-and-export': 'in-progress',
    });
    const editingActive = editingRecord('in-progress');
    await setRecords(active, editingActive);
    await navigate('/practice/');
    await assertSuggestion('continue', 'backup-and-export', 2);
    await navigate('/practice/');
    await assertSuggestion('continue', 'backup-and-export', 2);
    await click('.language-picker summary');
    await click('a[href="/zh-cn/practice/"]');
    await assertSuggestion('continue', 'backup-and-export', 2, '/zh-cn');
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
      active
    );
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
      editingActive
    );

    const allShared = sharedRecord(
      Object.fromEntries(missions.map(mission => [mission.id, 'completed']))
    );
    await setRecords(allShared, editingActive);
    await navigate('/practice/');
    await assertSuggestion('continue', 'lightweight-editing', 5);
    await click('[data-suggestion-link]');
    await until(
      `location.pathname === '/practice/lightweight-editing/' && document.querySelector('[data-lightweight-editing-practice]')?.dataset.initialized === 'true'`
    );
    await enter('[data-mission-navigation] [data-return-directory]');
    await until(`!!document.querySelector('${INDEX_READY}')`);
    await assertAnchorTarget('mission-lightweight-editing');
    await assertSuggestion('continue', 'lightweight-editing', 5);
    console.log(
      'OK browser-based start/next/continue suggestions, curriculum precedence, refresh, real language switch, and dedicated C6 continuation without storage migration'
    );

    const completeEditing = editingRecord('completed');
    await setRecords(allShared, completeEditing);
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/practice/`);
      await assertSuggestion('revisit', 'light-direction', 6, prefix);
      assert.equal(
        await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
        allShared
      );
      assert.equal(
        await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
        completeEditing
      );
    }
    await evaluate(`window.confirm = () => true`);
    await click('[data-clear-all]');
    await assertSuggestion('start', 'light-direction', 0, '/zh-cn');
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
      null
    );
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(EDITING_KEY)})`),
      null
    );
    assert.equal(
      await evaluate(`localStorage.getItem(${JSON.stringify(PREFERENCE_KEY)})`),
      PREFERENCE_VALUE
    );
    console.log(
      'OK complete checklists invite revisiting, exact two-key clearing refreshes suggestions, unrelated preferences remain'
    );

    for (const prefix of ['', '/zh-cn']) {
      for (const [index, entry] of practiceCatalog.entries()) {
        await navigate(`${prefix}/practice/${entry.id}/`);
        const navigation = '[data-mission-navigation]';
        assert.equal(
          await evaluate(
            `document.querySelector('${navigation} [data-return-lesson]').getAttribute('href')`
          ),
          `${prefix}${entry.articlePath}`
        );
        assert.equal(
          await evaluate(
            `document.querySelector('${navigation} [data-return-directory]').getAttribute('href')`
          ),
          `${prefix}/practice/#mission-${entry.id}`
        );
        const nextPath =
          index < practiceCatalog.length - 1
            ? `${prefix}/practice/${practiceCatalog[index + 1].id}/`
            : null;
        assert.equal(
          await evaluate(
            `document.querySelector('${navigation} [data-next-mission]')?.getAttribute('href') ?? null`
          ),
          nextPath
        );
        await noOverflow(`${prefix}/practice/${entry.id}/ navigation`);
        if (entry.id === 'lightweight-editing') {
          assert.equal(
            await evaluate(
              `document.querySelector('${navigation} [data-revisit-lesson]').getAttribute('href')`
            ),
            `${prefix}/learn/workflow/backup-and-export/`
          );
          await enter(`${navigation} [data-return-directory]`);
          await until(`!!document.querySelector('${INDEX_READY}')`);
          await assertAnchorTarget('mission-lightweight-editing');
        }
      }
    }
    console.log(
      'OK all six bilingual task endings retain their lesson, contextual directory return, and suggested continuation'
    );

    await viewport(390, 844);
    await navigate('/zh-cn/');
    await noOverflow('/zh-cn/ learning starts mobile');
    assert.equal(
      await evaluate(
        `document.querySelector('[data-learning-starts]').getBoundingClientRect().top < document.querySelector('[data-sensor-diagram]').getBoundingClientRect().top`
      ),
      true,
      'Reader choices must precede the sensor illustration on mobile'
    );
    await capture(
      call,
      evaluate,
      'learning-starts-zh-390x844',
      '[data-learning-starts]'
    );
    await navigate('/zh-cn/practice/');
    await until(`!!document.querySelector('${INDEX_READY}')`);
    await click('[data-main-menu] > summary');
    if (
      !(await evaluate(`document.documentElement.classList.contains('dark')`))
    )
      await click('[data-hs-theme-click-value="dark"]');
    await until(`document.documentElement.classList.contains('dark')`);
    if (await evaluate(`document.querySelector('[data-main-menu]').open`))
      await click('[data-main-menu] > summary');
    await noOverflow('/zh-cn/practice/ dark mobile');
    await capture(
      call,
      evaluate,
      'practice-map-zh-dark-390x844',
      '[data-practice-map]'
    );
    await enter('[data-mission-jump][href="#mission-photo-review"]');
    await assertAnchorTarget('mission-photo-review');
    await enter('[data-practice-card="photo-review"] [data-return-map]');
    await assertAnchorTarget('practice-map');
    for (const [width, height] of [
      [320, 640],
      [683, 384],
    ]) {
      await viewport(width, height);
      for (const path of ['/zh-cn/', '/zh-cn/learn/', '/zh-cn/practice/']) {
        await navigate(path);
        await noOverflow(`${path} at ${width}x${height}`);
      }
    }
    console.log(
      'OK intent choices precede mobile illustration; actual dark mission map, keyboard anchors, narrow and 200%-equivalent viewports'
    );

    await call('Emulation.setScriptExecutionDisabled', { value: true });
    try {
      await viewport(1366, 768);
      for (const prefix of ['', '/zh-cn']) {
        for (const path of [`${prefix}/`, `${prefix}/learn/`]) {
          await assertStarters(prefix, path);
          assert.equal(
            await evaluate(
              `[...document.querySelectorAll('[data-start-link]')].every(link => link.getBoundingClientRect().width > 0)`
            ),
            true
          );
        }
        await navigate(`${prefix}/practice/`);
        assert.equal(
          await evaluate(
            `document.querySelector('[data-practice-suggestion]').hidden`
          ),
          true
        );
        assert.equal(
          await evaluate(
            `document.querySelector('[data-practice-map]').getBoundingClientRect().width > 0`
          ),
          true
        );
        assert.equal(
          await evaluate(
            `[...document.querySelectorAll('[data-practice-card]')].every(card => card.getBoundingClientRect().width > 0)`
          ),
          true
        );
        await enter('[data-mission-jump][href="#mission-lightweight-editing"]');
        await assertAnchorTarget('mission-lightweight-editing');
        await enter(
          '[data-practice-card="lightweight-editing"] [data-return-map]'
        );
        await assertAnchorTarget('practice-map');
        await noOverflow(`${prefix}/practice/ without JavaScript`);
      }
    } finally {
      await call('Emulation.setScriptExecutionDisabled', { value: false });
    }
    console.log(
      'OK bilingual starter choices and six-task route map remain native and readable without JavaScript; saved-progress suggestion stays hidden'
    );

    await viewport(1366, 768);
    await navigate('/practice/');
    await until(`!!document.querySelector('${INDEX_READY}')`);
    await capture(
      call,
      evaluate,
      'practice-overview-en-1366x768',
      '[data-practice-suggestion]'
    );
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
    await viewport(1366, 768);
    await navigate('/practice/');
    await evaluate(`(() => {
      for (const [key, value] of Object.entries(${JSON.stringify(original)})) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
    })()`);
    await navigate('/practice/');
    await until(`!!document.querySelector('${INDEX_READY}')`);
  }
}
