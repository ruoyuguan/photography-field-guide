import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const STORAGE_KEY = 'photography-field-guide:practice:v1';
const READY = '[data-practice-mission][data-initialized="true"]';
const saved = `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '{"version":1,"missions":{}}')`;

async function checkLightingGeometry(evaluate, path) {
  const diagrams = await evaluate(`(() => {
    const point = (element, x, y) => [Number(element.getAttribute(x)), Number(element.getAttribute(y))];
    return [...document.querySelectorAll('svg[data-lighting-diagram]')].map(svg => {
      const object = point(svg.querySelector('[data-light-object]'), 'cx', 'cy');
      const lamp = point(svg.querySelector('[data-light-source]'), 'cx', 'cy');
      const shadow = point(svg.querySelector('[data-light-shadow]'), 'cx', 'cy');
      const camera = point(svg.querySelector('[data-light-camera]'), 'data-x', 'data-y');
      const vector = p => [p[0] - object[0], p[1] - object[1]];
      const light = vector(lamp), view = vector(camera), cast = vector(shadow);
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
      return {
        kind: svg.dataset.lightingDiagram,
        cameraDot: dot(light, view),
        shadowDot: dot(light, cast),
        lampDistance: Math.hypot(...light),
      };
    });
  })()`);
  assert.equal(diagrams.length, 2, `${path}: both lighting diagrams exist`);
  const front = diagrams.find(diagram => diagram.kind === 'front');
  const side = diagrams.find(diagram => diagram.kind === 'side');
  assert.ok(front && side, `${path}: front and side diagrams exist`);
  assert.ok(front.cameraDot > 0, `${path}: front lamp is toward the camera`);
  assert.ok(
    Math.abs(side.cameraDot) < 1e-6,
    `${path}: side lamp is perpendicular to camera direction`
  );
  for (const diagram of diagrams) {
    assert.ok(
      diagram.shadowDot < 0,
      `${path}: ${diagram.kind} shadow extends away from the lamp`
    );
    assert.ok(
      diagram.lampDistance > 0 && Number.isFinite(diagram.lampDistance)
    );
  }
  assert.ok(
    Math.abs(front.lampDistance - side.lampDistance) < 1e-6,
    `${path}: both lamps remain the same distance from the object`
  );
}

