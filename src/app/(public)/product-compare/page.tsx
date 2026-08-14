import React from 'react'
import type { Metadata } from 'next'
import ProductCompareCom from "@/components/ProductCompare/ProductCompareCom"
import { NOINDEX_METADATA } from "@/lib/seo-config"

// Session-specific comparison state — generates unlimited near-duplicate URLs.
export const metadata: Metadata = {
  title: "Product Compare",
  ...NOINDEX_METADATA,
}

function ProductCompare() {
  return (
    <div className="py-8 bg-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Product Compare
          </h1>
        </div>
        <ProductCompareCom />
      </div>

    </div>
  )
}

export default ProductCompare
