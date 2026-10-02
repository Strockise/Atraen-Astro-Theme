import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Built-in Strapi MCP server (Strapi >= 5.47). Endpoint: http://localhost:1337/mcp
  // Authenticate with an Admin token (Settings → Admin tokens). See ../THEME-CUSTOMIZATION.md → "Strapi MCP".
  mcp: {
    enabled: env.bool('STRAPI_MCP_ENABLED', true),
  },
});

export default config;
