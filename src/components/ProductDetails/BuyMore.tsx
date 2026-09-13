/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Image from "next/image";
import NoImg from "@/images/no_images.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, removeFromCart } from "@/store/slices/cartSlice";
import { trackAddToCart } from "@/lib/analytics/pixelEvents";
import { api } from "@/lib/api";
import { verifyOrderProduct } from "@/lib/verify-order-product";
import toast from "react-hot-toast";

interface DefaultVariantResponse {
  statusCode: number;
  status: string;
  message?: string;
  data?: {
    productUUID: string;
    variantUUID: string;
    regularPrice: number;
    offerPrice: number;
    wholeSalePrice: number;
    thumbnailURL: string;
    isTba: boolean;
  };
}

interface BuyMoreItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  slug?: string;
  inStock?: boolean;
}

interface BuyMoreProps {
  items: BuyMoreItem[];
}

const formatPrice = (n: number) =>
  n > 0 ? "৳" + n.toLocaleString("en-US") : "0";

const BuyMore: React.FC<BuyMoreProps> = ({ items }: any) => {
  const dispatch  = useAppDispatch();
  // ── Derive checked state directly from persisted cart ──────────
  // No local state needed — cart is persisted via redux-persist,
  // so after reload cartItems already has the right items.
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartIdSet = new Set(cartItems.map((c: any) => c.id));
  // Which item is mid-flight — keyed by item.id — so only that row disables.
  const [togglingId, setTogglingId] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

  /**
   * item.id is this bundle's own product uuid (bundleProdUuid), not a
   * variant — same as ProductCardBuy/FrequentlyBoughtTogether, the variant is
   * resolved via get-default-variant and confirmed via verify-order-product
   * before it ever reaches the cart.
   */
  const handleToggle = async (item: BuyMoreItem) => {
    const isChecked = cartIdSet.has(item.id);
    if (isChecked) {
      dispatch(removeFromCart(item.id));
      toast.success(`${item.name} removed from cart`);
      return;
    }

    setTogglingId(item.id);
    try {
      let variantUUID = item.id;
      let finalPrice = item.price ?? 0;
      let finalRegPrice = item.originalPrice ?? 0;
      let finalImage = item.image || "";

      try {
        const res = await api.get<DefaultVariantResponse>(
          `/get-default-variant/${item.id}?priceSort=1&userDefine=0`,
        );
        if (res?.data) {
          if (res.data.isTba) {
            toast.error(`${item.name} is not available right now.`);
            return;
          }
          variantUUID = res.data.variantUUID || variantUUID;
          finalPrice = res.data.offerPrice ?? finalPrice;
          finalRegPrice = res.data.regularPrice ?? finalRegPrice;
          if (res.data.thumbnailURL) finalImage = res.data.thumbnailURL;
        }
      } catch (err) {
        console.error(`[BuyMore] get-default-variant failed for ${item.id}:`, err);
      }

      try {
        const { patches, unresolved } = await verifyOrderProduct({
          id: variantUUID,
          productUuid: item.id,
          variantUuid: variantUUID,
          name: item.name,
        });

        if (unresolved.length > 0) {
          toast.error(`${item.name}: ${unresolved[0].reason}`);
          return;
        }

        if (patches.length > 0) {
          const patch = patches[0];
          if (patch.replaced) {
            toast.error(`${item.name} is currently unavailable.`);
            return;
          }
          variantUUID = patch.variantUuid;
          if (typeof patch.price === "number") finalPrice = patch.price;
          if (typeof patch.originalPrice === "number") finalRegPrice = patch.originalPrice;
          if (patch.image) finalImage = patch.image;
        }
      } catch (err) {
        console.error("[BuyMore] order verification failed:", err);
      }

      dispatch(
        addToCart({
          id: variantUUID,
          productUuid: item.id,
          variantUuid: variantUUID,
          name: item.name,
          brand: "",
          image: finalImage,
          price: finalPrice,
          originalPrice: finalRegPrice,
          quantity: 1,
          inStock: item.inStock ?? true,
          slug: item.slug || "",
        })
      );
      trackAddToCart({ id: item.id, name: item.name, price: finalPrice });
      toast.success(`${item.name} added to cart! 🛒`);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <h3 className="font-bold dark:text-white text-black text-base pb-3 hidden">
        Estimated delivery: 0-3 days
      </h3>
      <div className="space-y-2 bg-[#222222] hover:bg-[#2a2420] transition-colors p-3 rounded-2xl">
        <h3 className="font-normal text-base text-white">🔥 Buy More Save More!</h3>
        <div className="space-y-2">
          {items.map((item: BuyMoreItem) => {
            const isChecked = cartIdSet.has(item.id);
            const isToggling = togglingId === item.id;
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${isToggling ? "opacity-60 cursor-wait" : "cursor-pointer"}
                  ${isChecked
                    ? "border-orange-400 ring-2 ring-orange-400 bg-orange-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"
                  }`}
              >
                {/* Custom checkbox — pointer-events-none, label handles click */}
                <div
                  className={`w-4 h-4 shrink-0 rounded-sm border-2 flex items-center justify-center pointer-events-none transition-colors
                    ${isChecked ? "bg-orange-500 border-orange-500" : "border-gray-300 bg-white"}`}
                >
                  {isChecked && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                {/* Hidden real input */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isToggling}
                  onChange={() => handleToggle(item)}
                  className="sr-only"
                />

                {/* Product image */}
                <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image && item.image.trim() ? item.image : NoImg}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-contain p-0.5"
                  />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isChecked ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                    {item.name}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isChecked ? "text-orange-500" : "text-gray-900"}`}>
                    {formatPrice(item.price)}
                  </p>
                  {item.originalPrice > item.price && item.price > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuyMore;
