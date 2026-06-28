import GlobalTabs from "@/components/share/GlobalTabs";
import Newest from "@/components/CategoriesPages/CategoriesProduct/Newest";
import FilterSidebar from "./FilterSidebar";
import GlobalSelect from "@/components/ui/Select";
// import { Select, Option } from "@/components/ui/Select";

function CategoriesProduct() {
  const tabsData = [
    {
      label: "Newest",
      content: <Newest />,
    },
    {
      label: "Popular",
      content: <Newest />,
    },
    {
      label: "Olds",
      content: <Newest />,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-9 h-full">
          <div className="flex justify-between pb-3">
            <h3 className="font-bold text-lg"> IPhone </h3>

            <GlobalSelect
              fullWidth={false}
              variant="pill"
              size="sm"
              options={[
                { value: "all", label: "All Brand" },
                { value: "week", label: "Apple" },
                { value: "month", label: "Hp " },
              ]}
            />
          </div>
          <div className="flex justify-between">
            <GlobalTabs tabs={tabsData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoriesProduct;
