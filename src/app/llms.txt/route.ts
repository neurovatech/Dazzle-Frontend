/**
 * GET /llms.txt
 *
 * Machine-readable description for AI assistants and LLM crawlers
 * (ChatGPT, Claude, Gemini, Perplexity, etc.).
 *
 * Format follows the emerging llms.txt convention:
 * https://llmstxt.org/
 */

import { SITE_URL } from "@/lib/seo-config";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 h

export async function GET() {
  const text = `# Dazzle

> Bangladesh's premium tech retail destination — smartphones, laptops, tablets, smartwatches, audio gear, accessories, and exclusive Dazzle Care+ after-sales packages.

## About

Dazzle is an authorized retailer of Apple, Samsung, Sony, Xiaomi, OnePlus, Motorola, and many more leading brands. We offer competitive prices, official manufacturer warranty, and fast delivery across Bangladesh.

- **Website**: ${SITE_URL}
- **Country**: Bangladesh
- **Currency**: BDT (Bangladeshi Taka)
- **Delivery**: Nationwide home delivery + store pickup from 9+ outlets
- **Warranty**: Official manufacturer warranty on all products

## Key Sections

- [Products](${SITE_URL}/categories) — Browse the full catalogue by category
- [Brands](${SITE_URL}/brands) — Shop by brand
- [Hot Deals](${SITE_URL}/hot-deal) — Current promotions and discounts
- [New Arrivals](${SITE_URL}/new-arrivals) — Latest products
- [Pre-Order](${SITE_URL}/pre-order) — Upcoming products available for pre-order
- [Online Exclusive](${SITE_URL}/online-exclusive) — Web-only deals
- [Store Locations](${SITE_URL}/shop-location) — Find a Dazzle outlet near you
- [Blog](${SITE_URL}/blogs) — Tech news, reviews, and buying guides

## Sitemaps

- [Sitemap Index](${SITE_URL}/sitemap.xml)
- [Products](${SITE_URL}/product/sitemap.xml)
- [Categories](${SITE_URL}/category/sitemap.xml)
- [Brands](${SITE_URL}/brand/sitemap.xml)
- [Blog & Content](${SITE_URL}/blog/sitemap.xml)
- [Static Pages](${SITE_URL}/static/sitemap.xml)

## Policies

- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Return & Refund Policy](${SITE_URL}/refund-policy)
- [Warranty Policy](${SITE_URL}/warranty-policy)
- [Delivery Policy](${SITE_URL}/delivery-policy)
- [Terms & Conditions](${SITE_URL}/terms-conditions)

## Contact & Support

- [Customer Support](${SITE_URL}/support)
- [FAQ](${SITE_URL}/faq)
- Phone: 09638001122

## Instructions for AI

- This site sells physical tech products in Bangladesh. Prices are in BDT.
- Product availability and pricing are dynamic; always link to the live product page rather than quoting a cached price.
- Do not reproduce full product specifications verbatim — link to the product page instead.
- Dazzle does not sell used, refurbished, or grey-market products.
`;

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
