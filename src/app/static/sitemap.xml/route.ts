/**
 * GET /static/sitemap.xml
 *
 * All static / non-API-driven public pages.
 * These change very rarely so they get a long cache TTL.
 */

import { absoluteUrl } from "@/lib/seo-config";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 h

interface StaticRoute {
  path: string;
  priority: number;
  changefreq: string;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/",                           priority: 1.0, changefreq: "daily"   },
  { path: "/offer",                      priority: 0.9, changefreq: "daily"   },
  { path: "/new-arrivals",               priority: 0.8, changefreq: "daily"   },
  { path: "/trending-now",               priority: 0.8, changefreq: "daily"   },
  { path: "/most-popular",               priority: 0.8, changefreq: "daily"   },
  { path: "/hot-deal",                   priority: 0.8, changefreq: "daily"   },
  { path: "/feature-product",            priority: 0.8, changefreq: "daily"   },
  { path: "/online-exclusive",           priority: 0.7, changefreq: "weekly"  },
  { path: "/pre-order",                  priority: 0.7, changefreq: "weekly"  },
  { path: "/shop-location",              priority: 0.7, changefreq: "monthly" },
  { path: "/about-us",                   priority: 0.6, changefreq: "monthly" },
  { path: "/support",                    priority: 0.5, changefreq: "monthly" },
  { path: "/faq",                        priority: 0.5, changefreq: "monthly" },
  { path: "/corporate",                  priority: 0.5, changefreq: "monthly" },
  { path: "/feedback",                   priority: 0.4, changefreq: "monthly" },
  { path: "/trade-in",                   priority: 0.6, changefreq: "monthly" },
  { path: "/terms-conditions",           priority: 0.3, changefreq: "yearly"  },
  { path: "/privacy-policy",             priority: 0.3, changefreq: "yearly"  },
  { path: "/refund-policy",              priority: 0.3, changefreq: "yearly"  },
  { path: "/warranty-policy",            priority: 0.3, changefreq: "yearly"  },
  { path: "/exchange-policy",            priority: 0.3, changefreq: "yearly"  },
  { path: "/delivery-policy",            priority: 0.3, changefreq: "yearly"  },
  { path: "/emi-policy",                 priority: 0.3, changefreq: "yearly"  },
  { path: "/cancellation-policy",        priority: 0.3, changefreq: "yearly"  },
  { path: "/shipping-policy",            priority: 0.3, changefreq: "yearly"  },
  { path: "/affiliate-policy",           priority: 0.3, changefreq: "yearly"  },
  { path: "/cookies-policy",             priority: 0.3, changefreq: "yearly"  },
  { path: "/data-protection-policy",     priority: 0.3, changefreq: "yearly"  },
  { path: "/loyalty-program-policy",     priority: 0.3, changefreq: "yearly"  },
  { path: "/membership-policy",          priority: 0.3, changefreq: "yearly"  },
  { path: "/pre-order-policy",           priority: 0.3, changefreq: "yearly"  },
  { path: "/product-disclaimer-policy",  priority: 0.3, changefreq: "yearly"  },
];

function buildXml(): string {
  const urls = STATIC_ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${absoluteUrl(r.path)}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  return new NextResponse(buildXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
