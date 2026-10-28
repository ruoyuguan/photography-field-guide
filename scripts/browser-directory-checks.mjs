import assert from 'node:assert/strict';

/** Directory, deep-language, and progressive-enhancement checks for the real browser. */
export async function checkDirectories({
  call,
  click,
  evaluate,
  navigate,
  noOverflow,
  until,
  viewport,
}) {
  await viewport(1440, 900);
  await navigate('/glossary/');
  await evaluate(`(() => {
    const input = document.querySelector('[data-filter-query]');
    input.value = '半画幅';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  assert.equal(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length`
    ),
    1,
    'Chinese alias should find APS-C on the English glossary'
  );
  assert.ok(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].find(item => !item.hidden).textContent.includes('APS-C')`
    )
  );
  await evaluate(`document.querySelector('[data-filter-form]').reset()`);
  await until(
    `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length === 34`
  );
  console.log('OK bilingual glossary aliases and native reset');

  await navigate('/zh-cn/galleries/');
  await evaluate(`(() => {
    const select = document.querySelector('[data-filter-key="scope"]');
    select.value = 'combination';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  assert.equal(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length`
    ),
    1
  );
  assert.ok(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].find(item => !item.hidden).textContent.includes('此条目仅指有明确标注的样片')`
    )
  );
  await evaluate(`(() => {
    const select = document.querySelector('[data-filter-key="exif"]');
    select.value = 'no';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  assert.equal(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length`
    ),
    0
  );
  assert.equal(
    await evaluate(`document.querySelector('[data-filter-empty]').hidden`),
    false
  );
  console.log(
    'OK gallery scope, EXIF, empty-result, and limited-evidence filters'
  );

  await navigate('/gear/fujifilm-x-t5/');
  await click('.hs-dropdown-toggle');
  await until(
    `document.querySelector('a[href="/zh-cn/gear/fujifilm-x-t5/"]')?.getBoundingClientRect().width > 0`
  );
  await click('a[href="/zh-cn/gear/fujifilm-x-t5/"]');
  await until(
    `location.pathname === '/zh-cn/gear/fujifilm-x-t5/' && document.documentElement.lang === 'zh-CN'`
  );
  assert.ok(
    await evaluate(`document.body.textContent.includes('23.5 × 15.7 mm')`)
  );
  console.log('OK equipment-page language switch preserves the deep route');

  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await navigate('/resources/');
  assert.equal(
    await evaluate(`document.querySelector('[data-filter-form]').hidden`),
    true
  );
  assert.equal(
    await evaluate(
      `[...document.querySelectorAll('[data-filter-item]')].filter(item => !item.hidden).length`
    ),
    13
  );
  assert.ok(
    await evaluate(
      `document.querySelector('noscript').textContent.includes('Filtering needs JavaScript')`
    )
  );
  await call('Emulation.setScriptExecutionDisabled', { value: false });
  console.log('OK resource directory remains complete without JavaScript');

  await viewport(390, 844);
  for (const path of [
    '/glossary/',
    '/zh-cn/galleries/',
    '/gear/fujifilm-xf16-50/',
    '/zh-cn/resources/',
    '/learn/getting-started/digital-camera-works/',
    '/learn/exposure/pasm-modes/',
    '/zh-cn/learn/exposure/exposure-compensation/',
    '/learn/image-quality/autofocus/',
    '/zh-cn/learn/image-quality/autofocus/',
    '/zh-cn/learn/image-quality/raw-jpeg-exif/',
    '/learn/image-quality/white-balance/',
    '/zh-cn/learn/image-quality/white-balance/',
    '/learn/image-quality/film-simulations/',
    '/zh-cn/learn/image-quality/film-simulations/',
  ]) {
    await navigate(path);
    await noOverflow(path);
    console.log(`OK mobile directory/article layout ${path}`);
  }
}
