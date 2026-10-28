/**
 * Deployment-aware URL helpers shared by pages, metadata and Astro config.
 * Logical content routes never include the deployment base. Only withBase()
 * adds it, and it is safe to call with an already-prefixed generated asset.
 */

export const DEFAULT_SITE_ORIGIN = 'https://ruoyuguan.github.io';

const configuredBase = import.meta.env?.BASE_URL ?? '/';
const configuredOrigin = import.meta.env?.SITE ?? DEFAULT_SITE_ORIGIN;

export function normalizeBase(base?: string | null): string {
  const value = (base ?? '/').trim();
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

export function withBase(path: string, base = configuredBase): string {
  if (
    !path ||
    path.startsWith('#') ||
    path.startsWith('?') ||
    path.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(path)
  ) {
    return path;
  }

  const normalizedBase = normalizeBase(base);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (
    normalizedBase === '/' ||
    normalizedPath === normalizedBase ||
    normalizedPath.startsWith(`${normalizedBase}/`)
  ) {
    return normalizedPath;
  }
  return `${normalizedBase}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

export function withoutBase(pathname: string, base = configuredBase): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalizedBase = normalizeBase(base);
  if (normalizedBase === '/') return normalizedPath;
  if (normalizedPath === normalizedBase) return '/';
  if (normalizedPath.startsWith(`${normalizedBase}/`)) {
    return normalizedPath.slice(normalizedBase.length) || '/';
  }
  return normalizedPath;
}

export function absoluteSiteUrl(
  path = '/',
  origin = configuredOrigin,
  base = configuredBase
): string {
  return `${origin.replace(/\/+$/, '')}${withBase(path, base)}`;
}
