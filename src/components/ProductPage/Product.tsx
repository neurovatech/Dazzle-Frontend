"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import ProductCard from "@/components/share/GlobalProductCard";
import FilterSidebar from "@/components/CategoriesPages/CategoriesProduct/FilterSidebar";
import NoImg from "@/images/no_images.png";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProductItem {
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

interface ProductListResponse {
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

// ─── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
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

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

// ─── Main Product Component ───────────────────────────────────────────────────

const LIMIT = 32;

function Product() {
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const token = useAppSelector((state) => state.auth.token);

  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  // ── Filter / Sort state ──
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Fetch products ──
  const { data, isLoading, isError } = useQuery<ProductListResponse>({
    queryKey: ["products", page, sort, search],
    queryFn: () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (sort) params.sort = sort;
      if (search) params.search = search;

      return api.get<ProductListResponse>("products", {
        params,
        ...(apiKey ? {
          headers: {
            "X-API-Key": apiKey,
            Authorization: authHeader,
          },
        } : {}),
      });
    },
    placeholderData: (prev) => prev, 
  });

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearch(searchInput.trim());
  }, [searchInput]);

  const handleSortChange = (val: string) => {
    setSort(val);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-start md:px-12.5 px-4 pb-12">
      {/* ── Sidebar ── */}
      <div className="lg:col-span-3 h-full md:block hidden">
        <FilterSidebar />
      </div>

      {/* ── Product area ── */}
      <div className="lg:col-span-9">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">All Products</h3>
            {!isLoading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {totalCount.toLocaleString()} products found
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-1.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-[#1E1B18]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products..."
                className="text-sm outline-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 w-40"
              />
              <button
                onClick={handleSearch}
                className="text-xs font-semibold text-[#6D3F0E] dark:text-[#d4a97a] hover:opacity-80 transition-opacity"
              >
                Go
              </button>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-[#1E1B18] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── States ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-[#6D3F0E] dark:text-[#d4a97a]" />
            <p className="text-sm text-gray-400">Loading products...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-red-500">Failed to load products. Please try again.</p>
            <button
              onClick={() => setPage(1)}
              className="text-xs px-4 py-2 rounded-xl bg-[#6D3F0E] text-white hover:bg-[#5a3409] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
            {search && (
              <button
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* ── Product grid ── */}
        {!isLoading && !isError && products.length > 0 && (
          <>
            <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
              {products.map((product) => {
                const imgSrc = product.thumbnails?.[0]?.mediaFile || NoImg.src;
                const price = product.discountedPrice || product.regularPrice || 0;
                const originalPrice = product.regularPrice || 0;

                return (
                  <ProductCard
                    key={product.productUuid}
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

            {/* ── Pagination ── */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            {/* Page info */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Page {page} of {totalPages} — showing {products.length} of {totalCount.toLocaleString()} products
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Product;
