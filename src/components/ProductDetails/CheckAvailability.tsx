/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info, Loader2, ChevronDown, ChevronRight, XCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import NoImg from "@/images/no_images.png";
import type {
  TradeInCategory,
  TradeInBrand,
  TradeInDevice,
  TradeInVariantSummary,
  TradeInConditionItem,
  TradeInVariantDetail,
  TradeInVariantResponse,
  TradeInListResponse,
  TradeInSelection,
} from "@/components/TradeIn/tradeIn.types";

/* ------------------------------------------------------------------ */
/*  EXCHANGE MODAL DATA                                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  EXCHANGE MODAL API TYPES & DATA                                    */
/* ------------------------------------------------------------------ */

interface CategoryListResponse {
  found: boolean;
  data: TradeInCategory[];
}

interface BrandListResponse {
  found: boolean;
  data: TradeInBrand[];
}

interface AreaItem {
  areaID: number;
  areaName: string;
}

interface DistrictItem {
  distID: number;
  districtName: string;
  area: AreaItem[];
}

interface AreaListResponse {
  statusCode: number;
  data: DistrictItem[];
}

interface TradeInRequestPayload {
  firstName: string;
  lastName?: string;
  email: string;
  mobileNo: string;
  address: string;
  tradeInUuid: string;
  tradeVariantUuid: string;
  districtId: number;
  policeStationId: number;
  createdAt: string;
}

interface TradeInRequestResponse {
  statusCode: number;
  status: string;
  message?: string;
  data?: {
    firstName: string;
    lastName: string;
    address: string;
    email: string;
    deviceName: string;
    variantName: string;
    thumbnailUrl: string;
    createdAt: string;
  };
  errors?: string[];
}

/* ------------------------------------------------------------------ */
/*  EXCHANGE MODAL COMPONENT                                            */
/* ------------------------------------------------------------------ */

function ExchangeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { token, apiKey } = useAppSelector((state) => state.auth);
  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  const [step, setStep] = useState<number>(1);
  const [selection, setSelection] = useState<TradeInSelection>({
    category: null,
    brand: null,
    device: null,
    variant: null,
    condition: null,
  });

  // Form states for pickup step
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [districtID, setDistrictID] = useState<number>(0);
  const [thanaID, setThanaID] = useState<number>(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Category query
  const { data: categoryData, isLoading: isCatLoading } = useQuery<CategoryListResponse>({
    queryKey: ["tradeIn-categories-modal"],
    staleTime: 10 * 60 * 1000,
    queryFn: () => api.get<CategoryListResponse>("categories?tradeIn=1"),
    enabled: isOpen,
  });
  const categories = (categoryData?.data ?? []).filter((c) => c.is_active && c.is_trade_in);

  // Brand query
  const { data: brandData, isLoading: isBrandLoading } = useQuery<BrandListResponse>({
    queryKey: ["tradeIn-brands-modal"],
    staleTime: 10 * 60 * 1000,
    queryFn: () => api.get<BrandListResponse>("brands?tradeIn=1"),
    enabled: isOpen && step >= 2,
  });
  const brands = (brandData?.data ?? []).filter((b) => b.is_active && b.is_trade_in);

  // Device & Variant query
  const brandUUID = selection.brand?.uuid ?? "";
  const categoryUUID = selection.category?.uuid ?? "";

  const { data: deviceData, isLoading: isDeviceLoading } = useQuery<TradeInListResponse>({
    queryKey: ["tradein-devices-modal", brandUUID, categoryUUID],
    enabled: isOpen && step === 3 && !!brandUUID && !!categoryUUID,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      api.get<TradeInListResponse>(
        `tradein?brandUUID=${brandUUID}&categoryUUID=${categoryUUID}&page=1&limit=20`
      ),
  });
  const devices = deviceData?.data ?? [];

  // Variant detail query (conditions + pricing)
  const variantUUID = selection.variant?.tradeVariantUuid ?? "";
  const { data: variantDetailData, isLoading: isVariantLoading } = useQuery<TradeInVariantResponse>({
    queryKey: ["tradein-variant-modal", variantUUID],
    enabled: isOpen && step === 4 && !!variantUUID,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      api.get<TradeInVariantResponse>(`tradein-variant?tradeVariantUUID=${variantUUID}`),
  });
  const variantDetail = variantDetailData?.data?.[0] ?? null;
  const conditions = variantDetail?.tradeInConditions ?? [];
  const attributes = variantDetail?.tradeInAttributes ?? [];

  // Area list query
  const { data: areaList } = useQuery<AreaListResponse>({
    queryKey: ["areaList-modal"],
    staleTime: 30 * 60 * 1000,
    queryFn: () =>
      api.get<AreaListResponse>("area-list", {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      }),
    enabled: isOpen && step === 5,
  });
  const selectedDistrict = areaList?.data?.find((d) => d.distID === districtID);

  // Auto select default category if none chosen when moving to step 2
  useEffect(() => {
    if (step >= 2 && !selection.category && categories.length > 0) {
      setSelection((s) => ({ ...s, category: categories[0] }));
    }
  }, [step, categories, selection.category]);

  // Tradein Request Submission
  const { mutate: submitTradeInRequest, isPending: isSubmitting } = useMutation<
    TradeInRequestResponse,
    Error,
    TradeInRequestPayload
  >({
    mutationFn: (payload) =>
      api.post<TradeInRequestResponse>("tradein-request", payload, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      }),
    onSuccess: (res) => {
      if (res.statusCode === 200 && res.data) {
        setSubmitted(true);
      } else if (res.errors?.length) {
        setApiErrors(res.errors);
      } else {
        setApiErrors([res.message || "Something went wrong."]);
      }
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message) as TradeInRequestResponse;
        setApiErrors(
          parsed.errors?.length ? parsed.errors : [parsed.message || "Request failed."]
        );
      } catch {
        setApiErrors(["Something went wrong."]);
      }
    },
  });

  const handleClose = () => {
    setStep(1);
    setSelection({
      category: null,
      brand: null,
      device: null,
      variant: null,
      condition: null,
    });
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setDistrictID(0);
    setThanaID(0);
    setAgreeTerms(false);
    setApiErrors([]);
    setSubmitted(false);
    onClose();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else handleClose();
  };

  const handleSubmit = () => {
    setApiErrors([]);
    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      setApiErrors(["Please fill in your name, email, and phone number."]);
      return;
    }
    if (!districtID || !thanaID) {
      setApiErrors(["Please select your district and thana."]);
      return;
    }
    if (!address.trim()) {
      setApiErrors(["Please enter your address."]);
      return;
    }
    if (!agreeTerms) {
      setApiErrors(["Please agree to the privacy policy, terms & conditions."]);
      return;
    }
    if (!selection.device?.tradeInUuid || !selection.variant?.tradeVariantUuid) {
      setApiErrors(["Invalid device selection. Please go back and select a device."]);
      return;
    }

    submitTradeInRequest({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim(),
      mobileNo: phone.replace(/\D/g, ""),
      address: address.trim(),
      tradeInUuid: selection.device.tradeInUuid,
      tradeVariantUuid: selection.variant.tradeVariantUuid,
      districtId: districtID,
      policeStationId: thanaID,
      createdAt: new Date().toISOString(),
    });
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <GlobalModal isOpen={isOpen} onClose={handleClose} onBack={step > 1 ? handleBack : undefined} title="Exchange">
      <div className="flex flex-col min-h-[480px]">

        {/* Success screen */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exchange Request Submitted!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              Your device exchange request has been received. Our team will contact you shortly to coordinate handover.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-[#7B4F1E] hover:bg-[#6C4419] text-white font-bold rounded-xl text-xs transition"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* ── STEP 1: Intro ── */}
            {step === 1 && (
              <div className="flex flex-col items-center px-6 py-6 gap-4">
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
                      "Provide device details and get a price quote",
                      "Book a home pick-up or visit the nearest Dazzle store",
                      "Your device will be assessed for condition",
                      "Opt for a certified data wipe service",
                      "Trade-in and get instant cash on home pickup or Dazzle Voucher on Store drop-off",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <p className="text-xs text-gray-600 dark:text-white leading-relaxed">{text}</p>
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
                  {isCatLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 size={14} className="animate-spin" /> Loading categories...</div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((cat) => {
                        const isSelected = selection.category?.uuid === cat.uuid;
                        return (
                          <button
                            key={cat.uuid}
                            onClick={() => setSelection((s) => ({ ...s, category: cat, brand: null, device: null, variant: null }))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 border-orange-500 text-white"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400"
                            }`}
                          >
                            {cat.category_name}
                            {isSelected && (
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Brand select */}
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Brand</p>
                  {isBrandLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-6"><Loader2 size={16} className="animate-spin" /> Loading brands...</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {brands.map((brand) => {
                        const isSelected = selection.brand?.uuid === brand.uuid;
                        return (
                          <button
                            key={brand.uuid}
                            onClick={() => setSelection((s) => ({ ...s, brand, device: null, variant: null }))}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition cursor-pointer aspect-square ${
                              isSelected
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                                : "border-gray-100 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={brand.thumbnail_img || NoImg.src}
                              alt={brand.brand_name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
                            />
                            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center truncate w-full">{brand.brand_name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div className="mt-auto">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How It Works</h3>
                  <div className="space-y-1.5">
                    {["Provide device details and get a price quote", "Book a home pick-up or visit nearest Dazzle store"].map((text, i) => (
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
                    onClick={() => selection.brand && setStep(3)}
                    disabled={!selection.brand}
                    className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Select Model / Variant ── */}
            {step === 3 && (
              <div className="flex flex-col px-5 py-5 gap-4 flex-1">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Active Filters</p>
                  <div className="flex gap-2 flex-wrap">
                    {selection.category && (
                      <span className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-semibold">{selection.category.category_name}</span>
                    )}
                    {selection.brand && (
                      <span className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-semibold">{selection.brand.brand_name}</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Model &amp; Variant</p>

                  {isDeviceLoading ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-xs text-gray-400">
                      <Loader2 size={18} className="animate-spin" /> Loading models...
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      No models found for this brand and category.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {devices.map((device) => (
                        <div key={device.tradeInUuid} className="space-y-2">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{device.deviceName}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {device.tradeVariants.map((variant) => {
                              const isSelected = selection.variant?.tradeVariantUuid === variant.tradeVariantUuid;
                              return (
                                <button
                                  key={variant.tradeVariantUuid}
                                  onClick={() => {
                                    setSelection((s) => ({ ...s, device, variant }));
                                    setStep(4);
                                  }}
                                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition cursor-pointer ${
                                    isSelected
                                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                                      : "border-gray-100 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800"
                                  }`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={variant.thumbnailUrl || NoImg.src}
                                    alt={variant.variantName}
                                    className="w-10 h-10 object-contain shrink-0"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
                                  />
                                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{variant.variantName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto pt-2">
                  <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
                  <button onClick={() => selection.variant && setStep(4)} disabled={!selection.variant} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Device Valuation & Conditions ── */}
            {step === 4 && (
              <div className="flex flex-col px-5 py-5 gap-4 flex-1">
                {isVariantLoading ? (
                  <div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
                    <Loader2 size={20} className="animate-spin" /> Loading valuation details...
                  </div>
                ) : !variantDetail ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    Could not load valuation details for this variant.
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                        {selection.brand?.brand_name} {variantDetail.variantName}
                      </h3>
                      <p className="text-xs text-gray-400">Select device condition to calculate estimated value</p>
                    </div>

                    {/* Variant Image & Attributes */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={variantDetail.thumbnailUrl || NoImg.src}
                        alt={variantDetail.variantName}
                        className="w-12 h-12 object-contain shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
                      />
                      <div className="flex flex-wrap gap-1">
                        {attributes.flatMap((attr) =>
                          attr.items.map((item) => (
                            <span key={item.tradeInAttrId} className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                              {item.attributes}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Conditions list */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {conditions.map((cond) => {
                        const isSelected = selection.condition?.ticId === cond.ticId;
                        return (
                          <div
                            key={cond.ticId}
                            onClick={() => setSelection((s) => ({ ...s, condition: cond }))}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                              isSelected
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-gray-100 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-800 dark:text-white">{cond.title}</span>
                              <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">৳{cond.devicePrice.toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{cond.condition}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected estimated value banner */}
                    {selection.condition && (
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-900/40 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Estimated Trade-In Value</span>
                        <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">৳{selection.condition.devicePrice.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-2">
                      <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
                      <button onClick={() => setStep(5)} disabled={!selection.condition} className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition cursor-pointer">CONTINUE</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── STEP 5: Pickup Form & Final Submission ── */}
            {step === 5 && (
              <div className="flex flex-col px-5 py-5 gap-3 flex-1 overflow-y-auto">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                    Get FREE home pick-up for your used device. Enter your handover details below.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />

                <div className="flex gap-2">
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 bg-gray-50 dark:bg-gray-800 text-xs shrink-0 text-gray-500">
                    <span>🇧🇩</span>
                    <span>+880</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className={inputCls}
                  />
                </div>

                {/* District Dropdown */}
                <div className="relative">
                  <select
                    value={districtID}
                    onChange={(e) => {
                      setDistrictID(Number(e.target.value));
                      setThanaID(0);
                    }}
                    className={selectCls}
                  >
                    <option value={0}>Select District *</option>
                    {areaList?.data?.map((d) => (
                      <option key={d.distID} value={d.distID}>{d.districtName}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Thana Dropdown */}
                <div className="relative">
                  <select
                    value={thanaID}
                    disabled={!districtID}
                    onChange={(e) => setThanaID(Number(e.target.value))}
                    className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value={0}>Select Thana / Area *</option>
                    {selectedDistrict?.area.map((t) => (
                      <option key={t.areaID} value={t.areaID}>{t.areaName}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Full Address */}
                <input
                  type="text"
                  placeholder="Full Address (House, Road, Area) *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="termsModal"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <label htmlFor="termsModal" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                    I agree to privacy policy, terms &amp; conditions
                  </label>
                </div>

                {apiErrors.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {apiErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-red-500">
                        <XCircle size={14} className="shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-auto pt-2">
                  <button onClick={handleBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">BACK</button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#7B4F1E] hover:bg-[#6C4419] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting ? "SUBMITTING..." : "CONFIRM EXCHANGE"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </GlobalModal>
  );
}

interface BranchStock {
  uuid: string;
  branchName: string;
  latitude: string;
  longitude: string;
  status: string;
}

interface StockAvailabilityResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: BranchStock[];
}

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
  selectedVariant,
  currentPrice,
  externalEmiOpen,
  onExternalEmiClose,
  externalAvailabilityOpen,
  onExternalAvailabilityClose,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  // External "Check Availability" open support (StickyPurchaseBar's
  // "View store availability" button triggers this from outside).
  const availabilityModalOpen = externalAvailabilityOpen || isOpen;
  const closeAvailabilityModal = () => {
    setIsOpen(false);
    onExternalAvailabilityClose?.();
  };
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locError, setLocError] = useState<string | null>(null);

  // Extract UUIDs
  const productUUID =
    product?.productUuid ||
    product?.productUUID ||
    product?.uuid ||
    product?.id ||
    "";

  const variantUUID =
    selectedVariant?.variantUuid ||
    selectedVariant?.variantUUID ||
    selectedVariant?.uuid ||
    selectedVariant?.id ||
    product?.variants?.[0]?.variantUuid ||
    "";

  // Fetch real stock availability from API when modal is open
  const {
    data: stockData,
    isLoading: isStockLoading,
    isError: isStockError,
  } = useQuery<StockAvailabilityResponse>({
    queryKey: ["check-stock-availability", productUUID, variantUUID],
    queryFn: () =>
      api.get<StockAvailabilityResponse>("/check-stock-availability", {
        params: {
          productUUID,
          variantUUID,
        },
      }),
    enabled: availabilityModalOpen && !!productUUID,
  });

  const branchesList = stockData?.data || [];

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

  // Sync distances whenever userCoords or branchesList changes
  useEffect(() => {
    if (userCoords && branchesList.length > 0) {
      const computedDistances: Record<string, number> = {};
      branchesList.forEach((branch) => {
        const bLat = parseFloat(branch.latitude);
        const bLon = parseFloat(branch.longitude);
        if (!isNaN(bLat) && !isNaN(bLon)) {
          computedDistances[branch.uuid] = parseFloat(
            calculateDistance(userCoords.lat, userCoords.lon, bLat, bLon).toFixed(2),
          );
        }
      });
      setDistances(computedDistances);
    }
  }, [userCoords, branchesList]);

  const handleGeoLocation = () => {
    setIsLocating(true);
    setLocError(null);

    const computeAllDistances = (lat: number, lon: number) => {
      setUserCoords({ lat, lon });
      const computedDistances: Record<string, number> = {};
      branchesList.forEach((branch) => {
        const bLat = parseFloat(branch.latitude);
        const bLon = parseFloat(branch.longitude);
        if (!isNaN(bLat) && !isNaN(bLon)) {
          computedDistances[branch.uuid] = parseFloat(
            calculateDistance(lat, lon, bLat, bLon).toFixed(2),
          );
        }
      });
      setDistances(computedDistances);
      setIsLocating(false);
    };

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      computeAllDistances(23.7771, 90.4262);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        computeAllDistances(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocError(
          "Location access denied. Using center coordinates of Dhaka instead.",
        );
        computeAllDistances(23.7771, 90.4262);
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
        isOpen={availabilityModalOpen}
        onClose={closeAvailabilityModal}
        title="Branch-wise Stock Availability"
      >
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          <p className="text-xs text-gray-500 dark:text-white">
            Real-time branch inventory tracker. Trigger distance calculation to
            find your nearest Dazzle branch location.
          </p>

          <button
            type="button"
            onClick={handleGeoLocation}
            disabled={isLocating || isStockLoading}
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

          {isStockLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Checking stock availability...</p>
            </div>
          ) : isStockError ? (
            <div className="p-4 text-center text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl">
              Failed to load stock availability. Please try again.
            </div>
          ) : branchesList.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
              No branch availability data found for this item.
            </div>
          ) : (
            <div className="space-y-3 pt-2 h-[300px] overflow-scroll">
              {[...branchesList]
                .sort((a, b) => {
                  // Nearest store first, then sort by distance
                  const da = distances[a.uuid] ?? Infinity;
                  const db = distances[b.uuid] ?? Infinity;
                  const aN = nearestBranchId === a.uuid ? -1 : 0;
                  const bN = nearestBranchId === b.uuid ? -1 : 0;
                  if (aN !== bN) return aN - bN;
                  return da - db;
                })
                .map((branch) => {
                const distance = distances[branch.uuid];
                const isNearest = nearestBranchId === branch.uuid;
                const statusLower = (branch.status || "").toLowerCase();
                const isAvailable =
                  statusLower.includes("available") || statusLower.includes("in stock");

                return (
                  <div
                    key={branch.uuid}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      isNearest
                        ? "border-orange-500 bg-orange-500/5 dark:bg-orange-950/10"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1f1a16]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {branch.branchName}
                        </span>
                        {isNearest && (
                          <span className="text-[9px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                            <MapPin size={8} /> Nearest Store
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs capitalize ${
                          isAvailable
                            ? "text-emerald-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }`}
                      >
                        {branch.status}
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
          )}
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
