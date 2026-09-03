/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { Suspense, cache } from "react";
import BrandProducts, { CategoryItem } from "@/components/Brands/BrandProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import {
  SITE_NAME,
  OG_LOCALE,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from "@/lib/seo-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductItem {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string } | null;
}

export interface ProductListResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ProductItem[];
}

interface CategoryListResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: CategoryItem[];
}

/** /seo/brand/{slug} — CMS-authored SEO copy for a brand landing page. */
interface BrandSeoResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data?: {
    title?: string;
    keywords?: string;
    canonical?: string;
    /** Long-form marketing copy, raw HTML from the CMS. */
    bottomContent?: string;
    description?: string;
  };
}

export interface AttributeItem {
  attributeGuid: string;
  attributeVariation: string;
}

export interface AttributeGroup {
  attributeName: string;
  items: AttributeItem[];
}

export interface BrandAttributesResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: AttributeGroup[];
  priceData?: any;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  /**
   * `?fromCategory=` is set by the mega menu — see brandHref() in ExplorePanel.
   * Deliberately not `category`, which the chip row uses for sub-category slugs.
   */
  searchParams: Promise<{ fromCategory?: string }>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const LIMIT = 12;

function toTitleCase(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

/**
 * Brand SEO copy from the CMS.
 *
 * cache() because generateMetadata and the page body both need it — without it
 * each render would hit the endpoint twice for the same brand.
 *
 * Not every brand has copy: /seo/brand/daikin answers 200 with empty strings, so
 * every consumer below treats a missing field as "render nothing" rather than
 * assuming it is there.
 */
const getBrandSeo = cache(async (slug: string) => {
  try {
    const res = await api.get<BrandSeoResponse>(`/seo/brand/${slug}`, {
      next: { revalidate: 300 },
    } as RequestInit);
    return res?.data ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brandName = toTitleCase(slug);
  const seo = await getBrandSeo(slug);

  // CMS copy wins where it exists; the generated strings below are only the
  // floor for brands the CMS has nothing for (e.g. Daikin returns all-empty).
  const title =
    seo?.title?.trim() ||
    `${brandName} Products — Buy Online at Best Price in Bangladesh`;
  const description =
    seo?.description?.trim() ||
    `Shop the complete ${brandName} collection at Dazzle. Best prices, official warranty, and fast delivery across Bangladesh.`;
  const ogTitle = seo?.title?.trim() || `${brandName} Products | Dazzle`;
  const ogDescription =
    seo?.description?.trim() ||
    `Browse ${brandName} products at Dazzle — Bangladesh's premium tech store.`;
  const canonical = seo?.canonical?.trim() || `/brands/${slug}`;
  // No brand artwork is fetched in this metadata pass, so this resolves to the
  // site default rather than shipping a preview with no image at all.
  const ogImage = DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    ...(seo?.keywords?.trim() ? { keywords: seo.keywords.trim() } : {}),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical.startsWith("http") ? canonical : absoluteUrl(canonical),
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage.url],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// No force-dynamic — categories are cached, initial products cached per brand.
// Filter/page changes are handled fully client-side via React Query (no SSR re-render).

export default async function BrandDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { fromCategory } = await searchParams;
  const brandName = toTitleCase(slug);

  /*
   * Arriving from the mega menu ("Phones" → Apple) should open on that
   * category, not on everything the brand sells.
   *
   * `categorySlug` takes the TOP-LEVEL slug and expands to every sub-category
   * under it, which is what makes this a single request rather than a lookup
   * through the category tree: Apple + laptop returns 58, exactly the sum of its
   * four laptop sub-categories.
   *
   * Resolved here rather than on the client so the first paint is already
   * correct — a client-side correction would flash the unfiltered list first.
   */
  const requestedCategory = fromCategory?.trim() || null;

  // SSR fetch: categories (5 min cache) + page-1 all products (1 min cache) + brand attributes (5 min cache)
  // These give Google bots full content on first render → SEO intact
  const [catResult, prodResult, attrResult] = await Promise.allSettled([
    api.get<CategoryListResponse>(`/brands/${slug}/categories`, {
      next: { revalidate: 5 },
    }),
    api.get<ProductListResponse>(
      `/products?${new URLSearchParams({
        brandSlug: slug,
        page: "1",
        limit: String(LIMIT),
        ...(requestedCategory ? { categorySlug: requestedCategory } : {}),
      }).toString()}`,
      { next: { revalidate: 5 } },
    ),
    api.get<BrandAttributesResponse>(`/products/attributes?brandSlug=${slug}`, {
      next: { revalidate: 5 },
    }),
  ]);

  const categories: CategoryItem[] =
    catResult.status === "fulfilled" && Array.isArray(catResult.value?.data)
      ? catResult.value.data
      : [];

  let initialProductData: ProductListResponse =
    prodResult.status === "fulfilled" && prodResult.value?.data
      ? prodResult.value
      : {
          statusCode: 200,
          status: "success",
          found: false,
          count: 0,
          totalCount: 0,
          page: 1,
          limit: LIMIT,
          totalPages: 1,
          data: [],
        };

  // The brand may simply not stock that category (Apple + home-appliance is 0).
  // Falling back to All means dropping the filter AND refetching, otherwise the
  // page would say "All" while still showing the empty filtered result.
  let activeTopCategory = requestedCategory;
  if (requestedCategory && initialProductData.totalCount === 0) {
    activeTopCategory = null;
    try {
      initialProductData = await api.get<ProductListResponse>(
        `/products?${new URLSearchParams({
          brandSlug: slug,
          page: "1",
          limit: String(LIMIT),
        }).toString()}`,
        { next: { revalidate: 5 } },
      );
    } catch {
      // Keep the empty result — the list renders its own empty state.
    }
  }

  const attributes: AttributeGroup[] =
    attrResult.status === "fulfilled" && Array.isArray(attrResult.value?.data)
      ? attrResult.value.data
      : [];

  const priceData: any =
    attrResult.status === "fulfilled" ? attrResult.value?.priceData : undefined;

  // Same cached call generateMetadata made, so this costs nothing extra.
  const brandSeo = await getBrandSeo(slug);
  const brandSeoContent = brandSeo?.bottomContent?.trim() || "";

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
    { label: brandName, href: `/brands/${slug}` },
  ];

  return (
    <div className=" bg-[#fffbf6] dark:bg-[#2e2b28]">
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* BrandProducts renders category buttons + FilterSidebar + Suspense-wrapped product list */}
        <Suspense>
          <BrandProducts
            brandSlug={slug}
            categories={categories}
            attributes={attributes}
            priceData={priceData}
            initialProducts={initialProductData.data}
            initialTotalCount={initialProductData.totalCount}
            initialTotalPages={initialProductData.totalPages}
            initialTopCategory={activeTopCategory}
          />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start  relative">
          <div className="lg:col-span-3 md:block hidden"></div>
          <div className="lg:col-span-9">
            {brandSeoContent && (
              <section className="px-4 ">
                <div className="max-w-4xl">
                  <article
                    className="text-sm leading-relaxed text-[#222] dark:text-white
                           [&_h1]:text-[#222] [&_h1]:dark:text-white [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mt-6 [&_h1]:mb-3
                           [&_h2]:text-[#222] [&_h2]:dark:text-white [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3
                           [&_h3]:text-[#222] [&_h3]:dark:text-white [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-5 [&_h3]:mb-2
                           [&_h4]:text-[#222] [&_h4]:dark:text-white [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
                           [&_p]:text-[#222] [&_p]:dark:text-gray-300 [&_p]:mb-3
                           [&_li]:text-[#222] [&_li]:dark:text-gray-300 [&_li]:mb-1
                           [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                           [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                           [&_span]:text-[#222] [&_span]:dark:text-gray-300!
                           [&_strong]:text-[#222] [&_strong]:dark:text-white
                           [&_a]:text-[#CB843B] [&_a]:underline
                           [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
                           [&_table]:w-full [&_table]:border [&_table]:border-gray-200 [&_table]:dark:border-[#4a443f]
                           [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-[#4a443f] [&_td]:p-2
                           [&_td]:text-[#222] [&_td]:dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: brandSeoContent }}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
