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


interface WebBannerItem {
  bannerUUID: string;
  imageURL: string;
  mediaInfo: string;
  openNewTab: boolean;
}

interface WebBannerResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: WebBannerItem[];
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

   let banners: WebBannerItem[] = [];


  // ── Fetch products: products?page=1&limit=12&categorySlug=phones&subCategorySlug=iphone ──
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
      subCategorySlug,
    });
    if (sort) queryParams.set("sort", sort);
    if (search) queryParams.set("search", search);

    const res = await api.get<ProductListResponse>(
      `/products?${queryParams.toString()}`,
      { cache: "no-store" }
    );
    if (res && typeof res === "object" && "data" in res) {
      productData = res;
    }
  } catch (error) {
    console.error("Error fetching sub-category products:", error);
  }

  try {
    const res = await api.get<WebBannerResponse>(
      "/web-banner/product-categores-page",
      { cache: "no-store" }
    );
    if (res && typeof res === "object" && "data" in res) {
      banners = res.data;
    }
  } catch (error) {
    console.error("Error fetching product category banners:", error);
  }

  if (!banners.length) return null;

  const [banner1, banner2] = banners;

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
      <Banner banners={banners} />
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
