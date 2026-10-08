"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  branchAddress?: string;
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

/** One branch with each checked item's status there. */
interface BranchRow {
  uuid: string;
  branchName: string;
  branchAddress?: string;
  latitude: string;
  longitude: string;
  items: { name: string; status: string; inStock: boolean }[];
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

/** "Instant" = the branch has it in hand right now (any other status is a wait). */
const isInstant = (status: string) => (status || "").trim().toLowerCase().startsWith("instant");

/**
 * /check-stock-availability's `status` is free text from the backend —
 * "Instant", "Usually ready in 3 Days", "Usually ready in 2 hour", etc. —
 * not a plain "available"/"in stock" enum, so a positive keyword match
 * against those two phrases misses nearly every real value and undercounts
 * stock everywhere. Only the genuinely negative case ("Out of Stock" and
 * its variants) means the branch can't fulfil the order; anything else,
 * however long the wait, is stock the branch actually has.
 */
const isInStock = (status: string) => {
  const s = (status || "").toLowerCase();
  return !(
    s.includes("out of stock") ||
    s.includes("not available") ||
    s.includes("unavailable")
  );
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
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  // The device location is asked for automatically the FIRST time the modal
  // opens; after that only the button asks again (a browser that already
  // answered "block" will not prompt a second time anyway).
  const askedForLocation = useRef(false);

  const checkable = useMemo(
    () => items.filter((i) => i.productUuid && i.variantUuid),
    [items],
  );

  /**
   * CALL 1 — every branch with its own status. Starts the moment the modal
   * opens, in parallel with the location request, so neither waits for the
   * other. Cached for 2 minutes: reopening the modal does not hit the API again.
   */
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
   * One row per branch, carrying every item's status at that branch, built from
   * call 1 only. An item missing from a branch's response is reported as
   * unavailable rather than silently dropped, so a branch never looks better
   * stocked than it is.
   */
  const baseBranches = useMemo(() => {
    const byUuid = new Map<string, BranchRow>();

    results.forEach((res, idx) => {
      const label = checkable[idx]?.name || "This item";

      (res.data?.data ?? []).forEach((branch) => {
        const entry = {
          name: label,
          status: branch.status,
          inStock: isInStock(branch.status),
        };
        const existing = byUuid.get(branch.uuid);
        if (existing) {
          existing.items.push(entry);
          if (branch.branchAddress && !existing.branchAddress) {
            existing.branchAddress = branch.branchAddress;
          }
        } else {
          byUuid.set(branch.uuid, {
            uuid: branch.uuid,
            branchName: branch.branchName,
            branchAddress: branch.branchAddress,
            latitude: branch.latitude,
            longitude: branch.longitude,
            items: [entry],
          });
        }
      });
    });

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

  /** Distance (km) from the visitor to every branch — empty until a location is known. */
  const distances = useMemo(() => {
    const next: Record<string, number> = {};
    if (!coords) return next;
    baseBranches.forEach((branch) => {
      const bLat = parseFloat(branch.latitude);
      const bLon = parseFloat(branch.longitude);
      if (!isNaN(bLat) && !isNaN(bLon)) {
        next[branch.uuid] = parseFloat(
          calculateDistance(coords.lat, coords.lon, bLat, bLon).toFixed(2),
        );
      }
    });
    return next;
  }, [coords, baseBranches]);

  /** The physically closest branch (any status) — gets the "Nearest Store" badge. */
  const nearestBranchId = useMemo(() => {
    const entries = Object.entries(distances);
    if (entries.length === 0) return null;
    return entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
  }, [distances]);

  /**
   * The closest branch that really has the item in hand ("Instant" for EVERY
   * item being checked). This is the branch call 2 is made for: the backend
   * answers "how fast can each other branch get it" relative to the branch it is
   * given, so it only makes sense to give it a branch that holds stock. Null
   * (-> no call 2) when the location is unknown or no branch is Instant.
   */
  const instantBranchId = useMemo(() => {
    if (!coords || checkable.length === 0) return null;
    let best: string | null = null;
    let bestDistance = Infinity;
    for (const branch of baseBranches) {
      const d = distances[branch.uuid];
      if (d === undefined || d >= bestDistance) continue;
      if (branch.items.length > 0 && branch.items.every((i) => isInstant(i.status))) {
        best = branch.uuid;
        bestDistance = d;
      }
    }
    return best;
  }, [coords, checkable, baseBranches, distances]);

  /**
   * CALL 2 — the same endpoint with branchUUID = the nearest Instant branch.
   * Made ONCE for that branch (cached 2 minutes, never re-fired by a button
   * click); it only runs again if the visitor's location changes enough to make
   * a different branch the nearest Instant one.
   */
  const branchStockResults = useQueries({
    queries: checkable.map((item) => ({
      queryKey: [
        "check-stock-availability-nearest",
        item.productUuid,
        item.variantUuid,
        instantBranchId,
      ],
      queryFn: () =>
        api.get<StockAvailabilityResponse>("/check-stock-availability", {
          params: {
            productUUID: item.productUuid,
            variantUUID: item.variantUuid,
            branchUUID: instantBranchId!,
          },
        }),
      enabled: isOpen && !!instantBranchId,
      staleTime: 2 * 60 * 1000,
    })),
  });

  const isBranchStockLoading = branchStockResults.some((r) => r.isFetching);

  /** Call 1's rows, with call 2's branch-relative statuses laid over them. */
  const branches = useMemo(() => {
    const byUuid = new Map<string, BranchRow>(
      baseBranches.map((b) => [
        b.uuid,
        { ...b, items: b.items.map((i) => ({ ...i })) },
      ]),
    );

    branchStockResults.forEach((res, idx) => {
      const label = checkable[idx]?.name || "This item";

      (res.data?.data ?? []).forEach((branch) => {
        const entry = {
          name: label,
          status: branch.status,
          inStock: isInStock(branch.status),
        };
        const existing = byUuid.get(branch.uuid);
        if (existing) {
          if (branch.branchAddress) existing.branchAddress = branch.branchAddress;
          const itemEntry = existing.items.find((i) => i.name === label);
          if (itemEntry) {
            itemEntry.status = entry.status;
            itemEntry.inStock = entry.inStock;
          } else {
            existing.items.push(entry);
          }
        } else {
          byUuid.set(branch.uuid, {
            uuid: branch.uuid,
            branchName: branch.branchName,
            branchAddress: branch.branchAddress,
            latitude: branch.latitude,
            longitude: branch.longitude,
            items: [entry],
          });
        }
      });
    });

    return Array.from(byUuid.values());
  }, [baseBranches, branchStockResults, checkable]);

  /**
   * Nearest first — that is the branch the reader is going to walk to, so it
   * belongs at the top whether or not it has stock. With no location every
   * branch keeps the backend's own order.
   */
  const sortedBranches = useMemo(() => {
    if (!coords) return branches;
    return [...branches].sort(
      (a, b) => (distances[a.uuid] ?? Infinity) - (distances[b.uuid] ?? Infinity),
    );
  }, [branches, coords, distances]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError(
        "Your browser does not support location access, so branches are shown without distance.",
      );
      return;
    }

    setIsLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        // No invented position: when the visitor says no (or the device cannot
        // answer) the branches are simply shown as the backend sent them.
        setIsLocating(false);
        setLocError(
          err.code === 1
            ? "Location access is blocked, so branches are shown without distance. Allow location in your browser to see the nearest store first."
            : "Could not get your location, so branches are shown without distance.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    if (!isOpen || askedForLocation.current) return;
    // Deferred one tick (instead of calling requestLocation() straight from the
    // effect body, which sets state synchronously). The flag is raised inside
    // the timer so a cancelled-and-rescheduled run (StrictMode, fast re-render)
    // still asks exactly once.
    const timer = setTimeout(() => {
      askedForLocation.current = true;
      requestLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, requestLocation]);

  const showPerItem = checkable.length > 1;

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
        <p className="text-xs text-gray-500 dark:text-white">
          Real-time branch inventory tracker. Allow location access and the
          branches closest to you are listed first.
        </p>

        {showPerItem && (
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Checking {checkable.length} items in your order
          </p>
        )}

        <button
          type="button"
          onClick={requestLocation}
          disabled={isLocating || isLoading || isBranchStockLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#7B4F1E] text-white hover:bg-[#6C4419] rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
        >
          {/* Static on purpose: the ONE loader lives below (see the loading
              rows) — a spinning icon here made the modal show two at once. */}
          <Navigation size={16} />
          Find Nearest Branch Store
        </button>

        {locError && (
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg text-xs border border-amber-100 dark:border-amber-900/40">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>{locError}</span>
          </div>
        )}

        {/* Second-stage loader: only once the first request has finished (the
            full-size loader below owns the very first wait), so at any moment
            exactly ONE loader is on screen. The list stays visible under it. */}
        {!isLoading && (isLocating || isBranchStockLoading) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            {isLocating
              ? "Finding your nearest branch..."
              : "Checking nearest branch stock..."}
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

                      {branch.branchAddress && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                          {branch.branchAddress}
                        </p>
                      )}

                      {/* Single item keeps the original one-line status. */}
                      {!showPerItem && (
                        <p
                          className={`text-xs capitalize font-semibold flex items-center gap-1.5 ${
                            `${branch.items[0]?.status}` ===  "Stock Out"
                              ? " text-red-500 dark:text-red-400"
                              : " text-emerald-600 dark:text-emerald-400 "
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
                      <span className="text-[11px] font-bold text-[#8a5a1e] dark:text-[#f0cd97] bg-[#E9CCAE] dark:bg-[#5a3d1f] py-1 px-2.5 rounded-lg">
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
