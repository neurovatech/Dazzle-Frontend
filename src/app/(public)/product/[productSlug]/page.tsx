/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ProductDetails from '@/components/ProductDetails/ProductDetail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import JsonLd from '@/components/share/JsonLd';
import {
  buildJsonLd,
  productSchema,
  breadcrumbSchema,
} from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ productSlug: string }>;
}

// ── API Response Types ──────────────────────────────────────────────
interface ProductVariantOption {
  uuid: string;
  value: string;
  priceAdjustment?: number;
}

interface ProductVariantGroup {
  uuid: string;
  variantType: string;
  options: ProductVariantOption[];
}

interface Thumbnail {
  fileuuid: string;
  mediaFileUrl: string;
  mediafileUrl?: string;
}

interface ProductBadge {
  label: string;
  color?: string;
}

export interface ProductApiData {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge?: string;
  brandName: string;
  brandSlug: string;
  description: string;
  shortDesc: string;
  minBookingPrice?: number;
  purchasePoints?: number;
  isFeaturedProduct: boolean;
  isFreeShipping: boolean;
  isActive: boolean;
  isFba?: boolean;
  disRate?: number;
  discountedPrice?: number;
  regularPrice?: number;
  metaTags?: {
    tags?: string;
    badge?: string;
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
  };
  // Media
  thumbnails?: Thumbnail[];
  thumbnailImg?: string;
  // Variants
  variants?: any[];
  // Badges
  badges?: ProductBadge[];
  // Specs
  specifications?: { title: string; items: { label: string; value: string }[] }[];
}

interface ProductApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: ProductApiData;
}

function stripHtml(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
 
function truncate(input: string, max = 160): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + '…';
}


// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
 
  const res = await api
    .get<ProductApiResponse>(`/product/${productSlug}`, {
      next: { revalidate: 3600 },
    } as RequestInit)
    .catch(() => null);
 
  if (!res?.found || !res?.data) {
    // No API data available at all — nothing to build metadata from.
    return {};
  }
 
  const p = res.data;
  const meta = p.metaTags;
 
  // Title: metaTags.title is the SEO-authored title. If it's ever missing,
  // fall back to raw API fields only (productName / brandName) — no copy.
  const title = meta?.title || p.productName || p.brandName;
 
  // Description: metaTags.description is the SEO-authored copy. If missing,
  // derive from the product's own shortDesc/description fields only.
  const description = truncate(
    stripHtml(meta?.description) || stripHtml(p.shortDesc) || stripHtml(p.description)
  );
 
  const keywords = meta?.keywords || meta?.tags;
 
  const canonicalUrl = meta?.canonical;
 
  const ogImage = p.thumbnails?.[0]?.mediaFileUrl || p.thumbnailImg;
 
  return {
    title,
    description,
    keywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      // Kept as "website": Next.js's Metadata API restricts og:type to a fixed
      // union that does not include "product", and forcing it with a cast would
      // be fragile across upgrades. The practical loss is small — Facebook and
      // WhatsApp build link previews from og:title/description/image (all set
      // above), and Google reads product data from JSON-LD, not og:type.
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: p.productName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    // Price, currency, availability and brand are published via JSON-LD
    // Product/Offer in the page body — the format Google actually consumes for
    // rich results. They are NOT emitted through Metadata's `other` field,
    // because Next.js renders those as <meta name="..."> whereas OpenGraph
    // requires <meta property="...">, so crawlers would ignore them.
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function ProductDetailsPage({ params }: PageProps) {
  const { productSlug } = await params;

  let product: ProductApiData | null = null;
  let requestFailed = false;

  try {
    const res = await api.get<ProductApiResponse>(`/product/${productSlug}`, {
      next: { revalidate: 3600 },
    } as RequestInit);
    if (res?.found && res?.data) {
      product = res.data;
    }
  } catch {
    // Distinguish "backend unreachable" from "product genuinely does not exist".
    requestFailed = true;
  }

  // A product that the API reports as not-found must return a real HTTP 404.
  // Previously this rendered an empty shell with status 200 — a soft 404, which
  // Google penalises and may index as a thin page.
  // If the *request itself* failed (backend down), we keep the old behaviour and
  // render the fallback rather than wrongly telling crawlers the page is gone.
  if (!product && !requestFailed) {
    notFound();
  }

  const jsonLd = product
    ? buildJsonLd(
        productSchema(product),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          ...(product.brandName && product.brandSlug
            ? [{ name: product.brandName, path: `/brands/${product.brandSlug}` }]
            : []),
          { name: product.productName, path: `/product/${product.productSlug || productSlug}` },
        ]),
      )
    : undefined;

  return (
    <div>
      <JsonLd data={jsonLd} />
      <ProductDetails product={product} />
    </div>
  );
}
