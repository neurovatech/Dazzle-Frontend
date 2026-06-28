import React from 'react'
import ProductCompareCom from "@/components/ProductCompare/ProductCompareCom"
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
