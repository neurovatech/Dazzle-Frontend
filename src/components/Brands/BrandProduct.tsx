import TopSelling from "@/components/TopSelling/TopSelling";
import FilterSidebar from "@/components/share/FilterSidebar";
import BrandProductList from "@/components/Brands/BrandProductList";
import { ProductItem } from "@/app/(public)/brands/[slug]/page";

interface BrandProductProps {
  brandSlug: string;
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
}

function BrandProduct({
  brandSlug,
  currentPage,
  products,
  totalPages,
  totalCount,
  currentSort,
  currentSearch,
}: BrandProductProps) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-6.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-9 h-full">

          <div className="bg-[#EEEEEE] dark:bg-[#3e3329] rounded-2xl mb-8">
            <div className="flex flex-col flex-1 py-6">
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
            <div className="flex flex-col flex-1 py-6">
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

          {/* ── All Products — data comes from server via props ── */}
          <BrandProductList
            brandSlug={brandSlug}
            currentPage={currentPage}
            products={products}
            totalPages={totalPages}
            totalCount={totalCount}
            currentSort={currentSort}
            currentSearch={currentSearch}
          />
        </div>
      </div>
    </div>
  );
}

export default BrandProduct;
