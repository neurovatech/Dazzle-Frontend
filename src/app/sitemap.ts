import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo-config";

/**
 * Sitemap INDEX — /sitemap.xml
 *
 * Acts as the master entry point. Search engines follow each child URL to
 * the dedicated sitemap for that content type. This keeps each file well
 * below the 50,000-URL / 50MB per-sitemap limit and lets Google recrawl
 * the catalog without re-processing static routes every time.
 *
 * Child sitemaps are served by Next.js Route Handlers under:
 *   /product/sitemap.xml
 *   /category/sitemap.xml
 *   /brand/sitemap.xml
 *   /blog/sitemap.xml
 *   /static/sitemap.xml
 */
export const revalidate = 3600; // 1 h — index rarely changes

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const children = [
    { path: "/static/sitemap.xml",   lastModified: now },
    { path: "/category/sitemap.xml", lastModified: now },
    { path: "/product/sitemap.xml",  lastModified: now },
    { path: "/brand/sitemap.xml",    lastModified: now },
    { path: "/blog/sitemap.xml",     lastModified: now },
  ];

  // Next.js MetadataRoute.Sitemap accepts absolute URLs as the `url` field.
  // When all entries have no `changeFrequency` / `priority` and only `url` +
  // `lastModified`, Next.js emits a proper <sitemapindex> block in the XML
  // (instead of a regular <urlset>). We lean into that here.
  return children.map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    lastModified,
  }));
}
