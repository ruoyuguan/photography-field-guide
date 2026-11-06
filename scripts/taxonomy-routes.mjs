import { readdir, readFile } from 'node:fs/promises';
async function publishedIds(directory, predicate) {
  const root = new URL(`../src/content/${directory}/`, import.meta.url);
  const records = await Promise.all(
    (await readdir(root))
      .filter(file => file.endsWith('.json'))
      .map(async file =>
        JSON.parse(await readFile(new URL(file, root), 'utf8'))
      )
  );
  return records
    .filter(row => row.reviewStatus === 'published' && predicate(row))
    .map(row => row.id)
    .sort();
}
export const taxonomyRoutes = [
  '/cameras/',
  ...(await publishedIds('taxonomy', row => row.detailed)).map(
    id => `/cameras/${id}/`
  ),
  ...(await publishedIds('glossary', row => !!row.explanation)).map(
    id => `/glossary/${id}/`
  ),
  '/tools/format-comparison/',
  '/learn/sensor-lens/camera-viewfinding/',
];
