"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { trackAddToWishlist } from "@/lib/analytics/pixelEvents";

/**
 * Client island for the wishlist toggle only.
 *
 * Previously the whole 455-line product card was a Client Component, so every
 * card on a listing page (~40 on the homepage) hydrated its badges, image
 * wrapper, title, price block and inline SVGs even though none of that changes
 * after render. Now only this button and the buy row are interactive.
 */
export default function ProductCardWishlist({
  productUuid,
  title,
  slug,
  image,
  price,
  originalPrice,
  discount,
  badge,
  inStock,
  isBestDeal,
}: {
  productUuid: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  inStock: boolean;
  isBestDeal: boolean;
}) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i.productUuid === productUuid);

  const handleWishlist = () => {
    if (!isWishlisted) {
      trackAddToWishlist({ id: productUuid, name: title, price });
    }
    dispatch(
      toggleWishlist({
        productUuid,
        productName: title,
        productSlug: slug,
        image,
        price,
        originalPrice,
        discount,
        badge,
        inStock,
        isBestDeal,
        addedAt: new Date().toISOString(),
      }),
    );
  };

  return (
    <button
      onClick={handleWishlist}
      className={`w-8 h-8 mt-1 rounded-full ml-[25px] border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
        isWishlisted
          ? "bg-red-50 border-red-300 text-red-500"
          : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
      }`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-3 h-3 sm:w-4 sm:h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
