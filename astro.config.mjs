import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import {
  DEFAULT_SITE_ORIGIN,
  absoluteSiteUrl,
  normalizeBase,
} from './src/utils/deployment.ts';

const site = process.env.SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN;
const base = normalizeBase(process.env.SITE_BASE);
const socialImage = absoluteSiteUrl('/social.webp', site, base);

export default defineConfig({
  site,
  base,
  image: {
    domains: ['images.unsplash.com'],
  },
  prefetch: true,
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          'zh-cn': 'zh-CN',
        },
      },
    }),
    starlight({
      title: 'Photography Field Guide',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: { 'zh-CN': '从零开始' },
          items: [
            {
              label: 'Start Here',
              translations: { 'zh-CN': '从这里开始' },
              link: 'learn/',
            },
          ],
        },
        {
          label: 'Sensor & Lens',
          translations: { 'zh-CN': '传感器与镜头' },
          items: [{ autogenerate: { directory: 'learn/sensor-lens' } }],
        },
        {
          label: 'Exposure',
          translations: { 'zh-CN': '曝光基础' },
          items: [{ autogenerate: { directory: 'learn/exposure' } }],
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/ruoyuguan/photography-field-guide',
        },
      ],
      disable404Route: true,
      customCss: ['./src/assets/styles/starlight.css'],
      // Starlight applies Astro's base to this logical public asset path.
      favicon: '/favicon.ico',
      components: {
        SiteTitle: './src/components/ui/starlight/SiteTitle.astro',
        Head: './src/components/ui/starlight/Head.astro',
        MobileMenuFooter:
          './src/components/ui/starlight/MobileMenuFooter.astro',
        ThemeSelect: './src/components/ui/starlight/ThemeSelect.astro',
      },
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: socialImage },
        },
        {
          tag: 'meta',
          attrs: { property: 'twitter:image', content: socialImage },
        },
      ],
    }),
    mdx(),
  ],
  experimental: {
    clientPrerender: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
