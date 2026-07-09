"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import type { TradeInSelection } from "./tradeIn.types";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  selection:  TradeInSelection;
  onSuccess?: (res: TradeInRequestResponse["data"]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepCollectionMethod({ selection, onSuccess }: Props) {
  const { token, apiKey } = useAppSelector((state) => state.auth);
  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  // ── Sub-step state ──
  const [subStep, setSubStep] = useState<1 | 2>(1);

  // ── Form state ──
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [address,     setAddress]     = useState("");
  const [districtID,  setDistrictID]  = useState<number>(0);
  const [thanaID,     setThanaID]     = useState<number>(0);
  const [agreeTerms,  setAgreeTerms]  = useState(false);

  const [apiErrors,   setApiErrors]   = useState<string[]>([]);

  // ── Fetch area list — same pattern as DeliveryAddress ──
  const { data: areaList } = useQuery<AreaListResponse>({
    queryKey: ["areaList"],
    staleTime: 30 * 60 * 1000,
    queryFn: () =>
      api.get<AreaListResponse>("area-list", {
        headers: {
          "X-API-Key":    apiKey || "",
          Authorization:  authHeader,
        },
      }),
  });

  const selectedDistrict = areaList?.data?.find((d) => d.distID === districtID);

  // ── POST /tradein-request ──
  const { mutate: submitRequest, isPending } = useMutation<
    TradeInRequestResponse, Error, TradeInRequestPayload
  >({
    mutationFn: (payload) =>
      api.post<TradeInRequestResponse>("tradein-request", payload, {
        headers: {
          "Content-Type":  "application/json",
          "X-API-Key":     apiKey || "",
          Authorization:   authHeader,
        },
      }),
    onSuccess: (res) => {
      if (res.statusCode === 200 && res.data) {
        onSuccess?.(res.data);
      } else if (res.errors?.length) {
        setApiErrors(res.errors);
      } else {
        setApiErrors([res.message || "Something went wrong."]);
      }
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message) as TradeInRequestResponse;
        setApiErrors(parsed.errors?.length ? parsed.errors : [parsed.message || "Request failed."]);
      } catch {
        setApiErrors(["Something went wrong."]);
      }
    },
  });

  // ── Sub-step 1 continue ──
  const handleContinue = () => {
    setApiErrors([]);
    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      setApiErrors(["Please fill all required fields."]);
      return;
    }
    setSubStep(2);
  };

  // ── Final submit ──
  const handleConfirm = () => {
    setApiErrors([]);

    if (!districtID || !thanaID) {
      setApiErrors(["Please select district and thana."]);
      return;
    }
    if (!address.trim()) {
      setApiErrors(["Address is required."]);
      return;
    }
    if (!agreeTerms) {
      setApiErrors(["Please agree to the terms & conditions."]);
      return;
    }
    if (!selection.device?.tradeInUuid || !selection.variant?.tradeVariantUuid) {
      setApiErrors(["Invalid device selection. Please go back and reselect."]);
      return;
    }

    submitRequest({
      firstName:        firstName.trim(),
      lastName:         lastName.trim() || undefined,
      email:            email.trim(),
      mobileNo:         phone.replace(/\D/g, ""),
      address:          address.trim(),
      tradeInUuid:      selection.device.tradeInUuid,
      tradeVariantUuid: selection.variant.tradeVariantUuid,
      districtId:       districtID,
      policeStationId:  thanaID,
      createdAt:        new Date().toISOString(),
    });
  };

  // ── Shared styles ──
  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1c1a] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
        Get FREE home pick up for your old / used device
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        Select your district
      </p>

      {/* District dropdown */}
      <div className="relative mb-6">
        <select
          value={districtID}
          onChange={(e) => { setDistrictID(Number(e.target.value)); setThanaID(0); }}
          className={selectCls}
        >
          <option value={0}>District *</option>
          {areaList?.data?.map((d) => (
            <option key={d.distID} value={d.distID}>{d.districtName}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* ── Sub-step 1: Personal details ── */}
      {subStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Free home pickup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your personal details &nbsp;
            <span className="text-gray-400 text-xs">1/2</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First name *" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Last name" value={lastName}
              onChange={(e) => setLastName(e.target.value)} className={inputCls} />
          </div>

          <input type="email" placeholder="Email *" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputCls} />

          <div className="flex gap-3">
            <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 bg-white dark:bg-[#1e1c1a] shrink-0">
              <span className="text-sm">🇧🇩</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">+880</span>
            </div>
            <input type="tel" placeholder="Phone number *" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className={inputCls} />
          </div>
        </div>
      )}

      {/* ── Sub-step 2: Address & Thana ── */}
      {subStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSubStep(1)}
              className="text-sm text-[#6D3F0E] dark:text-[#d4a97a] hover:underline flex items-center gap-1"
            >
              ‹ Edit details
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your address &amp; pickup info &nbsp;
              <span className="text-gray-400 text-xs">2/2</span>
            </p>
          </div>

          {/* Thana dropdown */}
          <div className="relative">
            <select
              value={thanaID}
              disabled={!districtID}
              onChange={(e) => setThanaID(Number(e.target.value))}
              className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value={0}>Thana *</option>
              {selectedDistrict?.area.map((t) => (
                <option key={t.areaID} value={t.areaID}>{t.areaName}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Full address */}
          <input type="text" placeholder="Full address * (House, Road, Area)" value={address}
            onChange={(e) => setAddress(e.target.value)} className={inputCls} />

          <div className="flex items-center gap-2.5 pt-1">
            <input type="checkbox" id="terms" checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded accent-[#6D3F0E]" />
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              I agree to the{" "}
              <span className="text-[#6D3F0E] dark:text-[#d4a97a]">privacy policy, terms &amp; conditions</span>
            </label>
          </div>
        </div>
      )}

      {/* API errors */}
      {apiErrors.length > 0 && (
        <div className="mt-4 space-y-1">
          {apiErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
              <XCircle size={14} className="shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={subStep === 1 ? handleContinue : handleConfirm}
        disabled={isPending}
        className="w-full mt-6 py-3.5 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 size={15} className="animate-spin" />}
        {subStep === 1 ? "Continue" : isPending ? "Submitting..." : "Confirm request"}
      </button>
    </div>
  );
}
