# Adding new pages, routes, and sections

## New static page
1. Create `src/pages/<name>.astro` (route `/<name>`).
2. Use this skeleton:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/global/Header.astro';
import Footer from '../components/global/Footer.astro';
import config from '../config/config.json';

// Reuse the Webflow page id whose animations you want. Ids (prefix 6abe84b3182afe641eb8e):
// 343 home, 346 about, 349 services, 34a service detail, 34c blog post, 34d blog, 34e contact, 34f style guide, 351 404
const wfPage = '6abe84b3182afe641eb8e346';
---
<BaseLayout title={`Coaching - ${config.site.titleSuffix}`} description="…" wfPage={wfPage}>
  <div class="page-wrapper">
    <Header />                 <!-- variant="absolute" only over a dark full-bleed hero -->
    <div class="main-wrapper">
      <!-- sections -->
    </div>
    <Footer wfPage={wfPage} />  <!-- variant={2} = contact-page style -->
  </div>
</BaseLayout>
```
3. Add the link to `src/config/menu.json` (`main` and/or `footer.pages`).

## New section
- Create `src/components/sections/<page>/<Name>.astro`, starting from an existing section with a similar layout.
- Keep the outer structure: `<section class="section-…">` > `.section-gap` > `.w-layout-blockcontainer.container-main.w-container`.
- Use `PrimaryButton` / `SecondaryButton` for buttons (they carry the hover animation).
- For the standard reveal animation, add `top-delay-0=""` or `top-delay-2=""` to a block, or `delay-02=""` to a
  parent whose children should stagger in.
- Typography and button styles are documented visually at `/style-guide`.

## New CMS collection
1. Strapi: add `strapi/src/api/<type>/` (schema.json + controller/route/service, copy the `blog` folder), add the uid
   to `PUBLIC_READ` in `strapi/src/index.ts`, restart Strapi.
2. Astro: add a type + `get<Type>()` in `src/lib/cms.ts` (copy `getBlogs`), plus a JSON fallback in `src/data/`.
3. Listing page: render with `CollectionList`. Detail page: `src/pages/<route>/[slug].astro` with `getStaticPaths`.

## Dynamic route pattern
```astro
export async function getStaticPaths() {
  const items = await getServices();
  return items.map((service) => ({ params: { slug: service.slug }, props: { service } }));
}
```
