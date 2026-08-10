/* eslint-disable @typescript-eslint/no-explicit-any */
import CategoriesProduct from "@/components/CategoriesPages/CategoriesProduct/CategoriesProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
import ProductListSectionCom from "@/components/HomePage/ProductList/ProductListSectionCom";
import { api } from "@/lib/api";
import type { AttributeGroup } from "@/components/share/FilterSidebar";
import type { Metadata } from "next";

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

function toTitleCase(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  const categoryName = toTitleCase(categorySlug);
  const currentPage = Number(page ?? 1);
  const pageLabel = currentPage > 1 ? ` — Page ${currentPage}` : "";

  return {
    title: `${categoryName}${pageLabel} - Buy Online at Best Price in Bangladesh | Dazzle`,
    description: `Shop the complete ${categoryName} collection at Dazzle. Explore all ${categoryName} products with the best prices, official warranty, and fast delivery across Bangladesh.${currentPage > 1 ? ` Viewing page ${currentPage}.` : ""}`,
    alternates: {
      canonical: `/categories/${categorySlug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    },
    openGraph: {
      title: `${categoryName} Products${pageLabel} | Dazzle`,
      description: `Browse ${categoryName} products at Dazzle — Bangladesh's premium tech store.`,
      url: `/categories/${categorySlug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug } = await params;
  const { page, sort, search } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1));
  const categoryName = toTitleCase(categorySlug);

  // ── Fetch products: products?page=1&limit=12&categorySlug=phones ─────────────
  let productData: ProductListResponse = {
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
      { cache: "no-store" },
    );
    if (res && typeof res === "object" && "data" in res) {
      productData = res;
    }
  } catch (error) {
    console.error("Error fetching category products:", error);
  }

  // ── Fetch brands for this category ───────────────────────────────────────────
  let brands: BrandItem[] = [];
  try {
    const brandsRes = await api.get<BrandsApiResponse>(
      `/categories/${categorySlug}/brands`,
      { cache: "no-store" },
    );
    const categoryData = brandsRes?.data?.category;
    if (Array.isArray(categoryData) && categoryData.length > 0) {
      brands = (categoryData[0].child ?? []).filter((b) => b.is_active);
    }
  } catch (err) {
    console.error("Error fetching category brands:", err);
  }

  // ── Fetch attributes for this category ───────────────────────────────────────
  let attributes: AttributeGroup[] = [];
  let priceData: any = undefined;
  try {
    const attrRes = await api.get<{ data: AttributeGroup[]; priceData?: any }>(
      `/products/attributes?categorySlug=${categorySlug}`,
      { cache: "no-store" },
    );
    if (attrRes && Array.isArray(attrRes.data)) {
      attributes = attrRes.data;
    }
    if (attrRes && attrRes.priceData) {
      priceData = attrRes.priceData;
    }
  } catch (err) {
    console.error("Error fetching category attributes:", err);
  }

  // ── Breadcrumb ────────────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
  ];

  return (
    <div className=" bg-[#fffbf6] dark:bg-[#2e2b28]">
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <CategoriesProduct
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
          trendingNowSlot={<ProductListSectionCom />}
        />
      </div>
    </div>
  );
}
