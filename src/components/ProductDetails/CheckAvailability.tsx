/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info } from "lucide-react";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  EXCHANGE MODAL DATA                                                 */
/* ------------------------------------------------------------------ */

const EXCHANGE_CATEGORIES = [
  { id: "phone", label: "Phone" },
  { id: "laptop", label: "Laptop" },
  { id: "tablet", label: "Tablet" },
];

const EXCHANGE_BRANDS: Record<string, { id: string; label: string; logo: React.ReactNode }[]> = {
  phone: [
    {
      id: "apple",
      label: "Apple",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
    },
    {
      id: "samsung",
      label: "Samsung",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M2.042 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10S2.042 17.523 2.042 12zm10-8.5A8.5 8.5 0 003.542 12a8.5 8.5 0 008.5 8.5 8.5 8.5 0 008.5-8.5 8.5 8.5 0 00-8.5-8.5zm-1.5 5h3v1.5h-1.5V15h-1.5V8.5zm3.5 0h1.5V10H14V8.5z" />
        </svg>
      ),
    },
    {
      id: "xiaomi",
      label: "Xiaomi",
      logo: (
        <span className="text-xs font-black text-orange-500">MI</span>
      ),
    },
    {
      id: "oppo",
      label: "OPPO",
      logo: (
        <span className="text-xs font-black text-green-600">OPPO</span>
      ),
    },
  ],
  laptop: [
    { id: "apple", label: "Apple", logo: <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg> },
    { id: "dell", label: "Dell", logo: <span className="text-xs font-black text-blue-700">DELL</span> },
    { id: "hp", label: "HP", logo: <span className="text-xs font-black text-blue-500">HP</span> },
  ],
  tablet: [
    { id: "apple", label: "Apple", logo: <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg> },
    { id: "samsung", label: "Samsung", logo: <span className="text-xs font-black text-blue-600">Samsung</span> },
  ],
};

const EXCHANGE_MODELS: Record<string, string[]> = {
  apple: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro"],
  samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy A55", "Galaxy A35"],
  xiaomi: ["Redmi Note 13 Pro", "Poco X6 Pro", "Mi 13"],
  oppo: ["Find X7", "Reno 11", "A98"],
  dell: ["XPS 15", "Inspiron 15", "G15"],
  hp: ["Spectre x360", "Envy 15", "Victus"],
};

const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const RAM_OPTIONS = ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"];

const DELIVERY_LOCATIONS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Mymensingh", "Rangpur",
];

const PICKUP_STORES = [
  "Dazzle Banani Flagship Store",
  "Dazzle Dhanmondi Express",
  "Dazzle Mirpur Hub",
  "Dazzle Uttara Branch",
];

/* ------------------------------------------------------------------ */
/*  EXCHANGE MODAL COMPONENT                                            */
/* ------------------------------------------------------------------ */

type ExchangeStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function ExchangeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<ExchangeStep>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["phone"]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedRam, setSelectedRam] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"regular" | "store">("regular");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");

  const activeCategoryId = selectedCategories[selectedCategories.length - 1] ?? "phone";
  const brands = EXCHANGE_BRANDS[activeCategoryId] ?? [];
  const models = selectedBrand ? (EXCHANGE_MODELS[selectedBrand] ?? []) : [];

  // estimated price calculation (dummy)
  const estimatedPrice = useMemo(() => {
    if (!selectedStorage) return 0;
    const gb = parseInt(selectedStorage) || 0;
    const base = activeCategoryId === "laptop" ? 25000 : 15000;
    return base + gb * 50;
  }, [selectedStorage, activeCategoryId]);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedStorage(null);
    setSelectedRam(null);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCategories(["phone"]);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedStorage(null);
    setSelectedRam(null);
    setDeliveryType("regular");
    setSelectedLocation("");
    setSelectedStore("");
    onClose();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as ExchangeStep);
    else handleClose();
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return selectedCategories.length > 0 && !!selectedBrand;
    if (step === 3) return !!selectedModel;
    if (step === 4) return !!selectedStorage;
    if (step === 5) return !!selectedRam;
    if (step === 6) return true;
    if (step === 7) return deliveryType === "regular" ? !!selectedLocation : !!selectedStore;
    return true;
  };

  const stepTitle =
    step === 1 ? "Exchange" :
    step === 2 ? "Exchange" :
    step === 3 ? "Exchange" :
    step === 4 ? "Exchange" :
    step === 5 ? "Exchange" :
    step === 6 ? "Exchange" :
    "Exchange";

  return (
    <GlobalModal isOpen={isOpen} onClose={handleClose} onBack={step > 1 ? handleBack : undefined} title={stepTitle}>
      <div className="flex flex-col" style={{ minHeight: 480 }}>

        {/* ── STEP 1: Intro ── */}
        {step === 1 && (
          <div className="flex flex-col items-center px-6 py-6 gap-4">
            {/* Hero image */}
            <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 dark:from-[#4a3820] dark:to-[#3a2c18] flex items-center justify-center" style={{ height: 180 }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-32 bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                    </svg>
                  </div>
                  <div className="absolute -right-3 -bottom-2 w-10 h-16 bg-white dark:bg-gray-700 rounded-xl shadow-xl flex items-center justify-center rotate-12">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </div>
                  <div className="w-1 h-8 bg-orange-300 rounded-full"/>
                </div>
                <div className="w-20 h-32 bg-orange-500 rounded-2xl shadow-2xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Phone Exchange Program</h2>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-2">How It Works</h3>
              <div className="space-y-2">
                {[
                  "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh.",
                  "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh.",
                  "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh.",
                  "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#7B4F1E] hover:bg-[#6C4419] text-white font-bold rounded-xl transition text-sm tracking-wide mt-2"
            >
              EXCHANGE NOW
            </button>
          </div>
        )}

        {/* ── STEP 2: Select Category + Brand ── */}
        {step === 2 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            {/* Category tabs */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {EXCHANGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      selectedCategories.includes(cat.id)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {cat.label}
                    {selectedCategories.includes(cat.id) && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand select */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Brand</p>
              <div className="grid grid-cols-4 gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setSelectedBrand(brand.id); setSelectedModel(null); }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition cursor-pointer aspect-square ${
                      selectedBrand === brand.id
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                        : "border-gray-100 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="text-gray-800 dark:text-white">{brand.logo}</div>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{brand.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mt-auto">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How It Works</h3>
              <div className="space-y-1.5">
                {["Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh.","Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh."].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={() => canProceed() && setStep(3)}
                disabled={!canProceed()}
                className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Select Model ── */}
        {step === 3 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map((catId) => {
                  const cat = EXCHANGE_CATEGORIES.find(c => c.id === catId);
                  return cat ? (
                    <span key={cat.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">
                      {cat.label}
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </span>
                  ) : null;
                })}
                {selectedBrand && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold capitalize">
                    {selectedBrand}
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Model</p>
              <div className="grid grid-cols-2 gap-2">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`p-3 rounded-xl border-2 text-xs font-semibold text-center transition cursor-pointer ${
                      selectedModel === model
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                        : "border-gray-100 dark:border-gray-700 hover:border-orange-300 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How It Works</h3>
              <div className="space-y-1.5">
                {["Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh."].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
              <button onClick={() => canProceed() && setStep(4)} disabled={!canProceed()} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Select Storage ── */}
        {step === 4 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map((catId) => {
                  const cat = EXCHANGE_CATEGORIES.find(c => c.id === catId);
                  return cat ? (
                    <span key={cat.id} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">{cat.label}</span>
                  ) : null;
                })}
                {selectedBrand && <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold capitalize">{selectedBrand}</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Storage</p>
              <div className="flex flex-wrap gap-2">
                {STORAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedStorage(opt)}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition cursor-pointer ${
                      selectedStorage === opt
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                        : "border-gray-100 dark:border-gray-700 hover:border-orange-300 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Selected Model</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-medium">
                {selectedModel ?? "—"}
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-2">
              <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
              <button onClick={() => canProceed() && setStep(5)} disabled={!canProceed()} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Select RAM ── */}
        {step === 5 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map((catId) => {
                  const cat = EXCHANGE_CATEGORIES.find(c => c.id === catId);
                  return cat ? <span key={cat.id} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">{cat.label}</span> : null;
                })}
                {selectedBrand && <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold capitalize">{selectedBrand}</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select RAM</p>
              <div className="flex flex-wrap gap-2">
                {RAM_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedRam(opt)}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition cursor-pointer ${
                      selectedRam === opt
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                        : "border-gray-100 dark:border-gray-700 hover:border-orange-300 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">How It Works</p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Selling your Apple {selectedModel || "iPhone"} 13 pro max (2023) mobile phone can bring you <span className="font-bold">৳ {estimatedPrice.toLocaleString()}</span>
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Phone Price</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">৳{estimatedPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-2">
              <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
              <button onClick={() => canProceed() && setStep(6)} disabled={!canProceed()} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Condition & Price ── */}
        {step === 6 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map((catId) => {
                  const cat = EXCHANGE_CATEGORIES.find(c => c.id === catId);
                  return cat ? <span key={cat.id} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">{cat.label}</span> : null;
                })}
                {selectedBrand && <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold capitalize">{selectedBrand}</span>}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#4a3820] dark:to-[#3a2c18] border border-orange-100 dark:border-orange-900/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Model</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-white">{selectedModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Storage</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-white">{selectedStorage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">RAM</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-white">{selectedRam}</span>
              </div>
              <div className="border-t border-orange-100 dark:border-orange-900/40 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Estimated Value</span>
                <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">৳{estimatedPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Get FREE home pick-up for your old used device. Select your city.
              </p>
            </div>

            <div className="flex gap-3 mt-auto pt-2">
              <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
              <button onClick={() => setStep(7)} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
            </div>
          </div>
        )}

        {/* ── STEP 7: Location & Delivery ── */}
        {step === 7 && (
          <div className="flex flex-col px-5 py-5 gap-4 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Category</p>
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map((catId) => {
                  const cat = EXCHANGE_CATEGORIES.find(c => c.id === catId);
                  return cat ? <span key={cat.id} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">{cat.label}</span> : null;
                })}
                {selectedBrand && <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold capitalize">{selectedBrand}</span>}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Get FREE home pick-up for your old used device. Select your city.
              </p>
            </div>

            {/* Location dropdown */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Location</p>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
              >
                <option value="">Select location</option>
                {DELIVERY_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Delivery options */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Delivery Options</p>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    deliveryType === "regular"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-gray-100 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="regular"
                    checked={deliveryType === "regular"}
                    onChange={() => setDeliveryType("regular")}
                    className="accent-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Regular Delivery</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Call / WhatsApp and pickup any time</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    deliveryType === "store"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-gray-100 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="store"
                    checked={deliveryType === "store"}
                    onChange={() => setDeliveryType("store")}
                    className="accent-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Store Pickup</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Call / WhatsApp and pickup any time</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Store picker if store selected */}
            {deliveryType === "store" && (
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Choose Pickup Store</p>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                >
                  <option value="">Choose Pickup Store</option>
                  {PICKUP_STORES.map((store) => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-auto pt-2">
              <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
              <button
                onClick={() => {
                  if (canProceed()) {
                    alert("Exchange request submitted successfully! Our team will contact you shortly.");
                    handleClose();
                  }
                }}
                disabled={!canProceed()}
                className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

      </div>
    </GlobalModal>
  );
}

// Simulated branch coordinates (Dhaka, Bangladesh)
const BRANCHES = [
  {
    id: "banani",
    name: "Banani Flagship Store",
    stock: "12 units available",
    lat: 23.7937,
    lon: 90.4066,
  },
  {
    id: "dhanmondi",
    name: "Dhanmondi Express Store",
    stock: "Out of Stock",
    lat: 23.7561,
    lon: 90.3769,
  },
  {
    id: "mirpur",
    name: "Mirpur Dazzle Hub",
    stock: "9 units available",
    lat: 23.8069,
    lon: 90.3687,
  },
];

// Haversine formula to compute distance in km
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ------------------------------------------------------------------ */
/*  EMI DATA PARSING                                                   */
/* ------------------------------------------------------------------ */

interface PageResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: {
    pageUuid: string;
    pageTitle: string;
    pageSlug: string;
    pageContent: string;
  };
}

interface EmiBankRow {
  name: string;
  months: Record<number, number | null>; // month -> percentage (null = N/A)
}

const MONTH_ORDER = [3, 6, 9, 12, 18, 24, 30, 36];

/**
 * The API returns a raw HTML blob containing several <table>s.
 * The EMI table is the one whose header row includes "30 Months"
 * (the other charge tables in the same content max out at 36 without 30).
 */
function parseEmiTable(html: string): EmiBankRow[] {
  if (typeof window === "undefined" || !html) return [];

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const tables = Array.from(doc.querySelectorAll("table"));

    for (const table of tables) {
      const rows = Array.from(table.querySelectorAll("tr"));

      const headerRowIndex = rows.findIndex((tr) =>
        Array.from(tr.querySelectorAll("td, th")).some((cell) =>
          /30\s*Months?/i.test(cell.textContent || ""),
        ),
      );

      if (headerRowIndex === -1) continue;

      const headerCells = Array.from(
        rows[headerRowIndex].querySelectorAll("td, th"),
      );

      const monthColumns: number[] = headerCells.map((cell) => {
        const match = (cell.textContent || "").match(/(\d+)\s*Months?/i);
        return match ? parseInt(match[1], 10) : NaN;
      });

      const banks: EmiBankRow[] = [];

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("td"));
        if (cells.length < 2) continue;

        const name = (cells[0].textContent || "")
          .replace(/\u00A0/g, " ")
          .trim();
        if (!name) continue;

        const months: Record<number, number | null> = {};
        monthColumns.forEach((month, idx) => {
          if (!month || Number.isNaN(month)) return;
          const raw = (cells[idx + 1]?.textContent || "")
            .replace(/\u00A0/g, " ")
            .trim();
          const pctMatch = raw.match(/([\d.]+)\s*%/);
          months[month] = pctMatch ? parseFloat(pctMatch[1]) : null;
        });

        banks.push({ name, months });
      }

      if (banks.length) return banks;
    }
  } catch (err) {
    console.error("Failed to parse EMI table:", err);
  }

  return [];
}

function calculateEmi(amount: number, pct: number, months: number) {
  const effectiveCost = amount + (amount * pct) / 100;
  const monthlyEmi = effectiveCost / months;
  return { effectiveCost, monthlyEmi };
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function CheckAvailability({
  product,
  currentPrice,
  externalEmiOpen,
  onExternalEmiClose,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locError, setLocError] = useState<string | null>(null);

  // ---- EMI modal state ----
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // Amount — currentPrice থেকে নাও, না থাকলে minBookingPrice
  const defaultAmount = String(
    currentPrice && currentPrice > 0
      ? currentPrice
      : (product?.discountedPrice ?? product?.minBookingPrice ?? 0),
  );
  const [amount, setAmount] = useState<string>(defaultAmount);

  // currentPrice বদলালে amount sync করো
  useEffect(() => {
    const newAmt =
      currentPrice && currentPrice > 0
        ? String(currentPrice)
        : String(product?.discountedPrice ?? product?.minBookingPrice ?? 0);
    setAmount(newAmt);
  }, [currentPrice, product?.discountedPrice, product?.minBookingPrice]);

  // External EMI open support (StickyPurchaseBar থেকে trigger)
  const emiModalOpen = externalEmiOpen || isEmiOpen;
  const closeEmiModal = () => {
    setIsEmiOpen(false);
    onExternalEmiClose?.();
  };

  const { data: emiPageData, isLoading: isEmiLoading } = useQuery<PageResponse>(
    {
      queryKey: ["page-emi-policy"],
      staleTime: 30 * 60 * 1000, // 30 min — policy pages don't change often
      queryFn: () => api.get<PageResponse>("/pages/emi_policy"),
      enabled: emiModalOpen, // only fetch once the user actually opens the modal
    },
  );

  const emiBanks = useMemo(
    () => parseEmiTable(emiPageData?.data?.pageContent || ""),
    [emiPageData],
  );

  // Default to the first bank once the data has loaded
  useEffect(() => {
    if (!selectedBank && emiBanks.length > 0) {
      setSelectedBank(emiBanks[0].name);
    }
  }, [emiBanks, selectedBank]);

  const activeBank = useMemo(
    () => emiBanks.find((b) => b.name === selectedBank) || null,
    [emiBanks, selectedBank],
  );

  const numericAmount = Number(amount) || 0;

  const handleGeoLocation = () => {
    setIsLocating(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserCoords({ lat, lon });

        const computedDistances: Record<string, number> = {};
        BRANCHES.forEach((branch) => {
          computedDistances[branch.id] = parseFloat(
            calculateDistance(lat, lon, branch.lat, branch.lon).toFixed(2),
          );
        });
        setDistances(computedDistances);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocError(
          "Location access denied. Using center coordinates of Dhaka instead.",
        );

        const lat = 23.7771;
        const lon = 90.4262;
        setUserCoords({ lat, lon });

        const computedDistances: Record<string, number> = {};
        BRANCHES.forEach((branch) => {
          computedDistances[branch.id] = parseFloat(
            calculateDistance(lat, lon, branch.lat, branch.lon).toFixed(2),
          );
        });
        setDistances(computedDistances);
        setIsLocating(false);
      },
    );
  };

  const nearestBranchId = Object.keys(distances).reduce(
    (a, b) => (distances[a] < distances[b] ? a : b),
    "",
  );

  return (
    <div className="lg:flex gap-3 my-6">
      {/* Minimum Booking */}
      <button onClick={() => setIsOpen(true)} className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <CheckHome />
          </span>
          <div className="flex flex-col items-start">
            <span>Check Availability </span>
            {/* <span> {product?.minBookingPrice} BDT</span> */}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Exchange */}
      <button onClick={() => setIsExchangeOpen(true)} className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.2374 13.1279C12.5553 12.2552 13.5251 10.9476 13.9778 9.43319C14.4305 7.91876 14.3373 6.29349 13.7146 4.84069C13.0919 3.38788 11.979 2.19969 10.5701 1.48324C9.16115 0.76678 7.54545 0.567498 6.00465 0.920128M11.2374 13.1279V10.5029M11.2374 13.1279H13.8796M3.75465 1.88988C2.44133 2.76581 1.47655 4.07434 1.0281 5.58793C0.579642 7.10152 0.675875 8.72442 1.30006 10.1744C1.92425 11.6244 3.0369 12.8097 4.44454 13.5243C5.85217 14.2389 7.46574 14.4375 9.00465 14.0856M3.75465 1.88988V4.50288M3.75465 1.88988H1.12965"
                stroke="#00AE84"
                strokeOpacity="0.93"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span>Exchange</span>
            {/* <span> {product?.purchasePoints} Points</span> */}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* EMI Button */}
      <button
        onClick={() => setIsEmiOpen(true)}
        className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.64333 0C8.30632 0.000141594 8.9421 0.263627 9.41083 0.7325L15.8358 7.1575C16.3686 7.6904 16.6679 8.41311 16.6679 9.16667C16.6679 9.92023 16.3686 10.6429 15.8358 11.1758L11.1758 15.8358C10.6429 16.3686 9.92023 16.6679 9.16667 16.6679C8.41311 16.6679 7.6904 16.3686 7.1575 15.8358L0.7325 9.41083C0.263627 8.9421 0.000141594 8.30632 0 7.64333V3.33333C0 2.44928 0.35119 1.60143 0.976311 0.976311C1.60143 0.35119 2.44928 0 3.33333 0H7.64333ZM4.58333 2.91667C4.16285 2.91653 3.75786 3.07534 3.44954 3.36125C3.14123 3.64716 2.95237 4.03904 2.92083 4.45833L2.91667 4.58333C2.91667 4.91297 3.01442 5.2352 3.19755 5.50928C3.38069 5.78337 3.64098 5.99699 3.94553 6.12313C4.25007 6.24928 4.58518 6.28228 4.90848 6.21798C5.23179 6.15367 5.52876 5.99493 5.76184 5.76184C5.99493 5.52876 6.15367 5.23179 6.21798 4.90848C6.28228 4.58518 6.24928 4.25007 6.12313 3.94553C5.99699 3.64098 5.78337 3.38069 5.50928 3.19755C5.2352 3.01442 4.91297 2.91667 4.58333 2.91667Z"
                fill="#6533F4"
              />
            </svg>
          </span>
          <span>EMI</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Geolocation stock check modal */}
      <GlobalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Branch-wise Stock Availability"
      >
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          <p className="text-xs text-gray-500">
            Real-time branch inventory tracker. Trigger distance calculation to
            find your nearest Dazzle branch location.
          </p>

          <button
            type="button"
            onClick={handleGeoLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#7B4F1E] text-white hover:bg-[#6C4419] rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Navigation
              size={16}
              className={isLocating ? "animate-spin" : ""}
            />
            {isLocating
              ? "Locating Your Device..."
              : "Find Nearest Branch Store"}
          </button>

          {locError && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg text-xs border border-amber-100 dark:border-amber-900/40">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>{locError}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {BRANCHES.map((branch) => {
              const distance = distances[branch.id];
              const isNearest = nearestBranchId === branch.id;
              const isAvailable = branch.stock !== "Out of Stock";

              return (
                <div
                  key={branch.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    isNearest
                      ? "border-orange-500 bg-orange-500/5 dark:bg-orange-950/10"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {branch.name}
                      </span>
                      {isNearest && (
                        <span className="text-[9px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <MapPin size={8} /> Nearest Store
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs ${isAvailable ? "text-emerald-600 font-semibold" : "text-red-500"}`}
                    >
                      {branch.stock}
                    </p>
                  </div>

                  {distance !== undefined && (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 py-1 px-2.5 rounded-lg">
                      {distance} km away
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlobalModal>

   {/* ---------------- EMI Options Modal ---------------- */}
<GlobalModal isOpen={emiModalOpen} onClose={closeEmiModal} title="EMI Options">
  <div className="flex flex-row h-[85dvh] sm:h-[75vh] max-h-[600px] overflow-hidden">
    {/* Left: bank list */}
    <div className="w-45 sm:w-64 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 min-h-0">
      <div className="px-2 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-[9px] sm:text-[11px] font-bold tracking-wide text-gray-400 uppercase">
          Bank Name
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 sm:p-2 space-y-2">
        {isEmiLoading && (
          <p className="text-[10px] sm:text-xs text-gray-400 px-2 py-4">Loading…</p>
        )}
        {!isEmiLoading && emiBanks.length === 0 && (
          <p className="text-[10px] sm:text-xs text-gray-400 px-2 py-4">No EMI data.</p>
        )}
        {emiBanks.map((bank) => (
          <button
            key={bank.name}
            type="button"
            onClick={() => setSelectedBank(bank.name)}
            className={`w-full text-left text-[11px] sm:text-sm leading-tight px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition cursor-pointer ${
              selectedBank === bank.name
                ? "bg-gray-900 text-white font-semibold dark:bg-white dark:text-gray-900"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {bank.name}
          </button>
        ))}
      </div>
    </div>

    {/* Right: amount + plans */}
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-4 border-b border-gray-100 dark:border-gray-800">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 shrink-0">
          Amount
        </label>
        <input
          type="text"
          value={amount}
          readOnly
          className="flex-1 min-w-0 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none bg-white dark:bg-gray-900"
        />
      </div>

      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
        <span>Plan</span>
        <span className="text-center">EMI</span>
        <span className="text-right">Eff. Cost</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pb-4 sm:pb-6 space-y-1.5 sm:space-y-2">
        {!activeBank && !isEmiLoading && (
          <p className="text-xs sm:text-sm text-gray-400 py-6 text-center">
            Select a bank to see plans.
          </p>
        )}
        {activeBank &&
          MONTH_ORDER.filter(
            (m) => activeBank.months[m] !== undefined && activeBank.months[m] !== null,
          ).map((month) => {
            const pct = activeBank.months[month] as number;
            const { effectiveCost, monthlyEmi } = calculateEmi(numericAmount, pct, month);
            return (
              <div
                key={month}
                className="grid grid-cols-3 items-center gap-1 sm:gap-2 bg-gray-50 dark:bg-[#3e3329] border border-[#2222] dark:border-[#222] rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3"
              >
                <span className="text-[11px] sm:text-sm font-bold text-gray-800 dark:text-gray-100">
                  {month}
                </span>
                <div className="text-center">
                  <p className="text-[11px] sm:text-sm font-bold text-orange-500 whitespace-nowrap">
                    {Math.round(monthlyEmi).toLocaleString()}
                  </p>
                  <p className="text-[8px] sm:text-[11px] text-gray-400 whitespace-nowrap">
                    ({pct}%)
                  </p>
                </div>
                <p className="text-[11px] sm:text-sm font-semibold text-gray-700 dark:text-gray-200 text-right whitespace-nowrap">
                  {Math.round(effectiveCost).toLocaleString()}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  </div>
</GlobalModal>

      {/* Exchange Modal */}
      <ExchangeModal isOpen={isExchangeOpen} onClose={() => setIsExchangeOpen(false)} />
    </div>
  );
}
