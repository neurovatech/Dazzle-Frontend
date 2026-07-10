"use client";
import React, { useState } from "react";

export type DeliveryOption = "regular" | "fast" | "express" | "pickup";

type CartSidebarProps = {
  subtotal: string;
  deliveryFee: string;
  totalBill: string;
  hasAddress: boolean;
  paymentLabel: string;
  onAddressClick: () => void;
  onPaymentClick: () => void;
  onCouponClick: () => void;

  // 1. Exchange Rate Props
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;

  // 2. Split payment Props
  useWalletSplit: boolean;
  onWalletSplitToggle: (use: boolean) => void;
  walletBalance: string;

  // 3. Store Pickup Props
  selectedDelivery: DeliveryOption;
  onDeliveryChange: (opt: DeliveryOption) => void;
  selectedStore: string;
  onStoreChange: (store: string) => void;
  selectedTimeSlot: string;
  onTimeSlotChange: (slot: string) => void;
};

const DELIVERY_OPTIONS: { id: DeliveryOption; label: string; sub: string; fee: number }[] = [
  { id: "regular", label: "Regular Delivery", sub: "24 hours to 72 hours", fee: 60 },
  { id: "fast", label: "Extreme Fast Delivery 🚚", sub: "15min – 60min", fee: 150 },
  { id: "express", label: "Express Delivery", sub: "Single day delivery", fee: 100 },
  { id: "pickup", label: "Store Pickup", sub: "Collect from your nearby store", fee: 0 },
];

const STORES = [
  { id: "banani", name: "Banani Branch (Dazzle Flagship)" },
  { id: "dhanmondi", name: "Dhanmondi Branch (Dazzle Express)" },
  { id: "mirpur", name: "Mirpur Branch (Dazzle Hub)" },
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM (Available)",
  "12:00 PM - 02:00 PM (Available)",
  "02:00 PM - 04:00 PM (Available)",
  "04:00 PM - 06:00 PM (Available)",
  "06:00 PM - 08:00 PM (Available)",
];

const CURRENCIES = [
  { code: "BDT", label: "BDT (৳)", rate: 1 },
  { code: "USD", label: "USD ($)", rate: 118 },
  { code: "AED", label: "AED (د.إ)", rate: 32 },
  { code: "EUR", label: "EUR (€)", rate: 126 },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  AED: "د.إ",
  EUR: "€",
};

