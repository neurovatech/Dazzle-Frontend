/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";
import { ProductItem, ProductListResponse } from "@/app/(public)/categories/[categorySlug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllProductsProps {
  categorySlug: string;
  subCategorySlug?: string;
  currentPage: number;
  products: ProductItem[];           // SSR initial data
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
  selectedBrandSlug?: string | null; // brand tab filter from CategoriesProduct
  selectedAttributes?: string[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string | null;
  onClearFilter?: () => void;
}

const LIMIT = 12;

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1)  { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#6D3F0E] text-white"
                : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AllProducts({
  categorySlug,
  subCategorySlug,
  currentPage,
  products: ssrProducts,
  totalPages: ssrTotalPages,
  totalCount: ssrTotalCount,
  currentSort,
  currentSearch,
  selectedBrandSlug,
  selectedAttributes = [],
  minPrice,
  maxPrice,
  stockStatus,
  onClearFilter,
}: AllProductsProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(currentSearch);

  const hasFilter = Boolean(
    selectedBrandSlug ||
    selectedAttributes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    stockStatus !== null
  );

  // ── Client-side fetch when any filter or page change occurs ─────────────
  const { data: filterData, isLoading: filterLoading } = useQuery<ProductListResponse>({
    queryKey: [
      "category-filtered-products",
      categorySlug,
      subCategorySlug,
      selectedBrandSlug,
      selectedAttributes.join(","),
      minPrice,
      maxPrice,
      stockStatus,
      currentPage,
      currentSort,
      currentSearch,
    ],
    queryFn: () => {
      const p = new URLSearchParams({
        page:         String(currentPage),
        limit:        String(LIMIT),
        categorySlug,
      });
      if (subCategorySlug) p.set("subCategorySlug", subCategorySlug);
      if (selectedBrandSlug) p.set("brandSlug", selectedBrandSlug);
      if (selectedAttributes.length > 0) p.set("attributes", selectedAttributes.join(","));
      if (minPrice !== undefined) p.set("minDiscountedPrice", String(minPrice));
      if (maxPrice !== undefined) p.set("maxDiscountedPrice", String(maxPrice));
      if (stockStatus !== null && stockStatus !== undefined && stockStatus !== "") {
        p.set("stockStatus", stockStatus);
      }
      if (currentSort) p.set("sort", currentSort);
      if (currentSearch) p.set("search", currentSearch);

      return api.get<ProductListResponse>(`/products?${p.toString()}`);
    },
    enabled:   hasFilter || currentPage > 1,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ── Derived display values ─────────────────────────────────────
  const displayProducts = (hasFilter || currentPage > 1) ? (filterData?.data ?? [])      : ssrProducts;
  const displayTotal    = (hasFilter || currentPage > 1) ? (filterData?.totalCount ?? 0) : ssrTotalCount;
  const displayPages    = (hasFilter || currentPage > 1) ? (filterData?.totalPages ?? 1) : ssrTotalPages;
  const isLoading       = (hasFilter || currentPage > 1) && filterLoading && !filterData;

  // ── URL navigation ────────────────
  const navigate = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, val]) => {
      if (val === "") params.delete(key); else params.set(key, val);
    });
    if ("sort" in overrides || "search" in overrides) params.delete("page");
    if (params.get("page") === "1") params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (p: number) => {
    navigate({ page: String(p) });
  };

  const handleClearSearch = () => { setSearchInput(""); navigate({ search: "" }); };

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            Products of {subCategorySlug || categorySlug}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {displayTotal.toLocaleString()} products found
            {selectedBrandSlug && (
              <span className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] font-semibold">
                · {selectedBrandSlug}
              </span>
            )}
            {hasFilter && onClearFilter && (
              <button
                onClick={onClearFilter}
                className="ml-3 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && <ProductGridSkeleton />}

      {/* ── Empty state ── */}
      {!isLoading && displayProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-4xl">😔</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
          {hasFilter && onClearFilter && (
            <button onClick={onClearFilter} className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Show all products
            </button>
          )}
          {currentSearch && !hasFilter && (
            <button onClick={handleClearSearch} className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {!isLoading && displayProducts.length > 0 && (
        <>
          <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3">
            {displayProducts.map((product) => {
              const imgSrc        = product.thumbnails?.mediaFileUrl || NoImg.src;
              const price         = product.discountedPrice || product.regularPrice || 0;
              const originalPrice = product.regularPrice || 0;
              return (
                <ProductCard
                  key={product.productUuid}
                  productUuid={product.productUuid}
                  image={imgSrc}
                  title={product.productName}
                  price={price}
                  originalPrice={originalPrice}
                  discount={product.disRate || 0}
                  badge={product.productBadge || undefined}
                  inStock={!product.isTba}
                  isBestDeal={product.disRate > 0}
                  slug={product.productSlug || product.productUuid}
                />
              );
            })}
          </div>

          <Pagination page={currentPage} totalPages={displayPages} onPageChange={handlePageChange} />

          <p className="text-center text-xs text-gray-400 mt-3 mb-8">
            Page {currentPage} of {displayPages} — showing {displayProducts.length} of{" "}
            {displayTotal.toLocaleString()} products
          </p>
        </>
      )}
    </div>
  );
}

export default AllProducts;
