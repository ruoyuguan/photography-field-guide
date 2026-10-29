import assert from 'node:assert/strict';

async function setInput(evaluate, selector, value) {
  await evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    input.value = ${JSON.stringify(value)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
}

async function resultNumber(evaluate, selector) {
  const value = await evaluate(
    `document.querySelector(${JSON.stringify(selector)})?.textContent`
  );
  return Number(String(value).replace(/[^0-9eE+.-]/g, ''));
}

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
    element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      resolve({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }));
  })`);
  await call('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y }],
  });
  await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

export async function checkTools({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  await viewport(1440, 900);
  await navigate('/tools/crop-factor/');
  await until(
    `document.querySelector('[data-crop-tool] [data-interactive]')?.hidden === false && document.querySelector('[data-crop-tool] [data-results]')?.hidden === false`
  );
  await noOverflow('/tools/crop-factor/');
  const expectedDefault = 16 * (Math.hypot(36, 24) / Math.hypot(23.5, 15.6));
  const defaultEquivalent = await resultNumber(
    evaluate,
    '[data-result="equivalent"]'
  );
  assert.ok(Math.abs(defaultEquivalent - expectedDefault) < 0.011);
  assert.equal(
    await resultNumber(evaluate, '[data-result="nominal-equivalent"]'),
    24
  );
  assert.equal(await evaluate(`document.documentElement.lang`), 'en');

  await evaluate(`(() => {
    const original = document.querySelector('[data-crop-tool]');
    const clone = original.cloneNode(true);
    clone.dataset.initialized = 'false';
    clone.dataset.testClone = 'true';
    original.after(clone);
    document.dispatchEvent(new Event('astro:page-load'));
  })()`);
  await until(
    `document.querySelectorAll('[data-crop-tool][data-initialized="true"]').length === 2`
  );
  await evaluate(`(() => {
    const roots = document.querySelectorAll('[data-crop-tool]');
    const input = roots[1].querySelector('[data-field="focalLength"]');
    input.value = '50';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  const instances = await evaluate(
    `[...document.querySelectorAll('[data-crop-tool]')].map(root => root.querySelector('[data-result="equivalent"]').textContent)`
  );
  assert.ok(Math.abs(Number(instances[0]) - expectedDefault) < 0.011);
  assert.ok(
    Math.abs(Number(instances[1]) - (expectedDefault * 50) / 16) < 0.011
  );
  await evaluate(`document.querySelector('[data-test-clone]').remove()`);
  console.log('OK crop calculator defaults and isolated multiple instances');

  await arrowRight(call, evaluate, '[data-range-for="focalLength"]');
  await until(
    `document.querySelector('[data-field="focalLength"]').value === '16.1'`
  );
  await setInput(evaluate, '[data-field="focalLength"]', '50');
  await until(
    `document.querySelector('[data-range-for="focalLength"]').value === '50'`
  );
  assert.ok(
    Math.abs(
      (await resultNumber(evaluate, '[data-result="equivalent"]')) -
        (expectedDefault * 50) / 16
    ) < 0.011
  );
  await setInput(evaluate, '[data-field="focalLength"]', '');
  await until(
    `document.querySelector('[data-error-for="focalLength"]')?.hidden === false && document.querySelector('[data-crop-tool] [data-results]')?.hidden === true`
  );
  await click('[data-crop-tool] [data-reset]');
  await until(
    `document.querySelector('[data-field="focalLength"]').value === '16' && document.querySelector('[data-crop-tool] [data-results]')?.hidden === false`
  );
  await evaluate(`(() => {
    const axis = document.querySelector('[data-axis]');
    axis.value = 'vertical';
    axis.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await until(
    `document.querySelector('[data-angle-value]').textContent.includes('Vertical')`
  );
  console.log('OK crop slider keyboard, input sync, error, reset, and axis');

  await click('.language-picker summary');
  await until(
    `document.querySelector('a[href="/zh-cn/tools/crop-factor/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/tools/crop-factor/"]');
  await until(
    `location.pathname === '/zh-cn/tools/crop-factor/' && document.documentElement.lang === 'zh-CN'`
  );
  await setInput(evaluate, '[data-field="focalLength"]', '');
  await until(
    `document.querySelector('[data-error-for="focalLength"]')?.textContent.includes('请输入')`
  );
  await click('[data-crop-tool] [data-reset]');
  console.log('OK crop tool deep-language navigation and Chinese error');

  await navigate('/tools/exposure-stops/');
  await until(
    `document.querySelector('[data-exposure-tool] [data-interactive]')?.hidden === false && document.querySelector('[data-exposure-tool] [data-results]')?.hidden === false`
  );
  await noOverflow('/tools/exposure-stops/');
  assert.equal(
    await evaluate(
      `document.querySelector('[data-result="sensor-stops"]').textContent`
    ),
    '0.00'
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-result="output-stops"]').textContent`
    ),
    '+1.00'
  );
  await setInput(evaluate, '[data-field="after.fNumber"]', '4');
  await until(
    `document.querySelector('[data-result="sensor-stops"]').textContent === '-1.03'`
  );
  await setInput(evaluate, '[data-field="after.shutterSeconds"]', '1/250');
  await until(
    `document.querySelector('[data-result="sensor-stops"]').textContent === '-2.03'`
  );
  await setInput(evaluate, '[data-field="after.iso"]', '1600');
  await until(
    `document.querySelector('[data-result="output-stops"]').textContent === '-0.03'`
  );
  await click('[data-exposure-tool] [data-reset]');
  await until(
    `document.querySelector('[data-result="output-stops"]').textContent === '+1.00'`
  );
  await arrowRight(call, evaluate, '[data-range-for="after.iso"]');
  await until(
    `document.querySelector('[data-field="after.iso"]').value !== '800' && Number(document.querySelector('[data-result="output-stops"]').textContent) > 1`
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[data-result="sensor-stops"]').textContent`
    ),
    '0.00'
  );
  await setInput(evaluate, '[data-field="after.shutterSeconds"]', '1/0');
  await until(
    `document.querySelector('[data-error-for="after.shutterSeconds"]')?.hidden === false && document.querySelector('[data-exposure-tool] [data-results]')?.hidden === true`
  );
  await click('[data-exposure-tool] [data-reset]');
  console.log('OK exposure comparison, ISO separation, keyboard, and errors');

  await navigate('/zh-cn/tools/exposure-stops/');
  await until(
    `document.documentElement.lang === 'zh-CN' && document.querySelector('[data-exposure-tool] [data-results]')?.hidden === false`
  );
  assert.ok(
    await evaluate(
      `document.body.textContent.includes('单位传感器面积的光曝光')`
    )
  );
  await setInput(evaluate, '[data-field="after.iso"]', '0');
  await until(
    `document.querySelector('[data-error-for="after.iso"]')?.textContent.includes('大于零')`
  );
  await click('[data-exposure-tool] [data-reset]');
  console.log('OK Chinese exposure results and validation');

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  try {
    await navigate('/tools/crop-factor/');
    assert.equal(
      await evaluate(
        `document.querySelector('[data-crop-tool] [data-interactive]').hidden`
      ),
      true
    );
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('JavaScript is unavailable')`
      )
    );
    await navigate('/tools/exposure-stops/');
    assert.equal(
      await evaluate(
        `document.querySelector('[data-exposure-tool] [data-interactive]').hidden`
      ),
      true
    );
    assert.ok(
      await evaluate(
        `document.body.textContent.includes('doubling only ISO leaves light exposure unchanged')`
      )
    );
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
  }
  console.log('OK no-JavaScript explanations and hidden inactive controls');

  await viewport(390, 844);
  await call('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    for (const path of [
      '/tools/',
      '/zh-cn/tools/',
      '/tools/crop-factor/',
      '/zh-cn/tools/crop-factor/',
      '/tools/exposure-stops/',
      '/zh-cn/tools/exposure-stops/',
    ]) {
      await navigate(path);
      await noOverflow(path);
      console.log(`OK mobile tool layout ${path}`);
    }
    await navigate('/tools/crop-factor/');
    await setInput(evaluate, '[data-field="focalLength"]', '50');
    await tap(call, evaluate, '[data-crop-tool] [data-reset]');
    await until(
      `document.querySelector('[data-field="focalLength"]').value === '16'`
    );
  } finally {
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  console.log('OK mobile touch reset');

  await viewport(768, 1024);
  for (const path of ['/tools/crop-factor/', '/tools/exposure-stops/']) {
    await navigate(path);
    await noOverflow(path);
    console.log(`OK tablet tool layout ${path}`);
  }
}
