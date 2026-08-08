"use client";

import React, { useState, useRef, useCallback } from "react";

const ramStorageOptions = [
  "12/512GB",
  "8/256GB",
  "16/512GB",
  "16/512GB",
  "16/512GB",
];

const sortOptions = ["Recommend", "Newest", "Lowest - Highest", "Highest - Lowest"];

type AccordionSection = "budget" | "ram" | "laptops" | "watches";

const MIN = 0;
const MAX = 500000;

export default function FilterSidebar() {
  const [openSections, setOpenSections] = useState<AccordionSection[]>(["budget", "ram"]);
  const [minPrice, setMinPrice] = useState(10000);
  const [maxPrice, setMaxPrice] = useState(280000);
  const [checkedRam, setCheckedRam] = useState<number[]>([0, 3]);
  const [sortSelected, setSortSelected] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const toggleRam = (index: number) => {
    setCheckedRam((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getPercent = (val: number) => ((val - MIN) / (MAX - MIN)) * 100;

  const handleThumbPointer = useCallback(
    (thumb: "min" | "max") => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const onMove = (ev: PointerEvent) => {
        const pct = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
        const v = Math.round(pct * (MAX - MIN) + MIN);
        if (thumb === "min") setMinPrice(Math.min(v, maxPrice - 5000));
        else setMaxPrice(Math.max(v, minPrice + 5000));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [minPrice, maxPrice]
  );

  return (
    <div className="bg-white dark:bg-[#3e3329] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 pt-5 sticky top-6 transition-colors duration-200 pb-10 ">
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
                className="absolute inset-x-0 h-7.5 overflow-hidden"
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
                    left: `${getPercent(minPrice)}%`,
                    width: `${getPercent(maxPrice) - getPercent(minPrice)}%`,
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
                  style={{ left: 0, width: `${getPercent(minPrice)}%` }}
                />
                {/* Grey-out right of max */}
                <div
                  className="absolute top-0 h-full bg-gray-200 dark:bg-gray-700"
                  style={{
                    left: `${getPercent(maxPrice)}%`,
                    right: 0,
                    width: `${100 - getPercent(maxPrice)}%`,
                  }}
                />
              </div>

              {/* Min thumb */}
              <div
                className="absolute w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 border-2 border-white dark:border-gray-800 shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-colors duration-200"
                style={{ left: `${getPercent(minPrice)}%` }}
                onPointerDown={handleThumbPointer("min")}
              />

              {/* Max thumb */}
              <div
                className="absolute w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 border-2 border-white dark:border-gray-800 shadow-md cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-colors duration-200"
                style={{ left: `${getPercent(maxPrice)}%` }}
                onPointerDown={handleThumbPointer("max")}
              />
            </div>

            {/* Min / Max display boxes */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-gray-200 dark:border-[#241b14] rounded-xl px-3 py-2.5 text-center bg-white dark:dark:bg-[#3e3329] shadow-sm transition-colors duration-200">
                <p className="text-[10px] text-gray-400 dark:text-white mb-0.5 tracking-wide">Minimum</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ৳{minPrice.toLocaleString()}
                </p>
              </div>
              <span className="text-gray-400 dark:text-gray-500 font-bold text-base">-</span>
              <div className="flex-1 border border-gray-200 dark:border-[#241b14] rounded-xl px-3 py-2.5 text-center bg-white dark:dark:bg-[#3e3329] shadow-sm transition-colors duration-200">
                <p className="text-[10px] text-gray-400 dark:text-white mb-0.5 tracking-wide">Maximum</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ৳{maxPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RAM & Storage */}
      <div className="mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <button onClick={() => toggleSection("ram")} className="w-full">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-[#FDF3E7] dark:bg-orange-950/40 px-4 py-2 rounded-lg w-full flex justify-between items-center transition-colors duration-200">
            Ram and Storage
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                openSections.includes("ram") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </button>

        {openSections.includes("ram") && (
          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4">
            {ramStorageOptions.map((option, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => toggleRam(i)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    checkedRam.includes(i)
                      ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                >
                  {checkedRam.includes(i) && (
                    <svg
                      className="w-2.5 h-2.5 text-white dark:text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sort By */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Sort By</h4>
        <div className="flex flex-col gap-2.5">
          {sortOptions.map((option, i) => (
            <label
              key={option}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setSortSelected(i)}
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  sortSelected === i
                    ? "border-orange-400 dark:border-orange-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {sortSelected === i && (
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400 dark:bg-orange-400" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}