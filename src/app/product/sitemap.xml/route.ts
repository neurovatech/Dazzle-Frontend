/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /product/sitemap.xml
 *
 * Streams every active product slug as a <url> entry.
 * Fetches in pages of 2 000 and deduplicates slugs before rendering.
 * A backend outage yields an empty (but valid) sitemap — never a 500.
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 h

const LIMIT = 2000;

async function getAllProductSlugs(): Promise<string[]> {
  try {
    const first = await api.get<any>(`/products?page=1&limit=${LIMIT}`, {
      next: { revalidate },
    });
    const total: number = Number(first?.totalCount) || 0;
    const slugs: string[] = (first?.data ?? [])
      .map((p: any) => p?.productSlug)
      .filter(Boolean);

    const totalPages = Math.ceil(total / LIMIT);
    if (totalPages > 1) {
      const rest = await Promise.allSettled(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          api.get<any>(`/products?page=${i + 2}&limit=${LIMIT}`, {
            next: { revalidate },
          }),
        ),
      );
      for (const r of rest) {
        if (r.status === "fulfilled") {
          for (const p of r.value?.data ?? []) {
            if (p?.productSlug) slugs.push(p.productSlug);
          }
        }
      }
    }
    return Array.from(new Set(slugs));
  } catch (err) {
    console.error("[product/sitemap.xml]", err);
    return [];
  }
}

function buildXml(slugs: string[]): string {
  const urls = slugs
    .map(
      (slug) =>
        `  <url>\n    <loc>${absoluteUrl(`/product/${slug}`)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  const slugs = await getAllProductSlugs();
  const xml = buildXml(slugs);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
