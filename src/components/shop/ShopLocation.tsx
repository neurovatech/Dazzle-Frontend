import React from "react";
import LocationCard from "./LocationCard";
import { api } from "@/lib/api";

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
}

interface LocationsPageProps {
  districtId: number | null;
}

const LocationsPage: React.FC<LocationsPageProps> = async ({ districtId }) => {
  let stores: StoreItem[] = [];

  try {
    const url = districtId
      ? `/stores?district_id=${districtId}`
      : "/stores";

    const res = await api.get<{ data: StoreItem[] }>(url, {
      cache: "no-store",
    });

    stores = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch stores:", error);
  }

  if (!stores.length) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        No stores found.
      </div>
    );
  }

  const nearbyStores = stores.slice(0, 3);

  return (
    <div className="font-sans">
      {/* Nearby Your Location */}
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

      {/* Our Locations */}
      <section className="py-12 sm:px-6 lg:px-8 max-w-350 mx-auto px-4">
        <div className="max-w-350 mx-auto">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6 tracking-tight">
            Our Locations
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
};

export default LocationsPage;