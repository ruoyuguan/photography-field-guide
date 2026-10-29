import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve } from 'node:path';

const DIST = resolve(new URL('../dist/', import.meta.url).pathname);
const BASE = process.env.SITE_BASE
  ? `/${process.env.SITE_BASE.replace(/^\/+|\/+$/g, '')}`
  : '/';
const withBase = route =>
  BASE === '/' ? route : `${BASE}${route === '/' ? '/' : route}`;
const LOCALIZED_ROUTES = [
  '/',
  '/learn/',
  '/learn/getting-started/what-is-photography/',
  '/learn/getting-started/digital-camera-works/',
  '/learn/sensor-lens/sensor-formats/',
  '/learn/sensor-lens/equivalent-focal-length/',
  '/learn/sensor-lens/depth-of-field/',
  '/learn/exposure/aperture/',
  '/learn/exposure/shutter-speed/',
  '/learn/exposure/iso/',
  '/learn/exposure/exposure-stops/',
  '/learn/exposure/pasm-modes/',
  '/learn/exposure/exposure-compensation/',
  '/learn/exposure/exposure-triangle/',
  '/learn/image-quality/raw-jpeg-exif/',
  '/learn/image-quality/autofocus/',
  '/learn/image-quality/white-balance/',
  '/learn/image-quality/film-simulations/',
  '/learn/composition/understanding-light/',
  '/learn/composition/subject-and-background/',
  '/learn/field-practice/neighborhood-story/',
  '/learn/field-practice/photo-review/',
  '/practice/',
  '/practice/light-direction/',
  '/practice/subject-background/',
  '/practice/neighborhood-story/',
  '/practice/photo-review/',
  '/practice/backup-and-export/',
  '/learn/workflow/lightweight-editing/',
  '/practice/lightweight-editing/',
  '/learn/workflow/backup-and-export/',
  '/tools/',
  '/tools/crop-factor/',
  '/tools/exposure-stops/',
  '/glossary/',
  '/gear/',
  '/gear/fujifilm-x-t5/',
  '/gear/fujifilm-xf16-50/',
  '/galleries/',
  '/resources/',
  '/about/',
];
const ROUTES = [
  ...LOCALIZED_ROUTES,
  '/zh-cn/',
  ...LOCALIZED_ROUTES.filter(route => route !== '/').map(
    route => `/zh-cn${route}`
  ),
  '/404',
  '/zh-cn/404/',
];
const MISSING_ROUTES = [
  '/does-not-exist/',
  '/zh-cn/does-not-exist/',
  '/start-here/',
  '/basics/sensor-formats/',
  '/basics/equivalent-focal-length/',
  '/basics/exposure-triangle/',
  '/zh-cn/start-here/',
  '/zh-cn/basics/sensor-formats/',
];
const EXPECTATIONS = {
  '/': [
    '<html lang="en"',
    'content="en_US"',
    'hreflang="zh-CN"',
    'Photography Field Guide',
    'Understand your camera.',
    'data-sensor-diagram="36x24:23.5x15.7"',
    'width="360" height="240"',
    'width="235" height="157"',
  ],
  '/zh-cn/': [
    '<html lang="zh-CN"',
    'content="zh_CN"',
    'hreflang="en"',
    '理解你的相机。',
    '10 个 SVG 单位代表 1 mm',
  ],
  '/learn/': [
    '<html lang="en"',
    'Start Here',
    `href="${withBase('/learn/sensor-lens/sensor-formats/')}"`,
  ],
  '/zh-cn/learn/': [
    '<html lang="zh-CN"',
    '从这里开始',
    '传感器与镜头',
    '曝光基础',
    `href="${withBase('/zh-cn/learn/sensor-lens/sensor-formats/')}"`,
  ],
  '/learn/sensor-lens/sensor-formats/': ['Sensor Formats', '36 × 24 mm'],
  '/zh-cn/learn/sensor-lens/sensor-formats/': [
    '全画幅、APS-C 与传感器画幅',
    '36 × 24 mm',
  ],
  '/learn/sensor-lens/equivalent-focal-length/': ['50 mm × 1.5 = 75 mm'],
  '/zh-cn/learn/sensor-lens/equivalent-focal-length/': [
    '50 mm × 1.5 = 全画幅上的 75 mm',
  ],
  '/learn/exposure/exposure-triangle/': ['The Exposure Triangle'],
  '/zh-cn/learn/exposure/exposure-triangle/': ['曝光三角'],
  '/learn/image-quality/white-balance/': [
    'White Balance and Color Temperature',
    '2500–10000 K',
    'role="img"',
  ],
  '/zh-cn/learn/image-quality/white-balance/': [
    '白平衡与色温',
    '白平衡与曝光回答不同的问题',
    '<strong>简短回答：</strong>',
    '仅为概念插图，不代表实测色彩变换。',
  ],
  '/learn/image-quality/film-simulations/': [
    'Film Simulations, Recipes, and RAW Development',
    'A recipe is a hypothesis to test',
    'RAW CONVERSION',
  ],
  '/zh-cn/learn/image-quality/film-simulations/': [
    '胶片模拟、配方与 RAW 显影',
    '配方是一个待检验的假设',
    '<strong>简短回答：</strong>',
    '不是色彩或胶片匹配模拟',
  ],
  '/learn/composition/understanding-light/': [
    'Understanding Light',
    'Concept model only',
  ],
  '/zh-cn/learn/composition/understanding-light/': [
    '看懂光线',
    '不是实测光照模拟',
  ],
  '/learn/composition/subject-and-background/': [
    'Subject and Background',
    'not an exact perspective simulation',
  ],
  '/zh-cn/learn/composition/subject-and-background/': [
    '主体与背景',
    '不是精确透视模拟',
    '<strong>简短回答：</strong>',
  ],
  '/learn/field-practice/neighborhood-story/': [
    'Tell a Place in Three Photos',
    'not sample photographs',
    'Environment',
  ],
  '/zh-cn/learn/field-practice/neighborhood-story/': [
    '用三张照片讲一个地方',
    '不是实拍样片',
    '<strong>简短回答：</strong>',
  ],
  '/learn/field-practice/photo-review/': [
    'Select Photos and Review a Shoot',
    'not sample photographs or real EXIF',
    'data-review-model',
  ],
  '/zh-cn/learn/field-practice/photo-review/': [
    '照片筛选与复盘',
    '不是实拍样片或真实 EXIF',
    '<strong>简短回答：</strong>',
  ],
  '/practice/': [
    'Photography missions',
    'Three photos, one place',
    'Select, review, reshoot',
    'data-practice-index',
  ],
  '/zh-cn/practice/': [
    '摄影任务',
    '三张照片，一个地方',
    '筛选、复盘、再拍',
    'data-practice-index',
  ],
  '/practice/light-direction/': [
    'Light detective',
    'Suggested next practice',
    'data-practice-mission',
    'data-prediction-form',
  ],
  '/zh-cn/practice/light-direction/': ['光线侦探', 'data-direction-control'],
  '/practice/subject-background/': [
    'Frame cleanup',
    'Mission 02',
    'data-framing-model',
    'Suggested next practice',
  ],
  '/zh-cn/practice/subject-background/': [
    '整理画面',
    '任务 02',
    'data-framing-model',
  ],
  '/practice/neighborhood-story/': [
    'Three photos, one place',
    'Mission 03',
    'data-story-model',
    'data-prediction-form',
    'Suggested next practice',
  ],
  '/zh-cn/practice/neighborhood-story/': [
    '三张照片，一个地方',
    '任务 03',
    'data-story-model',
    '建议的下一项练习',
  ],
  '/practice/photo-review/': [
    'Select, review, reshoot',
    'Mission 04',
    'data-review-model',
    'data-prediction-form',
  ],
  '/zh-cn/practice/photo-review/': [
    '筛选、复盘、再拍',
    '任务 04',
    'data-review-model',
  ],
  '/tools/': [
    'Interactive photography tools',
    `href="${withBase('/tools/crop-factor/')}"`,
    `href="${withBase('/tools/exposure-stops/')}"`,
  ],
  '/zh-cn/tools/': [
    '交互摄影工具',
    `href="${withBase('/zh-cn/tools/crop-factor/')}"`,
    `href="${withBase('/zh-cn/tools/exposure-stops/')}"`,
  ],
  '/tools/crop-factor/': [
    'Crop factor &amp; equivalent focal length',
    'data-crop-tool',
    'data-interactive hidden',
    'data-field="focalLength"',
    'crop factor c =',
  ],
  '/zh-cn/tools/crop-factor/': [
    '画幅系数与等效焦距',
    'data-crop-tool',
    '当前无法使用 JavaScript',
  ],
  '/tools/exposure-stops/': [
    'Exposure stops comparison',
    'data-exposure-tool',
    'data-field="before.fNumber"',
    'nominal ISO mapping stops',
    'data-results hidden',
  ],
  '/zh-cn/tools/exposure-stops/': [
    '曝光档位比较',
    'data-exposure-tool',
    '当前无法使用 JavaScript',
  ],
  '/404': ['<html lang="en"', 'This frame is empty.', 'noindex, nofollow'],
  '/zh-cn/404/': [
    '<html lang="zh-CN"',
    '这一帧暂时是空的。',
    'noindex, nofollow',
  ],
  '/glossary/': [
    'Photography glossary',
    'data-filter-item',
    'half the full-frame area',
  ],
  '/zh-cn/glossary/': ['摄影术语词典', 'data-filter-query', '全画幅的一半'],
  '/gear/': ['Camera and lens guides', 'FUJIFILM X mount'],
  '/zh-cn/gear/': ['相机与镜头指南', '原生卡口兼容'],
  '/gear/fujifilm-x-t5/': [
    '23.5 × 15.7 mm',
    'https://fujifilm-dsc.com/en/manual/x-t5/',
  ],
  '/zh-cn/gear/fujifilm-x-t5/': ['五轴传感器位移防抖', '传感器与画幅'],
  '/gear/fujifilm-xf16-50/': ['16–50 mm', 'F2.8–F4.8', '24–76 mm'],
  '/zh-cn/gear/fujifilm-xf16-50/': ['实际焦距', '最小光圈', '等效焦距'],
  '/galleries/': [
    'External sample galleries',
    'data-filter-key="scope"',
    'specifically captioned sample',
  ],
  '/zh-cn/galleries/': [
    '外部样片画廊',
    '具体机身／镜头证据',
    '不主张转载或再分发许可',
  ],
  '/resources/': [
    'Learning resources',
    'data-filter-key="audience"',
    'What Is ISO in Photography?',
  ],
  '/zh-cn/resources/': ['摄影学习资源', '核查日期', 'Lightroom Classic'],
  '/about/': [
    'About this project',
    'Quality and scientific limits',
    'link-only',
  ],
  '/zh-cn/about/': ['关于这个项目', '质量原则与科学边界', '仅提供链接'],
};
const FORBIDDEN = [
  'Equip Your Projects',
  'Construction Industry Blog',
  '/start-here/',
  '/basics/',
  `${BASE}${BASE}/`,
];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
};