export async function checkState({
  call,
  click,
  evaluate,
  navigate,
  until,
  viewport,
}) {
  await viewport(1366, 768);
  await navigate('/practice/');
  await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  for (const id of [
    'light-direction',
    'subject-background',
    'neighborhood-story',
    'photo-review',
  ]) {
    await navigate(`/practice/${id}/`);
    await until(`!!document.querySelector('${READY}')`);
    const choices = await evaluate(
      `[...document.querySelectorAll('[data-prediction-choice]')].map(input => input.value)`
    );
    assert.ok(choices.length >= 2);
    const first = `[data-prediction-choice][value="${choices[0]}"]`;
    const draft = `[data-prediction-choice][value="${choices[1]}"]`;
    await click(first);
    await click('[data-check-answer]');
    await click(draft);
    await click('[data-observation-step]');
    await click('[data-reflection-check]');
    assert.equal(
      await evaluate(
        `document.querySelector(${JSON.stringify(draft)}).checked`
      ),
      true,
      `${id}: checklist actions preserve an unsubmitted prediction`
    );
    assert.equal(
      await evaluate(
        `${saved}.missions[${JSON.stringify(id)}].prediction.choiceId`
      ),
      choices[0],
      `${id}: a draft does not submit itself`
    );
    await click('[data-show-answer]');
    assert.equal(
      await evaluate(
        `document.querySelector(${JSON.stringify(draft)}).checked`
      ),
      true,
      `${id}: revealing the answer preserves an unsubmitted prediction`
    );
    await click('[data-answer-details] summary');
    await until(`!document.querySelector('[data-answer-details]').open`);
    await click('[data-observation-step]');
    assert.equal(
      await evaluate(`document.querySelector('[data-answer-details]').open`),
      false,
      `${id}: an explicitly closed answer stays closed during other actions`
    );
  }
  console.log(
    'OK C1–C4 prediction drafts survive checklist actions and answer disclosure'
  );

  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${READY}')`);
  await evaluate(`window.confirm = () => true`);
  await click('[data-reset-mission]');
  await click('[data-prediction-choice][value="longer-focal-length"]');
  await click('[data-check-answer]');
  await click('[data-retry-answer]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    'In progress'
  );
  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${READY}')`);
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    'In progress'
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-prediction-choice]:checked').length`
    ),
    0
  );
  await click('[data-answer-details] summary');
  await until(
    `${saved}.missions['light-direction'].prediction.revealed === true`
  );
  await navigate('/zh-cn/practice/light-direction/');
  await until(`!!document.querySelector('${READY}')`);
  assert.equal(
    await evaluate(`document.querySelector('[data-answer-details]').open`),
    true
  );
  console.log(
    'OK retry progress and native answer disclosure persist across refresh and language change'
  );

  for (const path of [
    '/practice/light-direction/',
    '/zh-cn/practice/light-direction/',
    '/learn/composition/understanding-light/',
    '/zh-cn/learn/composition/understanding-light/',
  ]) {
    await navigate(path);
    await checkLightingGeometry(evaluate, path);
    if (
      path === '/learn/composition/understanding-light/' &&
      process.env.PFG_SCREENSHOT_DIR
    ) {
      await evaluate(
        `document.querySelector('[data-lighting-diagram]').scrollIntoView({block:'center',behavior:'instant'})`
      );
      const { data } = await call('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      });
      await mkdir(process.env.PFG_SCREENSHOT_DIR, { recursive: true });
      await writeFile(
        resolve(
          process.env.PFG_SCREENSHOT_DIR,
          'lighting-geometry-en-1366x768.png'
        ),
        Buffer.from(data, 'base64')
      );
    }
  }
  console.log(
    'OK shared lighting diagrams preserve direction, cast shadow, and lamp distance geometry'
  );

  const { identifier } = await call('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__pfgStateErrors = [];
      window.addEventListener('error', event => window.__pfgStateErrors.push(event.message));
      window.addEventListener('unhandledrejection', event => window.__pfgStateErrors.push(String(event.reason)));
      Object.defineProperty(window, 'localStorage', { configurable: true, get() {
        throw new DOMException('PFG_STATE_STORAGE_DENIED', 'SecurityError');
      } });`,
  });
  const assertTheme = async theme => {
    await until(
      `document.documentElement.dataset.theme === ${JSON.stringify(theme)}`
    );
    const buttons = await evaluate(`['', '-mobile'].map(suffix => ({
      dark: document.getElementById('dark-theme-toggle' + suffix).classList.contains('hidden'),
      light: document.getElementById('light-theme-toggle' + suffix).classList.contains('hidden'),
    }))`);
    assert.deepEqual(buttons, [
      { dark: theme === 'dark', light: theme !== 'dark' },
      { dark: theme === 'dark', light: theme !== 'dark' },
    ]);
  };
  try {
    for (const [path, mobile] of [
      ['/learn/composition/understanding-light/', false],
      ['/zh-cn/learn/composition/understanding-light/', true],
    ]) {
      await viewport(mobile ? 390 : 1366, mobile ? 844 : 768);
      await navigate(path);
      await until(
        `['light', 'dark'].includes(document.documentElement.dataset.theme)`
      );
      const initial = await evaluate(`document.documentElement.dataset.theme`);
      await assertTheme(initial);
      if (mobile) {
        await click('button.sl-menu-button');
        await until(
          `document.querySelector('#starlight__sidebar').matches(':popover-open')`
        );
      }
      const suffix = mobile ? '-mobile' : '';
      await click(
        `#${initial === 'dark' ? 'light' : 'dark'}-theme-toggle${suffix}`
      );
      await assertTheme(initial === 'dark' ? 'light' : 'dark');
      await click(
        `#${initial === 'dark' ? 'dark' : 'light'}-theme-toggle${suffix}`
      );
      await assertTheme(initial);
      assert.deepEqual(
        await evaluate(`window.__pfgStateErrors`),
        [],
        `${path}: blocked storage produces no uncaught errors`
      );
    }
    await viewport(1366, 768);
    await navigate('/practice/light-direction/');
    await until(`!!document.querySelector('${READY}')`);
    const initialDark = await evaluate(
      `document.documentElement.classList.contains('dark')`
    );
    await click(
      `[data-hs-theme-click-value="${initialDark ? 'default' : 'dark'}"]`
    );
    await until(
      `document.documentElement.classList.contains('dark') === ${!initialDark}`
    );
    await click(
      `[data-hs-theme-click-value="${initialDark ? 'dark' : 'default'}"]`
    );
    await until(
      `document.documentElement.classList.contains('dark') === ${initialDark}`
    );
    assert.deepEqual(
      await evaluate(`window.__pfgStateErrors`),
      [],
      'Native site theme remains usable without duplicate Preline storage access'
    );
  } finally {
    await call('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    await viewport(1366, 768);
    await navigate('/practice/');
    await evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
  }
  console.log(
    'OK desktop and mobile lesson theme controls work with storage denied and no uncaught exceptions'
  );
  await navigate('/practice/light-direction/');
  await until(`!!document.querySelector('${READY}')`);
  await click('[data-complete-mission]');
  const { identifier: failedMutation } = await call(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `const originalSet = Storage.prototype.setItem;
      const originalRemove = Storage.prototype.removeItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === '${STORAGE_KEY}') throw new DOMException('Storage write denied', 'QuotaExceededError');
        return originalSet.call(this, key, value);
      };
      Storage.prototype.removeItem = function(key) {
        if (key === '${STORAGE_KEY}') throw new DOMException('Storage removal denied', 'SecurityError');
        return originalRemove.call(this, key);
      };`,
    }
  );
  try {
    await navigate('/practice/light-direction/');
    await until(`!!document.querySelector('${READY}')`);
    await evaluate(`window.confirm = () => true`);
    await click('[data-reset-mission]');
    assert.ok(
      await evaluate(
        `document.querySelector('[data-completion-feedback]').textContent.includes('for this page only')`
      )
    );
    assert.equal(
      await evaluate(`${saved}.missions['light-direction'].status`),
      'completed'
    );
    await navigate('/practice/');
    await until(
      `!!document.querySelector('[data-practice-index][data-initialized="true"]')`
    );
    await evaluate(`window.confirm = () => true`);
    await click('[data-clear-all]');
    assert.ok(
      await evaluate(
        `document.querySelector('[data-clear-feedback]').textContent.includes('may return after a reload')`
      )
    );
    assert.equal(
      await evaluate(`${saved}.missions['light-direction'].status`),
      'completed'
    );
  } finally {
    await call('Page.removeScriptToEvaluateOnNewDocument', {
      identifier: failedMutation,
    });
    await navigate('/practice/');
    await evaluate(`localStorage.removeItem('${STORAGE_KEY}')`);
  }
  console.log(
    'OK failed reset/removal reports temporary state instead of a false persistent-clear success'
  );
}
