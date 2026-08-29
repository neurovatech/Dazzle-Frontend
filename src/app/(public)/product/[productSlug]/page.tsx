/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { cache } from 'react';
import ProductDetails from '@/components/ProductDetails/ProductDetail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import {
  buildJsonLd,
  productSchema,
  breadcrumbSchema,
} from '@/lib/structured-data';
import {
  SITE_NAME,
  OG_LOCALE,
  buildOgImage,
  absoluteUrl,
  PRODUCT_IMAGE_WIDTH,
  PRODUCT_IMAGE_HEIGHT,
} from '@/lib/seo-config';

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


/**
 * Product fetch shared by generateMetadata() and the page body.
 *
 * Two things this fixes:
 *
 * 1. Staleness. This request used to set `revalidate: 3600`, so a catalogue
 *    edit — a renamed product, a new price — took up to an HOUR to show up
 *    while the API was already returning the new value. Every other page in
 *    the app uses 60s; the product page was the lone outlier. The cache tags
 *    additionally let an edit be published immediately (see /api/revalidate)
 *    instead of waiting the window out.
 *
 * 2. A duplicate request. generateMetadata() and the page each fetched the
 *    same product independently. React's cache() collapses them into one
 *    backend call per render.
 */
const getProduct = cache((productSlug: string) =>
  api.get<ProductApiResponse>(`/product/${productSlug}`, {
    next: {
      revalidate: 60,
      tags: ['product', `product:${productSlug}`],
    },
  } as RequestInit),
);

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
 
  const res = await getProduct(productSlug).catch(() => null);
 
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
 
  // Dimensions are passed explicitly here because product thumbnails on the CDN
  // were verified to be consistently 1200x1263 — this lets crawlers render the
  // preview on the first scrape without fetching the file to measure it.
  const ogImage = buildOgImage(
    p.thumbnails?.[0]?.mediaFileUrl || p.thumbnailImg,
    p.productName,
    { width: PRODUCT_IMAGE_WIDTH, height: PRODUCT_IMAGE_HEIGHT },
  );

  const pageUrl = canonicalUrl || absoluteUrl(`/product/${productSlug}`);

  return {
    title,
    description,
    keywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      url: pageUrl,
      // siteName/locale must be repeated here: Next.js replaces the parent
      // layout's `openGraph` wholesale rather than deep-merging it, so any
      // page defining its own block loses them unless it restates them.
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      // Kept as "website": Next.js's Metadata API restricts og:type to a fixed
      // union that does not include "product", and forcing it with a cast would
      // be fragile across upgrades. The practical loss is small — Facebook and
      // WhatsApp build link previews from og:title/description/image (all set
      // above), and Google reads product data from JSON-LD, not og:type.
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
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
    const res = await getProduct(productSlug);

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
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <ProductDetails product={product} />
    </div>
  );
}
