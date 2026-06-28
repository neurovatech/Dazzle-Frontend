"use client";
import Image from "next/image";

// --- Mock Data ---
const mockProducts = [
  {
    id: 1,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 2,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 3,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 4,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 5,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 6,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 7,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 8,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
  {
    id: 9,
    name: "Belkin USB C 7 in 1 Multiport Ada...",
    status: "In Stock",
    price: "৳1,00,000",
    oldPrice: "৳1,30,000",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
  },
];

const categoryTags = [
  "#iPhone 17 pro max",
  "#Macbook pro",
  "#Samsung s ultra 7",
  "#Samsung",
];

const brands = [
  {
    name: "Apple",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  },
  {
    name: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60&h=60&fit=crop",
  },
  {
    name: "Smart-watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop",
  },
  {
    name: "Laptops",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60&h=60&fit=crop",
  },
];

interface ProductSearchesProps {
  query?: string;
  onSelectCategory?: (category: string) => void;
  onSeeAll?: () => void;
}

export default function ProductSearches({
  query,
  onSelectCategory,
  onSeeAll,
}: ProductSearchesProps) {
  const handleCategory = (tag: string) =>
    onSelectCategory?.(tag.replace("#", ""));

  return (
    <div className="flex flex-col sm:flex-row h-full">
      {/* ── Left: Categories + Brands ── */}
      <div className="w-full sm:w-[220px] lg:w-[260px] shrink-0 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100">
        {/* Category Tags */}
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Categries</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => handleCategory(tag)}
              className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-white border border-gray-200 rounded-lg hover:border-[#D4A97A] hover:text-[#b8864e] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Choose From Brands */}
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Choose From Brands</p>
        <div className="flex flex-wrap gap-x-4 gap-y-4">
          {brands.map((brand, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden hover:border-[#D4A97A] transition-colors">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain p-2"
                  unoptimized
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-white group-hover:text-[#b8864e] transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col min-h-0">
        <p className="text-sm font-semibold text-gray-800 mb-3 dark:text-white">Products</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors group/prod border border-transparent hover:border-gray-100"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Details */}
              <div className="min-w-0">
                <p className="text-xs text-gray-700 dark:text-white font-medium truncate group-hover/prod:text-[#b8864e] transition-colors leading-snug">
                  {product.name}
                </p>
                <p className="text-xs text-green-500 font-medium mt-0.5">{product.status}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{product.price}</span>
                  <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEE ALL */}
        <div className="flex justify-end mt-3 shrink-0">
          <button
            onClick={onSeeAll}
            className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-200 dark:text-white rounded-xl hover:border-[#D4A97A] hover:text-[#b8864e] transition-colors"
          >
            SEE ALL
          </button>
        </div>
      </div>
    </div>
  );
}