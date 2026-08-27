"use client";

import ProductCard from "@/components/share/GlobalProductCard";
import { useHomeProductFocus } from "@/hooks/useHomeProductFocus";
import type { ProductCardItem } from "./FeatureProducts";

interface Props {
  products: ProductCardItem[];
}

export default function FeatureProductGrid({ products }: Props) {
  useHomeProductFocus("home_feature_products");

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-5">
      {products.map((product, i) => (
        <div key={i} className={i === 4 ? "hidden lg:block" : ""}>
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  );
}
