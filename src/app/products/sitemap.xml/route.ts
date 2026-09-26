/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /products/sitemap.xml
 *
 * Lists every active product slug as a <url> entry.
 * Fetches in pages of 2 000 and turns each page into its <url> XML
 * immediately, so only the small XML strings are kept. A backend outage yields an
 * empty (but valid) sitemap - never a 500.
 *
 * Disk: the backend pages are fetched with `cache: "no-store"` so the ~1 MB JSON
 * bodies are not written to .next/cache/fetch-cache; `dynamic = "force-static"`
 * keeps the route prerendered/ISR (a bare no-store fetch would make it dynamic,
 * i.e. every request would wait ~27 s for the backend). The finished XML is
 * cached by this route's own `revalidate` (6 h).
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 h
// force-static keeps this route prerendered/ISR even though its backend fetches
// use `cache: "no-store"` (which would otherwise make the route dynamic).
export const dynamic = "force-static";

const LIMIT = 2000;
// Verified live: the backend takes ~24s to return one 2000-item page - well
// past api.ts's normal 30s default. This route runs at most every 6h and
// already falls back to an empty (but valid) sitemap on any failure.
const TIMEOUT_MS = 60_000;

function urlEntry(slug: string): string {
  return `  <url>\n    <loc>${absoluteUrl(`/product/${slug}`)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
}

async function fetchPage(page: number): Promise<any> {
  return api.get<any>(`/products?page=${page}&limit=${LIMIT}`, {
    cache: "no-store",
    timeoutMs: TIMEOUT_MS,
  });
}

async function buildEntries(): Promise<string[]> {
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

    // The remaining pages are fetched IN PARALLEL: the backend needs ~27 s per
    // 2000-item page, so going one-by-one (tried) pushed the prerender past
    // Next's 180 s static-generation limit and FAILED THE BUILD. Memory is not
    // a concern here - only a few ~1 MB responses, and each is reduced to its
    // <url> strings as soon as it is consumed.
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
  return entries;
}

export async function GET() {
  const entries = await buildEntries();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
