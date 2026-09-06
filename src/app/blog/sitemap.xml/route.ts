/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /blog/sitemap.xml
 *
 * Covers: /blogs, /announcement, /career, /press-coverage
 */

import { absoluteUrl } from "@/lib/seo-config";
import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 h

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}

async function getPostUrls(
  endpoint: string,
  basePath: string,
  priority: number,
): Promise<UrlEntry[]> {
  try {
    const res = await api.get<any>(endpoint, { next: { revalidate } });
    const list: any[] = Array.isArray(res?.data) ? res.data : [];
    return list
      .filter((p) => p?.post_slug)
      .map((p): UrlEntry => ({
        loc: absoluteUrl(`${basePath}/${p.post_slug}`),
        lastmod: p.published_at
          ? new Date(p.published_at).toISOString().split("T")[0]
          : undefined,
        changefreq: "monthly",
        priority,
      }));
  } catch (err) {
    console.error(`[blog/sitemap.xml] ${basePath}`, err);
    return [];
  }
}

async function getAllBlogUrls(): Promise<UrlEntry[]> {
  const [blogs, announcements, careers, press] = await Promise.all([
    getPostUrls("/blogs?page=1&datalimit=500&isCareer=0", "/blogs", 0.6),
    getPostUrls("/blogs?page=1&datalimit=500&isAnnouncement=1", "/announcement", 0.5),
    getPostUrls("/blogs?page=1&datalimit=500&isCareer=1", "/career", 0.5),
    getPostUrls("/blogs?page=1&datalimit=500&isPress=1", "/press-coverage", 0.5),
  ]);

  return [
    { loc: absoluteUrl("/blogs"),           changefreq: "weekly",  priority: 0.7 },
    { loc: absoluteUrl("/announcement"),    changefreq: "weekly",  priority: 0.6 },
    { loc: absoluteUrl("/career"),          changefreq: "weekly",  priority: 0.6 },
    { loc: absoluteUrl("/press-coverage"),  changefreq: "weekly",  priority: 0.6 },
    ...blogs,
    ...announcements,
    ...careers,
    ...press,
  ];
}

function buildXml(entries: UrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${e.loc}</loc>${lastmod}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  const entries = await getAllBlogUrls();
  const xml = buildXml(entries);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
