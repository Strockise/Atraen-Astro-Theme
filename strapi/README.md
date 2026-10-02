# Atraen CMS (Strapi 5)

Headless CMS for the Atraen Astro theme. It provides two collection types, **Blog** and **Service**, plus a seed
script with the demo content and the built-in **Strapi MCP server**.

```bash
npm install
cp .env.example .env     # replace every "tobemodified" value
npm run seed             # demo content: 9 blog posts, 6 services, images from ../public/cms
npm run develop          # admin: http://localhost:1337/admin · API: /api · MCP: /mcp
```

| Path | Purpose |
|---|---|
| `src/api/blog`, `src/api/service` | Content types (schema.json) + default controllers, routes, services |
| `src/index.ts` | Bootstrap: gives the Public role read access to blogs and services |
| `scripts/seed.js` | Idempotent seed (matched by slug): `npm run seed`, `npm run seed:reset` |
| `config/server.ts` | `mcp.enabled` (env `STRAPI_MCP_ENABLED`) |
| `config/database.ts` | SQLite by default (`.tmp/data.db`); Postgres/MySQL via `DATABASE_*` env vars |

The field reference, MCP setup and deployment notes are in [`../THEME-CUSTOMIZATION.md`](../THEME-CUSTOMIZATION.md).
