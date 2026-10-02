# Customizing Clavix

This guide covers everything you are likely to change, from the brand details to the content source.

## 1. Brand and contact details

Edit `src/config/site.ts`:

| Key | Used for |
|---|---|
| `name`, `titleSuffix`, `description` | Default page title and meta description |
| `url` | Canonical URLs and sitemap (or set `SITE_URL` in `.env`) |
| `ogImage` | Default social sharing image (`public/images/og-image.webp`) |
| `email`, `phone`, `phoneHref`, `address`, `mapUrl` | Contact pages |
| `social` | Social links (team cards on Home V3) |
| `copyright`, `credit` | Footer |

The logo is `public/images/Nav-Logo.svg`; favicons are `public/images/favicon*.png` and `webclip*.png`.

## 2. Navigation

Edit `src/config/navigation.ts`:

- `mainNav`: header links
- `pagesDropdown`: the "Pages" mega dropdown (three columns)
- `headerCta`, `headerMainCta`: header buttons
- `footerMainPages`, `footerCmsPages`, `footerUtilityPages`, `footerCta`, `footerMarquee`: footer

Removing a page you don't need: delete its file in `src/pages/` and remove its links from `navigation.ts`.

## 3. Colors, typography and spacing

All design tokens are CSS custom properties at the top of `src/styles/clavix.webflow.css` (`:root`), for example:

```css
--_colors---primary-color: ...;
--_typography---text-size--h1: ...;
--spacers--space-md: ...;
```

Change a token once and it updates everywhere. Keep the Webflow base files (`normalize.css`, `webflow.css`) as they
are; put your own rules in `src/styles/custom.css` (loaded last).

Fonts: Inter is loaded from Google Fonts in `src/layouts/BaseLayout.astro`; Open Sauce One is self-hosted in
`public/fonts/` and declared with `@font-face` in `clavix.webflow.css`.

## 4. Page content

Each page in `src/pages/` is a list of section components from `src/components/sections/<page>/`.
Sections used on several pages live in `src/components/sections/shared/`. Edit the text and images directly in the
section files, or reorder/remove sections in the page file.

Reusable building blocks:

```astro
<PrimaryButton href="/contact/contact-v1" text="Get Started" variant="light" />  <!-- dark | light | accent -->
<SectionTitle text="OUR SERVICES" variant="light" />                              <!-- base | light -->
```

Static images live in `public/images/`. Most images ship with responsive variants (`-p-500`, `-p-800`, …) referenced
in `srcset`; when you replace an image, either provide the same variants or simplify the `srcset`.

## 5. CMS content (blogs, services, team)

Content comes from one of two sources (see `src/lib/cms.ts`):

1. **Strapi** when `STRAPI_URL` is set in `.env` (see `strapi/README.md`).
2. **Bundled demo content** otherwise: `src/data/blogs.json`, `services.json`, `team.json`, with images in `public/cms/`.

Either way the fields are the same (`src/lib/types.ts`). Rich text fields are Markdown.
Lists are sorted by the `order` field. Collection lists are sliced like Webflow did, for example:

```astro
{take(blogs, 3).map((entry) => <BlogCard item={entry} />)}   // first 3 posts
{take(team, 1, 2).map(...)}                                  // 1 item, skipping 2
```

Detail pages are generated for every entry: `src/pages/blogs/[slug].astro`, `services/[slug].astro`, `team/[slug].astro`.

### Rebuilding on content changes

The site is static. After publishing in Strapi, rebuild the site. In production create a deploy hook on your host
(Vercel, Netlify, Cloudflare Pages) and add it as a Strapi webhook.

## 6. Contact forms

The three contact pages post `FormData` (`name`, `email`, `phone`, `subject`, `message`) to `PUBLIC_FORM_ENDPOINT`.
Any form backend that accepts a POST works (Formspree, Web3Forms, Basin, Getform, your own API route).
The success and error messages are the `.w-form-done` / `.w-form-fail` blocks in each contact section.
A hidden `_gotcha` honeypot field filters simple spam bots.

## 7. Animations

- `src/scripts/interactions.ts`: all GSAP animations. Elements opt in through attributes and classes from the
  original design: `page-load-0..3` (hero intro), `page-scroll-0..3` (fade up on scroll, staggered 0.2s),
  `title-scroll` / `heading-title` (character reveal), `scroll="scroll interaction"` (children stagger in).
- `src/scripts/webflow-ui.ts`: navigation, dropdown, sliders, video lightbox, background video toggle, forms.
- Smooth scrolling (Lenis) is in `src/scripts/main.ts`.

Animations are skipped automatically for visitors who prefer reduced motion. To disable one effect, remove the
attribute from the element (or delete the block in `interactions.ts`).

## 8. SEO

Every page passes `title` and `description` to `BaseLayout`. Detail pages use the entry title and summary;
blog posts also use the banner image as the social image. A sitemap is generated at build time
(`@astrojs/sitemap`); set `SITE_URL` so URLs are absolute.

## 9. Deployment

```bash
npm run build   # static files in dist/
```

Deploy `dist/` to any static host. Set `SITE_URL`, and (if used) `STRAPI_URL`, `STRAPI_API_TOKEN` and
`PUBLIC_FORM_ENDPOINT` as environment variables in your hosting dashboard.
