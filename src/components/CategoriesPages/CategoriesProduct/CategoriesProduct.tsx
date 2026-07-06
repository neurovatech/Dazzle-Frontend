import AllProducts from "@/components/CategoriesPages/CategoriesProduct/AllProducts";
import FilterSidebar from "./FilterSidebar";
import { ProductItem } from "@/app/(public)/categories/[categorySlug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoriesProductProps {
  categorySlug: string;
  subCategorySlug?: string; // optional — only present on sub-category page
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function CategoriesProduct({
  categorySlug,
  subCategorySlug,
  currentPage,
  products,
  totalPages,
  totalCount,
  currentSort,
  currentSearch,
}: CategoriesProductProps) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
        <div className="lg:col-span-3 h-full md:block hidden">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-9 h-full">
          <AllProducts
            categorySlug={categorySlug}
            subCategorySlug={subCategorySlug}
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

export default CategoriesProduct;
