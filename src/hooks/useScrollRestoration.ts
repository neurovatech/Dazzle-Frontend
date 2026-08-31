"use client";

/**
 * scrollSession — sessionStorage helpers for infinite-scroll pages.
 *
 * Saves per page key:
 *   1. scrollY      — window.scrollY at the moment the user left
 *   2. loadedPages  — how many API pages were loaded into the list
 *   3. productUuid  — (optional) uuid of the product card the user clicked
 *
 * SSR-safe: every function touches window/sessionStorage only when called
 * inside a useEffect (client-only), never at module evaluation time.
 */

const SCROLL_PREFIX = "__dz_scroll_";

export interface ScrollSessionData {
  scrollY: number;
  loadedPages: number;
  productUuid?: string;
}

export const scrollSession = {
  save(key: string, loadedPages: number, scrollY: number, productUuid?: string) {
    try {
      const data: ScrollSessionData = {
        scrollY: Math.round(scrollY),
        loadedPages,
        ...(productUuid ? { productUuid } : {}),
      };
      sessionStorage.setItem(SCROLL_PREFIX + key, JSON.stringify(data));
    } catch {
      // sessionStorage unavailable (private mode etc.) — fail silently
    }
  },

  read(key: string): ScrollSessionData | null {
    try {
      const raw = sessionStorage.getItem(SCROLL_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ScrollSessionData;
      // scrollY may legitimately be 0 when the clicked card sat at the very top
      // of the list; that is still a session worth restoring as long as we know
      // WHICH card to return to. Only a positionless, anchorless entry is junk.
      if (
        typeof parsed.scrollY === "number" &&
        typeof parsed.loadedPages === "number" &&
        parsed.loadedPages >= 1 &&
        (parsed.scrollY > 0 || !!parsed.productUuid)
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  clear(key: string) {
    try {
      sessionStorage.removeItem(SCROLL_PREFIX + key);
    } catch {
      // ignore
    }
  },
};

/**
 * useManualScrollRestoration — stops the browser restoring scroll by itself.
 *
 * With the default `history.scrollRestoration = "auto"`, a back navigation makes
 * the browser jump to the raw Y the page was left at. On an infinite-scroll list
 * that number is meaningless by the time we return: the list is rebuilt from the
 * API, images above the fold settle at different heights, and the same Y lands
 * somewhere else entirely — measured ~1500px past the product that was clicked.
 * Worse, that jump happens AFTER our smooth scrollIntoView starts and cancels it,
 * so the anchor-based restore never had a chance.
 *
 * Switching to "manual" hands both jobs to scrollToProduct(), which aims at the
 * card itself rather than at a stale coordinate.
 *
 * Deliberately not reset on unmount: the component unmounts precisely when the
 * user opens a product, and it is the navigation BACK from there that must not
 * be hijacked. It stays manual for the rest of the document's life.
 */
export function setManualScrollRestoration() {
  try {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    // Some embedded webviews throw on assignment — nothing to do but continue.
  }
}

/**
 * restoreScrollY — scrolls to a Y position only after the page is tall enough.
 * Polls until the document is tall enough, giving up after `timeoutMs` ms.
 */
/** Poll interval for the restore loops. See POLL_NOTE. */
const POLL_MS = 50;

/*
 * POLL_NOTE — why these loops poll on a timer rather than requestAnimationFrame.
 *
 * rAF does not fire at all while a tab is hidden or not compositing, and a
 * restore runs at exactly the moment that is most likely: the user taps a
 * product, switches apps, and comes back. An rAF-driven restore simply never
 * completes in that window and the reader is dumped at the top of the list.
 * A timer still fires (throttled, but it fires), so the restore finishes either
 * way. 50ms is imperceptible next to the network round-trips these loops wait on.
 */

export function restoreScrollY(
  targetY: number,
  timeoutMs = 3000,
  onDone?: () => void,
): () => void {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout>;
  let cancelled = false;

  const attempt = () => {
    if (cancelled) return;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    if (maxY >= targetY || Date.now() - start > timeoutMs) {
      window.scrollTo({ top: targetY, behavior: "instant" });
      onDone?.();
    } else {
      timer = setTimeout(attempt, POLL_MS);
    }
  };

  attempt();
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

/**
 * scrollToProduct — brings the card the user clicked back under their eyes.
 *
 * Two things make this harder than a single scrollIntoView call:
 *
 * 1. The card may not exist yet. Returning to an infinite-scroll list refetches
 *    pages 2..N, so we poll for the element rather than assuming it is there.
 *
 * 2. Once it exists, it keeps MOVING. Product images above it are still
 *    decoding, and each one that lands pushes the card down the document.
 *    Scrolling to it at that moment leaves the user short of the target — this
 *    was landing ~1500px off. So we wait until the card's document position
 *    stops changing for a few consecutive frames before scrolling, and give up
 *    waiting once timeoutMs is spent rather than never scrolling at all.
 *
 * 3. A smooth animation cannot be relied on. Measured on this list, a
 *    `behavior: "smooth"` scrollIntoView over ~6700px did nothing at all —
 *    scrollY stayed 0 — while the identical call with "instant" landed the card
 *    dead centre. Long smooth scrolls get cancelled by the router's own
 *    scroll-to-top and by content still settling, and iOS Safari drops them for
 *    the same reasons. Back-navigation should feel like the page was never left,
 *    so we place the card instantly rather than animating 6700px past everything.
 *
 * Requires the browser's own restoration to be off — see
 * setManualScrollRestoration() — otherwise the native jump to a stale Y wins.
 */
export function scrollToProduct(
  productUuid: string,
  timeoutMs = 6000,
): () => void {
  const start = Date.now();
  // Three consecutive identical readings, i.e. ~150ms of no movement.
  const STABLE_TICKS_REQUIRED = 3;

  let timer: ReturnType<typeof setTimeout>;
  let cancelled = false;
  let lastDocTop: number | null = null;
  let stableTicks = 0;

  const attempt = () => {
    if (cancelled) return;

    const el = document.querySelector(
      `[data-product-uuid="${productUuid}"]`,
    ) as HTMLElement | null;

    const expired = Date.now() - start > timeoutMs;

    if (!el) {
      if (!expired) timer = setTimeout(attempt, POLL_MS);
      return;
    }

    // Position within the document, which is what shifts as images load —
    // getBoundingClientRect().top alone also changes when we scroll.
    const docTop = el.getBoundingClientRect().top + window.scrollY;

    if (lastDocTop !== null && Math.abs(docTop - lastDocTop) < 1) {
      stableTicks += 1;
    } else {
      stableTicks = 0;
    }
    lastDocTop = docTop;

    if (stableTicks < STABLE_TICKS_REQUIRED && !expired) {
      timer = setTimeout(attempt, POLL_MS);
      return;
    }

    el.scrollIntoView({ behavior: "instant", block: "center" });

    // One late correction: images that finish decoding after we land can still
    // shift the card. If it has drifted out of the middle band, place it again.
    window.setTimeout(() => {
      if (cancelled) return;
      const still = document.querySelector(
        `[data-product-uuid="${productUuid}"]`,
      ) as HTMLElement | null;
      if (!still) return;
      const { top } = still.getBoundingClientRect();
      const outsideBand = top < 0 || top > window.innerHeight * 0.75;
      if (outsideBand) {
        still.scrollIntoView({ behavior: "instant", block: "center" });
      }
    }, 350);
  };

  attempt();
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
