"use client";

import React, { useState } from "react";
import { CartIcon, CompareIcon, FaireIcon } from "@/icon";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import ProductImage from "@/images/product.png";
import NoImg from "@/images/no_images.png";
import Link from "next/link";
import ProductQuicView from "@/components/ProductDetails/ProductQuicView";

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

  const handleAddToCart = () => {
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

  const imgSrc = image || ProductImage.src;

  return (
    <div className="group relative bg-white rounded-3xl cursor-pointer w-full shadow-lg transition-all duration-500 hover:shadow-sm select-none">
      <div className="bg-[#E7E7E7] lg:p-4 p-2 pb-0! rounded-3xl">

        {/* Top Badges */}
        <div className="flex justify-between items-start mb-3">
          {discount > 0 ? (
            <span className="bg-[#ff7575] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              -{discount}%
            </span>
          ) : <span />}
          {badge ? (
            <span className="bg-[linear-gradient(93.36deg,#222222_-28.88%,#6D3F0E_93.21%)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {badge}
            </span>
          ) : <span />}
        </div>

        {/* Product Image */}
        <Link href={`/product/${slug || title?.toLowerCase().replace(/\s+/g, "-")}`} className="block">
          <div className="relative flex justify-center items-center mb-4 transition-all duration-500">
            <div
              className="absolute inset-0 m-auto rounded-full pointer-events-none"
              style={{
                width: "75%", height: "75%",
                background: "#E9CCAEBA",
                backdropFilter: "blur(71px)",
                WebkitBackdropFilter: "blur(71px)",
                filter: "blur(32px)", zIndex: 0,
              }}
            />
            <div className="relative z-10 w-[85px] h-[95px] lg:w-[97px] lg:h-[126px] transition-transform duration-500 group-hover:scale-110 drop-shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={title || "Product image"}
                className="w-full h-full object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
              />
            </div>
          </div>
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          {isBestDeal && (
            <span className="flex items-center gap-1 bg-[#CB843B] text-white lg:text-xs text-[10px] font-semibold lg:px-3 px-2 py-1.5 rounded-full shadow-sm">
              <FaireIcon /> Best Deal
            </span>
          )}
          <div className="flex gap-2 ml-auto bg-white lg:p-3 p-2 lg:-mr-4 -mr-1.75 rounded-tl-3xl">
            {/* Wishlist toggle */}
            <button
              onClick={handleWishlist}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-300 text-red-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth={2} className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
            {/* Compare */}
            <Link href="/product-compare"
              className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Compare"
            >
              <CompareIcon />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Title & Stock */}
        <div className="mb-2 text-left">
          <h3 className="text-[#575757] font-bold text-sm leading-snug line-clamp-1" title={title}>
            {title}
          </h3>
          <p className={`text-xs font-bold mt-1 ${inStock ? "text-green-500" : "text-red-400"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-gray-900 font-bold lg:text-xl text-[12px]">
            {formatPrice(originalPrice)}
          </span>
          {originalPrice > 0 && originalPrice !== price && (
            <span className="text-gray-400 text-sm line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1 lg:py-2.5 lg:px-2 rounded-2xl lg:text-[12px] text-[10px] font-semibold border-1 transition-all duration-300 active:scale-95 shadow-[0px_0px_8px_4px_#E9CCAE52] ${
              addedToCart
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-orange-200 text-gray-800 hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
            }`}
          >
            {addedToCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <CartIcon className="w-4 h-4 lg:w-6 lg:h-6" />
                Add to Cart
              </>
            )}
          </button>
          <ProductQuicView />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
