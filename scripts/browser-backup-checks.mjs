import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { missionById } from '../src/data_files/practice.ts';

const mission = missionById('backup-and-export');
assert.ok(mission, 'Missing source mission backup-and-export');

function feedbackIs(locale, choiceId) {
  const choice = mission.copy[locale].prediction.choices.find(
    item => item.id === choiceId
  );
  assert.ok(
    choice?.explanation?.trim(),
    `${locale}/${choiceId}: missing explanation`
  );
  return `(() => {
    const feedback = document.querySelector('[data-quiz-feedback]');
    return feedback?.dataset.choiceId === ${JSON.stringify(choiceId)} &&
      !feedback.hidden &&
      feedback.textContent === ${JSON.stringify(choice.explanation.trim())};
  })()`;
}

const KEY = 'photography-field-guide:practice:v1';
const route = '/practice/backup-and-export/';
const ready =
  '[data-practice-mission][data-mission-id="backup-and-export"][data-initialized="true"]';
const readProgress = `JSON.parse(localStorage.getItem('${KEY}')).missions`;
const correct =
  '[data-prediction-choice][value="retain-backup-export-inspect"]';
const wrong = '[data-prediction-choice][value="export-replaces-originals"]';

async function capture(call, name) {
  if (!process.env.PFG_SCREENSHOT_DIR) return;
  await mkdir(process.env.PFG_SCREENSHOT_DIR, { recursive: true });
  const { data } = await call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  await writeFile(
    resolve(process.env.PFG_SCREENSHOT_DIR, name + '.png'),
    Buffer.from(data, 'base64')
  );
}

export async function checkBackup({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  await viewport(1366, 768);
  await navigate('/practice/photo-review/');
  await until(
    `!!document.querySelector('[data-initialized="true"][data-practice-mission]')`
  );
  await click('[data-complete-mission]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-next-mission]').getAttribute('href')`
    ),
    route
  );
  await click('[data-next-mission]');
  await until(
    `location.pathname === '${route}' && !!document.querySelector('${ready}')`
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('input[type="file"], textarea, [data-review-model], [data-direction-control]').length`
    ),
    0
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-backup-export-model]').length`
    ),
    1
  );
  assert.ok(
    await evaluate(
      `(() => {const r = document.querySelector('[data-prediction-choice]').closest('label').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight;})()`
    ),
    'C5 first action visible on desktop'
  );
  await capture(call, 'c5-mission-en-1366x768');
  await click('[data-check-answer]');
  await until(`!document.querySelector('[data-quiz-feedback]').hidden`);
  assert.equal(
    await evaluate(`${readProgress}['backup-and-export'] === undefined`),
    true,
    'Empty submission must not claim progress'
  );
  await click(wrong);
  await click('[data-check-answer]');
  await until(feedbackIs('en', 'export-replaces-originals'));
  assert.equal(
    await evaluate(`${readProgress}['backup-and-export'].prediction.solved`),
    false
  );
  await click('[data-retry-answer]');
  await click(correct);
  await click('[data-check-answer]');
  await until(feedbackIs('en', 'retain-backup-export-inspect'));
  assert.equal(
    await evaluate(`${readProgress}['backup-and-export'].prediction.solved`),
    true
  );
  for (const attribute of ['data-observation-step', 'data-reflection-check']) {
    const ids = await evaluate(
      `[...document.querySelectorAll('[${attribute}]')].map(el => el.getAttribute('${attribute}'))`
    );
    assert.equal(ids.length, 3);
    for (const id of ids) await click(`[${attribute}="${id}"]`);
  }
  await click('[data-complete-mission]');
  await navigate(route);
  await until(`!!document.querySelector('${ready}')`);
  assert.equal(
    await evaluate(`${readProgress}['backup-and-export'].status`),
    'completed'
  );
  await click('.language-picker summary');
  await click('a[hreflang="zh-CN"]');
  await until(
    `location.pathname === '/zh-cn${route}' && !!document.querySelector('${ready}')`
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]:checked').length`
    ),
    3
  );
  await evaluate('window.confirm = () => true');
  await click('[data-reset-mission]');
  assert.equal(
    await evaluate(`${readProgress}['backup-and-export'] === undefined`),
    true
  );
  assert.equal(
    await evaluate(`${readProgress}['photo-review'].status`),
    'completed'
  );
  console.log(
    'OK C4 → C5 lifecycle, feedback, refresh, deep language switch and isolated reset'
  );

  const { identifier } = await call('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked for testing', 'SecurityError'); } });`,
  });
  try {
    await navigate(route);
    await until(`!!document.querySelector('${ready}')`);
    assert.ok(
      await evaluate(
        `document.querySelector('[data-storage-notice]').textContent.includes('only for this page visit')`
      )
    );
    await click(correct);
    await click('[data-check-answer]');
    await until(feedbackIs('en', 'retain-backup-export-inspect'));
    await click('[data-complete-mission]');
    assert.ok(
      await evaluate(
        `document.querySelector('[data-mission-status]').textContent.includes('marked this mission complete')`
      )
    );
  } finally {
    await call('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  }
  console.log(
    'OK C5 blocked storage remains usable without false persistent-save notice'
  );

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  try {
    for (const path of [route, '/zh-cn' + route]) {
      await navigate(path);
      assert.equal(
        await evaluate(
          `document.querySelector('[data-static-choices]').hidden`
        ),
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
          `[...document.querySelectorAll('[data-practice-interactive]')].every(el => el.hidden)`
        ),
        true
      );
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-answer-details] summary, [data-backup-export-model]').length`
        ),
        2
      );
    }
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
  }
  console.log('OK C5 bilingual no-JavaScript goals, answer and workflow');

  await viewport(390, 844);
  await navigate('/zh-cn/learn/workflow/backup-and-export/');
  await noOverflow('/zh-cn/learn/workflow/backup-and-export/');
  await capture(call, 'c5-lesson-zh-390x844');
  await navigate('/zh-cn' + route);
  await until(`!!document.querySelector('${ready}')`);
  await noOverflow('/zh-cn' + route);
  await capture(call, 'c5-mission-zh-390x844');
  await call('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    for (const selector of [correct, '[data-check-answer]']) {
      await evaluate(
        `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`
      );
      const point = await evaluate(
        `(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`
      );
      await call('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [point],
      });
      await call('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    }
    await until(feedbackIs('zh-cn', 'retain-backup-export-inspect'));
    await capture(call, 'c5-feedback-zh-touch-390x844');
  } finally {
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  await viewport(683, 384);
  await navigate(route);
  await until(`!!document.querySelector('${ready}')`);
  await noOverflow('C5 200% equivalent viewport');
  await capture(call, 'c5-mission-en-200pct-equivalent');
  console.log('OK C5 mobile touch, narrow lesson and 200% equivalent viewport');
}
