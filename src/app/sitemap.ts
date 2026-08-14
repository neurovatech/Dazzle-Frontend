/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo-config";

/**
 * Dynamic, API-driven sitemap.
 *
 * The catalog is ~3,500 products plus categories, brands and blogs — comfortably
 * inside the 50,000-URL / 50MB limit for a single sitemap, so no sitemap index or
 * chunking is needed. If the catalog ever approaches ~45,000 URLs, switch to
 * `generateSitemaps()` and shard by page.
 *
 * Resilience: every source is fetched independently and failures degrade to an
 * empty list. A backend outage must never produce a 500 for /sitemap.xml —
 * a partial sitemap is far better than none.
 *
 * NOTE on `lastModified`: the API does not currently expose an updatedAt/modifiedAt
 * field for products or categories. It is deliberately omitted rather than filled
 * with `new Date()`, because a "last modified = now" on every crawl trains search
 * engines to distrust the signal. Blogs do expose `published_at`, so they get a
 * real value. Ask the backend team for `updatedAt` to improve this.
 */

// Cache the generated sitemap for 6 hours.
export const revalidate = 21600;

const PRODUCT_PAGE_SIZE = 2000; // verified max accepted by the API

type Entry = MetadataRoute.Sitemap[number];

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[sitemap] ${label} failed:`, err);
    return fallback;
  }
}

// ─── Static routes ────────────────────────────────────────────────────────────
// Public, indexable pages that are not driven by a slug.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/categories", priority: 0.9, changeFrequency: "weekly" },
  { path: "/brands", priority: 0.8, changeFrequency: "weekly" },
  { path: "/offer", priority: 0.9, changeFrequency: "daily" },
  { path: "/new-arrivals", priority: 0.8, changeFrequency: "daily" },
  { path: "/trending-now", priority: 0.8, changeFrequency: "daily" },
  { path: "/most-popular", priority: 0.8, changeFrequency: "daily" },
  { path: "/hot-deal", priority: 0.8, changeFrequency: "daily" },
  { path: "/feature-product", priority: 0.8, changeFrequency: "daily" },
  { path: "/online-exclusive", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pre-order", priority: 0.7, changeFrequency: "weekly" },
  { path: "/blogs", priority: 0.7, changeFrequency: "weekly" },
  { path: "/announcement", priority: 0.6, changeFrequency: "weekly" },
  { path: "/press-coverage", priority: 0.6, changeFrequency: "weekly" },
  { path: "/career", priority: 0.6, changeFrequency: "weekly" },
  { path: "/shop-location", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/support", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/corporate", priority: 0.5, changeFrequency: "monthly" },
  { path: "/feedback", priority: 0.4, changeFrequency: "monthly" },
  { path: "/trade-in", priority: 0.6, changeFrequency: "monthly" },
  // Policy pages — low priority but legitimate indexable content.
  { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/warranty-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/exchange-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/delivery-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/emi-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cancellation-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/affiliate-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/data-protection-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/loyalty-program-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/membership-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/pre-order-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/product-disclaimer-policy", priority: 0.3, changeFrequency: "yearly" },
];

// ─── Products ─────────────────────────────────────────────────────────────────
async function getProductEntries(): Promise<Entry[]> {
  return safe(
    async () => {
      const first = await api.get<any>(
        `/products?page=1&limit=${PRODUCT_PAGE_SIZE}`,
        { next: { revalidate } },
      );

      const totalCount: number = Number(first?.totalCount) || 0;
      const slugs: string[] = (first?.data ?? [])
        .map((p: any) => p?.productSlug)
        .filter(Boolean);

      // Fetch remaining pages in parallel.
      const totalPages = Math.ceil(totalCount / PRODUCT_PAGE_SIZE);
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            safe(
              () =>
                api.get<any>(`/products?page=${i + 2}&limit=${PRODUCT_PAGE_SIZE}`, {
                  next: { revalidate },
                }),
              { data: [] },
              `products page ${i + 2}`,
            ),
          ),
        );
        for (const r of rest) {
          for (const p of r?.data ?? []) {
            if (p?.productSlug) slugs.push(p.productSlug);
          }
        }
      }

      // De-duplicate defensively — the API paginates a live, changing dataset.
      return Array.from(new Set(slugs)).map<Entry>((slug) => ({
        url: absoluteUrl(`/product/${slug}`),
        changeFrequency: "daily",
        priority: 0.9,
      }));
    },
    [],
    "products",
  );
}

// ─── Categories & sub-categories ──────────────────────────────────────────────
async function getCategoryEntries(): Promise<Entry[]> {
  return safe(
    async () => {
      const res = await api.get<any>("/categories/child", { next: { revalidate } });
      const cats: any[] = Array.isArray(res?.data) ? res.data : [];
      const entries: Entry[] = [];

      for (const cat of cats) {
        if (!cat?.is_active || !cat?.category_slug) continue;
        entries.push({
          url: absoluteUrl(`/categories/${cat.category_slug}`),
          changeFrequency: "daily",
          priority: 0.9,
        });

        for (const sub of cat.child ?? []) {
          if (!sub?.is_active || !sub?.sub_category_slug) continue;
          entries.push({
            url: absoluteUrl(`/categories/${cat.category_slug}/${sub.sub_category_slug}`),
            changeFrequency: "daily",
            priority: 0.8,
          });
        }
      }
      return entries;
    },
    [],
    "categories",
  );
}

// ─── Brands ───────────────────────────────────────────────────────────────────
async function getBrandEntries(): Promise<Entry[]> {
  return safe(
    async () => {
      const res = await api.get<any>("/brands?order=1&page=1&limit=1000", {
        next: { revalidate },
      });
      const list: any[] = Array.isArray(res?.data) ? res.data : [];
      const brands: Entry[] = list
        .filter((b) => b?.is_active && b?.brand_slug)
        .map((b): Entry => ({
          url: absoluteUrl(`/brands/${b.brand_slug}`),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
      return brands;
    },
    [],
    "brands",
  );
}

// ─── Blog-family content (blogs, announcements, career, press) ────────────────
async function getPostEntries(
  endpoint: string,
  basePath: string,
  priority: number,
): Promise<Entry[]> {
  return safe(
    async () => {
      const res = await api.get<any>(endpoint, { next: { revalidate } });
      const list: any[] = Array.isArray(res?.data) ? res.data : [];
      const posts: Entry[] = list
        .filter((p) => p?.post_slug)
        .map((p): Entry => ({
          url: absoluteUrl(`${basePath}/${p.post_slug}`),
          // Blogs DO expose a real timestamp, so use it.
          lastModified: p.published_at ? new Date(p.published_at) : undefined,
          changeFrequency: "monthly",
          priority,
        }));
      return posts;
    },
    [],
    `posts ${basePath}`,
  );
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, blogs, announcements, careers, press] =
    await Promise.all([
      getProductEntries(),
      getCategoryEntries(),
      getBrandEntries(),
      getPostEntries("/blogs?page=1&datalimit=500&isCareer=0", "/blogs", 0.6),
      getPostEntries("/blogs?page=1&datalimit=500&isAnnouncement=1", "/announcement", 0.5),
      getPostEntries("/blogs?page=1&datalimit=500&isCareer=1", "/career", 0.5),
      getPostEntries("/blogs?page=1&datalimit=500&isPress=1", "/press-coverage", 0.5),
    ]);

  const staticEntries = STATIC_ROUTES.map<Entry>((r) => ({
    url: absoluteUrl(r.path),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const all = [
    ...staticEntries,
    ...categories,
    ...products,
    ...brands,
    ...blogs,
    ...announcements,
    ...careers,
    ...press,
  ];

  // Final de-duplication by URL — different sources can legitimately overlap.
  const seen = new Set<string>();
  return all.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}
