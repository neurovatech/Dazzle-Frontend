import TrendingNowProduct from "@/components/TrendingNowCom/TrendingNowProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
function TrendingNow() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Trending Now", href: "#" },
  ];
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <TrendingNowProduct />
    </div>
  );
}

export default TrendingNow;