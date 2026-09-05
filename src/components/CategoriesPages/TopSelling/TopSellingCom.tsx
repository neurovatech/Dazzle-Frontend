"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import TrendingNow from "@/components/HomePage/TrendingNow/TrendingNow";
import type { ProductCardItem } from "@/components/HomePage/TrendingNow/TrendingNowSectionCom";

interface ShowcaseItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string };
}
interface ShowcaseItemsResponse {
  data: ShowcaseItem[];
}

function mapItems(data: ShowcaseItem[]): ProductCardItem[] {
  return data.map((item) => ({
    uuid:          item.productUuid,
    title:         item.productName,
    slug:          item.productSlug,
    price:         item.discountedPrice,
    originalPrice: item.regularPrice,
    discount:      Math.round(item.disRate),
    badge:         item.productBadge,
    isBestDeal:    false,
    inStock:       !item.isTba,
    image:         item.thumbnails?.mediaFileUrl ?? "",
  }));
}

export default function TopSellingCom() {
  const { data, isLoading } = useQuery<ProductCardItem[]>({
    queryKey: ["showcase-top-selling"],
    staleTime: 15 * 60 * 1000, // 15 mins cache validity
    gcTime: 60 * 60 * 1000,    // Keep in garbage collection 1 hour
    refetchOnWindowFocus: false, // Never refetch when switching tabs
    refetchOnReconnect: false,
    queryFn: async () => {
      const res = await api.get<ShowcaseItemsResponse>(
        "/showcase-items?showcaseSlug=top-selling",
        { cache: "no-store" }
      );
      return mapItems(Array.isArray(res?.data) ? res.data : []);
    },
  });

  const products = data ?? [];

  // If loading finished and there are no products, hide the component completely
  if (!isLoading && products.length === 0) return null;

  return (
    <div className="bg-[#EEEEEE] dark:bg-[#2a2420] rounded-lg py-3 px-3 mb-6">
      <div className="flex pb-4 md:px-4">
        <h1 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Top Selling
        </h1>
      </div>
      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-[#3a3330] rounded-2xl h-[220px]" />
          ))}
        </div>
      ) : (
        <TrendingNow products={products} />
      )}
    </div>
  );
}
