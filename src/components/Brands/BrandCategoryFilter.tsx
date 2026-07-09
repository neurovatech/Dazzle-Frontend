"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import type { ProductItem } from "@/app/(public)/brands/[slug]/page";

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`d-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#6D3F0E] text-white"
                : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >{p}</button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  brandSlug: string;
  activeCategoryUuid: string | null;
  currentPage: number;
  products: ProductItem[];
  totalCount: number;
  totalPages: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandCategoryFilter({
  activeCategoryUuid,
  currentPage,
  products,
  totalCount,
  totalPages,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const navigate = (categoryUuid: string | null, page: number) => {
    const qp = new URLSearchParams();
    if (page > 1)     qp.set("page", String(page));
    if (categoryUuid) qp.set("category", categoryUuid);
    const qs = qp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  console.log(products, "productData.data")
  return (
    <div>
      {/* Product count */}
      <p className="text-xs text-gray-400 mb-4">
        {totalCount.toLocaleString()} products found
        {activeCategoryUuid && (
          <button
            onClick={() => navigate(null, 1)}
            className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
          >
            Clear filter
          </button>
        )}
      </p>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products found in this category.
          </p>
          {activeCategoryUuid && (
            <button
              onClick={() => navigate(null, 1)}
              className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
            >
              Show all products
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {products.length > 0 && (
        <>
          <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2">
            {products.map((product) => {
              const imgSrc = product.thumbnails?.[0]?.mediaFile || NoImg.src;
              const price  = product.discountedPrice || product.regularPrice || 0;
              return (
                <ProductCard
                  key={product.productUuid}
                  image={imgSrc}
                  title={product.productName}
                  price={price}
                  originalPrice={product.regularPrice || 0}
                  discount={product.disRate || 0}
                  badge={product.productBadge || undefined}
                  inStock={!product.isTba}
                  isBestDeal={product.disRate > 0}
                  slug={product.productSlug || product.productUuid}
                />
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => navigate(activeCategoryUuid, p)}
          />

          <p className="text-center text-xs text-gray-400 mt-3 mb-8">
            Page {currentPage} of {totalPages} —{" "}
            {products.length} of {totalCount.toLocaleString()} products
          </p>
        </>
      )}
    </div>
  );
}
