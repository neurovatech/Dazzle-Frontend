"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/share/FilterSidebar";
import BrandProductListClient from "@/components/Brands/BrandProductListClient";
import type { ProductItem } from "@/app/(public)/brands/[slug]/page";

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandProducts({
  brandSlug,
  categories,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const currentCategorySlug = searchParams.get("category") ?? null;

  // Optimistic slug — highlights button instantly on click, no wait
  const [optimisticSlug, setOptimisticSlug] = useState(currentCategorySlug);
  useEffect(() => {
    setOptimisticSlug(currentCategorySlug);
  }, [currentCategorySlug]);

  const navigate = (categorySlug: string | null) => {
    setOptimisticSlug(categorySlug); // instant visual feedback
    const qp = new URLSearchParams();
    if (categorySlug) qp.set("category", categorySlug);
    const qs = qp.toString();
    // scroll: false — prevent page jump, React Query handles update
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      {/* ── Category filter buttons ── */}
      <div className="md:px-12.5 px-4 flex flex-row flex-wrap gap-2 overflow-x-auto py-3">
        {/* All */}
        <button
          onClick={() => navigate(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
            optimisticSlug === null
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
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                optimisticSlug === cat.category_slug
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

        <div className="lg:col-span-9">
          {/* React Query client list — filter/page changes never trigger SSR */}
          <Suspense>
            <BrandProductListClient
              brandSlug={brandSlug}
              initialProducts={initialProducts}
              initialTotalCount={initialTotalCount}
              initialTotalPages={initialTotalPages}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