export default function CartSidebar({
  subtotal,
  deliveryFee,
  totalBill,
  hasAddress,
  paymentLabel,
  onAddressClick,
  onPaymentClick,
  onCouponClick,
  selectedCurrency,
  onCurrencyChange,
  useWalletSplit,
  onWalletSplitToggle,
  walletBalance,
  selectedDelivery,
  onDeliveryChange,
  selectedStore,
  onStoreChange,
  selectedTimeSlot,
  onTimeSlotChange,
}: CartSidebarProps) {
  const sym = CURRENCY_SYMBOLS[selectedCurrency] || "৳";

  return (
    <div className="bg-white dark:bg-[#1C1A17] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-5 text-gray-800 dark:text-gray-100">
      
      {/* 1. Exchange Rate Widget */}
      <div className="bg-[#FAF8F5] dark:bg-[#2D2A26] rounded-xl p-3.5 border border-gray-200/50 dark:border-gray-700/50">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Select Currency (Exchange Rate)
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {CURRENCIES.map((cur) => (
            <button
              key={cur.code}
              type="button"
              onClick={() => onCurrencyChange(cur.code)}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                selectedCurrency === cur.code
                  ? "bg-[#7B4F1E] border-[#7B4F1E] text-white shadow-xs"
                  : "bg-white dark:bg-[#3E3A35] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              {cur.code}
            </button>
          ))}
        </div>
      </div>

      {/* Address Block - Hide if store pickup is selected */}
      {selectedDelivery !== "pickup" && (
        <div className="bg-white dark:bg-[#262320] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={onAddressClick}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Delivery Address</span>
            </div>
            <span className="text-sm font-semibold text-[#7B4F1E] dark:text-[#bd9961]">
              {hasAddress ? "Edit" : "Add"}
            </span>
          </button>

          {!hasAddress && (
            <div className="mt-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-red-500">Address is required</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Delivery Options with constraints */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Delivery Options</h3>
        <div className="bg-gray-50 dark:bg-[#262320] rounded-xl divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800">
          {DELIVERY_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              onClick={() => onDeliveryChange(opt.id)}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{opt.sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#7B4F1E] dark:text-[#bd9961]">
                  {opt.fee === 0 ? "Free" : `+${sym}${opt.fee}`}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    selectedDelivery === opt.id ? "border-[#7B4F1E]" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {selectedDelivery === opt.id && (
                    <div className="w-2 h-2 rounded-full bg-[#7B4F1E]" />
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Store Pickup Scheduler (Shows conditionally) */}
      {selectedDelivery === "pickup" && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/40 space-y-3.5">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            🏪 Store Pickup Details
          </h4>

          {/* Branch Select */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Select Pickup Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => onStoreChange(e.target.value)}
              className="w-full text-sm bg-white dark:bg-[#3E3A35] border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#7B4F1E]"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time slot select */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Available Time Slot
            </label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => onTimeSlotChange(e.target.value)}
              className="w-full text-sm bg-white dark:bg-[#3E3A35] border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#7B4F1E]"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Extreme Fast delivery Info Badge */}
      {selectedDelivery === "fast" && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl p-3 border border-red-100 dark:border-red-900/40 flex items-start gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-xs space-y-1">
            <p className="font-bold">COD Auto-disabled!</p>
            <p>Cash on Delivery is unavailable for Extreme Fast Delivery. Online prepayment is required.</p>
          </div>
        </div>
      )}

      {/* Coupon Block */}
      <button
        onClick={onCouponClick}
        className="w-full flex items-center justify-between bg-[#FDF3E7] dark:bg-[#342D26] rounded-xl px-4 py-3.5 hover:bg-[#faebd4] dark:hover:bg-[#4E4338] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7B4F1E] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M7 17h.01M17 7h.01M3 12h18M12 3v18" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Apply Coupon Code</span>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 4. Cash Back splits & payment selector */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 py-1 px-2.5 rounded-full">
            🎁 ৳10,000 Cashback Eligible
          </span>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useWalletSplit}
            onChange={(e) => onWalletSplitToggle(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
          />
          <div className="text-xs">
            <p className="font-bold text-gray-800 dark:text-gray-200">Use Wallet Balance</p>
            <p className="text-gray-500 dark:text-gray-400">Available: {sym}{walletBalance} (Pay 50% from wallet)</p>
          </div>
        </label>
      </div>

      {/* Payment Selection */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Payment Method</h3>
        <button
          onClick={onPaymentClick}
          className="w-full flex items-center justify-between bg-white dark:bg-[#262320] rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-[#342D26] flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{paymentLabel}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Receipt */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Receipt</h3>
        <div className="bg-gray-50 dark:bg-[#262320] rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-4 space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">{sym}{subtotal}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {deliveryFee === "0" ? "Free" : `${sym}{deliveryFee}`}
            </span>
          </div>

          {useWalletSplit && (
            <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
              <span>Wallet Credit Applied (50%)</span>
              <span className="font-semibold">-{sym}{(parseFloat(totalBill.replace(/,/g, "")) / 2).toLocaleString()}</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Total Bill</span>
            <span className="text-base font-bold text-[#7B4F1E] dark:text-[#bd9961]">
              {sym}
              {(
                parseFloat(totalBill.replace(/,/g, "")) -
                (useWalletSplit ? parseFloat(totalBill.replace(/,/g, "")) / 2 : 0)
              ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>

            
          </div>
          <button className="bg-[#D4A97A] hover:bg-[#c89a6b]  text-white w-full font-medium py-2 px-4 rounded-lg transition">
              Confirm Order
            </button>
        </div>
      </div>
    </div>
  );
}