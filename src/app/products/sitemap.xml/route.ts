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
const EMPTY_RETRY_MS = 60 * 1000; // an empty result is retried after 1 min
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

async function buildXml(): Promise<{ xml: string; count: number }> {
  const seen = new Set<string>();
  const entries: string[] = [];

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
    rest.forEach((r, i) => {
      if (r.status === "fulfilled") consume(r.value);
      else console.error(`[products/sitemap.xml] page ${i + 2} failed`, r.reason);
    });
  } catch (err) {
    console.error("[products/sitemap.xml]", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
  return { xml, count: entries.length };
}

// ── In-memory cache (per server process) ────────────────────────────────────
let cached: { xml: string; builtAt: number; count: number } | null = null;
let inflight: Promise<void> | null = null;

function refresh(): Promise<void> {
  if (!inflight) {
    inflight = buildXml()
      .then(({ xml, count }) => {
        // Never let a failed (empty) rebuild replace a good copy.
        if (count > 0 || !cached || cached.count === 0) {
          cached = { xml, builtAt: Date.now(), count };
        }
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function isFresh(c: NonNullable<typeof cached>): boolean {
  return Date.now() - c.builtAt < (c.count > 0 ? FRESH_MS : EMPTY_RETRY_MS);
}

export async function GET() {
  if (!cached) await refresh();
  else if (!isFresh(cached)) void refresh(); // stale-while-revalidate

  const c = cached ?? { xml: "", builtAt: 0, count: 0 };
  const maxAge = c.count > 0 ? FRESH_MS / 1000 : EMPTY_RETRY_MS / 1000;
  return new NextResponse(c.xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}
