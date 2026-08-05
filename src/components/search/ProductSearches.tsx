/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import { addRecentSearch } from "./RecentSearches";

// ── Search API types (keyword search — /product/search) ────────────
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
interface ProductHit { document: ProductDocument; }
interface SearchApiResponse { found: number; hits: ProductHit[]; }

// ── Products API types (category listing — /products?categorySlug) ──
interface ProductItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { mediaFileUrl?: string; mediafileUrl?: string } | { mediaFile: string }[] | null;
}
interface ProductListResponse {
  totalCount: number;
  data: ProductItem[];
}

// ── Normalised shape used in both screens ──────────────────────────
interface NormalizedProduct {
  id: string;
  productName: string;
  productSlug: string;
  thumbnailsUrl: string;
  regularPrice: number;
  discountedPrice: number;
  isStockAvailable: boolean;
}

interface ProductSearchesProps { query?: string; onClose?: () => void; }

const brands = [
  {
    name: "Apple",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  },
  {
    name: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60&h=60&fit=crop",
  },
  {
    name: "Smart-watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop",
  },
];

// ── Skeleton loader ─────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
          <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Product card (shared between both screens) ──────────────────────
function ProductRow({ product, onClose }: { product: NormalizedProduct; onClose?: () => void }) {
  const formatPrice = (p: number) => `৳${p.toLocaleString("en-BD")}`;
  return (
    <Link
      href={`/product/${product.productSlug}`}
      onClick={() => {
        addRecentSearch(product.productName);
        onClose?.();
      }}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors group/prod border border-transparent hover:border-gray-100"
    >
      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
        <Image
          src={product.thumbnailsUrl || "/images/no_images.png"}
          alt={product.productName}
          width={56}
          height={56}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-700 dark:text-white font-medium group-hover/prod:text-[#b8864e] transition-colors leading-snug">
          {product.productName}
        </p>
        <p className={`text-xs font-medium mt-0.5 ${product.isStockAvailable ? "text-green-500" : "text-red-500"}`}>
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
  );
}

// ── Helper: extract thumbnail URL from ProductItem ──────────────────
function getThumbnail(thumbnails: ProductItem["thumbnails"]): string {
  if (!thumbnails) return "";
  if (Array.isArray(thumbnails)) {
    return (thumbnails[0] as { mediaFile: string })?.mediaFile ?? "";
  }
  return (thumbnails as { mediaFileUrl?: string; mediafileUrl?: string }).mediaFileUrl
    ?? (thumbnails as { mediaFileUrl?: string; mediafileUrl?: string }).mediafileUrl
    ?? "";
}

// ── Main component ──────────────────────────────────────────────────
export default function ProductSearches({ query, onClose }: ProductSearchesProps) {
  const [selectedCategory, setSelectedCategory] = useState<{ slug: string; name: string } | null>(null);

  // Reset to Screen 1 whenever the search keyword changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [query]);

  const isCategoryMode = selectedCategory !== null;

  // Screen 1 — keyword search
  const keywordQuery = useQuery<SearchApiResponse>({
    queryKey: ["search-keyword", query],
    queryFn: () =>
      api.get<SearchApiResponse>(
        `/product/search?keyword=${encodeURIComponent(query ?? "")}&page=1&perPage=20`
      ),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  });

  // Screen 2 — category listing via /products?categorySlug=
  const categoryQuery = useQuery<ProductListResponse>({
    queryKey: ["search-category", selectedCategory?.slug],
    queryFn: () =>
      api.get<ProductListResponse>(
        `/products?categorySlug=${selectedCategory?.slug}&page=1&limit=50`
      ),
    enabled: isCategoryMode,
    staleTime: 5 * 60 * 1000,
  });

  // Unique categories from keyword results
  const categories = Array.from(
    new Map(
      (keywordQuery.data?.hits ?? []).map((p) => [
        p.document.categoryName,
        { name: p.document.categoryName, slug: p.document.categorySlug },
      ])
    ).values()
  );

  // Normalise keyword products
  const keywordProducts: NormalizedProduct[] = (keywordQuery.data?.hits ?? []).map((h) => ({
    id:               h.document.id,
    productName:      h.document.productName,
    productSlug:      h.document.productSlug,
    thumbnailsUrl:    h.document.thumbnailsUrl,
    regularPrice:     h.document.regularPrice,
    discountedPrice:  h.document.discountedPrice,
    isStockAvailable: h.document.isStockAvailable,
  }));

  // Normalise category products
  const categoryProducts: NormalizedProduct[] = (categoryQuery.data?.data ?? []).map((p) => ({
    id:               p.productUuid,
    productName:      p.productName,
    productSlug:      p.productSlug,
    thumbnailsUrl:    getThumbnail(p.thumbnails),
    regularPrice:     p.regularPrice,
    discountedPrice:  p.discountedPrice,
    isStockAvailable: !p.isTba,
  }));

  // ── Screen 2 — Category drill-down ─────────────────────────────
  if (isCategoryMode) {
    const loading  = categoryQuery.isLoading;
    const products = categoryProducts;
    const total    = categoryQuery.data?.totalCount ?? 0;

    return (
      <div className="flex flex-col sm:flex-row h-full">
        {/* Left panel */}
        <div className="w-full sm:w-[220px] lg:w-[200px] shrink-0 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1 text-sm font-semibold text-[#B57908] hover:text-[#9a6507] mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Categories</p>
          <button className="px-3 py-1.5 text-xs sm:text-sm border rounded-lg border-[#D4A97A] text-[#b8864e] bg-[#D4A97A]/10">
            {selectedCategory.name}
          </button>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ffffff]">Products</p>
            {!loading && (
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
                Total Products: {total}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto">
            {loading && <ProductSkeleton />}
            {!loading && products.length === 0 && (
              <p className="text-xs text-gray-400 col-span-2">No products found</p>
            )}
            {!loading && products.map((p) => <ProductRow key={p.id} product={p} onClose={onClose} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Screen 1 — Keyword results ──────────────────────────────────
  const loading  = keywordQuery.isLoading;
  const products = keywordProducts;
  const total    = keywordQuery.data?.found ?? 0;

  return (
    <div className="flex flex-col sm:flex-row h-full">
      {/* Left panel — categories */}
      <div className="w-full sm:w-[220px] lg:w-[200px] shrink-0 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Categories</p>
        <div className="flex flex-row flex-wrap gap-2 items-start sm:flex-col">
          {loading && (
            <div className="flex flex-row flex-wrap gap-2 w-full sm:flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {!loading && categories.length === 0 && (
            <p className="text-xs text-gray-400">No categories found</p>
          )}
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory({ slug: cat.slug, name: cat.name })}
              className="px-3 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors text-gray-600 dark:text-white border-gray-200 hover:border-[#D4A97A] hover:text-[#b8864e] dark:hover:border-[#D4A97A]"
            >
              {cat.name}
            </button>
          ))}
        </div>


        <p className="text-sm font-semibold text-gray-800 dark:text-white my-3">Choose From Brands</p>
        <div className="flex flex-wrap gap-x-4 gap-y-4">
          {brands.map((brand, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden hover:border-[#D4A97A] transition-colors">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain p-2"
                  unoptimized
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-white group-hover:text-[#b8864e] transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Right panel — keyword products */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-[#ffffff]">Products</p>
          {!loading && (
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
              Total Products: {total}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto">
          {loading && <ProductSkeleton />}
          {!loading && products.length === 0 && (
            <p className="text-xs text-gray-400 col-span-2">No products found</p>
          )}
          {!loading && products.map((p) => <ProductRow key={p.id} product={p} onClose={onClose} />)}
        </div>
      </div>
    </div>
  );
}
