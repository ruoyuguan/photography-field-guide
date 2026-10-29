import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const DIST = resolve(new URL('../dist/', import.meta.url).pathname);
const ORIGIN = (
  process.env.SITE_ORIGIN ?? 'https://ruoyuguan.github.io'
).replace(/\/+$/, '');
const BASE = normalizeBase(process.env.SITE_BASE);
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
const PUBLIC_ROUTES = [
  ...LOCALIZED_ROUTES,
  '/zh-cn/',
  ...LOCALIZED_ROUTES.filter(route => route !== '/').map(
    route => `/zh-cn${route}`
  ),
  '/404.html',
  '/zh-cn/404/',
];
const errors = [];
const fail = message => errors.push(message);

function normalizeBase(value) {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}
function publicPath(path) {
  if (BASE === '/') return path;
  return `${BASE}${path === '/' ? '/' : path}`;
}
function filePath(relativePath) {
  return resolve(DIST, relativePath);
}
async function text(relativePath) {
  return readFile(filePath(relativePath), 'utf8');
}
function routeForFile(file) {
  const route = `/${file.split(sep).join('/')}`;
  if (route === '/index.html') return '/';
  if (route.endsWith('/index.html'))
    return route.slice(0, -'index.html'.length);
  return route;
}
function localFileForUrl(pathname) {
  if (BASE !== '/') {
    if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return null;
    pathname = pathname.slice(BASE.length) || '/';
  }
  if (pathname.includes('\0') || /(?:^|\/)\.\.(?:\/|$)/.test(pathname))
    return null;
  if (pathname.endsWith('/')) pathname += 'index.html';
  else if (!/\.[^/]+$/.test(pathname)) pathname += '/index.html';
  return filePath(pathname.replace(/^\/+/, ''));
}
async function exists(relativePath) {
  try {
    await readFile(filePath(relativePath));
    return true;
  } catch {
    return false;
  }
}
function attributes(html, attribute) {
  return [...html.matchAll(new RegExp(`\\b${attribute}="([^"]*)"`, 'g'))].map(
    match => match[1]
  );
}
function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
}
function checkPublicUrl(value, where) {
  if (!value.startsWith(`${ORIGIN}/`))
    fail(`${where}: URL is outside ${ORIGIN}: ${value}`);
  const { pathname } = new URL(value);
  if (BASE !== '/' && pathname.includes(`${BASE}${BASE}/`))
    fail(`${where}: duplicated deployment base: ${value}`);
  return pathname;
}

const files = (await readdir(DIST, { recursive: true })).filter(
  file => typeof file === 'string'
);
const htmlFiles = files.filter(file => file.endsWith('.html'));
if (htmlFiles.length !== PUBLIC_ROUTES.length)
  fail(
    `Expected ${PUBLIC_ROUTES.length} HTML files, found ${htmlFiles.length}.`
  );

for (const route of PUBLIC_ROUTES) {
  const file =
    route === '/404.html'
      ? '404.html'
      : `${route.replace(/^\/+/, '')}index.html`;
  if (!(await exists(file))) fail(`Missing public route: ${route} (${file}).`);
}
for (const route of [
  '/start-here/',
  '/basics/sensor-formats/',
  '/zh-cn/start-here/',
]) {
  if (await exists(`${route.replace(/^\/+/, '')}index.html`))
    fail(`Pre-release route was not retired: ${route}`);
}

const targetIds = new Map();
async function idsIn(target) {
  if (!targetIds.has(target)) {
    const source = await readFile(target, 'utf8');
    targetIds.set(
      target,
      new Set(
        [
          ...source.matchAll(/(?:\s|<)id="([^"]+)"/g),
          ...source.matchAll(/<a\s[^>]*?\bname="([^"]+)"/gi),
        ].map(match => decodeAttribute(match[1]))
      )
    );
  }
  return targetIds.get(target);
}
function decodeAttribute(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (_, hex, decimal) =>
      String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10))
    );
}

