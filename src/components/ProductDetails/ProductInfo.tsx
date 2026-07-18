/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Share2,
  TrendingDown,
  DollarSign,
  Calculator,
  Percent,
  Settings,
  ShieldCheck,
  Users,
  Clock,
  Flame,
  ShoppingCart,
} from "lucide-react";
import { WarrantyIcon, SwapIcon, FaireIcon, StarIcon, EyeIcon } from "@/icon";
import QuantitySelector from "./QuantitySelector";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
type StockStatus = "in_stock" | "overselling" | "pre_order" | "eol";

interface ProductInfoProps {
  title: string;
  brand: string;
  code: string;
  inStock: boolean;
  stockNote?: string;
  warrantyNote?: string;
  stats: {
    soldLastHours: number;
    reviewCount: number;
    viewingNow: number;
  };
  price: number;
  originalPrice: number;
  emiFrom?: number;
  description?: string;
}

export default function ProductInfo({
  title,
  brand,
  code,
  inStock,
  warrantyNote,
  stats,
  price: basePrice,
  alldata,
  brand_slug,
  originalPrice: baseOriginalPrice,
  qty,
  onQtyChange,
  selectedVariant,  
}: any) {

  const stockStatus: StockStatus = inStock ? "in_stock" : "eol";
  const variantPrice = selectedVariant?.price ?? 0;
  const productPrice = alldata?.discountedPrice ?? basePrice ?? 0;
  const effectivePrice = variantPrice > 0 ? variantPrice : productPrice;
  const isVariantUnavailable = effectivePrice === 0;

  // Redux dispatch
  const dispatch = useAppDispatch();
  const handleAddToCart = () => {
    if (isVariantUnavailable) return;
    const cartName = selectedVariant?.name || title;
    // Variant attributes string (e.g. "Black | 256GB | JP/MEA")
    const variantStr = selectedVariant
      ? Object.values(selectedVariant.attributes ?? {}).join(" | ")
      : "";

    dispatch(
      addToCart({
        id: selectedVariant?.id || alldata?.productUuid || alldata?.id || code,
        name: variantStr ? `${cartName}` : cartName,
        brand: brand,
        image: alldata?.thumbnailImg || alldata?.thumbnail || alldata?.image || selectedVariant?.thumbnailUrl || "",
        price: effectivePrice,
        originalPrice: alldata?.regularPrice || baseOriginalPrice || 0,
        quantity: qty ?? 1,
        inStock: !isVariantUnavailable,
        slug: alldata?.productSlug || "",
      })
    );
    toast.success(`${cartName} added to cart! 🛒`);
  };

  // Admin profit meter hidden state
  const [showProfitMeter, setShowProfitMeter] = useState(false);

  // Competitor price comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  const productId = alldata?.productUuid || alldata?.uuid || alldata?.id || code || "";

const wishlistItems = useAppSelector((state) => state.wishlist.items);
const isWishlisted = wishlistItems.some((i) => i.productUuid === productId);
  const handlePriceComparison = () => {
    setIsComparing(true);
    setCompareResult(null);
    setTimeout(() => {
      setIsComparing(false);
      setCompareResult({
        starTech: basePrice + 3500,
        ryans: basePrice + 4500,
        savings: 3500,
      });
    }, 1500);
  };

    const handleWishlist = () => {
  dispatch(
    toggleWishlist({
      productUuid: productId,
      productName: title || "",
      productSlug: alldata?.productSlug || "",
      image: alldata?.thumbnailImg || alldata?.thumbnail || alldata?.image || "",
      price: alldata?.discountedPrice || 0,
      originalPrice: alldata?.regularPrice || 0,
      discount: 0,
      badge: "",
      inStock,
      isBestDeal: false,
      addedAt: new Date().toISOString(),
    })
  );
};

  return (
    <div className="space-y-5 text-gray-800 dark:text-gray-100">
      <div className="flex gap-3">
          <span className="text-gray-500 dark:text-white">By:</span>
          <Link
            href={`/brands/${brand_slug}`}
            className="text-[#B57908] dark:text-[#D4A97A] hover:underline font-semibold"
          >
            {brand}
          </Link>
        </div>
      <div className="flex items-start justify-between gap-3">
        
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] dark:text-white leading-snug">
            {title}
          </h1>
          {/* {isPreorder && (
            <span className="inline-block mt-2 bg-[#FAF3E7] text-[#7B4F1E] dark:bg-[#5E4221] dark:text-[#E9CCAE] text-xs font-extrabold px-3 py-1 rounded-full border border-[#7B4F1E]/20 animate-pulse">
              Pre-order Booking Open (Pay 5% Booking Deposit Only)
            </span>
          )} */}
          {/* {stockStatus === "overselling" && (
            <span className="inline-block mt-2 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200/50">
              ⚡ Overselling Allowed (Restocking: Ships in 10-14 days)
            </span>
          )} */}
          {/* {stockStatus === "eol" && (
            <span className="inline-block mt-2 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200/50">
              🚫 Discontinued (End-Of-Life Variant)
            </span>
          )} */}
        </div>

        {/* <div className="flex items-center gap-2 shrink-0">
          {[
            
          ].map((Icon, i) => (
            <button
              key={i}
              className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              {Icon}
            </button>
          ))}
        </div> */}
        <div className="flex gap-4">
          <button
              onClick={handleWishlist}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-gray-200 hover:border-red-300"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={16}
                className={`transition-colors duration-200 ${
                  isWishlisted
                    ? "text-red-500 fill-red-500"
                    : "text-[#B57908] fill-none"
                }`}
              />
            </button>


        <button
              className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <SwapIcon key="2" color="#B57908" width={16} height={16} />
            </button>
        <button
              className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <Share2 key="3" size={16} className="text-[#B57908]" />
            </button>
        </div>
      </div>

      {/* Brand + Code + Hidden Profit Meter Gear */}
      <div className="flex justify-between items-center gap-2 text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
        {/* <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowProfitMeter(!showProfitMeter)}
            className="w-5 h-5 text-gray-300 dark:text-white hover:text-[#B57908] transition hidden"
            title="Admin Cost View (Secret Toggle)"
          >
            <Settings size={14} className="animate-spin-slow" />
          </button>
        </div> */}

        {/* <div>
          <span className="text-gray-500">
            Code:{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              #{code}
            </span>
          </span>
        </div> */}
      </div>

      {/* Admin Profit Meter (Secrets Panel) */}
      {showProfitMeter && (
        <div className="bg-[#faf4ea] dark:bg-purple-950/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/20 text-purple-950 dark:text-[#d4a97a] flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Percent size={14} className="text-[#d4a97a]" />
            <span>
              <strong>Admin Profit Meter:</strong> Cost Price: BDT
              {Math.round(basePrice * 0.85).toLocaleString()} | Profit Margin:{" "}
              <strong className="text-[#d4a97a] dark:text-[#d4a97a]">
                15% (BDT{Math.round(basePrice * 0.15).toLocaleString()})
              </strong>
            </span>
          </div>
          <span className="text-[10px] bg-[#d4a97a] text-white dark:bg-purple-900/60 font-bold px-2 py-0.5 rounded">
            Hidden from Public
          </span>
        </div>
      )}

      {/* Availability Status */}
      <div className="hidden items-center justify-between py-2 text-sm bg-gray-50 dark:bg-[#25221F] p-3 rounded-xl border border-[#7B4F1E]/20 dark:border-gray-800/50">
        {/* <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-white">Availability:</span>
          <span
            className={`font-bold ${
              stockStatus === "eol"
                ? "text-red-500"
                : stockStatus === "pre_order"
                  ? "text-[#7B4F1E] dark:text-[#bd9961]"
                  : "text-emerald-600"
            }`}
          >
            {stockStatus === "in_stock" && "In Stock"}
            {stockStatus === "overselling" && "Restocking Soon"}
            {stockStatus === "pre_order" && "Pre-order Only"}
            {stockStatus === "eol" && "Discontinued (EOL)"}
          </span>
        </div> */}

        <div className="hidden items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
          <FaireIcon />
          {/* <span>
            {stockStatus === "in_stock" &&
              "Please Hurry! Only 21 left in stock"}
            {stockStatus === "overselling" &&
              "Purchase allowed. Backorders supported."}
            {stockStatus === "pre_order" && "Booking open. ETA: July 20"}
            {stockStatus === "eol" &&
              "Item discontinued. Replacement support only."}
          </span> */}
        </div>
      </div>

      {/* Warranty */}
      {warrantyNote && (
        <div className="hidden items-center gap-1.5 text-sm font-semibold">
          <WarrantyIcon />
          <span className="bg-linear-to-r from-[#6D3F0E] to-[#D3791B] dark:from-[#D4A97A] dark:to-[#B57908] bg-clip-text text-transparent">
            {warrantyNote}
          </span>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="hidden gap-2 text-xs">
        {[
          {
            icon: (
              <Flame size={12} className="text-orange-500 animate-bounce" />
            ),
            text: `${stats.soldLastHours} sold in last 12 hours`,
          },
          {
            icon: <StarIcon />,
            text: `${stats.reviewCount.toLocaleString()} customer reviews`,
          },
          {
            icon: <EyeIcon />,
            text: `${stats.viewingNow} people viewing now`,
          },
        ].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 bg-[#FF757514] dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold px-3 py-2 rounded-[10px]"
          >
            {item.icon}
            {item.text}
          </span>
        ))}
      </div>



      {/* Main Pricing block */}
      <div className="lg:flex items-center justify-between gap-4 text-sm bg-[#FAF9F6] dark:bg-[#25221F] p-4 rounded-2xl border border-[#7B4F1E]/20 dark:border-gray-800/80">
        <div className="space-y-1 w-full">

          {/* ── Variant unavailable message ── */}
          {isVariantUnavailable ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3">
                <span className="text-red-500 text-lg">😔</span>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Sorry! This variant is not in stock
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  Quantity:
                </span>
                <QuantitySelector
                  value={qty ?? 1}
                  onChange={(val) => onQtyChange?.(val)}
                />
              </div>
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ) : (
            <>
              {alldata?.minBookingPrice > 0 && (
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Minimum Booking price BDT {alldata?.minBookingPrice?.toLocaleString()}
                </span>
              )}
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex gap-2.5 items-center">
                  <span className="text-[28px] font-extrabold text-[#B57908] dark:text-[#D4A97A]">
                    BDT {alldata?.discountedPrice?.toLocaleString()}
                  </span>
                  {alldata?.regularPrice > alldata?.discountedPrice && (
                    <span className="text-[18px] text-[#FF7575] line-through font-semibold">
                      BDT {alldata?.regularPrice?.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3 lg:mt-0 mb-3 md:mb-0">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Quantity:
                  </span>
                  <QuantitySelector
                    value={qty ?? 1}
                    onChange={(val) => onQtyChange?.(val)}
                  />
                </div>
              </div>

              {/* Add to Cart Button */}
              {/* <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#B57908] hover:bg-[#9a6507] active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg mt-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button> */}
            </>
          )}

          <article
            className="
              prose prose-sm lg:prose-base dark:prose-invert max-w-none
              text-gray-700 dark:text-white mt-3
              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
              [&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-600 [&_th]:p-3 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-700 [&_th]:text-left
              [&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-600 [&_td]:p-3 [&_td]:text-center
              [&_h1]:text-gray-900 dark:[&_h1]:!text-white
              [&_h2]:text-gray-900 dark:[&_h2]:!text-white
              [&_h3]:text-gray-800 dark:[&_h3]:!text-white
              [&_p]:text-gray-700 dark:[&_p]:!text-white
              [&_span]:dark:!text-white
              [&_li]:text-gray-700 dark:[&_li]:!text-white
              [&_strong]:text-gray-900 dark:[&_strong]:!text-white
              [&_a]:text-blue-600 dark:[&_a]:!text-white dark:[&_a]:underline
              dark:[&_*]:!text-white
              overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: alldata?.shortDesc ?? "" }}
          />
        </div>
      </div>

      {/* ── Competitor Live Price Comparison ── */}
      <div className="bg-[#F8F9FB] hidden dark:bg-[#22201D] border border-[#7B4F1E]/20 dark:border-gray-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-[#B57908]" /> Live Competitor
            Price Checker
          </h3>
          <button
            type="button"
            onClick={handlePriceComparison}
            disabled={isComparing}
            className="text-xs font-bold text-[#7B4F1E] dark:text-[#bd9961] bg-white dark:bg-[#342D26] hover:bg-gray-50 border border-gray-200 dark:border-gray-700 py-1 px-3 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isComparing
              ? "Scanning Competitor Sites..."
              : "Compare Live Price"}
          </button>
        </div>

        {isComparing && (
          <div className="w-full h-1.5 bg-gray-250 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-500 to-[#7B4F1E] rounded-full animate-progress"
              style={{ width: "80%" }}
            />
          </div>
        )}

        {compareResult && (
          <div className="grid grid-cols-3 gap-2.5 pt-1.5 animate-fade-in">
            <div className="bg-white dark:bg-[#2D2A26] rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-850">
              <p className="text-[10px] text-gray-500 font-bold">Star Tech</p>
              <p className="text-sm font-semibold text-red-500">
                BDT{compareResult.starTech.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#2D2A26] rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-850">
              <p className="text-[10px] text-gray-500 font-bold">
                Ryans Computers
              </p>
              <p className="text-sm font-semibold text-red-500">
                BDT{compareResult.ryans.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-2.5 text-center border border-emerald-100/50 dark:border-emerald-900/30">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                You Save At Dazzle
              </p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                BDT{compareResult.savings.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
