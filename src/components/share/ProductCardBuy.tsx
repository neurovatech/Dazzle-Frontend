/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { CartIcon } from "@/icon";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import ProductQuicView from "@/components/ProductDetails/ProductQuicView";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

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
}: Props) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [loadingCart, setLoadingCart] = useState(false);
  const [isTba, setIsTba] = useState(!inStock);

  // Cart-এ product আছে কিনা check — persistent "Added" দেখাবে
  const addedToCart = cartItems.some(
    (item) =>
      item.productUuid === itemId ||
      item.variantUuid === itemId ||
      item.id === itemId,
  );

  const handleAddToCart = async () => {
    if (!itemId) {
      toast.error("Product ID missing");
      return;
    }

    setLoadingCart(true);
    try {
      const res = await api.get<DefaultVariantResponse>(
        `/get-default-variant/${itemId.trim()}?priceSort=1&userDefine=0`,
      );

      let variantUUID = itemId; // default fallback
      let finalPrice = price;
      let finalRegPrice = originalPrice;
      let finalImage = image;
      let finalInStock = inStock;
      let finalAttributes = "";

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

      toast.success(`Added to cart! 🛒`);
    } catch (error) {
      console.error("[GlobalProductCard] get-default-variant error:", error);
      // Fallback: API fail হলে productUuid দিয়ে cart-এ add করো
      const isAlreadyInCart = cartItems.some(
        (item) => item.id === itemId || item.variantUuid === itemId,
      );

      if (isAlreadyInCart) {
        toast.error("Product already added to cart!");
        return;
      }

      dispatch(
        addToCart({
          id: itemId,
          productUuid: itemId,
          variantUuid: itemId,
          name: title || "Product",
          brand: "",
          image: image || "",
          price: price,
          originalPrice: originalPrice,
          quantity: 1,
          inStock: inStock,
          slug: slug || "",
          minBookingPrice: minBookingPrice ?? 0,
        }),
      );
      toast.success(`Added to cart! 🛒`);
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2 mt-auto">
      {isTba ? (
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] lg:text-[12px] font-semibold border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3 h-3 sm:w-4 sm:h-4 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <span>Not in Stock</span>
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={loadingCart}
          className={`flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] lg:text-[12px] font-semibold border transition-all duration-300 active:scale-95 shadow-[0px_0px_8px_4px_#E9CCAE52] ${
            loadingCart
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-wait"
              : addedToCart
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-orange-200 text-gray-800 hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
          }`}
        >
          {loadingCart ? (
            <>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 animate-spin shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="hidden sm:inline">Adding...</span>
            </>
          ) : addedToCart ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3 h-3 sm:w-4 sm:h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="hidden sm:inline">Added!</span>
              <span className="sm:hidden">Added!</span>
            </>
          ) : (
            <>
              <CartIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="">Add to Cart</span>
            </>
          )}
        </button>
      )}
      <ProductQuicView
        slug={slug}
        productUuid={itemId}
        title={title}
        price={price}
        image={image}
      />
    </div>
  );
}
