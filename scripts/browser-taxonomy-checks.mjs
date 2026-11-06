import { tap } from './browser-touch.mjs';
import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FORMAT_PRESETS } from '../src/utils/photography/format-comparison.ts';

const closeTo = (actual, expected, tolerance = 1e-8) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} ≠ ${expected}`
  );

async function publishedTermCount() {
  const directory = new URL('../src/content/glossary/', import.meta.url);
  const files = (await readdir(directory)).filter(file =>
    file.endsWith('.json')
  );
  const records = await Promise.all(
    files.map(async file =>
      JSON.parse(await readFile(new URL(file, directory), 'utf8'))
    )
  );
  return records.filter(record => record.reviewStatus === 'published').length;
}

async function capture(call, evaluate, name, selector) {
  const directory = process.env.PFG_SCREENSHOT_DIR;
  if (!directory) return;
  await evaluate(`(async () => {
    const target = document.querySelector(${JSON.stringify(selector)});
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy({ top: -(document.querySelector('header.sticky')?.getBoundingClientRect().bottom ?? 96) - 16, behavior: 'instant' });
    const animations = document.getAnimations().filter(animation => {
      const timing = animation.effect?.getTiming();
      return target.contains(animation.effect?.target) && animation.playState === 'running' && Number.isFinite(timing?.iterations) && Number.isFinite(timing?.duration);
    });
    let timer;
    try {
      await Promise.race([
        (async () => {
          await Promise.all([document.fonts.ready, ...animations.map(animation => animation.finished.catch(() => {}))]);
          if (document.visibilityState === 'visible') {
            await new Promise(requestAnimationFrame);
            await new Promise(requestAnimationFrame);
          }
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Taxonomy screenshot did not settle; visibility=' + document.visibilityState)), 3000); }),
      ]);
    } finally { clearTimeout(timer); }
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

/** Root-path browser regression for the first taxonomy slice; not reader research. */
export async function checkTaxonomy({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  search,
  until,
  viewport,
}) {
  const count = await publishedTermCount();
  await viewport(1366, 768);
  await navigate('/cameras/');
  console.log('START taxonomy browser checks: overview loaded');
  const themes = await evaluate(
    `Object.fromEntries(['hs_theme', 'starlight-theme'].map(key => [key, localStorage.getItem(key)]))`
  );

  async function key(selector, key, code, virtualKey, typedText) {
    await evaluate(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      target.scrollIntoView({ behavior: 'instant', block: 'center' });
      target.focus({ preventScroll: true });
    })()`);
    for (const type of ['keyDown', 'keyUp'])
      await call('Input.dispatchKeyEvent', {
        type,
        key,
        code,
        windowsVirtualKeyCode: virtualKey,
        nativeVirtualKeyCode: virtualKey,
        ...(type === 'keyDown' && typedText ? { text: typedText } : {}),
      });
  }
  async function enter(selector) {
    await key(selector, 'Enter', 'Enter', 13);
  }
  async function toggleSummary(selector) {
    const wasOpen = await evaluate(
      `document.querySelector(${JSON.stringify(selector)}).closest('details').open`
    );
    await key(selector, ' ', 'Space', 32);
    await until(
      `document.querySelector(${JSON.stringify(selector)}).closest('details').open === ${!wasOpen}`
    );
  }
  async function glossaryQuery(value) {
    await evaluate(`(() => {
      const input = document.querySelector('[data-filter-query]');
      input.value = ${JSON.stringify(value)};
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
  }
  async function chooseFormat(side, id) {
    await evaluate(`(() => {
      const select = document.querySelector('[data-format-select="${side}"]');
      select.value = ${JSON.stringify(id)};
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
  }
  async function assertFormat(a, b) {
    await chooseFormat('a', a.id);
    await chooseFormat('b', b.id);
    const actual = await evaluate(`(() => {
      const rect = side => {
        const node = document.querySelector('[data-format-rect="' + side + '"]');
        const style = getComputedStyle(node);
        return {
          ...Object.fromEntries(['width', 'height', 'x', 'y'].map(key => [key, Number(node.getAttribute(key))])),
          stroke: style.stroke,
          dash: style.strokeDasharray,
        };
      };
      const metric = (side, key) => document.querySelector('[data-format-result="' + side + '"] [data-format-metric="' + key + '"]').textContent;
      return { a: rect('a'), b: rect('b'), ratio: Number(document.querySelector('[data-format-ratio]').textContent.replaceAll(',', '')), summary: document.querySelector('[data-format-summary]').textContent, aArea: metric('a', 'area'), bArea: metric('b', 'area'), aCrop: metric('a', 'crop'), bCrop: metric('b', 'crop') };
    })()`);
    const expectedRatio = (b.widthMm * b.heightMm) / (a.widthMm * a.heightMm);
    for (const rect of [actual.a, actual.b])
      assert.notEqual(rect.stroke, 'none');
    assert.notEqual(actual.a.stroke, actual.b.stroke);
    assert.equal(actual.a.dash, 'none');
    assert.notEqual(actual.b.dash, 'none');
    closeTo(actual.a.width / actual.b.width, a.widthMm / b.widthMm);
    closeTo(actual.a.height / actual.b.height, a.heightMm / b.heightMm);
    closeTo(
      (actual.b.width * actual.b.height) / (actual.a.width * actual.a.height),
      expectedRatio
    );
    closeTo(actual.ratio, expectedRatio, 0.00051);
    closeTo(
      Number(actual.aArea.replaceAll(',', '').replace(' mm²', '')),
      a.widthMm * a.heightMm,
      0.0051
    );
    closeTo(
      Number(actual.bArea.replaceAll(',', '').replace(' mm²', '')),
      b.widthMm * b.heightMm,
      0.0051
    );
    closeTo(
      Number(actual.aCrop.replace('×', '')),
      Math.hypot(36, 24) / Math.hypot(a.widthMm, a.heightMm),
      0.00051
    );
    closeTo(
      Number(actual.bCrop.replace('×', '')),
      Math.hypot(36, 24) / Math.hypot(b.widthMm, b.heightMm),
      0.00051
    );
    assert.ok(actual.summary.length > 20);
    assert.equal(
      await evaluate(`document.querySelector('[data-format-error]').hidden`),
      true
    );
  }

  try {
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-taxonomy-dimension]').length`
      ),
      16
    );
    assert.equal(
      await evaluate(
        `new Set([...document.querySelectorAll('[data-taxonomy-dimension]')].map(node => node.id)).size`
      ),
      16
    );
    await toggleSummary('[data-taxonomy-dimension] details > summary');
    assert.equal(
      await evaluate(
        `document.querySelector('[data-taxonomy-dimension] details').open`
      ),
      true
    );
    await toggleSummary('[data-taxonomy-dimension] details > summary');
    assert.equal(
      await evaluate(
        `document.querySelector('[data-taxonomy-dimension] details').open`
      ),
      false
    );
    console.log(
      'OK native taxonomy overview disclosure opens and closes with Space'
    );
    await capture(
      call,
      evaluate,
      'taxonomy-en-1366x768',
      '[data-taxonomy-dimension]'
    );
    await enter('a[href="/cameras/lens-system/"]');
    await until(`location.pathname === '/cameras/lens-system/'`);
    await click('a[href="/glossary/fixed-lens/"]');
    await until(`location.pathname === '/glossary/fixed-lens/'`);
    assert.ok(
      await evaluate(`document.body.textContent.includes('zoom and autofocus')`)
    );
    await click('a[href="/glossary/prime-lens/"]');
    await until(`location.pathname === '/glossary/prime-lens/'`);
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('Focus distance and focal length')`
      )
    );
    await click('.language-picker summary');
    await click('a[href="/zh-cn/glossary/prime-lens/"]');
    await until(
      `location.pathname === '/zh-cn/glossary/prime-lens/' && document.documentElement.lang === 'zh-CN'`
    );
    assert.ok(
      await evaluate(`document.body.textContent.includes('定焦不等于不能对焦')`)
    );
    console.log(
      'OK taxonomy16 axes, native keyboard disclosure, fixed-lens→prime distinction and deep Chinese switch'
    );

    for (const query of ['DSLR', '数码单反', '半画幅']) {
      await navigate('/glossary/');
      await until(
        `document.querySelector('[data-filter-form]')?.hidden === false`
      );
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-filter-item]').length`
        ),
        count
      );
      await glossaryQuery(query);
      await until(
        `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length === 1`
      );
      assert.ok(
        await evaluate(
          `document.querySelector('[data-filter-results]').textContent.includes('1')`
        )
      );
      await click('[data-filter-form] button[type="reset"]');
      await until(
        `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length === ${count}`
      );
      assert.equal(
        await evaluate(`document.querySelector('[data-filter-query]').value`),
        ''
      );
    }
    await navigate('/glossary/');
    await until(
      `document.querySelector('[data-filter-form]')?.hidden === false`
    );
    await evaluate(`location.hash = 'full-frame'`);
    await until(`location.hash === '#full-frame'`);
    await glossaryQuery('Full frame');
    assert.deepEqual(
      await evaluate(
        `[...document.querySelectorAll('[data-filter-item]:not([hidden])')].map(item => item.id)`
      ),
      ['full-frame']
    );
    await enter('#full-frame a[href="/glossary/#aps-c"]');
    // The fragment updates before the browser dispatches the hashchange event.
    await until(`location.hash === '#aps-c' &&
      !document.getElementById('aps-c').hidden &&
      document.activeElement.id === 'aps-c' &&
      document.querySelector('[data-filter-query]').value === ''`);

    await evaluate(`history.back()`);
    await until(
      `location.pathname === '/glossary/' && location.hash === '#full-frame' && !document.getElementById('full-frame').hidden`
    );
    console.log(
      'OK filtered glossary link reveals and focuses APS-C, clears its obstructing query, and preserves Back'
    );
    await navigate('/gear/fujifilm-x-t5/');
    assert.equal(
      await evaluate(`document.querySelectorAll('#classification dt').length`),
      7
    );
    assert.equal(
      await evaluate(`document.querySelectorAll('#classification dd').length`),
      7
    );
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-camera-classification]').length`
      ),
      7
    );
    assert.ok(
      await evaluate(
        `document.querySelector('#classification a[href="/glossary/x-trans/"]') !== null`
      )
    );
    await click('#classification a[href="/glossary/x-trans/"]');
    await until(`location.pathname === '/glossary/x-trans/'`);
    console.log(
      'OK bilingual abbreviation/alias glossary search and native reset; seven X-T5 dimensions link to concepts'
    );

    await search('/learn/', 'DSLR', '/glossary/dslr/');
    await search('/zh-cn/learn/', '单反', '/zh-cn/glossary/slr/');
    await search(
      '/zh-cn/learn/',
      '取景光路',
      '/zh-cn/learn/sensor-lens/camera-viewfinding/'
    );
    console.log(
      'OK actual Pagefind abbreviation, Chinese concept and optical-guide queries reach corresponding pages'
    );

    await evaluate(`localStorage.setItem('hs_theme', 'light')`);
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/tools/format-comparison/`);
      await until(
        `document.querySelector('[data-format-tool]')?.dataset.initialized === 'true' &&
          !document.documentElement.classList.contains('dark')`
      );
      // Native type-ahead selects APS-C in both languages without opening an OS menu.
      await key('[data-format-select="a"]', 'a', 'KeyA', 65, 'a');
      await until(
        `document.querySelector('[data-format-select="a"]').value === 'aps-c' && document.querySelector('[data-format-ratio]').textContent === '3.906'`
      );
      for (const a of FORMAT_PRESETS)
        for (const b of FORMAT_PRESETS) await assertFormat(a, b);
      await noOverflow(`${prefix}/tools/format-comparison/`);
    }
    console.log(
      'OK native keyboard format selection and all36 pairs in both languages: physical dimensions, area, crop factor and two visible outlines at one SVG scale'
    );

    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/learn/sensor-lens/camera-viewfinding/`);
      assert.equal(
        await evaluate(
          `new Set([...document.querySelectorAll('[data-optical-kind]')].map(node => node.dataset.opticalKind)).size`
        ),
        4
      );
      assert.equal(
        await evaluate(
          `getComputedStyle(document.querySelector('[data-optical-kind] ol li')).listStyleType`
        ),
        'decimal'
      );
      const exposureDetails = 'details:has([data-optical-state="exposure"])';
      const exposureNode = `document.querySelector(${JSON.stringify(exposureDetails)})`;
      assert.equal(await evaluate(`${exposureNode}.open`), false);
      // Native disclosure may keep the closed child's layout box. Measure its container.
      const collapsedHeight = await evaluate(
        `${exposureNode}.getBoundingClientRect().height`
      );
      await toggleSummary(`${exposureDetails} > summary`);
      assert.equal(await evaluate(`${exposureNode}.open`), true);
      assert.ok(
        await evaluate(
          `${exposureNode}.getBoundingClientRect().height > ${collapsedHeight}`
        )
      );
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-optical-kind] svg title').length`
        ),
        5
      );
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-optical-kind] svg desc').length`
        ),
        5
      );
    }
    console.log(
      'OK all4 optical paths, native SLR exposure disclosure, and text alternatives in both languages'
    );

    await viewport(390, 844);
    await navigate('/zh-cn/tools/format-comparison/');
    await until(
      `document.querySelector('[data-format-tool]')?.dataset.initialized === 'true'`
    );
    await click('[data-main-menu] > summary');
    if (
      !(await evaluate(`document.documentElement.classList.contains('dark')`))
    )
      await click('[data-hs-theme-click-value="dark"]');
    await until(`document.documentElement.classList.contains('dark')`);
    if (await evaluate(`document.querySelector('[data-main-menu]').open`))
      await click('[data-main-menu] > summary');
    await assertFormat(FORMAT_PRESETS[0], FORMAT_PRESETS[5]);
    await noOverflow('/zh-cn/tools/format-comparison/ dark390x844');
    await capture(
      call,
      evaluate,
      'format-comparison-zh-dark-390x844',
      '[data-format-controls]'
    );
    for (const [width, height] of [
      [390, 844],
      [683, 384],
      [320, 640],
    ]) {
      await viewport(width, height);
      for (const path of [
        '/zh-cn/cameras/',
        '/zh-cn/cameras/lens-system/',
        '/zh-cn/glossary/prime-lens/',
        '/zh-cn/tools/format-comparison/',
        '/zh-cn/learn/sensor-lens/camera-viewfinding/',
      ]) {
        await navigate(path);
        await noOverflow(`${path} at${width}x${height}`);
      }
    }
    await viewport(390, 844);
    await navigate('/zh-cn/learn/sensor-lens/camera-viewfinding/');
    await until(`document.documentElement.dataset.theme === 'dark'`);
    await capture(
      call,
      evaluate,
      'optical-paths-zh-dark-390x844',
      '[data-optical-kind="slr"]'
    );
    console.log(
      'OK actual dark mobile format tool with both outlines, 320px and 200%-equivalent layout'
    );

    await call('Emulation.setScriptExecutionDisabled', { value: true });
    await viewport(1366, 768);
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/cameras/`);
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-taxonomy-dimension]').length`
        ),
        16
      );
      await toggleSummary('[data-taxonomy-dimension] details > summary');
      assert.equal(
        await evaluate(
          `document.querySelector('[data-taxonomy-dimension] details').open`
        ),
        true
      );
      await navigate(`${prefix}/tools/format-comparison/`);
      assert.equal(
        await evaluate(
          `document.querySelector('[data-format-controls]').hidden`
        ),
        true
      );
      assert.equal(
        await evaluate(
          `document.querySelectorAll('[data-format-result]').length`
        ),
        2
      );
      assert.ok(
        await evaluate(
          `document.querySelector('[data-format-summary]').textContent.length > 20`
        )
      );
      assert.ok(
        await evaluate(
          `document.querySelector('noscript').textContent.includes('JavaScript')`
        )
      );
      assert.ok(
        await evaluate(
          `document.body.textContent.includes('120 × 96 mm') && document.body.textContent.includes('56 × 56 mm')`
        )
      );
      await toggleSummary('[data-format-tool] details > summary');
      assert.equal(
        await evaluate(
          `document.querySelector('[data-format-tool] details').open`
        ),
        true
      );
      await noOverflow(`${prefix}/tools/format-comparison/ without JavaScript`);
      await navigate(`${prefix}/learn/sensor-lens/camera-viewfinding/`);
      await toggleSummary(
        'details:has([data-optical-state="exposure"]) > summary'
      );
      assert.equal(
        await evaluate(
          `document.querySelector('details:has([data-optical-state="exposure"])').open`
        ),
        true
      );
    }
    console.log(
      'OK no-JavaScript taxonomy disclosure, physical dimensions/default comparison and optical exposition'
    );

    await call('Emulation.setScriptExecutionDisabled', { value: false });
    await call('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await call('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 1,
    });
    await navigate('/zh-cn/cameras/');
    await tap(call, evaluate, '[data-taxonomy-dimension] details > summary');
    await until(
      `document.querySelector('[data-taxonomy-dimension] details').open === true`
    );
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
    console.log('OK native touch disclosure at 390x844');
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
    await evaluate(
      `(() => { for (const [key, value] of Object.entries(${JSON.stringify(themes)})) { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } })()`
    );
    await viewport(1366, 768);
  }
}
