/**
 * Vanilla replacements for the Webflow runtime (webflow.js + jQuery):
 * navbar (w-nav), dropdown (w-dropdown), slider (w-slider), lightbox (w-lightbox) and forms (w-form).
 * The original Webflow classes/state classes (w--open, w-active, w-form-done …) are kept so the
 * original CSS applies unchanged.
 */

const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* =================================================================== navbar */
const COLLAPSE: Record<string, number> = { medium: 991, small: 767, tiny: 479 };

function initNav(nav: HTMLElement) {
  const button = nav.querySelector<HTMLElement>('.w-nav-button');
  const menu = nav.querySelector<HTMLElement>('.w-nav-menu');
  if (!button || !menu) return;
  const duration = Number(nav.dataset.duration ?? 400);
  const easing = nav.dataset.easing ?? 'ease';
  const easing2 = nav.dataset.easing2 ?? easing;
  const bp = COLLAPSE[nav.dataset.collapse ?? 'medium'] ?? 991;
  const home = menu.parentElement!;
  const anchor = document.createComment('w-nav-menu');
  home.insertBefore(anchor, menu);

  const overlay = document.createElement('div');
  overlay.className = 'w-nav-overlay';
  overlay.dataset.wfIgnore = '';
  nav.appendChild(overlay);

  let open = false;
  let anim: Animation | null = null;

  const setOpen = (value: boolean) => {
    if (value === open) return;
    open = value;
    anim?.cancel();
    if (open) {
      overlay.appendChild(menu);
      menu.setAttribute('data-nav-menu-open', '');
      overlay.style.display = 'block';
      button.classList.add('w--open');
      button.setAttribute('aria-expanded', 'true');
      const h = menu.offsetHeight;
      overlay.style.height = `${h}px`;
      anim = menu.animate([{ transform: `translateY(${-h}px)` }, { transform: 'translateY(0)' }], { duration, easing });
    } else {
      button.classList.remove('w--open');
      button.setAttribute('aria-expanded', 'false');
      const h = menu.offsetHeight;
      anim = menu.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-h}px)` }], { duration, easing: easing2 });
      const done = () => {
        menu.removeAttribute('data-nav-menu-open');
        overlay.style.display = 'none';
        overlay.style.height = '';
        home.insertBefore(menu, anchor.nextSibling);
      };
      anim.onfinish = done;
      anim.oncancel = done;
    }
  };

  const toggle = () => setOpen(!open);
  button.addEventListener('click', toggle);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (open && !nav.contains(e.target as Node)) setOpen(false);
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a[href]')) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (open && window.innerWidth > bp) setOpen(false);
  });
}

/* =================================================================== dropdown */
function initDropdown(dd: HTMLElement) {
  const toggle = dd.querySelector<HTMLElement>('.w-dropdown-toggle');
  const list = dd.querySelector<HTMLElement>('.w-dropdown-list');
  if (!toggle || !list) return;
  const hoverMode = dd.dataset.hover === 'true';
  const inCollapsedNav = () => !!dd.closest('[data-nav-menu-open]');

  const set = (open: boolean) => {
    dd.classList.toggle('w--open', open);
    toggle.classList.toggle('w--open', open);
    list.classList.toggle('w--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    // Inside the open mobile menu Webflow renders the list in-flow.
    list.classList.toggle('w--nav-dropdown-list-open', open && inCollapsedNav());
    toggle.classList.toggle('w--nav-dropdown-toggle-open', open && inCollapsedNav());
    dd.classList.toggle('w--nav-dropdown-open', open && inCollapsedNav());
  };
  const isOpen = () => list.classList.contains('w--open');

  if (hoverMode) {
    dd.addEventListener('mouseenter', () => {
      if (!inCollapsedNav() && window.matchMedia('(hover: hover)').matches) set(true);
    });
    dd.addEventListener('mouseleave', () => {
      if (!inCollapsedNav() && window.matchMedia('(hover: hover)').matches) set(false);
    });
  }
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    set(!isOpen());
  });
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      set(!isOpen());
    } else if (e.key === 'Escape') {
      set(false);
    }
  });
  dd.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      set(false);
      toggle.focus();
    }
  });
  dd.addEventListener('focusout', (e) => {
    if (!dd.contains(e.relatedTarget as Node)) set(false);
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !dd.contains(e.target as Node)) set(false);
  });
}

/* =================================================================== slider */
function initSlider(slider: HTMLElement) {
  const mask = slider.querySelector<HTMLElement>('.w-slider-mask');
  if (!mask) return;
  const slides = $$('.w-slide', mask).filter((s) => s.parentElement === mask);
  if (!slides.length) return;
  const left = slider.querySelector<HTMLElement>('.w-slider-arrow-left');
  const right = slider.querySelector<HTMLElement>('.w-slider-arrow-right');
  const nav = slider.querySelector<HTMLElement>('.w-slider-nav');
  const duration = Number(slider.dataset.duration ?? 500);
  const easing = slider.dataset.easing ?? 'ease';
  const infinite = slider.dataset.infinite !== 'false';
  const autoplay = slider.dataset.autoplay === 'true';
  const delay = Number(slider.dataset.delay ?? 4000);
  const numbered = nav?.classList.contains('w-num');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pages: { x: number; els: HTMLElement[] }[] = [];
  let index = 0;
  let maskWidth = 0;

  slider.setAttribute('role', 'region');
  slider.setAttribute('aria-roledescription', 'carousel');
  mask.setAttribute('aria-live', 'polite');

  // Group slides into pages exactly like Webflow (a new page starts when content overflows the mask).
  const layout = () => {
    maskWidth = mask.clientWidth;
    pages = [{ x: 0, els: [] }];
    let offset = 0;
    let pageWidth = 0;
    slides.forEach((s) => {
      if (pageWidth - offset > maskWidth - 1) {
        offset += maskWidth;
        pages.push({ x: 0, els: [] });
      }
      const page = pages[pages.length - 1];
      if (!page.els.length) page.x = s.offsetLeft - slides[0].offsetLeft;
      const cs = getComputedStyle(s);
      pageWidth += s.offsetWidth + parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
      page.els.push(s);
    });
    if (index >= pages.length) index = pages.length - 1;
    renderDots();
    go(index, false);
  };

  const renderDots = () => {
    if (!nav) return;
    nav.innerHTML = '';
    pages.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'w-slider-dot';
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Show slide ${i + 1} of ${pages.length}`);
      if (numbered) dot.textContent = String(i + 1);
      dot.addEventListener('click', () => go(i));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go(i);
        }
      });
      nav.appendChild(dot);
    });
  };

  const go = (i: number, animate = true) => {
    const n = pages.length;
    if (infinite) i = ((i % n) + n) % n;
    else i = Math.max(0, Math.min(n - 1, i));
    index = i;
    const x = -pages[i].x;
    const transition = animate && !reduce ? `transform ${duration}ms ${easing}` : 'none';
    slides.forEach((s) => {
      s.style.transition = transition;
      s.style.transform = `translateX(${x}px)`;
      const visible = pages[i].els.includes(s);
      s.setAttribute('aria-hidden', String(!visible));
      s.inert = !visible;
    });
    if (nav) Array.from(nav.children).forEach((d, k) => d.classList.toggle('w-active', k === i));
    if (!infinite) {
      left?.classList.toggle('w-slider-arrow-disabled', i === 0);
      right?.classList.toggle('w-slider-arrow-disabled', i === n - 1);
    }
  };

  const arrow = (el: HTMLElement | null, dir: number) => {
    if (!el) return;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', dir < 0 ? 'previous slide' : 'next slide');
    el.addEventListener('click', () => go(index + dir));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go(index + dir);
      }
    });
  };
  arrow(left, -1);
  arrow(right, 1);

  // Swipe
  if (slider.dataset.disableSwipe !== 'true') {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    mask.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
    });
    mask.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - startY)) go(index + (dx < 0 ? 1 : -1));
    });
    mask.addEventListener('pointercancel', () => (tracking = false));
  }

  if (autoplay && !reduce) {
    let timer = window.setInterval(() => go(index + 1), delay + duration);
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', () => (timer = window.setInterval(() => go(index + 1), delay + duration)));
  }

  let w = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === w) return;
    w = window.innerWidth;
    layout();
  });
  layout();
}

