"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { AddFileIcon, HandDollar } from "@/icon";

// ── Types ─────────────────────────────────────────────────────────
export interface CareOption {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  icon?: string;
  thumbnail?: string;
  salesOnRate?: number;
  warrantyDays?: number;
}

interface DazzleCareProps {
  options: CareOption[];
  /** Called whenever the selected care-option ID changes (null = deselected) */
  onSelectionChange?: (selectedIds: string[]) => void;
}

const formatPrice = (n: number) =>
  n > 0 ? "৳" + n.toLocaleString("en-US") : "Price on request";

const DazzleCare: React.FC<DazzleCareProps> = ({ options, onSelectionChange }) => {
  const [open, setOpen]       = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  if (!options || options.length === 0) return null;

  const handleSelect = (id: string) => {
    const next = selected === id ? null : id;   // click again → deselect
    setSelected(next);
    onSelectionChange?.(next ? [next] : []);
  };

  // ── Price of the selected option ──────────────────────────────
  const selectedOpt        = options.find((o) => o.id === selected) ?? null;
  const selectedOfferPrice = selectedOpt?.price ?? 0;
  const selectedOrigPrice  = selectedOpt?.originalPrice ?? 0;


  console.log(options, "optionsoptionsoptionsoptionsoptions")

  return (
    <div className="rounded-2xl bg-[#222222] border border-[#3a3330] overflow-hidden">
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#222222] hover:bg-[#2a2420] transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-white">
          <Shield size={17} className="text-orange-500" />
          Dazzle Care (Recommended)
        </div>
        {open ? (
          <ChevronUp size={17} className="text-gray-400" />
        ) : (
          <ChevronDown size={17} className="text-gray-400" />
        )}
      </button>

      {/* ── Options ── */}
      {open && (
        <div className="p-3 pt-0 space-y-2">
          {options.map((opt) => {
            const isSelected  = selected === opt.id;
            const hasSaving   = opt.price > 0 && opt.originalPrice > opt.price;
            const warrantyYrs = opt.warrantyDays
              ? opt.warrantyDays >= 365
                ? `${Math.round(opt.warrantyDays / 365)} Year`
                : `${opt.warrantyDays} Days`
              : null;

            return (
              <label
                key={opt.id}
                className={`flex items-start gap-3 px-3 py-1.5 cursor-pointer rounded-2xl bg-white transition-all duration-150
                  ${isSelected ? "ring-2 ring-orange-400 shadow-md" : "hover:shadow-sm"}`}
              >
                {/* Custom checkbox — label wraps everything, so clicking anywhere selects */}
                <div
                  className={`mt-1 w-4 h-4 shrink-0 rounded-sm border-2 flex items-center justify-center pointer-events-none
                    ${isSelected
                      ? "bg-orange-500 border-orange-500"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                {/* hidden real input — label click triggers this */}
                <input
                  type="checkbox"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => handleSelect(opt.id)}
                  className="sr-only"
                />

                {/* Icon / thumbnail */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-[#6D3F0E]">
                  {opt.thumbnail ? (
                    <Image
                      src={opt.thumbnail}
                      alt={opt.title}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <AddFileIcon />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="lg:flex lg:items-start lg:justify-between gap-3">
                    {/* Title + description */}
                    <p className="text-sm text-[#222222] leading-snug mb-1.5 lg:mb-0 lg:w-96">
                      <span className="font-semibold">{opt.title}</span>
                      {opt.description && (
                        <span className="text-gray-500">
                          {": "}
                          {opt.description}
                        </span>
                      )}
                    </p>

                    {/* Price area */}
                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      {/* {opt.salesOnRate && opt.salesOnRate > 0 && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg whitespace-nowrap">
                          {opt.salesOnRate}%
                        </span>
                      )} */}
                      {hasSaving && (
                        <p className="text-[10px] lg:text-xs flex gap-1 items-center text-orange-500 font-medium bg-[#FF98000F] py-1.5 px-2 rounded-[10px] whitespace-nowrap">
                          <HandDollar />
                          Save {formatPrice(opt.originalPrice - opt.price)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {opt.price > 0 ? formatPrice(opt.price) : (
                          <span className="text-gray-400 text-xs">Calculated on purchase</span>
                        )}
                      </p>
                      {hasSaving && (
                        <p className="text-xs text-gray-400 line-through whitespace-nowrap">
                          {formatPrice(opt.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Warranty badge */}
                  {warrantyYrs && (
                    <span className="inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {warrantyYrs} Coverage
                    </span>
                  )}
                </div>
              </label>
            );
          })}

          {/* ── Selected plan summary ── */}
          {selected && selectedOpt && (
            <div className="mt-3 px-4 py-3 bg-[#2a2420] rounded-xl flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 font-medium">1 care plan selected</p>
              <div className="flex items-center gap-3">
                {selectedOrigPrice > selectedOfferPrice && (
                  <span className="text-sm text-gray-400 line-through whitespace-nowrap">
                    {formatPrice(selectedOrigPrice)}
                  </span>
                )}
                <span className="text-base font-extrabold text-orange-400 whitespace-nowrap">
                  {formatPrice(selectedOfferPrice)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DazzleCare;
