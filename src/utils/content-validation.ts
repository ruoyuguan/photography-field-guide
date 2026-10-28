import { getCollection } from 'astro:content';
import { publicToolIds } from '@data/tool-registry';

/** Cross-entity rules that Zod schemas cannot enforce on their own. */
async function runContentValidation(): Promise<void> {
  const [docs, glossary, cameras, lenses, resources, galleries] =
    await Promise.all([
      getCollection('docs'),
      getCollection('glossary'),
      getCollection('cameras'),
      getCollection('lenses'),
      getCollection('resources'),
      getCollection('galleries'),
    ]);
  const errors: string[] = [];
  const today = new Date().toISOString().slice(0, 10);
  const fail = (where: string, message: string) =>
    errors.push(`${where}: ${message}`);
  const checkDate = (where: string, field: string, value?: string) => {
    if (value && value > today)
      fail(where, `${field} cannot be in the future.`);
  };
  const checkSources = (
    where: string,
    sources: { accessedOn: string }[],
    published: boolean,
    required = true
  ) => {
    if (published && required && sources.length === 0)
      fail(where, 'Published content needs a real source.');
    for (const source of sources)
      checkDate(where, 'Source accessedOn', source.accessedOn);
  };

  const articleKeys = new Set<string>();
  const articleLocales = new Set<string>();
  const prerequisites = new Map<string, string[]>();
  for (const entry of docs) {
    const where = `docs/${entry.id}`;
    const { data } = entry;
    const locale = entry.id.startsWith('zh-cn/') ? 'zh-cn' : 'en';
    const pairKey = `${data.translationKey}:${locale}`;
    if (articleLocales.has(pairKey)) fail(where, `Duplicate ${pairKey}.`);
    articleLocales.add(pairKey);
    articleKeys.add(data.translationKey);
    prerequisites.set(data.translationKey, data.prerequisites);
    if (
      entry.id !== 'learn' &&
      entry.id !== 'zh-cn/learn' &&
      !entry.id.startsWith('learn/') &&
      !entry.id.startsWith('zh-cn/learn/')
    )
      fail(where, 'Photography articles must live under learn/.');
    if (data.reviewStatus === 'published' && data.draft)
      fail(where, 'A published article cannot have draft: true.');
    if (data.reviewStatus !== 'published' && !data.draft)
      fail(where, 'Unpublished review states must have draft: true.');
    if (data.reviewStatus === 'published' && !data.lastReviewed)
      fail(where, 'Published articles need lastReviewed.');
    checkDate(where, 'lastReviewed', data.lastReviewed);
    checkSources(
      where,
      data.sources,
      data.reviewStatus === 'published',
      data.category !== 'getting-started'
    );
    for (const concept of data.relatedConcepts)
      if (!glossary.some(term => term.id === concept))
        fail(where, `Unknown glossary term: ${concept}.`);
    for (const tool of data.relatedTools)
      if (!publicToolIds.includes(tool))
        fail(where, `Tool is not public: ${tool}.`);
  }
  for (const key of articleKeys) {
    for (const locale of ['en', 'zh-cn'])
      if (!articleLocales.has(`${key}:${locale}`))
        fail(key, `Missing ${locale} translation.`);
  }
  for (const entry of docs)
    for (const key of entry.data.prerequisites)
      if (!articleKeys.has(key))
        fail(`docs/${entry.id}`, `Unknown prerequisite: ${key}.`);

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string, chain: string[]) => {
    if (visiting.has(key))
      fail(key, `Prerequisite cycle: ${[...chain, key].join(' → ')}.`);
    if (visited.has(key) || visiting.has(key)) return;
    visiting.add(key);
    for (const parent of prerequisites.get(key) ?? [])
      visit(parent, [...chain, key]);
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of articleKeys) visit(key, []);

  const checkEntity = (
    collection: string,
    entry: {
      id: string;
      data: {
        id: string;
        sources: { accessedOn: string }[];
        reviewStatus: string;
      };
    }
  ) => {
    const where = `${collection}/${entry.id}`;
    if (entry.id !== entry.data.id)
      fail(where, 'Filename ID and data.id must match.');
    checkSources(
      where,
      entry.data.sources,
      entry.data.reviewStatus === 'published'
    );
  };
  for (const term of glossary) {
    checkEntity('glossary', term);
    if (term.data.articleKey && !articleKeys.has(term.data.articleKey))
      fail(
        `glossary/${term.id}`,
        `Unknown articleKey: ${term.data.articleKey}.`
      );
    for (const related of term.data.relatedTerms)
      if (!glossary.some(other => other.id === related))
        fail(`glossary/${term.id}`, `Unknown related term: ${related}.`);
  }
  for (const camera of cameras) {
    checkEntity('cameras', camera);
    for (const key of camera.data.articleKeys)
      if (!articleKeys.has(key))
        fail(`cameras/${camera.id}`, `Unknown articleKey: ${key}.`);
  }
  for (const lens of lenses) {
    checkEntity('lenses', lens);
    if (lens.data.focalLengthMm.min > lens.data.focalLengthMm.max)
      fail(`lenses/${lens.id}`, 'Minimum focal length exceeds maximum.');
    for (const key of lens.data.articleKeys)
      if (!articleKeys.has(key))
        fail(`lenses/${lens.id}`, `Unknown articleKey: ${key}.`);
  }

  const checkVerification = (
    where: string,
    verification: {
      status: string;
      lastChecked?: string;
      lastVerified?: string;
      resolvedUrl?: string;
      evidence?: string;
    },
    published: boolean
  ) => {
    checkDate(where, 'lastChecked', verification.lastChecked);
    checkDate(where, 'lastVerified', verification.lastVerified);
    if (
      verification.status !== 'unreviewed' &&
      (!verification.lastChecked || !verification.evidence)
    )
      fail(where, 'Reviewed links need lastChecked and concrete evidence.');
    if (verification.status === 'verified') {
      if (!verification.lastVerified || !verification.resolvedUrl)
        fail(where, 'Verified links need lastVerified and resolvedUrl.');
      if (verification.lastVerified !== verification.lastChecked)
        fail(where, 'Verify the current target when updating lastChecked.');
    } else if (verification.lastVerified)
      fail(where, 'Only verified links may have lastVerified.');
    if (published && verification.status !== 'verified')
      fail(where, 'Public resource links must be verified.');
  };
  for (const resource of resources) {
    const where = `resources/${resource.id}`;
    if (resource.id !== resource.data.id)
      fail(where, 'Filename ID and data.id must match.');
    checkVerification(
      where,
      resource.data.verification,
      resource.data.reviewStatus === 'published'
    );
  }
  for (const gallery of galleries) {
    const where = `galleries/${gallery.id}`;
    if (gallery.id !== gallery.data.id)
      fail(where, 'Filename ID and data.id must match.');
    const resource = resources.find(
      item => item.id === gallery.data.resourceId
    );
    if (!resource) fail(where, `Unknown resource: ${gallery.data.resourceId}.`);
    else if (resource.data.url !== gallery.data.verification.resolvedUrl)
      fail(where, 'Gallery verification must refer to the resource URL.');
    checkVerification(
      where,
      gallery.data.verification,
      gallery.data.reviewStatus === 'published'
    );
    const { scope } = gallery.data;
    if (scope.type === 'camera' || scope.type === 'combination') {
      const camera = cameras.find(item => item.id === scope.cameraId);
      if (!camera) fail(where, `Unknown camera: ${scope.cameraId}.`);
      if (scope.type === 'combination') {
        const lens = lenses.find(item => item.id === scope.lensId);
        if (!lens) fail(where, `Unknown lens: ${scope.lensId}.`);
        else if (camera && camera.data.mountId !== lens.data.mountId)
          fail(where, 'The camera and lens mounts do not match.');
      }
    }
    if (scope.type === 'lens' && !lenses.some(item => item.id === scope.lensId))
      fail(where, `Unknown lens: ${scope.lensId}.`);
    if (
      (gallery.data.hasExif === 'yes' ||
        gallery.data.hasOriginalFiles === 'yes') &&
      (!gallery.data.verification.scopeEvidence ||
        gallery.data.verification.status !== 'verified')
    )
      fail(where, 'EXIF/original-file claims require verified scope evidence.');
  }

  if (errors.length)
    throw new Error(
      `Content validation failed:\n${errors.map(error => `- ${error}`).join('\n')}`
    );
  console.info(
    `[content] ${docs.length} articles and ${glossary.length + cameras.length + lenses.length + resources.length + galleries.length} structured entries validated.`
  );
}

let validation: Promise<void> | undefined;
export function validateContent(): Promise<void> {
  validation ??= runContentValidation();
  return validation;
}
