/**
 * Seeds Strapi with the Atraen demo content.
 *
 *   npm run seed            create or update every entry (idempotent, matched by slug)
 *   npm run seed -- --reset delete the theme's entries first
 *
 * Content: ../src/data/blogs.json and ../src/data/services.json (the same files the Astro app
 * falls back to when STRAPI_URL is not set). Media: ../public/cms/*.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'src', 'data');
const PUBLIC = path.join(ROOT, 'public');
const RESET = process.argv.includes('--reset');

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));

/** Uploads a file from /public once and returns its media id (reuses an existing file with the same name). */
async function uploadMedia(strapi, media, cache) {
  if (!media?.url) return null;
  if (cache.has(media.url)) return cache.get(media.url);

  const filepath = path.join(PUBLIC, media.url);
  const name = path.basename(filepath);
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
  if (existing) {
    cache.set(media.url, existing.id);
    return existing.id;
  }
  if (!fs.existsSync(filepath)) {
    console.warn(`  ! missing media file ${filepath}`);
    return null;
  }

  const ext = path.extname(name).slice(1).toLowerCase();
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: { fileInfo: { name, alternativeText: media.alt ?? '', caption: '' } },
      files: { filepath, originalFilename: name, mimetype: MIME[ext] ?? 'application/octet-stream', size: fs.statSync(filepath).size },
    });
  cache.set(media.url, file.id);
  return file.id;
}

async function upsert(strapi, uid, entries, mapEntry) {
  const docs = strapi.documents(uid);
  if (RESET) {
    for (const doc of await docs.findMany({ status: 'draft', limit: 1000 })) {
      await docs.delete({ documentId: doc.documentId });
    }
  }
  let created = 0;
  let updated = 0;
  for (const entry of entries) {
    const data = await mapEntry(entry);
    const [found] = await docs.findMany({ filters: { slug: entry.slug }, status: 'draft', limit: 1 });
    if (found) {
      await docs.update({ documentId: found.documentId, data, status: 'published' });
      updated++;
    } else {
      await docs.create({ data, status: 'published' });
      created++;
    }
  }
  const total = await docs.count({ status: 'published' });
  console.log(`  ${uid}: ${created} created, ${updated} updated, ${total} published`);
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  const cache = new Map();

  console.log('Seeding Atraen demo content…');
  await upsert(app, 'api::blog.blog', readJson('blogs.json'), async (b) => ({
    title: b.title,
    slug: b.slug,
    order: b.order,
    readTime: b.readTime,
    date: b.date,
    content: b.content,
    mainImage: await uploadMedia(app, b.mainImage, cache),
    bannerImage: await uploadMedia(app, b.bannerImage, cache),
  }));

  await upsert(app, 'api::service.service', readJson('services.json'), async (s) => ({
    title: s.title,
    slug: s.slug,
    order: s.order,
    number: s.number,
    summary: s.summary,
    heroSummary: s.heroSummary,
    overview: s.overview,
    description: s.description,
    audienceOne: s.audienceOne,
    audienceTwo: s.audienceTwo,
    audienceThree: s.audienceThree,
    audienceFour: s.audienceFour,
    thumbnail: await uploadMedia(app, s.thumbnail, cache),
    banner: await uploadMedia(app, s.banner, cache),
    gallery: (await Promise.all((s.gallery ?? []).map((m) => uploadMedia(app, m, cache)))).filter(Boolean),
  }));

  await app.destroy();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
