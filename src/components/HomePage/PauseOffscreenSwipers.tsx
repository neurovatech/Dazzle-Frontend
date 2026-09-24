"use client";

import { useEffect } from "react";

type AutoplayApi = { stop: () => void; start: () => void; running?: boolean };
type SwiperHost = HTMLElement & {
  swiper?: { autoplay?: AutoplayApi; params?: { autoplay?: unknown } };
};

/** Only carousels that were actually configured to autoplay are managed. */
function autoplayOf(el: SwiperHost): AutoplayApi | null {
  const sw = el.swiper;
  const cfg = sw?.params?.autoplay;
  const enabled = cfg === true || (typeof cfg === "object" && cfg !== null && (cfg as { enabled?: boolean }).enabled !== false);
  return enabled && sw?.autoplay ? sw.autoplay : null;
}

/**
 * Pauses every Swiper's autoplay while it is off-screen and resumes it when it
 * scrolls back into view. The homepage mounts ~9 autoplaying carousels, and
 * each one kept advancing (style writes + timers on the main thread) every few
 * seconds even when nobody could see it — background work that lands right
 * next to a visitor's tap and inflates INP. Nothing visible changes: a slider
 * you're looking at still plays exactly as before.
 *
 * One observer for the whole page, so no carousel component needed touching.
 */
export default function PauseOffscreenSwipers() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const visible = new Map<SwiperHost, boolean>();
    const stoppedByUs = new WeakSet<SwiperHost>();

    const apply = (el: SwiperHost) => {
      const ap = autoplayOf(el);
      if (!ap) return; // Swiper not initialised yet (retried below) or not autoplaying
      if (visible.get(el)) {
        if (stoppedByUs.has(el)) {
          stoppedByUs.delete(el);
          ap.start();
        }
      } else if (ap.running) {
        stoppedByUs.add(el);
        ap.stop();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as SwiperHost;
          visible.set(el, entry.isIntersecting);
          apply(el);
        }
      },
      { rootMargin: "50px" },
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<SwiperHost>(".swiper").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
      // Swiper attaches `el.swiper` a moment after hydration, which can be
      // after the observer's first callback — re-apply once it exists.
      visible.forEach((_, el) => apply(el));
    };

    scan();

    // Swiper (and React's hydration) can create or replace `.swiper` nodes well
    // after mount — on a slow phone that is several seconds in — so keep
    // watching the DOM for new ones for a while instead of scanning a fixed
    // number of times. Debounced so it never adds meaningful main-thread work.
    let debounce: number | undefined;
    const mo = new MutationObserver(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(scan, 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Swiper initialisation is mostly attribute/class changes a MutationObserver
    // on childList won't see, so also re-apply once a second during that window.
    const poll = window.setInterval(scan, 1000);
    const stopWatching = window.setTimeout(() => {
      mo.disconnect();
      window.clearInterval(poll);
    }, 20000);

    return () => {
      window.clearTimeout(debounce);
      window.clearTimeout(stopWatching);
      window.clearInterval(poll);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
