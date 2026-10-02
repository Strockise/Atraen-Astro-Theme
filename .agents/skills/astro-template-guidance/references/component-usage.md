# Component usage

All components declare typed `Props`. Import paths are relative (no aliases).

## Global (`src/components/global/`)
| Component | Props | Notes |
|---|---|---|
| `Header` | `variant?: 'static' \| 'absolute'` | `absolute` = transparent header over a dark hero (home, services). Menu from `menu.json`, CTA from `config.json` |
| `Footer` | `variant?: 1 \| 2`, `wfPage: string` | `2` = contact page style. Includes `NewsletterForm` |
| `SEO` | `title`, `description?`, `image?`, `type?`, `noindex?` | Used by `BaseLayout`; pass these props to `BaseLayout` instead |
| `PrimaryButton` | `href`, `text`, `current?` | Orange button with arrow hover. Keep its data-wf attributes |
| `SecondaryButton` | `href`, `text`, `current?` | White button with arrow hover |
| `NewsletterForm` | `wfPage` | Footer form; texts in `config.json → newsletter` |
| `CollectionList` | `items`, `wrapperClass`, `listClass`, `itemClass`, `listAttrs?` | Webflow list wrapper; render items with a slot function |
| `SliderControls` | none | Arrows + dots for orange sliders; place inside `.w-slider` after the mask |
| `VideoLightboxData` | none | Lightbox JSON from `config.json → video`; place inside `a.w-lightbox` |
| `ArrowIcon`, `QuoteIcon`, `SocialIcon` (`name`) | | Inline SVG icons |

`CollectionList` example:
```astro
<CollectionList items={posts} wrapperClass="blog-collection-list-wrapper" listClass="blog-collection-list" itemClass="blog-collection-item">
  {(post: Blog) => <BlogCard post={post} />}
</CollectionList>
```

## Cards (`src/components/cards/`)
| Component | Props |
|---|---|
| `BlogCard` | `post: Blog`, `layout?: 'grid' \| 'slider'` (field order), `titleLabel?` |
| `ServiceCard` | `service: Service`, `layout?: 'tab' \| 'card'`, `scrollReveal?` |

## Shared sections (`src/components/sections/`)
| Component | Props |
|---|---|
| `FaqSection` | `variant?: 'base' \| 'variant-2'`, `title?`, `summary?`, `items?` (default `src/data/faq.json`) |
| `TestimonialSection` | `title?`, `summary?`, `items?` (default `src/data/testimonials.json`) |
| `BlogSliderSection` | `title`, `posts: Blog[]` (first 3 used), `buttonText?`, `buttonHref?` |

## CMS-bound page sections
- `home/Service` (`services`), `service/Service` (`services`), `blog/Blog` (`posts`, `title?`),
  `blog-detail/BlogDetails` (`post`), `service-detail/ServiceHero|ServiceDetails|ServiceDesign` (`service`).
- All other sections are static and take no props. Edit their text directly.
