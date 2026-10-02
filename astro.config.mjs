// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  vite: {
    // The Strapi project lives in ./strapi with its own dependencies; keep it out of Vite's dep scan.
    optimizeDeps: { entries: ['src/**/*.{astro,ts}'] },
  },
});
