import Lenis from 'lenis';
import { initWebflowUI } from './webflow-ui';
import { initInteractions } from './interactions';

/** Smooth scrolling (same settings as the original template; tablet and up only). */
function initSmoothScroll() {
  if (!window.matchMedia('(min-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({
    duration: 0.8,
    smoothWheel: true,
    allowNestedScroll: true,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  });
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

initWebflowUI();
initInteractions();
initSmoothScroll();
