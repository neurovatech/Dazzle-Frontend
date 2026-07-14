/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
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
import type { ProductApiData } from "@/app/(public)/product/[productSlug]/page";

// ── Static fallback images ──────────────────────────────────────────
const FALLBACK_WHITE =  "/images/no_images.png";

const FALLBACK_BLACK = "/images/no_images.png";;

const FALLBACK_IMAGES = [IPHONE_ORANGE.src, FALLBACK_WHITE, FALLBACK_BLACK];

const FALLBACK_COLOR_OPTIONS = [
  { label: "", value: "desert", image: IPHONE_ORANGE.src },
  { label: "", value: "natural", image: FALLBACK_WHITE },
  { label: "", value: "black", image: FALLBACK_BLACK },
];

// ── Fallback related products ────────────────────────────────────────
const FALLBACK_PRODUCTS = [
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
];

// ── Component ────────────────────────────────────────────────────────
interface ProductDetailProps {
  product: ProductApiData | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {


  // ── Derive image list from API or fallback ──────────────────────
  const images: string[] =
    product?.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails.map((img) => img.mediaFileUrl || img.mediafileUrl || "")
      : product?.thumbnailImg
        ? [product.thumbnailImg]
        : FALLBACK_IMAGES;

  // ── Color variants from API or fallback ────────────────────────
  const colorGroup = product?.variants?.find(
    (g) => g.variantType && g.variantType.toLowerCase() === "color"
  );
  const colorOptions =
    colorGroup && colorGroup.options && colorGroup.options.length > 0
      ? colorGroup.options.map((opt: any) => ({
          label: opt.value,
          value: opt.value.toLowerCase().replace(/\s+/g, "-"),
          image: images[0] ?? IPHONE_ORANGE.src,
        }))
      : FALLBACK_COLOR_OPTIONS;

  // ── Other variant groups from API or fallback ──────────────────
  const otherVariantGroups =
    product?.variants
      ?.filter((g) => g.variantType && g.variantType.toLowerCase() !== "color")
      .map((g) => ({
        label: g.variantType,
        type: "text" as const,
        options: g.options.map((opt: any) => ({
          label: opt.value,
          value: opt.uuid,
        })),
      })) ?? [
      {
        label: "Region",
        type: "text" as const,
        options: [
          { label: "JP/MEA Dual e sim", value: "jp-mea" },
          { label: "Global (Sim + e Sim)", value: "global" },
          { label: "HK/CH Duel Sim", value: "hk-ch" },
        ],
      },
      {
        label: "Storage",
        type: "text" as const,
        options: [
          { label: "256GB", value: "256" },
          { label: "512GB", value: "512" },
          { label: "1TB", value: "1tb" },
        ],
      },
    ];

  // ── Pricing ───────────────────────────────────────────────────
  const price = product?.discountedPrice ?? 100000;
  const originalPrice = product?.regularPrice ?? 130000;

  // ── Badges from API ────────────────────────────────────────────
  const VALID_COLORS = ["pink", "purple", "green", "orange"] as const;
  type BadgeColor = (typeof VALID_COLORS)[number];
  const badgeList: { label: string; color: BadgeColor }[] =
    product?.badges && product.badges.length > 0
      ? product.badges.map((b) => ({
          label: b.label,
          color: (VALID_COLORS.includes(b.color as BadgeColor) ? b.color : "pink") as BadgeColor,
        }))
      : [
          { label: "0%", color: "pink" as const },
        ];

  // ── Specs tabs from API ────────────────────────────────────────
  const specGroups = product?.specifications ?? [];
  const productData:any = product?.description ?? [];
  const tabsData = [
    {
      label: "Specifications",
      content: <ProductSpecifications  groups={specGroups} description={product?.description}  />,
    },
  ];

  // ── Breadcrumb ────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    {
      label: product?.productName ?? "Product",
      href: `/product/${product?.productSlug ?? ""}`,
    },
  ];

  // ── Color variant state ──────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState(0);

  // ── Shared quantity state — single source of truth for both
  //    ProductInfo (top) and StickyPurchaseBar (bottom) ──────────
  const [qty, setQty] = useState(1);

  const handleVariantChange = (selected: Record<string, string>) => {
    const colorValue = selected["Color"];
    const index = colorOptions.findIndex((opt:any) => opt.value === colorValue);
    if (index !== -1) setSelectedColor(index);
  };





  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-350 mx-auto lg:px-4 px-2">
        <MarqueeBulletinBar />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <StickyPurchaseBar
        productId={product?.productUuid}
        productName={product?.productName}
        productImage={images[0]}
        productPrice={product?.discountedPrice}
        productOriginalPrice={product?.regularPrice}
        productSlug={product?.productSlug}
        price={product?.discountedPrice ? `BDT ${product.discountedPrice.toLocaleString()}` : "৳ 0"}
        qty={qty}
        onQtyChange={setQty}
      />

      <div className="max-w-350 mx-auto lg:px-4 px-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left column: Image Gallery ── */}
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

          {/* ── Right column: Product Info ── */}
          <div className="lg:col-span-7">
            <ProductInfo
              title={product?.productName ?? "Product"}
              brand={product?.brandName ?? ""}
              brand_slug={product?.brandSlug ?? ""}
              code={product?.productCode ?? "N/A"}
              inStock={""}
              stockNote={""}
              warrantyNote={""}
              stats={{
                soldLastHours: "",
                reviewCount: "",
                viewingNow: "",
              }}
              price={price}
              originalPrice={originalPrice}
              description={product?.description}
              alldata={product}
              qty={qty}
              onQtyChange={setQty}
            />

            <div className="border border-[#e7e7e7] dark:border-[#4a3f36] bg-[#f7f7f7] dark:bg-[#3e3329] text-black dark:text-white rounded-2xl p-4 mt-4">
              <ProductColorVariants
                groups={[
                  {
                    label: "Color",
                    type: "color",
                    options: colorOptions,
                  },
                ]}
                onChange={handleVariantChange}
              />
              <ProductVariants groups={otherVariantGroups} />
            </div>

            <div className="pt-5 hidden">
              <DazzleCare
                options={[
                  {
                    id: "ultimate",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description:
                      "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "bundle",
                    title: "DC+ & DSC+ Bundle",
                    description:
                      "1-year device replacement + 2-year display coverage",
                    icon: "📦",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "ultimate1",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description:
                      "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                ]}
              />
            </div>

            <div className="">
              <CheckAvailability product={product} />
            </div>
            <div className="">
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
