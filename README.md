# Photography Field Guide

A bilingual photography learning site for beginners, built with Astro, Starlight, and Tailwind CSS. English is the default language; Simplified Chinese is available under `/zh-cn/`.

The project is based on the open-source [ScrewFast](https://github.com/mearashadowfax/ScrewFast) template and retains its MIT license.

## Contributors

- [@ruoyuguan](https://github.com/ruoyuguan) — Project owner, product direction, content decisions, and publishing.

### AI-assisted development

- **Kimi (Moonshot AI)** — Feature implementation, debugging, automated checks, documentation, and engineering delivery.
- **ChatGPT (OpenAI)** — Product architecture, content design, technical review, and MVP refinement.

AI assistants supported the development of this project. The project owner directs the work and makes the final decisions on published changes.

## Current scope

- English and Simplified Chinese learning paths: 22 subject tutorials plus orientation, maintained as 46 MDX documents in 23 bilingual pairs.
- Shared intent-based starting links, a compact six-task route map, browser-progress suggestions and contextual returns, with every mission freely available.
- Six bilingual practice missions: light direction, subject–background framing, a three-photo neighborhood story, photo selection / review, safe backup / export, and lightweight editing. They include prediction, explanatory feedback, local observation or actions, self-review, and browser progress without accounts or aesthetic scores. C5 links to C6; the editing exercise compares brightness, white balance, and crop separately and permits an unchanged final version.
- Two interactive tools for sensor formats / equivalent focal length and exposure stops, with accessible native inputs and tested calculations.
- A searchable bilingual glossary with 34 terms.
- Camera and lens guides, three precisely scoped external gallery links, and 13 curated resources.
- Localized navigation, language switching, documentation search, 404 pages, metadata, and root / subpath deployment checks.

The current source inventory includes 52 structured records and 84 HTML routes. The reviewed handoff checkpoint is `95f19f4`; this MVP commit includes C5, C6, learning-path improvements, review fixes, and manual publishing preparation on that baseline. Current validation results are recorded in [docs/STATUS.md](docs/STATUS.md). See [the C6 integration review](docs/C6_INTEGRATION_REVIEW.md) for executed checks and limitations. Historical reports remain snapshots rather than current feature inventories.

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

`pnpm test:unit` currently contains 80 cases for photography formulas, units and boundary inputs, task feedback, practice persistence / recovery / isolated reset, and the combined C1–C6 catalog. Execution results belong to the current validation record. `pnpm build` runs type checking, validates content, creates the static site in `dist/`, and minifies its HTML. The smoke test checks all current public pages and retired/unknown routes. The artifact test checks internal links and assets, canonical/hreflang URLs, 404 `noindex`, manifest, robots, sitemap, and search artifacts.

After a root-path production build, an optional real-browser check verifies the language menu, Chinese navigation, English and Chinese search, proportional sensor diagram, calculator results, slider/input synchronization, keyboard operation, reset and error states, no-JavaScript fallbacks, mobile overflow, mission feedback, local progress, backup/export learning, restricted-storage theme controls, the six-task catalog, C5 → C6 navigation, both progress namespaces, and the shared editing-scene geometry:

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
- `src/data_files/practice-catalog.ts` and `src/utils/practice/index-progress.ts` — C1–C6 navigation and progress summaries. C6 keeps its existing dedicated storage key; the catalog reads both stores without migration. “Clear all practice progress” removes exactly both practice keys, preserving theme and other browser data.
- `src/utils/deployment.ts` and `src/utils/locale.ts` — deployment-aware URLs and language routes.
- `scripts/smoke.mjs` and `scripts/check-build.mjs` — local production-output checks.
- `scripts/browser-check.mjs` and `scripts/browser-tool-checks.mjs` — temporary-preview browser checks.
- `docs/` — original requirements, repository audit, architecture, content, resource, and roadmap documents.

Published non-orientation articles need real sources and a review date. Unpublished drafts must use `draft: true`; they are not production routes. Public external resources require verified targets and evidence. Network availability is intentionally separate from offline builds.

## Deployment

The output is a static site suitable for services such as GitHub Pages, Vercel, or Netlify. `SITE_ORIGIN` controls the public origin (default `https://ruoyuguan.github.io`); `SITE_BASE` independently controls the deployment prefix (default `/`). Do not combine the base into the origin.

A manual-only GitHub Pages workflow is prepared for the MVP at `/photography-field-guide/`. It does not deploy on push or pull requests. See [the MVP release scope and steps](docs/MVP_RELEASE.md); no site has been published. The root static host can serve `404.html` for missing pages. `/zh-cn/404/` is also generated, but locale-specific fallback behavior depends on the eventual host; valid Chinese pages must not be rewritten to it.

Because the site has not been published, the old `/start-here/` and `/basics/...` routes were retired without redirects. Revisit that decision before changing public URLs later.

The repository may remain private during development. Making it public is a separate decision from running it locally.

## Brand assets

The checked-in raster assets can be regenerated with a Python environment that includes Pillow:

```bash
python scripts/generate_brand_assets.py
```

## License

MIT. See [`LICENSE`](LICENSE). ScrewFast's original copyright and license notices are preserved.

For sharing with friends while keeping the development repository private and avoiding third-party GitHub access, see [the sharing options](docs/SHARING_WITHOUT_GITHUB_ACCESS.md). No public deployment has been made in this local review.

Content review dates use the maintainer’s Asia/Shanghai authoring day, including in UTC CI builds. The current entry-path review and limits are in [docs/LEARNING_PATH_UX_REVIEW.md](docs/LEARNING_PATH_UX_REVIEW.md). For focused browser development checks, use `PFG_BROWSER_SCOPE=learning-paths pnpm test:browser`; the default command still runs the full suite.
