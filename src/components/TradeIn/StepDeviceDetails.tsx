"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";
import TradeInBreadcrumb from "./TradeInBreadcrumb";
import type {
  TradeInConditionItem, TradeInVariantDetail,
  TradeInVariantResponse, TradeInSelection,
} from "./tradeIn.types";

interface Props {
  selection:         TradeInSelection;
  onConditionSelect: (condition: TradeInConditionItem) => void;
  onRemove:          (key: keyof TradeInSelection) => void;
}

export default function StepDeviceDetails({ selection, onConditionSelect, onRemove }: Props) {
  const variantUUID = selection.variant?.tradeVariantUuid ?? "";

  const [openConditionId, setOpenConditionId] = useState<number | null>(null);

  // ── Fetch variant detail + conditions + attributes ─────────────────────────
  const { data, isLoading } = useQuery<TradeInVariantResponse>({
    queryKey: ["tradein-variant", variantUUID],
    enabled: !!variantUUID,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      api.get<TradeInVariantResponse>(`tradein-variant?tradeVariantUUID=${variantUUID}`),
  });

  const variantDetail: TradeInVariantDetail | null = data?.data?.[0] ?? null;
  const conditions  = variantDetail?.tradeInConditions ?? [];
  const attributes  = variantDetail?.tradeInAttributes ?? [];

  const formatPrice = (p: number) => "৳" + p.toLocaleString("en-IN");

  // Auto-open first condition
  const activeId = openConditionId ?? conditions[0]?.ticId ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!variantDetail) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        Could not load variant details. Please go back and try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Selling your{" "}
          <span className="text-[#6D3F0E] dark:text-[#d4a97a]">
            {selection.brand?.brand_name} {variantDetail.variantName}
          </span>{" "}
          can bring you
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Our experts will evaluate the device for the correct condition at the time of the handover.
        </p>
      </div>

      {/* Breadcrumb */}
      <TradeInBreadcrumb selection={selection} onRemove={onRemove} />

      {/* Variant thumbnail + attributes */}
      <div className="flex items-start gap-4 mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variantDetail.thumbnailUrl || NoImg.src}
          alt={variantDetail.variantName}
          className="w-16 h-16 object-contain shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
            {variantDetail.variantName}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {attributes.flatMap((attr) =>
              attr.items.map((item) => (
                <span
                  key={item.tradeInAttrId}
                  className="text-xs bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {item.attributes}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Condition accordions — from API tradeInConditions */}
      <div className="space-y-3">
        {conditions.map((cond) => {
          const isOpen = activeId === cond.ticId;
          return (
            <div key={cond.ticId} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenConditionId(isOpen ? null : cond.ticId)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-[#1e1c1a] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white">{cond.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#6D3F0E] dark:text-[#d4a97a] font-bold">
                    {formatPrice(cond.devicePrice)}
                  </span>
                  {isOpen
                    ? <ChevronDown size={16} className="text-gray-400" />
                    : <ChevronRight size={16} className="text-gray-400" />
                  }
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 bg-white dark:bg-[#1e1c1a] border-t border-gray-100 dark:border-white/5">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {cond.condition}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA — mobile sticky + desktop inline */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1c1a] border-t border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between z-40 lg:hidden">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
          {selection.brand?.brand_name} {variantDetail.variantName}
        </span>
        <button
          onClick={() => {
            const active = conditions.find((c) => c.ticId === activeId) ?? conditions[0];
            if (active) onConditionSelect(active);
          }}
          className="px-6 py-2.5 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
        >
          Trade-In now
        </button>
      </div>

      <div className="hidden lg:flex justify-end mt-6">
        <button
          onClick={() => {
            const active = conditions.find((c) => c.ticId === activeId) ?? conditions[0];
            if (active) onConditionSelect(active);
          }}
          className="px-8 py-3 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
        >
          Trade-In now
        </button>
      </div>
    </div>
  );
}
