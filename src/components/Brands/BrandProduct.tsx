/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar, { AttributeGroup } from "@/components/share/FilterSidebar";
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
  attributes?: AttributeGroup[];
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
  attributes = [],
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") ?? null;
  const initialPage = Number(searchParams.get("page") ?? "1");
  const initialAttributes = searchParams.get("attributes")
    ? searchParams.get("attributes")!.split(",").filter(Boolean)
    : [];
  const initialMinPrice = searchParams.get("minDiscountedPrice")
    ? Number(searchParams.get("minDiscountedPrice"))
    : undefined;
  const initialMaxPrice = searchParams.get("maxDiscountedPrice")
    ? Number(searchParams.get("maxDiscountedPrice"))
    : undefined;
  const initialStockStatus = searchParams.get("stockStatus") ?? null;

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [activePage, setActivePage] = useState<number>(initialPage);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(initialAttributes);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [stockStatus, setStockStatus] = useState<string | null>(initialStockStatus);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state if browser navigation (back/forward) happens via next/navigation
  useEffect(() => {
    const category = searchParams.get("category") ?? null;
    const page = Number(searchParams.get("page") ?? "1");
    const attrs = searchParams.get("attributes")?.split(",").filter(Boolean) ?? [];
    const minP = searchParams.get("minDiscountedPrice")
      ? Number(searchParams.get("minDiscountedPrice"))
      : undefined;
    const maxP = searchParams.get("maxDiscountedPrice")
      ? Number(searchParams.get("maxDiscountedPrice"))
      : undefined;
    const stock = searchParams.get("stockStatus") ?? null;

    setActiveCategory(category);
    setActivePage(page);
    setSelectedAttributes(attrs);
    setMinPrice(minP);
    setMaxPrice(maxP);
    setStockStatus(stock);
  }, [searchParams]);

  // Sync state if browser navigation (back/forward) happens via browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get("category") ?? null);
      setActivePage(Number(params.get("page") ?? "1"));
      setSelectedAttributes(params.get("attributes")?.split(",").filter(Boolean) ?? []);
      setMinPrice(
        params.get("minDiscountedPrice")
          ? Number(params.get("minDiscountedPrice"))
          : undefined
      );
      setMaxPrice(
        params.get("maxDiscountedPrice")
          ? Number(params.get("maxDiscountedPrice"))
          : undefined
      );
      setStockStatus(params.get("stockStatus") ?? null);
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

  const handleToggleAttribute = (guid: string) => {
    const nextAttrs = selectedAttributes.includes(guid)
      ? selectedAttributes.filter((id) => id !== guid)
      : [...selectedAttributes, guid];

    setSelectedAttributes(nextAttrs);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    if (nextAttrs.length > 0) {
      params.set("attributes", nextAttrs.join(","));
    } else {
      params.delete("attributes");
    }
    params.delete("page");

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    params.set("minDiscountedPrice", String(min));
    params.set("maxDiscountedPrice", String(max));
    params.delete("page");

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
  };

  const handleStockStatusToggle = (status: string) => {
    const nextStatus = stockStatus === status ? null : status;
    setStockStatus(nextStatus);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    if (nextStatus !== null) {
      params.set("stockStatus", nextStatus);
    } else {
      params.delete("stockStatus");
    }
    params.delete("page");

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
  };

  const handleClearFilters = () => {
    setActiveCategory(null);
    setSelectedAttributes([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setStockStatus(null);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    params.delete("attributes");
    params.delete("minDiscountedPrice");
    params.delete("maxDiscountedPrice");
    params.delete("stockStatus");
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
      <div className="md:px-12.5 px-4 flex flex-row md:flex-wrap flex-nowrap gap-2 overflow-x-auto md:overflow-visible py-3 scrollbar-hide">
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
          <FilterSidebar
            attributes={attributes}
            selectedAttributes={selectedAttributes}
            onToggleAttribute={handleToggleAttribute}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            stockStatus={stockStatus}
            onStockStatusToggle={handleStockStatusToggle}
          />
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
              selectedAttributes={selectedAttributes}
              minPrice={minPrice}
              maxPrice={maxPrice}
              stockStatus={stockStatus}
              currentPage={activePage}
              onPageChange={handlePageChange}
              onClearFilter={handleClearFilters}
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
                <FilterSidebar
                  attributes={attributes}
                  selectedAttributes={selectedAttributes}
                  onToggleAttribute={handleToggleAttribute}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onPriceChange={handlePriceChange}
                  stockStatus={stockStatus}
                  onStockStatusToggle={handleStockStatusToggle}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
