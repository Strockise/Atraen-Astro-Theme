/**
 * Content source for the theme (server-only: import it from .astro frontmatter, never from client scripts).
 *
 * - STRAPI_URL set   → content is fetched from Strapi 5 at build time (REST API).
 * - STRAPI_URL empty → the bundled demo content in src/data/*.json is used, so the theme builds anywhere.
 *
 * Both sources are normalised into the `Blog` / `Service` shapes below, so components never care where
 * the data came from.
 */
import { marked } from 'marked';
import localBlogs from '../data/blogs.json';
import localServices from '../data/services.json';

export interface Media {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Blog {
  title: string;
  slug: string;
  order: number;
  readTime: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  mainImage: Media | null;
  bannerImage: Media | null;
  /** HTML, rendered inside `.w-richtext` */
  content: string;
  seoDescription?: string;
}

export interface Service {
  title: string;
  slug: string;
  order: number;
  number: string;
  summary: string;
  thumbnail: Media | null;
  banner: Media | null;
  heroSummary: string;
  overview: string;
  description: string;
  /** Four "Who this service is designed for" cards, HTML (h3 + p) */
  audience: string[];
  gallery: Media[];
}

const STRAPI_URL = (import.meta.env.STRAPI_URL ?? '').replace(/\/$/, '');
const STRAPI_TOKEN = import.meta.env.STRAPI_API_TOKEN;

export const cmsSource = STRAPI_URL ? 'strapi' : 'local';

/* ----------------------------------------------------------------------------------------------
 * Strapi
 * -------------------------------------------------------------------------------------------- */

interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

async function strapiGetAll<T>(collection: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const url = new URL(`${STRAPI_URL}/api/${collection}`);
    url.searchParams.set('populate', '*');
    url.searchParams.set('sort', 'order:asc');
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    let res: Response;
    try {
      res = await fetch(url, { headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {} });
    } catch (err) {
      throw new Error(
        `Could not reach Strapi at ${STRAPI_URL}. Start it with "npm run strapi:dev", or clear STRAPI_URL in .env to build from src/data/. (${(err as Error).message})`,
      );
    }
    if (!res.ok) throw new Error(`Strapi ${res.status} on ${url.pathname}: ${await res.text()}`);
    const json = (await res.json()) as { data: T[]; meta: { pagination: { pageCount: number } } };
    out.push(...json.data);
    pageCount = json.meta.pagination.pageCount;
  } while (++page <= pageCount);
  return out;
}

function strapiMedia(m: StrapiMedia | null | undefined, fallbackAlt: string): Media | null {
  if (!m?.url) return null;
  return {
    url: m.url.startsWith('http') ? m.url : `${STRAPI_URL}${m.url}`,
    alt: m.alternativeText || fallbackAlt,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  };
}

/** Strapi "Rich text (Markdown)" fields: Markdown is converted, seeded HTML passes through unchanged. */
const toHtml = (value: string | null | undefined) => (value ? (marked.parse(value, { async: false }) as string) : '');

/* ----------------------------------------------------------------------------------------------
 * Public API
 * -------------------------------------------------------------------------------------------- */

let blogsCache: Promise<Blog[]> | undefined;
let servicesCache: Promise<Service[]> | undefined;

/** All blog posts, in display order. */
export function getBlogs(): Promise<Blog[]> {
  blogsCache ??= (async () => {
    if (cmsSource === 'local') {
      return [...(localBlogs as Blog[])].sort((a, b) => a.order - b.order);
    }
    const rows = await strapiGetAll<Record<string, any>>('blogs');
    return rows.map((r) => ({
      title: r.title,
      slug: r.slug,
      order: r.order ?? 0,
      readTime: r.readTime ?? '',
      date: r.date,
      mainImage: strapiMedia(r.mainImage, 'decisions-card-image'),
      bannerImage: strapiMedia(r.bannerImage, 'blog-details-image'),
      content: toHtml(r.content),
      seoDescription: r.seoDescription ?? undefined,
    }));
  })();
  return blogsCache;
}

/** All services, in display order. */
export function getServices(): Promise<Service[]> {
  servicesCache ??= (async () => {
    if (cmsSource === 'local') {
      return (localServices as Array<Record<string, any>>)
        .map((s) => ({
          ...s,
          audience: [s.audienceOne, s.audienceTwo, s.audienceThree, s.audienceFour],
        }) as Service)
        .sort((a, b) => a.order - b.order);
    }
    const rows = await strapiGetAll<Record<string, any>>('services');
    return rows.map((r) => ({
      title: r.title,
      slug: r.slug,
      order: r.order ?? 0,
      number: r.number ?? '',
      summary: r.summary ?? '',
      thumbnail: strapiMedia(r.thumbnail, 'service-tab-image'),
      banner: strapiMedia(r.banner, 'service-hero-image'),
      heroSummary: r.heroSummary ?? '',
      overview: r.overview ?? '',
      description: r.description ?? '',
      audience: [r.audienceOne, r.audienceTwo, r.audienceThree, r.audienceFour].map(toHtml),
      gallery: ((r.gallery ?? []) as StrapiMedia[])
        .map((m) => strapiMedia(m, 'service-image'))
        .filter((m): m is Media => m !== null),
    }));
  })();
  return servicesCache;
}

/** "2025-10-25" → "October 25, 2025" (the Webflow date format used by the template). */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
