/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import ProductBadges from "./ProductBadges";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductVariants from "./ProductVariants";
import ProductColorVariants from "./ProductColorVariants";
import DazzleCare from "./DazzleCare";
import ContactOptions from "./ContactOptions";
import IPHONE_ORANGE from "@/images/no_images.png";
import CheckAvailability from "./CheckAvailability";
import ProductCard from "./ProductCrad";
import ProductSpecifications from "./ProductSpecifications";
import GlobalTabs from "@/components/share/GlobalTabs";
import Breadcrumb from "@/components/share/Breadcrumb";
import MarqueeBulletinBar from "@/components/HomePage/MarqueeBulletinBar";
import StickyPurchaseBar from "./StickyPurchaseBar";
import PriceAvailability from "./PriceAvailability";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { ProductApiData } from "@/app/(public)/product/[productSlug]/page";

// ── Static fallback images ──────────────────────────────────────────
const FALLBACK_IMAGES = [IPHONE_ORANGE.src, "/images/no_images.png"];

// ── Fallback related products ───────────────────────────────────────
const FALLBACK_PRODUCTS = [
  {
    image: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
];

// ── Variant API types ───────────────────────────────────────────────
interface VariantRow {
  variantUuid: string;
  variantName: string;
  attributeGroup: string;
  attribute: string;
  mrpUnitSale: number;
  retailUnitSale: number;
  thumbnailUrl: string;
  isActive: boolean;
  isTba: boolean;
}

interface VariantApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: VariantRow[];
}

interface ConsolidatedVariant {
  id: string;
  name: string;
  mrp: number;
  price: number;
  thumbnailUrl: string;
  attributes: Record<string, string>;
}

// ── consolidateVariants ─────────────────────────────────────────────
function consolidateVariants(rows: VariantRow[]): {
  groups: string[];
  variants: ConsolidatedVariant[];
} {
  const purchasableRows = rows.filter(
    (row) =>
      row.isActive &&
      !row.isTba &&
      row.retailUnitSale > 0 &&
      row.attributeGroup &&
      row.attribute
  );

  const groupNames = new Map<string, string>();
  purchasableRows.forEach((row) => {
    const key = row.attributeGroup.trim().toLowerCase();
    if (!groupNames.has(key)) groupNames.set(key, row.attributeGroup.trim());
  });
  const groups = [...groupNames.values()];

  const variantMap = new Map<string, ConsolidatedVariant>();
  purchasableRows.forEach((row) => {
    const existing = variantMap.get(row.variantUuid) ?? {
      id: row.variantUuid,
      name: row.variantName,
      mrp: row.mrpUnitSale,
      price: row.retailUnitSale,
      thumbnailUrl: row.thumbnailUrl ?? "",
      attributes: {} as Record<string, string>,
    };
    const group = groupNames.get(row.attributeGroup.trim().toLowerCase())!;
    existing.attributes[group] = row.attribute;
    variantMap.set(row.variantUuid, existing);
  });

  const variants = [...variantMap.values()].filter((v) =>
    groups.every((g) => v.attributes[g])
  );

  return { groups, variants };
}

// ── Component ───────────────────────────────────────────────────────
interface ProductDetailProps {
  product: ProductApiData | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [qty, setQty] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState(0);

  // ── Fetch variants ─────────────────────────────────────────────
  const { data: variantApiData } = useQuery<VariantApiResponse>({
    queryKey: ["product-variants", product?.productUuid],
    queryFn: () =>
      api.get<VariantApiResponse>(`/product-variants/${product!.productUuid}`),
    enabled: !!product?.productUuid,
    staleTime: 10 * 60 * 1000,
  });

  // ── Consolidate ────────────────────────────────────────────────
  const { groups, variants } = useMemo(
    () => consolidateVariants(variantApiData?.data ?? []),
    [variantApiData]
  );

