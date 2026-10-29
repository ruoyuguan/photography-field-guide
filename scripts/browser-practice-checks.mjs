import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

const STORAGE_KEY = 'photography-field-guide:practice:v1';
const MISSION = '[data-practice-mission]';

async function arrowRight(call, evaluate, selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  for (const type of ['keyDown', 'keyUp'])
    await call('Input.dispatchKeyEvent', {
      type,
      key: 'ArrowRight',
      code: 'ArrowRight',
      windowsVirtualKeyCode: 39,
      nativeVirtualKeyCode: 39,
    });
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

export async function checkPractice({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  const ready = `${MISSION}[data-initialized="true"]`;
  const correct =
    '[data-prediction-choice][value="left-surfaces-right-shadow"]';
  const incorrect = '[data-prediction-choice][value="longer-focal-length"]';

  await viewport(1366, 768);
  await navigate('/practice/');
  await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  await click('a[href="/practice/light-direction/"]');
  await until(
    `location.pathname === '/practice/light-direction/' && !!document.querySelector('${ready}')`
  );
  const firstScreen = await evaluate(`(() => {
    const goal = document.querySelector('${MISSION} header > div');
    const firstChoice = document.querySelector('[data-prediction-choice]');
    const goalRect = goal.getBoundingClientRect();
    const choiceRect = firstChoice.closest('label').getBoundingClientRect();
    return {
      goalVisible: goalRect.top >= 0 && goalRect.bottom <= innerHeight,
      choiceVisible: choiceRect.top >= 0 && choiceRect.bottom <= innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  })()`);
  assert.deepEqual(firstScreen, {
    goalVisible: true,
    choiceVisible: true,
    overflow: false,
  });
  console.log('OK mission goal and first action are visible at 1366×768');

  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Choose one prediction')`
  );
  assert.ok(
    await evaluate(`(() => {
      const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    })()`),
    'Prediction feedback should remain in the current viewport'
  );
  await click(incorrect);
  await until(`document.querySelector('${incorrect}').checked`);
  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Changing direction does not change the lens') && document.querySelector('[data-retry-answer]')?.hidden === false`
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['light-direction'].prediction.solved`
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
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-prediction-choice]:checked').length`
    ),
    0
  );
  await click(correct);
  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('different set of surfaces')`
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['light-direction'].prediction.solved`
    ),
    true
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
      `document.activeElement === document.querySelector('[data-answer-details] summary')`
    ),
    true
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['light-direction'].prediction.revealed`
    ),
    true
  );
  console.log(
    'OK prediction, error, retry, correct feedback, hint, and answer'
  );

  await arrowRight(call, evaluate, '[data-direction-control]');
  await until(
    `document.querySelector('${MISSION}').dataset.direction === 'side'`
  );
  const direction = await evaluate(`({
    value: document.querySelector('[data-direction-control]').value,
    spoken: document.querySelector('[data-direction-control]').getAttribute('aria-valuetext'),
    label: document.querySelector('[data-direction-label]').textContent,
    description: document.querySelector('[data-direction-description]').textContent,
  })`);
  assert.equal(direction.value, '1');
  assert.equal(direction.spoken, 'Light from camera-left');
  assert.equal(direction.label, 'Light from camera-left');
  assert.ok(direction.description.includes('camera-right'));
  console.log('OK keyboard direction slider, accessible value, and model text');

  for (const id of ['compare-model', 'make-front-photo', 'make-side-photo'])
    await click(`[data-observation-step="${id}"]`);
  for (const id of [
    'surface-evidence',
    'shadow-evidence',
    'controlled-variables',
  ])
    await click(`[data-reflection-check="${id}"]`);
  await click('[data-complete-mission]');
  await until(
    `document.querySelector('[data-mission-status]')?.textContent === 'You marked this mission complete.'`
  );
  const saved = await evaluate(
    `${savedProgress()}.missions['light-direction']`
  );
  assert.equal(saved.status, 'completed');
  assert.equal(saved.observationStepIds.length, 3);
  assert.equal(saved.reflectionCheckIds.length, 3);
  assert.deepEqual(Object.keys(saved).sort(), [
    'observationStepIds',
    'prediction',
    'reflectionCheckIds',
    'status',
    'version',
  ]);

  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${ready}')`);
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    'You marked this mission complete.'
  );
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
  assert.ok(
    await evaluate(`document.querySelector('[data-answer-details]').open`)
  );
  console.log(
    'OK observation, self-review, completion, and refresh persistence'
  );

  await click('.language-picker summary');
  await until(
    `document.querySelector('a[href="/zh-cn/practice/light-direction/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/practice/light-direction/"]');
  await until(
    `location.pathname === '/zh-cn/practice/light-direction/' && !!document.querySelector('${ready}')`
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
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-reflection-check]:checked').length`
    ),
    3
  );
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
    await evaluate(
      `document.activeElement.hasAttribute('data-prediction-heading')`
    ),
    true
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-prediction-choice]:checked').length`
    ),
    0
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['light-direction'] === undefined`
    ),
    true
  );
  console.log(
    'OK deep-language shared progress and guarded single-mission reset'
  );

  await evaluate(`localStorage.setItem('hs_theme', 'dark')`);
  await click('[data-complete-mission]');
  await navigate('/practice/');
  await until(
    `document.querySelector('[data-practice-index][data-initialized="true"]')`
  );
  assert.equal(
    await evaluate(`document.querySelector('[data-card-status]').textContent`),
    'Marked complete'
  );
  await evaluate(`window.confirm = () => true`);
  await click('[data-clear-all]');
  await until(
    `document.querySelector('[data-card-status]')?.textContent === 'Not started'`
  );
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`),
    null
  );
  assert.equal(await evaluate(`localStorage.getItem('hs_theme')`), 'dark');
  assert.ok(
    await evaluate(
      `document.querySelector('[data-clear-feedback]').textContent.includes('cleared')`
    )
  );
  console.log(
    'OK clear-all removes only practice data and preserves the theme'
  );

  const invalidStates = [
    '{bad json',
    JSON.stringify({ version: 0, missions: {} }),
    JSON.stringify({
      version: 1,
      missions: {
        'unknown-mission': { version: 1, status: 'completed' },
        'light-direction': {
          version: 1,
          status: 'nonsense',
          prediction: { choiceId: 'unknown-choice', solved: true },
          observationStepIds: ['unknown-step'],
          reflectionCheckIds: [],
        },
      },
    }),
  ];
  await navigate('/practice/light-direction/');
  for (const raw of invalidStates) {
    await evaluate(
      `localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(raw)})`
    );
    await navigate('/practice/light-direction/');
    await until(`!!document.querySelector('${ready}')`);
    assert.equal(
      await evaluate(
        `document.querySelector('[data-mission-status]').textContent`
      ),
      'Not started'
    );
    assert.ok(
      await evaluate(
        `document.querySelector('[data-storage-notice]').textContent.includes('reset safely')`
      )
    );
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-prediction-choice]:checked').length`
      ),
      0
    );
    assert.equal(await evaluate(`localStorage.getItem('hs_theme')`), 'dark');
  }
  await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  console.log('OK corrupt JSON, old versions, unknown IDs, and forged states');

  await navigate('/practice/light-direction/');
  const { identifier: blockedStorageScript } = await call(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked for testing', 'SecurityError'); } });`,
    }
  );
  try {
    await navigate('/practice/light-direction/');
    await until(`!!document.querySelector('${ready}')`);
    assert.ok(
      await evaluate(
        `document.querySelector('[data-storage-notice]').textContent.includes('only for this page visit')`
      )
    );
    await click(correct);
    await click('[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('different set of surfaces')`
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
  console.log('OK blocked storage retains a usable in-memory mission');

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  try {
    await navigate('/practice/light-direction/');
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
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('With the camera and object fixed')`
      )
    );
    assert.ok(
      await evaluate(`document.body.textContent.includes('Your goal')`)
    );
    await navigate('/practice/');
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('[data-practice-interactive]')].every(element => element.hidden)`
      ),
      true
    );
    assert.equal(
      await evaluate(
        `document.querySelector('a[href="/practice/light-direction/"]').getBoundingClientRect().width > 0`
      ),
      true
    );
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
  }
  console.log('OK no-JavaScript lesson, mission, answers, and navigation');

  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${ready}')`);
  await evaluate(`(() => {
    const original = document.querySelector('${MISSION}');
    const clone = original.cloneNode(true);
    clone.dataset.initialized = 'false';
    clone.dataset.testClone = 'true';
    original.after(clone);
    document.dispatchEvent(new Event('astro:page-load'));
  })()`);
  await until(`document.querySelectorAll('${ready}').length === 2`);
  await evaluate(`(() => {
    const roots = document.querySelectorAll('${MISSION}');
    const slider = roots[1].querySelector('[data-direction-control]');
    slider.value = '1';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  assert.equal(
    await evaluate(
      `document.querySelectorAll('${MISSION}')[0].dataset.direction`
    ),
    'front'
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('${MISSION}')[1].dataset.direction`
    ),
    'side'
  );
  await evaluate(`document.querySelector('[data-test-clone]').remove()`);
  console.log(
    'OK independent direction controls in multiple initialized instances'
  );

  await viewport(390, 844);
  await call('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    await navigate('/zh-cn/practice/light-direction/');
    await until(`!!document.querySelector('${ready}')`);
    await noOverflow('/zh-cn/practice/light-direction/');
    await capture(call, 'mission-zh-mobile');
    await tap(call, evaluate, `label:has(${correct})`);
    await tap(call, evaluate, '[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('另一组表面')`
    );
    const mobileFeedback = await evaluate(`(() => {
      const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: innerHeight,
        scrollY,
        visible: rect.top >= 0 && rect.bottom <= innerHeight,
      };
    })()`);
    assert.ok(
      mobileFeedback.visible,
      `Mobile feedback should be near the action: ${JSON.stringify(mobileFeedback)}`
    );
    const label = 'label:has([data-observation-step="compare-model"])';
    assert.ok(
      await evaluate(
        `document.querySelector(${JSON.stringify(label)}).getBoundingClientRect().height >= 44`
      )
    );
    await tap(call, evaluate, label);
    await until(
      `document.querySelector('[data-observation-step="compare-model"]').checked`
    );
    await capture(call, 'mission-zh-mobile-feedback');
  } finally {
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  console.log('OK Chinese touch controls and nearby feedback at 390×844');

  // A 683 px CSS viewport corresponds to a 1366 px desktop at 200% zoom.
  // Use ordinary pointer and keyboard paths rather than pinch-zoom coordinates.
  await viewport(683, 384);
  await navigate('/zh-cn/practice/light-direction/');
  await until(`!!document.querySelector('${ready}')`);
  await noOverflow('/zh-cn/practice/light-direction/ at 200% zoom');
  await click('[data-show-answer]');
  await until(
    `document.querySelector('[data-answer-details]').open && document.activeElement === document.querySelector('[data-answer-details] summary')`
  );
  await capture(call, 'mission-zh-zoom-200');
  console.log('OK answer reveal, focus, and layout at a 200% desktop viewport');

  await viewport(1366, 768);
  await navigate('/learn/composition/understanding-light/');
  await capture(call, 'lesson-en-desktop');
  await navigate('/zh-cn/learn/composition/understanding-light/');
  await capture(call, 'lesson-zh-desktop');
  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${ready}')`);
  await capture(call, 'mission-en-desktop');
}
