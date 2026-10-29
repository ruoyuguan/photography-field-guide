import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

/** Full standalone C6 browser checks. Build the root site first. */
const ROOT = resolve(new URL('../', import.meta.url).pathname);
const OUTPUT = process.env.PFG_EVIDENCE_DIR
  ? resolve(process.env.PFG_EVIDENCE_DIR, 'practice')
  : resolve(
      ROOT,
      'docs/audit-evidence/2026-10-29-lightweight-editing-practice'
    );
const KEY = 'photography-field-guide:practice:lightweight-editing:v1';
const SHARED_KEY = 'photography-field-guide:practice:v1';
const CHROME =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const passed = [];
const errors = [];
let profile;
let profileCreation;
let astro;
let chrome;
let socket;
let stopping = false;
let cleanupPromise;

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) =>
    server.listen(0, '127.0.0.1', resolve).once('error', reject)
  );
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function stop(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null)
    return;
  await new Promise((resolve, reject) => {
    let finished = false;
    let forceTimer;
    let deadlineTimer;
    const finish = error => {
      if (finished) return;
      finished = true;
      clearTimeout(forceTimer);
      clearTimeout(deadlineTimer);
      child.off('exit', onExit);
      child.off('error', onError);
      if (error) reject(error);
      else resolve();
    };
    const onExit = () => finish();
    const onError = error => finish(error);
    child.once('exit', onExit);
    child.once('error', onError);
    forceTimer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch (error) {
        finish(error);
      }
    }, 3000);
    deadlineTimer = setTimeout(
      () => finish(new Error(`Could not stop test child ${child.pid}.`)),
      6000
    );
    forceTimer.unref();
    deadlineTimer.unref();
    try {
      child.kill('SIGTERM');
    } catch (error) {
      finish(error);
    }
  });
}
function cleanup() {
  cleanupPromise ??= (async () => {
    const failures = [];
    try {
      socket?.close();
    } catch (error) {
      failures.push(error);
    }
    const stopped = await Promise.allSettled([stop(chrome), stop(astro)]);
    for (const result of stopped)
      if (result.status === 'rejected') failures.push(result.reason);
    try {
      const createdProfile = profile ?? (await profileCreation);
      if (createdProfile && stopped[0].status === 'fulfilled')
        await rm(createdProfile, {
          recursive: true,
          force: true,
          maxRetries: 8,
          retryDelay: 100,
        });
    } catch (error) {
      failures.push(error);
    }
    if (failures.length)
      throw new AggregateError(failures, 'Browser-check cleanup failed.');
  })();
  return cleanupPromise;
}
function handleSignal(signal) {
  if (stopping) return;
  stopping = true;
  void cleanup()
    .catch(error => console.error(error))
    .finally(() => process.exit(signal === 'SIGINT' ? 130 : 143));
}
const onInterrupt = () => handleSignal('SIGINT');
const onTerminate = () => handleSignal('SIGTERM');
process.on('SIGINT', onInterrupt);
process.on('SIGTERM', onTerminate);

