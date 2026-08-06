/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

export interface AttributeItem {
  attributeGuid: string;
  attributeVariation: string;
}

export interface AttributeGroup {
  attributeName: string;
  items: AttributeItem[];
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface PriceData {
  regularPrice?: PriceRange;
  discountedPrice?: PriceRange;
}

interface FilterSidebarProps {
  attributes?: AttributeGroup[];
  priceData?: PriceData;
  selectedAttributes?: string[];
  onToggleAttribute?: (value: string) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number, max: number) => void;
  stockStatus?: string | null;
  onStockStatusToggle?: (status: string) => void;
}

const sortOptions = ["Recommend", "Newest", "Lowest - Highest", "Highest - Lowest"];

export default function FilterSidebar({
  attributes = [],
  priceData,
  selectedAttributes = [],
  onToggleAttribute,
  minPrice,
  maxPrice,
  onPriceChange,
  stockStatus = null,
  onStockStatusToggle,
}: FilterSidebarProps) {
  const defaultMin = priceData?.discountedPrice?.minPrice ?? 0;
  const defaultMax =
    priceData?.discountedPrice?.maxPrice && priceData.discountedPrice.maxPrice > 0
      ? priceData.discountedPrice.maxPrice
      : 500000;

  // Normalize and group attributes by trimmed name (e.g. merge "Color", "Color ", "color")
  const normalizedGroups = useMemo(() => {
    if (!attributes || attributes.length === 0) return [];
    const map = new Map<string, { originalName: string; items: AttributeItem[] }>();

    for (const group of attributes) {
      if (!group.attributeName) continue;
      const cleanName = group.attributeName.trim();
      const key = cleanName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { originalName: cleanName, items: [] });
      }
      const entry = map.get(key)!;
      for (const item of group.items || []) {
        if (!entry.items.some((i) => i.attributeGuid === item.attributeGuid)) {
          entry.items.push(item);
        }
      }
    }

    return Array.from(map.values());
  }, [attributes]);

  // Open sections state (by section name)
  const [openSections, setOpenSections] = useState<string[]>(["budget", "stockStatus"]);
  const [sortSelected, setSortSelected] = useState(0);

  // Budget local state for dual slider
  const [localMinPrice, setLocalMinPrice] = useState<number>(minPrice ?? defaultMin);
  const [localMaxPrice, setLocalMaxPrice] = useState<number>(
    maxPrice && maxPrice > 0 ? maxPrice : defaultMax
  );
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMinPrice(minPrice ?? defaultMin);
  }, [minPrice, defaultMin]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice && maxPrice > 0 ? maxPrice : defaultMax);
  }, [maxPrice, defaultMax]);

  // Default all attribute sections open
  useEffect(() => {
    if (normalizedGroups.length > 0) {
      setOpenSections((prev) => {
        const newAttrs = normalizedGroups
          .map((g) => g.originalName)
          .filter((name) => !prev.includes(name));
        return [...prev, ...newAttrs];
      });
    }
  }, [normalizedGroups]);

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const getPercent = useCallback(
    (val: number) => {
      if (defaultMax <= defaultMin) return 0;
      return Math.min(
        Math.max(((val - defaultMin) / (defaultMax - defaultMin)) * 100, 0),
        100
      );
    },
    [defaultMin, defaultMax]
  );

  const handleThumbPointer = useCallback(
    (thumb: "min" | "max") => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let currentMin = localMinPrice;
      let currentMax = localMaxPrice;

      const onMove = (ev: PointerEvent) => {
        const pct = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
        const rawV = Math.round(pct * (defaultMax - defaultMin) + defaultMin);
        const step = defaultMax - defaultMin > 10000 ? 500 : 100;
        const v = Math.round(rawV / step) * step;

        if (thumb === "min") {
          currentMin = Math.min(Math.max(v, defaultMin), currentMax - step);
          setLocalMinPrice(currentMin);
        } else {
          currentMax = Math.max(Math.min(v, defaultMax), currentMin + step);
          setLocalMaxPrice(currentMax);
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        onPriceChange?.(currentMin, currentMax);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [localMinPrice, localMaxPrice, defaultMin, defaultMax, onPriceChange]
  );

  console.log(openSections, "openSections");

  return (
    <div className="bg-white dark:bg-[#3e3329] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 sticky top-6 transition-colors duration-200">
      {/* <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Filter</h3> */}

      {/* Budget Section */}
      <div className="mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <button
          onClick={() => toggleSection("budget")}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-[#FDF3E7] dark:bg-orange-950/40 px-4 py-2 rounded-lg w-full flex justify-between items-center transition-colors duration-200">
            Budgets
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                openSections.includes("budget") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </button>

        {openSections.includes("budget") && (
          <div className="mt-4">
            {/* Dual-handle range slider */}
            <div className="relative h-10 flex items-center mb-5 select-none" ref={trackRef}>
              {/* Striped track background */}
              <div
                className="absolute inset-x-0 h-7.5 overflow-hidden rounded-md"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    #6b7280 0px, #6b7280 3px,
                    #e5e7eb 3px, #e5e7eb 6px
                  )`,
                }}
              >
                {/* Active range — dark stripes */}
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: `${getPercent(localMinPrice)}%`,
                    width: `${getPercent(localMaxPrice) - getPercent(localMinPrice)}%`,
                    background: `repeating-linear-gradient(
                      90deg,
                      #111 0px, #111 3px,
                      #e5e7eb 3px, #e5e7eb 6px
                    )`,
                  }}
                />
                {/* Grey-out left of min */}
                <div
                  className="absolute top-0 h-full bg-gray-200 dark:bg-gray-700"
                  style={{ left: 0, width: `${getPercent(localMinPrice)}%` }}
                />
                {/* Grey-out right of max */}
                <div
                  className="absolute top-0 h-full bg-gray-200 dark:bg-gray-700"
                  style={{
                    left: `${getPercent(localMaxPrice)}%`,
                    right: 0,
                    width: `${100 - getPercent(localMaxPrice)}%`,
                  }}
                />
              </div>

              {/* Min thumb */}
              <div
                className="absolute w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 border-2 border-white dark:border-gray-800 shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-colors duration-200"
                style={{ left: `${getPercent(localMinPrice)}%` }}
                onPointerDown={handleThumbPointer("min")}
              />

              {/* Max thumb */}
              <div
                className="absolute w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 border-2 border-white dark:border-gray-800 shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-colors duration-200"
                style={{ left: `${getPercent(localMaxPrice)}%` }}
                onPointerDown={handleThumbPointer("max")}
              />
            </div>

            {/* Min / Max display boxes */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-gray-200 dark:border-[#241b14] rounded-xl px-3 py-2.5 text-center bg-white dark:bg-[#3e3329] shadow-sm transition-colors duration-200">
                <p className="text-[10px] text-gray-400 dark:text-white mb-0.5 tracking-wide">Minimum</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ৳{localMinPrice.toLocaleString()}
                </p>
              </div>
              <span className="text-gray-400 dark:text-gray-500 font-bold text-base">-</span>
              <div className="flex-1 border border-gray-200 dark:border-[#241b14] rounded-xl px-3 py-2.5 text-center bg-white dark:bg-[#3e3329] shadow-sm transition-colors duration-200">
                <p className="text-[10px] text-gray-400 dark:text-white mb-0.5 tracking-wide">Maximum</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ৳{localMaxPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Status Section */}
      <div className="mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <button
          onClick={() => toggleSection("stockStatus")}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-[#FDF3E7] dark:bg-orange-950/40 px-4 py-2 rounded-lg w-full flex justify-between items-center transition-colors duration-200">
            Stock Status
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                openSections.includes("stockStatus") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </button>

        {openSections.includes("stockStatus") && (
          <div className="mt-3 flex flex-col gap-2.5">
            {[
              { label: "Stock In", value: "0" },
              { label: "Stock Out", value: "1" },
            ].map((option) => {
              const isChecked = stockStatus === option.value;
              return (
                <label
                  key={option.value}
                  className="flex items-start gap-2 cursor-pointer select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    onStockStatusToggle?.(option.value);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                      isChecked
                        ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-2.5 h-2.5 text-white dark:text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Attributes Accordion Sections */}
      {normalizedGroups.map((group) => {
        const isOpen = openSections.includes(group.originalName);
        return (
          <div
            key={group.originalName}
            className="mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-4"
          >
            <button
              onClick={() => toggleSection(group.originalName)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-[#FDF3E7] dark:bg-orange-950/40 px-4 py-2 rounded-lg w-full flex justify-between items-center transition-colors duration-200">
                {group.originalName}
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4">
                {group.items.map((item) => {
                  const isChecked = selectedAttributes.includes(item.attributeVariation);
                  return (
                    <label
                      key={item.attributeGuid}
                      className="flex items-start gap-2 cursor-pointer select-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleAttribute?.(item.attributeVariation);
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                          isChecked
                            ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-2.5 h-2.5 text-white dark:text-gray-900"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.attributeVariation}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
