"use client";

import { useState } from "react";
import TradeInStepper       from "./TradeInStepper";
import StepSelectCategory   from "./StepSelectCategory";
import StepSelectBrand      from "./StepSelectBrand";
import StepSelectModel      from "./StepSelectModel";
import StepDeviceDetails    from "./StepDeviceDetails";
import StepCollectionMethod from "./StepCollectionMethod";
import type {
  TradeInStep, TradeInSelection, TradeInCategory,
  TradeInBrand, TradeInDevice, TradeInVariantSummary,
  TradeInConditionItem,
} from "./tradeIn.types";

const INITIAL_SELECTION: TradeInSelection = {
  category:  null,
  brand:     null,
  device:    null,
  variant:   null,
  condition: null,
};

const HOW_IT_WORKS = [
  "Provide device details and get a price quote",
  "Book a home pick-up or visit the nearest Dazzle store",
  "Your device will be assessed for condition",
  "Opt for a certified data wipe service",
  "Trade-in and get instant cash on home pickup or Dazzle Voucher on Store drop-off",
];

export default function TradeInWizard() {
  const [step, setStep]           = useState<TradeInStep>(0);
  const [selection, setSelection] = useState<TradeInSelection>(INITIAL_SELECTION);
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const selectCategory = (cat: TradeInCategory) => {
    setSelection((s) => ({ ...s, category: cat }));
    setStep(1);
  };

  const selectBrand = (brand: TradeInBrand) => {
    setSelection((s) => ({ ...s, brand }));
    setStep(2);
  };

  const selectVariant = (device: TradeInDevice, variant: TradeInVariantSummary) => {
    setSelection((s) => ({ ...s, device, variant }));
    setStep(3);
  };

  const selectCondition = (condition: TradeInConditionItem) => {
    setSelection((s) => ({ ...s, condition }));
    setStep(4);
  };

  // const handleSubmit = (_data: CollectionFormData) => {
  //   setSubmitted(true);
  // };

  // ── Remove breadcrumb chip ─────────────────────────────────────────────────
  const handleRemove = (key: keyof TradeInSelection) => {
    if (key === "category") {
      setSelection(INITIAL_SELECTION);
      setStep(0);
    } else if (key === "brand") {
      setSelection((s) => ({ ...s, brand: null, device: null, variant: null, condition: null }));
      setStep(1);
    } else if (key === "device" || key === "variant") {
      setSelection((s) => ({ ...s, device: null, variant: null, condition: null }));
      setStep(2);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Confirmed!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your trade-in request has been submitted. Our team will contact you shortly.
        </p>
        <button
          onClick={() => { setSelection(INITIAL_SELECTION); setStep(0); setSubmitted(false); }}
          className="px-6 py-3 rounded-xl bg-[#6D3F0E] text-white text-sm font-semibold hover:bg-[#5a3409] transition-colors"
        >
          Start New Trade-In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-350 mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center py-8">
        Trade-in your device
      </h1>

      <TradeInStepper currentStep={step} onStepClick={setStep} />

      <div className="grid md:grid-cols-3 gap-8 mt-6">
        {/* How it works sidebar */}
        <div className="hidden md:block">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">How it works</h3>
          <ol className="space-y-4">
            {HOW_IT_WORKS.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E9CCAE] dark:bg-[#3e2e1a] text-[#6D3F0E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{item}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Wizard content */}
        <div className="md:col-span-2 bg-white dark:bg-[#1e1c1a] rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm min-h-[400px]">
          {step === 0 && <StepSelectCategory onSelect={selectCategory} />}
          {step === 1 && <StepSelectBrand    selection={selection} onSelect={selectBrand}    onRemove={handleRemove} />}
          {step === 2 && <StepSelectModel    selection={selection} onSelectVariant={selectVariant} onRemove={handleRemove} />}
          {step === 3 && <StepDeviceDetails  selection={selection} onConditionSelect={selectCondition} onRemove={handleRemove} />}
          {step === 4 && <StepCollectionMethod selection={selection} onSuccess={() => setSubmitted(true)} />}
        </div>
      </div>
    </div>
  );
}
