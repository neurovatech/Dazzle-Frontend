"use client";
import React, { useState } from "react";
import GlobalModal from "@/components/share/GlobalModal";

type CouponTab = "coupon" | "points";

type Coupon = {
  id: number;
  code: string;
  description: string;
  applicableFor: string;
};

const COUPONS: Coupon[] = [
  { id: 1, code: "RAMADAN12", description: "10% off upto ৳1,00,000", applicableFor: "For Phone" },
  { id: 2, code: "RAMADAN12", description: "10% off upto ৳1,00,000", applicableFor: "For Phone" },
  { id: 3, code: "RAMADAN12", description: "10% off upto ৳1,00,000", applicableFor: "For Phone" },
  { id: 4, code: "RAMADAN12", description: "10% off upto ৳1,00,000", applicableFor: "For Phone" },
];

const POINTS_DEALS: Coupon[] = [
  { id: 5, code: "POINTS50", description: "50 points = ৳50 off", applicableFor: "All Products" },
  { id: 6, code: "POINTS100", description: "100 points = ৳120 off", applicableFor: "All Products" },
];

type AddCouponModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (coupon: Coupon) => void;
};

// Coupon icon SVG
const CouponIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-2-4.5l-6 9-4-4.5 1.5-1.5 2.3 2.6 4.7-7 1.5 1.4z" />
  </svg>
);

export default function AddCouponModal({
  isOpen,
  onClose,
  onApply,
}: AddCouponModalProps) {
  const [activeTab, setActiveTab] = useState<CouponTab>("coupon");
  const [appliedId, setAppliedId] = useState<number | null>(null);

  const deals = activeTab === "coupon" ? COUPONS : POINTS_DEALS;

  const handleApply = (coupon: Coupon) => {
    setAppliedId(coupon.id);
    onApply(coupon);
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Add Coupon">
      <div className="px-5 pb-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("coupon")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "coupon"
                ? "bg-[#7B4F1E] text-white"
                : "bg-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Coupon Deals
          </button>
          <button
            onClick={() => setActiveTab("points")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "points"
                ? "bg-[#7B4F1E] text-white"
                : "bg-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Points Deal
          </button>
        </div>

        {/* Coupon List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {deals.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-gray-50 rounded-xl border border-gray-100 px-4 pt-3 pb-3"
            >
              {/* Code row */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-[#7B4F1E] flex items-center justify-center text-white flex-shrink-0">
                  <CouponIcon />
                </div>
                <span className="text-xs font-bold text-gray-800 tracking-wide">
                  {coupon.code}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm font-medium text-gray-900 mb-2 ml-7">
                {coupon.description}
              </p>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 mb-2" />

              {/* Applicable for + Apply button */}
              <div className="flex items-center justify-between ml-0">
                <span className="text-xs text-gray-400">{coupon.applicableFor}</span>
                <button
                  onClick={() => handleApply(coupon)}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    appliedId === coupon.id
                      ? "bg-[#7B4F1E] text-white border-[#7B4F1E]"
                      : "border-[#E9CCAE] text-[#7B4F1E] hover:bg-[#FDF3E7]"
                  }`}
                >
                  {appliedId === coupon.id ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Okay button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3.5 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] tracking-widest transition"
        >
          OKAY
        </button>
      </div>
    </GlobalModal>
  );
}