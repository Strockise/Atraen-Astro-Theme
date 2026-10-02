# Atraen: Personal Consulting Astro Theme

Atraen is a modern, animated Astro theme for coaches, consultants and advisors. It ships with a home page,
about, services, blog, contact, style guide and 404 pages, plus Strapi-powered blog posts and services.

**Live demo:** https://atraen-astro.vercel.app <!-- replace with your deployment URL -->

![Astro 7](https://img.shields.io/badge/Astro-7-orange) ![Strapi 5](https://img.shields.io/badge/Strapi-5-blue)

## Features

- **9 page templates**: Home, About, Services, Service detail, Blog, Blog post, Contact, Style guide, 404
- **Strapi 5 headless CMS** for Blogs and Services, with a seed script that loads all demo content
- **Strapi MCP server enabled**, so AI assistants (Claude Code, Cursor and others) can manage content for you
- **Works without a CMS**: if `STRAPI_URL` is empty, the site builds from the bundled demo content in `src/data/`
- Smooth scroll (Lenis), scroll-triggered and hover animations (GSAP), counters, sliders, tabs, video lightbox
- Fully responsive (1920 / 1440 / 1280 / 991 / 767 / 479 breakpoints)
- SEO: per-page titles and descriptions, canonical URLs, Open Graph and Twitter cards, sitemap, robots.txt
- Working newsletter and contact forms, posting to any form endpoint (Formspree, Web3Forms, Basin, your own API)
- Static output, deployable anywhere (Vercel, Netlify, Cloudflare Pages)

## Tech stack

| Part | Technology |
|---|---|
| Framework | [Astro 7](https://astro.build) (static output) |
| CMS | [Strapi 5](https://strapi.io) (REST API at build time, SQLite by default) |
| Styling | Plain global CSS (`src/styles/`), design tokens as CSS custom properties |
| Interactions | Webflow interaction runtime (`public/js/webflow.js`) + GSAP 3, ScrollTrigger, SplitText, Lenis (self-hosted) |
| Fonts | Inter Tight (Google Fonts) |

## Getting started

Requirements: **Node.js 22.12+** and npm.

```bash
# 1. Install the site
npm install

# 2. Configure the site
cp .env.example .env            # edit SITE_URL, STRAPI_URL, PUBLIC_FORM_ENDPOINT

# 3. Run it
npm run dev                     # http://localhost:4321
```

With `STRAPI_URL` empty, the site uses the demo content in `src/data/`, so you can explore the theme right away.

### Set up Strapi (recommended)

```bash
npm run strapi:install                # install the CMS (strapi/)
cp strapi/.env.example strapi/.env    # then replace every "tobemodified" secret
npm run strapi:seed                   # load the 9 demo posts + 6 services (with images)
npm run strapi:dev                    # http://localhost:1337/admin → create your admin user
```

Set `STRAPI_URL=http://localhost:1337` in `.env` and restart `npm run dev`. All CMS pages now come from Strapi.

> npm 11+ blocks dependency install scripts by default. `strapi/package.json` already allows the ones Strapi needs
> (`better-sqlite3`, `@swc/core`, `esbuild`) in `allowScripts`.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run strapi:install` | Install the Strapi project in `strapi/` |
| `npm run strapi:dev` | Start Strapi (admin at `localhost:1337/admin`, MCP at `localhost:1337/mcp`) |
| `npm run strapi:seed` | Create or update the demo content in Strapi (idempotent) |

## Project structure

```
├── public/
│   ├── cms/                 # demo CMS images (also uploaded to Strapi by the seed script)
│   ├── images/  videos/     # theme images and the hero video
│   └── js/                  # webflow.js runtime, site.js, vendor/ (jQuery, GSAP, Lenis)
├── src/
│   ├── components/
│   │   ├── global/          # Header, Footer, SEO, buttons, icons, forms, CollectionList
│   │   ├── cards/           # BlogCard, ServiceCard
│   │   └── sections/        # page sections (home/, about/, blog/, service/, …) + shared sections
│   ├── config/              # config.json (site, contact, social, CTA) and menu.json (navigation)
│   ├── data/                # demo content: blogs, services, FAQ, testimonials
│   ├── layouts/BaseLayout.astro
│   ├── lib/cms.ts           # Strapi client + local fallback, typed Blog/Service models
│   ├── pages/               # routes (blog/[slug], service/[slug], …)
│   ├── scripts/forms.ts     # newsletter + contact form submission
│   └── styles/              # global CSS (+ custom.css for your overrides)
├── strapi/                  # Strapi 5 project: content types, seed script, MCP config
└── .agents/skills/          # AI agent guide for this theme (SKILL.md + references)
```

## Customization

- Site name, logo, contact details, social links, CTA, newsletter texts: `src/config/config.json`
- Header and footer menus: `src/config/menu.json`
- FAQ and testimonials: `src/data/faq.json`, `src/data/testimonials.json`
- Blog posts and services: Strapi admin (or `src/data/*.json` without Strapi)
- Colors, typography, spacing: CSS custom properties at the top of `src/styles/atraen-astro-theme.webflow.css`

The full guide is in **[THEME-CUSTOMIZATION.md](./THEME-CUSTOMIZATION.md)**. AI coding agents can use
[`.agents/skills/astro-template-guidance/SKILL.md`](./.agents/skills/astro-template-guidance/SKILL.md).

## Deployment

Static output, no adapter needed. On Vercel / Netlify set the build command `npm run build`, output `dist`, and the
environment variables from `.env.example`. If you use Strapi, host it separately (Strapi Cloud, Railway, Render, a VPS),
point `STRAPI_URL` at it and add a Strapi webhook (entry publish/update) → your host's deploy hook, so content changes
trigger a rebuild.

## Credits

- Photography: placeholder images included with the theme for demo purposes. Replace them with your own.
- [GSAP](https://gsap.com) (standard "no charge" license), [Lenis](https://github.com/darkroomengineering/lenis) (MIT),
  [jQuery](https://jquery.com) (MIT), [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) (OFL).

## License

[MIT](./LICENSE)
