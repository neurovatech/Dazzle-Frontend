"use client";
import { useState } from "react";
import Image from "next/image";
import { SearchIcon } from "@/icon";

const recentSearchesData = ["iPhone 17 pro max", "Macbook pro", "Macbook pro"];
const trendingSearches = ["#iPhone 17 pro max", "#Macbook pro", "#Samsung s ultra 7", "#Samsung"];
const likedBrands = [
  { name: "Apple", image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", bg: "#f5f5f5" },
  { name: "Samsung", image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", bg: "#f5f5f5" },
  { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&h=80&fit=crop", bg: "#f0f4ff" },
  { name: "Smart-watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop", bg: "#fff0f0" },
  { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&h=80&fit=crop", bg: "#f0f4ff" },
];

interface RecentSearchesProps {
  onSelectTerm?: (term: string) => void;
}

export default function RecentSearches({ onSelectTerm }: RecentSearchesProps) {
  const [recents, setRecents] = useState(recentSearchesData);

  const removeRecent = (index: number) =>
    setRecents((prev) => prev.filter((_, i) => i !== index));

  const clearAll = () => setRecents([]);

  const handleSelect = (term: string) => onSelectTerm?.(term);
  const handleTrending = (tag: string) => onSelectTerm?.(tag.replace("#", ""));

  return (
    <div className="flex flex-col lg:flex-row lg:divide-x divide-gray-100">
      <div className="flex-1 p-4 lg:p-5 border-b lg:border-b-0 border-gray-100 dark:border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800 dark:text-white">Recent Searches</span>
          {recents.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 dark:text-white hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <ul className="space-y-0.5">
          {recents.length === 0 && (
            <li className="text-xs text-gray-400 dark:text-white py-2">No recent searches</li>
          )}
          {recents.map((term, i) => (
            <li
              key={i}
              onClick={() => handleSelect(term)}
              className="flex items-center justify-between group/item py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <SearchIcon />
                <span className="text-sm text-gray-600 dark:text-white truncate">{term}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeRecent(i); }}
                className="ml-2 shrink-0 text-gray-300 dark:text-white hover:text-gray-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 2. Trending Searches ── */}
      <div className="flex-1 p-4 lg:p-5 border-b lg:border-b-0 border-gray-100 dark:border-gray-600">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Trending Searches</p>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((tag, i) => (
            <button
              key={i}
              onClick={() => handleTrending(tag)}
              className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-white border border-gray-200 rounded-lg hover:border-[#D4A97A] hover:text-[#b8864e] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Liked Brands ── */}
      <div className="flex-1 p-4 lg:p-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Liked Brands</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {likedBrands.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleSelect(brand.name)}
              className="flex flex-col items-center gap-1.5 group/brand"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 group-hover/brand:border-[#D4A97A]/40 transition-colors"
                style={{ background: brand.bg }}
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-white group-hover/brand:text-[#b8864e] transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}