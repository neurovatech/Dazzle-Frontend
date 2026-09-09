import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo-config";

/**
 * /sitemap.xml
 *
 * A small index pointing at the catalog's own sitemaps — one per content
 * type: /products, /brands, /categories, /blogs. Static pages (home,
 * offer, policies, etc.) live in their own /pages/sitemap.xml instead of
 * being listed here, so this stays a short, focused index; robots.txt
 * lists all five sitemaps directly too, so nothing depends on this index
 * alone for discovery.
 */
export const revalidate = 86400; // 24 h

const CHILD_SITEMAPS = [
  "/products/sitemap.xml",
  "/brands/sitemap.xml",
  "/categories/sitemap.xml",
  "/blogs/sitemap.xml",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return CHILD_SITEMAPS.map((path) => ({ url: absoluteUrl(path) }));
}
