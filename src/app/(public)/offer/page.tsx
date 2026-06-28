import OfferCard, { Offer } from "@/components/Offer/OfferCard";
import Breadcrumb from "@/components/share/Breadcrumb";

const offers: Offer[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
  slug: `iphone-16-pro-${i + 1}`,
  badge: "75% OFF",
  images: "",
}));

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Offer", href: "/offer" },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen py-5 px-4">
      {/* Breadcrumb */}
      <div className="max-w-355 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="max-w-355 mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 dark:text-white">Latest Offer</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </div>
  );
}
