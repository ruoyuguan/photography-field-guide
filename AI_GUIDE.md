# Photography Field Guide AI Guide

This file records the project structure and conventions for coding assistants. See [README.md](README.md) for setup and [CONTEXT.md](CONTEXT.md) for domain terminology.

## Project overview

Photography Field Guide is a bilingual learning site based on ScrewFast. The active stack is Astro 7, Starlight, Tailwind CSS 4, TypeScript, and Preline. The current public site consists of localised home/404 pages and paired photography guides. Do not expose unfinished interactive labs or equipment galleries as working features.

Marketing locales are **en** (default, no prefix) and **zh-cn** (`/zh-cn/`). Shared views receive the locale explicitly; middleware exposes it as `Astro.locals.locale` and its strings as `Astro.locals.copy`. Locale routing helpers belong only in `src/utils/locale.ts`.

## Path aliases

Use the aliases defined in `tsconfig.json`:

| Alias           | Resolves to            |
| --------------- | ---------------------- |
| `@/*`           | `src/*`                |
| `@components/*` | `src/components/*`     |
| `@content/*`    | `src/content/*`        |
| `@data/*`       | `src/data_files/*`     |
| `@images/*`     | `src/images/*`         |
| `@scripts/*`    | `src/assets/scripts/*` |
| `@styles/*`     | `src/assets/styles/*`  |
| `@utils/*`      | `src/utils/*`          |
| `@views/*`      | `src/views/*`          |

## Active structure

- `src/pages/index.astro` and `src/pages/zh-cn/index.astro` are thin shells around `src/views/HomeView.astro`.
- `src/copy/en.ts` defines the `Copy` shape. `src/copy/zh-cn.ts` explicitly translates every active string and may inherit unused optional template modules from English.
- `src/content/docs/` contains Starlight MDX guides. Chinese guides mirror English slugs under `zh-cn/`, so language switching preserves the current guide.
- `src/components/BrandLogo.astro`, `src/images/icon*`, and `src/images/social.png` hold project branding.
- `src/data_files/constants.ts` and `astro.config.mjs` contain public-site metadata. Keep their URLs aligned.
- `scripts/smoke.mjs` checks the built bilingual routes and rejects visible template demo text.

Unused ScrewFast views, collections, copy modules, and optional components may remain as source material; they have no public routes. Do not delete optional components merely because the current home page does not import them. If an active route is added, replace its demo content and add both locales plus smoke coverage.

## Conventions

- **Copy:** put user-facing interface and home-page strings in `src/copy/`; do not hard-code localised prose in shared views. Stable IDs, not translated labels, drive link logic.
- **URLs:** use `localePath()` for marketing links. Starlight guide links include the appropriate locale prefix explicitly.
- **Metadata:** use `MainLayout` and `buildPageMetadata()` rather than hand-writing schema.org markup.
- **Styling:** use Tailwind CSS 4 syntax and retain responsive, keyboard-focus, and dark-theme states.
- **Images:** imported assets use `@images/`; static public files live in `public/`.
- **Scientific accuracy:** distinguish field-of-view equivalence from physical focal length, exposure brightness, depth of field, and total light. Do not multiply exposure settings by crop factor.
- **Interactions:** future sliders must be native accessible inputs with labels, keyboard support, useful fallback text, and calculations separated from presentation where practical.

## Commands

- `pnpm dev` — start the development server; CLI host/port arguments pass through to Astro.
- `pnpm build` — run `astro check`, build, and post-process HTML.
- `pnpm test:smoke` — serve `dist/` temporarily and check key bilingual routes.
- `pnpm format:fix` — format project files with Prettier.
- `python scripts/generate_brand_assets.py` — regenerate raster brand assets with Pillow.

Do not claim a change is verified until the relevant build or test has been run after that change.