/* =================================================================== lightbox */
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

function initLightbox(link: HTMLElement) {
  const json = link.querySelector('script.w-json')?.textContent;
  if (!json) return;
  let items: { url: string; type?: string; poster?: string }[] = [];
  try {
    items = JSON.parse(json).items ?? [];
  } catch {
    return;
  }
  const item = items[0];
  if (!item) return;
  const embed = youtubeEmbed(item.url);
  link.setAttribute('role', 'button');
  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const dialog = document.createElement('dialog');
    dialog.className = 'cx-lightbox';
    dialog.setAttribute('aria-label', 'Video');
    const frame = document.createElement('div');
    frame.className = 'cx-lightbox__frame';
    if (/\.(mp4|webm)(\?|$)/i.test(item.url)) {
      const video = document.createElement('video');
      video.src = item.url;
      if (item.poster) video.poster = item.poster;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000';
      frame.appendChild(video);
    } else if (embed) {
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.title = 'Video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      img.style.width = '100%';
      frame.appendChild(img);
    }
    const close = document.createElement('button');
    close.className = 'cx-lightbox__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    dialog.append(close, frame);
    document.body.appendChild(dialog);
    const remove = () => dialog.remove();
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (ev) => {
      if (ev.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', remove);
    dialog.showModal();
  });
}

