# Styling and theming

## CSS files (all global, imported once in `BaseLayout.astro`, in this order)
1. `src/styles/normalize.css`: reset (don't edit)
2. `src/styles/webflow.css`: base component styles (don't edit)
3. `src/styles/atraen-astro-theme.webflow.css`: theme styles + design tokens
4. `src/styles/custom.css`: **put your overrides here**
`src/styles/ix3-prehide.css` is inlined in `<head>`. It hides animated elements until the runtime starts. Don't edit it.

Don't use scoped `<style>` blocks for existing classes (scoping changes specificity). Use `custom.css` or
`<style is:global>`.

## Design tokens (`:root` in atraen-astro-theme.webflow.css)
- Colors: `--_colors---main-color--primary-color` (#ff8f00), `--_colors---main-color--black-color`,
  `--_colors---main-color--white-color`, `--_colors---nutral-color--200…800`
- Type: `--_typography---font-family--body-font-family`, `--_typography---h1--font-size` … `h6`, `--_typography---d1--font-size`, body sizes
- Layout: `--container-sizes--container-main` (67rem), `--spacers--*`, `--radius-sizes--*`
Override in `custom.css`:
```css
:root { --_colors---main-color--primary-color: #2f6bff; }
```
Some colors are also written literally in rules. Search the CSS for the hex value when a token change doesn't apply.

## Fonts
Inter Tight via Google Fonts `<link>` in `BaseLayout.astro`. To change it, edit that link and the font-family token.
(91 rules use `"Inter Tight", sans-serif` literally. Replace them as well.)

## Breakpoints (desktop first)
`max-width: 991px` tablet, `767px` mobile landscape, `479px` mobile; `min-width: 1280px / 1440px / 1920px` large.

## Dark mode
The theme has no dark mode. The header has light/dark logo variants for dark heroes only.

## Animations
- Scroll reveal / hover / click animations come from the Webflow IX3 runtime (`public/js/webflow.js` + GSAP).
  They target classes, ids and attributes, so keep them when editing markup.
- Ready-made triggers you can add to new markup: `top-delay-0=""`, `top-delay-2=""`, `top-delay-3=""` (fade up),
  `delay-02=""` (children stagger), class `heading-style-2` (heading reveal), class `_wf-counter` (number count-up).
- Lenis smooth scroll + counters: `public/js/site.js` (desktop only, skipped with reduced motion).
- Tabs, sliders, the mobile menu and the lightbox are Webflow components (`w-tabs`, `w-slider`, `w-nav`,
  `w-lightbox`) configured with `data-*` attributes on the markup (e.g. slider `data-autoplay`, `data-delay`).
