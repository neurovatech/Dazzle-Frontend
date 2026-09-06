/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /category/sitemap.xml
 *
 * Includes:
 *   /categories
 *   /categories/{slug}
 *   /categories/{slug}/{sub-slug}
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 h

interface UrlEntry {
  loc: string;
  changefreq: string;
  priority: number;
}

async function getCategoryUrls(): Promise<UrlEntry[]> {
  try {
    const res = await api.get<any>("/categories/child", { next: { revalidate } });
    const cats: any[] = Array.isArray(res?.data) ? res.data : [];
    const entries: UrlEntry[] = [
      { loc: absoluteUrl("/categories"), changefreq: "weekly", priority: 0.9 },
    ];

    for (const cat of cats) {
      if (!cat?.is_active || !cat?.category_slug) continue;
      entries.push({
        loc: absoluteUrl(`/categories/${cat.category_slug}`),
        changefreq: "daily",
        priority: 0.9,
      });
      for (const sub of cat.child ?? []) {
        if (!sub?.is_active || !sub?.sub_category_slug) continue;
        entries.push({
          loc: absoluteUrl(`/categories/${cat.category_slug}/${sub.sub_category_slug}`),
          changefreq: "daily",
          priority: 0.8,
        });
      }
    }
    return entries;
  } catch (err) {
    console.error("[category/sitemap.xml]", err);
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
  const entries = await getCategoryUrls();
  const xml = buildXml(entries);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
