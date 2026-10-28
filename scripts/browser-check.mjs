import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { checkTools } from './browser-tool-checks.mjs';
import { checkDirectories } from './browser-directory-checks.mjs';

/**
 * Optional real-browser checks using an installed Chrome and Node's WebSocket.
 * No package or browser download is needed. Run a root-path production build
 * first: Starlight intentionally disables Pagefind in the development server.
 * The Astro child is killed in all outcomes; no preview server is left running
 * after this script returns.
 */
const ROOT = resolve(new URL('../', import.meta.url).pathname);
const CHROME =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function freePort() {
  const socket = createServer();
  await new Promise((resolve, reject) =>
    socket.listen(0, '127.0.0.1', resolve).once('error', reject)
  );
  const { port } = socket.address();
  await new Promise(resolve => socket.close(resolve));
  return port;
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
  timer.unref();
  await once(child, 'exit');
  clearTimeout(timer);
}
async function waitForServer(url, child) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Astro exited with ${child.exitCode}.`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* The temporary server is still starting. */
    }
    await sleep(100);
  }
  throw new Error('Timed out waiting for the temporary Astro server.');
}
function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => resolve(socket), { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
}
function cdp(socket) {
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    clearTimeout(handler.timer);
    if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
    else handler.resolve(message.result);
  });
  return (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      const timer = setTimeout(() => {
        pending.delete(messageId);
        reject(new Error(`CDP timed out: ${method}`));
      }, 15000);
      pending.set(messageId, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: messageId, method, params, sessionId }));
    });
}

const port = await freePort();
const origin = `http://127.0.0.1:${port}`;
const profile = await mkdtemp(resolve(ROOT, '.browser-check-'));
let astro;
let chrome;
let socket;
const errors = [];
try {
  astro = spawn(
    process.execPath,
    [
      'node_modules/astro/bin/astro.mjs',
      'preview',
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
  astro.stdout.on('data', chunk => {
    serverLog += chunk;
  });
  astro.stderr.on('data', chunk => {
    serverLog += chunk;
  });
  astro.once('error', error => {
    serverLog += error.stack;
  });
  try {
    await waitForServer(`${origin}/`, astro);
  } catch (error) {
    throw new Error(`${error.message}\n${serverLog}`);
  }

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
    chrome.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited with ${code}.\n${output}`));
    });
  });
  socket = await connect(browserUrl);
  const send = cdp(socket);
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
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text
      );
  });
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
    const state = await evaluate(
      `({ href: location.href, lang: document.documentElement.lang, target: document.querySelector('a[href="/zh-cn/"]')?.outerHTML })`
    );
    throw new Error(
      `Timed out waiting for: ${expression}\nPage: ${JSON.stringify(state)}\nExceptions: ${errors.join('\n')}`
    );
  }
  async function navigate(path) {
    await call('Page.navigate', { url: `${origin}${path}` });
    await until(
      `location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`
    );
  }
  async function viewport(width, height) {
    await call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }
  async function click(selector) {
    const point = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      element.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: rect.width > 0 && rect.height > 0,
      };
    })()`);
    assert.ok(point, `Missing click target: ${selector}`);
    assert.ok(point.visible, `Click target is hidden: ${selector}`);
    for (const type of ['mousePressed', 'mouseReleased']) {
      await call('Input.dispatchMouseEvent', {
        type,
        x: point.x,
        y: point.y,
        button: 'left',
        clickCount: 1,
      });
    }
  }
  async function noOverflow(path) {
    assert.equal(
      await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),
      true,
      `${path} has horizontal overflow`
    );
  }
  async function search(path, query, expectedPath) {
    await navigate(path);
    await until(
      `document.querySelector('button[data-open-modal]')?.disabled === false`
    );
    await click('button[data-open-modal]');
    await until(
      `!!document.querySelector('dialog[open] .pagefind-ui__search-input')`
    );
    await evaluate(`(() => {
      const input = document.querySelector('dialog[open] .pagefind-ui__search-input');
      input.value = ${JSON.stringify(query)};
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const hasTarget = `[...document.querySelectorAll('dialog[open] .pagefind-ui__result-link')].some(a => new URL(a.href, location.origin).pathname === ${JSON.stringify(expectedPath)})`;
    await until(
      `document.querySelectorAll('dialog[open] .pagefind-ui__result-link').length > 0`
    );
    let results = [];
    let match;
    for (let page = 0; page < 4 && !match; page++) {
      results = await evaluate(
        `[...document.querySelectorAll('dialog[open] .pagefind-ui__result-link')].map(a => ({ text: a.textContent, href: a.getAttribute('href') }))`
      );
      match = results.find(
        result => new URL(result.href, origin).pathname === expectedPath
      );
      if (match) break;
      const hasMore = await evaluate(
        `!!document.querySelector('dialog[open] .pagefind-ui__button')`
      );
      if (!hasMore) break;
      await click('dialog[open] .pagefind-ui__button');
      await until(
        `${hasTarget} || document.querySelectorAll('dialog[open] .pagefind-ui__result-link').length > ${results.length}`
      );
    }
    assert.ok(
      match,
      `No search result for ${query} points to ${expectedPath} after loading up to four pages: ${JSON.stringify(results)}. Search UI: ${await evaluate(`document.querySelector('dialog[open]')?.innerText`)}`
    );
    await evaluate(`(() => {
      const link = [...document.querySelectorAll('dialog[open] .pagefind-ui__result-link')].find(a => new URL(a.href, location.origin).pathname === ${JSON.stringify(expectedPath)});
      link.click();
    })()`);
    await until(`location.pathname === ${JSON.stringify(expectedPath)}`);
    console.log(`OK search ${JSON.stringify(query)} → ${expectedPath}`);
  }

  await viewport(1440, 900);
  await navigate('/');
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  const dimensions = await evaluate(
    `[...document.querySelectorAll('[data-sensor]')].map(el => ({ id: el.dataset.sensor, width: Number(el.getAttribute('width')), height: Number(el.getAttribute('height')) }))`
  );
  assert.deepEqual(dimensions, [
    { id: 'full-frame', width: 360, height: 240 },
    { id: 'aps-c', width: 235, height: 157 },
  ]);
  await noOverflow('/');
  await viewport(390, 844);
  await noOverflow('/');
  console.log(
    'OK proportional sensor diagram and home page at 1440 px / 390 px'
  );

  await viewport(1440, 900);
  await click('.hs-dropdown-toggle');
  await until(
    `document.querySelector('a[href="/zh-cn/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/"]');
  await until(
    `location.pathname === '/zh-cn/' && document.documentElement.lang === 'zh-CN'`
  );
  console.log('OK English → Chinese language navigation');

  await navigate('/zh-cn/learn/');
  const chineseNavigation = await evaluate(
    `[...document.querySelectorAll('a')].filter(a => a.getAttribute('href')?.startsWith('/zh-cn/learn/')).map(a => a.textContent.trim())`
  );
  assert.ok(
    chineseNavigation.some(text => text.includes('全画幅、APS-C 与传感器画幅'))
  );
  assert.ok(chineseNavigation.some(text => text.includes('曝光三角')));
  assert.equal(
    await evaluate(`!!document.querySelector('a[href="/learn/"]')`),
    false,
    'Chinese docs contain an English Learn destination'
  );
  await search(
    '/zh-cn/learn/',
    '传感器',
    '/zh-cn/learn/sensor-lens/sensor-formats/'
  );
  await search('/learn/', 'ISO', '/learn/exposure/exposure-triangle/');
  await search('/learn/', 'aperture priority', '/learn/exposure/pasm-modes/');
  await search(
    '/zh-cn/learn/',
    '景深',
    '/zh-cn/learn/sensor-lens/depth-of-field/'
  );
  await search(
    '/zh-cn/learn/',
    '曝光补偿',
    '/zh-cn/learn/exposure/exposure-compensation/'
  );
  await search(
    '/zh-cn/learn/',
    '自动对焦',
    '/zh-cn/learn/image-quality/autofocus/'
  );
  await search(
    '/zh-cn/learn/',
    '白平衡',
    '/zh-cn/learn/image-quality/white-balance/'
  );
  await search(
    '/zh-cn/learn/',
    '胶片模拟',
    '/zh-cn/learn/image-quality/film-simulations/'
  );
  await checkDirectories({
    call,
    click,
    evaluate,
    navigate,
    noOverflow,
    until,
    viewport,
  });
  await checkTools({
    call,
    click,
    evaluate,
    navigate,
    noOverflow,
    until,
    viewport,
  });

  await viewport(390, 844);
  for (const path of [
    '/',
    '/zh-cn/',
    '/learn/',
    '/zh-cn/learn/sensor-lens/sensor-formats/',
  ]) {
    await navigate(path);
    await noOverflow(path);
    console.log(`OK mobile layout ${path}`);
  }
  assert.deepEqual(errors, [], `Browser exceptions: ${errors.join('\n')}`);
  console.log('OK real-browser checks completed without page exceptions.');
} finally {
  if (socket) socket.close();
  await stop(chrome);
  await stop(astro);
  await rm(profile, { recursive: true, force: true });
}
