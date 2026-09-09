/**
 * GET /pages/sitemap.xml
 *
 * Every static / non-API-driven public page (home, offer, policies, etc.).
 * Moved out of the root /sitemap.xml, which now acts as a small index
 * pointing at this and the catalog's dynamic sitemaps (products, brands,
 * categories, blogs) — robots.txt lists all five directly either way, so
 * nothing here goes undiscovered.
 */

import { absoluteUrl } from "@/lib/seo-config";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 h — these pages change very rarely

interface UrlEntry {
  loc: string;
  changefreq: string;
  priority: number;
}

const STATIC_ROUTES: UrlEntry[] = [
  { loc: "/",                           priority: 1.0, changefreq: "daily"   },
  { loc: "/offer",                      priority: 0.9, changefreq: "daily"   },
  { loc: "/new-arrivals",               priority: 0.8, changefreq: "daily"   },
  { loc: "/trending-now",               priority: 0.8, changefreq: "daily"   },
  { loc: "/most-popular",               priority: 0.8, changefreq: "daily"   },
  { loc: "/hot-deal",                   priority: 0.8, changefreq: "daily"   },
  { loc: "/feature-product",            priority: 0.8, changefreq: "daily"   },
  { loc: "/online-exclusive",           priority: 0.7, changefreq: "weekly"  },
  { loc: "/pre-order",                  priority: 0.7, changefreq: "weekly"  },
  { loc: "/shop-location",              priority: 0.7, changefreq: "monthly" },
  { loc: "/about-us",                   priority: 0.6, changefreq: "monthly" },
  { loc: "/support",                    priority: 0.5, changefreq: "monthly" },
  { loc: "/faq",                        priority: 0.5, changefreq: "monthly" },
  { loc: "/corporate",                  priority: 0.5, changefreq: "monthly" },
  { loc: "/feedback",                   priority: 0.4, changefreq: "monthly" },
  { loc: "/trade-in",                   priority: 0.6, changefreq: "monthly" },
  { loc: "/terms-conditions",           priority: 0.3, changefreq: "yearly"  },
  { loc: "/privacy-policy",             priority: 0.3, changefreq: "yearly"  },
  { loc: "/refund-policy",              priority: 0.3, changefreq: "yearly"  },
  { loc: "/warranty-policy",            priority: 0.3, changefreq: "yearly"  },
  { loc: "/exchange-policy",            priority: 0.3, changefreq: "yearly"  },
  { loc: "/delivery-policy",            priority: 0.3, changefreq: "yearly"  },
  { loc: "/emi-policy",                 priority: 0.3, changefreq: "yearly"  },
  { loc: "/cancellation-policy",        priority: 0.3, changefreq: "yearly"  },
  { loc: "/shipping-policy",            priority: 0.3, changefreq: "yearly"  },
  { loc: "/affiliate-policy",           priority: 0.3, changefreq: "yearly"  },
  { loc: "/cookies-policy",             priority: 0.3, changefreq: "yearly"  },
  { loc: "/data-protection-policy",     priority: 0.3, changefreq: "yearly"  },
  { loc: "/loyalty-program-policy",     priority: 0.3, changefreq: "yearly"  },
  { loc: "/membership-policy",          priority: 0.3, changefreq: "yearly"  },
  { loc: "/pre-order-policy",           priority: 0.3, changefreq: "yearly"  },
  { loc: "/product-disclaimer-policy",  priority: 0.3, changefreq: "yearly"  },
];

function buildXml(entries: UrlEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${absoluteUrl(e.loc)}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  const xml = buildXml(STATIC_ROUTES);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  });
}
