import Breadcrumb from "@/components/share/Breadcrumb";
import ShowcaseProductGrid from "@/components/share/ShowcaseProductGrid";
import { fetchShowcaseProducts } from "@/lib/fetchShowcaseProducts";

export default async function FeatureProductsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Feature Products", href: "/feature-product" },
  ];

  const { products, totalPages } = await fetchShowcaseProducts("feature-products", 1, 50);

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="mt-6 md:px-12.5 px-4">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white mb-6">
          Feature Products
        </h3>
        <ShowcaseProductGrid
          showcaseSlug="feature-products"
          initialProducts={products}
          initialTotalPages={totalPages}
          cols={5}
        />
      </div>
    </div>
  );
}
