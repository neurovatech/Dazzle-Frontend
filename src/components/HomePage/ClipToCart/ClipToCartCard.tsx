"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { CartIcon } from "@/icon";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { isEmpty, formatPrice, type ClipProduct } from "./clipToCart.shared";

interface ClipToCartCardProps {
  product: ClipProduct;
  index: number;
  onOpenModal: (index: number) => void;
}

/**
 * One clip card.
 *
 * Deliberately breakpoint-free. The card used to carry a second, `lg:`-prefixed
 * design on top of the mobile one — a different background, a fixed 224px image
 * box instead of the 4:5 ratio, the round thumbnail moved from the seam to
 * above the content, and different type sizes. Desktop therefore looked like a
 * different component, and the two variants had to be kept in sync by hand.
 * The mobile design is the one that works, so it is now simply the design.
 */
export default function ClipToCartCard({
  product,
  index,
  onOpenModal,
}: ClipToCartCardProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isAdded = cartItems.some((item) => item.id === product.id);

  const hasVideo = !isEmpty(product.videoUrl);
  const hasDiscount =
    product.discountedPrice &&
    product.regularPrice &&
    product.discountedPrice < product.regularPrice;

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;
    dispatch(
      addToCart({
        id: product.id,
        name: product.title,
        brand: product.brandName || "",
        image: product.image || "",
        price: product.discountedPrice ?? product.regularPrice ?? 0,
        originalPrice: product.regularPrice ?? 0,
        quantity: 1,
        inStock: true,
        slug: product.productSlug || "",
      }),
    );
    toast.success(`${product.title} added to cart! 🛒`);
  };

  return (
    <div
      className="group cursor-pointer h-full w-full flex flex-col transition-all duration-500 hover:shadow-2xl bg-[#EDD9C4] rounded-2xl overflow-hidden"
      onClick={() => onOpenModal(index)}
    >
      {/* ── Image ── */}
      <div className="relative w-full shrink-0 aspect-[4/5]">
        <div className="absolute inset-0 overflow-hidden bg-gray-100 dark:bg-black/20">
          <Image
            src={!isEmpty(product.clipThumbnail) ? product.clipThumbnail! : product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {hasVideo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-md bg-black/30 border border-black/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Round product thumbnail, straddling the seam between image and body.
            Outside the overflow-hidden box above so it is not clipped. */}
        {product.image && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-[#2e2b28] border-4 border-white dark:border-[#2e2b28] shadow-md overflow-hidden z-30">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="bg-white dark:bg-[#2e2b28] flex flex-col flex-1 text-left relative pt-10 px-3 pb-3">
        {product.brandName && (
          <div className="flex items-center gap-1 mb-1">
            {product.brandLogo ? (
              <div className="relative w-4 h-4 shrink-0">
                <Image
                  src={product.brandLogo}
                  alt={product.brandName}
                  fill
                  sizes="16px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xs">🏷</span>
            )}
            <span className="text-xs text-gray-500 font-medium">
              {product.brandName}
            </span>
          </div>
        )}

        <p className="text-sm font-bold line-clamp-2 leading-tight text-[#CB843B] h-12">
          {product.title}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {product.discountedPrice || product.regularPrice ? (
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {formatPrice(product.discountedPrice ?? product.regularPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">0</span>
          )}

          <button
            onClick={handleCartClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 ${
              isAdded ? "bg-green-500" : "bg-[#101518] dark:bg-white"
            }`}
            aria-label={isAdded ? "Added to cart" : "Add to cart"}
          >
            {isAdded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="white"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <CartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9CCAE] dark:text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
