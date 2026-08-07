/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import ProductBadges from "./ProductBadges";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductVariants from "./ProductVariants";
import ProductCard from "./ProductCrad";
import BuyMore from "./BuyMore";
import ProductColorVariants from "./ProductColorVariants";
import DazzleCare, { CareOption } from "./DazzleCare";
import ContactOptions from "./ContactOptions";
import CheckAvailability from "./CheckAvailability";
import TransparentProfitMeterArea from "./TransparentProfitMeterArea";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import ProductSpecifications from "./ProductSpecifications";
import Breadcrumb from "@/components/share/Breadcrumb";
import MarqueeBulletinBar from "@/components/HomePage/MarqueeBulletinBar";
import StickyPurchaseBar from "./StickyPurchaseBar";
import PriceAvailability from "./PriceAvailability";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
// import type { ProductApiData } from "@/app/(public)/product/[productSlug]/page";
import RelatedProductSectionCom from "./RelatedProducts/RelatedProductSectionCom";
import DescriptionProductDetails from "./DescriptionProductDetails";
import DeliveryInfo from "./DeliveryInfo";

import {
  consolidateVariants,
  type VariantRow,
  type VariantApiResponse,
  type ConsolidatedVariant,
} from "./utils";

interface ProductDetailProps {
  product: any | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {},
  );
  const [selectedColor, setSelectedColor] = useState(0);
  const [emiOpen, setEmiOpen] = useState(false);
  const [selectedCareIds, setSelectedCareIds] = useState<string[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<
    "offer" | "regular"
  >("offer");
  const [showDescription, setShowDescription] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  console.log(product, "productproductproductproductproduct");

  const { data: variantApiData } = useQuery<VariantApiResponse>({
    queryKey: ["product-variants", product?.productUuid],
    queryFn: () =>
      api.get<VariantApiResponse>(`/product-variants/${product!.productUuid}`),
    enabled: !!product?.productUuid,
    staleTime: 10 * 60 * 1000,
  });

  const { data: planAccessoriesData } = useQuery({
    queryKey: ["plan-accessories", product?.productUuid],
    queryFn: () =>
      api.get<{
        statusCode: number;
        status: string;
        found: boolean;
        count: number;
        data: {
          planGroup: string;
          items: {
            accessoriesUuid: string;
            bundleCode: string;
            planGroup: string;
            productCode: string;
            productName: string;
            productSlug: string;
            regularPrice: number;
            discountedPrice: number;
            isTba: boolean;
            productBadge: string;
            stdWarrantyProdDay: number;
            salesOnRate: number;
            thumbnail: {
              fileUuid: string;
              mediaFileURL?: string;
              mediaFileUrl?: string;
            }[];
          }[];
        }[];
      }>(`/plan-accessories/${product!.productUuid}`),
    enabled: !!product?.productUuid,
    staleTime: 10 * 60 * 1000,
  });

  console.log(variantApiData, "variantApiDatavariantApiDatavariantApiData");

  // ── Consolidate ────────────────────────────────────────────────
  const { groups, variants } = useMemo(
    () => consolidateVariants(variantApiData?.data ?? []),
    [variantApiData],
  );

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

  // ── Base images from product API ──────────────────────────────
  const baseImages: string[] =
    product?.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails
          .map((img: any) => img.mediaFileUrl || img.mediafileUrl || "")
          .filter(Boolean)
      : product?.thumbnailImg
        ? [product.thumbnailImg]
        : [];

  const images: string[] = useMemo(() => {
    if (!colorGroupName || !selectedAttrs[colorGroupName]) return baseImages;

    const selectedColorVal = selectedAttrs[colorGroupName];
    const colorVariantImages = variants
      .filter(
        (v) =>
          v.attributes[colorGroupName] === selectedColorVal && v.thumbnailUrl,
      )
      .map((v) => v.thumbnailUrl);

    const uniqueColorImages = [...new Set(colorVariantImages)];
    return uniqueColorImages.length > 0 ? uniqueColorImages : baseImages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorGroupName, selectedAttrs, variants, baseImages]);

  // ── Color variant groups for ProductColorVariants ──────────────
  const colorVariantGroups = colorGroupName
    ? [
        {
          label: colorGroupName,
          type: "color" as const,
          options: (groupOptions[colorGroupName] ?? []).map((val, idx) => {
            const match = variants.find(
              (v) => v.attributes[colorGroupName] === val && v.thumbnailUrl,
            );
            // const fallbackImg = baseImages[idx] || baseImages[0] || IPHONE_ORANGE.src;
            return {
              label: val,
              value: val,
              image: match?.thumbnailUrl,
              disabled: !isOptionAvailable(colorGroupName, val),
            };
          }),
        },
      ]
    : [];

  // ── Other variant groups for ProductVariants ───────────────────
  const otherVariantGroups = otherGroupNames.map((group) => ({
    label: group,
    type: "text" as const,
    options: (groupOptions[group] ?? []).map((val) => ({
      label: val,
      value: val,
      disabled: !isOptionAvailable(group, val),
    })),
  }));

  // ── Pricing — variant price > 0 হলে সেটা নাও, নাহলে product API এর price ──
  const price =
    selectedVariant?.price && selectedVariant.price > 0
      ? selectedVariant.price
      : (product?.discountedPrice ?? 0);
  const originalPrice =
    selectedVariant?.mrp && selectedVariant.mrp > 0
      ? selectedVariant.mrp
      : (product?.regularPrice ?? 0);

  // ── Plan Accessories data processing ─────────────────────────
  const { dazzleCareOptions, frequentlyBoughtProducts } = useMemo(() => {
    const groups = planAccessoriesData?.data;
    if (!groups || !Array.isArray(groups)) {
      return { dazzleCareOptions: [], frequentlyBoughtProducts: [] };
    }

    const dazzleCareGroup = groups.find((g) => g.planGroup === "Dazzle_Care");
    const frequentlyBuyTogetherGroup = groups.find(
      (g) => g.planGroup === "Frequently_Buy_Together",
    );

    // Map Dazzle Care options
    const dcOptions = (dazzleCareGroup?.items ?? []).map((item) => {
      // productName을 ':' 또는 '(' 기준으로 title / description 분리
      const parenIdx = item.productName.indexOf("(");
      const colonIdx = item.productName.indexOf(":");
      let title = item.productName;
      let description = "";

      if (parenIdx !== -1) {
        title = item.productName.slice(0, parenIdx).trim();
        description = item.productName
          .slice(parenIdx + 1)
          .replace(/\)$/, "")
          .trim();
      } else if (colonIdx !== -1) {
        title = item.productName.slice(0, colonIdx).trim();
        description = item.productName.slice(colonIdx + 1).trim();
      }
      const optPrice =
        item.discountedPrice > 0
          ? item.discountedPrice
          : item.salesOnRate > 0
            ? Math.round((price * item.salesOnRate) / 100)
            : 0;

      const optOriginalPrice =
        item.regularPrice > 0 ? item.regularPrice : optPrice; // same if no markup

      // // thumbnail URL
      // const thumbUrl = item.thumbnail?.[0]?.mediaFileURL
      //               || item.thumbnail?.[0]?.mediaFileUrl
      //               || "";

      return {
        id: item.accessoriesUuid,
        title,
        description,
        price: optPrice,
        originalPrice: optOriginalPrice,
        icon: "🛡️",
        thumbnail:
          item.thumbnail?.[0]?.mediaFileURL ||
          item.thumbnail?.[0]?.mediaFileUrl ||
          "",
        salesOnRate: item.salesOnRate ?? 0,
        warrantyDays: item.stdWarrantyProdDay ?? 0,
      };
    });

    // Map Frequently Bought Together products
    const fbtProducts = (frequentlyBuyTogetherGroup?.items ?? []).map(
      (item) => {
        const img =
          item.thumbnail?.[0]?.mediaFileURL ||
          item.thumbnail?.[0]?.mediaFileUrl ||
          "";
        const offerPrice = item.discountedPrice > 0 ? item.discountedPrice : item.regularPrice ?? 0;
        const regPrice   = item.regularPrice ?? 0;
        return {
          // cart-ready raw data
          id:            item.accessoriesUuid,
          slug:          item.productSlug || "",
          rawPrice:      offerPrice,
          rawOriginalPrice: regPrice,
          // display data
          image: img,
          name: item.productName,
          inStock: !item.isTba,
          price: offerPrice > 0 ? `৳${offerPrice.toLocaleString("en-US")}` : "Price on request",
          originalPrice:
            regPrice > offerPrice
              ? `৳${regPrice.toLocaleString("en-US")}`
              : undefined,
        };
      },
    );

    return {
      dazzleCareOptions: dcOptions,
      frequentlyBoughtProducts: fbtProducts,
    };
  }, [planAccessoriesData, price]);

  // ── Derived care plan totals (offer + regular) ─────────────────
  const selectedCareOptions = useMemo(
    () => dazzleCareOptions.filter((o) => selectedCareIds.includes(o.id)),
    [selectedCareIds, dazzleCareOptions],
  );
  const careTotalOffer = selectedCareOptions.reduce(
    (s, o) => s + (o.price > 0 ? o.price : 0),
    0,
  );
  const careTotalRegular = selectedCareOptions.reduce(
    (s, o) => s + (o.originalPrice > 0 ? o.originalPrice : 0),
    0,
  );

  // ── Badges ─────────────────────────────────────────────────────
  const VALID_COLORS = ["pink", "purple", "green", "orange"] as const;
  type BadgeColor = (typeof VALID_COLORS)[number];
  const badgeList: { label: string; color: BadgeColor }[] =
    product?.badges && product.badges.length > 0
      ? product.badges.map((b: any) => ({
          label: b.label,
          color: (VALID_COLORS.includes(b.color as BadgeColor)
            ? b.color
            : "pink") as BadgeColor,
        }))
      : [{ label: "0%", color: "pink" as const }];

  // ── Fetch specifications from dedicated API ────────────────────
  const { data: specApiData } = useQuery({
    queryKey: ["product-specification", product?.productUuid],
    queryFn: () =>
      api.get<{
        statusCode: number;
        found: boolean;
        data: {
          specGroupUuid: string;
          groupName: string;
          groupSlug: string;
          productSpecifications: {
            specUuid: string;
            specification: string;
            specificationValue: string;
          }[];
        }[];
      }>(`/product-specification/${product!.productUuid}`),
    enabled: !!product?.productUuid,
    staleTime: 10 * 60 * 1000,
  });

  // Map API response → ProductSpecifications props shape
  const specGroups = useMemo(() => {
    const apiGroups = specApiData?.data;
    if (apiGroups && apiGroups.length > 0) {
      return apiGroups.map((group) => ({
        title: group.groupName,
        items: group.productSpecifications.map((spec) => ({
          label: spec.specification,
          value: spec.specificationValue,
        })),
      }));
    }
    // Fallback: product API এর specifications (যদি থাকে)
    return product?.specifications ?? [];
  }, [specApiData, product?.specifications]);

  // ── Breadcrumb ─────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    {
      label: product?.productName ?? "Product",
      href: `/product/${product?.productSlug ?? ""}`,
    },
  ];

  // ── Variant change handler ─────────────────────────────────────
  const handleVariantChange = (group: string, value: string) => {
    if (!isOptionAvailable(group, value)) return;
    setSelectedAttrs((prev) => ({ ...prev, [group]: value }));
    // Reset gallery to first image whenever color changes
    if (group.toLowerCase() === "color") {
      setSelectedColor(0);
    }
  };

  console.log(frequentlyBoughtProducts, "090909");

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-350 mx-auto lg:px-4 px-2">
        <MarqueeBulletinBar />
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <StickyPurchaseBar
        productId={product?.productUuid}
        variantUuid={selectedVariant?.variantUuid || selectedVariant?.id}
        productName={(() => {
          const prodName = product?.productName ?? "";
          const varName  = selectedVariant?.name ?? "";
          if (!varName) return prodName;
          return varName.startsWith(prodName)
            ? varName
            : `${prodName} ${varName}`.trim();
        })()}
        productImage={images[0]}
        productPrice={price}
        productOriginalPrice={originalPrice}
        productSlug={product?.productSlug}
        price={price > 0 ? price : "Price on request"}
        qty={qty}
        onQtyChange={setQty}
        isUnavailable={price === 0}
        onExploreFinancing={() => setEmiOpen(true)}
        selectedPriceType={selectedPriceType}
        selectedCareOptions={selectedCareOptions}
        careTotalOffer={careTotalOffer}
        careTotalRegular={careTotalRegular}
      />

      <div className="max-w-350 mx-auto lg:px-4 px-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left: Image Gallery ── */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl shadow-sm p-3 sticky top-6 transition-colors duration-200  dark:bg-[#3e3329]">
              <ProductImageGallery
                images={images}
                selected={selectedColor}
                onSelect={setSelectedColor}
                badges={product?.disRate}
              />
              {/* {frequentlyBoughtProducts.length > 0 && (
                <div className="grid-cols-2 lg:grid-cols-3 gap-2 hidden lg:grid">
                  {frequentlyBoughtProducts.map((prod, index) => (
                    <ProductCard key={index} {...prod} />
                  ))}
                </div>
              )} */}
              {frequentlyBoughtProducts.length > 0 && (
                <FrequentlyBoughtTogether
                  products={frequentlyBoughtProducts}
                />
              )}

              <div className="hidden lg:block space-y-6 pt-2">
                <ContactOptions
                  whatsappNumber="09638001122"
                  messengerUsername="dazzlebangladesh/"
                  phoneNumber="09638001122"
                />
              </div>
            </div>
          </div>

          {/* ── Right: Product Info + Variants ── */}
          <div className="lg:col-span-7">
            <ProductInfo
              title={product?.productName}
              brand={product?.brandName ?? ""}
              brand_slug={product?.brandSlug ?? ""}
              code={product?.productCode ?? "N/A"}
              inStock={""}
              stockNote={""}
              warrantyNote={""}
              stats={{ soldLastHours: "", reviewCount: "", viewingNow: "" }}
              price={selectedVariant?.mrp}
              originalPrice={originalPrice}
              description={product?.description}
              alldata={{
                ...product,
                discountedPrice: price,
                regularPrice: originalPrice,
              }}
              qty={qty}
              onQtyChange={setQty}
              selectedVariant={selectedVariant}
              selectedCareOptions={selectedCareOptions}
              selectedPriceType={selectedPriceType}
            />

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
                    <div className="hidden items-center gap-2 shrink-0">
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

            {/* {dazzleCareOptions.length > 0 && ( */}
              <div className="pt-5">
                <BuyMore
                  items={frequentlyBoughtProducts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    image: p.image,
                    price: p.rawPrice ?? 0,
                    originalPrice: p.rawOriginalPrice ?? 0,
                    slug: p.slug,
                    inStock: p.inStock,
                  }))}
                />
              </div>
            {/* )} */}
            {dazzleCareOptions.length > 0 && (
              <div className="pt-5">
                <DazzleCare
                  options={dazzleCareOptions}
                  onSelectionChange={setSelectedCareIds}
                />
              </div>
            )}

            <div>
              <CheckAvailability
                product={product}
                selectedVariant={selectedVariant}
                currentPrice={selectedVariant?.mrp}
                externalEmiOpen={emiOpen}
                onExternalEmiClose={() => setEmiOpen(false)}
              />
            </div>
            <div>
              <TransparentProfitMeterArea
                product={product}
                currentPrice={price}
                dazzleCareOptions={dazzleCareOptions}
                selectedCareIds={selectedCareIds}
                productUUID={product?.productUuid}
                variantUUID={selectedVariant?.id}
              />
            </div>
            <div>
              <PriceAvailability
                product={product}
                offerPrice={
                  selectedVariant?.price === 0 ? price : selectedVariant?.price
                }
                originalPrice={originalPrice}
                careTotalOffer={careTotalOffer}
                careTotalRegular={careTotalRegular}
                selectedPriceType={selectedPriceType}
                onPriceTypeChange={setSelectedPriceType}
              />
            </div>

            <div>
              <DeliveryInfo deliveryDays={""} purchasePoints={product?.purchasePoints ?? 0} minBookingAmount={product?.minBookingPrice ?? 0} />
            </div>

            {/* {frequentlyBoughtProducts.length > 0 && (
              <div className="lg:col-span-5">
                <div className="grid-cols-2 lg:grid-cols-3 gap-2 mt-5 grid lg:hidden">
                  {frequentlyBoughtProducts.map((prod, index) => (
                    <ProductCard key={index} {...prod} />
                  ))}
                </div>
                <div className="grid lg:hidden space-y-6 pt-2">
                  <ContactOptions />
                </div>
              </div>
            )} */}
          </div>

          <div className="lg:col-span-12 space-y-6">
            {/* Specification & Description Tab Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDescription(false)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  !showDescription
                    ? "bg-[#E9CCAE] text-black shadow-sm"
                    : "bg-[#F7F7F7] dark:bg-[#3e3329] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#4a3f36]"
                }`}
              >
                Specification
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!showDescription) {
                    setShowDescription(true);
                    setTimeout(() => {
                      descriptionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  } else {
                    descriptionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  showDescription
                    ? "bg-[#E9CCAE] text-black shadow-sm"
                    : "bg-[#F7F7F7] dark:bg-[#3e3329] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#4a3f36]"
                }`}
              >
                Description
              </button>
            </div>

            {/* Specification is ALWAYS open */}
            <ProductSpecifications
              groups={specGroups}
              description={product?.description}
            />

            {/* Description content shown below Specification when Description button is clicked */}
            {/* {showDescription && ( */}
              <div
                ref={descriptionRef}
                className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 scroll-mt-24"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Description
                </h3>
                <DescriptionProductDetails description={product?.description} />
              </div>
            {/* )} */}
          </div>

          {/* ── Related Products ── */}
          {product?.categorySlug && (
            <div className="lg:col-span-12">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white px-4 mb-3">
                Related Products
              </h2>
              <RelatedProductSectionCom categorySlug={product.brandSlug} />
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
