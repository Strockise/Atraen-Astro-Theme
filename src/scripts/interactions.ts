/**
 * Clavix interactions: a 1:1 GSAP rebuild of the Webflow IX3 interactions of the original template
 * (scroll reveals, split-text headings, hover effects, marquees and scroll-scrubbed sticky sections).
 *
 * Timing reference (Webflow IX3 defaults): duration 0.5s, position 0, eases:
 * 'sine.out' (Webflow ease 29), 'power1.inOut' (3), 'none' (0). Unspecified eases use the GSAP default.
 *
 * Page-specific interactions are gated by <body data-page="…"> (set via BaseLayout `page` prop).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const D = 0.5; // IX3 default duration
const SINE = 'sine.out';
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T & HTMLElement>(sel));
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const page = () => document.body.dataset.page ?? '';

type SplitType = 'chars' | 'lines';
function split(el: Element, type: SplitType, mask?: SplitType): Element[] {
  // Chars are always wrapped in words so lines never break mid-word (matches Webflow IX3).
  const s = SplitText.create(el, {
    type: type === 'chars' ? 'words,chars' : type,
    mask,
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
  });
  return type === 'chars' ? s.chars : s.lines;
}

/** Scroll "play once" trigger (IX3: enter=play, leave/enterBack/leaveBack=none). */
function onEnter(trigger: Element, start: string, build: (tl: gsap.core.Timeline) => void) {
  const tl = gsap.timeline({ paused: true });
  build(tl);
  ScrollTrigger.create({ trigger, start, once: true, onEnter: () => tl.play() });
}

/** Scroll-scrubbed timeline. */
function scrub(trigger: Element, start: string, end: string, build: (tl: gsap.core.Timeline) => void) {
  const tl = gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: 0.8 } });
  build(tl);
  return tl;
}

/** Hover: play on mouseenter, reverse on mouseleave. */
function hover(el: Element, build: (tl: gsap.core.Timeline) => void) {
  const tl = gsap.timeline({ paused: true });
  build(tl);
  el.addEventListener('mouseenter', () => tl.play());
  el.addEventListener('mouseleave', () => tl.reverse());
}

const fadeUp = { opacity: 0, y: 80 };
const fadeUpTo = (extra: gsap.TweenVars = {}) => ({ opacity: 1, y: 0, duration: 0.6, ease: SINE, ...extra });

/* ---------------------------------------------------------------- scroll reveals */
function scrollReveals() {
  // [page-scroll-N]: fade up with delay N * 0.2s
  [0, 0.2, 0.4, 0.6].forEach((pos, n) => {
    $$(`[page-scroll-${n}]`).forEach((el) =>
      onEnter(el, 'top 95%', (tl) => tl.fromTo(el, fadeUp, fadeUpTo(), pos)),
    );
  });

  // [scroll="scroll interaction"]: direct children fade up, staggered
  $$('[scroll="scroll interaction"]').forEach((el) => {
    const kids = Array.from(el.children);
    onEnter(el, 'top 80%', (tl) => tl.fromTo(kids, fadeUp, { opacity: 1, y: 0, duration: D, ease: SINE, stagger: { each: 0.3 } }));
  });

  // [title-scroll]: masked characters rise in
  $$('[title-scroll]').forEach((el) => {
    const chars = split(el, 'chars', 'chars');
    onEnter(el, 'top 90%', (tl) =>
      tl.from(chars, { y: 80, opacity: 0, duration: 1, ease: 'back.inOut(2)', stagger: { amount: 0.3 } }),
    );
  });

  // .consulting-header: masked lines slide up
  $$('.consulting-header').forEach((el) => {
    const lines = split(el, 'lines', 'lines');
    onEnter(el, 'top 85%', (tl) =>
      tl.fromTo(lines, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: SINE, stagger: { each: 0.2 } }, 0),
    );
  });

  // .heading-style-h2: masked lines fade up
  $$('.heading-style-h2').forEach((el) => {
    const lines = split(el, 'lines', 'lines');
    onEnter(el, 'top 70%', (tl) =>
      tl.fromTo(lines, fadeUp, { opacity: 1, y: 0, duration: D, ease: 'none', stagger: { each: 0.2 } }),
    );
  });

  // .about-header: characters brighten while scrolling
  $$('.about-header').forEach((el) => {
    const chars = split(el, 'chars', 'chars');
    scrub(el, 'top 70%', 'bottom 50%', (tl) =>
      tl.fromTo(chars, { opacity: 0.2 }, { opacity: 1, duration: D, ease: 'none', stagger: { each: 1 } }),
    );
  });
}

