# Content management

## Where content lives
| Content | Source |
|---|---|
| Blog posts, services | Strapi (`STRAPI_URL` set) or `src/data/blogs.json` / `src/data/services.json` |
| FAQ | `src/data/faq.json` |
| Testimonials | `src/data/testimonials.json` |
| Page copy (heroes, about, process…) | the section components in `src/components/sections/<page>/` |

## Strapi content types
- `api::blog.blog`: title, slug (uid), order, readTime, date, mainImage, bannerImage, content (Markdown/HTML), seoDescription
- `api::service.service`: title, slug, order, number, summary, thumbnail, banner, heroSummary, overview, description,
  audienceOne…audienceFour (rich text, h3 + p each), gallery (multiple media)

Rules:
- Lists sort by `order` ascending. The home page shows services 1–4 (one per tab) and posts 1–3.
- Only published entries appear. After changing content, rebuild (`npm run build`, or the deploy hook in production).
- Schemas live in `strapi/src/api/<type>/content-types/<type>/schema.json`. If you add or rename a field, update
  the mapping in `src/lib/cms.ts` (`getBlogs` / `getServices`) and the fallback JSON.

## Seeding
`npm run strapi:seed` runs `strapi/scripts/seed.js`. It uploads images from `public/cms/` and creates or updates
entries from `src/data/*.json`, matched by slug, published. `npm run seed:reset --prefix strapi` re-creates them.

## Without Strapi
Edit `src/data/blogs.json` / `services.json`. Media objects are `{ "url": "/cms/file.webp", "alt": "…" }`, and
`date` is `YYYY-MM-DD`. `content` and the `audience*` fields are HTML.

## Strapi MCP server (AI agents)
Enabled in `strapi/config/server.ts` (`mcp.enabled`, env `STRAPI_MCP_ENABLED`). Endpoint `http://localhost:1337/mcp`,
authenticated with a Strapi **Admin token** (Settings → Admin tokens). The token's permissions decide which tools exist.
Connect Claude Code:
```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer <ADMIN_TOKEN>"
```
or copy `.mcp.example.json` → `.mcp.json` and export `STRAPI_MCP_TOKEN`.
Tools per collection: list, get, create, update, delete, publish, unpublish, discard_draft, plus media-library tools.
The MCP server can't upload new files or change schemas, so do those through the admin or in code.
When creating entries via MCP, fill every field the templates use (see the lists above) and set `order`.
