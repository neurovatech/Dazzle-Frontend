import FlashSaleProduct from "@/components/FlashSaleCom/FlashSaleProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
function FlashSale() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Offer Products", href: "#" },
  ];
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <FlashSaleProduct />
    </div>
  );
}

export default FlashSale;