/* ---------------------------------------------------------------- page load */
function pageLoad() {
  const tl = gsap.timeline();
  const q = (sel: string) => $$(sel);
  const l0 = q('[page-load-0]');
  if (l0.length) tl.fromTo(l0, fadeUp, fadeUpTo(), 0);
  q('[heading-title]').forEach((el) => {
    const chars = split(el, 'chars', 'chars');
    tl.fromTo(chars, { y: 80, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.6, ease: SINE, stagger: { amount: 0.3 } }, 0.2);
  });
  const l1 = q('[page-load-1]');
  if (l1.length) tl.fromTo(l1, fadeUp, fadeUpTo({ duration: D }), 0.4);
  const l2 = q('[page-load-2]');
  if (l2.length) tl.fromTo(l2, fadeUp, fadeUpTo({ duration: D }), 0.6);
  const l3 = q('[page-load-3]');
  if (l3.length) tl.fromTo(l3, fadeUp, fadeUpTo(), 0.8);

  // About V1 hero: slow image strip drift
  if (page() === 'about-v1') {
    gsap.to('.about-hero-image-wrap', { xPercent: -100, duration: 45, ease: 'none' });
  }
}

/* ---------------------------------------------------------------- marquees */
function marquees() {
  const loop = (trigger: Element, targets: Element[], duration: number) => {
    if (!targets.length) return;
    const tween = gsap.to(targets, { xPercent: -100, duration, ease: 'none', repeat: -1, paused: true });
    ScrollTrigger.create({ trigger, start: 'top bottom', once: true, onEnter: () => tween.play() });
  };
  $$('.marque-wrapper').forEach((w) => loop(w, $$('.marque-wrap', w), 40));
  $$('.section_testimonial').forEach((s) =>
    $$('.testimonial-content-wrapper', s).forEach((w) => loop(w, $$('.testimonial-content-wrap', s), 35)),
  );
  $$('.section-service').forEach((s) =>
    $$('.service-content-block', s).forEach((w) => loop(w, $$('.service-collection-list-wrapper', s), 65)),
  );
}

