import type { Metadata } from "next";
import { Suspense } from "react";
import BrandProducts, { CategoryItem } from "@/components/Brands/BrandProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";

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
}

interface PageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brandName = toTitleCase(slug);
  return {
    title: `${brandName} Products — Buy Online at Best Price in Bangladesh | Dazzle`,
    description: `Shop the complete ${brandName} collection at Dazzle. Best prices, official warranty, and fast delivery across Bangladesh.`,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: `${brandName} Products | Dazzle`,
      description: `Browse ${brandName} products at Dazzle — Bangladesh's premium tech store.`,
      url: `/brands/${slug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// No force-dynamic — categories are cached, initial products cached per brand.
// Filter/page changes are handled fully client-side via React Query (no SSR re-render).

export default async function BrandDetailsPage({ params }: PageProps) {
  const { slug }    = await params;
  const brandName   = toTitleCase(slug);

  // SSR fetch: categories (5 min cache) + page-1 all products (1 min cache) + brand attributes (5 min cache)
  // These give Google bots full content on first render → SEO intact
  const [catResult, prodResult, attrResult] = await Promise.allSettled([
    api.get<CategoryListResponse>(`/brands/${slug}/categories`, {
      next: { revalidate: 300 }, // 5 min
    }),
    api.get<ProductListResponse>(
      `/products?${new URLSearchParams({
        brandSlug: slug,
        page:      "1",
        limit:     String(LIMIT),
      }).toString()}`,
      { next: { revalidate: 60 } } // 1 min
    ),
    api.get<BrandAttributesResponse>(`/products/attributes?brandSlug=${slug}`, {
      next: { revalidate: 300 }, // 5 min
    }),
  ]);

  const categories: CategoryItem[] =
    catResult.status === "fulfilled" && Array.isArray(catResult.value?.data)
      ? catResult.value.data
      : [];

  const initialProductData: ProductListResponse =
    prodResult.status === "fulfilled" && prodResult.value?.data
      ? prodResult.value
      : { statusCode: 200, status: "success", found: false, count: 0,
          totalCount: 0, page: 1, limit: LIMIT, totalPages: 1, data: [] };

  const attributes: AttributeGroup[] =
    attrResult.status === "fulfilled" && Array.isArray(attrResult.value?.data)
      ? attrResult.value.data
      : [];

  const breadcrumbItems = [
    { label: "Home",    href: "/" },
    { label: "Brands",  href: "/brands" },
    { label: brandName, href: `/brands/${slug}` },
  ];

  return (
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
          initialProducts={initialProductData.data}
          initialTotalCount={initialProductData.totalCount}
          initialTotalPages={initialProductData.totalPages}
        />
      </Suspense>
    </div>
  );
}
