import type { Core } from '@strapi/strapi';

// Content types the Astro theme reads at build time.
const PUBLIC_READ = ['api::blog.blog', 'api::service.service'];

export default {
  register() {},

  /**
   * Grants the Public role read access (find / findOne) to the theme's content types,
   * so `npm run build` in the Astro app works without an API token.
   * Remove this if you prefer to use a read-only API token (STRAPI_API_TOKEN) instead.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!role) return;

    for (const uid of PUBLIC_READ) {
      for (const action of ['find', 'findOne']) {
        const name = `${uid}.${action}`;
        const exists = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action: name, role: role.id } });
        if (!exists) {
          await strapi.db
            .query('plugin::users-permissions.permission')
            .create({ data: { action: name, role: role.id } });
        }
      }
    }
  },
};
