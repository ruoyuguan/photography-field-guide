# Photography Field Guide

A bilingual photography learning site for beginners, built with Astro, Starlight, and Tailwind CSS. English is the default language; Simplified Chinese is available under `/zh-cn/`.

The project is based on the open-source [ScrewFast](https://github.com/mearashadowfax/ScrewFast) template and retains its MIT license.

## Current scope

- English and Simplified Chinese learning paths: 20 subject tutorials plus orientation, maintained as 42 paired MDX documents.
- Four complete bilingual practice missions: light direction, subject–background framing, a three-photo neighborhood story, and photo selection / review. All include prediction, explanatory feedback, real-world observation, self-review, and local progress without accounts or aesthetic scores.
- Two interactive tools for sensor formats / equivalent focal length and exposure stops, with accessible native inputs and tested calculations.
- A searchable bilingual glossary with 34 terms.
- Camera and lens guides, three precisely scoped external gallery links, and 13 curated resources.
- Localized navigation, language switching, documentation search, 404 pages, metadata, and root / subpath deployment checks.

The latest imported checkpoint is `29983b3` (color rendering tutorials). Current review, cleanup, and validation status is recorded in [docs/STATUS.md](docs/STATUS.md). Historical Phase 0/1 reports remain snapshots rather than current feature inventories.

### Routes

| Section        | English                  | 简体中文                       |
| -------------- | ------------------------ | ------------------------------ |
| Home           | `/`                      | `/zh-cn/`                      |
| Learn          | `/learn/`                | `/zh-cn/learn/`                |
| Practice       | `/practice/`             | `/zh-cn/practice/`             |
| Tools          | `/tools/`                | `/zh-cn/tools/`                |
| Crop factor    | `/tools/crop-factor/`    | `/zh-cn/tools/crop-factor/`    |
| Exposure stops | `/tools/exposure-stops/` | `/zh-cn/tools/exposure-stops/` |
| Glossary       | `/glossary/`             | `/zh-cn/glossary/`             |
| Gear           | `/gear/`                 | `/zh-cn/gear/`                 |
| Galleries      | `/galleries/`            | `/zh-cn/galleries/`            |
| Resources      | `/resources/`            | `/zh-cn/resources/`            |
| About          | `/about/`                | `/zh-cn/about/`                |

## Local development

The canonical local checkout is `/Users/ruoyu/photography-field-guide`. Run development and checks from this directory.

Use Node.js **22.23.4 or newer** and pnpm **10.34.9**. `.node-version` selects Node 24.22.1 for version managers that support it.

```bash
cd /Users/ruoyu/photography-field-guide
pnpm install --frozen-lockfile
pnpm dev
```

To select a host or port explicitly:

```bash
pnpm dev -- --host 0.0.0.0 --port 4321
```

If pnpm is not installed globally, this verified equivalent runs the pinned version without changing project dependencies:

```bash
npm exec --yes --package=pnpm@10.34.9 -- pnpm dev
```

## Checks

```bash
pnpm format:check
pnpm test:unit
pnpm build
pnpm test:smoke
pnpm test:build
```

`pnpm test:unit` checks the photography formulas, unit consistency, representative examples, and invalid or boundary inputs. `pnpm build` runs type checking, validates content, creates the static site in `dist/`, and minifies its HTML. The smoke test checks all current public pages and retired/unknown routes. The artifact test checks internal links and assets, canonical/hreflang URLs, 404 `noindex`, manifest, robots, sitemap, and search artifacts.

After a root-path production build, an optional real-browser check verifies the language menu, Chinese navigation, English and Chinese search, proportional sensor diagram, calculator results, slider/input synchronization, keyboard operation, reset and error states, no-JavaScript fallbacks, and mobile overflow:

```bash
pnpm build
pnpm test:browser
```

The browser check uses an installed Google Chrome (override `CHROME_BIN` if necessary) and a temporary production preview. It uses a profile in the system temporary directory and closes only its own Chrome and preview processes. Normal completion, errors, SIGINT, and SIGTERM share the cleanup routine. SIGKILL or a system crash cannot run JavaScript cleanup. It is not part of CI; Starlight disables actual Pagefind search in the development server.

Test a GitHub Pages project subpath with:

```bash
SITE_BASE=/photography-field-guide pnpm build
SITE_BASE=/photography-field-guide pnpm test:smoke
SITE_BASE=/photography-field-guide pnpm test:build
```

Run the ordinary root-path build again after a subpath test so `dist/` matches the default local configuration. CI runs both variants.

## Project map

- `src/pages/` and `src/pages/zh-cn/` — marketing routes; Starlight supplies the Learn routes.
- `src/content/docs/learn/` and `src/content/docs/zh-cn/learn/` — paired articles.
- `src/content/{glossary,cameras,lenses,resources,galleries}/` — structured records.
- `src/utils/content-schema.ts` — shared Zod schemas and strict ISO-date validation.
- `src/utils/content-validation.ts` — bilingual pairing, publishing, reference, prerequisite, mount, and resource-verification checks.
- `src/content/i18n/zh-CN.yml` — localized Starlight/Pagefind interface text.
- `src/components/tools/` and `src/views/ToolsIndexView.astro` — localized tool interfaces and client controllers.
- `src/utils/photography/` and `tests/photography/` — pure photography calculations and formula tests.
- `src/utils/deployment.ts` and `src/utils/locale.ts` — deployment-aware URLs and language routes.
- `scripts/smoke.mjs` and `scripts/check-build.mjs` — local production-output checks.
- `scripts/browser-check.mjs` and `scripts/browser-tool-checks.mjs` — temporary-preview browser checks.
- `docs/` — original requirements, repository audit, architecture, content, resource, and roadmap documents.

Published non-orientation articles need real sources and a review date. Unpublished drafts must use `draft: true`; they are not production routes. Public external resources require verified targets and evidence. Network availability is intentionally separate from offline builds.

## Deployment

The output is a static site suitable for services such as GitHub Pages, Vercel, or Netlify. `SITE_ORIGIN` controls the public origin (default `https://ruoyuguan.github.io`); `SITE_BASE` independently controls the deployment prefix (default `/`). Do not combine the base into the origin.

No hosting platform has been selected or deployed by this phase. The root static host can serve `404.html` for missing pages. `/zh-cn/404/` is also generated, but locale-specific fallback behavior depends on the eventual host; valid Chinese pages must not be rewritten to it.

Because the site has not been published, the old `/start-here/` and `/basics/...` routes were retired without redirects. Revisit that decision before changing public URLs later.

The repository may remain private during development. Making it public is a separate decision from running it locally.

## Brand assets

The checked-in raster assets can be regenerated with a Python environment that includes Pillow:

```bash
python scripts/generate_brand_assets.py
```

## License

MIT. See [`LICENSE`](LICENSE). ScrewFast's original copyright and license notices are preserved.
