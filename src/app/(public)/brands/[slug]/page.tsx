import type { Metadata } from "next";
import BrandProduct from "@/components/Brands/BrandProduct";
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
  thumbnails: { mediaFile: string }[] | null;
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

interface PageProps {
  params: Promise<{ slug: string }>;
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

// ─── Metadata (SEO + pagination) ──────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const brandName = toTitleCase(slug);
  const currentPage = Number(page ?? 1);
  const pageLabel = currentPage > 1 ? ` — Page ${currentPage}` : "";

  return {
    title: `${brandName} Products${pageLabel} — Buy Online at Best Price in Bangladesh | Dazzle`,
    description: `Shop the complete ${brandName} collection at Dazzle. Explore all ${brandName} products with the best prices, official warranty, and fast delivery across Bangladesh.${currentPage > 1 ? ` Viewing page ${currentPage}.` : ""}`,
    alternates: {
      canonical: `/brands/${slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    },
    openGraph: {
      title: `${brandName} Products${pageLabel} | Dazzle`,
      description: `Browse ${brandName} products at Dazzle — Bangladesh's premium tech store.`,
      url: `/brands/${slug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default async function BrandDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page, sort, search } = await searchParams;

  const currentPage = Math.max(1, Number(page ?? 1));

  // ── 1. Get authoritative brand name ──────────────────────────────────────────
  const brandName = toTitleCase(slug);
  console.log(slug, "brandName")
  // ── 2. Fetch products for current page ───────────────────────────────────────
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
      brandSlug: slug,
      page: String(currentPage),
      limit: String(LIMIT),
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
    console.error("Error fetching brand products:", error);
  }

  // ── 3. Breadcrumb ────────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
    { label: brandName, href: `/brands/${slug}` },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <BrandProduct
        brandSlug={slug}
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