/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AllProducts from "@/components/CategoriesPages/CategoriesProduct/AllProducts";
import FilterSidebar, {
  AttributeGroup,
  PriceData,
} from "@/components/share/FilterSidebar";
import { api } from "@/lib/api";
import { ProductItem } from "@/app/(public)/categories/[categorySlug]/page";
import type { BrandItem } from "@/app/(public)/categories/[categorySlug]/page";
import Banner from "@/components/CategoriesPages/CategoriesBanner/Banner";
import { SlidersHorizontal, X } from "lucide-react";
import dynamic from "next/dynamic";

// TrendingNowSectionCom will be passed as a prop from the Server Component
// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoriesProductProps {
  categorySlug: string;
  subCategorySlug?: string;
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
  brands?: BrandItem[];
  attributes?: AttributeGroup[];
  priceData?: PriceData;
  banners?: any;
  trendingNowSlot?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

function CategoriesProduct({
  categorySlug,
  subCategorySlug,
  currentPage,
  products,
  totalPages,
  totalCount,
  currentSort,
  currentSearch,
  brands = [],
  attributes = [],
  priceData,
  banners,
  trendingNowSlot,
}: CategoriesProductProps) {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") ?? null;
  const initialPage = Number(searchParams.get("page") ?? String(currentPage));
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
  const initialBrand = searchParams.get("brand") ?? null;

  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string | null>(
    initialBrand,
  );
  const [selectedAttributes, setSelectedAttributes] =
    useState<string[]>(initialAttributes);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [stockStatus, setStockStatus] = useState<string | null>(
    initialStockStatus,
  );
  const [activePage, setActivePage] = useState<number>(initialPage);
  const [currentAttributes, setCurrentAttributes] =
    useState<AttributeGroup[]>(attributes);
  const [currentPriceData, setCurrentPriceData] = useState<
    PriceData | undefined
  >(priceData);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [pendingSort, setPendingSort] = useState<string>(currentSort ?? "recommend");
  const productListRef = useRef<HTMLDivElement>(null);

  const closeFilterAndScroll = () => {
    setIsFilterOpen(false);
    setTimeout(() => {
      productListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

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
        if (categorySlug) queryParams.set("categorySlug", categorySlug);
        if (subCategorySlug)
          queryParams.set("subCategorySlug", subCategorySlug);
        if (selectedBrandSlug) queryParams.set("brandSlug", selectedBrandSlug);
        if (stockStatus !== null) queryParams.set("stockStatus", stockStatus);
        if (minPrice !== undefined)
          queryParams.set("minDiscountedPrice", String(minPrice));
        if (maxPrice !== undefined)
          queryParams.set("maxDiscountedPrice", String(maxPrice));

        const res = await api.get<{
          data: AttributeGroup[];
          priceData?: PriceData;
        }>(`/products/attributes?${queryParams.toString()}`, {
          cache: "no-store",
        });
        if (active && res) {
          if (Array.isArray(res.data)) setCurrentAttributes(res.data);
          if (res.priceData) setCurrentPriceData(res.priceData);
        }
      } catch (err) {
        console.error("Error fetching dynamic attributes:", err);
      }
    };

    fetchDynamicAttributes();
    return () => {
      active = false;
    };
  }, [
    categorySlug,
    subCategorySlug,
    selectedBrandSlug,
    stockStatus,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    const page = Number(searchParams.get("page") ?? String(currentPage));
    const attrs =
      searchParams.get("attributes")?.split(",").filter(Boolean) ?? [];
    const minP = searchParams.get("minDiscountedPrice")
      ? Number(searchParams.get("minDiscountedPrice"))
      : undefined;
    const maxP = searchParams.get("maxDiscountedPrice")
      ? Number(searchParams.get("maxDiscountedPrice"))
      : undefined;
    const stock = searchParams.get("stockStatus") ?? null;
    const brand = searchParams.get("brand") ?? null;

    setActivePage(page);
    setSelectedAttributes(attrs);
    setMinPrice(minP);
    setMaxPrice(maxP);
    setStockStatus(stock);
    setSelectedBrandSlug(brand);
  }, [searchParams, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePage(Number(params.get("page") ?? String(currentPage)));
      setSelectedAttributes(
        params.get("attributes")?.split(",").filter(Boolean) ?? [],
      );
      setMinPrice(
        params.get("minDiscountedPrice")
          ? Number(params.get("minDiscountedPrice"))
          : undefined,
      );
      setMaxPrice(
        params.get("maxDiscountedPrice")
          ? Number(params.get("maxDiscountedPrice"))
          : undefined,
      );
      setStockStatus(params.get("stockStatus") ?? null);
      setSelectedBrandSlug(params.get("brand") ?? null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentPage]);

  const handleBrandSelect = (brandSlug: string | null) => {
    setSelectedBrandSlug(brandSlug);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    if (brandSlug) {
      params.set("brand", brandSlug);
    } else {
      params.delete("brand");
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
    setSelectedBrandSlug(null);
    setSelectedAttributes([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setStockStatus(null);
    setActivePage(1);

    const params = new URLSearchParams(window.location.search);
    params.delete("brand");
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

  const handleApplySort = (sort: string) => {
    setPendingSort(sort);
    setActivePage(1);
    setIsSortOpen(false);

    const params = new URLSearchParams(window.location.search);
    if (sort && sort !== "recommend") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    params.delete("page");

    const newQueryString = params.toString();
    const newUrl = newQueryString
      ? `${window.location.pathname}?${newQueryString}`
      : window.location.pathname;

    window.history.pushState(null, "", newUrl);
  };

  return (
    <div>
      {/* ── Brand filter tabs ── */}
      {brands.length > 0 && (
        <div className="md:px-12.5 px-4 mt-1 flex flex-row md:flex-wrap flex-nowrap gap-2 overflow-x-auto md:overflow-visible py-2 scrollbar-hide">
          {/* All tab */}
          <button
            onClick={() => handleBrandSelect(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              selectedBrandSlug === null
                ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                : "bg-white dark:bg-[#2a2420] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#6D3F0E] hover:text-[#6D3F0E]"
            }`}
          >
            All
          </button>

          {brands.map((brand) => {
            const isActive = selectedBrandSlug === brand.brand_slug;
            return (
              <button
                key={brand.uuid}
                onClick={() =>
                  handleBrandSelect(isActive ? null : brand.brand_slug)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                    : "bg-white dark:bg-[#2a2420] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#6D3F0E] hover:text-[#6D3F0E]"
                }`}
              >
                {brand.brand_name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex md:px-12.5 px-4 pt-2 md:mt-[15px] flex-wrap items-center justify-between gap-3 md:pb-3 relative">
          <div className="md:hidden block">
            <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
              Products of{" "}
              <span className="capitalize">
                {" "}
                {subCategorySlug || categorySlug}{" "}
              </span>
            </h3>
            {/* <p className="text-xs text-gray-400 mt-0.5">
            {displayTotal.toLocaleString()} products found
            {selectedBrandSlug && (
              <span className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] font-semibold">
                · {selectedBrandSlug}
              </span>
            )}
          </p> */}
          </div>

           <div className="md:hidden flex items-center fixed gap-3 bg-[#6d3f0e] px-3 py-2 rounded-full mb-3 bottom-20 z-88 left-1/2 transform -translate-x-1/2 shadow-[0px_4px_19.9px_0px_#00000066]">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center  gap-1.5 rounded-xl text-sm font-semibold  dark:border-white/10 text-white dark:text-gray-300 shrink-0 bg-[#6d3f0e]"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>

          <span className="text-white"> | </span>

          <button
            onClick={() => { setPendingSort(currentSort ?? "recommend"); setIsSortOpen(true); }}
            className="md:hidden flex items-center gap-1.5 rounded-xl text-sm font-semibold dark:border-white/10 text-white dark:text-gray-300 shrink-0"
          >
            <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33333 11.6667H0L5 16.6667V0H3.33333V11.6667ZM8.33333 2.5V16.6667H10V5H13.3333L8.33333 0V2.5Z" fill="white"/>
            </svg>
            Sort
          </button>
        </div>
        </div>

      <Banner banners={banners} />

      {/* ── Products grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:mt-0 mt-2 items-stretch md:px-12.5 px-4 relative">
        <div className="lg:col-span-3 md:block hidden h-full">
          <div className="sticky overflow-y-auto scrollbar-hide w-full pb-4">
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
        </div>

        

       

        <div className="lg:col-span-9 h-full">
          {trendingNowSlot && (
            <div className="bg-[#EEEEEE] dark:bg-[#2a2420] rounded-lg py-6 px-3 mb-6">
              <div className="flex pb-4 md:px-4">
                <h1 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
                  Top Selling 
                </h1>
              </div>
              {trendingNowSlot}
            </div>
          )}

          {trendingNowSlot && (
            <div className="bg-[#6D3F0E] dark:bg-[#2a2420] rounded-lg py-6 px-3 mb-6">
              <div className="flex pb-4 md:px-4">
                <h1 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold transition-colors bg-linear-to-r from-white to-[#CB843B] text-transparent bg-clip-text hover:brightness-110 dark:text-white">
                  Running Offer
                </h1>
              </div>
              {trendingNowSlot}
            </div>
          )}

          {/* productList area  */}
          <div ref={productListRef} className="scroll-mt-4">
            <AllProducts
            categorySlug={categorySlug}
            subCategorySlug={subCategorySlug}
            currentPage={activePage}
            products={products}
            totalPages={totalPages}
            totalCount={totalCount}
            currentSort={currentSort}
            currentSearch={currentSearch}
            selectedBrandSlug={selectedBrandSlug}
            selectedAttributes={selectedAttributes}
            minPrice={minPrice}
            maxPrice={maxPrice}
            stockStatus={stockStatus}
            onClearFilter={handleClearFilters}
          />
          </div>
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-99 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={closeFilterAndScroll}
            />

            {/* Left Side Drawer */}
            <div className="relative w-[85%] max-w-[320px] h-full bg-white dark:bg-gray-900 shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Filter
                </h3>
                <button
                  onClick={closeFilterAndScroll}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="lg:p-4 overflow-y-auto flex-1">
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
            </div>
          </div>
        )}

        {/* ── Sort Modal ── */}
        {isSortOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsSortOpen(false)} />
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
                      {pendingSort === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-5 mt-4">
                <button
                  onClick={() => setPendingSort("recommend")}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  CLEAR ALL
                </button>
                <button
                  onClick={() => handleApplySort(pendingSort)}
                  className="flex-1 py-3.5 rounded-full bg-[#6D3F0E] text-white text-sm font-semibold"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesProduct;
