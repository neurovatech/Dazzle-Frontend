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
import type { CareOption } from "./DazzleCare";
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
  selectedCareOptions = [],
  selectedPriceType = "offer",
}: any) {
  const stockStatus: StockStatus = inStock ? "in_stock" : "eol";
  const variantPrice = selectedVariant?.price ?? 0;
  const productPrice = alldata?.discountedPrice ?? basePrice ?? 0;
  const effectivePrice = variantPrice > 0 ? variantPrice : productPrice;
  const isVariantUnavailable = effectivePrice === 0;

  // ── Care plan totals ──────────────────────────────────────────
  const carePlans: CareOption[] = selectedCareOptions ?? [];
  const careTotalOffer = carePlans.reduce(
    (s: number, o: CareOption) => s + (o.price > 0 ? o.price : 0),
    0,
  );
  const careTotalOriginal = carePlans.reduce(
    (s: number, o: CareOption) =>
      s + (o.originalPrice > 0 ? o.originalPrice : 0),
    0,
  );

  const combinedOfferPrice = effectivePrice + careTotalOffer;
  const combinedOriginalPrice =
    (alldata?.regularPrice ?? baseOriginalPrice ?? 0) + careTotalOriginal;

  // ── The price actually used for cart — based on what user selected ──
  const cartPrice =
    selectedPriceType === "regular"
      ? combinedOriginalPrice
      : combinedOfferPrice;

  // Redux dispatch
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const handleAddToCart = () => {
    if (isVariantUnavailable) return;

    const variantName  = selectedVariant?.name ?? "";
    const productTitle = title ?? "";
    const cartName = variantName
      ? variantName.startsWith(productTitle)
        ? variantName
        : `${productTitle} ${variantName}`.trim()
      : productTitle;

    const plan = carePlans[0] as CareOption | undefined;
    const carePlanSuffix = plan
      ? `\nwith ${plan.title}${plan.description ? ` (${plan.description})` : ""} (${
          plan.price > 0 ? plan.price.toLocaleString() + " BDT" : "included"
        })`
      : "";
    const fullName = `${cartName}${carePlanSuffix}`;

    const targetProductUuid  = alldata?.productUuid || alldata?.id || "";
    const targetVariantUuid  = selectedVariant?.variantUuid || selectedVariant?.id || "";
    const planId             = plan?.id ?? "";

    // Unique id = variantUuid + plan (same variant + same plan = same cart row)
    const targetCartId = `${targetVariantUuid || targetProductUuid || code}${planId ? `__${planId}` : ""}`;

    const isAlreadyInCart = cartItems.some((item) => item.id === targetCartId);

    dispatch(
      addToCart({
        id: targetCartId,
        variantUuid: targetVariantUuid || targetProductUuid || "",
        productUuid: targetProductUuid,
        accessoriesUuid: planId,
        name: fullName,
        brand: brand,
        image:
          alldata?.thumbnailImg ||
          alldata?.thumbnail ||
          alldata?.image ||
          selectedVariant?.thumbnailUrl ||
          "",
        price: cartPrice,
        originalPrice: combinedOriginalPrice,
        quantity: qty ?? 1,
        inStock: !isVariantUnavailable,
        slug: alldata?.productSlug || "",
      }),
    );

    if (!isAlreadyInCart) {
      toast.success(`${cartName} added to cart! 🛒`);
    }
  };

  // Admin profit meter hidden state
  const [showProfitMeter, setShowProfitMeter] = useState(false);

  // Competitor price comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  const productId =
    alldata?.productUuid || alldata?.uuid || alldata?.id || code || "";

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
        image:
          alldata?.thumbnailImg || alldata?.thumbnail || alldata?.image || "",
        price: alldata?.discountedPrice || 0,
        originalPrice: alldata?.regularPrice || 0,
        discount: 0,
        badge: "",
        inStock,
        isBestDeal: false,
        addedAt: new Date().toISOString(),
      }),
    );
  };
  
  console.log(alldata, "alldataalldata")

  return (
    <div className="space-y-5 text-gray-800 dark:text-gray-100">
      <div className="flex items-start justify-between gap-3 mb-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] dark:text-white leading-snug">
            {title}
          </h1>

          <div className="flex gap-1 mb-0">
            <span className="text-gray-500 dark:text-white">By:</span>
            <Link
              href={`/brands/${brand_slug}`}
              className="text-[#B57908] dark:text-[#D4A97A] hover:underline font-semibold"
            >
              {brand}
            </Link>
          </div>

          <div className="flex gap-1 items-center pt-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.4448 5.09148C4.37355 5.85148 4.32355 7.19648 4.7723 7.76898C4.7723 7.76898 4.56105 6.29148 6.4548 4.43773C7.2173 3.69148 7.39355 2.67648 7.1273 1.91523C6.97605 1.48398 6.6998 1.12773 6.4598 0.878982C6.3198 0.732732 6.4273 0.491482 6.63105 0.500232C7.86355 0.555232 9.86105 0.897731 10.7098 3.02773C11.0823 3.96273 11.1098 4.92898 10.9323 5.91148C10.8198 6.53898 10.4198 7.93398 11.3323 8.10523C11.9836 8.22773 12.2986 7.71023 12.4398 7.33773C12.4986 7.18273 12.7023 7.14398 12.8123 7.26773C13.9123 8.51898 14.0061 9.99273 13.7786 11.2615C13.3386 13.714 10.8548 15.499 8.3873 15.499C5.3048 15.499 2.85105 13.7352 2.2148 10.5427C1.95855 9.25398 2.08855 6.70398 4.07605 4.90398C4.22355 4.76898 4.4648 4.88898 4.4448 5.09148Z"
                fill="url(#paint0_radial_1528_57439)"
              />
              <path
                d="M9.51384 9.67764C8.37759 8.21514 8.88634 6.54639 9.16509 5.88139C9.20259 5.79389 9.10259 5.71139 9.02384 5.76514C8.53509 6.09764 7.53384 6.88014 7.06759 7.98139C6.43634 9.47014 6.48134 10.1989 6.85509 11.0889C7.08009 11.6251 6.81884 11.7389 6.68759 11.7589C6.56009 11.7789 6.44259 11.6939 6.34884 11.6051C6.07919 11.3462 5.887 11.0172 5.79384 10.6551C5.77384 10.5776 5.67259 10.5564 5.62634 10.6201C5.27634 11.1039 5.09509 11.8801 5.08634 12.4289C5.05884 14.1251 6.46009 15.5001 8.15509 15.5001C10.2913 15.5001 11.8476 13.1376 10.6201 11.1626C10.2638 10.5876 9.92884 10.2114 9.51384 9.67764Z"
                fill="url(#paint1_radial_1528_57439)"
              />
              <defs>
                <radialGradient
                  id="paint0_radial_1528_57439"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientTransform="matrix(-8.82338 -0.0382934 -0.0629107 14.4774 7.77677 15.5378)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.314" stopColor="#FF9800" />
                  <stop offset="0.662" stopColor="#FF6D00" />
                  <stop offset="0.972" stopColor="#F44336" />
                </radialGradient>
                <radialGradient
                  id="paint1_radial_1528_57439"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientTransform="matrix(-0.0932482 9.23158 6.94746 0.070167 8.27258 6.75743)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.214" stopColor="#FFF176" />
                  <stop offset="0.328" stopColor="#FFF27D" />
                  <stop offset="0.487" stopColor="#FFF48F" />
                  <stop offset="0.672" stopColor="#FFF7AD" />
                  <stop offset="0.793" stopColor="#FFF9C4" />
                  <stop
                    offset="0.822"
                    stopColor="#FFF8BD"
                    stopOpacity="0.804"
                  />
                  <stop
                    offset="0.863"
                    stopColor="#FFF6AB"
                    stopOpacity="0.529"
                  />
                  <stop offset="0.91" stopColor="#FFF38D" stopOpacity="0.209" />
                  <stop offset="0.941" stopColor="#FFF176" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            <span className="text-[#222222] dark:text-white">
              Please Hurry! Only 21 left in stock
            </span>
          </div>

          <div className="flex gap-1 items-center pt-1">
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.837294 10.1859C0.619676 9.9329 0.5 9.61027 0.5 9.27658C0.5 8.94289 0.619676 8.62026 0.837294 8.36729C1.1592 7.99301 1.48206 7.62491 1.80587 7.26301C1.70777 6.79348 1.61348 6.3192 1.52301 5.84015C1.46078 5.51224 1.51825 5.17288 1.68497 4.88374C1.8517 4.5946 2.11661 4.37486 2.43158 4.26444C2.89825 4.10063 3.36206 3.94301 3.82301 3.79158C3.97253 3.33539 4.12825 2.87729 4.29015 2.41729C4.40051 2.10289 4.6198 1.83841 4.90833 1.67174C5.19685 1.50507 5.53553 1.44724 5.86301 1.50872C6.3392 1.59825 6.81158 1.69158 7.28015 1.78872C7.63634 1.47063 7.99825 1.15348 8.36587 0.837294C8.61883 0.619676 8.94146 0.5 9.27515 0.5C9.60884 0.5 9.93147 0.619676 10.1844 0.837294C10.5559 1.15539 10.9197 1.47444 11.2759 1.79444C11.7521 1.69444 12.2325 1.5992 12.7173 1.50872C13.045 1.44687 13.384 1.50452 13.6728 1.67122C13.9617 1.83791 14.1812 2.10261 14.2916 2.41729C14.4535 2.87825 14.6092 3.33634 14.7587 3.79158C15.2197 3.94396 15.6835 4.10158 16.1502 4.26444C16.8001 4.49301 17.1859 5.16158 17.0587 5.84015C16.9673 6.32777 16.8716 6.81015 16.7716 7.28729C17.0954 7.65015 17.4192 8.02015 17.743 8.39729C17.9608 8.65009 18.0808 8.97262 18.081 9.30631C18.0813 9.64001 17.9619 9.96273 17.7444 10.2159C17.4235 10.5902 17.1006 10.9582 16.7759 11.3202C16.8749 11.7897 16.9692 12.2644 17.0587 12.7444C17.1206 13.0721 17.0629 13.4111 16.8962 13.7C16.7295 13.9888 16.4648 14.2083 16.1502 14.3187C15.6835 14.4825 15.2197 14.6402 14.7587 14.7916C14.6082 15.2487 14.4525 15.7068 14.2916 16.1659C14.1815 16.4808 13.9621 16.7458 13.6732 16.9128C13.3843 17.0798 13.0452 17.1376 12.7173 17.0759C12.244 16.9866 11.7716 16.8928 11.3002 16.7944C10.944 17.1135 10.5821 17.4306 10.2144 17.7459C9.96147 17.9635 9.63884 18.0832 9.30515 18.0832C8.97146 18.0832 8.64883 17.9635 8.39587 17.7459C8.02444 17.4278 7.66063 17.1087 7.30444 16.7887C6.82825 16.8887 6.34777 16.984 5.86301 17.0744C5.53531 17.1363 5.1963 17.0786 4.90746 16.9119C4.61863 16.7452 4.39911 16.4805 4.28872 16.1659C4.12862 15.7093 3.9729 15.2512 3.82158 14.7916C3.35623 14.639 2.8924 14.4819 2.43015 14.3202C2.11518 14.2097 1.85027 13.99 1.68355 13.7008C1.51682 13.4117 1.45935 13.0723 1.52158 12.7444C1.61301 12.2559 1.70872 11.773 1.80872 11.2959C1.48132 10.929 1.15749 10.559 0.837294 10.1859Z"
                fill="#6D3F0E"
              />
              <path
                d="M0.837294 10.1859C0.619676 9.9329 0.5 9.61027 0.5 9.27658C0.5 8.94289 0.619676 8.62026 0.837294 8.36729C1.1592 7.99301 1.48206 7.62491 1.80587 7.26301C1.70777 6.79348 1.61348 6.3192 1.52301 5.84015C1.46078 5.51224 1.51825 5.17288 1.68497 4.88374C1.8517 4.5946 2.11661 4.37486 2.43158 4.26444C2.89825 4.10063 3.36206 3.94301 3.82301 3.79158C3.97253 3.33539 4.12825 2.87729 4.29015 2.41729C4.40051 2.10289 4.6198 1.83841 4.90833 1.67174C5.19685 1.50507 5.53553 1.44724 5.86301 1.50872C6.3392 1.59825 6.81158 1.69158 7.28015 1.78872C7.63634 1.47063 7.99825 1.15348 8.36587 0.837294C8.61883 0.619676 8.94146 0.5 9.27515 0.5C9.60884 0.5 9.93147 0.619676 10.1844 0.837294C10.5559 1.15539 10.9197 1.47444 11.2759 1.79444C11.7521 1.69444 12.2325 1.5992 12.7173 1.50872C13.045 1.44687 13.384 1.50452 13.6728 1.67122C13.9617 1.83791 14.1812 2.10261 14.2916 2.41729C14.4535 2.87825 14.6092 3.33634 14.7587 3.79158C15.2197 3.94396 15.6835 4.10158 16.1502 4.26444C16.8002 4.49301 17.1859 5.16158 17.0587 5.84015C16.9673 6.32777 16.8716 6.81015 16.7716 7.28729C17.0954 7.65015 17.4192 8.02015 17.743 8.39729C17.9608 8.65009 18.0808 8.97262 18.081 9.30631C18.0813 9.64001 17.9619 9.96273 17.7444 10.2159C17.4235 10.5902 17.1006 10.9582 16.7759 11.3202C16.8749 11.7897 16.9692 12.2644 17.0587 12.7444C17.1206 13.0721 17.0629 13.4111 16.8962 13.7C16.7295 13.9888 16.4648 14.2083 16.1502 14.3187C15.6835 14.4825 15.2197 14.6402 14.7587 14.7916C14.6082 15.2487 14.4525 15.7068 14.2916 16.1659C14.1815 16.4808 13.9621 16.7458 13.6732 16.9128C13.3843 17.0798 13.0452 17.1376 12.7173 17.0759C12.244 16.9866 11.7716 16.8928 11.3002 16.7944C10.944 17.1135 10.5821 17.4306 10.2144 17.7459C9.96147 17.9635 9.63884 18.0832 9.30515 18.0832C8.97146 18.0832 8.64883 17.9635 8.39587 17.7459C8.02444 17.4278 7.66063 17.1087 7.30444 16.7887C6.82825 16.8887 6.34777 16.984 5.86301 17.0744C5.53531 17.1363 5.1963 17.0786 4.90746 16.9119C4.61863 16.7452 4.39911 16.4806 4.28872 16.1659C4.12862 15.7093 3.9729 15.2512 3.82158 14.7916C3.35623 14.639 2.8924 14.4819 2.43015 14.3202C2.11518 14.2097 1.85027 13.99 1.68355 13.7008C1.51682 13.4117 1.45935 13.0723 1.52158 12.7444C1.61301 12.2559 1.70872 11.773 1.80872 11.2959C1.48132 10.929 1.15749 10.559 0.837294 10.1859Z"
                stroke="#6D3F0E"
                strokeLinejoin="round"
              />
              <path
                d="M5.89062 10.345L8.16491 12.6907C9.23634 9.61502 10.1278 8.26502 12.1478 6.43359"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="font-bold bg-gradient-to-r from-[#6D3F0E] to-[#D3791B] bg-clip-text text-transparent flex dark:text-white">
              1 Year Official Warranty Support Except USA Variant
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 py-4">
            {/* Sold in last 12 hours */}
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-gray-700">
              🔥
              <span>{alldata?.metaTags?.soldCount} sold in last {alldata?.metaTags?.soldTime} hours</span>
            </div>

            {/* Customer review */}
            <div className="flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-gray-700">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 13H13V14H9V13ZM9 11H15V12H9V11ZM9 9H15V10H9V9Z"
                  fill="#6533F4"
                />
                <path
                  d="M10.2751 5.6085L8.00063 1L5.72613 5.6085L0.640625 6.3475L4.32063 9.935L3.45162 15L7.00063 13.1345V12.0045L4.78013 13.172L5.30613 10.104L5.39512 9.5855L5.01863 9.219L2.78963 7.0455L5.87013 6.598L6.39013 6.5225L6.62313 6.051L8.00063 3.2595L9.37812 6.051L9.61112 6.5225L10.1311 6.598L13.8581 7.1405L14.0006 6.15L10.2751 5.6085Z"
                  fill="#6533F4"
                />
              </svg>

              <span>{alldata?.metaTags?.reviewPoints} customer review</span>
            </div>

            {/* Viewing now */}
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-gray-700">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.4698 7.83C14.8817 6.30882 13.8608 4.99331 12.5332 4.04604C11.2056 3.09878 9.62953 2.56129 7.99979 2.5C6.37005 2.56129 4.79398 3.09878 3.46639 4.04604C2.1388 4.99331 1.11787 6.30882 0.529787 7.83C0.490071 7.93985 0.490071 8.06015 0.529787 8.17C1.11787 9.69118 2.1388 11.0067 3.46639 11.954C4.79398 12.9012 6.37005 13.4387 7.99979 13.5C9.62953 13.4387 11.2056 12.9012 12.5332 11.954C13.8608 11.0067 14.8817 9.69118 15.4698 8.17C15.5095 8.06015 15.5095 7.93985 15.4698 7.83ZM7.99979 12.5C5.34979 12.5 2.54979 10.535 1.53479 8C2.54979 5.465 5.34979 3.5 7.99979 3.5C10.6498 3.5 13.4498 5.465 14.4648 8C13.4498 10.535 10.6498 12.5 7.99979 12.5Z"
                  fill="#CB843B"
                />
                <path
                  d="M8 5C7.40666 5 6.82664 5.17595 6.33329 5.50559C5.83994 5.83524 5.45543 6.30377 5.22836 6.85195C5.0013 7.40013 4.94189 8.00333 5.05765 8.58527C5.1734 9.16721 5.45912 9.70176 5.87868 10.1213C6.29824 10.5409 6.83279 10.8266 7.41473 10.9424C7.99667 11.0581 8.59987 10.9987 9.14805 10.7716C9.69623 10.5446 10.1648 10.1601 10.4944 9.66671C10.8241 9.17336 11 8.59334 11 8C11 7.20435 10.6839 6.44129 10.1213 5.87868C9.55871 5.31607 8.79565 5 8 5ZM8 10C7.60444 10 7.21776 9.8827 6.88886 9.66294C6.55996 9.44318 6.30362 9.13082 6.15224 8.76537C6.00087 8.39991 5.96126 7.99778 6.03843 7.60982C6.1156 7.22186 6.30608 6.86549 6.58579 6.58579C6.86549 6.30608 7.22186 6.1156 7.60982 6.03843C7.99778 5.96126 8.39992 6.00087 8.76537 6.15224C9.13082 6.30362 9.44318 6.55996 9.66294 6.88886C9.8827 7.21776 10 7.60444 10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10Z"
                  fill="#CB843B"
                />
              </svg>

              <span>{alldata?.metaTags?.totalReview} people viewing this product now</span>
            </div>
          </div>

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
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
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

          <button className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
            <SwapIcon key="2" color="#B57908" width={16} height={16} />
          </button>
          {/* <button
              className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <Share2 key="3" size={16} className="text-[#B57908]" />
            </button> */}
        </div>
      </div>

      {/* Brand + Code + Hidden Profit Meter Gear */}
      <div className="flex justify-between items-center gap-2 text-sm border-b border-gray-100 dark:border-gray-800 pb-3 mb-0">
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
              {/* <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button> */}
            </div>
          ) : (
            <>
              {/* {alldata?.minBookingPrice > 0 && (
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Minimum Booking price BDT {alldata?.minBookingPrice?.toLocaleString()}
                </span>
              )} */}
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex gap-2.5 items-center">
                  <span className="text-[28px] font-extrabold text-[#B57908] dark:text-[#D4A97A]">
                    BDT {combinedOfferPrice.toLocaleString()}
                  </span>
                  {combinedOriginalPrice > combinedOfferPrice && (
                    <span className="text-[18px] text-[#FF7575] line-through font-semibold">
                      BDT {combinedOriginalPrice.toLocaleString()}
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

              {/* Care plan price breakdown */}
              {carePlans.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Price breakdown:
                  </p>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>Product</span>
                    <span className="font-semibold">
                      BDT {effectivePrice.toLocaleString()}
                    </span>
                  </div>
                  {carePlans.map((o: CareOption) => (
                    <div
                      key={o.id}
                      className="flex justify-between text-xs text-orange-600 dark:text-orange-400"
                    >
                      <span className="truncate pr-2">{o.title}</span>
                      <span className="font-semibold shrink-0">
                        + BDT {(o.price > 0 ? o.price : 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold text-[#B57908] dark:text-[#D4A97A] border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                    <span>Total</span>
                    <span>BDT {combinedOfferPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              {/* <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#B57908] hover:bg-[#9a6507] active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg mt-3"
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
