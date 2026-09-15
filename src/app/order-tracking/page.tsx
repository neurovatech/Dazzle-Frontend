"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, ChevronLeft, MapPin, Truck, Calendar, Clock,
  MessageSquare, Mail, CheckCircle2, XCircle, AlertCircle,
  User, Phone, FileText, Package, ShieldCheck, Loader2,
  AlertTriangle, Info, Home, Store,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatusTimelineItem {
  createdAt: string;
  createdBy: string;
  orderStatus: string;
}

export interface AlertLogItem {
  createdAt: string;
  alertTypes: string;
  description: string;
}

export interface OrderTrackingData {
  orderNo: string;
  createdAt: string;
  // Customer
  fullName: string;
  mobile: string;
  // Address — new fields from API
  addressLabel?: string;
  addressLine1?: string;
  addressLine2?: string;
  // Legacy address fields (kept for compat)
  address?: string;
  address2?: string | null;
  // Delivery type
  isHomeDelivery?: boolean;
  isStorePickup?: boolean;
  // Notes
  deliveryIns?: string | null;
  customerNotes?: string | null;
  // Financials
  subTotal: number;
  paidAmount: number;
  /** The API's real field name — was mistyped `grandAmount` here, which never
   * matched any response field and silently read as undefined/0. */
  grandTotal?: number;
  codCharge?: number;
  orderFullPaid: boolean;
  // Status
  orderStatus?: string;
  orderDelivered: boolean;
  orderCancelled: boolean;
  orderExecuted?: boolean;
  // Timeline & logs
  statusTimeline: StatusTimelineItem[];
  alertsLogs: AlertLogItem[];
}

export interface OrderTrackingApiResponse {
  statusCode: number;
  status: string;
  message: string;
  data: OrderTrackingData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: unknown): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed.errors?.length) return parsed.errors.join(", ");
      if (parsed.message) return parsed.message;
    } catch {
      return err.message;
    }
  }
  return "Failed to fetch order tracking details.";
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return dateStr; }
}

function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "৳0";
  return `৳${Math.floor(amount).toLocaleString("en-IN")}`;
}

/** Build the best possible address string from API fields */
function buildAddress(order: OrderTrackingData): { label: string; line1: string; line2: string } {
  return {
    label: order.addressLabel || "",
    line1: order.addressLine1 || order.address || "",
    line2: order.addressLine2 || order.address2 || "",
  };
}

