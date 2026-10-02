/** Normalises "/about/", "/about" and "/about/index.html" to "/about". */
export function normalizePath(path: string): string {
  const p = path.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/** Webflow marks a link `w--current` when it points at exactly the current page. */
export function isCurrent(href: string, pathname: string): boolean {
  if (!href.startsWith('/')) return false;
  return normalizePath(href) === normalizePath(pathname);
}
