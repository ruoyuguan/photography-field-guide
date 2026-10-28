import { withBase, withoutBase } from './deployment';

/** Shared locale rules for custom pages and Starlight component overrides. */

export const MARKETING_LOCALES = ['en', 'zh-cn'] as const;
export type MarketingLocale = (typeof MARKETING_LOCALES)[number];
export const DEFAULT_LOCALE: MarketingLocale = 'en';

const PREFIXED_LOCALES: readonly MarketingLocale[] = MARKETING_LOCALES.filter(
  locale => locale !== DEFAULT_LOCALE
);

export const LOCALE_INFO: Record<
  MarketingLocale,
  {
    label: string;
    lang: string;
    ogLocale: string;
    inLanguage: string;
    intl: string;
  }
> = {
  en: {
    label: 'English',
    lang: 'en',
    ogLocale: 'en_US',
    inLanguage: 'en-US',
    intl: 'en-US',
  },
  'zh-cn': {
    label: '简体中文',
    lang: 'zh-CN',
    ogLocale: 'zh_CN',
    inLanguage: 'zh-CN',
    intl: 'zh-CN',
  },
};

export function isMarketingLocale(value: unknown): value is MarketingLocale {
  return (
    typeof value === 'string' &&
    (MARKETING_LOCALES as readonly string[]).includes(value)
  );
}

/** Remove the deployment base before identifying the locale. */
export function splitLocale(pathname: string): {
  locale: MarketingLocale;
  path: string;
} {
  const normalized = withoutBase(pathname);
  for (const locale of PREFIXED_LOCALES) {
    const prefix = `/${locale}`;
    if (normalized === prefix) return { locale, path: '/' };
    if (normalized.startsWith(`${prefix}/`)) {
      return { locale, path: normalized.slice(prefix.length) };
    }
  }
  return { locale: DEFAULT_LOCALE, path: normalized };
}

export function resolveLocale(
  pathname: string,
  currentLocale?: string | undefined
): MarketingLocale {
  const { locale } = splitLocale(pathname);
  if (locale !== DEFAULT_LOCALE) return locale;
  if (isMarketingLocale(currentLocale)) return currentLocale;
  return DEFAULT_LOCALE;
}

/** Build a public path from a logical, unbased content route. */
export function localePath(locale: MarketingLocale, path = '/'): string {
  if (path.startsWith('#') || /^[a-z]+:/i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const localized =
    locale === DEFAULT_LOCALE
      ? clean
      : clean === '/'
        ? `/${locale}/`
        : `/${locale}${clean}`;
  return withBase(localized);
}

/** Return only real language destinations; the root 404 is a static-file special case. */
export function alternatePaths(
  pathname: string
): Record<MarketingLocale, string> {
  const { path } = splitLocale(pathname);
  if (/^\/404(?:\.html|\/)?$/.test(path)) {
    return {
      en: withBase('/404.html'),
      'zh-cn': withBase('/zh-cn/404/'),
    };
  }
  return Object.fromEntries(
    MARKETING_LOCALES.map(locale => [locale, localePath(locale, path)])
  ) as Record<MarketingLocale, string>;
}
