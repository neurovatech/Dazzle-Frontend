"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { CartIcon } from "@/icon";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { trackAddToCart } from "@/lib/analytics/pixelEvents";
import { api } from "@/lib/api";
import { verifyOrderProduct, friendlyUnresolvedMessage } from "@/lib/verify-order-product";
import { isEmpty, formatPrice, type ClipProduct } from "./clipToCart.shared";

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
  // Cart syncs client-side only, so the server always renders "not added" —
  // gate on `mounted` so the first client render matches, avoiding a
  // hydration mismatch on products already in the cart.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAdded = mounted && cartItems.some((item) => item.id === product.id);
  const [isAdding, setIsAdding] = useState(false);

  const hasVideo = !isEmpty(product.videoUrl);
  const hasDiscount =
    product.discountedPrice &&
    product.regularPrice &&
    product.discountedPrice < product.regularPrice;

  /**
   * product.id is the product's own uuid, not a variant — same as
   * ProductCardBuy, the variant is resolved via get-default-variant and
   * confirmed via verify-order-product before it ever reaches the cart.
   */
  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded || isAdding) return;

    setIsAdding(true);
    try {
      let variantUUID = product.id;
      let finalPrice = product.discountedPrice ?? product.regularPrice ?? 0;
      let finalRegPrice = product.regularPrice ?? 0;
      let finalImage = product.image || "";

      try {
        const res = await api.get<DefaultVariantResponse>(
          `/get-default-variant/${product.id}?priceSort=1&userDefine=0`,
        );
        if (res?.data) {
          if (res.data.isTba) {
            toast.error(`${product.title} is not available right now.`);
            return;
          }
          variantUUID = res.data.variantUUID || variantUUID;
          finalPrice = res.data.offerPrice ?? finalPrice;
          finalRegPrice = res.data.regularPrice ?? finalRegPrice;
          if (res.data.thumbnailURL) finalImage = res.data.thumbnailURL;
        }
      } catch (err) {
        console.error(`[ClipToCartCard] get-default-variant failed for ${product.id}:`, err);
      }

      try {
        const { patches, unresolved } = await verifyOrderProduct({
          id: variantUUID,
          productUuid: product.id,
          variantUuid: variantUUID,
          name: product.title,
        });

        if (unresolved.length > 0) {
          console.error("[ClipToCartCard] verify-order-product rejected:", unresolved[0].reason);
          toast.error(friendlyUnresolvedMessage(unresolved[0]));
          return;
        }

        if (patches.length > 0) {
          const patch = patches[0];
          if (patch.replaced) {
            toast.error(`${product.title} is currently unavailable.`);
            return;
          }
          variantUUID = patch.variantUuid;
          if (typeof patch.price === "number") finalPrice = patch.price;
          if (typeof patch.originalPrice === "number") finalRegPrice = patch.originalPrice;
          if (patch.image) finalImage = patch.image;
        }
      } catch (err) {
        console.error("[ClipToCartCard] order verification failed:", err);
      }

      dispatch(
        addToCart({
          id: variantUUID,
          productUuid: product.id,
          variantUuid: variantUUID,
          name: product.title,
          brand: product.brandName || "",
          image: finalImage,
          price: finalPrice,
          originalPrice: finalRegPrice,
          quantity: 1,
          inStock: true,
          slug: product.productSlug || "",
        }),
      );
      trackAddToCart({ id: product.id, name: product.title, price: finalPrice, brand: product.brandName });
      toast.success(`${product.title} added to cart! 🛒`);
    } finally {
      setIsAdding(false);
    }
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
            // Swiper repositions slides via transform after its own mount;
            // until then the browser's native `loading="lazy"` distance check
            // can permanently mark an actually-visible slide's image as
            // offscreen and never load it. Skip lazy-loading for the slides
            // visible at the largest breakpoint (slidesPerView: 5) instead.
            priority={index < 5}
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
            disabled={isAdding}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100 ${
              isAdded ? "bg-green-500" : "bg-[#101518] dark:bg-white"
            }`}
            aria-label={isAdded ? "Added to cart" : "Add to cart"}
          >
            {isAdding ? (
              <svg className="w-4 h-4 animate-spin text-[#E9CCAE] dark:text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : isAdded ? (
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