for (const file of htmlFiles) {
  const html = await text(file);
  const route = routeForFile(file);
  const where = `HTML ${route}`;
  if (
    [
      '/zh-cn/learn/composition/understanding-light/',
      '/zh-cn/learn/composition/subject-and-background/',
      '/zh-cn/learn/field-practice/neighborhood-story/',
      '/zh-cn/learn/field-practice/photo-review/',
    ].includes(route) &&
    visibleText(html).includes('**')
  )
    fail(`${where}: visible Markdown emphasis delimiters in the lesson.`);
  if (/<li>(?:<p>)?\*\*“/.test(html))
    errors.push(`${file}: visible Markdown emphasis delimiters in a list item`);
  for (const attribute of ['href', 'src']) {
    for (const value of attributes(html, attribute)) {
      if (!value || /^(?:[a-z]+:|\/\/|#|\?)/i.test(value)) continue;
      const pathname = new URL(value, `https://local.test${publicPath(route)}`)
        .pathname;
      const localFile = localFileForUrl(pathname);
      if (!localFile)
        fail(`${where}: ${attribute} escapes the deployment base: ${value}`);
      else {
        try {
          await readFile(localFile);
        } catch {
          fail(`${where}: missing ${attribute} target: ${value}`);
        }
      }
    }
  }
  for (const raw of attributes(html, 'href')) {
    if (!raw || /^(?:mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    const url = new URL(decodeAttribute(raw), `${ORIGIN}${publicPath(route)}`);
    if (url.origin !== ORIGIN || !url.hash || url.hash === '#') continue;
    const target = localFileForUrl(url.pathname);
    if (!target) continue; // Path errors are reported above.
    try {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!(await idsIn(target)).has(id))
        fail(`${where}: missing fragment ${url.hash} in ${url.pathname}.`);
    } catch (error) {
      if (error instanceof URIError)
        fail(`${where}: malformed fragment ${url.hash}.`);
      // Missing files are already reported by the path checks above.
    }
  }
  for (const stale of ['/start-here/', '/basics/', '/zh-cn/basics/'])
    if (html.includes(stale)) fail(`${where}: stale route ${stale}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonical) fail(`${where}: missing canonical URL.`);
  else {
    const expected = `${ORIGIN}${publicPath(route)}`;
    if (canonical[1] !== expected)
      fail(`${where}: canonical ${canonical[1]} should be ${expected}.`);
    const pathname = checkPublicUrl(canonical[1], where);
    const localFile = localFileForUrl(pathname);
    if (localFile) {
      try {
        await readFile(localFile);
      } catch {
        fail(`${where}: canonical has no local page.`);
      }
    }
  }
  for (const match of html.matchAll(
    /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g
  )) {
    const pathname = checkPublicUrl(match[2], `${where} ${match[1]}`);
    const localFile = localFileForUrl(pathname);
    if (!localFile) fail(`${where}: alternate escapes base: ${match[2]}`);
    else {
      try {
        await readFile(localFile);
      } catch {
        fail(`${where}: missing alternate ${match[2]}`);
      }
    }
  }
  if (route === '/' || route === '/404.html') {
    const expectedAlternate = route === '/' ? '/zh-cn/' : '/zh-cn/404/';
    if (
      !html.includes(
        `hreflang="zh-CN" href="${ORIGIN}${publicPath(expectedAlternate)}"`
      )
    )
      fail(`${where}: wrong Chinese alternate.`);
  }
  if (route.endsWith('404.html') || route.endsWith('404/')) {
    if (!html.includes('<meta name="robots" content="noindex, nofollow"'))
      fail(`${where}: error page needs noindex.`);
  }
}

const manifest = JSON.parse(await text('manifest.json'));
for (const key of ['id', 'start_url', 'scope']) {
  if (manifest[key] !== publicPath('/'))
    fail(`Manifest ${key} should be ${publicPath('/')}.`);
}
for (const icon of manifest.icons) {
  const localFile = localFileForUrl(
    new URL(icon.src, 'https://local.test').pathname
  );
  if (!localFile) fail(`Manifest icon escapes base: ${icon.src}`);
  else {
    try {
      await readFile(localFile);
    } catch {
      fail(`Missing manifest icon: ${icon.src}`);
    }
  }
}
const robots = await text('robots.txt');
if (!robots.includes(`Sitemap: ${ORIGIN}${publicPath('/sitemap-index.xml')}`))
  fail('robots.txt has the wrong sitemap URL.');
const sitemapIndex = await text('sitemap-index.xml');
const sitemapFiles = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  match => match[1]
);
for (const url of sitemapFiles) {
  checkPublicUrl(url, 'sitemap-index');
  const localFile = localFileForUrl(new URL(url).pathname);
  if (localFile) {
    try {
      await readFile(localFile);
    } catch {
      fail(`Missing sitemap file: ${url}`);
    }
  }
}
for (const sitemap of sitemapFiles) {
  const pathname = new URL(sitemap).pathname;
  const localFile = localFileForUrl(pathname);
  if (!localFile) continue;
  const xml = await readFile(localFile, 'utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = match[1];
    const pagePath = checkPublicUrl(url, 'sitemap');
    if (pagePath.includes('404'))
      fail(`Sitemap contains an error page: ${url}`);
    const pageFile = localFileForUrl(pagePath);
    if (pageFile) {
      try {
        await readFile(pageFile);
      } catch {
        fail(`Sitemap URL has no page: ${url}`);
      }
    }
    for (const stale of ['/start-here/', '/basics/'])
      if (pagePath.includes(stale))
        fail(`Sitemap contains retired route: ${url}`);
  }
}
if (files.some(file => file.startsWith('pagefind/'))) {
  for (const file of files.filter(
    file => file.startsWith('pagefind/') && file.endsWith('.json')
  )) {
    const json = await text(file);
    for (const stale of ['/start-here/', '/basics/'])
      if (json.includes(stale))
        fail(`Search index contains retired route: ${file}`);
  }
} else fail('Missing Pagefind search index.');

if (errors.length) {
  console.error(
    `Build checks failed (${errors.length}):\n${errors.map(error => `- ${error}`).join('\n')}`
  );
  process.exit(1);
}
console.log(
  `OK build checks: ${htmlFiles.length} HTML pages, internal links/fragments/assets, SEO, manifest, robots, sitemap, and search artifacts (base ${BASE}).`
);