function resolvePath(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?')[0]);
  if (BASE !== '/') {
    if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return null;
    pathname = pathname.slice(BASE.length) || '/';
  }
  if (pathname.includes('\0') || /(?:^|[/\\])\.\.(?:[/\\]|$)/.test(pathname))
    return null;
  if (pathname.endsWith('/')) pathname += 'index.html';
  else if (!extname(pathname)) pathname += '/index.html';
  if (pathname === '/404/index.html') pathname = '/404.html';
  const filePath = resolve(DIST, pathname.replace(/^[/\\]+/, ''));
  const rel = relative(DIST, filePath);
  if (rel.startsWith('..') || isAbsolute(rel)) return null;
  return filePath;
}

const server = createServer(async (req, res) => {
  try {
    const filePath = resolvePath(req.url || '/');
    if (!filePath) throw new Error('Invalid or outside-base URL');
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
    });
    res.end(data);
  } catch {
    try {
      const data = await readFile(resolve(DIST, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const errors = [];
  for (const route of ROUTES) {
    const res = await fetch(`${origin}${withBase(route)}`);
    const expectedError = route === '/404';
    const statusOkay = expectedError ? res.status === 404 || res.ok : res.ok;
    if (!statusOkay) {
      errors.push(
        `${route}: expected ${expectedError ? '200 or 404' : 200}, got ${res.status}`
      );
      continue;
    }
    const html = await res.text();
    const missing = (EXPECTATIONS[route] ?? []).filter(
      needle => !html.includes(needle)
    );
    const forbidden = FORBIDDEN.filter(needle => html.includes(needle));
    if (missing.length || forbidden.length)
      errors.push(
        `${route}: missing [${missing.join(', ')}], forbidden [${forbidden.join(', ')}]`
      );
    else console.log(`OK   ${withBase(route)} → ${res.status}`);
  }
  for (const route of MISSING_ROUTES) {
    const res = await fetch(`${origin}${withBase(route)}`);
    const html = await res.text();
    if (res.status !== 404 || !html.includes('noindex, nofollow'))
      errors.push(`${route}: expected a noindex 404, got ${res.status}`);
    else console.log(`OK   ${withBase(route)} → 404 noindex`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    `OK smoke: ${ROUTES.length} pages and ${MISSING_ROUTES.length} missing/retired routes (base ${BASE}).`
  );
} finally {
  await new Promise(resolve => server.close(resolve));
}
