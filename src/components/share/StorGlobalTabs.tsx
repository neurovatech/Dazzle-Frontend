"use client";
import { Search } from "lucide-react";
import React, { useState, ReactNode } from "react";

interface TabItem {
  label: string;
  content: ReactNode;
}

interface GlobalTabsProps {
  tabs: TabItem[];
  defaultActive?: number;
  search?: boolean;
}

const StorGlobalTabs: React.FC<GlobalTabsProps> = ({
  tabs,
  defaultActive = 0,
  search = false,
}) => {
  const [activeTab, setActiveTab] = useState<number>(defaultActive);

  return (
    <div className="w-full">
      {/* Tab Header */}
      <div className="max-w-355 mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:px-12.5 px-4">
        {/* Tabs Row */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm md:text-base rounded-lg transition-all duration-300 ${
                activeTab === index
                  ? "bg-[#E9CCAE] text-primary"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Row */}
        {search && (
          <div className="relative w-full md:w-1/4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D3F0E]"
              size={22}
            />
            <input
              type="text"
              className="text-[#222222] dark:text-white w-full bg-[#FAFAFA] dark:bg-[#1F1F1F] border border-[#E7E7E7] dark:border-[#333333] rounded-xl py-2 pr-4 pl-9 focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/50 dark:focus:ring-[#D89B5C]/40 placeholder:text-[#999999] dark:placeholder:text-gray-500 transition-all duration-200"
              placeholder="Search Store"
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-8">{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default StorGlobalTabs;