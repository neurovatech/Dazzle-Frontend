"use client";

import ProductCard from "./ProductCrad";

interface Product {
  id?: string;
  image?: string;
  name?: string;
  inStock?: boolean;
  price?: string;
  originalPrice?: string;
  rawPrice?: number;
  rawOriginalPrice?: number;
  slug?: string;
}

interface FrequentlyBoughtTogetherProps {
  products: Product[];
  onAddToCart?: () => void;
}

export default function FrequentlyBoughtTogether({
  products,
  onAddToCart,
}: FrequentlyBoughtTogetherProps) {
  if (!products || products.length === 0) return null;

  // Use raw numeric prices if available, else parse from display string
  const parsePrice = (p: Product, field: "price" | "originalPrice") => {
    if (field === "price")
      return p.rawPrice ?? Number((p.price ?? "").replace(/[^\d.]/g, "")) ?? 0;
    return (
      p.rawOriginalPrice ??
      Number((p.originalPrice ?? p.price ?? "").replace(/[^\d.]/g, "")) ??
      0
    );
  };

  const totalPrice = products.reduce((s, p) => s + parsePrice(p, "price"), 0);
  const totalOriginalPrice = products.reduce(
    (s, p) => s + parsePrice(p, "originalPrice"),
    0,
  );

  const availableCount = products.filter((p) => p.inStock).length;

  return (
    <div className="py-4 w-full">
      <h3 className="py-3 font-bold">Frequently Buy Together</h3>

      <div className="flex flex-wrap items-stretch gap-2 sm:gap-3 w-full">
        {products.map((prod, index) => (
          <div key={index} className="flex items-stretch gap-2 sm:gap-3 min-w-0">
            <div className="w-[150px] sm:w-[180px] shrink-0">
              <ProductCard {...prod} />
            </div>
            {index < products.length - 1 && (
              <span className="text-xl sm:text-2xl text-gray-400 dark:text-gray-500 font-light select-none shrink-0 flex items-center">
                +
              </span>
            )}
          </div>
        ))}

        <span className="text-xl sm:text-2xl text-gray-400 dark:text-gray-500 font-light select-none shrink-0 flex items-center">
          =
        </span>

        <div className="flex flex-col items-start sm:items-center px-1 sm:px-2 shrink-0 justify-center">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {products.length} Items
          </span>
          <span className="text-orange-500 font-bold text-base sm:text-lg whitespace-nowrap">
            BDT {totalPrice.toLocaleString("en-US")}
          </span>
          {totalOriginalPrice > totalPrice && (
            <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm line-through whitespace-nowrap">
              BDT {totalOriginalPrice.toLocaleString("en-US")}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onAddToCart}
        disabled={availableCount === 0}
        className={`shrink-0 px-6 mt-4 sm:px-8 py-3 text-sm sm:text-base font-semibold rounded-full transition-colors duration-150 whitespace-nowrap shadow-sm
          ${availableCount === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
            : "bg-[#E9CCAE] hover:bg-[#D4B89A] active:bg-[#C0A486] text-black cursor-pointer"
          }`}
      >
        Add {availableCount} item{availableCount !== 1 ? "s" : ""} to cart
      </button>
    </div>
  );
}