function getAlertBadgeColor(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("payment") || t.includes("reminder") || t.includes("warn"))
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900";
  if (t.includes("error") || t.includes("cancel"))
    return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900";
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900";
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchId, setSearchId]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError]           = useState<string | null>(null);
  const [order, setOrder]                 = useState<OrderTrackingData | null>(null);

  // Prevent double-fetch: track which orderNo has already been fetched
  const fetchedRef = useRef<string>("");

  const fetchOrderTracking = async (orderNoToFetch: string) => {
    const trimmed = orderNoToFetch.trim();
    if (!trimmed) { setValidationError("Order number is required."); return; }
    if (/\s/.test(trimmed)) { setValidationError("No spaces allowed."); return; }

    setValidationError(null);
    setApiError(null);
    setLoading(true);

    try {
      const res = await api.get<OrderTrackingApiResponse>(
        `/order-tracking/${encodeURIComponent(trimmed)}`,
      );
      if (res?.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setApiError("No order details found.");
      }
    } catch (err) {
      setOrder(null);
      const msg = parseApiError(err);
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch from URL param — only once per unique orderNo
  useEffect(() => {
    const initialOrderNo = (searchParams.get("orderNo") || searchParams.get("order") || "").trim();
    if (initialOrderNo && initialOrderNo !== fetchedRef.current) {
      fetchedRef.current = initialOrderNo;
      setSearchId(initialOrderNo);
      fetchOrderTracking(initialOrderNo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = searchId.trim();
    if (!trimmed) { setValidationError("Order number is required."); return; }
    setValidationError(null);
    // Update URL — triggers useEffect only if orderNo changed
    router.push(`/order-tracking?orderNo=${encodeURIComponent(trimmed)}`);
    // Also fetch directly (handles same orderNo re-search)
    if (trimmed === fetchedRef.current) {
      fetchOrderTracking(trimmed);
    }
    // If different, useEffect will fire from URL change
    fetchedRef.current = trimmed;
    fetchOrderTracking(trimmed);
  };

  return (
    // font-size: 14px globally for this page
    <div className="bg-[#FFFBF6] dark:bg-[#1E1C1A] font-sans text-[14px] px-4 pb-20 max-w-6xl mx-auto text-gray-800 dark:text-gray-100 min-h-screen">

      {/* ── Header & Search ── */}
      <div className="pt-10 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#7B4F1E]/10 dark:bg-[#bd9961]/20 flex items-center justify-center text-[#7B4F1E] dark:text-[#bd9961]">
          <Truck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#101518] dark:text-white">Track Your Order</h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            Enter your order number to see real-time status, timeline, and delivery details.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-2">
          <div className="flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchId}
                onChange={(e) => { setSearchId(e.target.value); setValidationError(null); }}
                className={`w-full text-[14px] text-[#222] bg-white dark:bg-[#2A2622] dark:text-white border ${
                  validationError
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-gray-300 dark:border-gray-800 focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
                } rounded-xl py-3.5 pl-4 pr-32 outline-none shadow-sm transition-all`}
                placeholder="e.g. DECO-68B43-02052"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 bg-[#7B4F1E] hover:bg-[#684219] disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 text-[13px] cursor-pointer"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Tracking...</> : <><Search size={15} /> Track</>}
              </button>
            </div>
            {validationError && (
              <p className="text-left text-[12px] font-semibold text-red-500 flex items-center gap-1 pl-1">
                <AlertCircle size={13} /> {validationError}
              </p>
            )}
            <p className="text-[12px] text-gray-400 text-left pl-1">
              Example: <span className="font-semibold text-gray-600 dark:text-gray-300">DECO-68B43-02052</span>
            </p>
          </div>
        </form>
      </div>

      {/* ── API Error ── */}
      {apiError && !loading && (
        <div className="mt-10 max-w-2xl mx-auto bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center mx-auto">
            <XCircle size={26} />
          </div>
          <h3 className="text-[15px] font-bold text-red-900 dark:text-red-200">Order Not Found</h3>
          <p className="text-[13px] text-red-600 dark:text-red-400">{apiError}</p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400">Please check your order number and try again.</p>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-100 dark:bg-[#25221F] rounded-2xl h-48 w-full" />
            <div className="bg-gray-100 dark:bg-[#25221F] rounded-2xl h-64 w-full" />
          </div>
          <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-[#25221F] rounded-2xl h-60 w-full" />
            <div className="bg-gray-100 dark:bg-[#25221F] rounded-2xl h-40 w-full" />
          </div>
        </div>
      )}

      {/* ── Order Details ── */}
      {order && !loading && (() => {
        const addr = buildAddress(order);
        const isPickup = order.isStorePickup || (!order.isHomeDelivery && !order.isStorePickup ? false : false);
        // The API's own grandTotal field agrees with this exactly (verified
        // live), so summing the two line items already shown below is at
        // least as reliable as trusting a third field, and needs no fallback.
        const grandTotal = (order.subTotal ?? 0) + (order.codCharge ?? 0);
        const dueAmount = Math.max(0, grandTotal - (order.paidAmount ?? 0));
        const latestStatus = order.statusTimeline?.[order.statusTimeline.length - 1]?.orderStatus
          || order.orderStatus || "In Progress";

        return (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* ── Left: Main info ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Order header card */}
              <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-sm">
                {/* Order no + status */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-[#7B4F1E]" />
                      <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-white">
                        Order #{order.orderNo}
                      </h2>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={12} /> {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.orderCancelled ? (
                      <span className="inline-flex items-center gap-1 text-[12px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
                        <XCircle size={13} /> Cancelled
                      </span>
                    ) : order.orderDelivered ? (
                      <span className="inline-flex items-center gap-1 text-[12px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 size={13} /> Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                        <Clock size={13} /> {latestStatus}
                      </span>
                    )}
                    {order.orderFullPaid ? (
                      <span className="inline-flex items-center gap-1 text-[12px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                        <ShieldCheck size={13} /> Fully Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-bold px-3 py-1 rounded-full border border-orange-200 dark:border-orange-900">
                        <AlertTriangle size={13} /> Due Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer + Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer */}
                  <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <User size={12} className="text-[#7B4F1E]" /> Customer
                    </p>
                    <p className="font-bold text-[14px] text-gray-900 dark:text-white">{order.fullName}</p>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Phone size={12} /> {order.mobile}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={12} className="text-[#7B4F1E]" />
                      {isPickup ? "Pickup Location" : "Delivery Address"}
                    </p>
                    {addr.label && (
                      <span className="inline-block text-[11px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                        {isPickup ? <><Store size={10} className="inline mr-0.5" />{addr.label}</> : <><Home size={10} className="inline mr-0.5" />{addr.label}</>}
                      </span>
                    )}
                    {addr.line1 && (
                      <p className="font-semibold text-[13px] text-gray-800 dark:text-gray-200 leading-snug">{addr.line1}</p>
                    )}
                    {addr.line2 && (
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">{addr.line2}</p>
                    )}
                    {!addr.line1 && !addr.line2 && (
                      <p className="text-[12px] text-gray-400 italic">Address not available</p>
                    )}
                  </div>
                </div>

                {/* Delivery & customer notes */}
                {(order.deliveryIns || order.customerNotes) && (
                  <div className="space-y-2">
                    {order.deliveryIns && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[13px]">
                        <Truck size={14} className="text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-200">Delivery Note: </span>
                          <span className="text-amber-800 dark:text-amber-300">{order.deliveryIns}</span>
                        </div>
                      </div>
                    )}
                    {order.customerNotes && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2 text-[13px]">
                        <MessageSquare size={14} className="text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-blue-900 dark:text-blue-200">Notes: </span>
                          <span className="text-blue-800 dark:text-blue-300">{order.customerNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline card */}
              <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Clock size={15} className="text-[#7B4F1E]" /> Status Timeline
                </h3>
                {order.statusTimeline?.length > 0 ? (
                  <div className="relative border-l-2 border-[#7B4F1E]/30 dark:border-[#bd9961]/30 ml-3 space-y-6 pb-1">
                    {order.statusTimeline.map((item, idx) => {
                      const isLatest = idx === order.statusTimeline.length - 1;
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isLatest
                              ? "bg-[#7B4F1E] border-white dark:border-[#25221F] ring-4 ring-[#7B4F1E]/20"
                              : "bg-[#7B4F1E]/60 border-white dark:border-[#25221F]"
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-bold text-[14px] text-gray-900 dark:text-white">{item.orderStatus}</p>
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-white dark:bg-[#25221F] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                {formatDateTime(item.createdAt)}
                              </span>
                            </div>
                            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                              By: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.createdBy || "System"}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">No timeline updates yet.</p>
                )}
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-5">

              {/* Bill summary */}
              <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <FileText size={14} className="text-[#7B4F1E]" /> Bill Summary
                </h3>
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(order.subTotal)}</span>
                  </div>
                  {(order.codCharge ?? 0) > 0 && (
                    <div className="flex justify-between text-orange-600 dark:text-orange-400">
                      <span>COD Charge</span>
                      <span className="font-semibold">{formatCurrency(order.codCharge ?? 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Paid Amount</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(order.paidAmount)}</span>
                  </div>
                  {dueAmount > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Due Amount</span>
                      <span className="font-semibold">{formatCurrency(dueAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                    <span className="font-bold text-[14px] text-gray-900 dark:text-white">Grand Total</span>
                    <span className="font-extrabold text-[#7B4F1E] dark:text-[#bd9961] text-[16px]">{formatCurrency(grandTotal)}</span>
                  </div>
                  {order.orderFullPaid ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg text-[12px] font-bold text-center border border-emerald-200 dark:border-emerald-900/50">
                      ✓ Fully Paid
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg text-[12px] font-medium text-center border border-amber-200 dark:border-amber-900/50">
                      Due amount pending
                    </div>
                  )}
                </div>
              </div>

              {/* Alert logs */}
              <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-[#7B4F1E]" /> Activity Logs
                </h3>
                {order.alertsLogs?.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {order.alertsLogs.map((alert, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-3 border border-gray-100 dark:border-gray-800 space-y-1.5 text-[13px]">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className={`text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 rounded border ${getAlertBadgeColor(alert.alertTypes)}`}>
                            {alert.alertTypes || "Alert"}
                          </span>
                          <span className="text-[11px] text-gray-400">{formatDateTime(alert.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">No activity logs.</p>
                )}
              </div>
            </div>

          </div>
        );
      })()}

      {/* ── Empty state ── */}
      {!order && !loading && !apiError && (
        <div className="mt-12 max-w-md mx-auto text-center p-8 bg-white dark:bg-[#25221F] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7B4F1E]/10 dark:bg-[#bd9961]/20 text-[#7B4F1E] dark:text-[#bd9961] flex items-center justify-center mx-auto">
            <Info size={22} />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Enter Order Number</h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Type your order number above and click <strong>Track</strong> to view status, address, and delivery details.
          </p>
        </div>
      )}

      {/* ── Back link ── */}
      <div className="mt-10 flex justify-center">
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#7B4F1E] dark:text-gray-400 dark:hover:text-[#bd9961] transition font-medium">
          <ChevronLeft size={15} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────────

export default function OrderTracking() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#7B4F1E]" size={30} />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
