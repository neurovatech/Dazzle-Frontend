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

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;

  try {
    const res = await api.get<ProductApiResponse>(`/product/${productSlug}`, {
      next: { revalidate: 3600 },
    } as RequestInit);

    console.log(res, "resresresresres")

    if (res?.found && res?.data) {
      const p = res.data;
      return {
        title: p.metaTags?.title ?? `${p.productName} - Buy Online at Best Price in BD - Dazzle`,
        description:
          p.shortDesc ||
          `Buy ${p.productName} in Bangladesh from Dazzle. Get the best price, official brand warranty, and fast delivery.`,
        keywords: p.metaTags?.keywords,
      };
    }
  } catch {
    // fallback
  }

  const decodedSlug = decodeURIComponent(productSlug);
  const title = decodedSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} - Buy Online at Best Price in BD - Dazzle`,
    description: `Buy ${title} in Bangladesh from Dazzle. Get the best price, official brand warranty, and fast delivery on original devices and gadgets.`,
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
