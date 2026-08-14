/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar, { AttributeGroup, PriceData } from "@/components/share/FilterSidebar";
import BrandProductListClient from "@/components/Brands/BrandProductListClient";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";

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
  priceData?: PriceData;
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
  priceData,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const searchParams = useSearchParams();
  console.log(categories, "categories")

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<string>(
    searchParams.get("sort") ?? "recommend"
  );
  const [pendingSort, setPendingSort] = useState<string>(
    searchParams.get("sort") ?? "recommend"
  );

  // ── Pending filter states (mobile modal) ────────────────────────────────────
  const [pendingAttributes, setPendingAttributes] = useState<string[]>(initialAttributes);
  const [pendingMinPrice, setPendingMinPrice] = useState<number | undefined>(initialMinPrice);
  const [pendingMaxPrice, setPendingMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [pendingStockStatus, setPendingStockStatus] = useState<string | null>(initialStockStatus);
  const [filterApplyKey, setFilterApplyKey] = useState(0);

  const productListRef = useRef<HTMLDivElement>(null);

  const closeFilterAndScroll = () => {
    setIsFilterOpen(false);
    setTimeout(() => {
      productListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openFilterModal = () => {
    setPendingAttributes(selectedAttributes);
    setPendingMinPrice(minPrice);
    setPendingMaxPrice(maxPrice);
    setPendingStockStatus(stockStatus);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedAttributes(pendingAttributes);
    setMinPrice(pendingMinPrice);
    setMaxPrice(pendingMaxPrice);
    setStockStatus(pendingStockStatus);
    setActivePage(1);
    setFilterApplyKey(prev => prev + 1);

    const params = new URLSearchParams(window.location.search);
    if (pendingAttributes.length > 0) params.set("attributes", pendingAttributes.join(","));
    else params.delete("attributes");
    if (pendingMinPrice !== undefined) params.set("minDiscountedPrice", String(pendingMinPrice));
    else params.delete("minDiscountedPrice");
    if (pendingMaxPrice !== undefined) params.set("maxDiscountedPrice", String(pendingMaxPrice));
    else params.delete("maxDiscountedPrice");
    if (pendingStockStatus) params.set("stockStatus", pendingStockStatus);
    else params.delete("stockStatus");
    params.delete("page");

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState(null, "", newUrl);

    closeFilterAndScroll();
  };

  const handlePendingToggleAttribute = (value: string) => {
    setPendingAttributes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleClearPendingFilters = () => {
    setPendingAttributes([]);
    setPendingMinPrice(undefined);
    setPendingMaxPrice(undefined);
    setPendingStockStatus(null);
  };
  const [currentAttributes, setCurrentAttributes] = useState<AttributeGroup[]>(attributes);
  const [currentPriceData, setCurrentPriceData] = useState<PriceData | undefined>(priceData);

  useEffect(() => {
    setCurrentAttributes(attributes);
  }, [attributes]);

  useEffect(() => {
    setCurrentPriceData(priceData);
  }, [priceData]);

  useEffect(() => {
    let active = true;
    const fetchDynamicAttributes = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (brandSlug) queryParams.set("brandSlug", brandSlug);
        if (activeCategory) queryParams.set("categorySlug", activeCategory);
        if (stockStatus !== null) queryParams.set("stockStatus", stockStatus);
        if (minPrice !== undefined) queryParams.set("minDiscountedPrice", String(minPrice));
        if (maxPrice !== undefined) queryParams.set("maxDiscountedPrice", String(maxPrice));

        const res = await api.get<{ data: AttributeGroup[]; priceData?: PriceData }>(
          `/products/attributes?${queryParams.toString()}`,
          { cache: "no-store" }
        );
        if (active && res) {
          if (Array.isArray(res.data)) setCurrentAttributes(res.data);
          if (res.priceData) setCurrentPriceData(res.priceData);
        }
      } catch (err) {
        console.error("Error fetching brand dynamic attributes:", err);
      }
    };

    fetchDynamicAttributes();
    return () => {
      active = false;
    };
  }, [brandSlug, activeCategory, stockStatus, minPrice, maxPrice]);

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
    const sort = searchParams.get("sort") ?? "recommend";
    setCurrentSort(sort);
    setPendingSort(sort);
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
    // Normalize to avoid space/case mismatch
    const normalized = categorySlug ? categorySlug.trim() : null;
    setActiveCategory(normalized);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    if (normalized) {
      params.set("category", normalized);
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

  const handleToggleAttribute = (value: string) => {
    const nextAttrs = selectedAttributes.includes(value)
      ? selectedAttributes.filter((v) => v !== value)
      : [...selectedAttributes, value];

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

  const handleApplySort = () => {
    setCurrentSort(pendingSort);
    setActivePage(1);
    setIsSortOpen(false);

    const params = new URLSearchParams(window.location.search);
    params.delete("sort");
    params.delete("discountedPrice");
    params.delete("latest");
    params.delete("page");

    if (pendingSort === "newest") {
      params.set("sort", "newest");
    } else if (pendingSort === "price_asc") {
      params.set("sort", "price_asc");
    } else if (pendingSort === "price_desc") {
      params.set("sort", "price_desc");
    }

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
          .filter((c) => c.is_active && c.category_slug && c.category_slug.trim() !== "")
          .map((cat) => (
            <button
              key={cat.uuid}
              onClick={() => navigate(cat.category_slug)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeCategory === cat.category_slug.trim()
                  ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                  : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#6D3F0E] hover:text-[#6D3F0E] dark:hover:text-[#d4a97a]"
              }`}
            >
              {cat.category_name}
            </button>
          ))}
      </div>

      {/* ── Sidebar + product list ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-start md:px-6.5 px-4 relative">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar
            attributes={currentAttributes}
            priceData={currentPriceData}
            selectedAttributes={selectedAttributes}
            onToggleAttribute={handleToggleAttribute}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            stockStatus={stockStatus}
            onStockStatusToggle={handleStockStatusToggle}
          />
        </div>

        {/* Filter + Sort buttons — mobile only */}
        <div className="md:hidden flex items-center fixed gap-3 bg-[#6d3f0e] px-3 py-2 rounded-full mb-3 bottom-20 z-88 left-1/2 transform -translate-x-1/2 shadow-[0px_4px_19.9px_0px_#00000066]">
          <button
            onClick={openFilterModal}
            className="flex items-center gap-1.5 text-sm font-semibold text-white shrink-0"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>

          <span className="text-white/50">|</span>

          <button
            onClick={() => { setPendingSort(currentSort); setIsSortOpen(true); }}
            className="flex items-center gap-1.5 text-sm font-semibold text-white shrink-0"
          >
            <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33333 11.6667H0L5 16.6667V0H3.33333V11.6667ZM8.33333 2.5V16.6667H10V5H13.3333L8.33333 0V2.5Z" fill="white"/>
            </svg>
            Sort
          </button>
        </div>

        <div className="lg:col-span-9">
          {/* productList area */}
          <div ref={productListRef} className="scroll-mt-4">
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
              currentSort={currentSort}
              onPageChange={handlePageChange}
              onClearFilter={handleClearFilters}
              initialProducts={initialProducts}
              initialTotalCount={initialTotalCount}
              initialTotalPages={initialTotalPages}
              filterApplyKey={filterApplyKey}
            />
          </Suspense>
          </div>
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-99 md:hidden flex items-center justify-center p-4">
            {/* Glass backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={closeFilterAndScroll}
            />

            {/* Center Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#1c1a17] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[65vh]">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-white/10">
                <button onClick={closeFilterAndScroll} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#d4a97a] text-[#d4a97a]">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Filter</h3>
                <button onClick={closeFilterAndScroll} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300">
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 py-3">
                <FilterSidebar
                  attributes={currentAttributes}
                  priceData={currentPriceData}
                  selectedAttributes={pendingAttributes}
                  onToggleAttribute={handlePendingToggleAttribute}
                  minPrice={pendingMinPrice}
                  maxPrice={pendingMaxPrice}
                  onPriceChange={(min, max) => { setPendingMinPrice(min); setPendingMaxPrice(max); }}
                  stockStatus={pendingStockStatus}
                  onStockStatusToggle={(s) => setPendingStockStatus(prev => prev === s ? null : s)}
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-white/10">
                <button
                  onClick={handleClearPendingFilters}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  CLEAR ALL
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 rounded-full bg-[#6D3F0E] text-white text-sm font-semibold"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Sort Modal ── */}
        {isSortOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
            {/* Glass backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSortOpen(false)} />
            <div className="relative w-[90%] max-w-sm bg-white dark:bg-[#1c1a17] rounded-3xl shadow-2xl z-10 pb-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/10">
                <button onClick={() => setIsSortOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#d4a97a] text-[#d4a97a]">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Sort By</h3>
                <button onClick={() => setIsSortOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300">
                  <X size={16} />
                </button>
              </div>

              {/* Options */}
              <div className="divide-y divide-gray-100 dark:divide-white/5 px-5 mt-2">
                {[
                  { label: "Recommend", value: "recommend" },
                  { label: "Newest", value: "newest" },
                  { label: "Lowest - Highest", value: "price_asc" },
                  { label: "Highest - Lowest", value: "price_desc" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingSort(opt.value)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium text-gray-800 dark:text-white"
                  >
                    <span>{opt.label}</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      pendingSort === opt.value
                        ? "border-[#d4a97a] bg-[#d4a97a]"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {pendingSort === opt.value && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 px-5 mt-4">
                <button
                  onClick={() => { setPendingSort("recommend"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  CLEAR ALL
                </button>
                <button
                  onClick={handleApplySort}
                  className="flex-1 py-3.5 rounded-full bg-[#6D3F0E] text-white text-sm font-semibold"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
