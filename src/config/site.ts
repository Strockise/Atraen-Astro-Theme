/**
 * Site-wide settings. Edit these values to rebrand the theme.
 * All defaults are generic placeholders (Astro Theme Catalogue rules: example.com,
 * root-domain social links, fictional 555 numbers).
 */
export const site = {
  name: 'Clavix',
  /** Used as the suffix of page titles that don't set their own full title. */
  titleSuffix: 'Business Consulting Astro Theme',
  description:
    'Clavix is a premium Astro theme for consulting, corporate, and business websites with modern design, CMS, and responsive layouts.',
  url: 'https://example.com',
  /** Default Open Graph image (relative to /public). */
  ogImage: '/images/og-image.webp',
  email: 'contact@example.com',
  phone: '+(1) 555 010 012',
  phoneHref: 'tel:+1555010012',
  address: '1250 Example Avenue, Suite 400, Anytown, ST 00000',
  /** "View on map" button target on the contact pages. */
  mapUrl: 'https://maps.google.com',
  copyright: 'ⓒ2026 clavix | all rights reserved',
  /** Theme author credit shown in the footer. */
  credit: { name: 'strockise', url: 'https://www.strockise.com/' },
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
  },
  /** Contact / newsletter form endpoint (Formspree, Web3Forms, Basin, …). Set PUBLIC_FORM_ENDPOINT in .env. */
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
};

export type Site = typeof site;
