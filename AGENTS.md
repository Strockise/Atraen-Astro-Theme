# Atraen Astro theme: agent guide

Before changing anything, read `.agents/skills/astro-template-guidance/SKILL.md` and the reference file it routes
you to. Key rules:

- Keep the original class names and every `data-wf-*`, `data-w-*`, `top-delay-*`, `delay-02`,
  `scroll="scroll interaction"` attribute and `w-node-*` id. The layout CSS and the Webflow interaction runtime
  depend on them.
- Every page passes its Webflow page id (`wfPage`) to `BaseLayout`. Don't remove it.
- Content: `src/lib/cms.ts` (Strapi when `STRAPI_URL` is set, otherwise `src/data/*.json`). Site settings:
  `src/config/config.json`, navigation: `src/config/menu.json`.
- New CSS goes in `src/styles/custom.css`. Don't scope styles for existing classes.
- No View Transitions (the interaction runtime doesn't re-initialise on client navigation).

## Commands
`npm run dev` · `npm run build` · `npm run preview` · `npm run strapi:dev` · `npm run strapi:seed`

## Documentation
Astro: https://docs.astro.build · Strapi: https://docs.strapi.io · Strapi MCP: https://docs.strapi.io/cms/features/strapi-mcp-server