/* ---------------------------------------------------------------- hovers */
function hovers() {
  const white = cssVar('--_colors---white');
  const black2 = cssVar('--_colors---black-color-two');
  const primary = cssVar('--_colors---primary-color');

  // Primary button: split-char text roll, arrow swap, icon colours
  $$('.primary-button').forEach((btn) => {
    const text = btn.querySelector('.primary-button-text-block');
    const chars = text ? split(text, 'chars') : [];
    hover(btn, (tl) => {
      if (chars.length) tl.to(chars, { yPercent: -101, duration: 0.3, ease: SINE, stagger: { amount: 0.4 } }, 0);
      tl.to($$('.button-icon.is-01', btn), { xPercent: 180, duration: 0.3, ease: SINE }, 0);
      tl.to($$('.button-icon.is-02', btn), { xPercent: 0, duration: 0.3, ease: SINE }, 0);
      tl.to($$('.button-icon-block', btn), { backgroundColor: white, color: black2, duration: 0.3, ease: SINE }, 0);
    });
  });

  // Nav link (variant with split text)
  $$('.nav-link-2').forEach((link) => {
    const a = $$('.nav-link-text.is-01', link).flatMap((el) => split(el, 'chars'));
    const b = $$('.nav-link-text.is-02', link).flatMap((el) => split(el, 'chars'));
    hover(link, (tl) => {
      tl.fromTo(a, { yPercent: 0 }, { yPercent: -101, duration: 0.4, ease: 'power1.inOut', stagger: { each: 0.02 } }, 0);
      tl.fromTo(b, { yPercent: 101 }, { yPercent: 0, duration: 0.4, stagger: { each: 0.02 } }, 0);
    });
  });

  // Testimonial flip card
  $$('.testimonial-single-card-block').forEach((card) =>
    hover(card, (tl) => {
      tl.fromTo($$('.testimonial-card-block', card), { rotationY: 0 }, { rotationY: 180, duration: D, ease: SINE }, 0);
      tl.fromTo($$('.testimonial-card-text-block', card), { rotationY: 180, opacity: 0 }, { rotationY: 0, opacity: 1, duration: D, ease: SINE }, 0);
    }),
  );

  // Image zooms
  const zoom = (trigger: string, img: string) =>
    $$(trigger).forEach((t) => {
      const targets = $$(img, t);
      if (targets.length) hover(t, (tl) => tl.to(targets, { scale: 1.1, duration: D, ease: SINE }));
    });
  zoom('.blog-image-block', '.blog-image');
  zoom('.team-image-link', '.team-image');
  if (page() === 'services') zoom('.service-image-link', '.service-image.width-full');

  // Team card (v1): arrow rotates, icon pops in
  $$('.team-content-wrap-v1').forEach((card) =>
    hover(card, (tl) => {
      tl.fromTo($$('.team-arrow-icon', card), { rotation: 0 }, { rotation: 45, duration: D, ease: SINE }, 0);
      tl.fromTo($$('.team-icon-block', card), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: D, ease: SINE }, 0);
    }),
  );

  // Team card (v2): details slide in
  $$('.team-content-card').forEach((card) =>
    hover(card, (tl) =>
      tl.fromTo($$('.team-card-details-block', card), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: SINE }, 0),
    ),
  );

  // Service card (marquee): content + overlay fade in
  $$('.service-card-content').forEach((card) =>
    hover(card, (tl) => {
      tl.fromTo($$('.service-content-block-v2, .service-icon-block', card), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: SINE }, 0);
      tl.fromTo($$('.service-overlay', card), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: SINE }, 0);
    }),
  );

  // Blog "Read More" link
  $$('.blog-section-gap .blog-link-wrap').forEach((link) =>
    hover(link, (tl) => {
      tl.to(link, { color: primary, duration: D, ease: SINE }, 0);
      tl.to($$('.blog-icon', link), { rotation: 45, duration: D, ease: SINE }, 0);
    }),
  );

  // Home V3 expertise card: social row expands
  if (page() === 'home-v3') {
    $$('.expertise-content-card').forEach((card) =>
      hover(card, (tl) =>
        tl.fromTo($$('.expertise-card-social', card), { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: D, ease: SINE }),
      ),
    );
  }

  // Home V1 "why choose" cards (tablet and up)
  if (page() === 'home') {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      $$('.why-choose-singel-card').forEach((card) =>
        hover(card, (tl) => {
          tl.to(card, { y: '-2.5rem', backgroundColor: primary, duration: 0.4, ease: SINE }, 0);
          tl.to($$('.why-choose-icon-block', card), { backgroundColor: white, color: primary, duration: 0.4, ease: SINE }, 0);
          tl.to($$('.why-choose-title', card), { color: white, duration: 0.4, ease: SINE }, 0);
          tl.to($$('.body-text-sm.text-color-gray', card), { color: white, duration: 0.4, ease: SINE }, 0);
        }),
      );
    });
  }
}

