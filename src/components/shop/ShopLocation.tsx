import React, { ReactNode } from "react";
import LocationCard from "./LocationCard";
import type { StoreTabItem } from "@/components/share/StorGlobalTabs";

export interface StoreItem {
  uuid: string;
  branchName: string;
  slug: string;
  address: string;
  latitude: string;
  longitude: string;
  dayOff: string;
  openDay: string;
  hours?: string;
  contactNo: string;
  email: string;
  description: string;
  thumbnailImg: string;
  distance?: string;
  [key: string]: unknown; // allows StoreTabItem compatibility
}

// ─── Render card function — passed to StorGlobalTabs ─────────────────────────

export function renderStoreCard(store: StoreTabItem): ReactNode {
  return (
    <LocationCard
      key={store.uuid || store.branchName}
      store={store as StoreItem}
    />
  );
}

// ─── Render section function — passed to StorGlobalTabs ──────────────────────

export function renderStoreSection(
  stores: StoreTabItem[],
  query: string,
  renderCard: (store: StoreTabItem) => ReactNode
): ReactNode {
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
      {/* Nearby Your Location — only show when not searching */}
      {!query && (
        <section className="bg-[#5c3a1e] py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-350 mx-auto">
            <h2 className="text-white text-xl font-bold mb-6 tracking-tight">
              Nearby Your Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyStores.map((store) => renderCard(store))}
            </div>
          </div>
        </section>
      )}

      {/* All / Search results */}
      <section className="py-12 sm:px-6 lg:px-8 max-w-350 mx-auto px-4">
        <div className="max-w-350 mx-auto">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6 tracking-tight">
            {query ? `Results for "${query}"` : "Our Locations"}
            <span className="ml-2 text-base font-normal text-gray-400">
              ({stores.length} store{stores.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map((store) => renderCard(store))}
          </div>
        </div>
      </section>
    </div>
  );
}
