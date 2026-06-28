"use client";
import React, { useState, useEffect } from "react";
import GlobalModal from "@/components/share/GlobalModal";

export type PaymentMethod = "cash" | "mobile_banking" | "card" | "store" | "book";

type PaymentMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, subProvider?: string) => void;
  bookProductPrice?: string;
  selectedDelivery?: string; // To disable COD when fast delivery is active
};

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub?: string }[] = [
  { id: "cash", label: "Cash on Delivery", sub: "Pay with cash when package arrives" },
  { id: "mobile_banking", label: "Mobile Banking (bKash / Nagad)", sub: "Pay instantly via MFS" },
  { id: "card", label: "Debit/Credit Card (SSLCommerz)", sub: "Visa, Mastercard, AMEX" },
  { id: "store", label: "Pay at Store", sub: "Visit showroom to complete payment" },
  { id: "book", label: "Book Product", sub: "Pre-order booking deposit only" },
];

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onConfirm,
  bookProductPrice = "৳1,00,000",
  selectedDelivery = "regular",
}: PaymentMethodModalProps) {
  const [selected, setSelected] = useState<PaymentMethod>("cash");
  const [selectedSubProvider, setSelectedSubProvider] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  // If Fast delivery is selected, default to Mobile Banking instead of COD
  useEffect(() => {
    if (selectedDelivery === "fast" && selected === "cash") {
      setSelected("mobile_banking");
    }
  }, [selectedDelivery, selected]);

  const handlePaymentConfirm = () => {
    if (selected === "mobile_banking" || selected === "card") {
      // Simulate real-time payment gateway verification flow
      setIsVerifying(true);
      setVerificationStep(1);

      setTimeout(() => {
        setVerificationStep(2); // Mock Awaiting OTP
      }, 1500);

      setTimeout(() => {
        setVerificationStep(3); // Mock Webhook verification
      }, 3000);

      setTimeout(() => {
        setIsVerifying(false);
        onConfirm(selected, selectedSubProvider || undefined);
        onClose();
      }, 4500);
    } else {
      onConfirm(selected);
      onClose();
    }
  };

  const isCodDisabled = selectedDelivery === "fast";

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Select Payment Method">
      <div className="px-6 pb-6 text-gray-800 dark:text-gray-100">
        {isVerifying ? (
          /* Payment verification loading screen simulator */
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-pulse">
            <div className="w-16 h-16 rounded-full border-4 border-[#7B4F1E]/20 border-t-[#7B4F1E] animate-spin flex items-center justify-center">
              <svg className="w-6 h-6 text-[#7B4F1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Secure Payment Gateway</h3>
              {verificationStep === 1 && (
                <p className="text-sm text-gray-500">Initiating secure connection with gateway API...</p>
              )}
              {verificationStep === 2 && (
                <p className="text-sm text-amber-600 font-medium">Awaiting OTP / Mobile Authentication verification...</p>
              )}
              {verificationStep === 3 && (
                <p className="text-sm text-emerald-600 font-medium">Payment received! Simulating webhook trigger and stock sync...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {PAYMENT_OPTIONS.map((opt) => {
                const disabled = opt.id === "cash" && isCodDisabled;
                return (
                  <div key={opt.id} className="py-2.5">
                    <label
                      onClick={() => !disabled && setSelected(opt.id)}
                      className={`flex items-center justify-between py-2 cursor-pointer group ${
                        disabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                          {opt.id === "cash" && isCodDisabled && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{opt.sub}</p>
                        {opt.id === "book" && (
                          <p className="text-xs text-[#7B4F1E] dark:text-[#bd9961] font-bold mt-1">
                            Deposit Required: {bookProductPrice}
                          </p>
                        )}
                      </div>

                      {/* Radio Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected === opt.id
                            ? "border-[#7B4F1E]"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {selected === opt.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7B4F1E]" />
                        )}
                      </div>
                    </label>

                    {/* Expand MFS Options conditionally */}
                    {selected === "mobile_banking" && opt.id === "mobile_banking" && (
                      <div className="mt-2 pl-4 py-2 border-l-2 border-orange-500/30 flex gap-3 animate-fade-in">
                        <button
                          type="button"
                          onClick={() => setSelectedSubProvider("bkash")}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer transition ${
                            selectedSubProvider === "bkash"
                              ? "bg-[#D12053] text-white border-[#D12053]"
                              : "bg-[#FDF3E7] text-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-150"
                          }`}
                        >
                          bKash Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSubProvider("nagad")}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer transition ${
                            selectedSubProvider === "nagad"
                              ? "bg-[#EC1C24] text-white border-[#EC1C24]"
                              : "bg-[#FDF3E7] text-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-150"
                          }`}
                        >
                          Nagad Account
                        </button>
                      </div>
                    )}

                    {/* Expand SSLCommerz card details conditionally */}
                    {selected === "card" && opt.id === "card" && (
                      <div className="mt-2 pl-4 py-2 border-l-2 border-blue-500/30 text-xs text-gray-500 dark:text-gray-400 space-y-2 animate-fade-in">
                        <p className="font-semibold">Integrated via SSLCommerz Gateway</p>
                        <div className="flex gap-2">
                          <span className="bg-gray-100 dark:bg-gray-850 px-2 py-1 rounded">Visa</span>
                          <span className="bg-gray-100 dark:bg-gray-850 px-2 py-1 rounded">Mastercard</span>
                          <span className="bg-gray-100 dark:bg-gray-850 px-2 py-1 rounded">AMEX</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handlePaymentConfirm}
              className="w-full py-3.5 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] tracking-widest transition cursor-pointer"
            >
              OKAY
            </button>
          </div>
        )}
      </div>
    </GlobalModal>
  );
}