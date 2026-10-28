// https://docs.astro.build/en/guides/content-collections/#defining-collections

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';
import {
  articleMetadataSchema,
  cameraSchema,
  gallerySchema,
  glossarySchema,
  lensSchema,
  resourceSchema,
} from '@utils/content-schema';

const productsCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/products',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      main: z.object({
        id: z.number(),
        content: z.string(),
        imgCard: image(),
        imgMain: image(),
        imgAlt: z.string(),
      }),
      tabs: z.array(
        z.object({
          id: z.string(),
          dataTab: z.string(),
          title: z.string(),
        })
      ),
      longDescription: z.object({
        title: z.string(),
        subTitle: z.string(),
        btnTitle: z.string(),
        btnURL: z.string(),
      }),
      descriptionList: z.array(
        z.object({
          title: z.string(),
          subTitle: z.string(),
        })
      ),
      specificationsLeft: z.array(
        z.object({
          title: z.string(),
          subTitle: z.string(),
        })
      ),
      specificationsRight: z
        .array(
          z.object({
            title: z.string(),
            subTitle: z.string(),
          })
        )
        .optional(),
      tableData: z
        .array(
          z.object({
            feature: z.array(z.string()),
            description: z.array(z.array(z.string())),
          })
        )
        .optional(),
      blueprints: z.object({
        first: image().optional(),
        second: image().optional(),
      }),
    }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string(),
      role: z.string().optional(),
      authorImage: image(),
      authorImageAlt: z.string(),
      pubDate: z.date(),
      cardImage: image(),
      cardImageAlt: z.string(),
      readTime: z.number(),
      tags: z.array(z.string()).optional(),
    }),
});

const insightsCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/insights',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // contents: z.array(z.string()),
      cardImage: image(),
      cardImageAlt: z.string(),
    }),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: articleMetadataSchema }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  glossary: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/glossary' }),
    schema: glossarySchema,
  }),
  cameras: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/cameras' }),
    schema: cameraSchema,
  }),
  lenses: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/lenses' }),
    schema: lensSchema,
  }),
  resources: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/resources' }),
    schema: resourceSchema,
  }),
  galleries: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/galleries' }),
    schema: gallerySchema,
  }),
  products: productsCollection,
  blog: blogCollection,
  insights: insightsCollection,
};
