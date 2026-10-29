import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DIST = resolve(new URL('../dist/', import.meta.url).pathname);
const BASE = process.env.SITE_BASE
  ? `/${process.env.SITE_BASE.replace(/^\/+|\/+$/g, '')}`
  : '/';
const withBase = route => (BASE === '/' ? route : `${BASE}${route}`);
const cases = [
  {
    locale: 'en',
    route: '/practice/lightweight-editing/',
    other: '/zh-cn/practice/lightweight-editing/',
    lesson: '/learn/workflow/lightweight-editing/',
    lang: 'en',
    title: 'Lightweight Editing Practice: Three Comparisons',
    markers: [
      'Practice C6',
      'Predict before you adjust',
      'A protected original shows a dark face',
      'Compare three variables, one at a time',
      'actual pixel dimensions',
      'Review your decisions, not a score',
      'This is a process review, not a score for your photograph.',
    ],
  },
  {
    locale: 'zh-cn',
    route: '/zh-cn/practice/lightweight-editing/',
    other: '/practice/lightweight-editing/',
    lesson: '/zh-cn/learn/workflow/lightweight-editing/',
    lang: 'zh-CN',
    title: '轻量后期练习：一张照片，三组对照',
    markers: [
      '练习 C6',
      '调整之前先预测',
      '受保护的原片中，人脸偏暗',
      '三个变量，每次只比较一个',
      '实际像素尺寸',
      '复盘决定，不给照片打分',
      '这是流程复盘，不是给照片打分。',
    ],
  },
];

for (const test of cases) {
  const html = await readFile(
    resolve(DIST, test.route.replace(/^\//, ''), 'index.html'),
    'utf8'
  );
  for (const marker of [
    `<html lang="${test.lang}"`,
    test.title,
    'data-lightweight-editing-practice',
    ...test.markers,
  ])
    assert.ok(html.includes(marker), `${test.route}: missing ${marker}`);

  assert.equal(
    (html.match(/data-prediction-choice(?:=|\s|>)/g) ?? []).length,
    3,
    `${test.route}: expected three prediction choices`
  );
  assert.equal(
    (html.match(/data-observation-step=/g) ?? []).length,
    3,
    `${test.route}: expected three local operations`
  );
  assert.equal(
    (html.match(/data-reflection-check=/g) ?? []).length,
    3,
    `${test.route}: expected three self-review checks`
  );
  assert.equal(
    (html.match(/data-editing-comparison=/g) ?? []).length,
    3,
    `${test.route}: expected three optional concept pairs`
  );
  assert.equal(
    (html.match(/<svg\b/g) ?? []).length >= 6,
    true,
    `${test.route}: missing accessible concept illustrations`
  );
  for (const id of [
    'protect-source-state-purpose',
    'compare-and-undo-separately',
    'export-and-inspect-derivative',
  ])
    assert.ok(html.includes(id), `${test.route}: missing operation ${id}`);

  assert.ok(
    html.includes(
      `<link rel="canonical" href="https://ruoyuguan.github.io${withBase(test.route)}"`
    ),
    `${test.route}: canonical does not match deployed route`
  );
  assert.ok(
    html.includes(
      `<link rel="alternate" hreflang="${test.locale === 'en' ? 'zh-CN' : 'en'}" href="https://ruoyuguan.github.io${withBase(test.other)}"`
    ),
    `${test.route}: missing language alternate`
  );
  assert.ok(
    html.includes(`href="${withBase(test.lesson)}"`),
    `${test.route}: missing lesson return link`
  );
  assert.ok(
    html.includes('data-prediction-form') &&
      html.includes('data-editing-static'),
    `${test.route}: missing interactive and static fallback representations`
  );
  assert.ok(
    html.includes('<noscript>'),
    `${test.route}: missing no-script help`
  );
  for (const forbidden of [
    '<input type="file"',
    '<textarea',
    'data-practice-mission',
    'data-next-mission',
    'fetch(',
  ])
    assert.equal(
      html.includes(forbidden),
      false,
      `${test.route}: unexpected ${forbidden}`
    );

  const lessonHtml = await readFile(
    resolve(DIST, test.lesson.replace(/^\//, ''), 'index.html'),
    'utf8'
  );
  assert.ok(
    lessonHtml.includes(`href="${withBase(test.route)}"`) ||
      lessonHtml.includes('href="../../../practice/lightweight-editing/"'),
    `${test.lesson}: missing standalone practice link`
  );
  console.log(`OK standalone C6 artifact and lesson link ${test.route}`);
}
console.log(`OK lightweight-editing practice artifact checks (base ${BASE}).`);
