import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const STORAGE_KEY = 'photography-field-guide:practice:v1';
const MISSION = '[data-practice-mission]';

async function capture(call, name) {
  const directory = process.env.PFG_SCREENSHOT_DIR;
  if (!directory) return;
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

async function tap(call, evaluate, selector) {
  const point = await evaluate(`new Promise(resolve => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return resolve(null);
    element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      resolve({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }));
  })`);
  assert.ok(point, `Missing touch target: ${selector}`);
  await call('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y }],
  });
  await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

function savedProgress() {
  return `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '{"version":1,"missions":{}}')`;
}

export async function checkPhotoReview({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  const ready = `${MISSION}[data-mission-id="photo-review"][data-initialized="true"]`;
  const correct = '[data-prediction-choice][value="purpose-and-evidence"]';
  const incorrect = '[data-prediction-choice][value="sharpest-always-wins"]';

  await viewport(1366, 768);
  await navigate('/learn/field-practice/photo-review/');
  assert.ok(
    await evaluate(
      `document.body.textContent.includes('not sample photographs or real EXIF')`
    )
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-review-model] [data-review-frame]').length`
    ),
    6
  );
  await click('a[href$="/practice/photo-review/"]');
  await until(
    `location.pathname === '/practice/photo-review/' && !!document.querySelector('${ready}')`
  );
  await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  await navigate('/practice/photo-review/');
  await until(`!!document.querySelector('${ready}')`);
  assert.equal(
    await evaluate(
      `document.querySelector('[data-direction-control]') === null && document.querySelector('[data-framing-model]') === null && document.querySelector('[data-story-model]') === null`
    ),
    true
  );
  assert.deepEqual(
    await evaluate(
      `[...document.querySelectorAll('[data-review-group]')].map(group => group.dataset.reviewGroup)`
    ),
    ['environment', 'subject', 'detail']
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-review-model] [data-review-frame]').length`
    ),
    6
  );
  const firstScreen = await evaluate(`(() => {
    const goal = document.querySelector('${MISSION} header > div');
    const firstChoice = document.querySelector('[data-prediction-choice]');
    const goalRect = goal.getBoundingClientRect();
    const choiceRect = firstChoice.closest('label').getBoundingClientRect();
    return {
      goalVisible: goalRect.top >= 0 && goalRect.bottom <= innerHeight,
      choiceVisible: choiceRect.top >= 0 && choiceRect.bottom <= innerHeight,
      missionNumber: document.querySelector('${MISSION} header p').textContent,
      nextExists: !!document.querySelector('[data-next-mission]'),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  })()`);
  assert.deepEqual(firstScreen, {
    goalVisible: true,
    choiceVisible: true,
    missionNumber: 'Mission 04 · About 20 minutes',
    nextExists: false,
    overflow: false,
  });
  console.log('OK review lesson, six-frame model, goal, and first action');

  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Choose one prediction')`
  );
  assert.ok(
    await evaluate(`(() => {
      const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    })()`),
    'Review feedback should remain in the current viewport'
  );
  await click(incorrect);
  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Sharpness alone cannot decide') && document.querySelector('[data-retry-answer]')?.hidden === false`
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['photo-review'].prediction.solved`
    ),
    false
  );
  await click('[data-retry-answer]');
  assert.equal(
    await evaluate(
      `document.activeElement === document.querySelector('[data-prediction-choice]')`
    ),
    true
  );
  await click(correct);
  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Editorial fit and technical evidence')`
  );
  await click(`${MISSION} section details:not([data-answer-details]) summary`);
  assert.ok(
    await evaluate(
      `document.querySelector('${MISSION} section details:not([data-answer-details])').open`
    )
  );
  await click('[data-show-answer]');
  assert.ok(
    await evaluate(`document.querySelector('[data-answer-details]').open`)
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['photo-review'].prediction.revealed`
    ),
    true
  );
  console.log('OK review prediction, error, retry, hint, and answer');

  for (const id of [
    'group-similar-frames',
    'compare-purpose-and-technique',
    'plan-next-experiment',
  ])
    await click(`[data-observation-step="${id}"]`);
  for (const id of [
    'explain-selection',
    'review-technical-purpose',
    'choose-next-change',
  ])
    await click(`[data-reflection-check="${id}"]`);
  await click('[data-complete-mission]');
  await until(
    `document.querySelector('[data-mission-status]')?.textContent === 'You marked this mission complete.'`
  );
  const saved = await evaluate(`${savedProgress()}.missions['photo-review']`);
  assert.equal(saved.observationStepIds.length, 3);
  assert.equal(saved.reflectionCheckIds.length, 3);
  assert.deepEqual(Object.keys(saved).sort(), [
    'observationStepIds',
    'prediction',
    'reflectionCheckIds',
    'status',
    'version',
  ]);
  await navigate('/practice/photo-review/');
  await until(`!!document.querySelector('${ready}')`);
  assert.equal(
    await evaluate(`document.querySelector('${correct}').checked`),
    true
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]:checked').length`
    ),
    3
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-reflection-check]:checked').length`
    ),
    3
  );
  console.log('OK local review steps, self-review, completion, and refresh');

  await click('.language-picker summary');
  await until(
    `document.querySelector('a[href="/zh-cn/practice/photo-review/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/practice/photo-review/"]');
  await until(
    `location.pathname === '/zh-cn/practice/photo-review/' && !!document.querySelector('${ready}')`
  );
  assert.equal(await evaluate(`document.documentElement.lang`), 'zh-CN');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    '你已将此任务标记为完成。'
  );
  assert.equal(
    await evaluate(`document.querySelector('${correct}').checked`),
    true
  );
  assert.ok(
    await evaluate(
      `document.body.textContent.includes('阅读《照片筛选与复盘》')`
    )
  );

  // A C4-only reset must retain completed C1, C2, and C3 records.
  for (const id of [
    'light-direction',
    'subject-background',
    'neighborhood-story',
  ]) {
    await navigate(`/practice/${id}/`);
    await until(
      `!!document.querySelector('[data-practice-mission][data-initialized="true"]')`
    );
    await click('[data-complete-mission]');
  }
  await navigate('/zh-cn/practice/photo-review/');
  await until(`!!document.querySelector('${ready}')`);
  await evaluate(`window.confirm = () => false`);
  await click('[data-reset-mission]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    '你已将此任务标记为完成。'
  );
  await evaluate(`window.confirm = () => true`);
  await click('[data-reset-mission]');
  await until(
    `document.querySelector('[data-mission-status]')?.textContent === '尚未开始'`
  );
  assert.equal(
    await evaluate(`${savedProgress()}.missions['photo-review'] === undefined`),
    true
  );
  for (const id of [
    'light-direction',
    'subject-background',
    'neighborhood-story',
  ]) {
    assert.equal(
      await evaluate(`${savedProgress()}.missions['${id}'].status`),
      'completed'
    );
  }
  await navigate('/practice/');
  await until(
    `document.querySelector('[data-practice-index][data-initialized="true"]')`
  );
  const cardStatuses = await evaluate(
    `Object.fromEntries([...document.querySelectorAll('[data-practice-card]')].map(card => [card.dataset.practiceCard, card.querySelector('[data-card-status]').textContent]))`
  );
  assert.deepEqual(cardStatuses, {
    'light-direction': 'Marked complete',
    'subject-background': 'Marked complete',
    'neighborhood-story': 'Marked complete',
    'photo-review': 'Not started',
  });
  console.log('OK review language sharing and C1–C3-preserving reset');

  await navigate('/practice/photo-review/');
  const { identifier: blockedStorageScript } = await call(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked for testing', 'SecurityError'); } });`,
    }
  );
  try {
    await navigate('/practice/photo-review/');
    await until(`!!document.querySelector('${ready}')`);
    assert.ok(
      await evaluate(
        `document.querySelector('[data-storage-notice]').textContent.includes('only for this page visit')`
      )
    );
    await click(correct);
    await click('[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Editorial fit and technical evidence')`
    );
    await click('[data-complete-mission]');
    await until(
      `document.querySelector('[data-mission-status]')?.textContent === 'You marked this mission complete.'`
    );
  } finally {
    await call('Page.removeScriptToEvaluateOnNewDocument', {
      identifier: blockedStorageScript,
    });
  }
  console.log('OK blocked storage on the photo-review mission');

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  try {
    await navigate('/practice/photo-review/');
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('[data-practice-interactive]')].every(element => element.hidden)`
      ),
      true
    );
    assert.equal(
      await evaluate(`document.querySelector('[data-static-choices]').hidden`),
      false
    );
    assert.equal(
      await evaluate(
        `document.querySelector('[data-static-reflection]').hidden`
      ),
      false
    );
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-review-model] [data-review-frame]').length`
      ),
      6
    );
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('A useful review checks both what a photograph means')`
      )
    );
    await navigate('/zh-cn/practice/photo-review/');
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('有用的复盘既检查照片对当前用途表达了什么')`
      )
    );
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('[data-practice-interactive]')].every(element => element.hidden)`
      ),
      true
    );
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
  }
  console.log('OK bilingual no-JavaScript review content and answers');

  await viewport(390, 844);
  await call('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    await navigate('/zh-cn/learn/field-practice/photo-review/');
    await noOverflow('/zh-cn/learn/field-practice/photo-review/');
    await capture(call, 'review-lesson-zh-mobile');
    await navigate('/zh-cn/practice/photo-review/');
    await until(`!!document.querySelector('${ready}')`);
    await noOverflow('/zh-cn/practice/photo-review/');
    await capture(call, 'review-mission-zh-mobile');
    await tap(call, evaluate, `label:has(${correct})`);
    await tap(call, evaluate, '[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('表达适配度与技术证据')`
    );
    assert.ok(
      await evaluate(`(() => {
        const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight;
      })()`),
      'Chinese mobile review feedback should be near the action'
    );
    const label = 'label:has([data-observation-step="group-similar-frames"])';
    assert.ok(
      await evaluate(
        `document.querySelector(${JSON.stringify(label)}).getBoundingClientRect().height >= 44`
      )
    );
    await tap(call, evaluate, label);
    await until(
      `document.querySelector('[data-observation-step="group-similar-frames"]').checked`
    );
    await capture(call, 'review-mission-zh-mobile-feedback');
  } finally {
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  console.log('OK Chinese review touch controls and nearby feedback');

  // A 683 px CSS viewport corresponds to a 1366 px desktop at 200% zoom.
  await viewport(683, 384);
  await navigate('/zh-cn/practice/photo-review/');
  await until(`!!document.querySelector('${ready}')`);
  await noOverflow('/zh-cn/practice/photo-review/ at 200% zoom');
  await click('[data-show-answer]');
  await until(
    `document.querySelector('[data-answer-details]').open && document.activeElement === document.querySelector('[data-answer-details] summary')`
  );
  await capture(call, 'review-mission-zh-zoom-200');

  await viewport(1366, 768);
  await navigate('/learn/field-practice/photo-review/');
  await capture(call, 'review-lesson-en-desktop');
  await navigate('/zh-cn/learn/field-practice/photo-review/');
  await capture(call, 'review-lesson-zh-desktop');
  await navigate('/practice/photo-review/');
  await until(`!!document.querySelector('${ready}')`);
  await capture(call, 'review-mission-en-desktop');
  console.log('OK review 200% viewport and desktop capture paths');
}
