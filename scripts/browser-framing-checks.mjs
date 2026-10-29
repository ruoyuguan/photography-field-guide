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

export async function checkFraming({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  const ready = `${MISSION}[data-mission-id="subject-background"][data-initialized="true"]`;
  const correct = '[data-prediction-choice][value="relative-alignment"]';
  const incorrect = '[data-prediction-choice][value="better-by-rule"]';

  await viewport(1366, 768);
  await navigate('/learn/composition/subject-and-background/');
  assert.ok(
    await evaluate(
      `document.body.textContent.includes('Concept only: not an exact perspective simulation')`
    )
  );
  await click('a[href$="/practice/subject-background/"]');
  await until(
    `location.pathname === '/practice/subject-background/' && !!document.querySelector('${ready}')`
  );
  await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  await navigate('/practice/subject-background/');
  await until(`!!document.querySelector('${ready}')`);
  assert.equal(
    await evaluate(
      `document.querySelector('[data-direction-control]') === null`
    ),
    true
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-framing-model] figure').length`
    ),
    2
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
    missionNumber: 'Mission 02 · About 20 minutes',
    nextExists: true,
    overflow: false,
  });
  console.log('OK framing lesson, model branch, goal, and first action');

  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('Choose one prediction')`
  );
  assert.ok(
    await evaluate(`(() => {
      const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    })()`),
    'Framing feedback should remain in the current viewport'
  );
  await click(incorrect);
  await click('[data-check-answer]');
  await until(
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('does not automatically improve') && document.querySelector('[data-retry-answer]')?.hidden === false`
  );
  assert.equal(
    await evaluate(
      `${savedProgress()}.missions['subject-background'].prediction.solved`
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
    `document.querySelector('[data-quiz-feedback]')?.textContent.includes('changes near–far alignment')`
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
      `${savedProgress()}.missions['subject-background'].prediction.revealed`
    ),
    true
  );
  console.log('OK framing prediction, error, retry, hint, and answer');

  for (const id of [
    'compare-frames',
    'make-initial-photo',
    'make-shifted-photo',
  ])
    await click(`[data-observation-step="${id}"]`);
  for (const id of [
    'edge-and-space-review',
    'distraction-review',
    'context-review',
  ])
    await click(`[data-reflection-check="${id}"]`);
  await click('[data-complete-mission]');
  await until(
    `document.querySelector('[data-mission-status]')?.textContent === 'You marked this mission complete.'`
  );
  await navigate('/practice/subject-background/');
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
  console.log('OK framing observation, self-review, completion, and refresh');

  await click('.language-picker summary');
  await until(
    `document.querySelector('a[href="/zh-cn/practice/subject-background/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/practice/subject-background/"]');
  await until(
    `location.pathname === '/zh-cn/practice/subject-background/' && !!document.querySelector('${ready}')`
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
    await evaluate(`document.body.textContent.includes('阅读《主体与背景》')`)
  );

  // A completed C1 record must survive a C2-only reset.
  await navigate('/practice/light-direction/');
  await until(
    `!!document.querySelector('[data-practice-mission][data-initialized="true"]')`
  );
  await click('[data-complete-mission]');
  await navigate('/zh-cn/practice/subject-background/');
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
    await evaluate(
      `${savedProgress()}.missions['subject-background'] === undefined`
    ),
    true
  );
  assert.equal(
    await evaluate(`${savedProgress()}.missions['light-direction'].status`),
    'completed'
  );
  await navigate('/practice/');
  await until(
    `document.querySelector('[data-practice-index][data-initialized="true"]')`
  );
  const cardStatuses = await evaluate(
    `Object.fromEntries([...document.querySelectorAll('[data-practice-card]')].map(card => [card.dataset.practiceCard, card.querySelector('[data-card-status]').textContent]))`
  );
  assert.deepEqual(cardStatuses, {
    'light-direction': 'Marked complete',
    'subject-background': 'Not started',
    'neighborhood-story': 'Not started',
    'photo-review': 'Not started',
  });
  console.log('OK shared language progress and mission-isolated reset');

  await navigate('/practice/subject-background/');
  const { identifier: blockedStorageScript } = await call(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked for testing', 'SecurityError'); } });`,
    }
  );
  try {
    await navigate('/practice/subject-background/');
    await until(`!!document.querySelector('${ready}')`);
    assert.ok(
      await evaluate(
        `document.querySelector('[data-storage-notice]').textContent.includes('only for this page visit')`
      )
    );
    await click(correct);
    await click('[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('changes near–far alignment')`
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
  console.log('OK blocked storage on the slider-free framing mission');

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  try {
    await navigate('/practice/subject-background/');
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
        `document.querySelectorAll('[data-framing-model] figure').length`
      ),
      2
    );
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('This parallax can move an overlapping pole')`
      )
    );
    await navigate('/zh-cn/practice/subject-background/');
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('这种视差可以让重叠的竖杆')`
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
  console.log('OK bilingual no-JavaScript framing content and answers');

  await viewport(390, 844);
  await call('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    await navigate('/zh-cn/learn/composition/subject-and-background/');
    await noOverflow('/zh-cn/learn/composition/subject-and-background/');
    await capture(call, 'framing-lesson-zh-mobile');
    await navigate('/zh-cn/practice/subject-background/');
    await until(`!!document.querySelector('${ready}')`);
    await noOverflow('/zh-cn/practice/subject-background/');
    await capture(call, 'framing-mission-zh-mobile');
    await tap(call, evaluate, `label:has(${correct})`);
    await tap(call, evaluate, '[data-check-answer]');
    await until(
      `document.querySelector('[data-quiz-feedback]')?.textContent.includes('改变机位再重新构图')`
    );
    assert.ok(
      await evaluate(`(() => {
        const rect = document.querySelector('[data-quiz-feedback]').getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight;
      })()`),
      'Chinese mobile feedback should be near the action'
    );
    const label = 'label:has([data-observation-step="compare-frames"])';
    assert.ok(
      await evaluate(
        `document.querySelector(${JSON.stringify(label)}).getBoundingClientRect().height >= 44`
      )
    );
    await tap(call, evaluate, label);
    await until(
      `document.querySelector('[data-observation-step="compare-frames"]').checked`
    );
    await capture(call, 'framing-mission-zh-mobile-feedback');
  } finally {
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  console.log('OK Chinese framing touch controls and nearby feedback');

  // A 683 px CSS viewport corresponds to a 1366 px desktop at 200% zoom.
  await viewport(683, 384);
  await navigate('/zh-cn/practice/subject-background/');
  await until(`!!document.querySelector('${ready}')`);
  await noOverflow('/zh-cn/practice/subject-background/ at 200% zoom');
  await click('[data-show-answer]');
  await until(
    `document.querySelector('[data-answer-details]').open && document.activeElement === document.querySelector('[data-answer-details] summary')`
  );
  await capture(call, 'framing-mission-zh-zoom-200');

  await viewport(1366, 768);
  await navigate('/learn/composition/subject-and-background/');
  await capture(call, 'framing-lesson-en-desktop');
  await navigate('/zh-cn/learn/composition/subject-and-background/');
  await capture(call, 'framing-lesson-zh-desktop');
  await navigate('/practice/subject-background/');
  await until(`!!document.querySelector('${ready}')`);
  await capture(call, 'framing-mission-en-desktop');
  console.log('OK framing 200% viewport and desktop capture paths');
}
