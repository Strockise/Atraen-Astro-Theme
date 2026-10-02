/** App-level content types (same shape whether data comes from Strapi or the bundled demo JSON). */
export interface Media {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Responsive srcset (Strapi image formats), when available. */
  srcset?: string;
}

export interface Blog {
  order: number;
  title: string;
  slug: string;
  summary: string;
  readTime: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  category: string;
  author: string;
  /** Card thumbnail (Webflow "Blog Main Image") */
  mainImage: Media | null;
  /** Large image (Webflow "Blog Banner Image") */
  bannerImage: Media | null;
  /** Markdown */
  detailsOne: string;
  detailsTwo: string;
  detailsThree: string;
}

export interface Service {
  order: number;
  title: string;
  slug: string;
  number: string;
  summary: string;
  mainImage: Media | null;
  thumbnailImage: Media | null;
  duration: string;
  industry: string;
  client: string;
  detailsOne: string;
  detailsTwo: string;
  detailsThree: string;
  detailsFour: string;
  gallery: Media[];
  overviewOne: string;
  overviewTwo: string;
  overviewThree: string;
  overviewFour: string;
}

export interface TeamMember {
  order: number;
  name: string;
  slug: string;
  position: string;
  image: Media | null;
  summary: string;
  /** Markdown */
  details: string;
  experience: string;
  languages: string;
  phone: string;
  email: string;
}
