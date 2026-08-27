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
      if (
        typeof parsed.scrollY === "number" &&
        typeof parsed.loadedPages === "number" &&
        parsed.loadedPages >= 1 &&
        parsed.scrollY > 0
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
 * restoreScrollY — scrolls to a Y position only after the page is tall enough.
 * Uses requestAnimationFrame loop, gives up after `timeoutMs` milliseconds.
 */
export function restoreScrollY(
  targetY: number,
  timeoutMs = 3000,
  onDone?: () => void,
): () => void {
  const start = Date.now();
  let rafId: number;

  const attempt = () => {
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    if (maxY >= targetY || Date.now() - start > timeoutMs) {
      window.scrollTo({ top: targetY, behavior: "instant" });
      onDone?.();
    } else {
      rafId = requestAnimationFrame(attempt);
    }
  };

  rafId = requestAnimationFrame(attempt);
  return () => cancelAnimationFrame(rafId);
}

/**
 * scrollToProduct — finds a product card element by data-product-uuid attribute
 * and smoothly scrolls it into view, centered vertically.
 * Retries via rAF for up to `timeoutMs` ms (element may not be in DOM yet).
 */
export function scrollToProduct(
  productUuid: string,
  timeoutMs = 3000,
): () => void {
  const start = Date.now();
  let rafId: number;

  const attempt = () => {
    const el = document.querySelector(
      `[data-product-uuid="${productUuid}"]`,
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (Date.now() - start < timeoutMs) {
      rafId = requestAnimationFrame(attempt);
    }
  };

  rafId = requestAnimationFrame(attempt);
  return () => cancelAnimationFrame(rafId);
}
