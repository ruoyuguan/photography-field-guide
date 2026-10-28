// https://docs.astro.build/en/guides/integrations-guide/sitemap/#usage
import type { APIRoute } from 'astro';
import { absoluteSiteUrl } from '@utils/deployment';

const robotsTxt = `
User-agent: Googlebot
Allow: /
Crawl-delay: 10

User-agent: Yandex
Allow: /
Crawl-delay: 2

User-agent: archive.org_bot
Allow: /
Crawl-delay: 2

User-agent: *
Allow: /

Sitemap: ${absoluteSiteUrl('/sitemap-index.xml')}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
