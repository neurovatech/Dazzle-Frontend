"use client";
import React from "react";

interface ProductTotalProps {
  total: string;
}

const ProductTotal: React.FC<ProductTotalProps> = ({ total }) => {
  return (
    <p className="text-2xl font-bold text-gray-800">
      Total:{" "}
      <span className="text-amber-600">{total}</span>
    </p>
  );
};

export default ProductTotal;