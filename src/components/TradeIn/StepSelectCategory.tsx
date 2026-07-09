"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";
import type { TradeInCategory } from "./tradeIn.types";

interface CategoryListResponse {
  found: boolean;
  data: TradeInCategory[];
}

interface Props {
  onSelect: (cat: TradeInCategory) => void;
}

export default function StepSelectCategory({ onSelect }: Props) {
  const { data, isLoading } = useQuery<CategoryListResponse>({
    queryKey: ["tradeIn-categories"],
    staleTime: 10 * 60 * 1000,
    queryFn:  () => api.get<CategoryListResponse>("categories?tradeIn=1"),
  });

  const categories = (data?.data ?? []).filter((c) => c.is_active && c.is_trade_in);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-6">
        Select category
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.uuid}
              onClick={() => onSelect(cat)}
              className="flex flex-col items-center justify-center gap-3 py-6 px-4 border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#6D3F0E] hover:shadow-md bg-white dark:bg-[#1e1c1a] transition-all duration-200 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.thumbnail_img || NoImg.src}
                alt={cat.category_name}
                className="w-16 h-16 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-[#6D3F0E] dark:group-hover:text-[#d4a97a] transition-colors">
                {cat.category_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
