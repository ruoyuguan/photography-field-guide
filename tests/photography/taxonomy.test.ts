import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  validateTaxonomyReferences,
  type TaxonomyReferenceInput,
} from '../../src/utils/taxonomy-validation.ts';
import { publicToolIds } from '../../src/data_files/tool-registry.ts';

function fixture(): TaxonomyReferenceInput {
  return {
    dimensions: [
      {
        id: 'optical-architecture',
        order: 1,
        detailed: true,
        explanation: { en: ['Viewing path.'], 'zh-cn': ['取景路径。'] },
        sources: [{ url: 'https://example.test/optics' }],
        relatedDimensionIds: ['lens-system'],
        termIds: ['mirrorless'],
        articleKeys: ['camera-viewfinding'],
        toolIds: ['crop-factor'],
        reviewStatus: 'published',
      },
      {
        id: 'lens-system',
        order: 2,
        detailed: false,
        explanation: { en: [], 'zh-cn': [] },
        sources: [],
        reviewStatus: 'published',
      },
    ],
    terms: [
      {
        id: 'mirrorless',
        dimensionIds: ['optical-architecture'],
        exampleCameraIds: ['example-camera'],
        explanation: {
          en: ['No reflex viewing mirror.'],
          'zh-cn': ['无反光取景镜。'],
        },
        lastReviewed: '2026-11-05',
        reviewStatus: 'published',
      },
    ],
    cameras: [
      {
        id: 'example-camera',
        classifications: [
          { dimensionId: 'optical-architecture', conceptId: 'mirrorless' },
          { dimensionId: 'lens-system' },
        ],
        reviewStatus: 'published',
      },
    ],
    articleKeys: new Set(['camera-viewfinding']),
    toolIds: ['crop-factor'],
  };
}

test('taxonomy accepts shared entities, overview-only dimensions and active references', () => {
  assert.deepEqual(validateTaxonomyReferences(fixture()), []);
});

test('published glossary links cannot target a missing or draft term', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    terms: [
      { ...data.terms[0], relatedTerms: ['unreviewed', 'missing'] },
      { id: 'unreviewed', reviewStatus: 'draft' },
    ],
  });
  assert.ok(
    errors.includes(
      'glossary/mirrorless: Unpublished related term: unreviewed.'
    )
  );
  assert.ok(
    errors.includes('glossary/mirrorless: Unknown related term: missing.')
  );
});

test('taxonomy rejects duplicate IDs instead of silently replacing any entity', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    dimensions: [...data.dimensions, { ...data.dimensions[0], order: 3 }],
    terms: [...data.terms, data.terms[0]],
    cameras: [...data.cameras, data.cameras[0]],
  });
  for (const path of [
    'taxonomy/optical-architecture',
    'glossary/mirrorless',
    'cameras/example-camera',
  ])
    assert.ok(errors.includes(`${path}: Duplicate entity ID.`));
});

test('taxonomy rejects duplicate, fractional and nonpositive dimension order', () => {
  const data = fixture();
  const duplicate = validateTaxonomyReferences({
    ...data,
    dimensions: data.dimensions.map(dimension => ({ ...dimension, order: 1 })),
  });
  assert.ok(
    duplicate.some(error => error.includes('Duplicate dimension order 1'))
  );
  for (const order of [0, -1, 1.5, Number.NaN]) {
    const errors = validateTaxonomyReferences({
      ...data,
      dimensions: [{ ...data.dimensions[0], order }, data.dimensions[1]],
    });
    assert.ok(errors.some(error => error.includes('positive integer')));
  }
});

test('taxonomy checks every dimension reference family against public targets', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    dimensions: [
      {
        ...data.dimensions[0],
        relatedDimensionIds: ['missing-dimension'],
        termIds: ['missing-term'],
        articleKeys: ['missing-article'],
        toolIds: ['missing-tool'],
      },
      data.dimensions[1],
    ],
  });
  for (const target of [
    'Unknown dimension: missing-dimension',
    'Unknown term: missing-term',
    'Unknown or unpublished article: missing-article',
    'Tool is not public: missing-tool',
  ])
    assert.ok(
      errors.some(error => error.includes(target)),
      target
    );
});

test('taxonomy rejects existing but unpublished dimensions, terms and example cameras', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    dimensions: [
      data.dimensions[0],
      { ...data.dimensions[1], reviewStatus: 'draft' },
    ],
    terms: [{ ...data.terms[0], reviewStatus: 'in-review' }],
    cameras: [{ ...data.cameras[0], reviewStatus: 'draft' }],
  });
  for (const target of [
    'Unpublished dimension: lens-system',
    'Unpublished term: mirrorless',
    'Unpublished example camera: example-camera',
    'Unpublished classification concept: mirrorless',
  ])
    assert.ok(
      errors.some(error => error.includes(target)),
      target
    );
});

