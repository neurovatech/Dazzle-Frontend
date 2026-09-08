/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { CartIcon } from "@/icon";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { trackAddToCart } from "@/lib/analytics/pixelEvents";
import ProductQuicView from "@/components/ProductDetails/ProductQuicView";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { verifyOrderProduct } from "@/lib/verify-order-product";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DefaultVariantResponse {
  statusCode: number;
  status: string;
  message?: string;
  data?: {
    productUUID: string;
    variantUUID: string;
    attributes?: string; // e.g. "Cosmic Orange, CH (Dual Nano Sim), 256GB"
    regularPrice: number | { source: string; parsedValue: number };
    offerPrice: number | { source: string; parsedValue: number };
    wholeSalePrice: number | { source: string; parsedValue: number };
    thumbnailURL: string;
    isTba: boolean;
  };
}

interface Props {
  itemId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
  minBookingPrice: number;
  showTbaFlag?: boolean;
  /** endOfLife=true → all buttons disabled, no cart/wishlist actions */
  endOfLife?: boolean;
  /** allowPreOrder=true → TBA products show "Pre-Order" instead of "Add to Wishlist" */
  allowPreOrder?: boolean;
}

/**
 * Client island for the buy row (add-to-cart + quick view).
 *
 * Holds all the cart/variant logic that used to live in the full-page
 * ProductCard client component.
 */
