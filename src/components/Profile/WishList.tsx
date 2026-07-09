"use client";

import { Heart, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeFromWishlist, clearWishlist } from "@/store/slices/wishlistSlice";
import ProductCard from "@/components/share/GlobalProductCard";

const WishList = () => {
  const dispatch = useAppDispatch();
  const items    = useAppSelector((state) => state.wishlist.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
          <Heart size={28} className="text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Your wishlist is empty
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Click the ♡ icon on any product to save it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} item{items.length !== 1 ? "s" : ""} saved
        </p>
        <button
          onClick={() => dispatch(clearWishlist())}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
          Clear all
        </button>
      </div>

      {/* Product grid */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.productUuid} className="relative">
            <ProductCard
              productUuid={item.productUuid}
              image={item.image}
              title={item.productName}
              price={item.price}
              originalPrice={item.originalPrice}
              discount={item.discount}
              badge={item.badge}
              inStock={item.inStock}
              isBestDeal={item.isBestDeal}
              slug={item.productSlug}
            />
            {/* Remove button */}
            <button
              onClick={() => dispatch(removeFromWishlist(item.productUuid))}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 dark:bg-[#2e2b28] border border-red-200 dark:border-red-500/30 dark:text-white flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors z-10"
              aria-label="Remove from wishlist"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishList;
