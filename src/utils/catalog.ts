import { getCollection } from 'astro:content';
import { localePath, type MarketingLocale } from '@utils/locale';

export type ArticleLink = { key: string; title: string; path: string };

export async function getArticleLinks(
  locale: MarketingLocale
): Promise<Map<string, ArticleLink>> {
  const docs = await getCollection(
    'docs',
    ({ data }) => data.reviewStatus === 'published'
  );
  const prefix = locale === 'zh-cn' ? 'zh-cn/learn/' : 'learn/';
  return new Map(
    docs
      .filter(entry => entry.id.startsWith(prefix))
      .map(entry => [
        entry.data.translationKey,
        {
          key: entry.data.translationKey,
          title: entry.data.title,
          // The content ID already contains the zh-cn prefix.
          path: localePath('en', `/${entry.id}/`),
        },
      ])
  );
}

export function requiredArticle(
  articles: Map<string, ArticleLink>,
  key: string
): ArticleLink {
  const article = articles.get(key);
  if (!article) throw new Error(`Missing published article link: ${key}`);
  return article;
}
