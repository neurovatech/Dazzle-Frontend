/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info } from "lucide-react";
import { api } from "@/lib/api";

// Simulated branch coordinates (Dhaka, Bangladesh)
const BRANCHES = [
  { id: "banani", name: "Banani Flagship Store", stock: "12 units available", lat: 23.7937, lon: 90.4066 },
  { id: "dhanmondi", name: "Dhanmondi Express Store", stock: "Out of Stock", lat: 23.7561, lon: 90.3769 },
  { id: "mirpur", name: "Mirpur Dazzle Hub", stock: "9 units available", lat: 23.8069, lon: 90.3687 },
];

// Haversine formula to compute distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
          /30\s*Months?/i.test(cell.textContent || "")
        )
      );

      if (headerRowIndex === -1) continue;

      const headerCells = Array.from(rows[headerRowIndex].querySelectorAll("td, th"));

      const monthColumns: number[] = headerCells.map((cell) => {
        const match = (cell.textContent || "").match(/(\d+)\s*Months?/i);
        return match ? parseInt(match[1], 10) : NaN;
      });

      const banks: EmiBankRow[] = [];

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("td"));
        if (cells.length < 2) continue;

        const name = (cells[0].textContent || "").replace(/\u00A0/g, " ").trim();
        if (!name) continue;

        const months: Record<number, number | null> = {};
        monthColumns.forEach((month, idx) => {
          if (!month || Number.isNaN(month)) return;
          const raw = (cells[idx + 1]?.textContent || "").replace(/\u00A0/g, " ").trim();
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

export default function CheckAvailability({ product, currentPrice, externalEmiOpen, onExternalEmiClose }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locError, setLocError] = useState<string | null>(null);

  // ---- EMI modal state ----
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // Amount — currentPrice থেকে নাও, না থাকলে minBookingPrice
  const defaultAmount = String(
    (currentPrice && currentPrice > 0) ? currentPrice : (product?.discountedPrice ?? product?.minBookingPrice ?? 0)
  );
  const [amount, setAmount] = useState<string>(defaultAmount);

  // currentPrice বদলালে amount sync করো
  useEffect(() => {
    const newAmt = (currentPrice && currentPrice > 0)
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

  const { data: emiPageData, isLoading: isEmiLoading } = useQuery<PageResponse>({
    queryKey: ["page-emi-policy"],
    staleTime: 30 * 60 * 1000, // 30 min — policy pages don't change often
    queryFn: () => api.get<PageResponse>("/pages/emi_policy"),
    enabled: emiModalOpen, // only fetch once the user actually opens the modal
  });

  const emiBanks = useMemo(
    () => parseEmiTable(emiPageData?.data?.pageContent || ""),
    [emiPageData]
  );

  // Default to the first bank once the data has loaded
  useEffect(() => {
    if (!selectedBank && emiBanks.length > 0) {
      setSelectedBank(emiBanks[0].name);
    }
  }, [emiBanks, selectedBank]);

  const activeBank = useMemo(
    () => emiBanks.find((b) => b.name === selectedBank) || null,
    [emiBanks, selectedBank]
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
            calculateDistance(lat, lon, branch.lat, branch.lon).toFixed(2)
          );
        });
        setDistances(computedDistances);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocError("Location access denied. Using center coordinates of Dhaka instead.");

        const lat = 23.7771;
        const lon = 90.4262;
        setUserCoords({ lat, lon });

        const computedDistances: Record<string, number> = {};
        BRANCHES.forEach((branch) => {
          computedDistances[branch.id] = parseFloat(
            calculateDistance(lat, lon, branch.lat, branch.lon).toFixed(2)
          );
        });
        setDistances(computedDistances);
        setIsLocating(false);
      }
    );
  };

  const nearestBranchId = Object.keys(distances).reduce(
    (a, b) => (distances[a] < distances[b] ? a : b),
    ""
  );

  return (
    <div className="lg:flex gap-3 my-6">
      {/* Minimum Booking */}
      <button className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <CheckHome />
          </span>
          <div className="flex flex-col items-start">
            <span>Minimum Booking</span>
            <span> {product?.minBookingPrice} BDT</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Purchase Points */}
      <button className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span>Purchase Points</span>
            <span> {product?.purchasePoints} Points</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.64333 0C8.30632 0.000141594 8.9421 0.263627 9.41083 0.7325L15.8358 7.1575C16.3686 7.6904 16.6679 8.41311 16.6679 9.16667C16.6679 9.92023 16.3686 10.6429 15.8358 11.1758L11.1758 15.8358C10.6429 16.3686 9.92023 16.6679 9.16667 16.6679C8.41311 16.6679 7.6904 16.3686 7.1575 15.8358L0.7325 9.41083C0.263627 8.9421 0.000141594 8.30632 0 7.64333V3.33333C0 2.44928 0.35119 1.60143 0.976311 0.976311C1.60143 0.35119 2.44928 0 3.33333 0H7.64333ZM4.58333 2.91667C4.16285 2.91653 3.75786 3.07534 3.44954 3.36125C3.14123 3.64716 2.95237 4.03904 2.92083 4.45833L2.91667 4.58333C2.91667 4.91297 3.01442 5.2352 3.19755 5.50928C3.38069 5.78337 3.64098 5.99699 3.94553 6.12313C4.25007 6.24928 4.58518 6.28228 4.90848 6.21798C5.23179 6.15367 5.52876 5.99493 5.76184 5.76184C5.99493 5.52876 6.15367 5.23179 6.21798 4.90848C6.28228 4.58518 6.24928 4.25007 6.12313 3.94553C5.99699 3.64098 5.78337 3.38069 5.50928 3.19755C5.2352 3.01442 4.91297 2.91667 4.58333 2.91667Z"
                fill="#6533F4"
              />
            </svg>
          </span>
          <span>EMI</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Geolocation stock check modal */}
      <GlobalModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Branch-wise Stock Availability">
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          <p className="text-xs text-gray-500">
            Real-time branch inventory tracker. Trigger distance calculation to find your nearest Dazzle branch location.
          </p>

          <button
            type="button"
            onClick={handleGeoLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#7B4F1E] text-white hover:bg-[#6C4419] rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Navigation size={16} className={isLocating ? "animate-spin" : ""} />
            {isLocating ? "Locating Your Device..." : "Find Nearest Branch Store"}
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
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{branch.name}</span>
                      {isNearest && (
                        <span className="text-[9px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <MapPin size={8} /> Nearest Store
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isAvailable ? "text-emerald-600 font-semibold" : "text-red-500"}`}>
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
        <div className="flex flex-col lg:flex-row h-[70vh] max-h-[600px]">
          {/* Left: bank list */}
          <div className="w-full lg:w-64 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                Bank Name
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isEmiLoading && (
                <p className="text-xs text-gray-400 px-2 py-4">Loading banks…</p>
              )}
              {!isEmiLoading && emiBanks.length === 0 && (
                <p className="text-xs text-gray-400 px-2 py-4">No EMI data available.</p>
              )}
              {emiBanks.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => setSelectedBank(bank.name)}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition cursor-pointer ${
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 shrink-0">
                Amount
              </label>
              <input
  type="text"
  value={amount}
  readOnly
  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white dark:bg-gray-900"
/>
            </div>

            <div className="grid grid-cols-3 gap-2 px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Plan (Monthly)</span>
              <span className="text-center">EMI</span>
              <span className="text-right">Effective Cost</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {!activeBank && !isEmiLoading && (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Select a bank to see available EMI plans.
                </p>
              )}
              {activeBank &&
                MONTH_ORDER.filter(
                  (m) => activeBank.months[m] !== undefined && activeBank.months[m] !== null
                ).map((month) => {
                  const pct = activeBank.months[month] as number;
                  const { effectiveCost, monthlyEmi } = calculateEmi(numericAmount, pct, month);
                  return (
                    <div
                      key={month}
                      className="grid grid-cols-3 items-center gap-2 bg-gray-50 dark:bg-[#3e3329] border border-[#2222] dark:border-[#222] rounded-xl px-4 py-3"
                    >
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {month}
                      </span>
                      <div className="text-center">
                        <p className="text-sm font-bold text-orange-500">
                          BDT {Math.round(monthlyEmi).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-400">(EMI Charge {pct}%)</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-right">
                        {Math.round(effectiveCost).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </GlobalModal>
    </div>
  );
}