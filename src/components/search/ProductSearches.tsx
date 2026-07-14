/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── API Response Types (আপনার JSON structure অনুযায়ী) ──
interface ProductDocument {
  id: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  categorySlug: string;
  thumbnailsUrl: string;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  isStockAvailable: boolean;
}

interface ProductHit {
  document: ProductDocument;
}

interface SearchApiResponse {
  found: number;
  hits: ProductHit[];
}

interface ProductSearchesProps {
  query?: string;
  onSelectCategory?: (category: string) => void;
  onSeeAll?: () => void;
}

export default function ProductSearches({
  query,
  onSelectCategory,
  onSeeAll,
}: ProductSearchesProps) {
  // ক্যাটাগরি সিলেক্ট করলে সেই slug এখানে সেভ হবে
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // query পরিবর্তন হলে আগের category selection রিসেট হবে
  useEffect(() => {
    setSelectedCategorySlug(null);
  }, [query]);

  const isCategoryMode = !!selectedCategorySlug;

  const { data, isLoading } = useQuery<SearchApiResponse>({
    queryKey: ["product-search", query, selectedCategorySlug],
    queryFn: () =>
      isCategoryMode
        ? api.get<SearchApiResponse>(
            `/product/search?categorySlug=${selectedCategorySlug}&page=1&perPage=20`
          )
        : api.get<SearchApiResponse>(
            `/product/search?keyword=${encodeURIComponent(query ?? "")}&page=1&perPage=20`
          ),
    enabled: isCategoryMode || !!query,
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.hits ?? [];
  const totalProducts = data?.found ?? 0;

  // ── categoryName ডুপ্লিকেট ছাড়া বের করা ──
  const categories = Array.from(
    new Map(
      products.map((p) => [
        p.document.categoryName,
        { name: p.document.categoryName, slug: p.document.categorySlug },
      ])
    ).values()
  );

  // ── একই ক্যাটাগরিতে দ্বিতীয়বার ক্লিক করলে টগল হয়ে ফিরে যাবে ──
  const handleCategoryClick = (slug: string, name: string) => {
    if (selectedCategorySlug === slug) {
      setSelectedCategorySlug(null);
      onSelectCategory?.("");
    } else {
      setSelectedCategorySlug(slug);
      onSelectCategory?.(name);
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;

  return (
    <div className="flex flex-col sm:flex-row h-full">
      {/* ── Left: Categories ── */}
      <div className="w-full sm:w-[220px] lg:w-[260px] shrink-0 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Categories</p>
        <div className="flex flex-col gap-2 items-start">
          {isLoading && (
            <p className="text-xs text-gray-400">Loading...</p>
          )}
          {!isLoading && categories.length === 0 && (
            <p className="text-xs text-gray-400">No categories found</p>
          )}
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => handleCategoryClick(cat.slug, cat.name)}
              className={`px-3 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors ${
                selectedCategorySlug === cat.slug
                  ? "border-[#D4A97A] text-[#b8864e] bg-[#D4A97A]/10"
                  : "text-gray-600 dark:text-white border-gray-200 hover:border-[#D4A97A] hover:text-[#b8864e]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Products ── */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Products</p>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
            Total Products: {totalProducts}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto">
          {isLoading && (
            <p className="text-xs text-gray-400 col-span-2">Loading...</p>
          )}
          {!isLoading && products.length === 0 && (
            <p className="text-xs text-gray-400 col-span-2">No products found</p>
          )}
          {products.map(({ document: product }) => (
            <Link
              key={product.id}
              href={`/product/${product.productSlug}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors group/prod border border-transparent hover:border-gray-100"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={product.thumbnailsUrl}
                  alt={product.productName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-700 dark:text-white font-medium truncate group-hover/prod:text-[#b8864e] transition-colors leading-snug">
                  {product.productName}
                </p>
                <p
                  className={`text-xs font-medium mt-0.5 ${
                    product.isStockAvailable ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {product.isStockAvailable ? "In Stock" : "Out of Stock"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  {product.regularPrice > product.discountedPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.regularPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* SEE ALL */}
        <div className="flex justify-end mt-3 shrink-0">
          <button
            onClick={onSeeAll}
            className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-200 dark:text-white rounded-xl hover:border-[#D4A97A] hover:text-[#b8864e] transition-colors"
          >
            SEE ALL
          </button>
        </div>
      </div>
    </div>
  );
}