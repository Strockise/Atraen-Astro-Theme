# Script usage (npm)

Run from the project root (Node 22.12+).

| Command | What it does |
|---|---|
| `npm install` | Install the Astro site |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static build to `dist/` (fetches Strapi if `STRAPI_URL` is set) |
| `npm run preview` | Serve `dist/` locally |
| `npm run strapi:install` | `npm install` inside `strapi/` |
| `npm run strapi:dev` | Strapi in development mode: admin `/admin`, API `/api`, MCP `/mcp` (port 1337, `PORT` env to change) |
| `npm run strapi:seed` | Seed/update demo content in Strapi (Strapi must not be mid-migration; it can be running) |

Inside `strapi/`: `npm run develop`, `npm run start` (production), `npm run build` (admin build),
`npm run seed`, `npm run seed:reset`.

Troubleshooting:
- `Could not reach Strapi at …` during build: start Strapi or clear `STRAPI_URL`.
- `better_sqlite3.node` not found: install scripts were blocked. Run
  `npm rebuild better-sqlite3 --prefix strapi` (the package is already allowed in `strapi/package.json → allowScripts`).
- Port 1337 busy: `PORT=1338 npm run strapi:dev` and set `STRAPI_URL=http://localhost:1338`.
