"use client";
import React, { useState } from "react";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info } from "lucide-react";

// Simulated branch coordinates (Dhaka, Bangladesh)
const BRANCHES = [
  { id: "banani", name: "Banani Flagship Store", stock: "12 units available", lat: 23.7937, lon: 90.4066 },
  { id: "dhanmondi", name: "Dhanmondi Express Store", stock: "Out of Stock", lat: 23.7561, lon: 90.3769 },
  { id: "mirpur", name: "Mirpur Dazzle Hub", stock: "9 units available", lat: 23.8069, lon: 90.3687 },
];

// Haversine formula to compute distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function CheckAvailability() {
  const [isOpen, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locError, setLocError] = useState<string | null>(null);

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

        // Calculate distance to each branch
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
        
        // Fallback simulated user coordinates (Gushan, Dhaka)
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

  // Find the nearest branch ID
  const nearestBranchId = Object.keys(distances).reduce((a, b) =>
    distances[a] < distances[b] ? a : b,
    ""
  );

  return (
    <div className="lg:flex gap-3 my-6">
      {/* Check Availability Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <CheckHome />
          </span>
          <span>Check Availability (Branch stock)</span>
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

      {/* Exchange Button */}
      <button className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
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
          <span>Exchange</span>
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
      <button className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
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
      <GlobalModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Branch-wise Stock Availability">
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          <p className="text-xs text-gray-500">
            Real-time branch inventory tracker. Trigger distance calculation to find your nearest Dazzle branch location.
          </p>

          {/* Calculate distance button */}
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

          {/* Branch list */}
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
    </div>
  );
}
