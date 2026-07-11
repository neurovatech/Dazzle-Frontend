"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/share/GlobalProductCard";
import ProductGridSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";
// import type { ProductItem, ProductListResponse } from "@/app/(public)/brands/[slug]/page";

const LIMIT = 12;
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
// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`d-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#6D3F0E] text-white"
                : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >{p}</button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  brandSlug: string;
  categorySlug?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onClearFilter: () => void;
  initialProducts: ProductItem[];
  initialTotalCount: number;
  initialTotalPages: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandProductListClient({
  brandSlug,
  categorySlug,
  currentPage,
  onPageChange,
  onClearFilter,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const { data, isLoading, isPlaceholderData } = useQuery<ProductListResponse>({
    queryKey:        ["brand-products", brandSlug, categorySlug, currentPage],
    staleTime:       2 * 60 * 1000,
    placeholderData: (prev) => prev,
    initialData:     !categorySlug && currentPage === 1 ? {
      statusCode: 200, status: "success", found: true,
      count: initialProducts.length, totalCount: initialTotalCount,
      page: 1, limit: LIMIT, totalPages: initialTotalPages,
      data: initialProducts,
    } : undefined,
    queryFn: () => {
      const qp = new URLSearchParams({ brandSlug, page: String(currentPage), limit: String(LIMIT) });
      if (categorySlug) qp.set("subCategorySlug", categorySlug);
      return api.get<ProductListResponse>(`/products?${qp.toString()}`);
    },
  });

  const products   = data?.data       ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

console.log(products, "productsproductsproductsproductsproductsproductsproductsproductsproductsproducts")

  return (
    <div>
      {/* Count + clear */}
      <p className="text-xs text-gray-400 mb-4 h-4">
        {!isLoading && `${totalCount.toLocaleString()} products found`}
        {!isLoading && categorySlug && (
          <button onClick={onClearFilter}
            className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
          >Clear filter</button>
        )}
      </p>

      {/* ── First load: full skeleton grid ── */}
      {isLoading && <ProductGridSkeleton count={LIMIT} cols="4" />}

      {/* ── Filter/page change: skeleton overlaid on dimmed old cards ── */}
      {!isLoading && (
        <div className="relative">
          {isPlaceholderData && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <ProductGridSkeleton count={LIMIT} cols="4" />
            </div>
          )}
          <div className={`transition-opacity duration-150 ${isPlaceholderData ? "opacity-30" : "opacity-100"}`}>

            {/* Empty */}
            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
                {categorySlug && (
                  <button onClick={onClearFilter}
                    className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
                  >Show all products</button>
                )}
              </div>
            )}

            {/* Grid */}
            {products.length > 0 && (
              <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2">
                {products.map((product) => {
                  const price  = product.discountedPrice || product.regularPrice || 0;
                  return (
                    <ProductCard
                      key={product.productUuid}
                      productUuid={product.productUuid}
                      image={product.thumbnails?.mediaFileUrl || NoImg.src}
                      title={product.productName}
                      price={price}
                      originalPrice={product.regularPrice || 0}
                      discount={product.disRate || 0}
                      badge={product.productBadge || undefined}
                      inStock={!product.isTba}
                      isBestDeal={product.disRate > 0}
                      slug={product.productSlug || product.productUuid}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && (
        <>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          {products.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-3 mb-8">
              Page {currentPage} of {totalPages} — {products.length} of {totalCount.toLocaleString()} products
            </p>
          )}
        </>
      )}
    </div>
  );
}
