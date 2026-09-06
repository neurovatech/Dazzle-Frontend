import type { MetadataRoute } from "next";
import { SITE_URL, NOINDEX_PATHS } from "@/lib/seo-config";

/**
 * robots.txt
 *
 * Goals:
 *  - Let crawlers reach the whole catalog (products, categories, brands, blogs).
 *  - Keep them out of private/transactional routes and token-bearing URLs.
 *  - Stop crawl budget being burned on faceted filter permutations.
 *  - Advertise the sitemap index AND all child sitemaps.
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
    // Sitemap index first, then all dedicated child sitemaps
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/static/sitemap.xml`,
      `${SITE_URL}/category/sitemap.xml`,
      `${SITE_URL}/product/sitemap.xml`,
      `${SITE_URL}/brand/sitemap.xml`,
      `${SITE_URL}/blog/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
