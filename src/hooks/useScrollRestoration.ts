"use client";

/**
 * scrollSession — sessionStorage helpers for infinite-scroll pages.
 *
 * Saves TWO things per page key:
 *   1. scrollY      — window.scrollY at the moment the user left
 *   2. loadedPages  — how many API pages were loaded into the list
 *
 * On reload / back-navigation the component reads these values, silently
 * re-fetches all the previously-loaded pages in sequence, then scrolls to
 * the saved Y offset once the DOM is tall enough.
 *
 * SSR-safe: every function touches window/sessionStorage only when called
 * inside a useEffect (client-only), never at module evaluation time.
 *
 * Usage pattern inside a component:
 *
 *   // 1. Save state whenever it changes
 *   useEffect(() => {
 *     const save = () => scrollSession.save(key, loadedPage, window.scrollY);
 *     window.addEventListener("beforeunload", save);
 *     document.addEventListener("visibilitychange", () => {
 *       if (document.visibilityState === "hidden") save();
 *     });
 *     return () => { ... remove listeners ... };
 *   }, [key, loadedPage]);
 *
 *   // 2. On mount, read saved state and restore
 *   const saved = scrollSession.read(key);   // { loadedPages, scrollY }
 *   // → fetch pages 1..loadedPages, build allProducts, then scrollTo(scrollY)
 *
 *   // 3. After restoring, clear so fresh visits start from top
 *   scrollSession.clear(key);
 */

const SCROLL_PREFIX = "__dz_scroll_";

export interface ScrollSessionData {
  scrollY: number;
  loadedPages: number;
}

export const scrollSession = {
  save(key: string, loadedPages: number, scrollY: number) {
    try {
      const data: ScrollSessionData = {
        scrollY: Math.round(scrollY),
        loadedPages,
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
 * scrollTo — scrolls to a Y position only after the page is tall enough.
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
    const maxY =
      document.documentElement.scrollHeight - window.innerHeight;
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