  // Auto-select first option per group on load
  useEffect(() => {
    if (groups.length === 0) return;
    const initial: Record<string, string> = {};
    groups.forEach((group) => {
      const firstVal = variants.find((v) => v.attributes[group])?.attributes[group];
      if (firstVal) initial[group] = firstVal;
    });
    setSelectedAttrs(initial);
  }, [groups, variants]);

  // ── Selected variant ───────────────────────────────────────────
  const selectedVariant: ConsolidatedVariant | null = useMemo(() => {
    if (groups.length === 0 || Object.keys(selectedAttrs).length < groups.length)
      return null;
    return (
      variants.find((v) =>
        groups.every((g) => v.attributes[g] === selectedAttrs[g])
      ) ?? null
    );
  }, [groups, variants, selectedAttrs]);

  // ── Availability check ─────────────────────────────────────────
  const isOptionAvailable = (group: string, option: string) =>
    variants.some(
      (v) =>
        v.attributes[group] === option &&
        Object.entries(selectedAttrs)
          .filter(([g]) => g !== group)
          .every(([g, val]) => v.attributes[g] === val)
    );

  // ── Group options ──────────────────────────────────────────────
  const groupOptions = useMemo(
    () =>
      Object.fromEntries(
        groups.map((group) => [
          group,
          [...new Set(variants.map((v) => v.attributes[group]))],
        ])
      ),
    [groups, variants]
  );

  const colorGroupName = groups.find((g) => g.toLowerCase() === "color");
  const otherGroupNames = groups.filter((g) => g.toLowerCase() !== "color");

  // Base images from product API
  const baseImages: string[] =
    product?.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails.map((img) => img.mediaFileUrl || img.mediafileUrl || "")
      : product?.thumbnailImg
        ? [product.thumbnailImg]
        : FALLBACK_IMAGES;

  // Put selected variant thumbnail first
  const images: string[] =
    selectedVariant?.thumbnailUrl
      ? [
          selectedVariant.thumbnailUrl,
          ...baseImages.filter((i) => i !== selectedVariant.thumbnailUrl),
        ]
      : baseImages;

