import CountdownBadges from "@/components/Offer/CountdownBadges";
import OfferBanner from "@/images/offer_banner.png";
import Breadcrumb from "@/components/share/Breadcrumb";
import ProductCard from "@/components/share/GlobalProductCard";
import Image from "next/image";
interface Props {
  params: { slug: string };
}

export default function OfferDetailPage({ params }: Props) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Offer", href: "/offer" },
    { label: "Single Offer", href: `single_offer` },
  ];

  const products = [
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Sony WH-1000XM5 Noise Cancelling Headphones",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      badge: "Limited",
      isBestDeal: true,
      inStock: false,
      image: "/images/product.png",
    },
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Sony WH-1000XM5 Noise Cancelling Headphones",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      badge: "Limited",
      isBestDeal: true,
      inStock: false,
      image: "/images/product.png",
    },
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
  ];

  return (
    <div className="min-h-screen max-w-355 mx-auto md:px-12.5 px-4">
      <Breadcrumb items={breadcrumbItems} />

      {/* Content area */}
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 dark:text-white">
          Latest Offer
        </h2>
        <div className="w-full mb-10">
          <Image
            src={OfferBanner}
            alt="Offer Banner"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Countdown + Sort row */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#101518] dark:text-white">Offer Ending In</p>
            <button className="flex items-center gap-1 text-sm text-[#000000] hover:text-gray-900 transition-colors rounded-[10px] py-1.5 px-2 border border-[#EEEEEE]">
              <span className="dark:text-white">Sort By</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="dark:text-white"
              >
                <path
                  d="M4.6468 0.5C4.6468 0.367392 4.69948 0.240215 4.79325 0.146447C4.88701 0.0526784 5.01419 0 5.1468 0C5.27941 0 5.40658 0.0526784 5.50035 0.146447C5.59412 0.240215 5.6468 0.367392 5.6468 0.5V12.7937C5.64663 12.8925 5.61721 12.989 5.56226 13.0711C5.50731 13.1532 5.42928 13.2171 5.33803 13.2549C5.24677 13.2927 5.14637 13.3026 5.04949 13.2833C4.95261 13.2641 4.8636 13.2166 4.79367 13.1469L0.1468 8.5C0.100265 8.45356 0.0633456 8.39839 0.0381558 8.33767C0.012966 8.27694 0 8.21184 0 8.14609C0 8.08035 0.012966 8.01525 0.0381558 7.95452C0.0633456 7.89379 0.100265 7.83863 0.1468 7.79219H0.149925C0.243593 7.69916 0.370252 7.64695 0.502269 7.64695C0.634285 7.64695 0.760944 7.69916 0.854612 7.79219L4.64836 11.5891L4.6468 0.5ZM7.6468 1.20625C7.64728 1.10762 7.67691 1.01133 7.73198 0.929499C7.78705 0.84767 7.8651 0.783957 7.95629 0.746377C8.04749 0.708796 8.14776 0.699028 8.24449 0.718301C8.34122 0.737573 8.4301 0.785026 8.49992 0.854687L13.1468 5.5C13.1933 5.54644 13.2303 5.60161 13.2554 5.66233C13.2806 5.72306 13.2936 5.78816 13.2936 5.85391C13.2936 5.91965 13.2806 5.98475 13.2554 6.04548C13.2303 6.10621 13.1933 6.16137 13.1468 6.20781H13.1437C13.05 6.30084 12.9233 6.35305 12.7913 6.35305C12.6593 6.35305 12.5327 6.30084 12.439 6.20781L8.6468 2.41406V13.5C8.6468 13.6326 8.59412 13.7598 8.50035 13.8536C8.40659 13.9473 8.27941 14 8.1468 14C8.01419 14 7.88701 13.9473 7.79325 13.8536C7.69948 13.7598 7.6468 13.6326 7.6468 13.5V1.20625Z"
                  fill="#000000"
                />
              </svg>
            </button>
          </div>
          <CountdownBadges size="md" />
        </div>

        {/* Description card */}
        <div className=" bg-amber-50 dark:bg-[#1A1A1A]  border border-amber-100 dark:border-gray-700 rounded-xl p-5 mt-1">
          <p className="text-[#222222]  dark:text-gray-200 leading-7">
            Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
            the sdf Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
            the . Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
            the . Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
            the . Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
            the . Order the all-new iPhone 17 Series now at the best price in
            Bangladesh! Experience unmatched performance and innovation,
            designed to elevate every moment of your life. Get your device from
          </p>
        </div>

        {/* Products section */}
        <div className="mt-10 grid md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 grid-cols-2 gap-3">
          {products.map((product, i) => (
            <div key={i}>
              <ProductCard key={i} {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
