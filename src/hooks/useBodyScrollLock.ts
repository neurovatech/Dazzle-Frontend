"use client";
import { useEffect } from "react";

/**
 * Locks page scroll while `active` is true — for modals, dropdown panels, and
 * anything else that overlays the page and must not let the page behind it
 * scroll along with the gesture used to scroll the overlay itself.
 *
 * Pins <body> with `position: fixed; top: -<scrollY>px` instead of setting
 * `overflow: hidden` on <html>. The two look equivalent but aren't: <html> is
 * the document's actual scrolling element, and toggling ITS overflow strips
 * away the scroll container that any `position: sticky` ancestor (e.g. the
 * site header) depends on — the instant a panel opened, the sticky header
 * jumped out of its stuck state back to its natural document position, which
 * dragged this panel (positioned relative to it) far off-screen along with
 * it. Fixing body instead never touches <html>'s overflow, so sticky
 * elsewhere on the page keeps tracking scroll normally while the lock is on.
 *
 * Restores the exact previous scroll position on cleanup (position: fixed
 * takes the page out of flow, so scrollY would otherwise reset to 0), and
 * restores whatever inline styles were already there, so two overlays opened
 * in sequence don't leave the page stuck locked after only one of them closes.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;

    html.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
