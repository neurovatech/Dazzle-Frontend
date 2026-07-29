/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AllProducts from "@/components/CategoriesPages/CategoriesProduct/AllProducts";
import FilterSidebar, { AttributeGroup } from "@/components/share/FilterSidebar";
import { ProductItem } from "@/app/(public)/categories/[categorySlug]/page";
import type { BrandItem } from "@/app/(public)/categories/[categorySlug]/page";
import Banner from "@/components/CategoriesPages/CategoriesBanner/Banner";
import { SlidersHorizontal, X } from "lucide-react";

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
  banners?: any;
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
  banners,
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

  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string | null>(initialBrand);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(initialAttributes);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [stockStatus, setStockStatus] = useState<string | null>(initialStockStatus);
  const [activePage, setActivePage] = useState<number>(initialPage);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const page = Number(searchParams.get("page") ?? String(currentPage));
    const attrs = searchParams.get("attributes")?.split(",").filter(Boolean) ?? [];
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

      <Banner banners={banners} />

      {/* ── Products grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch md:px-12.5 px-4 relative">
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
          className="md:hidden flex items-center absolute right-4 gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-white dark:text-gray-300 shrink-0 bg-[#6d3f0e] w-[30%] mb-3"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>

        <div className="lg:col-span-9 h-full">
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

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Left Side Drawer */}
            <div className="relative w-[85%] max-w-[320px] h-full bg-white dark:bg-gray-900 shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Filter
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="lg:p-4 overflow-y-auto flex-1">
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
    </div>
  );
}

export default CategoriesProduct;
