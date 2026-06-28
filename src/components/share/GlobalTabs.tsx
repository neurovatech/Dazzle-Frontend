"use client";

import React, { useState, ReactNode } from "react";

interface TabItem {
  label: string;
  content: ReactNode;
}

interface GlobalTabsProps {
  tabs: TabItem[];
  defaultActive?: number;
}

const GlobalTabs: React.FC<GlobalTabsProps> = ({
  tabs,
  defaultActive = 0,
}) => {
  const [activeTab, setActiveTab] = useState<number>(defaultActive);

  return (
    <div className="w-full">
      {/* Tab Header */}
      <div className="flex flex-wrap gap-2 pb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 lg:text-sm text-[13px] md:text-base font-bold rounded-lg transition-all duration-300 ${
              activeTab === index
                ? "bg-[#e9ccae7a] text-primary"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default GlobalTabs;