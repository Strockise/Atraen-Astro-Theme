/* Atraen site script (from the Webflow template): number counters + Lenis smooth scroll on desktop. */
(function () {
  // -----------------------------
  // Counter Animation
  // Requires GSAP + ScrollTrigger
  // Target class: wf-counter
  // -----------------------------
  function initCounterAnimation() {
    if (
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('[class*="wf-counter"]').forEach(function (counter) {
      var textEl = counter.querySelector("*") || counter;
      var original = textEl.textContent.trim();
      var match = original.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
      if (!match) return;
      var prefix = match[1];
      var numberPart = match[2].replace(/,/g, "");
      var suffix = match[3];
      var hasDecimal = numberPart.indexOf(".") !== -1;
      var target = parseFloat(numberPart);
      if (isNaN(target)) return;
      var obj = { value: 0 };
      gsap.to(obj, {
        value: target,
        duration: 1.2,
        ease: "power1.out",
        scrollTrigger: {
          trigger: counter,
          start: "top 90%",
          once: true
        },
        onUpdate: function () {
          var currentValue = hasDecimal
            ? obj.value.toFixed(1)
            : Math.floor(obj.value).toLocaleString();
          textEl.textContent = prefix + currentValue + suffix;
        }
      });
    });
  }
  // -----------------------------
  // Lenis Smooth Scroll
  // Desktop Only
  // -----------------------------
  function initSmoothScroll() {
    if (
      typeof Lenis === "undefined" ||
      !window.matchMedia("(min-width: 768px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    var lenis = new Lenis({
      duration: 0.8,
      smoothWheel: true,
      smoothTouch: false,
      allowNestedScroll: true,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      }
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
  function init() {
    initCounterAnimation();
    initSmoothScroll();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
