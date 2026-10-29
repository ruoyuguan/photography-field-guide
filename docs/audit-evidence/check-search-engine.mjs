// Audit harness only: query the generated Pagefind engine in Node.
// This does not test the browser dialog, web worker, keyboard, or mobile UI.
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [distArg, language] = process.argv.slice(2);
if (!distArg || !['en', 'zh-cn'].includes(language)) {
  throw new Error(
    'Usage: node check-search-engine.mjs <dist-directory> <en|zh-cn>'
  );
}
const dist = resolve(distArg);
globalThis.document = {
  currentScript: null,
  querySelector: selector =>
    selector === 'html'
      ? { getAttribute: name => (name === 'lang' ? language : null) }
      : null,
};
// Resolve only generated local assets. No external network or DOM is involved.
globalThis.fetch = async input => {
  const url = new URL(String(input), 'http://audit.local');
  if (url.origin !== 'http://audit.local')
    throw new Error('External fetch denied');
  const path = resolve(dist, `.${url.pathname}`);
  if (!path.startsWith(`${dist}/`)) throw new Error('Path escapes dist');
  return new Response(await readFile(path));
};
const pagefind = await import(
  pathToFileURL(resolve(dist, 'pagefind/pagefind.js'))
);
const instance = pagefind.createInstance({
  basePath: 'http://audit.local/pagefind/',
  baseUrl: '/',
  noWorker: true,
});
const queries =
  language === 'en' ? ['focal length', 'ISO'] : ['等效焦距', '传感器'];
const results = [];
for (const query of queries) {
  const response = await instance.search(query);
  const hits = [];
  for (const result of response.results) {
    const data = await result.data();
    const url = new URL(data.url, 'http://audit.local');
    const target = resolve(dist, `.${url.pathname}`, 'index.html');
    await access(target);
    if (language === 'zh-cn' && !url.pathname.startsWith('/zh-cn/')) {
      throw new Error('Chinese query returned an English route');
    }
    if (language === 'en' && url.pathname.startsWith('/zh-cn/')) {
      throw new Error('English query returned a Chinese route');
    }
    hits.push({ title: data.meta.title, url: data.url });
  }
  if (!hits.length) throw new Error(`No results for ${language}: ${query}`);
  results.push({ query, hits });
}
await instance.destroy();
console.log(
  JSON.stringify(
    {
      scope:
        'Generated Pagefind engine only; Node adapter; not browser UI acceptance',
      language,
      results,
    },
    null,
    2
  )
);
