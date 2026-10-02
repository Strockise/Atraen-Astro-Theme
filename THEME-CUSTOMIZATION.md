# Atraen: Theme Customization Guide

This guide covers everything you can change in the theme, from branding to the CMS. For a quick start see
[README.md](./README.md).

- [1. Site settings](#1-site-settings)
- [2. Navigation](#2-navigation)
- [3. Content: Strapi CMS](#3-content-strapi-cms)
- [4. Strapi MCP server (AI content editing)](#4-strapi-mcp-server-ai-content-editing)
- [5. Static content: FAQ, testimonials, page text](#5-static-content-faq-testimonials-page-text)
- [6. Forms](#6-forms)
- [7. Styling and design tokens](#7-styling-and-design-tokens)
- [8. Animations and interactions](#8-animations-and-interactions)
- [9. Adding a page](#9-adding-a-page)
- [10. SEO](#10-seo)
- [11. Deployment and rebuilds](#11-deployment-and-rebuilds)

---

## 1. Site settings

`src/config/config.json`

| Key | What it controls |
|---|---|
| `site.name`, `site.titleSuffix` | Brand name and the text used in page titles (`About - <titleSuffix>`) |
| `site.description` | Default meta description |
| `site.ogImage` | Default social sharing image (path in `public/`) |
| `site.logoLight`, `site.logoDark`, `site.footerLogo` | Logo files (`public/images/`). The header shows the light logo over dark heroes and the dark logo elsewhere |
| `contact.email`, `contact.phone`, `contact.phoneHref` | Footer contact links |
| `social[]` | Footer social icons (`icon` is one of `facebook`, `x`, `instagram`; add more in `src/components/global/SocialIcon.astro`) |
| `cta.label`, `cta.href` | The "Let's Collaborate" buttons in the header |
| `newsletter.*` | Footer newsletter texts and success/error messages |
| `copyright.*` | Footer copyright line |
| `video.*` | Video opened by the "Watch Now" / "Watch Video" lightboxes: an `.mp4` file or any embed URL |
| `webflow.siteId` | Internal id used by the interaction runtime. Don't change it |

Environment variables (`.env`, see `.env.example`):

| Variable | Purpose |
|---|---|
| `SITE_URL` | Your production URL (canonical links, sitemap, Open Graph) |
| `STRAPI_URL` | Strapi base URL. Empty = build from `src/data/*.json` |
| `STRAPI_API_TOKEN` | Optional read-only Strapi API token |
| `PUBLIC_FORM_ENDPOINT` | Where forms are sent. Empty = demo mode |

## 2. Navigation

`src/config/menu.json`

- `main`: header links (label + href). Active links get the `w--current` style automatically.
- `footer.pages`, `footer.utility`, `footer.bottom`: the footer link columns.

## 3. Content: Strapi CMS

The theme reads two collections at build time.

### Blog (`api::blog.blog`)

| Field | Type | Used for |
|---|---|---|
| `title` | Text | Card and post title |
| `slug` | UID | URL: `/blog/<slug>` |
| `order` | Number | Sort order (ascending). The home page shows the first 3 |
| `readTime` | Text | "6 Min" |
| `date` | Date | Shown as "October 25, 2025" |
| `mainImage` | Media | Card thumbnail |
| `bannerImage` | Media | Post header image and social sharing image |
| `content` | Rich text (Markdown) | Post body. Markdown and HTML both work |
| `seoDescription` | Long text | Optional meta description |

### Service (`api::service.service`)

| Field | Type | Used for |
|---|---|---|
| `title`, `slug`, `order` | | Title, URL `/service/<slug>`, sort order. The home page tabs show the first 4 |
| `number` | Text | "//01" label |
| `summary` | Long text | Card text |
| `thumbnail` | Media | Card image |
| `banner` | Media | Detail page hero image |
| `heroSummary` | Long text | Detail hero text (right side) and meta description |
| `overview` | Long text | Large intro paragraph |
| `description` | Long text | Paragraph next to the gallery |
| `audienceOne` … `audienceFour` | Rich text | "Who this service is designed for" cards (a heading + a paragraph each) |
| `gallery` | Multiple media | Detail page images (2 recommended) |

### Setup

```bash
npm run strapi:install
cp strapi/.env.example strapi/.env   # replace every "tobemodified" value with a random secret
npm run strapi:seed                  # 9 posts + 6 services + images, published
npm run strapi:dev                   # http://localhost:1337/admin
```

- The seed script (`strapi/scripts/seed.js`) reads `src/data/blogs.json`, `src/data/services.json` and the images in
  `public/cms/`. It is idempotent (entries are matched by slug). `npm run seed:reset --prefix strapi` deletes and
  re-creates the theme's entries.
- The Public role gets `find` / `findOne` on both types automatically (`strapi/src/index.ts`), so the Astro build needs
  no token. Prefer a token? Remove that bootstrap code, create a **read-only** API token and set `STRAPI_API_TOKEN`.
- Only **published** entries are shown. Drafts stay hidden.
- Content model changes: edit `strapi/src/api/<type>/content-types/<type>/schema.json` (or use the Content-Type
  Builder in development), then update the mapping in `src/lib/cms.ts`.
- Production: switch `DATABASE_CLIENT` to `postgres`/`mysql` and use a cloud upload provider (S3, Cloudinary).
  Remote image URLs work as-is.

### Without Strapi

Leave `STRAPI_URL` empty and edit `src/data/blogs.json` / `src/data/services.json` directly. Images go in `public/cms/`.

## 4. Strapi MCP server (AI content editing)

Strapi 5.47+ includes an MCP server, already enabled in `strapi/config/server.ts`
(`mcp.enabled`, toggled by `STRAPI_MCP_ENABLED`). It lets AI assistants list, create, update, publish and unpublish
blog posts and services, and manage the media library, with the permissions of the token you give them.

1. Start Strapi (`npm run strapi:dev`) and log in to the admin.
2. **Settings → Admin tokens → Create new token.** Give it only the permissions the assistant needs
   (for example Content Manager → Blog / Service: read, create, update, publish).
3. Connect your client. Claude Code:

   ```bash
   claude mcp add strapi-mcp --transport http http://localhost:1337/mcp \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

   Or copy `.mcp.example.json` to `.mcp.json` and set the `STRAPI_MCP_TOKEN` environment variable.
4. Ask things like *"Create a draft blog post about goal setting, 5 Min read, dated today"* or
   *"Publish the service 'Leadership Development' and update its summary"*.

Limits (from Strapi): the MCP server manages entries and existing media but can't upload new files or change the
content model. Upload images in the Media Library first, and change schemas in code. After content changes, rebuild
the site (see §11).

## 5. Static content: FAQ, testimonials, page text

| Content | File |
|---|---|
| FAQ (title, summary, questions) | `src/data/faq.json` |
| Testimonials slider | `src/data/testimonials.json` |
| Page sections (hero texts, about, process, principles…) | `src/components/sections/<page>/*.astro` |

Each section is a self-contained component. Edit the text in place, and keep the class names and the `data-*`
attributes (they drive the layout and animations).

## 6. Forms

The newsletter (footer) and contact forms keep the original markup and success/error messages.
`src/scripts/forms.ts` sends the fields as JSON (`POST`) to `PUBLIC_FORM_ENDPOINT`:

- **Formspree**: `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/<your-id>`
- **Web3Forms / Basin / Getform**: use their JSON endpoint URL
- **Your own API**: any endpoint returning a 2xx status

Any 2xx response shows the success message, and anything else shows the error message. With no endpoint the forms
run in demo mode (success message, nothing sent).

## 7. Styling and design tokens

| File | Purpose |
|---|---|
| `src/styles/normalize.css`, `webflow.css` | Base reset and component styles. Don't edit |
| `src/styles/atraen-astro-theme.webflow.css` | The theme's styles and design tokens |
| `src/styles/custom.css` | **Your overrides.** Loaded last |
| `src/styles/ix3-prehide.css` | Hides animated elements until animations start. Don't edit |

Design tokens are CSS custom properties in `:root` at the top of `atraen-astro-theme.webflow.css`:

| Token | Default |
|---|---|
| `--_colors---main-color--primary-color` | `#ff8f00` (accent orange) |
| `--_colors---main-color--black-color` | `#0f0f0f` |
| `--_colors---main-color--white-color` | `white` |
| `--_colors---nutral-color--200 … 800` | neutral greys |
| `--_typography---font-family--body-font-family` | `"Inter Tight", sans-serif` |
| `--_typography---h1--font-size` … `h6` | heading sizes |
| `--container-sizes--container-main` | `67rem` |
| `--spacers--*`, `--radius-sizes--*` | spacing and radius scale |

To re-brand, override them in `custom.css`:

```css
:root {
  --_colors---main-color--primary-color: #2f6bff;
}
```

To change the font, update the Google Fonts `<link>` in `src/layouts/BaseLayout.astro` and the font-family tokens.

Breakpoints: desktop first, `max-width: 991px` (tablet), `767px` (mobile landscape), `479px` (mobile), plus
`min-width: 1280px / 1440px / 1920px` for large screens.

## 8. Animations and interactions

Scroll reveals, hover effects, the FAQ accordion, the mobile menu, tabs and sliders are driven by the interaction
runtime in `public/js/webflow.js` (with GSAP, ScrollTrigger and SplitText from `public/js/vendor/`). Smooth scrolling
(desktop only) and the number counters live in `public/js/site.js`.

Things to keep when you edit markup:

- Each page passes its `wfPage` id to `BaseLayout`. The animations of that page are keyed to it.
- Attributes such as `top-delay-0`, `top-delay-2`, `delay-02`, `scroll="scroll interaction"`, `data-wf-target`,
  `data-wf-component-id`, `data-w-tab` and ids like `w-node-…` trigger or position animations. Copy them along with an
  element when you duplicate it.
- To animate a new element with the standard fade-up, add `top-delay-0=""` (or `top-delay-2`) to it.
- Number counters: add the class `_wf-counter` to an element whose text is a number (e.g. `150+`).
- Smooth scrolling is turned off for visitors who prefer reduced motion (`prefers-reduced-motion: reduce`).

## 9. Adding a page

```astro
---
// src/pages/coaching.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/global/Header.astro';
import Footer from '../components/global/Footer.astro';
import FaqSection from '../components/sections/FaqSection.astro';

const wfPage = '6abe84b3182afe641eb8e346'; // reuse the id of the page whose animations you want (here: About)
---
<BaseLayout title="Coaching - Personal Consulting" description="…" wfPage={wfPage}>
  <div class="page-wrapper">
    <Header />
    <div class="main-wrapper">
      <!-- reuse any section component, or write your own with the theme classes -->
      <FaqSection />
    </div>
    <Footer wfPage={wfPage} />
  </div>
</BaseLayout>
```

Then add it to `src/config/menu.json`. The style guide page (`/style-guide`) shows every typography and button style.

Page ids: Home `…343`, About `…346`, Services `…349`, Service detail `…34a`, Blog post `…34c`, Blog `…34d`,
Contact `…34e`, Style guide `…34f`, 404 `…351` (prefix `6abe84b3182afe641eb8e`).

## 10. SEO

- `BaseLayout` props: `title`, `description`, `image`, `type`, `noindex`. Defaults come from `config.json → site`.
- Blog posts use the banner image as `og:image` and `seoDescription` (if set) as the description. Services use
  `heroSummary`.
- `sitemap-index.xml` (via `@astrojs/sitemap`, 404 excluded) and `robots.txt` are generated from `SITE_URL`.

## 11. Deployment and rebuilds

The site is static. Content changes in Strapi need a rebuild:

1. Deploy the Astro site (Vercel: framework preset Astro, build `npm run build`, output `dist`) with `SITE_URL`,
   `STRAPI_URL` and `PUBLIC_FORM_ENDPOINT` set.
2. Host Strapi somewhere reachable from the build (Strapi Cloud, Railway, Render, a VPS). Run `npm run seed` there
   once if you want the demo content.
3. Create a **Deploy Hook** on your host, then in Strapi **Settings → Webhooks** add it for the
   `entry.publish`, `entry.unpublish`, `entry.update` and `entry.delete` events.
