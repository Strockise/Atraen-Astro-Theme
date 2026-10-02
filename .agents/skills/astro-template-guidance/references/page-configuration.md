# Page configuration

## `src/config/config.json`
```jsonc
{
  "site": { "name", "titleSuffix", "description", "ogImage", "logoLight", "logoDark", "footerLogo", "lang" },
  "contact": { "email", "phone", "phoneHref", "address" },
  "social": [{ "name", "icon": "facebook|x|instagram", "url" }],   // root-domain or your own profile URLs
  "cta": { "label", "href" },                                      // header buttons
  "newsletter": { "eyebrow", "title", "placeholder", "button", "success", "error" },
  "copyright": { "text", "linkLabel", "linkUrl" },
  "video": { "url", "poster", "title", "width", "height" },        // lightbox video (.mp4 or embed URL)
  "webflow": { "siteId" }                                          // runtime id: do not change
}
```
To add a social icon, add an SVG branch to `src/components/global/SocialIcon.astro` and use its name as `icon`.

## `src/config/menu.json`
- `main[]`: header links `{ label, href }`. Rendered twice by webflow.css (text roll hover), so keep labels short.
- `footer.pages[]`, `footer.utility[]`, `footer.bottom[]`, plus the column titles.
Active state (`w--current` + `aria-current`) is automatic via `isCurrent()` in `src/lib/utils.ts` (exact path match).

## SEO per page
Pass props to `BaseLayout`: `title` (full title string), `description`, `image` (path or absolute URL), `type`
(`article` for posts), `noindex`. Canonical, Open Graph and Twitter tags are produced by `components/global/SEO.astro`.
`SITE_URL` in `.env` sets `Astro.site` (canonical URLs, sitemap, robots.txt).

## Environment variables (`.env`)
`SITE_URL`, `STRAPI_URL`, `STRAPI_API_TOKEN` (optional, server-only), `PUBLIC_FORM_ENDPOINT` (forms; empty = demo mode).
