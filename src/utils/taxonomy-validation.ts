/**
 * Cross-collection taxonomy rules that do not need Astro or a browser.
 * Pass only published article/tool IDs; entity arrays may include drafts so
 * references to unpublished targets fail rather than becoming dead links.
 */
export interface TaxonomyExplanation {
  en?: readonly string[];
  'zh-cn'?: readonly string[];
}

export interface TaxonomyDimensionReference {
  id: string;
  order: number;
  detailed: boolean;
  explanation?: TaxonomyExplanation;
  sources?: readonly unknown[];
  relatedDimensionIds?: readonly string[];
  termIds?: readonly string[];
  articleKeys?: readonly string[];
  toolIds?: readonly string[];
  reviewStatus: string;
}

export interface TaxonomyTermReference {
  id: string;
  dimensionIds?: readonly string[];
  relatedTerms?: readonly string[];
  exampleCameraIds?: readonly string[];
  explanation?: TaxonomyExplanation;
  lastReviewed?: string;
  reviewStatus: string;
}

export interface TaxonomyCameraReference {
  id: string;
  classifications?: readonly {
    dimensionId: string;
    conceptId?: string;
  }[];
  reviewStatus: string;
}

export interface TaxonomyReferenceInput {
  dimensions: readonly TaxonomyDimensionReference[];
  terms: readonly TaxonomyTermReference[];
  cameras: readonly TaxonomyCameraReference[];
  articleKeys: Iterable<string>;
  toolIds: Iterable<string>;
}

const locales = ['en', 'zh-cn'] as const;

function hasExplanation(
  explanation: TaxonomyExplanation | undefined,
  locale: (typeof locales)[number]
): boolean {
  const paragraphs = explanation?.[locale];
  return (
    Array.isArray(paragraphs) &&
    paragraphs.length > 0 &&
    paragraphs.every(paragraph => paragraph.trim().length > 0)
  );
}

export function validateTaxonomyReferences({
  dimensions,
  terms,
  cameras,
  articleKeys,
  toolIds,
}: TaxonomyReferenceInput): string[] {
  const errors: string[] = [];
  const fail = (where: string, message: string) =>
    errors.push(`${where}: ${message}`);

  function index<T extends { id: string; reviewStatus: string }>(
    entries: readonly T[],
    kind: string
  ): Map<string, T> {
    const result = new Map<string, T>();
    for (const entry of entries) {
      if (result.has(entry.id))
        fail(`${kind}/${entry.id}`, 'Duplicate entity ID.');
      else result.set(entry.id, entry);
    }
    return result;
  }

  const dimensionsById = index(dimensions, 'taxonomy');
  const termsById = index(terms, 'glossary');
  const camerasById = index(cameras, 'cameras');
  const publishedArticleKeys = new Set(articleKeys);
  const publishedToolIds = new Set(toolIds);
  const orders = new Map<number, string>();

  function publishedTarget<T extends { reviewStatus: string }>(
    targets: Map<string, T>,
    id: string,
    where: string,
    kind: string
  ): T | undefined {
    const target = targets.get(id);
    if (!target) fail(where, `Unknown ${kind}: ${id}.`);
    else if (target.reviewStatus !== 'published')
      fail(where, `Unpublished ${kind}: ${id}.`);
    return target?.reviewStatus === 'published' ? target : undefined;
  }

  for (const dimension of dimensions) {
    const where = `taxonomy/${dimension.id}`;
    if (!Number.isInteger(dimension.order) || dimension.order < 1)
      fail(where, 'Order must be a positive integer.');
    const previous = orders.get(dimension.order);
    if (previous !== undefined)
      fail(
        where,
        `Duplicate dimension order ${dimension.order} (also ${previous}).`
      );
    else orders.set(dimension.order, dimension.id);

    if (dimension.reviewStatus === 'published' && dimension.detailed) {
      for (const locale of locales)
        if (!hasExplanation(dimension.explanation, locale))
          fail(
            where,
            `Detailed dimensions need a nonempty ${locale} explanation.`
          );
      if (!dimension.sources?.length)
        fail(where, 'Published detailed dimensions need sources.');
    }
    for (const id of dimension.relatedDimensionIds ?? [])
      publishedTarget(dimensionsById, id, where, 'dimension');
    for (const id of dimension.termIds ?? [])
      publishedTarget(termsById, id, where, 'term');
    for (const key of dimension.articleKeys ?? [])
      if (!publishedArticleKeys.has(key))
        fail(where, `Unknown or unpublished article: ${key}.`);
    for (const id of dimension.toolIds ?? [])
      if (!publishedToolIds.has(id)) fail(where, `Tool is not public: ${id}.`);
  }

  for (const term of terms) {
    const where = `glossary/${term.id}`;
    for (const id of term.relatedTerms ?? []) {
      if (term.reviewStatus === 'published')
        publishedTarget(termsById, id, where, 'related term');
      else if (!termsById.has(id))
        fail(where, 'Unknown related term: ' + id + '.');
    }
    for (const id of term.dimensionIds ?? [])
      publishedTarget(dimensionsById, id, where, 'dimension');
    for (const id of term.exampleCameraIds ?? [])
      publishedTarget(camerasById, id, where, 'example camera');
    if (term.explanation !== undefined) {
      for (const locale of locales)
        if (!hasExplanation(term.explanation, locale))
          fail(where, `Enriched terms need a nonempty ${locale} explanation.`);
      if (!term.lastReviewed?.trim())
        fail(where, 'Enriched terms need lastReviewed.');
    }
  }

  for (const camera of cameras) {
    const where = `cameras/${camera.id}`;
    for (const classification of camera.classifications ?? []) {
      publishedTarget(
        dimensionsById,
        classification.dimensionId,
        where,
        'dimension'
      );
      if (!classification.conceptId) continue;
      const concept = publishedTarget(
        termsById,
        classification.conceptId,
        where,
        'classification concept'
      );
      if (
        concept?.dimensionIds?.length &&
        !concept.dimensionIds.includes(classification.dimensionId)
      )
        fail(
          where,
          `Concept ${concept.id} does not belong to dimension ${classification.dimensionId}.`
        );
    }
  }

  return errors;
}
