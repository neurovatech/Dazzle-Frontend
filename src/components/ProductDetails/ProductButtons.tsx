"use client";
import React from "react";

interface ProductButtonsProps {
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

const ProductButtons: React.FC<ProductButtonsProps> = ({ onAddToCart, onBuyNow }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onAddToCart}
        className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-amber-100 text-amber-900 font-semibold text-sm hover:bg-amber-200 transition-all duration-150"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Add to Cart
      </button>

      <button
        onClick={onBuyNow}
        className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition-all duration-150"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Buy Now
      </button>
    </div>
  );
};

export default ProductButtons;