/* =================================================================== forms */
function initForm(wrapper: HTMLElement) {
  const form = wrapper.querySelector('form');
  const done = wrapper.querySelector<HTMLElement>('.w-form-done');
  const fail = wrapper.querySelector<HTMLElement>('.w-form-fail');
  if (!form) return;
  const endpoint = form.dataset.endpoint || '';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (fail) fail.style.display = 'none';
    const submit = form.querySelector<HTMLInputElement>('[type="submit"]');
    const label = submit?.value;
    if (submit) {
      submit.value = submit.dataset.wait || label || '';
      submit.disabled = true;
    }
    const data = new FormData(form);
    // Honeypot: silently "succeed" for bots.
    const spam = !!data.get('_gotcha');
    try {
      if (!spam) {
        if (!endpoint) {
          console.warn('[Clavix] No form endpoint configured. Set PUBLIC_FORM_ENDPOINT in .env (see README).');
        } else {
          const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
        }
      }
      form.style.display = 'none';
      if (done) {
        done.style.display = 'block';
        done.setAttribute('tabindex', '-1');
        done.focus();
      }
    } catch {
      if (fail) fail.style.display = 'block';
    } finally {
      if (submit) {
        submit.value = label || '';
        submit.disabled = false;
      }
    }
  });
}

/* =================================================================== background video */
function initVideoToggle(btn: HTMLElement) {
  const video = document.getElementById(btn.getAttribute('aria-controls') ?? '') as HTMLVideoElement | null;
  if (!video) return;
  const [pauseIcon, playIcon] = Array.from(btn.children) as HTMLElement[];
  const sync = () => {
    const paused = video.paused;
    if (pauseIcon) pauseIcon.hidden = paused;
    if (playIcon) playIcon.hidden = !paused;
    btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
  btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
}

export function initWebflowUI() {
  $$('[data-video-toggle]').forEach(initVideoToggle);
  $$('[data-nav]').forEach(initNav);
  $$('.w-dropdown').forEach(initDropdown);
  $$('.w-slider').forEach(initSlider);
  $$('.w-lightbox').forEach(initLightbox);
  $$('.w-form').forEach(initForm);
}
