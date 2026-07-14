/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GlobalModal from "@/components/share/GlobalModal";
import ProductBadges from "./ProductBadges";
import NoImg from "@/images/no_images.png";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { ProductApiData } from "@/app/(public)/product/[productSlug]/page";

interface ProductQuicViewProps {
  slug?: string;
  productUuid?: string;
  /** Fallback title shown before the API resolves */
  title?: string;
  /** Fallback price shown before the API resolves */
  price?: number;
  /** Fallback image shown before the API resolves */
  image?: string;
}

interface ProductApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: ProductApiData;
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

function ProductQuicView({
  slug,
  productUuid,
  title: fallbackTitle,
  price: fallbackPrice,
  image: fallbackImage,
}: ProductQuicViewProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<ProductApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product data when modal opens
  useEffect(() => {
    if (!open || !slug) return;

    setLoading(true);
    setProduct(null);
    setQty(1);
    setSelectedImage(0);

    api
      .get<ProductApiResponse>(`/product/${slug}`, { cache: "no-store" })
      .then((res) => {
        if (res?.data) setProduct(res.data);
      })
      .catch((err) => {
        console.error("[QuickView] fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, [open, slug]);

  // Derived display values — use API data if available, fall back to props
  const displayTitle    = product?.productName    ?? fallbackTitle    ?? "Product";
  const displayPrice    = product?.discountedPrice ?? fallbackPrice    ?? 0;
  const displayOriginal = product?.regularPrice    ?? 0;
  const displayBrand    = product?.brandName       ?? "";
  const displayCode     = product?.productCode     ?? "";
  const displayInStock  = product != null ? product.isActive : true;
  const displaySlug     = product?.productSlug     ?? slug ?? "";
  const displayId       = product?.productUuid     ?? productUuid ?? slug ?? "";

  const images: string[] =
    product?.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails
          .map((t) => t.mediaFileUrl || t.mediafileUrl || "")
          .filter(Boolean)
      : product?.thumbnailImg
        ? [product.thumbnailImg]
        : fallbackImage
          ? [fallbackImage]
          : [];

  const currentImage = images[selectedImage] || fallbackImage || NoImg.src;

  const discount =
    displayOriginal > 0 && displayPrice > 0
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  // Build badge array from API badge string or discount
  const badges = (() => {
    const list: { label: string; color: string }[] = [];
    if (discount > 0) list.push({ label: `${discount}%`, color: "pink" });
    if (product?.productBadge) list.push({ label: product.productBadge, color: "purple" });
    return list;
  })();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id:            displayId,
        name:          displayTitle,
        brand:         displayBrand,
        image:         currentImage,
        price:         displayPrice,
        originalPrice: displayOriginal,
        quantity:      qty,
        inStock:       displayInStock,
        slug:          displaySlug,
      })
    );
    toast.success(`${displayTitle} added to cart! 🛒`);
    setOpen(false);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout — next/link can't do programmatic nav here easily,
    // so we rely on the href in the button below after adding to cart.
  };

  console.log(product, "productproductproductproduct")

  return (
    <div>
      <GlobalModal isOpen={open} onClose={() => setOpen(false)}>
        <div className="p-5 overflow-y-auto scrollbar-hide md:max-h-138 max-h-132">

          {/* ── Image Gallery ── */}
          <div className="relative">
            {/* Badges */}
            {badges.length > 0 && (
              <div className="absolute top-3 left-3 right-3 flex justify-between z-10 pointer-events-none">
                <ProductBadges badges={badges} />
              </div>
            )}

            {/* Main image */}
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#2a2420]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#B57908] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Image
                  src={currentImage}
                  alt={displayTitle}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 90vw, 500px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = NoImg.src;
                  }}
                />
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden bg-white ${
                      selectedImage === i
                        ? "border-[#B57908]"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${i}`}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="pt-5 space-y-3">
            {/* Availability + Code */}
            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-semibold ${displayInStock ? "text-emerald-600" : "text-red-500"}`}
              >
                {displayInStock ? "In Stock" : "Out of Stock"}
              </span>
              {displayCode && (
                <span className="text-gray-500 dark:text-gray-400">
                  Code: <span className="font-semibold text-gray-800 dark:text-white">#{displayCode}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-[#222222] dark:text-white leading-snug">
              {loading ? (
                <span className="block h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                displayTitle
              )}
            </h2>

            {/* Brand */}
            {displayBrand && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By:{" "}
                <Link
                  href={`/brands/${product?.brandSlug ?? ""}`}
                  className="text-[#B57908] font-semibold hover:underline"
                >
                  {displayBrand}
                </Link>
              </p>
            )}

            {/* Price + Qty */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#B57908] dark:text-[#D4A97A]">
                  {loading ? (
                    <span className="block h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    formatPrice(displayPrice)
                  )}
                </span>
                {displayOriginal > 0 && displayOriginal !== displayPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(displayOriginal)}
                  </span>
                )}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Qty:</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-800 dark:text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    +
                  </button>
                </div>
              </div>



              <article
            className="
              prose prose-sm lg:prose-base dark:prose-invert max-w-none
              text-gray-700 dark:text-white

              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
              [&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-600 [&_th]:p-3 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-700 [&_th]:text-left
              [&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-600 [&_td]:p-3 [&_td]:text-center

              [&_h1]:text-gray-900 dark:[&_h1]:!text-white
              [&_h2]:text-gray-900 dark:[&_h2]:!text-white
              [&_h3]:text-gray-800 dark:[&_h3]:!text-white
              [&_h4]:text-gray-800 dark:[&_h4]:!text-white
              [&_h5]:text-gray-800 dark:[&_h5]:!text-white
              [&_h6]:text-gray-800 dark:[&_h6]:!text-white

              [&_p]:text-gray-700 dark:[&_p]:!text-white
              [&_span]:dark:!text-white
              [&_div]:dark:!text-white

              [&_li]:text-gray-700 dark:[&_li]:!text-white
              [&_ul]:text-gray-700 dark:[&_ul]:!text-white
              [&_ol]:text-gray-700 dark:[&_ol]:!text-white
              [&_li::marker]:text-gray-500 dark:[&_li::marker]:!text-white

              [&_strong]:text-gray-900 dark:[&_strong]:!text-white
              [&_b]:text-gray-900 dark:[&_b]:!text-white
              [&_em]:text-gray-700 dark:[&_em]:!text-white
              [&_i]:text-gray-700 dark:[&_i]:!text-white

              [&_a]:text-blue-600 dark:[&_a]:!text-white dark:[&_a]:underline

              [&_blockquote]:text-gray-700 dark:[&_blockquote]:!text-white
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-500

              [&_th]:text-gray-900 dark:[&_th]:!text-white
              [&_td]:text-gray-700 dark:[&_td]:!text-white

              [&_code]:text-gray-800 dark:[&_code]:!text-white
              [&_pre]:text-gray-800 dark:[&_pre]:!text-white

              dark:[&_*]:!text-white

              overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: product ? product?.shortDesc : '' }}
          />

            </div>

            {/* Short Description */}
            {product?.shortDesc && (
              <article
                className="
                  prose prose-sm lg:prose-base dark:prose-invert max-w-none
                  text-gray-700 dark:text-white

                  [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                  [&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-600 [&_th]:p-3 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-700 [&_th]:text-left
                  [&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-600 [&_td]:p-3 [&_td]:text-center

                  [&_h1]:text-gray-900 dark:[&_h1]:!text-white
                  [&_h2]:text-gray-900 dark:[&_h2]:!text-white
                  [&_h3]:text-gray-800 dark:[&_h3]:!text-white
                  [&_h4]:text-gray-800 dark:[&_h4]:!text-white
                  [&_h5]:text-gray-800 dark:[&_h5]:!text-white
                  [&_h6]:text-gray-800 dark:[&_h6]:!text-white

                  [&_p]:text-gray-700 dark:[&_p]:!text-white
                  [&_span]:dark:!text-white
                  [&_div]:dark:!text-white

                  [&_li]:text-gray-700 dark:[&_li]:!text-white
                  [&_ul]:text-gray-700 dark:[&_ul]:!text-white
                  [&_ol]:text-gray-700 dark:[&_ol]:!text-white
                  [&_li::marker]:text-gray-500 dark:[&_li::marker]:!text-white

                  [&_strong]:text-gray-900 dark:[&_strong]:!text-white
                  [&_b]:text-gray-900 dark:[&_b]:!text-white
                  [&_em]:text-gray-700 dark:[&_em]:!text-white
                  [&_i]:text-gray-700 dark:[&_i]:!text-white

                  [&_a]:text-blue-600 dark:[&_a]:!text-white dark:[&_a]:underline

                  [&_blockquote]:text-gray-700 dark:[&_blockquote]:!text-white
                  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-500

                  [&_th]:text-gray-900 dark:[&_th]:!text-white
                  [&_td]:text-gray-700 dark:[&_td]:!text-white

                  [&_code]:text-gray-800 dark:[&_code]:!text-white
                  [&_pre]:text-gray-800 dark:[&_pre]:!text-white

                  dark:[&_*]:!text-white
                  overflow-x-auto
                "
                dangerouslySetInnerHTML={{ __html: product.shortDesc }}
              />
            )}

            {/* View full details link */}
            {displaySlug && (
              <Link
                href={`/product/${displaySlug}`}
                className="inline-block text-xs text-[#B57908] hover:underline"
                onClick={() => setOpen(false)}
              >
                View full details →
              </Link>
            )}
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="rounded-b-2xl gap-4 bg-white p-4 shadow-[0px_-4px_26.6px_6px_#0000002B] flex items-center justify-between dark:bg-[#3d3228]">
          <button
            onClick={handleAddToCart}
            disabled={loading || !displayInStock}
            className="border border-[#E7E7E7] bg-[#F7F7F7] text-[#222222] px-4 py-2 rounded-md hover:bg-[#222222] hover:text-white transition-colors duration-500 w-full justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            ADD TO CART
          </button>
          <Link
            href={`/checkout`}
            onClick={handleBuyNow}
            className="border border-[#E7E7E7] bg-[#222222] text-white px-4 py-2 rounded-md hover:bg-[#F7F7F7] hover:text-[#222222] transition-colors duration-500 w-full justify-center flex items-center font-semibold"
          >
            BUY NOW
          </Link>
        </div>
      </GlobalModal>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:w-12 lg:h-12 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
}

export default ProductQuicView;
