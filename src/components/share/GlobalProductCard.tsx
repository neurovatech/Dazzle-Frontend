"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CartIcon, CompareIcon, FaireIcon } from "@/icon";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import ProductImage from "@/images/product.png";
import NoImg from "@/images/no_images.png";
import Link from "next/link";
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
    regularPrice: number;
    offerPrice: number;
    wholeSalePrice: number;
    thumbnailURL: string;
    isTba: boolean;
  };
}

interface ProductCardProps {
  productUuid?: string;
  image?: string;
  discount?: number;
  badge?: string;
  title?: string;
  inStock?: boolean;
  price?: number;
  originalPrice?: number;
  isBestDeal?: boolean;
  slug?: string;
  uuid?: string;
  minBookingPrice?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  productUuid,
  image = "",
  discount = 0,
  badge,
  title = "Product",
  inStock = true,
  price = 0,
  originalPrice = 0,
  isBestDeal = false,
  slug,
  uuid,
  minBookingPrice = 0,
}) => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const itemId = productUuid || uuid || "";
  const isWishlisted = wishlistItems.some((i) => i.productUuid === itemId);

  const [loadingCart, setLoadingCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [isTba, setIsTba] = useState(!inStock);
  const cartItems = useAppSelector((state) => state.cart.items);

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

      console.log(res?.data, "res?.datares?.datares?.datares?.data");

      if (res?.data) {
        variantUUID = res.data.variantUUID || itemId;
        finalPrice = res.data.offerPrice ?? price;
        finalRegPrice = res.data.regularPrice ?? originalPrice;
        if (res.data.thumbnailURL) {
          finalImage = res.data.thumbnailURL;
        }
        if (res.data.isTba !== undefined) {
          finalInStock = !res.data.isTba;
          setIsTba(res.data.isTba);
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

      dispatch(
        addToCart({
          id: variantUUID,
          productUuid: itemId,
          variantUuid: variantUUID,
          name: title || "Product",
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
      // Fallback: API fail হলে productUuid দিয়ে cart-এ add করো
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

  const handleWishlist = () => {
    dispatch(
      toggleWishlist({
        productUuid: itemId,
        productName: title || "",
        productSlug: slug || "",
        image: image || "",
        price,
        originalPrice,
        discount,
        badge: badge || "",
        inStock,
        isBestDeal,
        addedAt: new Date().toISOString(),
      }),
    );
  };

  const formatPrice = (val: number) =>
    val > 0 ? "" + val.toLocaleString("en-IN") : "0";

  const imgSrc = !image || imgError ? NoImg : image;

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl cursor-pointer w-full h-full flex flex-col shadow-lg transition-all duration-500 hover:shadow-sm select-none">
      <div className="bg-white p-2 sm:p-3 lg:p-4 pb-0! rounded-2xl sm:rounded-3xl relative">
        {/* Top Badges */}
        <div className="flex justify-between items-start mb-2 sm:mb-3 h-5 sm:h-6 absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-50">
          {discount > 0 ? (
            <span className="bg-[#ff7575] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              {discount}%
            </span>
          ) : (
            <span />
          )}
          {badge ? (
            <span className="bg-[linear-gradient(93.36deg,#222222_-28.88%,#6D3F0E_93.21%)] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md max-w-[80%]">
              {badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Product Image — fixed-height, never crops, contains full image */}
        <Link
          href={`/product/${slug || title?.toLowerCase().replace(/\s+/g, "-")}`}
          className="block px-2 pt-2"
        >
          <div className="relative flex justify-center items-center h-40 sm:h-40 md:h-44 lg:h-48 transition-all duration-500">
            <div className="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-105">
              <Image
                src={imgSrc}
                alt={title || "Product image"}
                fill
                className="object-contain p-1 transition-transform duration-300"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
                unoptimized
                onError={() => setImgError(true)}
              />
            </div>
          </div>
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between relative z-50">
          <div className="flex gap-1 sm:gap-2 ml-auto p-1 -mr-2 sm:-mr-2 lg:-mr-4 rounded-tl-2xl sm:rounded-tl-3xl bg-[#F5F5F5] pl-2">
            {/* Wishlist toggle */}
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 mt-1 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-300 text-red-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
              }`}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
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
            {/* Compare */}
            <Link
              href="/product-compare"
              className="w-8 h-8 mt-1 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Compare"
            >
              <CompareIcon />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-1 bg-[#F5F5F5] rounded-tl-2xl rounded-b-2xl">
        {/* Title & Stock */}
        <div className="mb-1 sm:mb-2 text-left">
          <h3
            className="font-bold dark:text-[#222] text-[11px] sm:text-xs md:text-sm leading-snug line-clamp-2 h-10 text-=[#575757] "
            title={title}
          >
            {title}
          </h3>
          <div
            role="tooltip"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[60] w-max max-w-[220px] whitespace-normal rounded-lg bg-gray-900 text-white text-[10px] sm:text-xs px-2.5 py-1.5 shadow-lg opacity-0 scale-95 origin-bottom transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 "
          >
            {title}
            {/* little arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 sm:gap-2 mb-2 sm:mb-4">
          <span className="items-center flex gap-1 font-extrabold text-[18px] sm:text-sm md:text-base lg:text-lg xl:text-xl leading-[160%] tracking-[0%] align-middle text-gray-900">
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.05292 0.00767491C0.539583 -0.0591029 0.0729167 0.317281 0.0116667 0.848469C-0.0495833 1.37966 0.309167 1.86835 0.819583 1.93513L1.05 1.96548C1.51667 2.02619 1.86667 2.439 1.86667 2.93072V3.88686H0.7C0.312083 3.88686 0 4.21164 0 4.61535C0 5.01905 0.312083 5.34383 0.7 5.34383H1.86667V10.6861C1.86667 12.2948 3.12083 13.6 4.66667 13.6H5.6C8.69167 13.6 11.2 10.9896 11.2 7.77212V6.8008C11.2 5.19206 9.94583 3.88686 8.4 3.88686H7.93333C7.41708 3.88686 7 4.32092 7 4.85817C7 5.39543 7.41708 5.82949 7.93333 5.82949H8.4C8.91625 5.82949 9.33333 6.26354 9.33333 6.8008V7.77212C9.33333 9.91811 7.66208 11.6574 5.6 11.6574H4.66667C4.15042 11.6574 3.73333 11.2233 3.73333 10.6861V5.34383H4.9C5.28792 5.34383 5.6 5.01905 5.6 4.61535C5.6 4.21164 5.28792 3.88686 4.9 3.88686H3.73333V2.93072C3.73625 1.45858 2.68625 0.217114 1.28333 0.0349929L1.05292 0.00463937V0.00767491Z"
                fill="#101518"
              />
            </svg>
            {formatPrice(price)}
          </span>
          {originalPrice > 0 && originalPrice !== price && (
            <span className="text-gray-400 text-[16px]!  line-through flex items-center gap-1 pl-1">
              <svg
                width="9"
                height="10"
                viewBox="0 0 9 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.789687 0.0055311C0.404687 -0.0425939 0.0546875 0.228656 0.00875003 0.611468C-0.0371875 0.994281 0.231875 1.34647 0.614687 1.39459L0.7875 1.41647C1.1375 1.46022 1.4 1.75772 1.4 2.11209V2.80116H0.525C0.234062 2.80116 0 3.03522 0 3.32616C0 3.61709 0.234062 3.85116 0.525 3.85116H1.4V7.70116C1.4 8.86053 2.34063 9.80116 3.5 9.80116H4.2C6.51875 9.80116 8.4 7.91991 8.4 5.60116V4.90116C8.4 3.74178 7.45937 2.80116 6.3 2.80116H5.95C5.56281 2.80116 5.25 3.11397 5.25 3.50116C5.25 3.88834 5.56281 4.20116 5.95 4.20116H6.3C6.68719 4.20116 7 4.51397 7 4.90116V5.60116C7 7.14772 5.74656 8.40116 4.2 8.40116H3.5C3.11281 8.40116 2.8 8.08834 2.8 7.70116V3.85116H3.675C3.96594 3.85116 4.2 3.61709 4.2 3.32616C4.2 3.03522 3.96594 2.80116 3.675 2.80116H2.8V2.11209C2.80219 1.05116 2.01469 0.156468 0.9625 0.0252185L0.789687 0.00334347V0.0055311Z"
                  fill="#747474"
                />
              </svg>

              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Bottom Actions */}
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
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
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
      </div>
    </div>
  );
};

export default ProductCard;
