/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Image from "next/image";
import AllProducts from "@/components/CategoriesPages/CategoriesProduct/AllProducts";
import FilterSidebar from "./FilterSidebar";
import { ProductItem } from "@/app/(public)/categories/[categorySlug]/page";
import type { BrandItem } from "@/app/(public)/categories/[categorySlug]/page";
import Banner from "@/components/CategoriesPages/CategoriesBanner/Banner";

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
  banners
}: CategoriesProductProps) {
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string | null>(null);

  return (
    <div>
      {/* ── Brand filter tabs ── */}
      {brands.length > 0 && (
        <div className="md:px-12.5 px-4 mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* All tab */}
            <button
              onClick={() => setSelectedBrandSlug(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
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
                    setSelectedBrandSlug(
                      isActive ? null : brand.brand_slug
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    isActive
                      ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                      : "bg-white dark:bg-[#2a2420] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#6D3F0E] hover:text-[#6D3F0E]"
                  }`}
                >
                  {/* {brand.thumbnail_img && (
                    <div className="relative w-4 h-4 rounded-full overflow-hidden bg-white shrink-0">
                      <Image
                        src={brand.thumbnail_img}
                        alt={brand.brand_name}
                        fill
                        sizes="16px"
                        className="object-contain"
                      />
                    </div>
                  )} */}
                  {brand.brand_name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Banner banners={banners} />

      {/* ── Products grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-9 h-full">
          <AllProducts
            categorySlug={categorySlug}
            subCategorySlug={subCategorySlug}
            currentPage={currentPage}
            products={products}
            totalPages={totalPages}
            totalCount={totalCount}
            currentSort={currentSort}
            currentSearch={currentSearch}
            selectedBrandSlug={selectedBrandSlug}
          />
        </div>
      </div>
    </div>
  );
}

export default CategoriesProduct;
