"use client";
import React from "react";
import ProductTotal from "./ProductTotal";
import ProductButtons from "./ProductButtons";
import ProductContactRow from "./ProductContactRow";
import ProductInfoRow from "./ProductInfoRow";

interface ProductActionsProps {
  total: string;
  inStock?: boolean;
  warrantyYears?: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onWhatsapp?: () => void;
  onMessenger?: () => void;
  onCallUs?: () => void;
}

const ProductDetailsActions: React.FC<ProductActionsProps> = ({
  total,
  inStock = false,
  warrantyYears = 1,
  onAddToCart,
  onBuyNow,
  onWhatsapp,
  onMessenger,
  onCallUs,
}) => {
  return (
    <div className="flex flex-col gap-4 ">
      <ProductTotal total={total} />
      <ProductButtons onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
      <ProductContactRow
        onWhatsapp={onWhatsapp}
        onMessenger={onMessenger}
        onCallUs={onCallUs}
      />
      <ProductInfoRow inStock={inStock} warrantyYears={warrantyYears} />
    </div>
  );
};

export default ProductDetailsActions;