/**
 * Seeds the Clavix demo content into Strapi.
 *
 *   npm run seed
 *
 * - Uploads the demo images from seed/uploads (skips files already in the Media Library).
 * - Creates or updates Blog / Service / Team Member entries from seed/data/*.json (idempotent, matched by slug)
 *   and publishes them.
 * - Grants the Public role read access (find / findOne) to the three content types, so the Astro site can
 *   read content with or without an API token.
 *
 * Stop `npm run develop` before running this script (both use the same SQLite database file).
 */
const fs = require('node:fs');
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'seed/data');
const uploadsDir = path.join(root, 'seed/uploads');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  const counts = {};

  /** Upload (or reuse) a demo image; returns the Media Library file id. */
  const mediaCache = new Map();
  async function media(ref) {
    if (!ref?.url) return null;
    const file = path.basename(ref.url);
    if (mediaCache.has(file)) return mediaCache.get(file);
    const name = file;
    const existing = await app.db.query('plugin::upload.file').findOne({ where: { name } });
    if (existing) {
      mediaCache.set(file, existing.id);
      return existing.id;
    }
    const filepath = path.join(uploadsDir, file);
    if (!fs.existsSync(filepath)) throw new Error(`Missing seed image: ${filepath}`);
    const { size } = fs.statSync(filepath);
    const mimetype = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const [uploaded] = await app.plugin('upload').service('upload').upload({
      files: { filepath, originalFilename: name, originalFileName: name, mimetype, size },
      data: { fileInfo: { name, alternativeText: ref.alt || '', caption: '' } },
    });
    mediaCache.set(file, uploaded.id);
    return uploaded.id;
  }

  async function upsert(uid, items, map) {
    let created = 0;
    let updated = 0;
    for (const item of items) {
      const data = await map(item);
      const existing = await app.documents(uid).findFirst({ filters: { slug: item.slug }, status: 'draft' });
      if (existing) {
        await app.documents(uid).update({ documentId: existing.documentId, data, status: 'published' });
        updated++;
      } else {
        await app.documents(uid).create({ data, status: 'published' });
        created++;
      }
    }
    counts[uid] = { source: items.length, created, updated, published: await app.documents(uid).count({ status: 'published' }) };
  }

  await upsert('api::blog.blog', readJson('blogs.json'), async (b) => ({
    title: b.title,
    slug: b.slug,
    order: b.order,
    summary: b.summary,
    readTime: b.readTime,
    date: b.date,
    category: b.category,
    author: b.author,
    mainImage: await media(b.mainImage),
    bannerImage: await media(b.bannerImage),
    detailsOne: b.detailsOne,
    detailsTwo: b.detailsTwo,
    detailsThree: b.detailsThree,
  }));

  await upsert('api::service.service', readJson('services.json'), async (s) => ({
    title: s.title,
    slug: s.slug,
    order: s.order,
    number: s.number,
    summary: s.summary,
    mainImage: await media(s.mainImage),
    thumbnailImage: await media(s.thumbnailImage),
    duration: s.duration,
    industry: s.industry,
    client: s.client,
    detailsOne: s.detailsOne,
    detailsTwo: s.detailsTwo,
    detailsThree: s.detailsThree,
    detailsFour: s.detailsFour,
    gallery: (await Promise.all((s.gallery || []).map(media))).filter(Boolean),
    overviewOne: s.overviewOne,
    overviewTwo: s.overviewTwo,
    overviewThree: s.overviewThree,
    overviewFour: s.overviewFour,
  }));

  await upsert('api::team-member.team-member', readJson('team.json'), async (t) => ({
    name: t.name,
    slug: t.slug,
    order: t.order,
    position: t.position,
    image: await media(t.image),
    summary: t.summary,
    details: t.details,
    experience: t.experience,
    languages: t.languages,
    phone: t.phone,
    email: t.email,
  }));

  // Public read access
  const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  const actions = ['api::blog.blog', 'api::service.service', 'api::team-member.team-member'].flatMap((uid) => [
    `${uid}.find`,
    `${uid}.findOne`,
  ]);
  for (const action of actions) {
    const has = await app.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: role.id } });
    if (!has) await app.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
  }

  console.table(counts);
  console.log(`Media files in library: ${await app.db.query('plugin::upload.file').count()}`);
  await app.destroy();
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