test('taxonomy checks glossary dimension and example camera links', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    terms: [
      {
        ...data.terms[0],
        dimensionIds: ['missing-dimension'],
        exampleCameraIds: ['missing-camera'],
      },
    ],
  });
  assert.ok(
    errors.some(error => error.includes('Unknown dimension: missing-dimension'))
  );
  assert.ok(
    errors.some(error =>
      error.includes('Unknown example camera: missing-camera')
    )
  );
});

test('an enriched term needs both readable locale explanations and a review date', () => {
  const data = fixture();
  for (const explanation of [
    { en: ['Explanation.'] },
    { en: ['Explanation.'], 'zh-cn': [] },
    { en: ['Explanation.'], 'zh-cn': ['  '] },
  ]) {
    const errors = validateTaxonomyReferences({
      ...data,
      terms: [{ ...data.terms[0], explanation, lastReviewed: undefined }],
    });
    assert.ok(
      errors.some(error => error.includes('nonempty zh-cn explanation'))
    );
    assert.ok(
      errors.some(error => error.includes('Enriched terms need lastReviewed'))
    );
  }
});

test('published detailed dimensions cannot generate a page without two explanations and sources', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    dimensions: [
      { ...data.dimensions[0], explanation: { en: [] }, sources: [] },
      data.dimensions[1],
    ],
  });
  assert.ok(errors.some(error => error.includes('nonempty en explanation')));
  assert.ok(errors.some(error => error.includes('nonempty zh-cn explanation')));
  assert.ok(
    errors.some(error =>
      error.includes('Published detailed dimensions need sources')
    )
  );
});

test('camera classification concepts must belong to the chosen dimension when declared', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    cameras: [
      {
        ...data.cameras[0],
        classifications: [
          { dimensionId: 'lens-system', conceptId: 'mirrorless' },
        ],
      },
    ],
  });
  assert.ok(
    errors.includes(
      'cameras/example-camera: Concept mirrorless does not belong to dimension lens-system.'
    )
  );
});

test('camera classifications reject nonexistent dimensions and concepts', () => {
  const data = fixture();
  const errors = validateTaxonomyReferences({
    ...data,
    cameras: [
      {
        ...data.cameras[0],
        classifications: [
          { dimensionId: 'missing-dimension', conceptId: 'missing-concept' },
        ],
      },
    ],
  });
  assert.ok(
    errors.some(error => error.includes('Unknown dimension: missing-dimension'))
  );
  assert.ok(
    errors.some(error =>
      error.includes('Unknown classification concept: missing-concept')
    )
  );
});

test('legacy terms without enrichment or dimension assignments remain valid', () => {
  const data = fixture();
  assert.deepEqual(
    validateTaxonomyReferences({
      ...data,
      terms: [{ id: 'mirrorless', reviewStatus: 'published' }],
    }),
    []
  );
});

const projectRoot = new URL('../../', import.meta.url);
function readRecords(directory: string) {
  const root = new URL(`src/content/${directory}/`, projectRoot);
  return readdirSync(root)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(readFileSync(new URL(file, root), 'utf8')));
}

function bilingualPublishedArticleKeys(): Set<string> {
  const root = new URL('src/content/docs/', projectRoot);
  const keys = new Map<string, Set<string>>();
  for (const file of readdirSync(root, { recursive: true })) {
    if (typeof file !== 'string' || !/\.mdx?$/.test(file)) continue;
    const source = readFileSync(resolve(root.pathname, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    if (!/^reviewStatus:\s*published\s*$/m.test(frontmatter)) continue;
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    const key = frontmatter.match(
      /^translationKey:\s*['"]?([a-z0-9-]+)['"]?\s*$/m
    )?.[1];
    if (!key) continue;
    const locales = keys.get(key) ?? new Set<string>();
    locales.add(file.startsWith('zh-cn/') ? 'zh-cn' : 'en');
    keys.set(key, locales);
  }
  return new Set(
    [...keys]
      .filter(([, locales]) => locales.has('en') && locales.has('zh-cn'))
      .map(([key]) => key)
  );
}

test('real taxonomy records resolve to the shared glossary, cameras, bilingual articles and tools', () => {
  const dimensions = readRecords('taxonomy');
  const terms = readRecords('glossary');
  const cameras = readRecords('cameras');
  assert.equal(
    dimensions.length,
    16,
    'The overview must retain all 16 requested axes.'
  );
  for (const id of [
    'slr',
    'dslr',
    'mirrorless',
    'ccd',
    'cmos',
    'x-trans',
    'fixed-lens',
    'prime-lens',
  ])
    assert.ok(
      terms.some(term => term.id === id),
      `Missing first-batch term: ${id}`
    );
  assert.ok(cameras.some(camera => camera.id === 'fujifilm-x-t5'));
  assert.deepEqual(
    validateTaxonomyReferences({
      dimensions,
      terms,
      cameras,
      articleKeys: bilingualPublishedArticleKeys(),
      toolIds: publicToolIds,
    }),
    []
  );
});
