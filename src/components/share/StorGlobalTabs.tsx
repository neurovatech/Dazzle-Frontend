"use client";
import { Search } from "lucide-react";
import React, { useState, ReactNode, useMemo } from "react";

export interface StoreTabItem {
  uuid: string;
  branchName: string;
  slug: string;
  address: string;
  [key: string]: unknown;
}

interface TabItem {
  label: string;
  districtId: number | null;
  stores: StoreTabItem[];
}

interface StorGlobalTabsProps {
  tabs: TabItem[];
  defaultActive?: number;
  search?: boolean;
  renderCard: (store: StoreTabItem) => ReactNode;
  renderSection: (stores: StoreTabItem[], query: string, renderCard: (store: StoreTabItem) => ReactNode) => ReactNode;
}

const StorGlobalTabs: React.FC<StorGlobalTabsProps> = ({
  tabs,
  defaultActive = 0,
  search = false,
  renderSection,
  renderCard,
}) => {
  const [activeTab, setActiveTab]   = useState<number>(defaultActive);
  const [searchQuery, setSearchQuery] = useState("");

  const activeStores = tabs[activeTab]?.stores ?? [];

  // Client-side filter by branch name or address
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeStores;
    return activeStores.filter(
      (s) =>
        s.branchName?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q)
    );
  }, [activeStores, searchQuery]);

  return (
    <div className="w-full">
      {/* Tab Header */}
      <div className="max-w-355 mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:px-12.5 px-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => { setActiveTab(index); setSearchQuery(""); }}
              className={`px-4 py-2 text-sm md:text-base rounded-lg transition-all duration-300 ${
                activeTab === index
                  ? "bg-[#E9CCAE] text-primary"
                  : "bg-gray-100 dark:bg-[#2A2520] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {search && (
          <div className="relative w-full md:w-1/4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D3F0E]"
              size={22}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-[#222222] dark:text-white w-full bg-[#FAFAFA] dark:bg-[#1F1F1F] border border-[#E7E7E7] dark:border-[#333333] rounded-xl py-2 pr-4 pl-9 focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/50 dark:focus:ring-[#D89B5C]/40 placeholder:text-[#999999] dark:placeholder:text-gray-500 transition-all duration-200"
              placeholder="Search Store"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-8">
        {renderSection(filteredStores, searchQuery, renderCard)}
      </div>
    </div>
  );
};

export default StorGlobalTabs;
