import React from 'react'
import ProductCompareDetails from "@/components/ProductCompare/ProductCompareDetails"

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function ProductCompareDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <div>
      <ProductCompareDetails slug={slug} />
    </div>
  )
}

export default ProductCompareDetailsPage
