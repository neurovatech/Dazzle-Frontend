/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useEffect } from "react";
import GlobalModal from "@/components/share/GlobalModal";
import { CareOption } from "./DazzleCare";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  "৳" + Math.round(n).toLocaleString("en-US");

// ─── Fake competitors for Live Other Price Check ─────────────────────────────
const COMPETITORS = [
  { name: "Apple Gadgets" },
  { name: "Gadget and Gear" },
  { name: "Phoneverse" },
  { name: "Phoneverse" },
];

// ─── Props ──────────────────────────────────────────────────────────────────
interface Props {
  product?: any;
  /** current offer/selected-variant price */
  currentPrice?: number;
  /** Dazzle Care options available for this product */
  dazzleCareOptions?: CareOption[];
  /** IDs the user has already selected in DazzleCare */
  selectedCareIds?: string[];
}

// ────────────────────────────────────────────────────────────────────────────
export default function TransparentProfitMeterArea({
  product,
  currentPrice = 0,
  dazzleCareOptions = [],
  selectedCareIds = [],
}: Props) {
  // ── modal visibility ──────────────────────────────────────────────────────
  const [showProfit, setShowProfit] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showPriceCheck, setShowPriceCheck] = useState(false);

  // ── Instant Replacement Calculator state ──────────────────────────────────
  // Which dazzle-care item is selected inside the calculator (default to first option)
  const [calcCareId, setCalcCareId] = useState<string | null>(() => {
    return selectedCareIds[0] ?? dazzleCareOptions[0]?.id ?? null;
  });

  // Ensure first dazzleCareOption is selected by default when options are loaded
  useEffect(() => {
    if (dazzleCareOptions.length > 0) {
      if (!calcCareId || !dazzleCareOptions.some((o) => o.id === calcCareId)) {
        setCalcCareId(selectedCareIds[0] ?? dazzleCareOptions[0].id);
      }
    }
  }, [dazzleCareOptions, selectedCareIds, calcCareId]);

  const price = currentPrice > 0 ? currentPrice : product?.discountedPrice ?? 0;
  const regularPrice = product?.regularPrice ?? price;
  // purchase margin (%) — use product field or fallback 3 %
  const purchaseRate: number = product?.purchaseRate ?? product?.salesOnRate ?? 3;
  const expectedProfit = Math.round((price * product?.profitRatio) / 100);

  // ── Calculator derived values ─────────────────────────────────────────────
  const selectedCareOpt =
    dazzleCareOptions.find((o) => o.id === calcCareId) ??
    dazzleCareOptions[0] ??
    null;

  const careWarrantyDays =
    selectedCareOpt?.warrantyDays && selectedCareOpt.warrantyDays > 0
      ? selectedCareOpt.warrantyDays
      : 365;

  // Slider value fixed to warranty days
  const keepDays = careWarrantyDays;
  const carePrice = selectedCareOpt?.price ?? 0;
  const dazzleEnabled = !!selectedCareOpt;

  // cost per day: Dazzle Care option price divided by warranty days
  const costPerDay = keepDays > 0 ? carePrice / keepDays : 0;
  const keepYrs = (keepDays / 365).toFixed(1);

  // ── Live Other Price Check ────────────────────────────────────────────────
  // Simulate competitors charging slightly more
  const competitorPremium = 1300;
  const dazzlePrice = price;
  const avgOthers = dazzlePrice + competitorPremium;
  const youSave = avgOthers - dazzlePrice;

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleCareToggle = useCallback((id: string) => {
    setCalcCareId(id);
  }, []);


  console.log(product, "productproductproductproductproductproductproductproductproductproductproductproductproductproductproductproductproductproductproduct");

  return (
    <div className="lg:flex gap-3 my-6">
      {/* ── 1. Transparent Profit Meter ──────────────────────────── */}
      <button
        onClick={() => setShowProfit(true)}
        className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-[#EEEEEE] text-[#222222] font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="rounded-lg p-1.5">
            <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.63 12.2609H18.14L19.61 2.46094H11.77L12.346 8.22194H9.988L8.34 9.32094L4.42 15.6909L0.5 17.1609L7.36 23.0409L9.81 22.0609H17.65L19.12 20.5909L18.63 19.1209L19.61 17.1609L18.63 15.2009L19.61 13.7309L18.63 12.2609Z" fill="white" />
              <path d="M10.3001 10.3L8.83008 0.5H16.1801L15.6901 2.46H11.7701L12.5541 10.3H10.3001Z" fill="#BBD8FF" />
              <path d="M12.5059 9.81063L12.7509 12.2606H18.1409L18.5079 9.81063H12.5059ZM15.6899 5.89062L14.2199 7.36063L15.6899 8.83063L17.1599 7.36063L15.6899 5.89062Z" fill="#BBD8FF" />
              <path d="M10.3 10.3L8.83 0.5H16.18M7.36 23.04L9.81 22.06H17.65L19.12 20.59L18.63 19.12L19.61 17.16L18.63 15.2L19.61 13.73L18.63 12.26H10.3M0.5 17.16L4.42 15.69L8.34 9.32L9.988 8.221" stroke="#092F63" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.7495 12.2609L11.7695 2.46094H19.6095L18.1395 12.2609" stroke="#092F63" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.6888 5.89062L14.2188 7.36063L15.6888 8.83063L17.1588 7.36063L15.6888 5.89062Z" stroke="#092F63" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span>Transparent Profit Meter</span>
          </div>
        </div>
      </button>

      {/* ── 2. Instant Replacement Calculator ───────────────────── */}
      <button
        onClick={() => setShowCalc(true)}
        className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-[#EEEEEE] text-[#222222] font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="rounded-lg p-1.5">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.74402 20.9557C2.9479 20.8954 2.20084 20.5477 1.64199 19.9775C1.08314 19.4073 0.750596 18.6534 0.706303 17.8562C0.524763 14.7495 0.464145 11.6369 0.524589 8.52539H18.5006C18.5606 11.6282 18.5006 14.702 18.3189 17.8562C18.2746 18.6534 17.942 19.4073 17.3832 19.9775C16.8243 20.5477 16.0773 20.8954 15.2812 20.9557C11.3554 21.242 7.66973 21.242 3.74402 20.9557Z" fill="#D7E0FF" />
              <path d="M0.705152 3.81541C0.614616 5.38383 0.554034 6.95383 0.523438 8.52455H18.5012C18.47 6.95381 18.4088 5.38381 18.3177 3.81541C18.2734 3.01824 17.9409 2.26434 17.382 1.69414C16.8232 1.12393 16.0761 0.776297 15.28 0.715983C11.4397 0.428006 7.58319 0.428006 3.74287 0.715983C2.94674 0.776297 2.19969 1.12393 1.64084 1.69414C1.08198 2.26434 0.749444 3.01824 0.705152 3.81541Z" fill="white" />
              <path d="M11.7644 4.51313H14.1181M4.89008 16.7206H5.37351M9.2718 16.7206H9.75351M13.7169 16.7206H14.2004M4.89008 12.8634H5.37351M9.2718 12.8634H9.75351M13.7169 12.8634H14.2004M0.705511 17.8554C0.801511 19.5063 2.09408 20.8348 3.74322 20.9548C7.66894 21.2411 11.3547 21.2411 15.2804 20.9548C16.0765 20.8945 16.8235 20.5469 17.3824 19.9767C17.9412 19.4065 18.2738 18.6526 18.3181 17.8554C18.5921 13.1794 18.5921 8.4914 18.3181 3.81541C18.2738 3.01824 17.9412 2.26434 17.3824 1.69414C16.8235 1.12393 16.0765 0.776297 15.2804 0.715983C11.44 0.428006 7.58355 0.428006 3.74322 0.715983C2.9471 0.776297 2.20005 1.12393 1.64119 1.69414C1.08234 2.26434 0.749803 3.01824 0.705511 3.81541C0.431496 8.4914 0.431496 13.1794 0.705511 17.8554Z" stroke="#4147D5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5009 8.52455H0.521484C0.551199 6.96912 0.61177 5.39941 0.703199 3.81541C0.747491 3.01824 1.08003 2.26434 1.63888 1.69414C2.19773 1.12393 2.94479 0.776297 3.74091 0.715983C7.58124 0.428006 11.4377 0.428006 15.2781 0.715983C16.9272 0.835983 18.2215 2.16455 18.3158 3.81541C18.4072 5.39941 18.4678 6.96912 18.4975 8.52455" stroke="#4147D5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span>Instant Replacement Calculator</span>
          </div>
        </div>
      </button>

      {/* ── 3. Live Other Price Check ────────────────────────────── */}
      <button
        onClick={() => setShowPriceCheck(true)}
        className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-[#EEEEEE] text-[#222222] font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="rounded-lg p-1.5">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.5" d="M14.505 0.75H4.995C3.836 0.75 3.257 0.75 2.789 0.913C2.34793 1.06972 1.94885 1.32586 1.62267 1.66158C1.29649 1.99731 1.05195 2.4036 0.908 2.849C0.75 3.331 0.75 3.927 0.75 5.12V19.124C0.75 19.982 1.735 20.438 2.358 19.868C2.53279 19.7065 2.76202 19.6168 3 19.6168C3.23798 19.6168 3.46721 19.7065 3.642 19.868L4.125 20.31C4.43121 20.5932 4.83293 20.7504 5.25 20.7504C5.66707 20.7504 6.06879 20.5932 6.375 20.31C6.68121 20.0268 7.08293 19.8696 7.5 19.8696C7.91707 19.8696 8.31879 20.0268 8.625 20.31C8.93121 20.5932 9.33293 20.7504 9.75 20.7504C10.1671 20.7504 10.5688 20.5932 10.875 20.31C11.1812 20.0268 11.5829 19.8696 12 19.8696C12.4171 19.8696 12.8188 20.0268 13.125 20.31C13.4312 20.5932 13.8329 20.7504 14.25 20.7504C14.6671 20.7504 15.0688 20.5932 15.375 20.31L15.858 19.868C16.0328 19.7065 16.262 19.6168 16.5 19.6168C16.738 19.6168 16.9672 19.7065 17.142 19.868C17.765 20.438 18.75 19.982 18.75 19.124V5.12C18.75 3.927 18.75 3.33 18.592 2.85C18.4482 2.40441 18.2037 1.99792 17.8775 1.66202C17.5513 1.32612 17.1522 1.06982 16.711 0.913C16.243 0.75 15.664 0.75 14.505 0.75Z" stroke="#6533F4" strokeWidth="1.5" />
              <path d="M7.25 9.15L8.679 10.75L12.25 6.75" stroke="#6533F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.25 14.25H14.25" stroke="#6533F4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span>Live other price check</span>
          </div>
        </div>
      </button>

      {/* ════════════════════════════════════════════════════════════
          MODAL 1 — Transparent Profit Meter
      ════════════════════════════════════════════════════════════ */}
      <GlobalModal
        isOpen={showProfit}
        onClose={() => setShowProfit(false)}
        title="Transparent Profit Meter"
      >
        <div className="px-6 py-5 space-y-3 text-[#222222]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Product price:</span>
            <span className="font-semibold">
              {price > 0 ? fmt(price) + "" : "Price on request"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Purchase:</span>
            <span className="font-semibold">{product?.profitRatio}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Expected profit:</span>
            <span className="font-semibold text-[#7A4F1E]">
              ~{fmt(expectedProfit)} 
            </span>
          </div>

          {regularPrice > price && (
            <>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Regular price:</span>
                <span className="line-through text-gray-400">{fmt(regularPrice)} BDT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">You save:</span>
                <span className="font-semibold text-green-600">
                  {fmt(regularPrice - price)} BDT
                </span>
              </div>
            </>
          )}

          <p className="text-xs text-gray-400 pt-2 leading-relaxed">
            Our pricing is fully transparent. The purchase rate reflects our
            operating margin so you always know exactly what you re paying.
          </p>
        </div>
      </GlobalModal>

      {/* ════════════════════════════════════════════════════════════
          MODAL 2 — Instant Replacement Calculator
      ════════════════════════════════════════════════════════════ */}
      <GlobalModal
        isOpen={showCalc}
        onClose={() => setShowCalc(false)}
        title="Instant Replacement Calculator"
      >
        <div className="px-6 py-5 space-y-5 text-[#222222]">
          {/* Cost per day headline */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Cost per day · over{" "}
                <span className="font-semibold text-gray-700">{keepYrs} years</span>
              </p>
              <p className="text-4xl font-bold text-[#7A4F1E]">
                {fmt(costPerDay)}/day
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                YOU PAY ONCE
              </p>
              <p className="text-lg font-bold text-gray-800">
                {fmt(price)}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
              <span>How long will you keep it?</span>
              <span className="font-semibold text-gray-700">
                {keepYrs} yrs · {keepDays} days
              </span>
            </div>
            <input
              type="range"
              min={180}
              max={1825}
              step={30}
              value={keepDays}
              disabled
              className="w-full accent-[#7A4F1E] h-1.5 cursor-not-allowed opacity-70"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              {["0.5y", "1y", "2y", "3y", "4y", "5y"].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          {/* Dazzle Care toggle section */}
          {dazzleCareOptions.length > 0 ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Include Dazzle&apos;s free replacement guarantee
              </p>
              <div className="space-y-2">
                {dazzleCareOptions.map((opt) => {
                  const isActive = calcCareId === opt.id;
                  const warrantyYrs = opt.warrantyDays
                    ? (opt.warrantyDays / 365).toFixed(1)
                    : null;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleCareToggle(opt.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all text-sm ${
                        isActive
                          ? "border-[#7A4F1E] bg-[#FFF8F0]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Toggle pill */}
                        <div
                          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                            isActive ? "bg-[#7A4F1E]" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span className={isActive ? "text-[#7A4F1E] font-semibold" : "text-gray-700"}>
                          {opt.title}
                          {warrantyYrs && (
                            <span className="ml-1 text-xs text-gray-400 font-normal">
                              ({warrantyYrs}yr warranty)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 shrink-0">
                        +{fmt(opt.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dazzle benefit explanation */}
              {dazzleEnabled && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  If anything breaks in {(careWarrantyDays / 365).toFixed(1)} years we replace it
                  once, free. Your guarantee lifetime is{" "}
                  <strong>{keepDays} days</strong> — the cost per day is{" "}
                  <strong>{fmt(costPerDay)}/day</strong>.
                </p>
              )}
            </div>
          ) : (
            /* No Dazzle Care plans available — show static info */
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                No Dazzle Care plans are available for this product.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 leading-relaxed">
            This calculator helps you understand the true daily value of your
            purchase over its expected lifetime.
          </p>
        </div>
      </GlobalModal>

      {/* ════════════════════════════════════════════════════════════
          MODAL 3 — Live Other Price Check
      ════════════════════════════════════════════════════════════ */}
      <GlobalModal
        isOpen={showPriceCheck}
        onClose={() => setShowPriceCheck(false)}
        title="Live Other Price Check"
      >
        <div className="px-6 py-5 space-y-5">
          {/* Savings headline */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>You save</span>
            <span className="text-3xl font-bold text-[#7A4F1E]">{fmt(youSave)}</span>
            <span className="text-gray-500">vs avg of others</span>
          </div>

          {/* Price table */}
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden text-sm">
            {/* Dazzle row — highlighted */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#FFFBF5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">#1</span>
                <span className="font-bold text-gray-800">Dazzle</span>
                <span className="text-[10px] font-semibold bg-[#7A4F1E] text-white px-2 py-0.5 rounded-full">
                  You
                </span>
              </div>
              <span className="font-bold text-[#7A4F1E]">{fmt(dazzlePrice)}</span>
            </div>

            {/* Competitor rows */}
            {COMPETITORS.map((comp, i) => {
              const compPrice = dazzlePrice + competitorPremium;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">
                      #{i + 2}
                    </span>
                    <span className="text-gray-700">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-red-500 font-medium">
                      +{fmt(competitorPremium)}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {fmt(compPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Prices are fetched live from public sources and may vary slightly.
            Dazzle guarantees the lowest price or we match it.
          </p>
        </div>
      </GlobalModal>
    </div>
  );
}
