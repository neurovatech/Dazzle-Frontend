"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { api } from "@/lib/api";
import type { DefaultVariantResponse } from "./ProductCardBuy";

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
  price,
  disabled,
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
  disabled: boolean;
}) {
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  // Wishlist state is synced into Redux client-side only (WishlistSync runs
  // after mount), so the server always renders "not wishlisted". Gating on
  // `mounted` keeps the first client render matching that same default —
  // the heart corrects to the real state right after, instead of hydration
  // flagging a server/client mismatch on already-wishlisted products.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isWishlisted =
    mounted && wishlistItems.some((i) => i.productUuid === productUuid);
  const { addToWishlist, isAdding } = useAddToWishlist();
  const { removeFromWishlist, isRemoving } = useRemoveFromWishlist();
  const [isResolvingVariant, setIsResolvingVariant] = useState(false);
  const isBusy = isResolvingVariant || isAdding(productUuid) || isRemoving(productUuid);

  /**
   * This card has no variant selector, so — same as its "Add to Cart"
   * sibling (ProductCardBuy) — the variant the wishlist-add API requires
   * is resolved via get-default-variant right before the call, rather than
   * being known up front.
   */
  const handleWishlist = async () => {
    if (isWishlisted) {
      const wishListUuid = wishlistItems.find((i) => i.productUuid === productUuid)?.wishListUuid;
      removeFromWishlist({ productUuid, wishListUuid });
      return;
    }

    setIsResolvingVariant(true);
    let variantUuid = productUuid;
    try {
      const res = await api.get<DefaultVariantResponse>(
        `/get-default-variant/${productUuid.trim()}?priceSort=1&userDefine=0`,
      );
      if (res?.data?.variantUUID) variantUuid = res.data.variantUUID;
    } catch (err) {
      console.error("[ProductCardWishlist] get-default-variant error:", err);
      // Resolution failed — fall back to the raw productUuid, same recovery
      // ProductCardBuy's add-to-cart flow uses.
    } finally {
      setIsResolvingVariant(false);
    }

    addToWishlist({ productUuid, variantUuid, name: title, price });
  };

  return (
    <button
      onClick={handleWishlist}
      disabled={disabled || isBusy}
      className={`w-8 h-8 mt-1 rounded-full ml-[25px] border flex items-center justify-center transition-all duration-300 ${
        disabled || isBusy
          ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60"
          : `hover:scale-110 active:scale-95 ${
              isWishlisted
                ? "bg-red-50 border-red-300 text-red-500"
                : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
            }`
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
