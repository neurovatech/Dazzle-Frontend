import type { Metadata } from "next";
import Product from "@/components/ProductPage/Product";
import { SITE_NAME, OG_LOCALE, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo-config";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shop Mobiles, Laptops & Accessories",
  description:
    "Browse Dazzle's extensive collection of premium smartphones, high-performance laptops, accessories, and audio gadgets. Best prices in Bangladesh with active warranties.",
  keywords: [
    "smartphones Bangladesh",
    "laptops Bangladesh",
    "buy iPhone Bangladesh",
    "Samsung Galaxy price BD",
    "gadgets online Bangladesh",
    "Dazzle shop",
  ],
  openGraph: {
    title: "Shop Mobiles, Laptops & Accessories - Dazzle",
    description:
      "Premium smartphones, laptops, accessories & gadgets. Best prices in Bangladesh.",
    url: absoluteUrl("/product"),
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Mobiles, Laptops & Accessories - Dazzle",
    description:
      "Premium smartphones, laptops, accessories & gadgets at the best prices in Bangladesh.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  alternates: {
    canonical: "/product",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <Product />
    </div>
  );
}
