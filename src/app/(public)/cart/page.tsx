import React from 'react'
import type { Metadata } from 'next'
import CartPageCom from "@/components/Cart/CartPageCom"
import { NOINDEX_METADATA } from "@/lib/seo-config"

// Transactional page — no search value, and indexing it wastes crawl budget.
export const metadata: Metadata = {
  title: "Shopping Cart",
  ...NOINDEX_METADATA,
}

function CartPage() {
  return (
    <div className="bg-[#fffbf6] dark:bg-[#2e2b28]">
      <CartPageCom />
    </div>
  )
}

export default CartPage
