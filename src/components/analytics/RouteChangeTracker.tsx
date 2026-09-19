"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fbTrack, pushDataLayer } from "@/lib/analytics/pixelEvents";
import { captureClickIds } from "@/lib/analytics/clickIds";

/**
 * The Facebook Pixel base script and GTM container only fire their own
 * PageView/gtm.js event once, on the script's own load — the App Router
 * never re-runs it on a client-side navigation. This fires the equivalent
 * PageView/page_view on every route change after the first, and re-checks
 * the URL for a fresh ad click-id on every navigation (an ad can deep-link
 * straight to e.g. /product/x?fbclid=..., not just the homepage).
 */
export default function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The URL last reported. The old "skip the first run" boolean flipped on
  // the first effect run, so React StrictMode's dev-only second run of the
  // same effect looked like a navigation and fired an extra PageView on every
  // hard load. Comparing URLs instead makes that re-run (same URL) a no-op,
  // while a genuine navigation (different URL) still fires.
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    captureClickIds();

    const query = searchParams.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    if (lastPathRef.current === null) {
      lastPathRef.current = fullPath; // initial load — the Pixel base code already sent this PageView
      return;
    }
    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;

    fbTrack("PageView");
    pushDataLayer("page_view", { page_path: fullPath });
  }, [pathname, searchParams]);

  return null;
}
