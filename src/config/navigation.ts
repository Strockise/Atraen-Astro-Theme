/**
 * Header and footer menus. Edit these arrays to change the site navigation.
 * `href` values are site-relative routes.
 */
export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

/** Example CMS detail pages linked from the menus (first entry of each collection). */
export const cmsExamples = {
  blog: '/blogs/how-to-build-a-scalable-business-strategy-in-2026',
  service: '/services/business-strategy-consulting',
  team: '/team/mike-mitchell-2',
};

export const mainNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-us/about-v1' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
];

export const pagesDropdown: NavGroup[] = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home V1', href: '/' },
      { label: 'Home V2', href: '/home/home-v2' },
      { label: 'Home V3', href: '/home/home-v3' },
      { label: 'About V1', href: '/about-us/about-v1' },
      { label: 'About V2', href: '/about-us/about-v2' },
      { label: 'About V3', href: '/about-us/about-v3' },
      { label: 'Blog', href: '/blog' },
      { label: 'Team', href: '/team' },
    ],
  },
  {
    title: 'Others Pages',
    links: [
      { label: 'Contact V1', href: '/contact/contact-v1' },
      { label: 'Contact V2', href: '/contact/contact-v2' },
      { label: 'Contact V3', href: '/contact/contact-v3' },
      { label: 'Service', href: '/services' },
      { label: 'Team Details', href: cmsExamples.team },
      { label: 'Service Details', href: cmsExamples.service },
      { label: 'Blog Details', href: cmsExamples.blog },
    ],
  },
  {
    title: 'Utility Page',
    links: [
      { label: 'Style Guide', href: '/style-guide' },
      { label: 'Not Found', href: '/404' },
    ],
  },
];

export const headerCta: NavLink = { label: 'Free Consultation', href: '/contact/contact-v1' };
export const headerMainCta: NavLink = { label: 'Get Started', href: '/contact/contact-v1' };

/** Footer "Main Pages" block: each inner array is one column. */
export const footerMainPages: NavLink[][] = [
  [
    { label: 'Home V1', href: '/' },
    { label: 'Home V2', href: '/home/home-v2' },
    { label: 'Home V3.', href: '/home/home-v3' },
  ],
  [
    { label: 'About V1', href: '/about-us/about-v1' },
    { label: 'About V2', href: '/about-us/about-v2' },
    { label: 'About V3', href: '/about-us/about-v3' },
  ],
  [
    { label: 'Contact V1', href: '/contact/contact-v1' },
    { label: 'Contact V2', href: '/contact/contact-v2' },
    { label: 'Contact V3', href: '/contact/contact-v3' },
  ],
  [
    { label: 'Blog', href: '/blog' },
    { label: 'Services', href: '/services' },
    { label: 'Team', href: '/team' },
  ],
];

export const footerCmsPages: NavLink[] = [
  { label: 'Blog Details', href: cmsExamples.blog },
  { label: 'Service Details', href: cmsExamples.service },
  { label: 'Team Details', href: cmsExamples.team },
];

export const footerUtilityPages: NavLink[] = [
  { label: 'Style Guide', href: '/style-guide' },
  { label: 'Not Found', href: '/404' },
];

export const footerCta: NavLink = { label: 'Let’s Build Your Next Growth Story Together', href: '/contact/contact-v1' };

/** Words in the footer marquee. */
export const footerMarquee = ['STRATEGIES', 'STRATEGIES', 'STRATEGIES', 'STRATEGIES'];
