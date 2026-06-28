import LocationsPage from "@/components/shop/ShopLocation";
import Breadcrumb from "@/components/share/Breadcrumb";
import StorGlobalTabs from "@/components/share/StorGlobalTabs";
import { api } from "@/lib/api";

interface District {
  district_id: number;
  district_name: string;
}

async function ShopLocations() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop-location" },
  ];

  let districts: District[] = [];

  try {
    const res = await api.get<{ data: District[] }>("/store-district", {
      cache: "no-store",
    });
    districts = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch districts:", error);
  }

  const tabsData = [
    {
      label: "All",
      content: <LocationsPage districtId={null} />,
    },
    ...districts.map((d) => ({
      label: d.district_name,
      content: <LocationsPage districtId={d.district_id} />,
    })),
  ];

  return (
    <div>
      <div className="max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
          <h3 className="lg:text-[32px] text-[20px] font-bold pb-3">
            Store Locations
          </h3>
        </div>
      </div>
      <StorGlobalTabs tabs={tabsData} search={true} />
    </div>
  );
}

export default ShopLocations;