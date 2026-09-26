/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /products/sitemap.xml
 *
 * Lists every active product slug as a <url> entry.
 *
 * WHY THIS ROUTE IS DYNAMIC (not prerendered at build time)
 * The backend needs ~27 s per 2 000-item page and often times out or 500s.
 * As a prerendered route, `next build` had to wait for it: past Next's 180 s
 * static-generation limit, three attempts in a row, the whole BUILD FAILED.
 * A deploy must never depend on that endpoint, so the sitemap is now built on
 * demand and kept in memory instead:
 *   - fresh copy (< 6 h)  -> served instantly
 *   - stale copy          -> served instantly, refreshed in the background
 *   - INCOMPLETE copy (some backend pages failed) -> trusted for only 2 min
 *   - no copy yet (first request after a restart) -> built once, the wait is
 *     shared by every concurrent request (single in-flight promise)
 * The response carries `s-maxage`, so Cloudflare/the CDN absorbs nearly all
 * traffic and each container only rebuilds it about once per 6 h.
 *
 * Disk/memory: backend pages are fetched with `cache: "no-store"` (nothing
 * written to .next/cache/fetch-cache) and reduced to their <url> strings as
 * soon as they arrive. A backend outage yields an empty (but valid) sitemap
 * that is only cached for a minute - never a 500.
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LIMIT = 2000;
const FRESH_MS = 6 * 60 * 60 * 1000; // 6 h
// An incomplete result (backend failed/timed out on some pages, or returned
// nothing) is only trusted for a short while, then rebuilt. Measured: the
// backend often 500s on pages 2-3, so a "successful" build can list only
// ~1900 of ~4300 products - that must NOT be cached/CDN-cached for 6 hours.
const PARTIAL_RETRY_MS = 2 * 60 * 1000;
// The backend takes ~27 s per 2000-item page; leave headroom.
const TIMEOUT_MS = 60_000;

function urlEntry(slug: string): string {
  return `  <url>\n    <loc>${absoluteUrl(`/product/${slug}`)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
}

function fetchPage(page: number): Promise<any> {
  return api.get<any>(`/products?page=${page}&limit=${LIMIT}`, {
    cache: "no-store",
    timeoutMs: TIMEOUT_MS,
  });
}

async function buildXml(): Promise<{ xml: string; count: number; complete: boolean }> {
  const seen = new Set<string>();
  const entries: string[] = [];
  let complete = false;

  const consume = (res: any) => {
    for (const p of res?.data ?? []) {
      const slug = p?.productSlug;
      if (slug && !seen.has(slug)) {
        seen.add(slug);
        entries.push(urlEntry(slug));
      }
    }
  };

  try {
    const first = await fetchPage(1);
    const totalPages = Math.ceil((Number(first?.totalCount) || 0) / LIMIT);
    consume(first);

    // Remaining pages in parallel (sequential would take ~27 s x pages).
    const rest = await Promise.allSettled(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => fetchPage(i + 2)),
    );
    let failed = 0;
    rest.forEach((r, i) => {
      if (r.status === "fulfilled") consume(r.value);
      else {
        failed++;
        console.error(`[products/sitemap.xml] page ${i + 2} failed`, r.reason);
      }
    });
    complete = failed === 0 && totalPages > 0;
  } catch (err) {
    console.error("[products/sitemap.xml]", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
  return { xml, count: entries.length, complete };
}

// ── In-memory cache (per server process) ────────────────────────────────────
type Cached = { xml: string; builtAt: number; count: number; complete: boolean };
let cached: Cached | null = null;
let inflight: Promise<void> | null = null;

function refresh(): Promise<void> {
  if (!inflight) {
    inflight = buildXml()
      .then((next) => {
        // A rebuild may only replace the current copy if it is at least as
        // good: complete, or listing at least as many products.
        if (!cached || next.complete || next.count >= cached.count) {
          cached = { ...next, builtAt: Date.now() };
        } else {
          cached = { ...cached, builtAt: Date.now() }; // keep the better copy, retry later
        }
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function ttlMs(c: Cached): number {
  return c.complete && c.count > 0 ? FRESH_MS : PARTIAL_RETRY_MS;
}

export async function GET() {
  if (!cached) await refresh();
  else if (Date.now() - cached.builtAt >= ttlMs(cached)) void refresh(); // stale-while-revalidate

  const c: Cached = cached ?? { xml: "", builtAt: 0, count: 0, complete: false };
  const maxAge = ttlMs(c) / 1000;
  return new NextResponse(c.xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}
