import type { MetadataRoute } from "next";
import { SITE_URL, NOINDEX_PATHS } from "@/lib/seo-config";

/**
 * robots.txt
 *
 * Goals:
 *  - Let crawlers reach the whole catalog (products, categories, brands, blogs).
 *  - Keep them out of private/transactional routes and token-bearing URLs.
 *  - Stop crawl budget being burned on faceted filter permutations.
 *  - Advertise every sitemap directly — /sitemap.xml itself lists all the
 *    static pages (home, policies, etc.), so it isn't just an index
 *    pointing elsewhere; the catalog's dynamic content types each still
 *    get their own dedicated sitemap alongside it.
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
      `${SITE_URL}/category/sitemap.xml`,
      `${SITE_URL}/product/sitemap.xml`,
      `${SITE_URL}/brand/sitemap.xml`,
      `${SITE_URL}/blog/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
