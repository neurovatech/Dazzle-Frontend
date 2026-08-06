/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ProductDetails from '@/components/ProductDetails/ProductDetail';
import type { Metadata } from 'next';
import { api } from '@/lib/api';

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
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: p.productName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function ProductDetailsPage({ params }: PageProps) {
  const { productSlug } = await params;

  let product: ProductApiData | null = null;

  try {
    const res = await api.get<ProductApiResponse>(`/product/${productSlug}`, {
      next: { revalidate: 3600 },
    } as RequestInit);
    if (res?.found && res?.data) {
      product = res.data;
    }
  } catch {
    // product stays null — ProductDetail will show fallback/static data
  }

  return (
    <div>
      <ProductDetails product={product} />
    </div>
  );
}
