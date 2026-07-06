import type { Metadata } from "next";
import Product from "@/components/ProductPage/Product";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shop Mobiles, Laptops & Accessories - Dazzle",
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
    url: "https://dazzle.com.bd/product",
    siteName: "Dazzle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Mobiles, Laptops & Accessories - Dazzle",
    description:
      "Premium smartphones, laptops, accessories & gadgets at the best prices in Bangladesh.",
  },
  alternates: {
    canonical: "https://dazzle.com.bd/product",
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
