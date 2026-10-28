import { z } from 'astro/zod';

/** A real calendar day, not merely a date-shaped string. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.')
  .refine(value => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, 'Enter a real calendar date.');

const nonEmpty = z.string().trim().min(1);
const url = z.url().refine(value => /^https?:\/\//.test(value), {
  message: 'Only HTTP(S) source URLs are allowed.',
});

export const sourceReferenceSchema = z.object({
  url,
  title: nonEmpty,
  locator: nonEmpty.optional(),
  accessedOn: isoDateSchema,
  supports: nonEmpty,
});

export const reviewStatusSchema = z.enum(['draft', 'in-review', 'published']);
export const localizedTextSchema = z.object({
  en: nonEmpty,
  'zh-cn': nonEmpty,
});
export const localizedListSchema = z.object({
  en: z.array(nonEmpty),
  'zh-cn': z.array(nonEmpty),
});
export const entityIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const verificationSchema = z.object({
  availability: z
    .enum(['unchecked', 'accessible', 'blocked', 'broken'])
    .default('unchecked'),
  identity: z.enum(['unchecked', 'confirmed', 'mismatch']).default('unchecked'),
  scopeEvidence: nonEmpty.optional(),
  rights: z
    .object({
      use: z.enum(['link-only', 'licensed', 'unknown']),
      evidence: nonEmpty.optional(),
    })
    .optional(),
  status: z.enum(['unreviewed', 'verified', 'unavailable', 'needs-review']),
  lastChecked: isoDateSchema.optional(),
  lastVerified: isoDateSchema.optional(),
  resolvedUrl: url.optional(),
  evidence: nonEmpty.optional(),
});

export const articleMetadataSchema = z.object({
  translationKey: entityIdSchema,
  category: z.enum([
    'getting-started',
    'sensor-lens',
    'exposure',
    'image-quality',
    'composition',
    'field-practice',
    'workflow',
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'technical']),
  reviewStatus: reviewStatusSchema,
  prerequisites: z.array(entityIdSchema).default([]),
  relatedConcepts: z.array(entityIdSchema).default([]),
  relatedTools: z.array(entityIdSchema).default([]),
  sources: z.array(sourceReferenceSchema).default([]),
  lastReviewed: isoDateSchema.optional(),
});

const sourceFields = {
  sources: z.array(sourceReferenceSchema).default([]),
  reviewStatus: reviewStatusSchema,
};

export const glossarySchema = z.object({
  id: entityIdSchema,
  term: localizedTextSchema,
  aliases: localizedListSchema,
  shortDefinition: localizedTextSchema,
  misconceptions: localizedListSchema,
  example: localizedTextSchema,
  articleKey: entityIdSchema.optional(),
  relatedTerms: z.array(entityIdSchema).default([]),
  ...sourceFields,
});

export const cameraSchema = z.object({
  id: entityIdSchema,
  brand: nonEmpty,
  model: nonEmpty,
  mountId: entityIdSchema,
  sensor: z.object({
    formatId: entityIdSchema,
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
  }),
  specifications: z.object({
    effectiveMegapixels: z.number().positive().optional(),
    hasIBIS: z.boolean().optional(),
    fileFormats: z.array(nonEmpty),
  }),
  description: localizedTextSchema,
  manufacturerUrl: url,
  documentationUrl: url,
  articleKeys: z.array(entityIdSchema).default([]),
  ...sourceFields,
});

export const lensSchema = z.object({
  id: entityIdSchema,
  brand: nonEmpty,
  model: nonEmpty,
  mountId: entityIdSchema,
  imageCircleFormatId: entityIdSchema,
  focalLengthMm: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  maximumAperture: z.object({
    wide: z.number().positive(),
    tele: z.number().positive(),
  }),
  minimumAperture: z
    .object({ wide: z.number().positive(), tele: z.number().positive() })
    .optional(),
  hasOIS: z.boolean().optional(),
  description: localizedTextSchema,
  manufacturerUrl: url,
  articleKeys: z.array(entityIdSchema).default([]),
  ...sourceFields,
});

export const resourceSchema = z.object({
  id: entityIdSchema,
  title: localizedTextSchema,
  provider: nonEmpty,
  providerType: z.enum(['official', 'independent', 'community']),
  category: z.enum([
    'manual',
    'specification',
    'tutorial',
    'software',
    'community',
    'gallery',
  ]),
  url,
  languages: z.array(nonEmpty).min(1),
  audience: z.array(z.enum(['beginner', 'intermediate', 'technical'])),
  purpose: localizedTextSchema,
  editorialNote: localizedTextSchema,
  tags: z.array(nonEmpty).default([]),
  verification: verificationSchema,
  reviewStatus: reviewStatusSchema,
});

export const gallerySchema = z.object({
  id: entityIdSchema,
  resourceId: entityIdSchema,
  scope: z.discriminatedUnion('type', [
    z.object({ type: z.literal('general') }),
    z.object({ type: z.literal('camera'), cameraId: entityIdSchema }),
    z.object({ type: z.literal('lens'), lensId: entityIdSchema }),
    z.object({
      type: z.literal('combination'),
      cameraId: entityIdSchema,
      lensId: entityIdSchema,
    }),
  ]),
  subjectTags: z.array(nonEmpty).default([]),
  hasExif: z.enum(['yes', 'no', 'unknown']),
  hasOriginalFiles: z.enum(['yes', 'no', 'unknown']),
  imageRightsNote: localizedTextSchema,
  verification: verificationSchema,
  reviewStatus: reviewStatusSchema,
});