  // ── Color variant groups for ProductColorVariants ──────────────
  const colorVariantGroups = colorGroupName
    ? [
        {
          label: colorGroupName,
          type: "color" as const,
          options: (groupOptions[colorGroupName] ?? []).map((val) => {
            const match = variants.find((v) => v.attributes[colorGroupName] === val);
            return {
              label: val,
              value: val,
              image: match?.thumbnailUrl || images[0] || IPHONE_ORANGE.src,
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

  // ── Pricing ────────────────────────────────────────────────────
  const price = selectedVariant?.price ?? product?.discountedPrice ?? 100000;
  const originalPrice = selectedVariant?.mrp ?? product?.regularPrice ?? 130000;

  // ── Badges ─────────────────────────────────────────────────────
  const VALID_COLORS = ["pink", "purple", "green", "orange"] as const;
  type BadgeColor = (typeof VALID_COLORS)[number];
  const badgeList: { label: string; color: BadgeColor }[] =
    product?.badges && product.badges.length > 0
      ? product.badges.map((b) => ({
          label: b.label,
          color: (VALID_COLORS.includes(b.color as BadgeColor)
            ? b.color
            : "pink") as BadgeColor,
        }))
      : [{ label: "0%", color: "pink" as const }];

  // ── Specs tabs ─────────────────────────────────────────────────
  const specGroups = product?.specifications ?? [];
  const tabsData = [
    {
      label: "Specifications",
      content: (
        <ProductSpecifications
          groups={specGroups}
          description={product?.description}
        />
      ),
    },
  ];

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

    if (group.toLowerCase() === "color") {
      const match = variants.find((v) => v.attributes[group] === value);
      if (match?.thumbnailUrl) {
        const idx = images.indexOf(match.thumbnailUrl);
        setSelectedColor(idx >= 0 ? idx : 0);
      } else {
        setSelectedColor(0);
      }
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-350 mx-auto lg:px-4 px-2">
        <MarqueeBulletinBar />
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <StickyPurchaseBar
        productId={product?.productUuid}
        productName={selectedVariant?.name ?? product?.productName}
        productImage={images[0]}
        productPrice={price}
        productOriginalPrice={originalPrice}
        productSlug={product?.productSlug}
        price={price ? `BDT ${price.toLocaleString()}` : "৳ 0"}
        qty={qty}
        onQtyChange={setQty}
      />

      <div className="max-w-350 mx-auto lg:px-4 px-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: Image Gallery ── */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl shadow-sm p-5 sticky top-6 transition-colors duration-200">
              <ProductImageGallery
                images={images}
                selected={selectedColor}
                onSelect={setSelectedColor}
                badges={<ProductBadges badges={badgeList} />}
              />
              <div className="grid-cols-2 lg:grid-cols-3 gap-2 mt-5 hidden lg:grid">
                {FALLBACK_PRODUCTS.map((prod, index) => (
                  <ProductCard key={index} {...prod} />
                ))}
              </div>
              <div className="hidden lg:block space-y-6 pt-2">
                <ContactOptions />
              </div>
            </div>
          </div>

          {/* ── Right: Product Info + Variants ── */}
          <div className="lg:col-span-7">
            <ProductInfo
              title={selectedVariant?.name ?? product?.productName ?? "Product"}
              brand={product?.brandName ?? ""}
              brand_slug={product?.brandSlug ?? ""}
              code={product?.productCode ?? "N/A"}
              inStock={""}
              stockNote={""}
              warrantyNote={""}
              stats={{ soldLastHours: "", reviewCount: "", viewingNow: "" }}
              price={price}
              originalPrice={originalPrice}
              description={product?.description}
              alldata={{
                ...product,
                discountedPrice: price,
                regularPrice: originalPrice,
              }}
              qty={qty}
              onQtyChange={setQty}
            />

            {/* Variant selector */}
            {(colorVariantGroups.length > 0 || otherVariantGroups.length > 0) && (
              <div className="border border-[#e7e7e7] dark:border-[#4a3f36] bg-[#f7f7f7] dark:bg-[#3e3329] text-black dark:text-white rounded-2xl p-4 mt-4">
                {colorVariantGroups.length > 0 && (
                  <ProductColorVariants
                    groups={colorVariantGroups}
                    onChange={(sel) =>
                      Object.entries(sel).forEach(([g, v]) => handleVariantChange(g, v))
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
                      {selectedVariant.name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-extrabold text-[#B57908]">
                        BDT {selectedVariant.price.toLocaleString()}
                      </span>
                      {selectedVariant.mrp > selectedVariant.price && (
                        <span className="text-sm text-gray-400 line-through">
                          BDT {selectedVariant.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-5 hidden">
              <DazzleCare
                options={[
                  {
                    id: "ultimate",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description: "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "bundle",
                    title: "DC+ & DSC+ Bundle",
                    description: "1-year device replacement + 2-year display coverage",
                    icon: "📦",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "ultimate1",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description: "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                ]}
              />
            </div>

            <div>
              <CheckAvailability product={product} />
            </div>
            <div>
              <PriceAvailability product={product} />
            </div>

            {/* Mobile: related products + contact */}
            <div className="lg:col-span-5">
              <div className="grid-cols-2 lg:grid-cols-3 gap-2 mt-5 grid lg:hidden">
                {FALLBACK_PRODUCTS.map((prod, index) => (
                  <ProductCard key={index} {...prod} />
                ))}
              </div>
              <div className="grid lg:hidden space-y-6 pt-2">
                <ContactOptions />
              </div>
            </div>
          </div>

          {/* ── Full width: Specs Tabs ── */}
          <div className="lg:col-span-12">
            <GlobalTabs tabs={tabsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
