"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "@/icon";
import ExplorePanel from "./ExplorePanel";
import CategoryNavList from "./CategoryNavList";
import { exploreCategories } from "./types";
import type { ApiCategory } from "./Header";

interface Props {
  categories?: ApiCategory[];
  subCategories?: ApiCategory[];
  explorAllData?: ApiCategory[];
}

export default function CategoryNav({ categories, subCategories, explorAllData }: Props) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    explorAllData && explorAllData.length > 0
      ? explorAllData[0].category_name
      : (exploreCategories[0]?.label ?? "")
  );
  const [selectedBrand, setSelectedBrand] = useState("");
  const navRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setExploreOpen(false);
        setSelectedBrand("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const combinedCategories = [
    ...(categories ?? []),
    ...(subCategories ?? []),
  ];

  const panelCategories = combinedCategories.length > 0 ? explorAllData : exploreCategories;

  const panelProps = {
    categories: explorAllData,
    activeCategory,
    selectedBrand,
    onHoverCategory: setActiveCategory,
    onSelectBrand: setSelectedBrand,
  };

  return (
    <div ref={navRef} className="relative w-full">
      <div className="max-w-350 mx-auto px-6 hidden lg:flex">
        <div className="flex items-center gap-3 py-2.5 w-full">
          <div className="relative shrink-0">
            <button
              onClick={() => setExploreOpen((p) => !p)}
              className="flex items-center gap-2 bg-[#D4A97A] hover:bg-[#c89a6b] text-gray-900 font-bold text-[12.5px] tracking-wide px-[18px] py-[14px] rounded-[9px] transition-colors"
            >
              EXPLORE ALL
              <ChevronDownIcon />
            </button>
            <ExplorePanel
              isOpen={exploreOpen}
              onClose={() => setExploreOpen(false)}
              isMobile={false}
              {...panelProps}
            />
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
          <CategoryNavList categories={categories} />
        </div>
      </div>
    </div>
  );
}
