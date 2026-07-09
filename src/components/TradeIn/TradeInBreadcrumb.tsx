"use client";

import { X } from "lucide-react";
import type { TradeInSelection } from "./tradeIn.types";

interface Props {
  selection: TradeInSelection;
  onRemove: (key: keyof TradeInSelection) => void;
}

export default function TradeInBreadcrumb({ selection, onRemove }: Props) {
  const chips: { key: keyof TradeInSelection; label: string }[] = [];

  if (selection.category) chips.push({ key: "category", label: selection.category.category_name });
  if (selection.brand)    chips.push({ key: "brand",    label: selection.brand.brand_name });
  if (selection.device)   chips.push({ key: "device",   label: selection.device.deviceName });
  if (selection.variant)  chips.push({ key: "variant",  label: selection.variant.variantName });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm px-3 py-1.5 rounded-full"
        >
          {label}
          <button
            onClick={() => onRemove(key)}
            className="hover:text-red-500 transition-colors"
            aria-label={`Remove ${label}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