try {
  await mkdir(OUTPUT, { recursive: true });
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  profileCreation = mkdtemp(resolve(tmpdir(), 'pfg-editing-practice-'));
  profile = await profileCreation;
  astro = spawn(
    process.execPath,
    [
      'node_modules/astro/bin/astro.mjs',
      'preview',
      '--ignore-lock',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        SITE_BASE: '/',
        SITE_ORIGIN: 'https://ruoyuguan.github.io',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  let serverLog = '';
  astro.stdout.on('data', chunk => (serverLog += chunk));
  astro.stderr.on('data', chunk => (serverLog += chunk));
  astro.once('error', error => (serverLog += error.stack));
  let ready = false;
  for (let attempt = 0; attempt < 150 && !ready; attempt++) {
    try {
      ready = (await fetch(`${origin}/`)).ok;
    } catch {
      // Temporary preview is starting.
    }
    if (!ready) await sleep(100);
  }
  assert.ok(ready, `Temporary preview failed to start.\n${serverLog}`);

  chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--no-proxy-server',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  const browserUrl = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(
      () => reject(new Error(`Chrome startup timed out.\n${output}`)),
      15000
    );
    chrome.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    chrome.once('error', reject);
    chrome.once('exit', code =>
      reject(new Error(`Chrome exited with ${code}.\n${output}`))
    );
  });
  socket = await new Promise((resolve, reject) => {
    const connection = new WebSocket(browserUrl);
    socket = connection;
    connection.addEventListener('open', () => resolve(connection), {
      once: true,
    });
    connection.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text
      );
    if (!message.id) return;
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    clearTimeout(handler.timer);
    if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
    else handler.resolve(message.result);
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP timed out: ${method}`));
      }, 15000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const { targetId } = await send('Target.createTarget', {
    url: 'about:blank',
  });
  const { sessionId } = await send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.enable', {});
  await call('Runtime.enable', {});
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text
      );
    return result.result.value;
  }
  async function until(expression, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw new Error(
      `Timed out: ${expression}\n${await evaluate('document.body.innerText')}`
    );
  }
  const initialized = () =>
    until(
      `document.querySelector('[data-lightweight-editing-practice]')?.dataset.initialized === 'true'`
    );
  const navigate = async path => {
    await call('Page.navigate', { url: `${origin}${path}` });
    await until(
      `location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`
    );
  };
  const reload = async () => {
    await call('Page.reload', { ignoreCache: true });
    await until(`document.readyState === 'complete'`);
    await initialized();
  };
  const viewport = (width, height) =>
    call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  const noOverflow = async path =>
    assert.equal(
      await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),
      true,
      `${path}: horizontal overflow`
    );
  async function screenshot(name, selector) {
    if (selector)
      await evaluate(
        `(() => {
          document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ behavior: 'instant', block: 'start' });
          const header = document.querySelector('body > header, header.sticky');
          const offset = header ? header.getBoundingClientRect().bottom + 16 : 112;
          window.scrollBy({ top: -offset, behavior: 'instant' });
        })()`
      );
    await evaluate(`(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations()
        .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => {})));
    })()`);
    const { data } = await call('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    await writeFile(resolve(OUTPUT, name), Buffer.from(data, 'base64'));
  }
  const click = selector =>
    evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const pass = message => {
    passed.push(message);
    console.log(`OK ${message}`);
  };
  const key = async (key, code, windowsVirtualKeyCode) => {
    await call('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      code,
      windowsVirtualKeyCode,
    });
    await call('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode,
    });
  };

  await call('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ],
  });
  await viewport(1366, 768);
  await navigate('/practice/lightweight-editing/');
  await initialized();
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(KEY)})`),
    null
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-complete-mission]').disabled`
    ),
    true
  );
  await click('[data-check-answer]');
  assert.match(
    await evaluate(
      `document.querySelector('[data-quiz-feedback]').textContent`
    ),
    /Choose one prediction/
  );
  await click('[data-prediction-choice][value="brighter-adds-captured-light"]');
  await click('[data-check-answer]');
  assert.match(
    await evaluate(
      `document.querySelector('[data-quiz-feedback]').textContent`
    ),
    /changes the rendering/
  );
  assert.equal(
    await evaluate(`document.querySelector('[data-retry-answer]').hidden`),
    false
  );
  await click('[data-retry-answer]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-prediction-choice]:checked')`
    ),
    null
  );
  await click('[data-show-answer]');
  assert.equal(
    await evaluate(`document.querySelector('[data-answer-details]').open`),
    true
  );
  await click(
    '[data-prediction-choice][value="compare-without-assuming-recovery"]'
  );
  await click('[data-check-answer]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-quiz-feedback]').dataset.correct`
    ),
    'true'
  );
  await evaluate(`(() => {
    localStorage.setItem(${JSON.stringify(SHARED_KEY)}, '{"sentinel":true}');
    localStorage.setItem('hs_theme', 'light');
  })()`);
  for (const selector of [
    '[data-observation-step="protect-source-state-purpose"]',
    '[data-observation-step="compare-and-undo-separately"]',
    '[data-observation-step="export-and-inspect-derivative"]',
    '[data-reflection-check="source-and-purpose"]',
    '[data-reflection-check="comparison-evidence"]',
    '[data-reflection-check="derivative-fit"]',
  ]) {
    assert.equal(
      await evaluate(
        `document.querySelector('[data-complete-mission]').disabled`
      ),
      true
    );
    await click(selector);
  }
  assert.equal(
    await evaluate(
      `document.querySelector('[data-complete-mission]').disabled`
    ),
    false
  );
  await click('[data-complete-mission]');
  await until(
    `document.querySelector('[data-mission-status]').textContent === 'Review completed'`
  );
  const saved = await evaluate(
    `JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}))`
  );
  assert.equal(saved.status, 'completed');
  assert.equal(saved.observationStepIds.length, 3);
  assert.equal(saved.reflectionCheckIds.length, 3);
  for (const forbidden of [
    'photos',
    'fileNames',
    'dimensions',
    'reflectionText',
  ])
    assert.equal(forbidden in saved, false);
  await noOverflow('/practice/lightweight-editing/');
  await screenshot('c6-en-complete-1366x768.png');
  await screenshot('c6-en-review-1366x768.png', '[data-complete-mission]');
  pass(
    'English prediction, wrong-answer retry, explanation, three local steps, self-review, and completion'
  );

  await reload();
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    'Review completed'
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]:checked, [data-reflection-check]:checked').length`
    ),
    6
  );
  assert.equal(
    await evaluate(`document.querySelector('[data-answer-details]').open`),
    true
  );
  await evaluate(`document.querySelector('.language-picker').open = true`);
  await click('.language-picker a[hreflang="zh-CN"]');
  await until(`location.pathname === '/zh-cn/practice/lightweight-editing/'`);
  await initialized();
  assert.equal(await evaluate('document.documentElement.lang'), 'zh-CN');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    '复盘已完成'
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]:checked, [data-reflection-check]:checked').length`
    ),
    6
  );
  pass(
    'Refresh and English ↔ Chinese navigation preserve one shared C6 progress record'
  );

  await evaluate(`window.confirm = () => true`);
  await click('[data-reset-mission]');
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(KEY)})`),
    null
  );
  assert.equal(
    await evaluate(`localStorage.getItem(${JSON.stringify(SHARED_KEY)})`),
    '{"sentinel":true}'
  );
  assert.equal(await evaluate(`localStorage.getItem('hs_theme')`), 'light');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    '未开始'
  );
  assert.match(
    await evaluate(
      `document.querySelector('[data-completion-feedback]').textContent`
    ),
    /其他任务进度与偏好设置均已保留/
  );
  pass('Single-task reset preserves shared mission data and theme');

  await evaluate(`localStorage.setItem(${JSON.stringify(KEY)}, '{broken')`);
  await reload();
  assert.equal(
    await evaluate(
      `document.querySelector('[data-storage-notice]').dataset.storageState`
    ),
    'recovered'
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-mission-status]').textContent`
    ),
    '未开始'
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]:checked, [data-reflection-check]:checked').length`
    ),
    0
  );
  pass('Corrupt storage recovers to a safe empty task with an honest notice');

  const { identifier: blockedScript } = await call(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `(() => {
        const original = Storage.prototype.getItem;
        Storage.prototype.getItem = function(key) {
          if (key === ${JSON.stringify(KEY)}) throw new DOMException('Blocked for C6 test', 'SecurityError');
          return original.call(this, key);
        };
      })();`,
    }
  );
  await reload();
  assert.equal(
    await evaluate(
      `document.querySelector('[data-storage-notice]').dataset.storageState`
    ),
    'memory'
  );
  await click('[data-observation-step="protect-source-state-purpose"]');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-observation-step="protect-source-state-purpose"]').checked`
    ),
    true
  );
  await reload();
  assert.equal(
    await evaluate(
      `document.querySelector('[data-storage-notice]').dataset.storageState`
    ),
    'memory'
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-observation-step="protect-source-state-purpose"]').checked`
    ),
    false
  );
  await call('Page.removeScriptToEvaluateOnNewDocument', {
    identifier: blockedScript,
  });
  await reload();
  await evaluate(`window.confirm = () => true`);
  await click('[data-reset-mission]');
  pass(
    'Blocked C6 storage keeps the task usable in memory without claiming persistence'
  );

  await evaluate(`document.querySelector('[data-prediction-choice]').focus()`);
  await key(' ', 'Space', 32);
  assert.equal(
    await evaluate(
      `document.querySelector('[data-prediction-choice]').checked`
    ),
    true
  );
  await evaluate(`document.querySelector('[data-check-answer]').focus()`);
  await key(' ', 'Space', 32);
  await until(
    `document.querySelector('[data-quiz-feedback]').dataset.choiceId === 'brighter-adds-captured-light'`
  );
  pass('Native radio and submit controls work from the keyboard');

  await evaluate(
    `document.querySelector('[data-lightweight-editing-model]').closest('details').querySelector('summary').click()`
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-lightweight-editing-model] svg[role="img"]').length`
    ),
    6
  );
  assert.equal(
    await evaluate(`[...document.querySelectorAll('[data-lightweight-editing-model] svg')].every(svg => {
      const ids = svg.getAttribute('aria-labelledby').split(/\\s+/);
      return ids.every(id => document.getElementById(id)?.textContent.trim());
    })`),
    true
  );
  await evaluate(`localStorage.setItem('hs_theme', 'dark')`);
  await reload();
  assert.equal(
    await evaluate(`document.documentElement.classList.contains('dark')`),
    true
  );
  await viewport(390, 844);
  await navigate('/zh-cn/practice/lightweight-editing/');
  await initialized();
  assert.equal(
    await evaluate(`document.documentElement.classList.contains('dark')`),
    true
  );
  await noOverflow('/zh-cn/practice/lightweight-editing/');
  await screenshot('c6-zh-dark-390x844.png');
  await evaluate(
    `document.querySelector('[data-lightweight-editing-model]').closest('details').querySelector('summary').click()`
  );
  await screenshot(
    'c6-zh-model-dark-390x844.png',
    '[data-lightweight-editing-model]'
  );
  await viewport(683, 384);
  await noOverflow('/zh-cn/practice/lightweight-editing/');
  pass(
    'Accessible concept pairs, real dark theme, mobile, and zoom-equivalent layouts'
  );

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await viewport(1366, 768);
  await navigate('/practice/lightweight-editing/');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-prediction-form]').getClientRects().length`
    ),
    0
  );
  assert.ok(
    await evaluate(
      `document.querySelector('[data-editing-static]').getClientRects().length > 0`
    )
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-observation-step]').length`
    ),
    3
  );
  assert.ok(
    await evaluate(`document.body.innerText.includes('JavaScript is off')`)
  );
  await evaluate(
    `document.querySelector('[data-lightweight-editing-model]').closest('details').querySelector('summary').click()`
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-lightweight-editing-model]').closest('details').open`
    ),
    true
  );
  await evaluate(
    `document.querySelector('[data-answer-details] summary').click()`
  );
  assert.equal(
    await evaluate(`document.querySelector('[data-answer-details]').open`),
    true
  );
  await noOverflow('/practice/lightweight-editing/');
  pass(
    'No-script prediction choices, answer, concept illustrations, local actions, and self-review'
  );

  assert.deepEqual(errors, [], `Browser exceptions: ${errors.join('\n')}`);
  await writeFile(
    resolve(OUTPUT, 'verification.json'),
    `${JSON.stringify(
      {
        scope: 'standalone-c6-lightweight-editing-practice',
        base: '/',
        browser: 'headless Google Chrome via CDP',
        passed,
        pageExceptions: errors,
        screenshots: [
          'c6-en-complete-1366x768.png',
          'c6-en-review-1366x768.png',
          'c6-zh-dark-390x844.png',
          'c6-zh-model-dark-390x844.png',
        ],
        limitations: [
          'No real photograph or third-party editor was accessed.',
          'No human reader study or comprehensive WCAG audit was performed.',
        ],
      },
      null,
      2
    )}\n`
  );
  console.log('OK standalone C6 browser checks completed.');
} finally {
  try {
    await cleanup();
  } finally {
    if (!stopping) {
      process.off('SIGINT', onInterrupt);
      process.off('SIGTERM', onTerminate);
    }
  }
}
