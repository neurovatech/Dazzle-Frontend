"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import LocationCard from "./LocationCard";
import { api } from "@/lib/api";
import type { StoreItem } from "./ShopLocation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabData {
  label: string;
  districtId: number | null;
  stores: StoreItem[]; // SSR initial data for "All" tab
}

interface Props {
  tabs: TabData[];
  initialAllStores: StoreItem[]; // from SSR — used for "All" tab immediately
}

// ─── Section ──────────────────────────────────────────────────────────────────

function StoreSection({
  stores,
  query,
  isLoading,
}: {
  stores: StoreItem[];
  query: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-[#6D3F0E] dark:text-[#d4a97a]" />
        <p className="text-sm text-gray-400">Loading stores...</p>
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <p className="font-medium">
          {query ? `No stores found for "${query}"` : "No stores found."}
        </p>
        {query && (
          <p className="text-sm text-gray-300">Try a different name or address.</p>
        )}
      </div>
    );
  }

  const nearbyStores = stores.slice(0, 3);

  return (
    <div className="font-sans">
      {/* Nearby — hidden when searching */}
      {!query && (
        <section className="bg-[#5c3a1e] py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-350 mx-auto">
            <h2 className="text-white text-xl font-bold mb-6 tracking-tight">
              Nearby Your Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyStores.map((store) => (
                <LocationCard key={store.uuid || store.branchName} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All stores / search results */}
      <section className="py-12 sm:px-6 lg:px-8 max-w-350 mx-auto px-4">
        <div className="max-w-350 mx-auto">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6 tracking-tight">
            {query ? `Results for "${query}"` : "Our Locations"}
            <span className="ml-2 text-base font-normal text-gray-400">
              ({stores.length} store{stores.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map((store) => (
              <LocationCard key={store.uuid || store.branchName} store={store} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function ShopLocationClient({ tabs, initialAllStores }: Props) {
  const [activeTab, setActiveTab]     = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const activeTabData = tabs[activeTab];
  const districtId    = activeTabData?.districtId ?? null;

  // Fetch stores for district tab — only when districtId is set
  const { data: districtStores, isLoading } = useQuery<StoreItem[]>({
    queryKey: ["stores-district", districtId],
    enabled: districtId !== null, // "All" tab doesn't fetch
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await api.get<{ data: StoreItem[] }>(
        `/stores?district_id=${districtId}`
      );
      return Array.isArray(res?.data) ? res.data : [];
    },
  });

  // "All" tab uses SSR data, district tabs use API data
  const activeStores: StoreItem[] =
    districtId === null
      ? initialAllStores
      : (districtStores ?? []);

  // Client-side search filter
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
      {/* Tabs + Search */}
      <div className="max-w-355 mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:px-12.5 px-4">
        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveTab(index);
                setSearchQuery("");
              }}
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

        {/* Search input */}
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
      </div>

      {/* Results */}
      <div className="mt-8">
        <StoreSection
          stores={filteredStores}
          query={searchQuery.trim()}
          isLoading={districtId !== null && isLoading}
        />
      </div>
    </div>
  );
}
