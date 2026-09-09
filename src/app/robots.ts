import type { MetadataRoute } from "next";
import { SITE_URL, NOINDEX_PATHS } from "@/lib/seo-config";

/**
 * robots.txt
 *
 * Goals:
 *  - Let crawlers reach the whole catalog (products, categories, brands, blogs).
 *  - Keep them out of private/transactional routes and token-bearing URLs.
 *  - Stop crawl budget being burned on faceted filter permutations.
 *  - Advertise every sitemap directly — /sitemap.xml is a small index over
 *    the four catalog sitemaps below, and /pages/sitemap.xml separately
 *    covers the static pages (home, policies, etc.); listing all five here
 *    means nothing depends on the index alone for discovery.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...NOINDEX_PATHS.flatMap((p) => [p, `${p}/`]),
    "/api/",
    "/*?*sort=",
    "/*?*search=",
    "/*?*minPrice=",
    "/*?*maxPrice=",
    "/*?*stockStatus=",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/pages/sitemap.xml`,
      `${SITE_URL}/categories/sitemap.xml`,
      `${SITE_URL}/products/sitemap.xml`,
      `${SITE_URL}/brands/sitemap.xml`,
      `${SITE_URL}/blogs/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
