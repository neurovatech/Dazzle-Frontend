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
  const isFirstRender = useRef(true);

  useEffect(() => {
    captureClickIds();

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = searchParams.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    fbTrack("PageView");
    pushDataLayer("page_view", { page_path: fullPath });
  }, [pathname, searchParams]);

  return null;
}
