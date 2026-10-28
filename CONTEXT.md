# Photography Field Guide domain glossary

Use these terms consistently in code, documentation, and reviews.

## Marketing site

The Astro pages under `src/pages/`, currently the home and localised 404 pages. This is distinct from the **Guides**, which are Starlight pages sourced from `src/content/docs/`.

## Marketing locale

A language used by the marketing site: `en` (default, no URL prefix) or `zh-cn` (`/zh-cn/…`). `src/utils/locale.ts` owns locale resolution, URL localisation, and alternate-page paths. Request code reads `Astro.locals.locale`.

## Copy table

The typed collection of user-facing strings for a marketing locale. `src/copy/en.ts` defines the shape; `src/copy/zh-cn.ts` supplies Simplified Chinese for all active pages. Request code reads `Astro.locals.copy` or calls `getCopy(locale)`.

## View

The shared implementation of a localised marketing route, such as `src/views/HomeView.astro`. Files in `src/pages/` are thin route shells and should not duplicate page markup.

## Guide

A photography tutorial authored in MDX under `src/content/docs/`. English and Chinese guides use matching relative slugs, with the Chinese version under `zh-cn/`. Starlight owns guide navigation, search, and locale switching.

## Sensor format

The physical dimensions of a camera's light-sensitive area, such as full frame or APS-C. It is not, by itself, a measure of image quality.

## Crop factor

A ratio used to compare sensor dimensions and fields of view with a reference format, normally full frame. It does not physically change a lens or its marked f-number.

## Equivalent focal length

A comparison of **field of view** with full frame: actual focal length multiplied by crop factor. It does not rename the lens or directly convert aperture, shutter speed, or ISO.

## Exposure triangle

A learning model connecting aperture, shutter speed, and ISO. Aperture and shutter speed affect light reaching the sensor; ISO affects signal amplification/processing. Depth of field, motion blur, image brightness, and total light must be discussed as distinct concepts.

## Page metadata

The title, description, canonical URL, Open Graph fields, alternate-language links, and JSON-LD assembled by `src/utils/metadata.ts` and rendered by `Meta.astro` for marketing pages.
