import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const DIST = resolve(new URL('../dist/', import.meta.url).pathname);
const ORIGIN = (
  process.env.SITE_ORIGIN ?? 'https://ruoyuguan.github.io'
).replace(/\/+$/, '');
const BASE = normalizeBase(process.env.SITE_BASE);
const PUBLIC_ROUTES = [
  '/',
  '/learn/',
  '/learn/sensor-lens/sensor-formats/',
  '/learn/sensor-lens/equivalent-focal-length/',
  '/learn/exposure/exposure-triangle/',
  '/tools/',
  '/tools/crop-factor/',
  '/tools/exposure-stops/',
  '/404.html',
  '/zh-cn/',
  '/zh-cn/learn/',
  '/zh-cn/learn/sensor-lens/sensor-formats/',
  '/zh-cn/learn/sensor-lens/equivalent-focal-length/',
  '/zh-cn/learn/exposure/exposure-triangle/',
  '/zh-cn/tools/',
  '/zh-cn/tools/crop-factor/',
  '/zh-cn/tools/exposure-stops/',
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

for (const file of htmlFiles) {
  const html = await text(file);
  const route = routeForFile(file);
  const where = `HTML ${route}`;
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
  `OK build checks: ${htmlFiles.length} HTML pages, internal links/assets, SEO, manifest, robots, sitemap, and search artifacts (base ${BASE}).`
);
