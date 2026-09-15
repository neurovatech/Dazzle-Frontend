import React from 'react'
import type { Metadata } from 'next'
import ProductCompareDetails from "@/components/ProductCompare/ProductCompareDetails"
import { NOINDEX_METADATA } from "@/lib/seo-config"

// Session-specific comparison state — generates unlimited near-duplicate URLs.
export const metadata: Metadata = {
  title: "Product Compare",
  ...NOINDEX_METADATA,
}

function ProductCompare() {
  return <ProductCompareDetails />
}

export default ProductCompare
