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

// ─── Types ────────────────────────────────────────────────────────────────────

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
}) => {
  const dispatch      = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const itemId        = productUuid || slug || title || "";
  const isWishlisted  = wishlistItems.some((i) => i.productUuid === itemId);

  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError]       = useState(false);

  const handleAddToCart = () => {
    // Dispatch to Redux store
    dispatch(
      addToCart({
        id: itemId,
        name: title || "Product",
        brand: "",
        image: image || "",
        price: price,
        originalPrice: originalPrice,
        quantity: 1,
        inStock: inStock,
        slug: slug || "",
      })
    );
    toast.success(`Added to cart! 🛒`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    dispatch(
      toggleWishlist({
        productUuid:   itemId,
        productName:   title || "",
        productSlug:   slug || "",
        image:         image || "",
        price,
        originalPrice,
        discount,
        badge:         badge || "",
        inStock,
        isBestDeal,
        addedAt:       new Date().toISOString(),
      })
    );
  };

  const formatPrice = (val: number) => val > 0 ? "৳" + val.toLocaleString("en-IN") : "Price on Request";

  const imgSrc = !image || imgError ? NoImg : image;

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl cursor-pointer w-full h-full flex flex-col shadow-lg transition-all duration-500 hover:shadow-sm select-none">
      <div className="bg-white p-2 sm:p-3 lg:p-4 pb-0! rounded-2xl sm:rounded-3xl">

        {/* Top Badges */}
        <div className="flex justify-between items-start mb-2 sm:mb-3 h-5 sm:h-6">
          {discount > 0 ? (
            <span className="bg-[#ff7575] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              {discount}%
            </span>
          ) : <span />}
          {badge ? (
            <span className="bg-[linear-gradient(93.36deg,#222222_-28.88%,#6D3F0E_93.21%)] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md max-w-[80%]">
              {badge}
            </span>
          ) : <span />}
        </div>

        {/* Product Image — fixed-height container keeps every card aligned */}
        <Link  href={`/product/${slug || title?.toLowerCase().replace(/\s+/g, "-")}`} className="block px-3">
          <div className="relative flex justify-center items-center h-32 sm:h-40 md:h-44 lg:h-50 transition-all duration-500">
            {/* <div
              className="absolute inset-0 m-auto rounded-full pointer-events-none"
              style={{
                width: "75%", height: "75%",
                background: "#E9CCAEBA",
                backdropFilter: "blur(71px)",
                WebkitBackdropFilter: "blur(71px)",
                filter: "blur(32px)", zIndex: 0,
              }}
            /> */}
            <div className="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-110">
              <Image
                src={imgSrc}
                alt={title || "Product image"}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                className="object-contain w-[75%]! mx-auto"
                onError={() => setImgError(true)}
              />
            </div>
          </div>
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 sm:gap-2 ml-auto p-2 sm:p-2.5 lg:p-3 -mr-1.5 sm:-mr-2 lg:-mr-4 rounded-tl-2xl sm:rounded-tl-3xl">
            {/* Wishlist toggle */}
            <button
              onClick={handleWishlist}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-300 text-red-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth={2} className="w-3 h-3 sm:w-4 sm:h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
            {/* Compare */}
            <Link href="/product-compare"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Compare"
            >
              <CompareIcon />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-1">
        {/* Title & Stock */}
        <div className="mb-1 sm:mb-2 text-left h-9 sm:h-10">
          <h3 className="text-[#575757] font-bold text-[11px] sm:text-xs md:text-sm leading-snug line-clamp-2" title={title}>
            {title}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 sm:gap-2 mb-2 sm:mb-4">
          <span className="text-gray-900 font-bold text-[12px] sm:text-sm md:text-base lg:text-lg xl:text-xl">
            {formatPrice(price)}
          </span>
          {originalPrice > 0 && originalPrice !== price && (
            <span className="text-gray-400 text-[10px] sm:text-xs line-through">              
            {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-1 sm:gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] lg:text-[12px] font-semibold border transition-all duration-300 active:scale-95 shadow-[0px_0px_8px_4px_#E9CCAE52] ${
              addedToCart
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-orange-200 text-gray-800 hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
            }`}
          >
            {addedToCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="hidden sm:inline">Added!</span>
                <span className="sm:hidden">✓</span>
              </>
            ) : (
              <>
                <CartIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0" />
                <span className="">Add to Cart</span>
              </>
            )}
          </button>
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