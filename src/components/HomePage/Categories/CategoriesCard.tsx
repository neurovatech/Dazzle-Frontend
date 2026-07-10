/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NoImg from "@/images/no_images.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  uuid: string;
  thumbnail_img: string;
  category_name: string;
  category_slug: string;
}

interface CategoriesCardProps {
  seeAllBtn?: boolean;
  categories?: CategoryItem[];
  totalPages?: number;
  currentPage?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmpty = (value: string | null | undefined): boolean =>
  !value || value.trim() === "";

// ─── Component ────────────────────────────────────────────────────────────────

function CategoriesCard({
  seeAllBtn = true,
  categories = [],
  totalPages = 1,
  currentPage = 1,
}: CategoriesCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="md:px-12.5 px-4">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <h1 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Categories
        </h1>
        {seeAllBtn && (
          <Link
            href="/categories"
            className="text-sm font-medium text-primary hover:underline hover:text-[#CB843B]! dark:text-white transition-colors duration-300"
          >
            See all
          </Link>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="py-4">
        
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
            {categories.map((item) => {
              const hasImage = !isEmpty(item.thumbnail_img);
              const hasName = !isEmpty(item.category_name);
              const hasSlug = !isEmpty(item.category_slug);

              const href = hasSlug
                ? `/categories/${item.category_slug}`
                : hasName
                  ? `/categories/${item.category_name.toLowerCase().replace(/\s+/g, "-")}`
                  : "/categories";

              return (
                <Link
                  key={item.uuid}
                  href={href}
                  className="flex flex-col justify-center items-center group cursor-pointer"
                >
                  <div className="bg-[#F5F5F5] dark:bg-[#CB843B]/10 dark:group-hover:bg-white/10 p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl sm:rounded-3xl lg:rounded-4xl transition-all duration-300 group-hover:bg-[#CB843B]/10 group-hover:scale-105">
                    <Image
                      src={hasImage ? item.thumbnail_img : NoImg}
                      width={100}
                      height={100}
                      alt={hasName ? item.category_name : "Category"}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-auto lg:h-auto transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          (NoImg as any).src ?? NoImg.toString();
                      }}
                    />
                  </div>
                  <h2 className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-primary pt-1 sm:pt-2 text-center transition-colors duration-300 group-hover:text-[#CB843B] line-clamp-2 leading-tight">
                    {hasName ? (
                      item.category_name
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        No name
                      </span>
                    )}
                  </h2>
                </Link>
              );
            })}
          </div>
      </div>

      {/* ── Pagination — only on full /categories page ── */}
      {!seeAllBtn && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-6 mt-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2E2E2E] hover:bg-[#CB843B]/10 dark:hover:bg-[#CB843B]/20 flex items-center justify-center disabled:opacity-30 transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            const show =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;
            const showEllipsisBefore =
              page === currentPage - 2 && currentPage - 2 > 1;
            const showEllipsisAfter =
              page === currentPage + 2 && currentPage + 2 < totalPages;

            if (showEllipsisBefore || showEllipsisAfter) {
              return (
                <span
                  key={`ellipsis-${i}`}
                  className="text-gray-400 dark:text-gray-500 text-sm px-1"
                >
                  …
                </span>
              );
            }
            if (!show) return null;

            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#CB843B] text-white scale-110"
                    : "bg-gray-100 dark:bg-[#2E2E2E] text-gray-700 dark:text-white hover:bg-[#CB843B]/20"
                }`}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2E2E2E] hover:bg-[#CB843B]/10 dark:hover:bg-[#CB843B]/20 flex items-center justify-center disabled:opacity-30 transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoriesCard;
