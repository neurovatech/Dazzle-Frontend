"use client";

/**
 * useHomeProductFocus
 *
 * For homepage sections (fixed grids, no infinite scroll / no page re-fetch).
 *
 * On mount: reads saved productUuid from sessionStorage and smoothly scrolls
 * the matching product card into view (center).
 *
 * On product card click: saves { productUuid, scrollY } so back-navigation
 * can restore position.
 *
 * SSR-safe — all sessionStorage/window access is inside useEffect.
 *
 * @param pageKey  Stable string that identifies this section, e.g. "home_trending"
 */

import { useEffect } from "react";
import {
  scrollSession,
  scrollToProduct,
  setManualScrollRestoration,
} from "./useScrollRestoration";

export function useHomeProductFocus(pageKey: string) {
  // ── Restore on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    // Same reason as the listing pages: the browser's own restoration jumps to
    // a stale Y and cancels the smooth scroll to the card.
    setManualScrollRestoration();

    const saved = scrollSession.read(pageKey);
    if (!saved) return;

    if (saved.productUuid) {
      scrollToProduct(saved.productUuid);
    }
    // Do NOT clear — let the next save overwrite it naturally.
  }, [pageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save on product link click ─────────────────────────────────────────────
  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href === window.location.pathname) return;

      const card = (e.target as HTMLElement).closest("[data-product-uuid]");
      const uuid = card?.getAttribute("data-product-uuid") ?? undefined;
      // loadedPages=1 — homepage never loads more pages
      scrollSession.save(pageKey, 1, window.scrollY, uuid);
    };

    document.addEventListener("click", onLinkClick, true);
    return () => document.removeEventListener("click", onLinkClick, true);
  }, [pageKey]);
}
