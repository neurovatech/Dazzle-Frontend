import type { Metadata } from "next";
import Banner from '@/components/CategoriesPages/CategoriesBanner/Banner'
import Product from '@/components/ProductPage/Product'

export const metadata: Metadata = {
  title: "Shop Mobiles, Laptops & Accessories - Dazzle",
  description: "Browse Dazzle's extensive collection of premium smartphones, high-performance laptops, accessories, and audio gadgets. Best prices in Bangladesh with active warranties.",
};
function ProductPage() {
  return (
    <div>
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        {/* <Banner /> */}
        <Product />
      </div>
    </div>
  )
}

export default ProductPage