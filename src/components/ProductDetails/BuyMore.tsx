/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image";
import NoImg from "@/images/no_images.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, removeFromCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

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

  if (!items || items.length === 0) return null;

  const handleToggle = (item: BuyMoreItem) => {
    const isChecked = cartIdSet.has(item.id);
    if (isChecked) {
      dispatch(removeFromCart(item.id));
      toast.success(`${item.name} removed from cart`);
    } else {
      dispatch(
        addToCart({
          id: item.id,
          name: item.name,
          brand: "",
          image: item.image || "",
          price: item.price ?? 0,
          originalPrice: item.originalPrice ?? 0,
          quantity: 1,
          inStock: item.inStock ?? true,
          slug: item.slug || "",
        })
      );
      toast.success(`${item.name} added to cart! 🛒`);
    }
  };

  return (
    <div>
      <h3 className="font-bold dark:text-white text-black text-base pb-3">
        Estimated delivery: 0-3 days
      </h3>
      <div className="space-y-2 bg-[#222222] hover:bg-[#2a2420] transition-colors p-3 rounded-2xl">
        <h3 className="font-normal text-base text-white">🔥 Buy More Save More!</h3>
        <div className="space-y-2">
          {items.map((item: BuyMoreItem) => {
            const isChecked = cartIdSet.has(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
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
                  onChange={() => handleToggle(item)}
                  className="sr-only"
                />

                {/* Product image */}
                <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image && item.image.trim() ? item.image : NoImg}
                    alt={item.name}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
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
