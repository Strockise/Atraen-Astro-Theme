/**
 * Content source for the theme (server/build-time only: never import this from a client <script>).
 *
 * - If STRAPI_URL is set, content is fetched from Strapi v5 (REST API).
 * - Otherwise the bundled demo content in src/data/*.json is used, so the theme always builds.
 *
 * Lists are sorted by the `order` field (1 = first), matching the original Webflow template.
 */
import { marked } from 'marked';
import type { Blog, Media, Service, TeamMember } from './types';
import demoBlogs from '../data/blogs.json';
import demoServices from '../data/services.json';
import demoTeam from '../data/team.json';

const STRAPI_URL = (import.meta.env.STRAPI_URL ?? '').replace(/\/$/, '');
const STRAPI_TOKEN = import.meta.env.STRAPI_API_TOKEN ?? '';
export const usingStrapi = STRAPI_URL !== '';

/* ------------------------------------------------------------------ Strapi */
type Query = Record<string, string | number>;

async function strapi<T>(path: string, query: Query = {}): Promise<T> {
  const url = new URL(`/api/${path}`, STRAPI_URL);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {} });
  if (!res.ok) {
    throw new Error(
      `[cms] Strapi responded ${res.status} for ${url.pathname}. Check STRAPI_URL / STRAPI_API_TOKEN and the token permissions.\n${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

async function getAll<T>(collection: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const r = await strapi<{ data: T[]; meta: { pagination: { pageCount: number } } }>(collection, {
      populate: '*',
      sort: 'order:asc',
      'pagination[page]': page,
      'pagination[pageSize]': 100,
    });
    out.push(...r.data);
    pageCount = r.meta.pagination.pageCount;
  } while (++page <= pageCount);
  return out;
}

interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number }> | null;
}

const abs = (u: string) => (u.startsWith('http') ? u : `${STRAPI_URL}${u}`);

function media(m: StrapiMedia | null | undefined, fallbackAlt: string): Media | null {
  if (!m?.url) return null;
  const formats = Object.values(m.formats ?? {}).sort((a, b) => a.width - b.width);
  const srcset = formats.length
    ? [...formats.map((f) => `${abs(f.url)} ${f.width}w`), m.width ? `${abs(m.url)} ${m.width}w` : '']
        .filter(Boolean)
        .join(', ')
    : undefined;
  return { url: abs(m.url), alt: m.alternativeText || fallbackAlt, width: m.width, height: m.height, srcset };
}

type Raw = Record<string, any>;
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

function toBlog(r: Raw): Blog {
  return {
    order: r.order ?? 0,
    title: str(r.title),
    slug: str(r.slug),
    summary: str(r.summary),
    readTime: str(r.readTime),
    date: str(r.date),
    category: str(r.category),
    author: str(r.author),
    mainImage: media(r.mainImage, 'blog-image'),
    bannerImage: media(r.bannerImage, 'blog-image'),
    detailsOne: str(r.detailsOne),
    detailsTwo: str(r.detailsTwo),
    detailsThree: str(r.detailsThree),
  };
}

function toService(r: Raw): Service {
  return {
    order: r.order ?? 0,
    title: str(r.title),
    slug: str(r.slug),
    number: str(r.number),
    summary: str(r.summary),
    mainImage: media(r.mainImage, 'service-image'),
    thumbnailImage: media(r.thumbnailImage, 'service-image'),
    duration: str(r.duration),
    industry: str(r.industry),
    client: str(r.client),
    detailsOne: str(r.detailsOne),
    detailsTwo: str(r.detailsTwo),
    detailsThree: str(r.detailsThree),
    detailsFour: str(r.detailsFour),
    gallery: ((r.gallery ?? []) as StrapiMedia[])
      .map((m) => media(m, 'service-multi-image'))
      .filter((m): m is Media => !!m),
    overviewOne: str(r.overviewOne),
    overviewTwo: str(r.overviewTwo),
    overviewThree: str(r.overviewThree),
    overviewFour: str(r.overviewFour),
  };
}

function toTeam(r: Raw): TeamMember {
  return {
    order: r.order ?? 0,
    name: str(r.name),
    slug: str(r.slug),
    position: str(r.position),
    image: media(r.image, 'team-image'),
    summary: str(r.summary),
    details: str(r.details),
    experience: str(r.experience),
    languages: str(r.languages),
    phone: str(r.phone),
    email: str(r.email),
  };
}

/* ------------------------------------------------------------------ public API */
const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

export const getBlogs = () =>
  once('blogs', async () =>
    (usingStrapi ? (await getAll<Raw>('blogs')).map(toBlog) : (demoBlogs as Blog[]).slice()).sort(byOrder),
  );

export const getServices = () =>
  once('services', async () =>
    (usingStrapi ? (await getAll<Raw>('services')).map(toService) : (demoServices as unknown as Service[]).slice()).sort(
      byOrder,
    ),
  );

export const getTeam = () =>
  once('team', async () =>
    (usingStrapi ? (await getAll<Raw>('team-members')).map(toTeam) : (demoTeam as TeamMember[]).slice()).sort(byOrder),
  );

/** Webflow collection-list style slicing: skip `offset` items, then take `limit`. */
export const take = <T>(items: T[], limit?: number, offset = 0) =>
  items.slice(offset, limit === undefined ? undefined : offset + limit);

/** Render CMS Markdown to HTML (output goes inside .w-richtext so the original rich text styles apply). */
export const richText = (markdown: string) =>
  markdown ? (marked.parse(markdown, { async: false }) as string).replace(/<(ul|ol)>/g, '<$1 role="list">') : '';

/** "June 15, 2026": the Webflow date format used in the template. */
export const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';
