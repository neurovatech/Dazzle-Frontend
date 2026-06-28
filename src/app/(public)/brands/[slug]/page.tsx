import BrandProduct from "@/components/Brands/BrandProduct";
import Breadcrumb from "@/components/share/Breadcrumb";

function BrandDetailsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand", href: "/brands" },
    { label: "Mobile", href: "/mobile" },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <BrandProduct />
    </div>
  );
}

export default BrandDetailsPage;