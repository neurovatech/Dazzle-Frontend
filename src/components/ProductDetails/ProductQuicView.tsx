/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalModal from "@/components/share/GlobalModal";
import ProductBadges from "./ProductBadges";
import ProductColorVariants from "./ProductColorVariants";
import ProductVariants from "./ProductVariants";
import NoImg from "@/images/no_images.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { trackAddToCart } from "@/lib/analytics/pixelEvents";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { verifyOrderProduct } from "@/lib/verify-order-product";
import type { ProductApiData } from "@/app/(public)/product/[productSlug]/page";
import {
  consolidateVariants,
  type VariantApiResponse,
  type ConsolidatedVariant,
} from "./utils";

interface ProductQuicViewProps {
  slug?: string;
  productUuid?: string;
  /** Fallback title shown before the API resolves */
  title?: string;
  /** Fallback price shown before the API resolves */
  price?: number;
  /** Fallback image shown before the API resolves */
  image?: string;
  isTba?: boolean;
  showTbaFlag?: boolean;
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
  isTba: isTbaProp,
  showTbaFlag: showTbaFlagProp,
}: ProductQuicViewProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<ProductApiData | null>(null);
  const [variantApiData, setVariantApiData] =
    useState<VariantApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBuyNow, setLoadingBuyNow] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {},
  );
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  // Fetch product data & variants when modal opens
  useEffect(() => {
    if (!open || !slug) return;

    setLoading(true);
    setProduct(null);
    setVariantApiData(null);
    setQty(1);
    setSelectedImage(0);
    setSelectedAttrs({});

    api
      .get<ProductApiResponse>(`/product/${slug}`, { cache: "no-store" })
      .then((res) => {
        if (res?.data) {
          setProduct(res.data);
          const pUuid = res.data.productUuid || productUuid;
          if (pUuid) {
            api
              .get<VariantApiResponse>(`/product-variants/${pUuid}`, {
                cache: "no-store",
              })
              .then((vRes) => {
                if (vRes?.data) setVariantApiData(vRes);
              })
              .catch((vErr) =>
                console.error("[QuickView] variant fetch failed:", vErr),
              );
          }
        }
      })
      .catch((err) => {
        console.error("[QuickView] fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, [open, slug, productUuid]);

  // Consolidate Variants
  const { groups, variants } = useMemo(
    () => consolidateVariants(variantApiData?.data ?? []),
    [variantApiData],
  );

  // Set default selected attributes when variants load
  useEffect(() => {
    if (groups.length === 0) return;
    const initial: Record<string, string> = {};
    groups.forEach((group) => {
      const firstVal = variants.find((v) => v.attributes[group])?.attributes[
        group
      ];
      if (firstVal) initial[group] = firstVal;
    });
    setSelectedAttrs(initial);
  }, [groups, variants]);

  const selectedVariant: ConsolidatedVariant | null = useMemo(() => {
    if (
      groups.length === 0 ||
      Object.keys(selectedAttrs).length < groups.length
    )
      return null;
    return (
      variants.find((v) =>
        groups.every((g) => v.attributes[g] === selectedAttrs[g]),
      ) ?? null
    );
  }, [groups, variants, selectedAttrs]);

  const isOptionAvailable = (group: string, option: string) =>
    variants.some(
      (v) =>
        v.attributes[group] === option &&
        Object.entries(selectedAttrs)
          .filter(([g]) => g !== group)
          .every(([g, val]) => v.attributes[g] === val),
    );

  const groupOptions = useMemo(
    () =>
      Object.fromEntries(
        groups.map((group) => [
          group,
          [
            ...new Set(
              variants
                .map((v) => v.attributes[group])
                .filter((val): val is string => !!val && val.trim() !== ""),
            ),
          ],
        ]),
      ),
    [groups, variants],
  );

  const colorGroupName = groups.find((g) => g.toLowerCase() === "color");
  const otherGroupNames = groups.filter((g) => g.toLowerCase() !== "color");

  // Base images from product
  const baseImages: string[] = useMemo(() => {
    if (product?.thumbnails && product.thumbnails.length > 0) {
      const list = product.thumbnails
        .map((t) => t.mediaFileUrl || t.mediafileUrl || "")
        .filter(Boolean);
      if (list.length > 0) return list;
    }
    if (product?.thumbnailImg) return [product.thumbnailImg];
    if (fallbackImage) return [fallbackImage];
    return [];
  }, [product, fallbackImage]);

  // Derived image list based on selected color variant
  const colorOptions = colorGroupName ? (groupOptions[colorGroupName] ?? []) : [];

  const images: string[] = useMemo(() => {
    if (!colorGroupName || !selectedAttrs[colorGroupName]) return baseImages;

    const selectedColorVal = selectedAttrs[colorGroupName];

    // ① Try variant thumbnailUrl (preferred)
    const colorVariantImages = variants
      .filter((v) => v.attributes[colorGroupName] === selectedColorVal && v.thumbnailUrl)
      .map((v) => v.thumbnailUrl);
    const uniqueColorImages = [...new Set(colorVariantImages)];
    if (uniqueColorImages.length > 0) return uniqueColorImages;

    // ② Fallback: baseImages[colorIndex] — each color maps to its index position
    const colorIdx = colorOptions.indexOf(selectedColorVal);
    if (colorIdx >= 0 && baseImages[colorIdx]) {
      const primary = baseImages[colorIdx];
      const rest = baseImages.filter((_, i) => i !== colorIdx);
      return [primary, ...rest];
    }

    return baseImages;
  }, [colorGroupName, selectedAttrs, variants, baseImages, colorOptions]);

  // Color & Text variant groups
  const colorVariantGroups = colorGroupName
    ? [
        {
          label: colorGroupName,
          type: "color" as const,
          options: (groupOptions[colorGroupName] ?? []).map((val, idx) => {
            const match = variants.find(
              (v) => v.attributes[colorGroupName] === val && v.thumbnailUrl,
            );
            // If no variant thumbnail, use baseImages[idx] so each color shows its own image
            const fallbackImg = baseImages[idx] || baseImages[0] || undefined;
            return {
              label: val,
              value: val,
              image: match?.thumbnailUrl || fallbackImg,
              disabled: !isOptionAvailable(colorGroupName, val),
            };
          }),
        },
      ]
    : [];

  const otherVariantGroups = otherGroupNames.map((group) => ({
    label: group,
    type: "text" as const,
    options: (groupOptions[group] ?? []).map((val) => ({
      label: val,
      value: val,
      disabled: !isOptionAvailable(group, val),
    })),
  }));

  const handleVariantChange = (group: string, value: string) => {
    if (!isOptionAvailable(group, value)) return;
    setSelectedAttrs((prev) => ({ ...prev, [group]: value }));
    if (group.toLowerCase() === "color") {
      setSelectedImage(0);
    }
  };

  // Derived display values
  const displayTitle = selectedVariant?.name
    ? selectedVariant.name.startsWith(product?.productName ?? "")
      ? selectedVariant.name
      : `${product?.productName ?? fallbackTitle ?? "Product"} ${selectedVariant.name}`
    : (product?.productName ?? fallbackTitle ?? "Product");

  const displayPrice =
    selectedVariant?.price && selectedVariant.price > 0
      ? selectedVariant.price
      : (product?.discountedPrice ?? fallbackPrice ?? 0);

  const displayOriginal =
    selectedVariant?.mrp && selectedVariant.mrp > 0
      ? selectedVariant.mrp
      : (product?.regularPrice ?? 0);

  const displayBrand = product?.brandName ?? "";
  const displayCode = product?.productCode ?? "";
  const displayInStock = product != null ? product.isActive : true;
  const displayIsTba = product != null ? (product.isTba ?? false) : false;
  const displaySlug = product?.productSlug ?? slug ?? "";
  const displayId =
    selectedVariant?.id ?? product?.productUuid ?? productUuid ?? slug ?? "";

  const currentImage = images[selectedImage] || fallbackImage || NoImg.src;

  const showTbaFlag =
    showTbaFlagProp ?? (isTbaProp !== undefined ? isTbaProp : (displayIsTba || !displayInStock));

  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some(
    (i) => i.productUuid === (displayId || productUuid || ""),
  );

  const handleWishlistToggle = () => {
    dispatch(
      toggleWishlist({
        productUuid: displayId || productUuid || "",
        productName: displayTitle,
        productSlug: displaySlug,
        image: currentImage,
        price: displayPrice,
        originalPrice: displayOriginal,
        discount: discount,
        badge: "",
        inStock: displayInStock,
        isBestDeal: false,
        addedAt: new Date().toISOString(),
      }),
    );
  };

  const discount =
    displayOriginal > 0 && displayPrice > 0
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  const badges = (() => {
    const list: { label: string; color: string }[] = [];
    if (discount > 0) list.push({ label: `${discount}%`, color: "pink" });
    if (product?.productBadge)
      list.push({ label: product.productBadge, color: "purple" });
    return list;
  })();

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

  /**
   * Verify-then-commit selection logic shared by ADD TO CART and BUY NOW.
   *
   * Resolves which variant is being purchased (the selected one, or the
   * catalogue default when none is chosen), asks the backend whether it is
   * still orderable, and only THEN writes it into the cart. A variant that
   * verify-order-product rejects — and that get-default-variant cannot
   * recover — must never reach the cart at all, so the check runs before the
   * dispatch, not after.
   */
  const handleAddToCart: any = async (options?: { showToast?: boolean }) => {
    const pUuid = product?.productUuid || productUuid || "";

    // These are only the fallback if the call below fails — quick view is not
    // the product details page, so its own attribute picker is not treated as
    // the source of truth for what gets added. get-default-variant is always
    // asked instead, exactly like the plain listing card's Add to Cart. The
    // product details page is the one surface that keeps its own selected
    // variant and does NOT call this endpoint.
    let variantUUID = selectedVariant?.id || displayId;
    let finalPrice = displayPrice;
    let finalRegPrice = displayOriginal;
    let finalImage = currentImage;
    let finalIsTba = !displayInStock;

    if (pUuid) {
      try {
        const res = await api.get<DefaultVariantResponse>(
          `/get-default-variant/${pUuid.trim()}?priceSort=0&userDefine=1`,
        );
        if (res?.data) {
          variantUUID = res.data.variantUUID || variantUUID;
          finalPrice = res.data.offerPrice ?? finalPrice;
          finalRegPrice = res.data.regularPrice ?? finalRegPrice;
          finalIsTba = res.data.isTba;
          if (res.data.thumbnailURL) {
            finalImage = res.data.thumbnailURL;
          }
        }
      } catch (err) {
        console.error("[QuickView] fetch default variant failed:", err);
      }
    }

    // isTba true হলে কার্টে add করি না
    if (finalIsTba) {
      toast.error("This product is not in stock!");
      return false;
    }

    const isAlreadyInCart = cartItems.some(
      (item) => item.id === variantUUID || item.variantUuid === variantUUID,
    );

    if (isAlreadyInCart) {
      if (options?.showToast !== false) {
        toast.error("Product already added to cart!");
      }
      // An object rather than `true`: BUY NOW needs the variant that actually
      // is in the cart. Still truthy for callers that only test success.
      return { ok: true, productUuid: pUuid, variantUuid: variantUUID };
    }

    try {
      const { patches, unresolved } = await verifyOrderProduct({
        id: variantUUID,
        productUuid: pUuid,
        variantUuid: variantUUID,
        name: displayTitle,
      });

      if (unresolved.length > 0) {
        toast.error(`Validation failed. ${unresolved[0].reason}`);
        return false;
      }

      if (patches.length > 0) {
        variantUUID = patches[0].variantUuid;
        if (typeof patches[0].price === "number") finalPrice = patches[0].price;
        if (typeof patches[0].originalPrice === "number") {
          finalRegPrice = patches[0].originalPrice;
        }
        if (patches[0].image) finalImage = patches[0].image;
      }
    } catch (err) {
      console.error("[QuickView] order verification failed:", err);
      // The check itself errored (e.g. network down) rather than rejecting
      // this specific line — add with the resolved variant instead of
      // blocking the user entirely.
    }

    dispatch(
      addToCart({
        id: variantUUID,
        productUuid: pUuid,
        variantUuid: variantUUID,
        name: displayTitle,
        brand: displayBrand,
        image: finalImage,
        price: finalPrice,
        originalPrice: finalRegPrice,
        quantity: qty,
        inStock: true,
        slug: displaySlug,
      }),
    );
    trackAddToCart({ id: pUuid || variantUUID, name: displayTitle, price: finalPrice, quantity: qty, brand: displayBrand });
    if (options?.showToast !== false) {
      toast.success(`${displayTitle} added to cart! 🛒`);
    }
    setOpen(false);
    return { ok: true, productUuid: pUuid, variantUuid: variantUUID };
  };

  // const handleBuyNow = async () => {

  //   if (!isAuthenticated) {
  //     setLoadingBuyNow(false);
  //     return;
  //   }

  //   setLoadingBuyNow(true);
  //   try {
  //     const success = await handleAddToCart({ showToast: false });
  //     if (success) {
  //       router.push("/checkout");
  //     }
  //   } catch (err) {
  //     console.error("[QuickView] Buy now error:", err);
  //   } finally {
  //     setLoadingBuyNow(false);
  //   }
  // };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      // setShowLoginWarning(true);
      return;
    }

    setShowLoginWarning(false); // logged in thakle warning hide

    if (loadingBuyNow) return;

    setLoadingBuyNow(true);
    try {
      // handleAddToCart now verifies BEFORE adding, so a rejected variant never
      // reaches the cart — success here means the item is already confirmed
      // orderable, and any failure has already shown its own reason.
      const added = await handleAddToCart();
      if (!added) return;

      router.push("/checkout");
    } catch (err) {
      console.error("[QuickView] Buy now error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingBuyNow(false);
    }
  };

  return (
    <div>
      <GlobalModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setShowLoginWarning(false);
        }}
      >
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
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-white dark:bg-[#2a2420]">
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
              {showTbaFlag ? (
                <span className="bg-[#6D3F0E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  TBA
                </span>
              ) : (
                <span
                  className={`font-semibold ${displayInStock ? "text-emerald-600" : "text-red-500"}`}
                >
                  {displayInStock ? "In Stock" : "Out of Stock"}
                </span>
              )}
              {displayCode && (
                <span className="text-gray-500 dark:text-gray-400">
                  Code:{" "}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    #{displayCode}
                  </span>
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
                {showTbaFlag ? (
                  /* TBA — price hide, শুধু TBA badge */
                  <span className="bg-[#6D3F0E] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                    TBA
                  </span>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Qty:
                </span>
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
            </div>

            {/* Variant selector */}
            {(colorVariantGroups.length > 0 ||
              otherVariantGroups.length > 0) && (
              <div className="border border-[#e7e7e7] dark:border-[#4a3f36] bg-[#f7f7f7] dark:bg-[#3e3329] text-black dark:text-white rounded-2xl p-4 mt-4">
                {colorVariantGroups.length > 0 && (
                  <ProductColorVariants
                    groups={colorVariantGroups}
                    selectedValues={selectedAttrs}
                    onChange={(sel) =>
                      Object.entries(sel).forEach(([g, v]) =>
                        handleVariantChange(g, v),
                      )
                    }
                  />
                )}
                {otherVariantGroups.length > 0 && (
                  <ProductVariants
                    groups={otherVariantGroups}
                    selectedValues={selectedAttrs}
                    onSelect={handleVariantChange}
                  />
                )}
                {selectedVariant && (
                  <div className="mt-4 pt-4 border-t border-[#e7e7e7] dark:border-[#4a3f36] flex items-center justify-between gap-3 lg:px-5">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                      {(() => {
                        const varName = selectedVariant.name ?? "";
                        const prodName = product?.productName ?? "";
                        return varName.startsWith(prodName)
                          ? varName
                          : `${prodName} ${varName}`.trim();
                      })()}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedVariant.price > 0 ? (
                        <>
                          <span className="text-base font-extrabold text-[#B57908]">
                            BDT {selectedVariant.price.toLocaleString()}
                          </span>
                          {selectedVariant.mrp > selectedVariant.price && (
                            <span className="text-sm text-gray-400 line-through">
                              BDT {selectedVariant.mrp.toLocaleString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg">
                          Not in stock
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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

          {showLoginWarning && (
            <div className="mt-4 flex items-center justify-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-center text-sm text-amber-800 dark:text-amber-400">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>
                Please{" "}
                <Link
                  href="/auth/login"
                  className=" text-gray-600 font-bold hover:underline"
                >
                  log in
                </Link>{" "}
                to continue with your purchase.
              </span>
            </div>
          )}
        </div>

        {/* ── Footer Buttons ── */}
        <div className="rounded-b-2xl gap-4 bg-white p-4 shadow-[0px_-4px_26.6px_6px_#0000002B] flex items-center justify-between dark:bg-[#3d3228]">
          {showTbaFlag ? (
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 active:scale-95 ${
                isWishlisted
                  ? "bg-red-50 border-red-300 text-red-500"
                  : "bg-white border-orange-200 text-[#6D3F0E] hover:bg-orange-50 hover:border-orange-400 hover:shadow-md"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </button>
          ) : (
            <>
              {!displayInStock ? (
                <button
                  disabled
                  className="border border-gray-200 bg-gray-100 text-gray-400 px-4 py-2 rounded-md w-full justify-center flex items-center gap-2 cursor-not-allowed font-semibold opacity-70"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  NOT IN STOCK
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="border border-[#E7E7E7] bg-[#F7F7F7] text-[#222222] px-4 py-2 rounded-md hover:bg-[#222222] hover:text-white transition-colors duration-500 w-full justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  ADD TO CART
                </button>
              )}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={loading || loadingBuyNow || !displayInStock}
                className={`border border-[#E7E7E7] bg-[#222222] text-white px-4 py-2 rounded-md hover:bg-[#F7F7F7] hover:text-[#222222] transition-colors duration-500 w-full justify-center flex items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  !displayInStock ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {loadingBuyNow ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin shrink-0"
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
                    Processing...
                  </span>
                ) : (
                  "BUY NOW"
                )}
              </button>
            </>
          )}
        </div>
      </GlobalModal>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:w-11 lg:h-11 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
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
