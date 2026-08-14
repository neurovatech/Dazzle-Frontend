import type { MetadataRoute } from "next";
import { SITE_URL, NOINDEX_PATHS } from "@/lib/seo-config";

/**
 * robots.txt
 *
 * Goals:
 *  - Let crawlers reach the whole catalog (products, categories, brands, blogs).
 *  - Keep them out of private/transactional routes and token-bearing URLs.
 *  - Stop crawl budget being burned on faceted filter permutations, which can
 *    generate effectively unlimited near-duplicate URLs.
 *  - Advertise the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  // Block private routes and everything beneath them.
  const disallow = [
    ...NOINDEX_PATHS.flatMap((p) => [p, `${p}/`]),
    // Internal API + the backend proxy — no crawl value.
    "/api/",
    // Faceted-navigation parameters. `?page=` is intentionally NOT blocked:
    // paginated category pages are legitimate, indexable URLs.
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
