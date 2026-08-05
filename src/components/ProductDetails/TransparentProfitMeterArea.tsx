/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info } from "lucide-react";
import { api } from "@/lib/api";


export default function TransparentProfitMeterArea({
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

  // External EMI open support (StickyPurchaseBar থেকে trigger)
  const emiModalOpen = externalEmiOpen || isEmiOpen;
  const closeEmiModal = () => {
    setIsEmiOpen(false);
    onExternalEmiClose?.();
  };




  return (
    <div className="lg:flex gap-3 my-6">
      {/* Minimum Booking */}
      {/* <button className="flex-1 w-full mb-4 lg:mb-0 flex items-center justify-between gap-2 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-lg p-1.5">
            <CheckHome />
          </span>
          <div className="flex flex-col items-start">
            <span>Check Availability </span>
          </div>
        </div>

      </button> */}



      {/* Geolocation stock check modal */}
      <GlobalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Branch-wise Stock Availability"
      >
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          
        </div>
      </GlobalModal>

    </div>
  );
}
