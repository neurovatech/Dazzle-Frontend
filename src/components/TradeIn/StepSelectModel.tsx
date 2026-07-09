"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";
import TradeInBreadcrumb from "./TradeInBreadcrumb";
import type {
  TradeInDevice, TradeInVariantSummary,
  TradeInListResponse, TradeInSelection,
} from "./tradeIn.types";

const LIMIT = 10;

interface Props {
  selection: TradeInSelection;
  onSelectVariant: (device: TradeInDevice, variant: TradeInVariantSummary) => void;
  onRemove:        (key: keyof TradeInSelection) => void;
}

function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {page} / {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function StepSelectModel({ selection, onSelectVariant, onRemove }: Props) {
  const [page, setPage] = useState(1);

  const brandUUID    = selection.brand?.uuid ?? "";
  const categoryUUID = selection.category?.uuid ?? "";

  const { data, isLoading } = useQuery<TradeInListResponse>({
    queryKey: ["tradein-devices", brandUUID, categoryUUID, page],
    enabled: !!brandUUID && !!categoryUUID,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      api.get<TradeInListResponse>(
        `tradein?brandUUID=${brandUUID}&categoryUUID=${categoryUUID}&page=${page}&limit=${LIMIT}`
      ),
  });

  const devices    = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
        Select model
      </h2>

      <TradeInBreadcrumb selection={selection} onRemove={onRemove} />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && devices.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No devices found for this brand and category.
        </div>
      )}

      {/* Device list — each device may have multiple variants */}
      {!isLoading && devices.length > 0 && (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.tradeInUuid}>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {device.deviceName}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {device.tradeVariants.map((variant) => (
                  <button
                    key={variant.tradeVariantUuid}
                    onClick={() => onSelectVariant(device, variant)}
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#6D3F0E] hover:shadow-md bg-white dark:bg-[#1e1c1a] transition-all duration-200 group text-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variant.thumbnailUrl || NoImg.src}
                      alt={variant.variantName}
                      className="w-14 h-14 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#6D3F0E] dark:group-hover:text-[#d4a97a] transition-colors">
                      {variant.variantName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </div>
      )}
    </div>
  );
}
