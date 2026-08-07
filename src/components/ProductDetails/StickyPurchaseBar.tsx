/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import type { CareOption } from "./DazzleCare";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, LogIn } from "lucide-react";


const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-5h16l1 5" />
    <path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const DeliveryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 4v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface StickyPurchaseBarProps {
  productId?: string;
  variantUuid?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  productOriginalPrice?: number;
  productSlug?: string;
  qty?: number;
  onQtyChange?: (val: number) => void;
  price?: any;
  isUnavailable?: boolean;
  monthlyDuration?: string;
  storeAvailabilityHref?: string;
  expressDeliveryText?: string;
  standardDeliveryText?: string;
  onExploreFinancing?: () => void;
  onWhatsApp?: () => void;
  // Care plan & price type — same logic as ProductInfo
  selectedPriceType?: "offer" | "regular";
  selectedCareOptions?: CareOption[];
  careTotalOffer?: number;
  careTotalRegular?: number;
}

export default function StickyPurchaseBar({
  productId,
  variantUuid,
  productName,
  productImage,
  productPrice = 0,
  productOriginalPrice = 0,
  productSlug,
  qty = 1,
  onQtyChange,
  price = 0,
  isUnavailable = false,
  monthlyDuration = "12 months",
  storeAvailabilityHref = "#",
  expressDeliveryText = "Express Delivery in 4 hrs – Dhaka",
  standardDeliveryText = "Standard Delivery: Get in 1–3 days",
  onExploreFinancing,
  onWhatsApp,
  selectedPriceType = "offer",
  selectedCareOptions = [],
  careTotalOffer = 0,
  careTotalRegular = 0,
}: StickyPurchaseBarProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();
  const [loadingBuyNow, setLoadingBuyNow] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ── Unique cart id = variantUuid + care plan id (if any) ──────
  const planId          = selectedCareOptions[0]?.id ?? "";
  const targetCartId    = `${variantUuid || productId || ""}${planId ? `__${planId}` : ""}`;

  // "Added" — only if THIS exact variant+plan combo is already in cart
  const addedToCart = cartItems.some((item) => item.id === targetCartId);

  // ── Combined prices (product + selected care plan) ────────────
  const combinedOfferPrice    = (productPrice ?? 0) + careTotalOffer;
  const combinedRegularPrice  = (productOriginalPrice ?? 0) + careTotalRegular;

  // Price shown in the bar — whichever the user selected
  const displayPrice = selectedPriceType === "regular" ? combinedRegularPrice : combinedOfferPrice;

  // EMI always from regular price
  const emiMonthly = Math.round(combinedRegularPrice / 12);

  // ── Cart name — product name always prefixed ─────────────────
  const plan = selectedCareOptions[0] as CareOption | undefined;
  const variantName  = productName ?? "";
  const carePlanSuffix = plan
    ? `\nwith ${plan.title}${plan.description ? ` (${plan.description})` : ""} (${
        plan.price > 0 ? plan.price.toLocaleString() + " BDT" : "included"
      })`
    : "";
  const cartName = `${variantName}${carePlanSuffix}`;

  const handleAddToCart = () => {
    if ((!productId && !variantUuid) || isUnavailable) return false;

    dispatch(
      addToCart({
        id: targetCartId,                          // unique per variant+plan combo
        variantUuid: variantUuid || productId || "",
        productUuid: productId || "",
        accessoriesUuid: planId,
        name: cartName,
        brand: "",
        image: productImage || "",
        price: displayPrice,
        originalPrice: combinedRegularPrice,
        quantity: qty,
        inStock: true,
        slug: productSlug || "",
      })
    );

    if (!addedToCart) {
      // Only toast on first add — not on qty update
      toast.success(`${productName || "Product"} added to cart! 🛒`);
    }
    return true;
  };

  const handleBuyNow = async () => {
    // Not logged in → show login modal
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setLoadingBuyNow(true);
    try {
      const success = handleAddToCart();
      if (success) {
        router.push("/checkout");
      }
    } catch (err) {
      console.error("[StickyPurchaseBar] Buy now error:", err);
    } finally {
      setLoadingBuyNow(false);
    }
  };

  return (
    <div>
      <div className="fixed md:bottom-0 bottom-0 left-0 right-0 z-50 bg-[#f5f5f7] dark:bg-[#3e3329] border-t border-gray-200 dark:border-gray-700/60 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 gap-4">

            {/* Store Pickup */}
            <div className="hidden md:flex items-start gap-2 shrink-0">
              <StoreIcon />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Store Pickup</p>
                <Link  href={`/shop-location`} className="text-xs text-[#af7e4a] hover:underline mt-0.5 inline-block">
                  View store availability
                </Link>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-300 shrink-0" />

            {/* Home Delivery */}
            <div className="hidden md:flex items-start gap-2 shrink-0">
              <DeliveryIcon />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Home Delivery</p>
                <p className="text-xs text-orange-500 font-medium mt-0.5">{expressDeliveryText}</p>
                <p className="text-xs text-gray-500 mt-0.5 dark:text-white/90">{standardDeliveryText}</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-300 shrink-0" />

            {/* Price block */}
            <div className="flex flex-col justify-center shrink-0">
              {isUnavailable ? (
                <p className="text-xl sm:text-2xl font-bold leading-tight text-gray-400 dark:text-gray-500">
                  Not in stock
                </p>
              ) : (
                <>
                  {/* Main price — offer or regular depending on selection */}
                  <p className="text-xl sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                    {displayPrice > 0 ? `${displayPrice.toLocaleString()} BDT` : "Price on request"}
                  </p>

                  {/* EMI line — always from regular price */}
                  {combinedRegularPrice > 0 && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 dark:text-white/90">
                      {emiMonthly.toLocaleString()} for {monthlyDuration}
                    </p>
                  )}

                  <button
                    onClick={onExploreFinancing}
                    className="flex items-center gap-0.5 text-xs sm:text-sm text-[#af7e4a] font-semibold hover:underline mt-0.5 w-fit"
                  >
                    Explore financing options
                    <ChevronRightIcon />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1" />

            {/* Quantity */}
            <div className="hidden md:block">
              <QuantitySelector value={qty} onChange={(val) => onQtyChange?.(val)} />
            </div>

            {/* Add to Cart + Buy Now */}
            <div className="flex items-center md:gap-3 gap-1 shrink-0">
              <button
                onClick={handleAddToCart}
                disabled={isUnavailable}
                className={`shrink-0 md:px-6 px-3 sm:px-8 md:py-3 py-1 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 whitespace-nowrap shadow-sm
                  ${isUnavailable
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                    : addedToCart
                    ? "bg-green-500 text-white cursor-pointer"
                    : "bg-[#E9CCAE] hover:bg-[#D4B89A] active:bg-[#C0A486] text-black cursor-pointer"
                  }`}
              >
                {isUnavailable ? "Not Available" : addedToCart ? (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added!
                  </span>
                ) : "Add to cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isUnavailable || loadingBuyNow}
                className={`shrink-0 md:px-6 px-3 sm:px-8 md:py-3 py-1 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 whitespace-nowrap shadow-sm cursor-pointer
                  ${isUnavailable || loadingBuyNow
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                    : "bg-[#222222] hover:bg-[#444444] active:bg-[#000000] text-white"
                  }`}
              >
                {loadingBuyNow ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : "Buy Now"}
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <button
        onClick={onWhatsApp}
        aria-label="Contact via WhatsApp"
        className="fixed md:bottom-5 bottom-10 mb-24 md:mb-0 right-4 z-50 w-12 h-12 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-150"
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}