/* ---------------------------------------------------------------- scroll-scrubbed sections */
function scrubbedSections() {
  const white = cssVar('--_colors---white');
  const white50 = cssVar('--_colors---color-white-50');
  const mm = gsap.matchMedia();

  // About V3 play-video section (desktop only)
  mm.add('(min-width: 992px)', () => {
    $$('.play-video-sticky-container').forEach((c) => {
      const chars = $$('.play-video-text', c).flatMap((el) => split(el, 'chars', 'chars'));
      scrub(c, 'top top', 'bottom bottom', (tl) => {
        tl.fromTo($$('.play-vice-icon-block', c), { opacity: 0 }, { opacity: 1, duration: D, ease: 'none' }, 0);
        tl.fromTo(chars, { y: 80 }, { y: 0, duration: D, ease: 'none', stagger: { amount: 0.3 } }, 0.13);
      });
    });
  });

  // Home V3 sticky services (tablet and up)
  if (page() === 'home-v3') {
    mm.add('(min-width: 768px)', () => {
      $$('.service-sticky-container').forEach((c) => {
        const q = (s: string) => $$(s, c);
        const e = { duration: D, ease: 'none' };
        scrub(c, 'top top', 'bottom bottom', (tl) => {
          tl.fromTo(q('.service-line-v3'), { scale: 0 }, { scale: 1, ...e }, 0);
          const moves: [string, number, number, number][] = [
            ['01', 0, 0, -105],
            ['02', 0.5, 0, -210],
            ['03', 1, -105, -320],
            ['04', 1.5, -210, -430],
            ['05', 2, -210, -420],
          ];
          for (const [n, pos, from, to] of moves) {
            tl.fromTo(q(`.service-image-wrap.is-${n}`), { scale: 1 }, { scale: 0, ...e }, pos);
            tl.fromTo(q(`.service-content-block-v3.is-${n}`), { yPercent: from }, { yPercent: to, ...e }, pos);
          }
        });
      });
    });
  }

  // Home V1 sticky services
  if (page() === 'home') {
    $$('.service-sticky-container-v1').forEach((c) => {
      const q = (s: string) => $$(s, c);
      const e = { duration: D, ease: 'none' };
      scrub(c, 'top top', 'bottom bottom', (tl) => {
        // step 1 (position 0)
        tl.fromTo(q('.service-line-black.is-01'), { width: '100%' }, { width: '0%', ...e }, 0);
        tl.to('.service-card-text-wrapper.is-01', { color: white, ...e }, 0);
        tl.to(q('.service-card-text-block.is-01'), { height: 'auto', ...e }, 0);
        tl.fromTo(q('.service-image-block.is-01'), { opacity: 1, scale: 1 }, { opacity: 0, scale: 0, ...e }, 0);
        tl.fromTo(q('.service-line-black.is-02'), { width: '0%' }, { width: '100%', ...e }, 0);
        // steps 2-4
        const steps: [string, string, string, string, number][] = [
          ['01', '02', 'is-01', 'is-o2', 0.5],
          ['02', '03', 'is-o2', 'is-03', 1],
          ['03', 'is04', 'is-03', 'is-04', 1.5],
        ];
        steps.forEach(([cur, next, curBlock, nextBlock, pos], i) => {
          const nextWrapper = next.startsWith('is') ? `.service-card-text-wrapper.${next}` : `.service-card-text-wrapper.is-${next}`;
          tl.to(`.service-card-text-wrapper.is-${cur}`, { color: white50, ...e }, pos);
          tl.to(nextWrapper, { color: white, ...e }, pos);
          tl.to(q(`.service-card-text-block.${curBlock}`), { height: 0, ...e }, pos);
          tl.to(q(`.service-card-text-block.${nextBlock}`), { height: 'auto', ...e }, pos);
          tl.fromTo(q(`.service-image-block.is-0${i + 2}`), { opacity: 1, scale: 1 }, { opacity: 0, scale: 0, ...e }, pos);
          tl.fromTo(q(`.service-line-black.is-0${i + 2}`), { width: '100%' }, { width: '0%', ...e }, pos);
          tl.fromTo(q(`.service-line-black.is-0${i + 3}`), { width: '0%' }, { width: '100%', ...e }, pos);
        });
      });
    });
  }

  // About V2 journey timeline
  if (page() === 'about-v2') {
    $$('.journey-content-wrapper').forEach((c) => {
      const q = (s: string) => $$(s, c);
      scrub(c, 'top 60%', 'bottom 20%', (tl) => {
        tl.fromTo(q('.journey-line'), { height: '0%' }, { height: '100%', duration: 1, ease: 'none' }, 0);
        ['01', '02', '03', '04'].forEach((n, i) =>
          tl.to(q(`.journey-year-text.is-${n}, .journey-card-details-block.is-${n}`), { opacity: 1, duration: 0.2, ease: 'none' }, i * 0.2),
        );
      });
    });
  }
}

/* ---------------------------------------------------------------- counters (template custom code) */
function counters() {
  $$('[class*="counter-anim"]').forEach((counter) => {
    const textEl = (counter.querySelector('*') as HTMLElement) || counter;
    const original = (textEl.textContent ?? '').trim();
    const match = original.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
    if (!match) return;
    const [, prefix, raw, suffix] = match;
    const numberPart = raw.replace(/,/g, '');
    const hasDecimal = numberPart.includes('.');
    const target = parseFloat(numberPart);
    if (Number.isNaN(target)) return;
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.2,
      ease: 'power1.out',
      scrollTrigger: { trigger: counter, start: 'top 90%', once: true },
      onUpdate: () => {
        const v = hasDecimal ? obj.value.toFixed(1) : Math.floor(obj.value).toLocaleString();
        textEl.textContent = prefix + v + suffix;
      },
    });
  });
}

export async function initInteractions() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    document.documentElement.classList.add('w-mod-ix3');
    return;
  }
  // Split text needs final font metrics.
  try {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  } catch {
    /* ignore */
  }
  try {
    pageLoad();
    scrollReveals();
    marquees();
    hovers();
    scrubbedSections();
    counters();
  } finally {
    document.documentElement.classList.add('w-mod-ix3');
    ScrollTrigger.refresh();
  }
}
