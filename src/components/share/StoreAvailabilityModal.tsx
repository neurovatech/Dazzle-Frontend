"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { MapPin, Navigation, Info } from "lucide-react";
import GlobalModal from "@/components/share/GlobalModal";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** One line item to check — a product page passes one, checkout passes the cart. */
export interface AvailabilityItem {
  productUuid: string;
  variantUuid: string;
  /** Shown per branch when more than one item is being checked. */
  name?: string;
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

interface StoreAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AvailabilityItem[];
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Haversine distance in km. */
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Centre of Dhaka — the fallback when the browser will not give us a fix. */
const DHAKA = { lat: 23.7771, lon: 90.4262 };

const isInStock = (status: string) => {
  const s = (status || "").toLowerCase();
  return s.includes("available") || s.includes("in stock");
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Branch-wise stock availability, shared by the product page and checkout.
 *
 * The product page checks a single item; checkout checks the whole cart, so the
 * modal takes a LIST. /check-stock-availability answers for one product+variant
 * pair at a time, so each item is its own query and the answers are merged by
 * branch — a branch is only "ready for pickup" when every item is in stock there.
 *
 * With one item the per-item breakdown is redundant and hidden; with several it
 * is the whole point, so each branch lists which products it has and which it
 * does not.
 */
export default function StoreAvailabilityModal({
  isOpen,
  onClose,
  items,
  title = "Branch-wise Stock Availability",
}: StoreAvailabilityModalProps) {
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const checkable = useMemo(
    () => items.filter((i) => i.productUuid && i.variantUuid),
    [items],
  );

  const results = useQueries({
    queries: checkable.map((item) => ({
      queryKey: ["check-stock-availability", item.productUuid, item.variantUuid],
      queryFn: () =>
        api.get<StockAvailabilityResponse>("/check-stock-availability", {
          params: {
            productUUID: item.productUuid,
            variantUUID: item.variantUuid,
          },
        }),
      enabled: isOpen,
      staleTime: 2 * 60 * 1000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.length > 0 && results.every((r) => r.isError);

  /**
   * One row per branch, carrying every item's status at that branch.
   *
   * Branches are keyed by uuid and seeded from whichever query answers first;
   * an item missing from a branch's response is reported as unavailable rather
   * than silently dropped, so a branch never looks better stocked than it is.
   */
  const branches = useMemo(() => {
    const byUuid = new Map<
      string,
      {
        uuid: string;
        branchName: string;
        latitude: string;
        longitude: string;
        items: { name: string; status: string; inStock: boolean }[];
      }
    >();

    results.forEach((res, idx) => {
      const item = checkable[idx];
      const label = item?.name || "This item";

      (res.data?.data ?? []).forEach((branch) => {
        const existing = byUuid.get(branch.uuid);
        const entry = {
          name: label,
          status: branch.status,
          inStock: isInStock(branch.status),
        };
        if (existing) existing.items.push(entry);
        else
          byUuid.set(branch.uuid, {
            uuid: branch.uuid,
            branchName: branch.branchName,
            latitude: branch.latitude,
            longitude: branch.longitude,
            items: [entry],
          });
      });
    });

    // An item that never appeared for a branch is not stocked there.
    const list = Array.from(byUuid.values());
    list.forEach((b) => {
      checkable.forEach((item) => {
        const label = item.name || "This item";
        if (!b.items.some((i) => i.name === label)) {
          b.items.push({ name: label, status: "Out of Stock", inStock: false });
        }
      });
    });

    return list;
  }, [results, checkable]);

  const nearestBranchId = useMemo(() => {
    const entries = Object.entries(distances);
    if (entries.length === 0) return null;
    return entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
  }, [distances]);

  /**
   * Nearest first — that is the branch the reader is going to walk to, so it
   * belongs at the top whether or not it has stock. Everything else follows by
   * distance, and branches with no distance yet keep their original order.
   */
  const sortedBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      if (nearestBranchId === a.uuid) return -1;
      if (nearestBranchId === b.uuid) return 1;
      return (distances[a.uuid] ?? Infinity) - (distances[b.uuid] ?? Infinity);
    });
  }, [branches, distances, nearestBranchId]);

  const handleGeoLocation = () => {
    setIsLocating(true);
    setLocError(null);

    const computeAll = (lat: number, lon: number) => {
      const next: Record<string, number> = {};
      branches.forEach((branch) => {
        const bLat = parseFloat(branch.latitude);
        const bLon = parseFloat(branch.longitude);
        if (!isNaN(bLat) && !isNaN(bLon)) {
          next[branch.uuid] = parseFloat(
            calculateDistance(lat, lon, bLat, bLon).toFixed(2),
          );
        }
      });
      setDistances(next);
      setIsLocating(false);
    };

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      computeAll(DHAKA.lat, DHAKA.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => computeAll(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLocError(
          "Location access denied. Using center coordinates of Dhaka instead.",
        );
        computeAll(DHAKA.lat, DHAKA.lon);
      },
    );
  };

  const showPerItem = checkable.length > 1;

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
        <p className="text-xs text-gray-500 dark:text-white">
          Real-time branch inventory tracker. Trigger distance calculation to
          find your nearest Dazzle branch location.
        </p>

        {showPerItem && (
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Checking {checkable.length} items in your order
          </p>
        )}

        <button
          type="button"
          onClick={handleGeoLocation}
          disabled={isLocating || isLoading}
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

        {checkable.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
            No items to check availability for.
          </div>
        ) : isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">
              Checking stock availability...
            </p>
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl">
            Failed to load stock availability. Please try again.
          </div>
        ) : sortedBranches.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
            No branch availability data found for this item.
          </div>
        ) : (
          <div className="space-y-3 pt-2 h-[300px] overflow-y-auto">
            {sortedBranches.map((branch) => {
              const distance = distances[branch.uuid];
              const isNearest = nearestBranchId === branch.uuid;
              const availableCount = branch.items.filter((i) => i.inStock).length;
              const allAvailable = availableCount === branch.items.length;

              return (
                <div
                  key={branch.uuid}
                  className={`p-3.5 rounded-xl border transition ${
                    isNearest
                      ? "border-orange-500 bg-orange-500/5 dark:bg-orange-950/10"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1f1a16]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {branch.branchName}
                        </span>
                        {isNearest && (
                          <span className="text-[9px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                            <MapPin size={8} /> Nearest Store
                          </span>
                        )}
                      </div>

                      {/* Single item keeps the original one-line status. */}
                      {!showPerItem && (
                        <p
                          className={`text-xs capitalize ${
                            allAvailable
                              ? "text-emerald-600 font-semibold"
                              : "text-red-500 font-semibold"
                          }`}
                        >
                          {branch.items[0]?.status}
                        </p>
                      )}

                      {showPerItem && (
                        <p
                          className={`text-xs font-semibold ${
                            allAvailable ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {availableCount} of {branch.items.length} items
                          available
                        </p>
                      )}
                    </div>

                    {distance !== undefined && (
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 py-1 px-2.5 rounded-lg shrink-0">
                        {distance} km away
                      </span>
                    )}
                  </div>

                  {/* Per-product breakdown, only useful when checking several. */}
                  {showPerItem && (
                    <ul className="mt-2.5 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2">
                      {branch.items.map((item, i) => (
                        <li
                          key={`${branch.uuid}-${i}`}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="text-gray-600 dark:text-gray-300 truncate">
                            {item.name}
                          </span>
                          <span
                            className={`shrink-0 font-semibold capitalize ${
                              item.inStock ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlobalModal>
  );
}
