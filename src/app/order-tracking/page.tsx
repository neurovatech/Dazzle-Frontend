"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  MapPin,
  Truck,
  Calendar,
  Clock,
  MessageSquare,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  FileText,
  Package,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

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
  fullName: string;
  mobile: string;
  address: string;
  address2?: string | null;
  deliveryIns?: string | null;
  customerNotes?: string | null;
  subTotal: number;
  paidAmount: number;
  grandAmount: number;
  orderFullPaid: boolean;
  orderDelivered: boolean;
  orderCancelled: boolean;
  statusTimeline: StatusTimelineItem[];
  alertsLogs: AlertLogItem[];
}

export interface OrderTrackingApiResponse {
  statusCode: number;
  status: string;
  message: string;
  data: OrderTrackingData;
}

function parseApiError(err: unknown): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
        return parsed.errors.join(", ");
      }
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      return err.message;
    }
  }
  return "Failed to fetch order tracking details.";
}

function validateOrderNoInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return "Order number is required.";
  }
  if (/\s/.test(input)) {
    return "Order number must not contain spaces.";
  }
  if (input.length < 5 || input.length > 50) {
    // return "Order number must be between 5 and 20 characters.";
    // return "Order number must be between 5 and 20 characters.";
  }
  return null;
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "৳0.00";
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderTrackingData | null>(null);

  const fetchOrderTracking = async (orderNoToFetch: string) => {
    const errorMsg = validateOrderNoInput(orderNoToFetch);
    if (errorMsg) {
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setValidationError(null);
    setApiError(null);
    setLoading(true);

    try {
      const res = await api.get<OrderTrackingApiResponse>(
        `/order-tracking/${encodeURIComponent(orderNoToFetch.trim())}`
      );

      if (res && res.data) {
        setOrder(res.data);
        toast.success(res.message || "Order tracking retrieved successfully.");
      } else {
        setOrder(null);
        setApiError("No order details found.");
      }
    } catch (err) {
      setOrder(null);
      const parsedError = parseApiError(err);
      setApiError(parsedError);
      toast.error(parsedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialOrderNo = searchParams.get("orderNo") || searchParams.get("order");
    if (initialOrderNo) {
      setSearchId(initialOrderNo);
      fetchOrderTracking(initialOrderNo);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) {
      setValidationError("Order number is required.");
      return;
    }

    const validation = validateOrderNoInput(searchId);
    if (validation) {
      setValidationError(validation);
      toast.error(validation);
      return;
    }

    setValidationError(null);
    router.push(`/order-tracking?orderNo=${encodeURIComponent(searchId.trim())}`);
    fetchOrderTracking(searchId);
  };

  const getAlertBadgeColor = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("payment") || t.includes("reminder") || t.includes("warn")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
    if (t.includes("error") || t.includes("cancel")) {
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900";
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#1E1C1A] font-sans md:p-0 p-5 pb-20 max-w-6xl mx-auto text-gray-800 dark:text-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="pt-10 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#7B4F1E]/10 dark:bg-[#bd9961]/20 flex items-center justify-center text-[#7B4F1E] dark:text-[#bd9961]">
          <Truck size={30} />
        </div>
        <div className="">
          <h1 className="text-3xl font-extrabold text-[#101518] dark:text-white">
            Track Your Order Status
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            Enter your order number to get real-time tracking updates, timeline status, and delivery information.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-4">
          <div className="flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className={`w-full text-base text-[#222222] bg-white dark:bg-[#2A2622] dark:text-white border ${
                  validationError
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-gray-250 dark:border-gray-800 focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
                } rounded-xl py-3.5 pl-4 pr-32 transition-all outline-none shadow-sm`}
                placeholder="Enter Order No (e.g. DZL-10001)"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 bg-[#7B4F1E] hover:bg-[#684219] disabled:bg-[#7B4F1E]/60 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>

            {/* Client-side Validation Error Msg */}
            {validationError && (
              <p className="text-left text-xs font-semibold text-red-500 flex items-center gap-1 pl-1">
                <AlertCircle size={14} /> {validationError}
              </p>
            )}

            <p className="text-xs text-gray-400 text-left pl-1">
              Sample format: <span className="font-semibold text-gray-600 dark:text-gray-300">DZL-10001</span> 
              {/* Sample format: <span className="font-semibold text-gray-600 dark:text-gray-300">DZL-10001</span> (5-20 characters, no spaces) */}
            </p>
          </div>
        </form>
      </div>

      {/* API Error State Card */}
      {apiError && !loading && (
        <div className="mt-10 max-w-2xl mx-auto bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <XCircle size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Unable to Find Order</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{apiError}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please verify your order number and try searching again.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse px-2">
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

      {/* Order Tracking Details */}
      {order && !loading && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in px-2">
          {/* Main Left Column (Order Summary Header, Timeline & Alerts) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Order Meta Header Card */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-150 dark:border-gray-800 p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="text-[#7B4F1E] dark:text-[#bd9961]" size={20} />
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      Order #{order.orderNo}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={13} /> Created: {formatDateTime(order.createdAt)}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Cancelled / Delivered / In Progress Badge */}
                  {order.orderCancelled ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900">
                      <XCircle size={14} /> Order Cancelled
                    </span>
                  ) : order.orderDelivered ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 size={14} /> Delivered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900">
                      <Clock size={14} /> In Progress
                    </span>
                  )}

                  {/* Payment Status Badge */}
                  {order.orderFullPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                      <ShieldCheck size={14} /> Fully Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900">
                      <AlertTriangle size={14} /> Partial / Unpaid
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery & Customer Info Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <User size={13} className="text-[#7B4F1E]" /> Customer Details
                  </p>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{order.fullName}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      <Phone size={12} /> {order.mobile}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <MapPin size={13} className="text-[#7B4F1E]" /> Delivery Address
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                    {order.address}
                  </p>
                  {order.address2 && (
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">{order.address2}</p>
                  )}
                </div>
              </div>

              {/* Instructions & Notes */}
              {(order.deliveryIns || order.customerNotes) && (
                <div className="space-y-2 pt-1">
                  {order.deliveryIns && (
                    <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-150 dark:border-amber-900/50 flex items-start gap-2.5 text-xs">
                      <Truck size={15} className="text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200">Delivery Instructions:</span>
                        <p className="text-amber-800 dark:text-amber-300 mt-0.5">{order.deliveryIns}</p>
                      </div>
                    </div>
                  )}

                  {order.customerNotes && (
                    <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-150 dark:border-blue-900/50 flex items-start gap-2.5 text-xs">
                      <MessageSquare size={15} className="text-blue-700 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-blue-900 dark:text-blue-200">Customer Notes:</span>
                        <p className="text-blue-800 dark:text-blue-300 mt-0.5">{order.customerNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Timeline Card */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-150 dark:border-gray-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock size={16} className="text-[#7B4F1E]" /> Order Status Timeline
              </h3>

              {order.statusTimeline && order.statusTimeline.length > 0 ? (
                <div className="relative border-l-2 border-[#7B4F1E]/30 dark:border-[#bd9961]/30 ml-4 space-y-8 pb-2">
                  {order.statusTimeline.map((item, idx) => {
                    const isLatest = idx === order.statusTimeline.length - 1;
                    return (
                      <div key={idx} className="relative pl-6">
                        {/* Timeline Bullet Node */}
                        <div
                          className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isLatest
                              ? "bg-[#7B4F1E] border-white dark:border-[#25221F] ring-4 ring-[#7B4F1E]/20"
                              : "bg-[#7B4F1E]/70 border-white dark:border-[#25221F]"
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                              {item.orderStatus}
                            </p>
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#25221F] px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                              {formatDateTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span>Updated by:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{item.createdBy || "System"}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No timeline updates recorded yet.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar Column (Bill Summary & Alert Logs) */}
          <div className="space-y-6">
            {/* Bill Summary Card */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-150 dark:border-gray-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <FileText size={16} className="text-[#7B4F1E]" /> Bill Breakdown
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal Amount</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(order.subTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Paid Amount</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(order.paidAmount)}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900 dark:text-white">Grand / Due Amount</span>
                  <span className="font-extrabold text-[#7B4F1E] dark:text-[#bd9961] text-base">
                    {formatCurrency(order.grandAmount)}
                  </span>
                </div>

                {order.orderFullPaid ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg text-[11px] font-bold text-center border border-emerald-200 dark:border-emerald-900/50">
                    ✓ Full payment received
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg text-[11px] font-medium text-center border border-amber-200 dark:border-amber-900/50">
                    Due amount pending for collection
                  </div>
                )}
              </div>
            </div>

            {/* Alert Logs Card */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-150 dark:border-gray-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Mail size={16} className="text-[#7B4F1E]" /> Alerts & Activity Logs
              </h3>

              {order.alertsLogs && order.alertsLogs.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {order.alertsLogs.map((alert, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 rounded-md border ${getAlertBadgeColor(
                            alert.alertTypes
                          )}`}
                        >
                          {alert.alertTypes || "Alert"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatDateTime(alert.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No alert logs available for this order.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State (When no search performed yet) */}
      {!order && !loading && !apiError && (
        <div className="mt-12 max-w-md mx-auto text-center p-8 bg-white dark:bg-[#25221F] rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7B4F1E]/10 dark:bg-[#bd9961]/20 text-[#7B4F1E] dark:text-[#bd9961] flex items-center justify-center mx-auto">
            <Info size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Ready to Track</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Please enter your order number above (e.g. <span className="font-semibold text-gray-700 dark:text-gray-300">DZL-10001</span>) to view order status, timeline, and delivery details.
          </p>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#7B4F1E] dark:text-gray-400 dark:hover:text-[#bd9961] transition font-medium"
        >
          <ChevronLeft size={16} /> Back to Home Page
        </Link>
      </div>
    </div>
  );
}

export default function OrderTracking() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
