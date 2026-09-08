import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo-config";

/**
 * /sitemap.xml
 *
 * Lists every static / non-API-driven public page directly (previously a
 * separate /static/sitemap.xml, referenced from here as a child "index"
 * entry — folded in here instead since these change rarely and the whole
 * list is a small, fixed count, nowhere near the size that would justify
 * its own file). The catalog's dynamic content types (product, category,
 * brand, blog) stay in their own dedicated sitemaps — robots.ts already
 * lists each of those directly as its own `Sitemap:` line, so nothing here
 * needs to act as an index pointing to them.
 */
export const revalidate = 86400; // 24 h — these pages change very rarely

interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/",                           priority: 1.0, changeFrequency: "daily"   },
  { path: "/offer",                      priority: 0.9, changeFrequency: "daily"   },
  { path: "/new-arrivals",               priority: 0.8, changeFrequency: "daily"   },
  { path: "/trending-now",               priority: 0.8, changeFrequency: "daily"   },
  { path: "/most-popular",               priority: 0.8, changeFrequency: "daily"   },
  { path: "/hot-deal",                   priority: 0.8, changeFrequency: "daily"   },
  { path: "/feature-product",            priority: 0.8, changeFrequency: "daily"   },
  { path: "/online-exclusive",           priority: 0.7, changeFrequency: "weekly"  },
  { path: "/pre-order",                  priority: 0.7, changeFrequency: "weekly"  },
  { path: "/shop-location",              priority: 0.7, changeFrequency: "monthly" },
  { path: "/about-us",                   priority: 0.6, changeFrequency: "monthly" },
  { path: "/support",                    priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq",                        priority: 0.5, changeFrequency: "monthly" },
  { path: "/corporate",                  priority: 0.5, changeFrequency: "monthly" },
  { path: "/feedback",                   priority: 0.4, changeFrequency: "monthly" },
  { path: "/trade-in",                   priority: 0.6, changeFrequency: "monthly" },
  { path: "/terms-conditions",           priority: 0.3, changeFrequency: "yearly"  },
  { path: "/privacy-policy",             priority: 0.3, changeFrequency: "yearly"  },
  { path: "/refund-policy",              priority: 0.3, changeFrequency: "yearly"  },
  { path: "/warranty-policy",            priority: 0.3, changeFrequency: "yearly"  },
  { path: "/exchange-policy",            priority: 0.3, changeFrequency: "yearly"  },
  { path: "/delivery-policy",            priority: 0.3, changeFrequency: "yearly"  },
  { path: "/emi-policy",                 priority: 0.3, changeFrequency: "yearly"  },
  { path: "/cancellation-policy",        priority: 0.3, changeFrequency: "yearly"  },
  { path: "/shipping-policy",            priority: 0.3, changeFrequency: "yearly"  },
  { path: "/affiliate-policy",           priority: 0.3, changeFrequency: "yearly"  },
  { path: "/cookies-policy",             priority: 0.3, changeFrequency: "yearly"  },
  { path: "/data-protection-policy",     priority: 0.3, changeFrequency: "yearly"  },
  { path: "/loyalty-program-policy",     priority: 0.3, changeFrequency: "yearly"  },
  { path: "/membership-policy",          priority: 0.3, changeFrequency: "yearly"  },
  { path: "/pre-order-policy",           priority: 0.3, changeFrequency: "yearly"  },
  { path: "/product-disclaimer-policy",  priority: 0.3, changeFrequency: "yearly"  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
