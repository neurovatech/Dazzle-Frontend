"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import { ProductItem } from "@/app/(public)/categories/[categorySlug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllProductsProps {
  categorySlug: string;
  subCategorySlug?: string;
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
}

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

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
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
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
          <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">
            …
          </span>
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

// ─── Main Component ───────────────────────────────────────────────────────────

function AllProducts({
  currentPage,
  products,
  totalPages,
  totalCount,
  currentSort,
  currentSearch,
}: AllProductsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(currentSearch);

  // ── Push URL params → triggers server re-fetch ────────────────────────────
  const navigate = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset page when sort or search changes
    if ("sort" in overrides || "search" in overrides) {
      params.delete("page");
    }
    // Remove page=1 from URL (cleaner URL)
    if (params.get("page") === "1") params.delete("page");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (p: number) => navigate({ page: String(p) });
  const handleSortChange = (val: string) => navigate({ sort: val });
  const handleSearch = () => navigate({ search: searchInput.trim() });
  const handleClearSearch = () => {
    setSearchInput("");
    navigate({ search: "" });
  };

  return (
    <div className="w-full">
      {/* ── Header: title + count + controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            All Products
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount.toLocaleString()} products found
          </p>
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
              className="text-sm outline-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 w-36"
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
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-[#1E1B18] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Empty state ── */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products found.
          </p>
          {currentSearch && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {products.length > 0 && (
        <>
          <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3">
            {products.map((product) => {
              const imgSrc =
                product.thumbnails?.mediaFileUrl || NoImg.src;
              const price =
                product.discountedPrice || product.regularPrice || 0;
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
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <p className="text-center text-xs text-gray-400 mt-3 mb-8">
            Page {currentPage} of {totalPages} — showing {products.length} of{" "}
            {totalCount.toLocaleString()} products
          </p>
        </>
      )}
    </div>
  );
}

export default AllProducts;
