import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

/** Isolated Chrome checks for the new article. Build the root site first. */
const ROOT = resolve(new URL('../', import.meta.url).pathname);
const OUTPUT = process.env.PFG_EVIDENCE_DIR
  ? resolve(process.env.PFG_EVIDENCE_DIR, 'tutorial')
  : resolve(ROOT, 'docs/audit-evidence/2026-10-29-lightweight-editing');
const CHROME =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let profile;
let profileCreation;
let astro;
let chrome;
let socket;
let stopping = false;
let cleanupPromise;
const errors = [];

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
  profileCreation = mkdtemp(resolve(tmpdir(), 'pfg-editing-check-'));
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
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text
      );
    }
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
  const navigate = async path => {
    await call('Page.navigate', { url: `${origin}${path}` });
    await until(
      `location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`
    );
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
        `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ behavior: 'instant', block: 'start' })`
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
  async function selectLanguage(path) {
    await evaluate(`(() => {
      const select = [...document.querySelectorAll('starlight-lang-select select')].find(element => element.getClientRects().length > 0);
      if (!select) throw new Error('No visible language select');
      select.value = ${JSON.stringify(path)};
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await until(`location.pathname === ${JSON.stringify(path)}`);
  }
  async function search(path, query, expectedPath) {
    await navigate(path);
    await until(
      `document.querySelector('button[data-open-modal]')?.disabled === false`
    );
    await evaluate(`document.querySelector('button[data-open-modal]').click()`);
    await until(
      `!!document.querySelector('dialog[open] .pagefind-ui__search-input')`
    );
    await evaluate(`(() => {
      const input = document.querySelector('dialog[open] .pagefind-ui__search-input');
      input.value = ${JSON.stringify(query)};
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const hasTarget = `[...document.querySelectorAll('dialog[open] .pagefind-ui__result-link')].some(link => new URL(link.href, location.origin).pathname === ${JSON.stringify(expectedPath)})`;
    try {
      await until(hasTarget);
    } catch (error) {
      const diagnostics = await evaluate(`(async () => {
        const { search } = await import('/pagefind/pagefind.js');
        return Promise.all([${JSON.stringify(query)}, '轻量', '后期', '裁切'].map(async query => {
          const result = await search(query, { verbose: true });
          return {
            query,
            count: result.unfilteredResultCount,
            results: await Promise.all(result.results.map(async item => (await item.data()).url)),
          };
        }));
      })()`);
      throw new Error(
        `${error.message}\nSearch diagnostics: ${JSON.stringify(diagnostics)}`
      );
    }
    await evaluate(`(() => {
      const link = [...document.querySelectorAll('dialog[open] .pagefind-ui__result-link')].find(link => new URL(link.href, location.origin).pathname === ${JSON.stringify(expectedPath)});
      link.click();
    })()`);
    await until(`location.pathname === ${JSON.stringify(expectedPath)}`);
    console.log(`OK search ${query} → ${expectedPath}`);
  }

  await call('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'light' }],
  });
  await viewport(1366, 768);
  await navigate('/learn/workflow/lightweight-editing/');
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
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
    true,
    'Every comparison needs a nonempty accessible title and description'
  );
  assert.ok(
    await evaluate(
      `document.querySelector('[data-lightweight-editing-model]').getBoundingClientRect().top < innerHeight`
    ),
    'The first comparison should be discoverable on the initial desktop screen'
  );
  assert.equal(
    await evaluate(
      `document.querySelector('.sidebar a[aria-current="page"]').getAttribute('href')`
    ),
    '/learn/workflow/lightweight-editing/'
  );
  await noOverflow('/learn/workflow/lightweight-editing/');
  await screenshot('lightweight-editing-en-1366x768.png');
  await screenshot(
    'lightweight-editing-crop-en-1366x768.png',
    '[data-editing-comparison="crop"]'
  );
  console.log('OK English article, discovery, accessible SVG, desktop layout');

  await selectLanguage('/zh-cn/learn/workflow/lightweight-editing/');
  assert.equal(await evaluate('document.documentElement.lang'), 'zh-CN');
  assert.ok(
    await evaluate(
      `document.querySelector('h1').textContent.includes('轻量后期')`
    )
  );
  await selectLanguage('/learn/workflow/lightweight-editing/');
  console.log('OK corresponding-language menu in both directions');

  await search(
    '/learn/',
    'lightweight editing',
    '/learn/workflow/lightweight-editing/'
  );
  await search(
    '/zh-cn/learn/',
    '轻量后期',
    '/zh-cn/learn/workflow/lightweight-editing/'
  );
  await evaluate(
    `document.querySelector('.sl-markdown-content a[href="../backup-and-export/"]').click()`
  );
  await until(
    `location.pathname === '/zh-cn/learn/workflow/backup-and-export/'`
  );
  console.log('OK article → existing backup workflow');

  await call('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  });
  await viewport(1366, 768);
  await navigate('/zh-cn/learn/workflow/lightweight-editing/');
  if (await evaluate(`document.documentElement.dataset.theme !== 'dark'`)) {
    await until(
      `document.querySelector('#dark-theme-toggle')?.getClientRects().length > 0`
    );
    await evaluate(`document.querySelector('#dark-theme-toggle').click()`);
  }
  await until(`document.documentElement.dataset.theme === 'dark'`);
  await viewport(390, 844);
  await navigate('/zh-cn/learn/workflow/lightweight-editing/');
  await noOverflow('/zh-cn/learn/workflow/lightweight-editing/');
  assert.equal(
    await evaluate(`document.documentElement.dataset.theme`),
    'dark',
    'The mobile screenshots must use the site dark theme, not only a media emulation'
  );
  await screenshot('lightweight-editing-zh-dark-390x844.png');
  await screenshot(
    'lightweight-editing-crop-zh-390x844.png',
    '[data-editing-comparison="crop"]'
  );
  await viewport(683, 384);
  await noOverflow('/zh-cn/learn/workflow/lightweight-editing/');
  console.log(
    'OK mobile dark theme, crop comparison, narrow zoom-equivalent view'
  );

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await viewport(1366, 768);
  await navigate('/learn/workflow/lightweight-editing/');
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-editing-comparison]').length`
    ),
    3
  );
  assert.equal(
    await evaluate(
      `document.querySelectorAll('[data-lightweight-editing-model] script, [data-lightweight-editing-model] input').length`
    ),
    0
  );
  await evaluate(`(() => {
    const summary = [...document.querySelectorAll('.sl-markdown-content details > summary')].find(item => item.textContent.includes('non-destructive'));
    summary.scrollIntoView({ behavior: 'instant', block: 'center' });
    summary.click();
  })()`);
  assert.equal(
    await evaluate(
      `[...document.querySelectorAll('.sl-markdown-content details')].find(item => item.querySelector('summary').textContent.includes('non-destructive')).open`
    ),
    true,
    'The deeper explanation remains natively usable without JavaScript'
  );
  await noOverflow('/learn/workflow/lightweight-editing/');
  console.log('OK static comparisons and native details without JavaScript');

  assert.deepEqual(errors, [], `Browser exceptions: ${errors.join('\n')}`);
  console.log('OK lightweight-editing browser checks completed.');
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
