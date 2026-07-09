"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";
import TradeInBreadcrumb from "./TradeInBreadcrumb";
import type { TradeInBrand, TradeInSelection } from "./tradeIn.types";

interface BrandListResponse {
  found: boolean;
  data: TradeInBrand[];
}

interface Props {
  selection: TradeInSelection;
  onSelect:  (brand: TradeInBrand) => void;
  onRemove:  (key: keyof TradeInSelection) => void;
}

export default function StepSelectBrand({ selection, onSelect, onRemove }: Props) {
  const { data, isLoading } = useQuery<BrandListResponse>({
    queryKey: ["tradeIn-brands"],
    staleTime: 10 * 60 * 1000,
    queryFn:  () => api.get<BrandListResponse>("brands?tradeIn=1"),
  });

  const brands = (data?.data ?? []).filter((b) => b.is_active && b.is_trade_in);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
        Select brand
      </h2>

      <TradeInBreadcrumb selection={selection} onRemove={onRemove} />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <button
              key={brand.uuid}
              onClick={() => onSelect(brand)}
              className="flex flex-col items-center justify-center gap-3 py-5 px-4 border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#6D3F0E] hover:shadow-md bg-white dark:bg-[#1e1c1a] transition-all duration-200 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.thumbnail_img || NoImg.src}
                alt={brand.brand_name}
                className="h-12 w-28 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#6D3F0E] dark:group-hover:text-[#d4a97a] transition-colors">
                {brand.brand_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
