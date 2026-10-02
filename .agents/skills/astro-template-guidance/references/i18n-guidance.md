# Multi-language (i18n)

The template ships in **English only**. There is no i18n routing or translation layer out of the box.
`config.json → site.lang` sets `<html lang>`.

## Adding languages
1. Astro routing: add to `astro.config.mjs`
   ```js
   i18n: { locales: ['en', 'fr'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } }
   ```
   and create localized pages under `src/pages/fr/…` (reuse the same section components).
2. UI strings: move texts from `config.json`, `menu.json` and the section components into per-locale files
   (e.g. `src/i18n/en.json`, `src/i18n/fr.json`) and pass them as props.
3. Strapi: enable the **Internationalization** plugin per content type (Content-Type Builder → Advanced settings →
   "Enable localization"), then add `locale=<code>` to the requests in `src/lib/cms.ts → strapiGetAll`.
4. Set `lang` on `<html>` per page (make it a `BaseLayout` prop) and add `hreflang` alternates in `SEO.astro`.

Keep `wfPage` the same for a localized copy of a page so its animations still apply.
