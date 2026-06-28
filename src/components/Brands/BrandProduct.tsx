
import TopSelling from "@/components/TopSelling/TopSelling";
import FilterSidebar from "@/components/share/FilterSidebar";
import SortDropdown from "@/components/share/SortDropdown";
import BrandProductList from "@/components/Brands/BrandProductList";
// import { Select, Option } from "@/components/ui/Select";

function BrandProduct() {
  const brand = [
    {
      title: "Apple AirPods Pro (1nd Gen)",
      image: "./images/a.png",
    },
    {
      title: "Apple AirPods Pro (2nd Gen)",
      image: "./images/s.png",
    },
    {
      title: "Apple AirPods Pro (3nd Gen)",
      image: "./images/a.png",
    },
    {
      title: "Apple AirPods Pro (4nd Gen)",
      image: "./images/s.png",
    },
    {
      title: "Apple AirPods Pro (5nd Gen)",
      image: "./images/a.png",
    },
    {
      title: "Apple AirPods Pro (6nd Gen)",
      image: "./images/s.png",
    },
    {
      title: "Apple AirPods Pro (7nd Gen)",
      image: "./images/a.png",
    },
    {
      title: "Apple AirPods Pro (8nd Gen)",
      image: "./images/s.png",
    },
  ];

  return (
    <div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-6.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-9 h-full">

          <div className="bg-[#EEEEEE] dark:bg-[#3e3329] rounded-2xl mb-8">
            <div className="flex flex-col flex-1  py-6">
              <div className="md:px-6.5 px-4">
                <div className="flex items-center gap-6 pb-5">
                  <h3 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
                    Top Selling
                  </h3>
                </div>
                <TopSelling />
              </div>
            </div>
          </div>

          <div className="bg-[#6D3F0E] rounded-2xl">
            <div className="flex flex-col flex-1  py-6">
              <div className="md:px-6.5 px-4">
                <div className="flex items-center gap-6 pb-5">
                  <h3
                    className="
                      md:text-[32px]
                      dark:text-white
                      text-[18px]
                      font-bold
                      text-transparent
                      bg-clip-text
                      bg-[linear-gradient(90deg,#FFFFFF_0%,#E9CCAE_46.15%,#B57908_100%)]
                    "
                  >
                    Running Offer
                  </h3>
                </div>
                <TopSelling />
              </div>
            </div>
          </div>

          <div className="flex justify-between pb-3 mt-8">
            <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white"> All Products </h3>
            <SortDropdown />
          </div>
          <div className="flex justify-between">
            <BrandProductList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandProduct;
