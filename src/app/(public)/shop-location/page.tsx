import Breadcrumb from "@/components/share/Breadcrumb";
import ShopLocationClient, { TabData } from "@/components/shop/ShopLocationClient";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import type { StoreItem } from "@/components/shop/ShopLocation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface District {
  district_id: number;
  district_name: string;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Store Locations",
  description:
    "Find a Dazzle store near you. Visit our branches across Bangladesh for the best smartphones, laptops, and gadgets.",
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop-location" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShopLocations() {
  // Fetch districts + all stores in parallel via SSR
  const [districtsRes, allStoresRes] = await Promise.allSettled([
    api.get<{ data: District[] }>("/store-district", { next: { revalidate: 60 } }),
    api.get<{ data: StoreItem[] }>("/stores", { next: { revalidate: 60 } }),
  ]);

  const districts: District[] =
    districtsRes.status === "fulfilled" && Array.isArray(districtsRes.value?.data)
      ? districtsRes.value.data
      : [];

  const allStores: StoreItem[] =
    allStoresRes.status === "fulfilled" && Array.isArray(allStoresRes.value?.data)
      ? allStoresRes.value.data
      : [];

  // Tabs — district tabs carry no stores (fetched client-side on demand)
  const tabs: TabData[] = [
    { label: "All",  districtId: null, stores: [] },
    ...districts.map((d) => ({
      label:      d.district_name,
      districtId: d.district_id,
      stores:     [], // fetched by ShopLocationClient when tab is clicked
    })),
  ];

  return (
    <div>
      <div className="max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
          <h3 className="lg:text-[32px] text-[20px] font-bold pb-3 text-gray-900 dark:text-white">
            Store Locations
          </h3>
        </div>
      </div>

      {/* Pass plain serializable data only — functions live inside ShopLocationClient */}
      <ShopLocationClient
        tabs={tabs}
        initialAllStores={allStores}
      />
    </div>
  );
}
