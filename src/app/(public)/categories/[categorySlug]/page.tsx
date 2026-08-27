/* eslint-disable @typescript-eslint/no-explicit-any */
import CategoriesProductWithTopSale from "@/components/CategoriesPages/CategoriesProduct/CategoriesProductWithTopSale";
import Breadcrumb from "@/components/share/Breadcrumb";
import ProductListSectionCom from "@/components/HomePage/ProductList/ProductListSectionCom";
import { api } from "@/lib/api";
import type { AttributeGroup } from "@/components/share/FilterSidebar";
import type { Metadata } from "next";
import { lookupCategoryNames, toTitleCase } from "@/lib/category-lookup";
import { SITE_NAME, OG_LOCALE, buildOgImage, absoluteUrl } from "@/lib/seo-config";
import JsonLd from "@/components/share/JsonLd";
import { buildJsonLd, breadcrumbSchema, itemListSchema } from "@/lib/structured-data";

export type { AttributeGroup };

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; search?: string }>;
}

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

// ─── Brand types ──────────────────────────────────────────────────────────────

export interface BrandItem {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_active: boolean;
}

interface BrandsApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: {
    category: {
      uuid: string;
      category_name: string;
      category_slug: string;
      child: BrandItem[];
    }[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIMIT = 12;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  // Real category name from the API — falls back to the slug if unavailable.
  const { categoryName = toTitleCase(categorySlug), categoryImage } =
    await lookupCategoryNames(categorySlug);
  const currentPage = Number(page ?? 1);
  const pageLabel = currentPage > 1 ? ` — Page ${currentPage}` : "";

  const ogTitle = `${categoryName} Products${pageLabel} | Dazzle`;
  const ogDescription = `Browse ${categoryName} products at Dazzle — Bangladesh's premium tech store.`;
  const ogImage = buildOgImage(categoryImage, categoryName);

  return {
    title: `${categoryName}${pageLabel} - Buy Online at Best Price in Bangladesh`,
    description: `Shop the complete ${categoryName} collection at Dazzle. Explore all ${categoryName} products with the best prices, official warranty, and fast delivery across Bangladesh.${currentPage > 1 ? ` Viewing page ${currentPage}.` : ""}`,
    alternates: {
      canonical: `/categories/${categorySlug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      // Absolute URL: relative og:url resolves inconsistently across scrapers.
      url: absoluteUrl(`/categories/${categorySlug}`),
      // Restated because Next.js replaces (not merges) the parent openGraph.
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

export default async function CategoriesPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug } = await params;
  const { page, sort, search } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1));
  const { categoryName = toTitleCase(categorySlug) } =
    await lookupCategoryNames(categorySlug);

  // ── Fetch products: products?page=1&limit=12&categorySlug=phones ─────────────
  const defaultProductData: ProductListResponse = {
    statusCode: 200,
    status: "success",
    found: false,
    count: 0,
    totalCount: 0,
    page: currentPage,
    limit: LIMIT,
    totalPages: 1,
    data: [],
  };

  async function fetchProducts(): Promise<ProductListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
        categorySlug,
      });
      if (sort) queryParams.set("sort", sort);
      if (search) queryParams.set("search", search);

      const res = await api.get<ProductListResponse>(
        `/products?${queryParams.toString()}`,
        { next: { revalidate: 60 } },
      );
      if (res && typeof res === "object" && "data" in res) {
        return res;
      }
      return defaultProductData;
    } catch (error) {
      console.error("Error fetching category products:", error);
      return defaultProductData;
    }
  }

  // ── Fetch brands for this category ───────────────────────────────────────────
  async function fetchBrands(): Promise<BrandItem[]> {
    try {
      const brandsRes = await api.get<BrandsApiResponse>(
        `/categories/${categorySlug}/brands`,
        { next: { revalidate: 60 } },
      );
      const categoryData = brandsRes?.data?.category;
      if (Array.isArray(categoryData) && categoryData.length > 0) {
        return (categoryData[0].child ?? []).filter((b) => b.is_active);
      }
      return [];
    } catch (err) {
      console.error("Error fetching category brands:", err);
      return [];
    }
  }

  // ── Fetch attributes for this category ───────────────────────────────────────
  async function fetchAttributes(): Promise<{ attributes: AttributeGroup[]; priceData: any }> {
    try {
      const attrRes = await api.get<{ data: AttributeGroup[]; priceData?: any }>(
        `/products/attributes?categorySlug=${categorySlug}`,
        { next: { revalidate: 60 } },
      );
      return {
        attributes: attrRes && Array.isArray(attrRes.data) ? attrRes.data : [],
        priceData: attrRes && attrRes.priceData ? attrRes.priceData : undefined,
      };
    } catch (err) {
      console.error("Error fetching category attributes:", err);
      return { attributes: [], priceData: undefined };
    }
  }

  const [productData, brands, { attributes, priceData }] = await Promise.all([
    fetchProducts(),
    fetchBrands(),
    fetchAttributes(),
  ]);

  // ── Breadcrumb ────────────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
  ];

  const jsonLd = buildJsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Categories", path: "/categories" },
      { name: categoryName, path: `/categories/${categorySlug}` },
    ]),
    itemListSchema(productData.data, `${categoryName} Products`),
  );

  return (
    <div className=" bg-[#fffbf6] dark:bg-[#2e2b28]">
      <JsonLd id="ld-category" data={jsonLd} />
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <CategoriesProductWithTopSale
          categorySlug={categorySlug}
          currentPage={currentPage}
          products={productData.data}
          totalPages={productData.totalPages}
          totalCount={productData.totalCount}
          currentSort={sort ?? ""}
          currentSearch={search ?? ""}
          brands={brands}
          attributes={attributes}
          priceData={priceData}
          topSellingSlot={<ProductListSectionCom showcaseSlug="top-selling" />}
          runningOfferSlot={<ProductListSectionCom showcaseSlug="running-offer" />}
        />
      </div>
    </div>
  );
}
