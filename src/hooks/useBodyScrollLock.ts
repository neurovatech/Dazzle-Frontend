"use client";
import { useEffect } from "react";

/**
 * Locks page scroll while `active` is true — for modals, dropdown panels, and
 * anything else that overlays the page and must not let the page behind it
 * scroll along with the gesture used to scroll the overlay itself.
 *
 * Sets `overflow: hidden` on BOTH <html> and <body> — not body alone. The
 * document's actual scrolling element is <html> (`document.scrollingElement`),
 * so locking only body still left `window.scrollTo`/`scrollBy` free to move
 * the page; measured directly: with only body locked, `window.scrollBy(0,
 * 300)` still scrolled the page 300px. Also sets `overscroll-behavior: none`
 * on <html> to stop scroll CHAINING — without it, a touch scroll that reaches
 * the top/bottom of a shorter overlay hands the rest of the gesture to the
 * page behind, even once html/body overflow is locked.
 *
 * Restores whatever was there before on cleanup, so two overlays opened in
 * sequence don't leave the page stuck locked after only one of them closes.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [active]);
}
