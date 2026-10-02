# Clavix CMS (Strapi v5)

Headless CMS for the Clavix Astro theme. It holds the three collections the theme renders:

| Content type | API endpoint | Used on |
|---|---|---|
| **Blog** | `/api/blogs` | Home pages, `/blog`, `/blogs/[slug]` |
| **Service** | `/api/services` | Home pages, `/services`, `/services/[slug]` |
| **Team Member** | `/api/team-members` | Home and About pages, `/team`, `/team/[slug]` |

Every collection has an `order` field: lists on the site are sorted by it (1 = first).
Rich text fields use Strapi's Markdown editor and are rendered with the theme's original rich-text styles.

## Setup

```bash
npm install
cp .env.example .env
```

Replace every `tobemodified` value in `.env` with your own random secrets, for example:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

(`APP_KEYS` takes four comma-separated values.)

## Import the demo content

```bash
npm run seed
```

This uploads the demo images from `seed/uploads/`, creates and publishes the entries from `seed/data/*.json`
(safe to run again: entries are matched by slug), and gives the Public role read access to the three collections.
Stop `npm run develop` before seeding, since both use the same SQLite file.

## Run

```bash
npm run develop   # http://localhost:1337/admin (create your admin account on first visit)
```

Then point the theme at it in the theme's `.env`:

```bash
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=   # optional Read-only token (Settings > API Tokens)
```

## Strapi MCP server (AI content management)

The [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) is enabled in `config/server.ts`
(`mcp.enabled`, toggle with `MCP_ENABLED`). It exposes list / get / create / update / delete / publish tools for
every content type at `/mcp`, so an AI agent can manage the site content for you.

1. In the admin panel, create an **Admin token** (Settings > Admin tokens) with the permissions the agent should have.
2. Connect your agent, for example Claude Code:

   ```bash
   claude mcp add strapi-mcp --transport http http://localhost:1337/mcp \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

Note: the MCP server can't create content types or upload new files; use the admin panel (or `npm run seed`) for those.

## Deploy

Any Node host that runs Strapi works (Strapi Cloud, Railway, Render, a VPS). For production, use PostgreSQL or
MySQL (`DATABASE_CLIENT` and the `DATABASE_*` variables in `.env`) and a cloud upload provider for media.
Because the Astro site is static, add a webhook (Settings > Webhooks, events: entry publish / unpublish / update)
that calls your hosting provider's deploy hook so the site rebuilds when content changes.
