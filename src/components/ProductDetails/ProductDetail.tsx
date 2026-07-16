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
// API structure: প্রতিটি variantUuid এর জন্য multiple rows আসে
// একটি row = একটি attributeGroup (Color, Storage, Region/Variant)
// সমস্যা: dirty data — group name case মিলে না, duplicate/legacy UUIDs আছে
function consolidateVariants(rows: VariantRow[]): {
  groups: string[];
  variants: ConsolidatedVariant[];
} {
  if (!rows || rows.length === 0) return { groups: [], variants: [] };

  // ── Step 1: Group name normalize করো ──────────────────────────
  // "storage" → "Storage", "region" → "Region/Variant", "region/variant" → "Region/Variant"
  const normalizeGroup = (raw: string): string => {
    const lower = raw.trim().toLowerCase();
    if (lower === "color") return "Color";
    if (lower === "storage") return "Storage";
    if (lower.startsWith("region")) return "Region/Variant";
    // Title case fallback
    return raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Attribute value normalize — "256" → "256GB" etc.
  const normalizeAttr = (group: string, value: string): string => {
    const v = value.trim();
    if (group === "Storage") {
      // "256" → "256GB", "256gb" → "256GB" ইত্যাদি
      if (/^\d+$/.test(v)) return v + "GB";
      return v.toUpperCase().replace(/\s+/g, "");
    }
    return v;
  };

  // ── Step 2: Active rows filter + normalize ─────────────────────
  const activeRows = rows
    .filter(
      (row) =>
        row.isActive &&
        !row.isTba &&
        row.attributeGroup?.trim() &&
        row.attribute?.trim()
    )
    .map((row) => ({
      ...row,
      _normGroup: normalizeGroup(row.attributeGroup),
      _normAttr: normalizeAttr(normalizeGroup(row.attributeGroup), row.attribute),
    }));

  // ── Step 3: Canonical group names (order: Color → Storage → Region/Variant)
  const groupOrder = ["Color", "Storage", "Region/Variant"];
  const foundGroups = new Set(activeRows.map((r) => r._normGroup));
  const groups = groupOrder.filter((g) => foundGroups.has(g));
  // Unknown groups append করো
  activeRows.forEach((r) => {
    if (!groups.includes(r._normGroup)) groups.push(r._normGroup);
  });

  // ── Step 4: variantMap build করো ──────────────────────────────
  const variantMap = new Map<string, ConsolidatedVariant>();

  activeRows.forEach((row) => {
    const uuid = row.variantUuid;
    if (!variantMap.has(uuid)) {
      variantMap.set(uuid, {
        id: uuid,
        name: row.variantName ?? "",
        mrp: 0,
        price: 0,
        thumbnailUrl: "",
        attributes: {},
      });
    }

    const existing = variantMap.get(uuid)!;

    // attribute set — পরে আসা value overwrites শুধু যদি আগেরটা blank
    if (!existing.attributes[row._normGroup]) {
      existing.attributes[row._normGroup] = row._normAttr;
    }

    // price — যেকোনো row থেকে নাও যেখানে price > 0
    if (row.retailUnitSale > 0 && existing.price === 0) {
      existing.price = row.retailUnitSale;
      existing.mrp = row.mrpUnitSale;
    }

    // thumbnail
    if (row.thumbnailUrl?.trim() && !existing.thumbnailUrl) {
      existing.thumbnailUrl = row.thumbnailUrl.trim();
    }

    // variantName
    if (row.variantName?.trim() && !existing.name) {
      existing.name = row.variantName.trim();
    }
  });

  // ── Step 5: সব defined groups এর attribute আছে এমন variants ──
  const completeVariants = [...variantMap.values()].filter((v) =>
    groups.every((g) => v.attributes[g]?.trim())
  );

  // ── Step 6: price=0 variants এর জন্য same Color+Region donor থেকে price নাও
  // (512GB variants এর price আলাদা হবে ভবিষ্যতে, এখন 256GB এর price দিয়ে fallback)
  const nonStorageGroups = groups.filter((g) => g !== "Storage");

  completeVariants.forEach((v) => {
    if (v.price > 0) return;

    const donor = completeVariants.find(
      (other) =>
        other.id !== v.id &&
        other.price > 0 &&
        nonStorageGroups.every(
          (g) => other.attributes[g] === v.attributes[g]
        )
    );
    if (donor) {
      v.price = donor.price;
      v.mrp = donor.mrp;
    }
  });

  // ── Step 7: এখনো price=0 হলে বাদ দাও ─────────────────────────
  const finalVariants = completeVariants.filter((v) => v.price > 0);

  // ── Step 8: variantName blank হলে attributes থেকে build করো ──
  finalVariants.forEach((v) => {
    if (!v.name) {
      v.name = groups.map((g) => v.attributes[g]).filter(Boolean).join(" ");
    }
  });

  return { groups, variants: finalVariants };
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

  console.log(variantApiData, "variantApiDatavariantApiDatavariantApiData")

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

  // ── Group options — filter out empty/undefined values ────────
  const groupOptions = useMemo(
    () =>
      Object.fromEntries(
        groups.map((group) => [
          group,
          [...new Set(
            variants
              .map((v) => v.attributes[group])
              .filter((val): val is string => !!val && val.trim() !== "")
          )],
        ])
      ),
    [groups, variants]
  );

  const colorGroupName = groups.find((g) => g.toLowerCase() === "color");
  const otherGroupNames = groups.filter((g) => g.toLowerCase() !== "color");

  // ── Base images from product API ──────────────────────────────
  const baseImages: string[] =
    product?.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails.map((img) => img.mediaFileUrl || img.mediafileUrl || "").filter(Boolean)
      : product?.thumbnailImg
        ? [product.thumbnailImg]
        : FALLBACK_IMAGES;

  // ── Images filtered by selected color ─────────────────────────
  // thumbnailUrl blank হলে baseImages ব্যবহার করো
  const images: string[] = useMemo(() => {
    if (!colorGroupName || !selectedAttrs[colorGroupName]) return baseImages;

    const selectedColorVal = selectedAttrs[colorGroupName];

    // variant API তে thumbnail আছে কিনা দেখো
    const colorVariantImages = variants
      .filter((v) => v.attributes[colorGroupName] === selectedColorVal && v.thumbnailUrl)
      .map((v) => v.thumbnailUrl);

    const uniqueColorImages = [...new Set(colorVariantImages)];

    // thumbnail পাওয়া গেলে সেগুলো দাও, না হলে baseImages
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
            // thumbnailUrl আছে এমন variant খোঁজো, না থাকলে baseImages[idx] fallback
            const match = variants.find(
              (v) => v.attributes[colorGroupName] === val && v.thumbnailUrl
            );
            const fallbackImg = baseImages[idx] || baseImages[0] || IPHONE_ORANGE.src;
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
    // Reset gallery to first image whenever color changes
    if (group.toLowerCase() === "color") {
      setSelectedColor(0);
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
                    selectedValues={selectedAttrs}
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