export default function ProductCardBuy({
  itemId,
  title,
  slug,
  image,
  price,
  originalPrice,
  inStock,
  minBookingPrice,
  showTbaFlag = false,
  endOfLife = false,
  allowPreOrder = false,
}: Props) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i.productUuid === itemId);

  const [loadingCart, setLoadingCart] = useState(false);
  const [isTba, setIsTba] = useState(!inStock);
  const [isResolvingWishlistVariant, setIsResolvingWishlistVariant] = useState(false);
  const { addToWishlist, isAdding } = useAddToWishlist();
  const { removeFromWishlist, isRemoving } = useRemoveFromWishlist();
  const isAddingWishlist = isResolvingWishlistVariant || isAdding(itemId) || isRemoving(itemId);

  // Wishlist toggle — used when showTbaFlag=true. No variant selector on this
  // card, so — same as handleAddToCart below — get-default-variant resolves
  // which variant the wishlist-add API call is actually for.
  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      const wishListUuid = wishlistItems.find((i) => i.productUuid === itemId)?.wishListUuid;
      removeFromWishlist({ productUuid: itemId, wishListUuid });
      return;
    }

    setIsResolvingWishlistVariant(true);
    let variantUUID = itemId;
    try {
      const res = await api.get<DefaultVariantResponse>(
        `/get-default-variant/${itemId.trim()}?priceSort=1&userDefine=0`,
      );
      if (res?.data?.variantUUID) variantUUID = res.data.variantUUID;
    } catch (err) {
      console.error("[GlobalProductCard] get-default-variant error (wishlist):", err);
    } finally {
      setIsResolvingWishlistVariant(false);
    }

    addToWishlist({ productUuid: itemId, variantUuid: variantUUID, name: title, price });
  };

  // Cart-এ product আছে কিনা check — persistent "Added" দেখাবে
  const addedToCart = cartItems.some(
    (item) =>
      item.productUuid === itemId ||
      item.variantUuid === itemId ||
      item.id === itemId,
  );

  /**
   * Verify-then-commit, same as the product-page Add to Cart / Buy Now flow.
   *
   * This card has no variant selector, so get-default-variant is always
   * called to resolve WHICH variant is being added (unlike verify-order-
   * product's recovery use elsewhere, this call is unconditional here — it
   * always ran, even before verification existed). Once resolved,
   * verify-order-product decides whether the backend still accepts it; a
   * rejected variant that get-default-variant's own recovery cannot fix must
   * never reach the cart.
   */
  const handleAddToCart = async () => {
    if (!itemId) {
      toast.error("Product ID missing");
      return;
    }

    setLoadingCart(true);
    try {
      // ── Resolve which variant this card actually represents ──────────
      let variantUUID = itemId; // default fallback
      let finalPrice = price;
      let finalRegPrice = originalPrice;
      let finalImage = image;
      let finalInStock = inStock;
      let finalAttributes = "";

      try {
        const res = await api.get<DefaultVariantResponse>(
          `/get-default-variant/${itemId.trim()}?priceSort=1&userDefine=0`,
        );

        if (res?.data) {
          variantUUID = res.data.variantUUID || itemId;

          // API returns price as number OR {source, parsedValue}
          const rawOffer = res.data.offerPrice as any;
          const rawReg = res.data.regularPrice as any;
          finalPrice =
            typeof rawOffer === "object" ? (rawOffer?.parsedValue ?? price) : (rawOffer ?? price);
          finalRegPrice =
            typeof rawReg === "object" ? (rawReg?.parsedValue ?? originalPrice) : (rawReg ?? originalPrice);

          if (res.data.thumbnailURL) finalImage = res.data.thumbnailURL;
          if (res.data.isTba !== undefined) {
            finalInStock = !res.data.isTba;
            setIsTba(res.data.isTba);
          }
          // e.g. "Cosmic Orange, CH (Dual Nano Sim), 256GB"
          if ((res.data as any).attributes?.trim()) {
            finalAttributes = (res.data as any).attributes.trim();
          }
        }
      } catch (err) {
        console.error("[GlobalProductCard] get-default-variant error:", err);
        // Resolution itself failed (e.g. network) — fall back to the raw
        // productUuid as the variant, same as before verification existed.
      }

      if (!finalInStock) {
        toast.error("This product is not in stock!");
        return;
      }

      const isAlreadyInCart = cartItems.some(
        (item) => item.id === variantUUID || item.variantUuid === variantUUID,
      );

      if (isAlreadyInCart) {
        toast.error("Product already added to cart!");
        return;
      }

      // ── Verify BEFORE the item ever reaches the cart ──────────────────
      try {
        const { patches, unresolved } = await verifyOrderProduct({
          id: variantUUID,
          productUuid: itemId,
          variantUuid: variantUUID,
          name: title || "Product",
        });

        if (unresolved.length > 0) {
          toast.error(`Validation failed. ${unresolved[0].reason}`);
          return;
        }

        if (patches.length > 0) {
          variantUUID = patches[0].variantUuid;
          if (typeof patches[0].price === "number") finalPrice = patches[0].price;
          if (typeof patches[0].originalPrice === "number") {
            finalRegPrice = patches[0].originalPrice;
          }
          if (patches[0].image) finalImage = patches[0].image;
        }
      } catch (err) {
        console.error("[GlobalProductCard] order verification failed:", err);
        // The check itself errored (e.g. network down) rather than rejecting
        // this specific line — add with the resolved variant instead of
        // blocking the user entirely.
      }

      // Build name: "iPhone 17 Pro Max  (Cosmic Orange, CH (Dual Nano Sim), 256GB)"
      const cartName = finalAttributes
        ? `${title || "Product"}  (${finalAttributes})`
        : title || "Product";

      dispatch(
        addToCart({
          id: variantUUID,
          productUuid: itemId,
          variantUuid: variantUUID,
          name: cartName,
          brand: "",
          image: finalImage || "",
          price: finalPrice,
          originalPrice: finalRegPrice,
          quantity: 1,
          inStock: finalInStock,
          slug: slug || "",
          minBookingPrice: minBookingPrice ?? 0,
        }),
      );
      trackAddToCart({ id: itemId || variantUUID, name: cartName, price: finalPrice, quantity: 1 });

      toast.success(`Added to cart! 🛒`);
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2 mt-auto">
      {endOfLife ? (
        /* ── End of Life — ALL buttons disabled ─────────────────────────── */
        <>
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 h-11 px-1 rounded-[13px] text-[13px] font-semibold border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
            <span>Discontinued</span>
          </button>
          {/* Quick view disabled too */}
          <button
            disabled
            className="w-10 h-11 flex items-center justify-center rounded-[13px] border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed opacity-60 shrink-0"
            aria-label="Quick view unavailable"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </>
      ) : showTbaFlag ? (
        /* ── TBA ─────────────────────────────────────────────────────────── */
        <>
          {allowPreOrder ? (
            <button
              onClick={handleWishlistToggle}
              disabled={isAddingWishlist}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-1 rounded-[13px] text-[13px] sm:text-[14px] font-semibold border transition-all duration-300 active:scale-95 bg-[#6D3F0E] border-[#6D3F0E] text-white hover:bg-[#5a3300] hover:shadow-md disabled:opacity-60 disabled:cursor-wait"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Pre-Order</span>
            </button>
          ) : (
            <button
              onClick={handleWishlistToggle}
              disabled={isAddingWishlist}
              className={`flex-1 flex items-center justify-center gap-2 h-11 px-1 rounded-[13px] text-[13px] sm:text-[14px] leading-none font-semibold border transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-wait ${
                isWishlisted
                  ? "bg-red-50 border-red-300 text-red-500"
                  : "bg-white border-orange-200 text-[#6D3F0E] hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </button>
          )}
          <ProductQuicView slug={slug} productUuid={itemId} title={title} price={price} image={image} showTbaFlag={showTbaFlag} />
        </>
      ) : isTba ? (
        /* ── isTba (not in stock) ──────────────────────────────────────── */
        <>
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2.5 h-11 py-0.75 px-1 rounded-[13px] text-[16px] leading-none font-medium border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
            <span>Not in Stock</span>
          </button>
          <ProductQuicView slug={slug} productUuid={itemId} title={title} price={price} image={image} showTbaFlag={showTbaFlag} />
        </>
      ) : (
        /* ── Normal — Add to Cart + Quick View ─────────────────────────── */
        <>
          <button
            onClick={handleAddToCart}
            disabled={loadingCart}
            className={`flex-1 flex items-center justify-center gap-2.5 h-11 py-[5px] px-1 rounded-[13px] text-[16px] leading-none font-semibold border transition-all duration-300 active:scale-95 shadow-[0px_0px_8px_4px_#E9CCAE52] ${
              loadingCart
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-wait"
                : addedToCart
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-orange-200 text-[#6D3F0E] hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
            }`}
          >
            {loadingCart ? (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <span className="hidden sm:inline">Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                <span className="hidden sm:inline">Added!</span>
                <span className="sm:hidden">Added!</span>
              </>
            ) : (
              <>
                <CartIcon className="w-5 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 hidden md:block"/>
                <span>Add to Cart</span>
              </>
            )}
          </button>
          <ProductQuicView slug={slug} productUuid={itemId} title={title} price={price} image={image} showTbaFlag={showTbaFlag}/>
        </>
      )}
    </div>
  );
}
