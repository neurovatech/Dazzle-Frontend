import CategoriesProduct from "@/components/CategoriesPages/CategoriesProduct/CategoriesProduct";
import Banner from "@/components/CategoriesPages/CategoriesBanner/Banner";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import { ProductItem, ProductListResponse } from "@/app/(public)/categories/[categorySlug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; search?: string }>;
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
  const { categorySlug, subCategorySlug } = await params;
  const { page } = await searchParams;
  const categoryName = toTitleCase(categorySlug);
  const subCategoryName = toTitleCase(subCategorySlug);
  const currentPage = Number(page ?? 1);
  const pageLabel = currentPage > 1 ? ` — Page ${currentPage}` : "";

  return {
    title: `${subCategoryName} - ${categoryName}${pageLabel} - Buy Online at Best Price in Bangladesh | Dazzle`,
    description: `Shop the best selection of ${subCategoryName} in our ${categoryName} category at Dazzle. Best prices, official warranty, and fast delivery across Bangladesh.${currentPage > 1 ? ` Viewing page ${currentPage}.` : ""}`,
    alternates: {
      canonical: `/categories/${categorySlug}/${subCategorySlug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    },
    openGraph: {
      title: `${subCategoryName} - ${categoryName}${pageLabel} | Dazzle`,
      description: `Browse ${subCategoryName} products at Dazzle — Bangladesh's premium tech store.`,
      url: `/categories/${categorySlug}/${subCategorySlug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default async function SubCategoriesPage({ params, searchParams }: PageProps) {
  const { categorySlug, subCategorySlug } = await params;
  const { page, sort, search } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1));
  const categoryName = toTitleCase(categorySlug);
  const subCategoryName = toTitleCase(subCategorySlug);

  // ── Fetch products: /products?categorySlug=phones&subCategorySlug=iphone ──
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
  const queryParams = new URLSearchParams();
  queryParams.set("categorySlug", categorySlug);
  queryParams.set("subCategorySlug", subCategorySlug);

  const url = `/products?${queryParams.toString()}`;
  
  const res = await api.get<ProductListResponse>(url, { cache: "no-store" });
  
  console.log("[SubCategoriesPage] Fetching:", res); // ← check server logs
  if (res && typeof res === "object" && "data" in res) {
    productData = res;
  }
} catch (error) {
  console.error("Error fetching sub-category products:", error);
}

  // ── Breadcrumb ────────────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
    { label: subCategoryName, href: `/categories/${categorySlug}/${subCategorySlug}` },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <Banner />
      <CategoriesProduct
        categorySlug={categorySlug}
        subCategorySlug={subCategorySlug}
        currentPage={currentPage}
        products={productData.data}
        totalPages={productData.totalPages}
        totalCount={productData.totalCount}
        currentSort={sort ?? ""}
        currentSearch={search ?? ""}
      />
    </div>
  );
}