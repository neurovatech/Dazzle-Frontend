"use client";
import React from "react";
import { createPortal } from "react-dom";

// Close Icon
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

type OrderSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onTrackOrder: () => void;
};

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderId,
  onTrackOrder,
}: OrderSuccessModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition z-10"
        >
          <CloseIcon />
        </button>

        <div className="h-36 bg-gray-50" />

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Content */}
        <div className="px-8 pt-6 pb-3 text-center">
          <p className="text-sm text-gray-500 mb-1">
            Your Order ID:{" "}
            <span className="font-semibold text-[#E6A817]">{orderId}</span>
          </p>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Successfully Placed Order
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your order is successful. You can track the status from your orders.
          </p>
        </div>

        {/* Track Order Button */}
        <div className="px-5 pb-5 pt-3">
          <button
            onClick={() => {
              onTrackOrder();
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] tracking-widest transition"
          >
            TRACK ORDER
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}