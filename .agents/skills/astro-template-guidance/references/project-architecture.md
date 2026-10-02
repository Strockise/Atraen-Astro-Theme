# Project architecture

## Stack
- Astro 7, static output (`output: 'static'`, `build.format: 'directory'` → clean URLs like `/about`).
- Global CSS converted from the original design (no Tailwind, no scoped styles).
- Interactions: Webflow runtime (`public/js/webflow.js`) + GSAP/ScrollTrigger/SplitText + Lenis, all self-hosted
  and loaded as classic scripts at the end of `<body>` by `src/layouts/BaseLayout.astro`.
- Content: Strapi 5 (REST, build time) with a local JSON fallback.

## Folders
```
src/
  pages/                 routes. Dynamic: blog/[slug].astro, service/[slug].astro (getStaticPaths)
  layouts/BaseLayout.astro   <html data-wf-page data-wf-site>, head/SEO, CSS imports, runtime scripts
  components/global/     Header, Footer, SEO, PrimaryButton, SecondaryButton, NewsletterForm, CollectionList,
                         SliderControls, icons, VideoLightboxData
  components/cards/      BlogCard, ServiceCard
  components/sections/   one folder per page (home/, about/, service/, service-detail/, blog/, blog-detail/,
                         contact/, style-guide/, not-found/) + shared FaqSection, TestimonialSection, BlogSliderSection
  config/                config.json (site settings), menu.json (navigation)
  data/                  blogs.json, services.json (CMS fallback + Strapi seed source), faq.json, testimonials.json
  lib/cms.ts             getBlogs(), getServices(), formatDate(); Blog/Service/Media types
  lib/utils.ts           isCurrent(), normalizePath()
  scripts/forms.ts       form submission (bundled module)
  styles/                normalize.css, webflow.css, atraen-astro-theme.webflow.css, custom.css, ix3-prehide.css
public/
  images/ videos/ cms/   static assets (cms/ = demo CMS images)
  js/                    webflow.js, site.js, vendor/
strapi/                  Strapi 5 app: src/api/{blog,service}, scripts/seed.js, config/server.ts (MCP enabled)
```

## Data flow
1. A page's frontmatter calls `getBlogs()` / `getServices()` from `src/lib/cms.ts`.
2. `cms.ts` checks `import.meta.env.STRAPI_URL`:
   - set → `GET {STRAPI_URL}/api/blogs?populate=*&sort=order:asc` (paginated), maps to the `Blog`/`Service` types,
     converts rich text (Markdown/HTML) to HTML with `marked`, makes media URLs absolute.
   - empty → imports `src/data/*.json`.
3. Results are memoised per build, then passed as props to sections/cards.
4. Lists render through `CollectionList.astro`, which reproduces Webflow's `.w-dyn-list > .w-dyn-items > .w-dyn-item`
   structure (and `.w-dyn-empty` when there are no items).

## Webflow runtime contract
- `BaseLayout` gets `wfPage` (the original Webflow page id) → `<html data-wf-page>`. IX3 animation definitions inside
  `webflow.js` are keyed by page id + element/component ids.
- `src/styles/ix3-prehide.css` hides animated elements until the runtime adds `w-mod-ix3` to `<html>`.
- `forms.ts` intercepts `submit` in the capture phase so webflow.js never posts to Webflow.
