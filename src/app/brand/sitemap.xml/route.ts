/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /brand/sitemap.xml
 *
 * All active brand pages: /brands + /brands/{slug}
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const revalidate = 43200; // 12 h — brands change infrequently

interface UrlEntry {
  loc: string;
  changefreq: string;
  priority: number;
}

async function getBrandUrls(): Promise<UrlEntry[]> {
  try {
    const res = await api.get<any>("/brands?order=1&page=1&limit=1000", {
      next: { revalidate },
    });
    const list: any[] = Array.isArray(res?.data) ? res.data : [];
    const entries: UrlEntry[] = [
      { loc: absoluteUrl("/brands"), changefreq: "weekly", priority: 0.8 },
    ];
    for (const b of list) {
      if (!b?.is_active || !b?.brand_slug) continue;
      entries.push({
        loc: absoluteUrl(`/brands/${b.brand_slug}`),
        changefreq: "weekly",
        priority: 0.7,
      });
    }
    return entries;
  } catch (err) {
    console.error("[brand/sitemap.xml]", err);
    return [];
  }
}

function buildXml(entries: UrlEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  const entries = await getBrandUrls();
  const xml = buildXml(entries);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
