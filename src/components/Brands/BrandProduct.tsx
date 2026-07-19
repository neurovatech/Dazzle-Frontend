/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/share/FilterSidebar";
import BrandProductListClient from "@/components/Brands/BrandProductListClient";
import { SlidersHorizontal, X } from "lucide-react";
// import type { ProductItem } from "@/app/(public)/brands/[slug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryItem {
  uuid: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
}

interface Props {
  brandSlug: string;
  categories: CategoryItem[];
  initialProducts: ProductItem[];
  initialTotalCount: number;
  initialTotalPages: number;
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandProducts({
  brandSlug,
  categories,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") ?? null;
  const initialPage = Number(searchParams.get("page") ?? "1");

  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory,
  );
  const [activePage, setActivePage] = useState<number>(initialPage);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state if browser navigation (back/forward) happens via next/navigation
  useEffect(() => {
    const category = searchParams.get("category") ?? null;
    const page = Number(searchParams.get("page") ?? "1");
    setActiveCategory(category);
    setActivePage(page);
  }, [searchParams]);

  // Sync state if browser navigation (back/forward) happens via browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get("category") ?? null);
      setActivePage(Number(params.get("page") ?? "1"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (categorySlug: string | null) => {
    setActiveCategory(categorySlug);
    setActivePage(1); // Reset page to 1 on category change

    const params = new URLSearchParams(window.location.search);
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    params.delete("page");

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);

    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ── Category filter buttons ── */}
      <div className="md:px-12.5 px-4 flex flex-row flex-nowrap gap-2 overflow-x-auto py-3 scrollbar-hide">
        {/* All */}
        <button
          onClick={() => navigate(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
            activeCategory === null
              ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
              : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#6D3F0E] hover:text-[#6D3F0E] dark:hover:text-[#d4a97a]"
          }`}
        >
          All
        </button>

        {/* Category buttons */}
        {categories
          .filter((c) => c.is_active)
          .map((cat) => (
            <button
              key={cat.uuid}
              onClick={() => navigate(cat.category_slug)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeCategory === cat.category_slug
                  ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                  : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#6D3F0E] hover:text-[#6D3F0E] dark:hover:text-[#d4a97a]"
              }`}
            >
              {cat.category_name}
            </button>
          ))}
      </div>

      {/* ── Sidebar + product list ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-start md:px-6.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-white dark:text-gray-300 shrink-0 bg-[#6d3f0e] w-[40%]"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>

        <div className="lg:col-span-9">
          {/* React Query client list — filter/page changes never trigger SSR */}
          <Suspense>
            <BrandProductListClient
              brandSlug={brandSlug}
              categorySlug={activeCategory ?? undefined}
              currentPage={activePage}
              onPageChange={handlePageChange}
              onClearFilter={() => navigate(null)}
              initialProducts={initialProducts}
              initialTotalCount={initialTotalCount}
              initialTotalPages={initialTotalPages}
            />
          </Suspense>
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Bottom sheet */}
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Filter
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <FilterSidebar />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
