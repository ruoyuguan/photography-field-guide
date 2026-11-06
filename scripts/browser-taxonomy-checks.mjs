import { tap } from './browser-touch.mjs';
import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { INSTANT_COMPARISON_PATH } from '../src/copy/recording-medium.ts';
import {
  FORMAT_PRESETS,
  HALF_FRAME_COMPARISON_PATH,
  findFormat,
} from '../src/utils/photography/format-comparison.ts';

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

/** Root-path browser regression for camera taxonomy and its linked lessons. */
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

    async function atCaseLink(path) {
      await until(
        `location.pathname + location.hash === ${JSON.stringify(path)} && document.readyState === 'complete'`
      );
    }
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/cameras/`);
      for (const model of [
        'fujifilm-x-t5',
        'fujifilm-gfx100rf',
        'nikon-d200',
      ]) {
        assert.equal(
          await evaluate(
            `document.querySelectorAll('[data-camera-example="${model}"] dt').length`
          ),
          4
        );
      }
      await click('[data-camera-example="fujifilm-gfx100rf"] a');
      await atCaseLink(`${prefix}/gear/fujifilm-gfx100rf/#classification`);
      assert.ok(
        await evaluate(
          `document.querySelector('main').innerText.includes('35 mm · f/4')`
        )
      );
      assert.ok(
        await evaluate(
          `document.querySelector('main').innerText.includes('43.8 × 32.9 mm')`
        )
      );
      await click('#classification a[href$="/cameras/#camera-examples"]');
      await atCaseLink(`${prefix}/cameras/#camera-examples`);
      await click('[data-camera-example="nikon-d200"] a');
      await atCaseLink(`${prefix}/gear/nikon-d200/#classification`);
      assert.ok(
        await evaluate(
          `document.querySelector('main').innerText.includes('23.6 × 15.8 mm')`
        )
      );
      await click('#classification a[href$="/glossary/ccd/"]');
      await atCaseLink(`${prefix}/glossary/ccd/`);
      await click('main a[href$="/gear/nikon-d200/#classification"]');
      await atCaseLink(`${prefix}/gear/nikon-d200/#classification`);
    }
    console.log('OK bilingual three-camera comparison and CCD example links');

    const challengeQuestions = [
      { id: 'format-and-viewfinder', term: 'dslr', correct: 3 },
      { id: 'fixed-lens-and-focus', term: 'fixed-lens', correct: 1 },
    ];
    const headingId = id => `classification-challenge-${id}`;
    const questionSelector = id =>
      `[data-taxonomy-question]:has(#${headingId(id)})`;
    const formatQuestion = questionSelector(challengeQuestions[0].id);
    const lensQuestion = questionSelector(challengeQuestions[1].id);
    for (const prefix of ['', '/zh-cn']) {
      await navigate(`${prefix}/cameras/`);
      await until(
        `document.querySelector('${formatQuestion} [data-taxonomy-answer-controls]').hidden === false`
      );
      assert.equal(
        await evaluate(
          `document.querySelector('#camera-examples').nextElementSibling.id`
        ),
        'classification-challenge'
      );

      const correct = prefix ? '答对了。' : 'Correct.';
      const incorrect = prefix ? '再想想。' : 'Try again.';
      for (const item of challengeQuestions) {
        const question = questionSelector(item.id);
        assert.equal(
          await evaluate(
            `document.querySelector('${question} [data-static-choices]').hidden`
          ),
          true
        );
        const responses = new Set();
        for (const position of [1, 2, 3]) {
          const choice = `${question} [data-taxonomy-choice]:nth-child(${position})`;
          await key(choice, ' ', 'Space', 32);
          const response = await evaluate(`(() => ({
            feedback: document.querySelector('${question} [role="status"]').textContent,
            selected: document.querySelector('${choice}').getAttribute('aria-pressed'),
            selectedCount: document.querySelectorAll('${question} [aria-pressed="true"]').length,
          }))()`);
          assert.ok(
            response.feedback.startsWith(
              position === item.correct ? correct : incorrect
            ),
            `${prefix || 'en'} ${item.id} choice ${position}: ${JSON.stringify(response)}`
          );
          assert.ok(response.feedback.length > 40);
          assert.equal(response.selected, 'true');
          assert.equal(response.selectedCount, 1);
          responses.add(response.feedback);
        }
        assert.equal(responses.size, 3);
      }

      const lensFeedback = await evaluate(
        `document.querySelector('${lensQuestion} [data-taxonomy-feedback]').textContent`
      );
      await key(`${formatQuestion} [data-taxonomy-retry]`, ' ', 'Space', 32);
      assert.ok(
        await evaluate(`document.activeElement === document.querySelector('${formatQuestion} [data-taxonomy-choice]') &&
        document.querySelector('${formatQuestion} [data-taxonomy-feedback]').textContent === '' &&
        document.querySelector('${formatQuestion} [data-taxonomy-retry]').hidden &&
        !document.querySelector('${formatQuestion} [aria-pressed="true"]')`)
      );
      assert.equal(
        await evaluate(
          `document.querySelector('${lensQuestion} [data-taxonomy-feedback]').textContent`
        ),
        lensFeedback
      );
      await key(
        `${formatQuestion} [data-taxonomy-choice]:nth-child(3)`,
        ' ',
        'Space',
        32
      );
      assert.ok(
        await evaluate(
          `document.querySelector('${formatQuestion} [data-taxonomy-feedback]').textContent.startsWith(${JSON.stringify(correct)})`
        )
      );

      for (const { id, term } of challengeQuestions) {
        await enter(`${questionSelector(id)} [data-taxonomy-reading]`);
        await atCaseLink(`${prefix}/glossary/${term}/`);
        await enter('[data-taxonomy-return]');
        await atCaseLink(`${prefix}/cameras/#${headingId(id)}`);
        await until(`document.activeElement.id === '${headingId(id)}'`);
        assert.ok(
          await evaluate(`document.activeElement.getBoundingClientRect().top >
          (document.querySelector('header.sticky')?.getBoundingClientRect().bottom ?? 0)`)
        );
      }
    }
    console.log(
      'OK bilingual classification questions, all six option explanations, independent retry and keyboard return to each question'
    );

    const halfFrame = findFormat('film-half-frame');
    const apsC = findFormat('aps-c');
    assert.ok(halfFrame && apsC);
    const assertInitialPair = () =>
      evaluate(`(() => {
      const dimensions = side => document.querySelector('[data-format-result="' + side + '"] [data-format-metric="dimensions"]').textContent.trim();
      const rect = side => {
        const element = document.querySelector('[data-format-rect="' + side + '"]');
        return Number(element.getAttribute('width')) / Number(element.getAttribute('height'));
      };
      return dimensions('a') === '17 × 24 mm' && dimensions('b') === '23.5 × 15.7 mm' &&
        rect('a') < 1 && rect('b') > 1 && document.querySelector('[data-format-ratio]').textContent.trim() === '0.904';
    })()`);
    for (const prefix of ['', '/zh-cn']) {
      const gearLink = `${prefix}/gear/pentax-17/#format-example`;
      await navigate(`${prefix}/cameras/`);
      await enter(
        `section:has(#film-half-frame-example) a[href="${gearLink}"]`
      );
      await atCaseLink(gearLink);
      assert.deepEqual(
        await evaluate(
          `[...document.querySelectorAll('section[aria-labelledby="gear-specifications"] dt')].map(element => element.textContent.trim())`
        ),
        prefix
          ? ['胶片曝光画面', '一体式镜头', '胶卷规格']
          : ['Film image area', 'Built-in lens', 'Film stock']
      );
      await enter(`main a[href="${prefix}${HALF_FRAME_COMPARISON_PATH}"]`);
      await atCaseLink(`${prefix}${HALF_FRAME_COMPARISON_PATH}`);
      await until(
        `document.querySelector('[data-format-tool]').dataset.initialized === 'true'`
      );
      assert.ok(await assertInitialPair());
      assert.deepEqual(
        await evaluate(
          `[...document.querySelectorAll('[data-format-select]')].map(select => select.value)`
        ),
        ['film-half-frame', 'aps-c']
      );
      await assertFormat(halfFrame, apsC);
      await enter(`main a[href="${gearLink}"]`);
      await atCaseLink(gearLink);
      await until(`document.activeElement.id === 'format-example'`);
    }
    await navigate(HALF_FRAME_COMPARISON_PATH);
    await click('.language-picker summary');
    await click(
      `.language-picker a[href="/zh-cn${HALF_FRAME_COMPARISON_PATH}"]`
    );
    await atCaseLink(`/zh-cn${HALF_FRAME_COMPARISON_PATH}`);
    assert.ok(await assertInitialPair());
    console.log(
      'OK bilingual Pentax case, same-scale preset, localized round trip and deep-language switch'
    );

    const recordingQuestion = '[data-recording-self-check] > summary';
    const recordingAnswer = '[data-recording-self-check] > p';
    async function assertRecordingFlows() {
      assert.deepEqual(
        await evaluate(`[...document.querySelectorAll('[data-recording-example]')]
        .map(card => [card.dataset.recordingExample, card.querySelectorAll('dt').length])`),
        [
          ['pentax-17', 3],
          ['instax-mini-99', 3],
          ['instax-mini-evo', 3],
        ]
      );
      assert.ok(
        await evaluate(`(() => {
        const section = document.querySelector('section[aria-labelledby="instant-film-comparison"]');
        return section.textContent.includes('62 × 46 mm') && section.textContent.includes('86 × 54 mm') &&
          section.querySelector('[data-recording-example="instax-mini-99"] dl').textContent.includes('instax mini') &&
          section.querySelector('[data-recording-example="instax-mini-evo"] dl').textContent.includes('microSD');
      })()`)
      );
    }
    for (const prefix of ['', '/zh-cn']) {
      const compare = `${prefix}${INSTANT_COMPARISON_PATH}`;
      const pentax = `${prefix}/gear/pentax-17/#format-example`;
      await navigate(`${prefix}/cameras/`);
      await enter(`#film-process a[href="${compare}"]`);
      await atCaseLink(compare);
      await until(`document.activeElement.id === 'instant-film-comparison'`);
      await assertRecordingFlows();
      await toggleSummary(recordingQuestion);
      assert.ok(
        await evaluate(
          `document.querySelector('${recordingAnswer}').innerText.includes(${JSON.stringify(prefix ? '机身内存' : 'internal memory')})`
        )
      );
      await enter(`[data-recording-example="pentax-17"] a[href="${pentax}"]`);
      await atCaseLink(pentax);
      await enter(`main a[href="${compare}"]`);
      await atCaseLink(compare);
    }
    await navigate('/cameras/recording-medium/');
    await click('.language-picker summary');
    await click('.language-picker a[href="/zh-cn/cameras/recording-medium/"]');
    await atCaseLink('/zh-cn/cameras/recording-medium/');
    await assertRecordingFlows();
    await capture(
      call,
      evaluate,
      'recording-medium-zh-1366x768',
      '#instant-film-comparison'
    );
    console.log(
      'OK bilingual recording paths, print dimensions, native answer and Pentax round trip'
    );

    const filmQuestion = '[data-film-process-self-check] > summary';
    const filmAnswer = '[data-film-process-self-check] > p';
    async function assertFilmComparison(prefix) {
      const bwNegative = prefix ? '黑白负片' : 'Black-and-white negative';
      const bwDevelopment = prefix ? '黑白冲洗' : 'B&W development';
      assert.deepEqual(
        await evaluate(`['hp5-plus', 'xp2-super'].map(id =>
          [...document.querySelectorAll('[data-film-process-example="' + id + '"] td')]
            .map(cell => cell.textContent.trim())
        )`),
        [
          [bwDevelopment, bwNegative],
          ['C-41', bwNegative],
        ]
      );
    }
    async function assertFilmAnswer(prefix) {
      const answer = await evaluate(
        `document.querySelector('${filmAnswer}').innerText`
      );
      assert.match(answer, /C-41/);
      assert.ok(
        answer.includes(prefix ? '另问扫描服务' : 'Ask for scans separately')
      );
    }
    for (const prefix of ['', '/zh-cn']) {
      const film = `${prefix}/cameras/film-process/`;
      const instant = `${prefix}${INSTANT_COMPARISON_PATH}`;
      await navigate(`${prefix}/cameras/`);
      await enter(`#film-process a[href="${film}"]`);
      await atCaseLink(film);
      await assertFilmComparison(prefix);
      await toggleSummary(filmQuestion);
      await assertFilmAnswer(prefix);
      await enter(`main a[href="${instant}"]`);
      await atCaseLink(instant);
      await enter(`main a[href="${film}"]`);
      await atCaseLink(film);
      const format = `${prefix}/cameras/format/`;
      await enter(`main a[href="${format}"]`);
      await atCaseLink(format);
      await enter(`main a[href="${film}"]`);
      await atCaseLink(film);
    }
    await navigate('/cameras/film-process/');
    await click('.language-picker summary');
    await click('.language-picker a[href="/zh-cn/cameras/film-process/"]');
    await atCaseLink('/zh-cn/cameras/film-process/');
    await assertFilmComparison('/zh-cn');
    await capture(
      call,
      evaluate,
      'film-process-zh-1366x768',
      '#film-process-examples'
    );
    console.log(
      'OK film process guide, bilingual deep link, keyboard self-check and round trips with recording medium and format'
    );

    await search('/learn/', 'XP2 Super', '/cameras/film-process/');
    await search(
      '/zh-cn/learn/',
      '胶片类型与工艺',
      '/zh-cn/cameras/film-process/'
    );
    await navigate('/cameras/film-process/');
    await viewport(320, 640);
    await noOverflow('/cameras/film-process/ at 320x640');
    await viewport(1366, 768);

    const shutterQuestion = '[data-shutter-self-check] > summary';
    const flashQuestion = '[data-flash-self-check] > summary';
    async function assertFlashGeometry() {
      const { full, slit } = await evaluate(`(() => {
        const read = id => {
          const panel = document.querySelector('[data-flash-panel="' + id + '"]');
          const attrs = selector => {
            const rect = panel.querySelector(selector);
            return Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Number(rect.getAttribute(key))]));
          };
          const opening = panel.querySelector('[data-flash-opening]');
          return {
            frame: attrs('[data-flash-frame]'),
            opening: attrs('[data-flash-opening]'),
            visible: opening.getBoundingClientRect().width > 0 && opening.getBoundingClientRect().height > 0,
          };
        };
        return { full: read('full-open'), slit: read('traveling-slit') };
      })()`);
      assert.ok(full.visible && slit.visible);
      assert.deepEqual(full.frame, slit.frame);
      assert.deepEqual(full.opening, full.frame);
      assert.equal(slit.opening.x, slit.frame.x);
      assert.equal(slit.opening.width, slit.frame.width);
      assert.ok(slit.opening.y > slit.frame.y);
      assert.ok(
        slit.opening.y + slit.opening.height < slit.frame.y + slit.frame.height
      );
    }
    async function assertFlashAnswer(prefix) {
      const answer = await evaluate(
        `document.querySelector('[data-flash-self-check] > p').innerText`
      );
      assert.ok(answer.includes(prefix ? '普通同步上限' : 'normal sync limit'));
      assert.ok(answer.includes(prefix ? '更慢的设置' : 'a slower one'));
    }
    async function assertShutterTiming() {
      const panels = await evaluate(`Object.fromEntries(
        [...document.querySelectorAll('[data-shutter-panel]')].map(panel => [
          panel.dataset.shutterPanel,
          [...panel.querySelectorAll('[data-shutter-exposure]')].map(bar => ({
            start: Number(bar.getAttribute('x')),
            duration: Number(bar.getAttribute('width')),
            visible: bar.getBoundingClientRect().width > 0,
          })),
        ])
      )`);
      const [long, short, global] = [
        panels['rolling-long'],
        panels['rolling-short'],
        panels['global-short'],
      ];
      for (const rows of [long, short, global]) {
        assert.equal(rows.length, 3);
        assert.ok(
          rows.every(
            row =>
              row.visible &&
              row.duration > 0 &&
              row.duration === rows[0].duration
          )
        );
      }
      assert.ok(long[0].start < long[1].start && long[1].start < long[2].start);
      assert.deepEqual(
        short.map(row => row.start),
        long.map(row => row.start)
      );
      assert.ok(short[0].duration < long[0].duration);
      assert.ok(
        global.every(
          row =>
            row.start === global[0].start && row.duration === short[0].duration
        )
      );
    }
    async function assertShutterAnswer(prefix) {
      const answer = await evaluate(
        `document.querySelector('[data-shutter-self-check] > p').innerText`
      );
      assert.ok(
        answer.includes(prefix ? '边缘可能更清晰' : 'edges can look sharper')
      );
      assert.ok(
        answer.includes(prefix ? '仍可能看起来是斜的' : 'can still lean')
      );
    }
    for (const prefix of ['', '/zh-cn']) {
      const shutter = `${prefix}/cameras/shutter/`;
      await navigate(`${prefix}/cameras/`);
      await enter(`#shutter a[href="${shutter}"]`);
      await atCaseLink(shutter);
      await assertShutterTiming();
      await toggleSummary(shutterQuestion);
      await assertShutterAnswer(prefix);
      for (const lesson of [
        `${prefix}/learn/exposure/shutter-speed/`,
        `${prefix}/learn/getting-started/digital-camera-works/`,
      ]) {
        await enter(`main a[href="${lesson}"]`);
        await atCaseLink(lesson);
        await enter('main a[href$="/cameras/shutter/#shutter-timing"]');
        await atCaseLink(`${shutter}#shutter-timing`);
      }
      await enter('main a[href="#flash-sync"]');
      await atCaseLink(`${shutter}#flash-sync`);
      await until(`document.activeElement.id === 'flash-sync'`);
      await assertFlashGeometry();
      await toggleSummary(flashQuestion);
      await assertFlashAnswer(prefix);
      const lesson = `${prefix}/learn/exposure/shutter-speed/`;
      await enter(`main a[href="${lesson}"]`);
      await atCaseLink(lesson);
      await enter('main a[href$="/cameras/shutter/#flash-sync"]');
      await atCaseLink(`${shutter}#flash-sync`);
    }
    await navigate('/cameras/shutter/');
    await click('.language-picker summary');
    await click('.language-picker a[href="/zh-cn/cameras/shutter/"]');
    await atCaseLink('/zh-cn/cameras/shutter/');
    await assertShutterTiming();
    await capture(
      call,
      evaluate,
      'shutter-timing-zh-1366x768',
      '#shutter-timing'
    );
    await capture(call, evaluate, 'flash-sync-zh-1366x768', '#flash-sync');
    await search('/learn/', 'flash sync', '/cameras/shutter/');
    await search('/zh-cn/learn/', '闪光同步', '/zh-cn/cameras/shutter/');
    console.log(
      'OK flash sync coverage geometry, anchored lesson return, keyboard answer and bilingual search'
    );
    await search('/learn/', 'shutter systems', '/cameras/shutter/');
    await search('/zh-cn/learn/', '快门系统', '/zh-cn/cameras/shutter/');
    console.log(
      'OK shutter timing geometry, keyboard self-check, lesson round trips and bilingual search'
    );

    const focusChoice = (scenario, choice) =>
      `[data-focus-case="${scenario}"] [data-focus-choice="${choice}"]`;
    async function readFocusChoice(scenario, choice, expected) {
      const selector = focusChoice(scenario, choice);
      await toggleSummary(`${selector} > summary`);
      const feedback = await evaluate(
        `document.querySelector('${selector} > p').innerText`
      );
      assert.ok(feedback.includes(expected), feedback);
    }
    for (const prefix of ['', '/zh-cn']) {
      const focus = `${prefix}/cameras/focusing/`;
      const pentax = `${prefix}/gear/pentax-17/#classification`;
      const lesson = `${prefix}/learn/image-quality/autofocus/`;
      await navigate(`${prefix}/cameras/`);
      await enter(`#focusing a[href="${focus}"]`);
      await atCaseLink(focus);
      await readFocusChoice(
        'too-close',
        'half-press',
        prefix ? '无法把对焦距离调近' : 'cannot move its focus closer'
      );
      await readFocusChoice(
        'too-close',
        'step-back',
        prefix ? '进入建议的拍摄距离' : 'in the recommended distance range'
      );
      await readFocusChoice(
        'pentax-zone',
        'af-area',
        prefix ? '画面的哪里找主体' : 'where an AF camera looks in the frame'
      );
      await readFocusChoice(
        'pentax-zone',
        'nearer-preset',
        prefix ? '选较近的距离档' : 'Turn the zone ring'
      );
      await readFocusChoice(
        'approaching',
        'af-s',
        prefix ? '保持该距离' : 'holds that distance'
      );
      await readFocusChoice(
        'approaching',
        'af-c',
        prefix
          ? '随主体距离变化更新'
          : 'keeps updating for changes in subject distance'
      );
      assert.deepEqual(
        await evaluate(
          `[...document.querySelectorAll('[data-focus-choice][open]')].map(details => details.dataset.focusChoice)`
        ),
        ['step-back', 'nearer-preset', 'af-c']
      );
      await enter(`[data-focus-method="manual-zones"] a[href="${pentax}"]`);
      await atCaseLink(pentax);
      await enter(`[data-camera-classification="focusing"] a[href="${focus}"]`);
      await atCaseLink(focus);
      await enter(`main a[href="${lesson}"]`);
      await atCaseLink(lesson);
      await enter('main a[href$="/cameras/focusing/#focus-distance"]');
      await atCaseLink(`${focus}#focus-distance`);
    }
    await navigate('/cameras/focusing/');
    await click('.language-picker summary');
    await click('.language-picker a[href="/zh-cn/cameras/focusing/"]');
    await atCaseLink('/zh-cn/cameras/focusing/');
    await capture(
      call,
      evaluate,
      'focusing-guide-zh-1366x768',
      '#focus-distance'
    );
    await search('/learn/', 'focusing systems', '/cameras/focusing/');
    await search('/zh-cn/learn/', '对焦系统', '/zh-cn/cameras/focusing/');
    console.log(
      'OK focusing guide and both-language option feedback, independent cases, links and search'
    );

    const formChoice = (scenario, choice) =>
      `[data-camera-form-case="${scenario}"] [data-camera-form-choice="${choice}"]`;
    async function readFormChoice(scenario, choice, expected) {
      const selector = formChoice(scenario, choice);
      await toggleSummary(`${selector} > summary`);
      const feedback = await evaluate(
        `document.querySelector('${selector} > p').innerText`
      );
      assert.ok(feedback.includes(expected), feedback);
    }
    async function assertCarryComparison() {
      const comparison =
        await evaluate(`[...document.querySelectorAll('[data-camera-form-example]')].map(card => {
        const bar = card.querySelector('[data-camera-form-mass-bar]');
        const mass = card.querySelector('[data-camera-form-mass]');
        return {
          id: card.dataset.cameraFormExample,
          grams: Number(mass.dataset.cameraFormMass),
          fraction: bar.getBoundingClientRect().width / bar.parentElement.getBoundingClientRect().width
        };
      })`);
      assert.deepEqual(
        comparison.map(({ id, grams }) => [id, grams]),
        [
          ['rx100-vii', 302],
          ['p950', 1005],
          ['x-t5-kit', 797],
        ]
      );
      for (const { grams, fraction } of comparison)
        closeTo(fraction, grams / 1005, 0.002);
    }
    for (const prefix of ['', '/zh-cn']) {
      const form = `${prefix}/cameras/form-factor/`;
      const lensSystem = `${prefix}/cameras/lens-system/`;
      const gear = `${prefix}/gear/fujifilm-x-t5/#classification`;
      const lens = `${prefix}/gear/fujifilm-xf16-50/`;
      await navigate(`${prefix}/cameras/`);
      await enter(`#form-factor a[href="${form}"]`);
      await atCaseLink(form);
      await assertCarryComparison();
      await readFormChoice(
        'small-bag',
        'body-only',
        prefix ? '还要带上镜头' : 'the lens still has to fit'
      );
      await readFormChoice('small-bag', 'assembled-kit', '797 g');
      await readFormChoice(
        'one-lens',
        'form-label',
        prefix ? '也称它为桥式相机' : 'calls it a bridge camera'
      );
      await readFormChoice(
        'one-lens',
        'equivalent-range',
        prefix ? '长焦端能取更窄' : 'gives a tighter view'
      );
      assert.deepEqual(
        await evaluate(
          `[...document.querySelectorAll('[data-camera-form-choice][open]')].map(details => details.dataset.cameraFormChoice)`
        ),
        ['assembled-kit', 'equivalent-range']
      );
      await enter(`[data-camera-form-example="x-t5-kit"] a[href="${lens}"]`);
      await atCaseLink(lens);
      await navigate(form);
      await enter(`[data-camera-form-example="x-t5-kit"] a[href="${gear}"]`);
      await atCaseLink(gear);
      await enter(
        `[data-camera-classification="lens-system"] a[href="${lensSystem}"]`
      );
      await atCaseLink(lensSystem);
      await enter(`main a[href="${form}"]`);
      await atCaseLink(form);
    }
    await navigate('/cameras/form-factor/');
    await click('.language-picker summary');
    await click('.language-picker a[href="/zh-cn/cameras/form-factor/"]');
    await atCaseLink('/zh-cn/cameras/form-factor/');
    await capture(
      call,
      evaluate,
      'camera-forms-zh-1366x768',
      '#camera-form-examples'
    );
    await search('/learn/', 'body product form', '/cameras/form-factor/');
    await search(
      '/zh-cn/learn/',
      '机身与产品形态',
      '/zh-cn/cameras/form-factor/'
    );
    console.log(
      'OK camera form kit masses and common scale, bilingual options, search and gear links'
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
      `OK native keyboard format selection and all ${FORMAT_PRESETS.length ** 2} pairs in both languages: physical dimensions, area, crop factor and two visible outlines at one SVG scale`
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
        '/zh-cn/cameras/recording-medium/',
        '/zh-cn/cameras/film-process/',
        '/cameras/shutter/',
        '/zh-cn/cameras/shutter/',
        '/cameras/focusing/',
        '/zh-cn/cameras/focusing/',
        '/cameras/form-factor/',
        '/zh-cn/cameras/form-factor/',
        '/zh-cn/glossary/prime-lens/',
        '/zh-cn/gear/fujifilm-gfx100rf/',
        '/zh-cn/gear/nikon-d200/',
        '/zh-cn/gear/pentax-17/',
        `/zh-cn${HALF_FRAME_COMPARISON_PATH}`,
        '/zh-cn/tools/format-comparison/',
        '/zh-cn/learn/sensor-lens/camera-viewfinding/',
      ]) {
        await navigate(path);
        await noOverflow(`${path} at${width}x${height}`);
      }
    }
    await viewport(390, 844);
    await navigate(`/zh-cn${HALF_FRAME_COMPARISON_PATH}`);
    await until(`document.documentElement.classList.contains('dark') &&
      document.querySelector('[data-format-tool]').dataset.initialized === 'true'`);
    assert.ok(await assertInitialPair());
    await capture(
      call,
      evaluate,
      'pentax-half-frame-zh-dark-390x844',
      '[data-format-controls]'
    );
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
      for (const { id, term } of challengeQuestions) {
        const question = questionSelector(id);
        assert.ok(
          await evaluate(`document.querySelector('${question} [data-taxonomy-answer-controls]').hidden &&
          !document.querySelector('${question} [data-static-choices]').hidden &&
          document.querySelectorAll('${question} [data-static-choices] li').length === 3`)
        );
        await toggleSummary(`${question} [data-taxonomy-answer] > summary`);
        assert.ok(
          await evaluate(`document.querySelector('${question} [data-taxonomy-answer]').open &&
          document.querySelector('${question} [data-taxonomy-answer] p').textContent.trim().length > 40`)
        );
        await enter(`${question} [data-taxonomy-reading]`);
        await atCaseLink(`${prefix}/glossary/${term}/`);
        await enter('[data-taxonomy-return]');
        await atCaseLink(`${prefix}/cameras/#${headingId(id)}`);
      }
      await navigate(`${prefix}/cameras/recording-medium/`);
      await assertRecordingFlows();
      await toggleSummary(recordingQuestion);
      assert.ok(
        await evaluate(
          `document.querySelector('${recordingAnswer}').innerText.includes(${JSON.stringify(prefix ? '机身内存' : 'internal memory')})`
        )
      );
      await navigate(`${prefix}/cameras/film-process/`);
      await assertFilmComparison(prefix);
      await toggleSummary(filmQuestion);
      await assertFilmAnswer(prefix);
      await navigate(`${prefix}/cameras/shutter/`);
      await assertShutterTiming();
      await toggleSummary(shutterQuestion);
      await assertShutterAnswer(prefix);
      await toggleSummary(flashQuestion);
      await assertFlashAnswer(prefix);
      await navigate(`${prefix}/cameras/focusing/`);
      await readFocusChoice(
        'pentax-zone',
        'af-area',
        prefix ? '画面的哪里找主体' : 'where an AF camera looks in the frame'
      );
      await readFocusChoice(
        'pentax-zone',
        'nearer-preset',
        prefix ? '选较近的距离档' : 'Turn the zone ring'
      );
      await navigate(`${prefix}/cameras/form-factor/`);
      await readFormChoice(
        'small-bag',
        'body-only',
        prefix ? '还要带上镜头' : 'the lens still has to fit'
      );
      await readFormChoice('small-bag', 'assembled-kit', '797 g');
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
      await navigate(`${prefix}${HALF_FRAME_COMPARISON_PATH}`);
      assert.equal(
        await evaluate(
          `document.querySelector('[data-format-controls]').hidden`
        ),
        true
      );
      assert.ok(await assertInitialPair());
      await enter(`main a[href="${prefix}/gear/pentax-17/#format-example"]`);
      await atCaseLink(`${prefix}/gear/pentax-17/#format-example`);
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
      'OK no-JavaScript taxonomy disclosure, challenge answers and return links, physical dimensions and optical exposition'
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
    await until(
      `document.querySelector('${lensQuestion} [data-taxonomy-answer-controls]').hidden === false`
    );
    await tap(
      call,
      evaluate,
      `${lensQuestion} [data-taxonomy-choice]:nth-child(2)`
    );
    await until(
      `document.querySelector('${lensQuestion} [data-taxonomy-feedback]').textContent.startsWith('再想想。')`
    );
    assert.ok(
      await evaluate(`(() => {
      const rect = document.querySelector('${lensQuestion} [data-taxonomy-feedback]').getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    })()`)
    );
    await noOverflow('/zh-cn/cameras/ classification challenge at 390x844');
    await until(`document.documentElement.classList.contains('dark')`);
    await capture(
      call,
      evaluate,
      'classification-challenge-zh-dark-390x844',
      lensQuestion
    );
    await tap(call, evaluate, `${lensQuestion} [data-taxonomy-retry]`);
    await until(
      `document.querySelector('${lensQuestion} [data-taxonomy-feedback]').textContent === ''`
    );
    await navigate('/zh-cn/cameras/recording-medium/');
    await tap(call, evaluate, recordingQuestion);
    await until(`document.querySelector('[data-recording-self-check]').open &&
      document.querySelector('${recordingAnswer}').innerText.includes('机身内存')`);
    await noOverflow('/zh-cn/cameras/recording-medium/ at 390x844');
    await navigate('/zh-cn/cameras/film-process/');
    await tap(call, evaluate, filmQuestion);
    await until(
      `document.querySelector('[data-film-process-self-check]').open`
    );
    await assertFilmAnswer('/zh-cn');
    await noOverflow('/zh-cn/cameras/film-process/ at 390x844');
    await capture(
      call,
      evaluate,
      'film-process-zh-dark-390x844',
      '#film-process-examples'
    );
    await navigate('/zh-cn/cameras/shutter/');
    await tap(call, evaluate, shutterQuestion);
    await until(`document.querySelector('[data-shutter-self-check]').open`);
    await assertShutterAnswer('/zh-cn');
    await noOverflow('/zh-cn/cameras/shutter/ at 390x844');
    await capture(
      call,
      evaluate,
      'shutter-timing-zh-dark-390x844',
      '[data-shutter-panel="rolling-long"]'
    );
    await tap(call, evaluate, flashQuestion);
    await until(`document.querySelector('[data-flash-self-check]').open`);
    await assertFlashAnswer('/zh-cn');
    await noOverflow('/zh-cn/cameras/shutter/#flash-sync at 390x844');
    await capture(
      call,
      evaluate,
      'flash-sync-zh-dark-390x844',
      '[data-flash-panel="full-open"]'
    );
    await navigate('/zh-cn/cameras/focusing/');
    const mobileFocusChoice = focusChoice('approaching', 'af-c');
    await tap(call, evaluate, `${mobileFocusChoice} > summary`);
    await until(`document.querySelector('${mobileFocusChoice}').open &&
      document.querySelector('${mobileFocusChoice} > p').innerText.includes('随主体距离变化更新')`);
    await noOverflow('/zh-cn/cameras/focusing/ at 390x844');
    await capture(
      call,
      evaluate,
      'focusing-check-zh-dark-390x844',
      '[data-focus-case="approaching"]'
    );
    await navigate('/zh-cn/cameras/form-factor/');
    const mobileFormChoice = formChoice('small-bag', 'assembled-kit');
    await tap(call, evaluate, `${mobileFormChoice} > summary`);
    await until(`document.querySelector('${mobileFormChoice}').open &&
      document.querySelector('${mobileFormChoice} > p').innerText.includes('797 g')`);
    await noOverflow('/zh-cn/cameras/form-factor/ at 390x844');
    await capture(
      call,
      evaluate,
      'camera-forms-check-zh-dark-390x844',
      '[data-camera-form-case="small-bag"]'
    );
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
    console.log(
      'OK native touch disclosures, challenge feedback and retry, and all taxonomy self-checks at 390x844'
    );
  } finally {
    await call('Emulation.setScriptExecutionDisabled', { value: false });
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
    await evaluate(
      `(() => { for (const [key, value] of Object.entries(${JSON.stringify(themes)})) { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } })()`
    );
    await viewport(1366, 768);
  }
}
