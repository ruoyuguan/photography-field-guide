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
    route: '/learn/workflow/lightweight-editing/',
    lang: 'en',
    title: 'Lightweight Editing: Exposure, White Balance, and Crop',
    other: '/zh-cn/learn/workflow/lightweight-editing/',
    markers: [
      'Three separate comparisons',
      'Editing changes a rendering, not the past',
      'Practice locally: three comparisons, one photograph',
      'not a three-filter recipe',
      'does not open, upload, or modify your photograph',
    ],
  },
  {
    locale: 'zh-cn',
    route: '/zh-cn/learn/workflow/lightweight-editing/',
    lang: 'zh-CN',
    title: '轻量后期：明暗、白平衡与裁切',
    other: '/learn/workflow/lightweight-editing/',
    markers: [
      '三组对照',
      '后期改变呈现，不能改变过去',
      '本地练习：一张照片，三组对照',
      '不是连续叠加三种效果的配方',
      '不会打开、上传或修改你的照片',
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
    ...test.markers,
  ]) {
    assert.ok(html.includes(marker), `${test.route}: missing ${marker}`);
  }
  for (const id of ['exposure', 'white-balance', 'crop']) {
    const start = html.indexOf(`data-editing-comparison="${id}"`);
    assert.notEqual(start, -1, `${test.route}: missing ${id} comparison`);
    const figure = html.slice(start, html.indexOf('</figure>', start));
    assert.equal(
      (figure.match(/<svg\b/g) ?? []).length,
      2,
      `${test.route}/${id}: expected a before/after pair`
    );
    assert.equal(
      (figure.match(/<desc\b/g) ?? []).length,
      2,
      `${test.route}/${id}: expected two text descriptions`
    );
    assert.equal(
      /<script\b|<img\b|<input\b/.test(figure),
      false,
      `${test.route}/${id}: illustrations need no script or third-party image`
    );
    for (const state of ['before', 'after']) {
      assert.ok(
        figure.includes(`data-editing-scene="${id}"`) &&
          figure.includes(`data-editing-state="${state}"`),
        `${test.route}/${id}: missing ${state} state`
      );
    }
  }
  assert.equal(
    (html.match(/data-editing-comparison=/g) ?? []).length,
    3,
    `${test.route}: expected exactly three separate comparisons`
  );
  assert.ok(
    html.includes(`<option value="${withBase(test.other)}"`),
    `${test.route}: missing corresponding-language option`
  );
  assert.ok(
    html.includes(
      `<link rel="canonical" href="https://ruoyuguan.github.io${withBase(test.route)}"`
    ),
    `${test.route}: canonical does not match the deployed route`
  );
  for (const link of [
    '/learn/workflow/backup-and-export/',
    '/learn/image-quality/raw-jpeg-exif/',
    '/learn/image-quality/white-balance/',
  ]) {
    const localized = test.locale === 'en' ? link : `/zh-cn${link}`;
    assert.ok(
      html.includes(`href="${withBase(localized)}"`),
      `${test.route}: missing related reading ${localized}`
    );
  }
  console.log(`OK lightweight editing content and fallback ${test.route}`);
}
console.log(`OK lightweight editing artifact checks (base ${BASE}).`);
