/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { Suspense } from "react";
import BrandProducts, { CategoryItem } from "@/components/Brands/BrandProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import { SITE_NAME, OG_LOCALE, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo-config";

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brandName = toTitleCase(slug);
  const ogTitle = `${brandName} Products | Dazzle`;
  const ogDescription = `Browse ${brandName} products at Dazzle — Bangladesh's premium tech store.`;
  // No brand artwork is fetched in this metadata pass, so this resolves to the
  // site default rather than shipping a preview with no image at all.
  const ogImage = DEFAULT_OG_IMAGE;

  return {
    title: `${brandName} Products — Buy Online at Best Price in Bangladesh`,
    description: `Shop the complete ${brandName} collection at Dazzle. Best prices, official warranty, and fast delivery across Bangladesh.`,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: absoluteUrl(`/brands/${slug}`),
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

export default async function BrandDetailsPage({ params, searchParams }: PageProps) {
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
      </div>
    </div>
  );
}
