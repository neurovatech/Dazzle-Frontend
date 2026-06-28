import React from 'react'
import ProductDetails from '@/components/ProductDetails/ProductDetail';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ productSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const decodedSlug = decodeURIComponent(productSlug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} - Buy Online at Best Price in BD - Dazzle`,
    description: `Buy ${title} in Bangladesh from Dazzle. Get the best price, official brand warranty, and fast delivery on original devices and gadgets.`,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  return (
    <div>
      <ProductDetails />
    </div>
  )
}
