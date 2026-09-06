"use client";
import { useState } from "react";
import {
  RotateCcw,
  X,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Loader2,
  MapPin,
  FileText,
  Bell,
  Truck,
  HelpCircle,
  XOctagon,
  Wallet,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import {
  Order,
  ReturnReason,
  OrderTrackingResponse,
  OrderTrackingData,
} from "./profile.types";
import InvoiceModal from "./InvoiceModal";
import Image from "next/image";
import Bikask from "@/images/bKash-Logo.svg";
import SSl from "@/images/ssl-logo.svg";

// ─── Helper: 7-day return window check ───────────────────────────────────────
function isWithinReturnWindow(orderDateISO: string): boolean {
  if (!orderDateISO) return false;
  const orderDate = new Date(orderDateISO);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function getDaysAgo(orderDateISO: string): number {
  if (!orderDateISO) return 0;
  const orderDate = new Date(orderDateISO);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ─── Return Modal ─────────────────────────────────────────────────────────────
interface ReturnModalProps {
  orderNo: string;
  onClose: () => void;
}

const RETURN_REASONS: ReturnReason[] = [
  "Defective / Not Working",
  "Wrong Item Delivered",
  "Item Not as Described",
  "Changed My Mind",
  "Damaged in Shipping",
];

const ReturnModal: React.FC<ReturnModalProps> = ({ orderNo, onClose }) => {
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a return reason.");
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success(`Return request for Order #${orderNo} submitted successfully!`);
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2a2520] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <RotateCcw size={18} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Return Request</h2>
              <p className="text-xs text-gray-400">Order #{orderNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your return request for Order <strong>#{orderNo}</strong> has been received.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                Our team will contact you within 24-48 hours to arrange pickup.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#7A4500] text-white rounded-2xl font-semibold hover:bg-[#5a3300] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {RETURN_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        reason === r
                          ? "border-[#7A4500] bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-[#7A4500]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-[#7A4500]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in more detail..."
                  rows={3}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 text-sm dark:bg-[#1e1a17] dark:text-white focus:outline-none focus:border-[#7A4500] resize-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !reason}
                className="w-full py-3.5 bg-[#7A4500] text-white rounded-2xl font-semibold hover:bg-[#5a3300] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Submit Return Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Return Status Widget ─────────────────────────────────────────────────────
interface ReturnWidgetProps {
  orderDateISO: string;
  isDelivered: boolean;
  orderNo: string;
}

const ReturnWidget: React.FC<ReturnWidgetProps> = ({ orderDateISO, isDelivered, orderNo }) => {
  const [showModal, setShowModal] = useState(false);

  const canReturn = isWithinReturnWindow(orderDateISO);
  const daysAgo = getDaysAgo(orderDateISO);
  const daysLeft = 7 - daysAgo;

  if (!isDelivered) return null;

  return (
    <>
      <div
        className={`rounded-2xl p-4 border ${
          canReturn
            ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
            : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              canReturn ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {canReturn ? <RotateCcw size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-gray-400" />}
          </div>

          <div className="flex-1">
            {canReturn ? (
              <>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Return Available</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  <Clock size={11} className="inline mr-1" />
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your 7-day return window
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Return Window Closed</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Maximum 7 days return policy. This order was placed {daysAgo} days ago.
                </p>
              </>
            )}
          </div>

          {canReturn && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Return Item
            </button>
          )}
        </div>
      </div>

      {showModal && <ReturnModal orderNo={orderNo} onClose={() => setShowModal(false)} />}
    </>
  );
};

// ─── Cancel Order Confirm Modal ───────────────────────────────────────────────
function CancelOrderModal({
  orderNo, onClose, onConfirm, loading,
}: { orderNo: string; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#2a2520] rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XOctagon size={26} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">Cancel this order?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Please confirm you want to cancel order <strong>#{orderNo}</strong>. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            No, keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Yes, cancel it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pay Due Amount Modal ─────────────────────────────────────────────────────
type PaymentMethod = "bkash" | "sslcommerz" | "nagad" | "card";

interface PaymentMethodItem {
  value: PaymentMethod;
  label: string;
  icon?: string;
  imgSrc?: typeof Bikask;
}

const METHODS: PaymentMethodItem[] = [
  { value: "bkash",      label: "bKash",       imgSrc: Bikask },
  { value: "sslcommerz", label: "SSLCommerz",  imgSrc: SSl    },
  // { value: "nagad",      label: "Nagad",        icon: "💸"    },
  // { value: "card",       label: "Card / Bank",  icon: "💳"    },
];

function PayDueModal({
  orderNo, dueAmount, onClose,
}: { orderNo: string; dueAmount: number; onClose: () => void }) {
  const [amount, setAmount] = useState(String(dueAmount));
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const parsedAmount = parseFloat(amount) || 0;

  const handlePay = async () => {
    if (parsedAmount <= 0) { setError("Please enter a valid amount."); return; }
    if (parsedAmount > dueAmount) { setError(`Amount cannot exceed due amount ৳${dueAmount.toLocaleString("en-IN")}.`); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // placeholder for real API call
    setLoading(false);
    setDone(true);
    toast.success("Payment recorded successfully!");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2a2520] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Wallet size={17} className="text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Pay Due Amount</h2>
              <p className="text-xs text-gray-400">Order #{orderNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Payment Submitted!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Your payment of <strong>৳{parsedAmount.toLocaleString("en-IN")}</strong> via <strong>{METHODS.find(m => m.value === method)?.label}</strong> has been recorded.
              </p>
              <button onClick={onClose} className="w-full py-3 bg-[#7A4500] text-white rounded-2xl font-semibold hover:bg-[#5a3300] transition">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Order Total</span>
                  <span className="font-semibold">৳{(dueAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-red-600 dark:text-red-400 border-t border-amber-200 dark:border-amber-800 pt-2">
                  <span>Remaining Due</span>
                  <span>৳{dueAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">৳</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }}
                    min={1}
                    max={dueAmount}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition ${
                        method === m.value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                          : "border-gray-200 dark:border-zinc-700 hover:border-amber-300"
                      }`}
                    >
                      {m.imgSrc ? (
                        <Image src={m.imgSrc} alt={m.label} className="h-6 w-auto object-contain" />
                      ) : (
                        <>
                          <span className="text-base">{m.icon}</span>
                          <span className={`text-sm font-semibold truncate ${
                            method === m.value
                              ? "text-amber-800 dark:text-amber-300"
                              : "text-gray-600 dark:text-gray-300"
                          }`}>{m.label}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={loading || parsedAmount <= 0}
                className="w-full py-3.5 bg-[#7A4500] hover:bg-[#5a3300] text-white rounded-2xl font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><Wallet size={16} /> Confirm & Pay ৳{parsedAmount > 0 ? parsedAmount.toLocaleString("en-IN") : "0"}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main OrderDetails Component ──────────────────────────────────────────────
interface OrderDetailsProps {
  order?: Order;
}

// ─── 4-Step Tracking Flow ─────────────────────────────────────────────────────
const TRACKING_STEPS = [
  { label: "Order Placed",  statuses: ["pending", "booked", "processed"] },
  { label: "Confirmed",     statuses: ["confirmed", "failed", "refunded"] },
  { label: "Shipping",      statuses: ["shipping", "sent out", "in transit", "sentout", "intransit", "out for delivery"] },
  { label: "Completed",     statuses: ["completed", "delivered", "cancelled"] },
];

/**
 * Returns the index of the LAST completed step (0-based).
 *
 * Pending / Booked / Processed  → 0  (only step 1 green)
 * Confirmed / Failed / Refunded → 1  (steps 1-2 green)
 * Shipping / In Transit …       → 2  (steps 1-3 green)
 * Completed / Delivered / Cancelled → 3  (all 4 green)
 */
function getActiveStep(
  orderStatus?: string,
  orderCancelled?: boolean,
  orderDelivered?: boolean,
): number {
  if (orderCancelled || orderDelivered) return 3;
  if (!orderStatus) return 0;
  const s = orderStatus.toLowerCase().replace(/[\s_-]+/g, "");

  // Walk from the last step downward — return the first match found
  for (let i = TRACKING_STEPS.length - 1; i >= 0; i--) {
    if (TRACKING_STEPS[i].statuses.some((st) => s.includes(st.replace(/\s+/g, "")))) {
      return i;
    }
  }
  return 0; // default: step 1 only
}

// Legacy canonical steps (kept for timeline match)
const CANONICAL_STEPS = ["Delivered", "In Transit", "Sent Out", "Packaged"];

function findTimelineMatch(
  step: string,
  timeline: { createdAt: string; createdBy: string; orderStatus: string }[],
) {
  const key = step.toLowerCase().replace(/\s+/g, "");
  return timeline.find((t) => (t.orderStatus || "").toLowerCase().replace(/\s+/g, "").includes(key));
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const orderNo = order?.comerzOrderNo || order?.id || "";
  const rawOrder = order?.rawApiData;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayDueModal, setShowPayDueModal] = useState(false);

  const { token, apiKey } = useAppSelector((s) => s.auth);
  const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

  // ── Fetch Tracking details from API ──
  const { data: trackingRes, isLoading } = useQuery<OrderTrackingResponse>({
    queryKey: ["order-tracking", orderNo],
    queryFn: async () => api.get<OrderTrackingResponse>(`/order-tracking/${orderNo}`, {
      headers: { Authorization: authHeader, "X-API-Key": apiKey || "" },
    }),
    enabled: !!orderNo,
  });


  console.log(trackingRes, "trackingRestrackingRestrackingRestrackingRes")

  const trackingData: OrderTrackingData | undefined = trackingRes?.data;

  const formatDate = (isoString?: string) => {
    if (!isoString) return order?.date || "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const statusText = trackingData
    ? trackingData.orderCancelled ? "Cancelled" : trackingData.orderDelivered ? "Delivered" : "In Progress"
    : order?.status || "In Progress";

  const timeline = trackingData?.statusTimeline ?? [];

  // ── Cancel-order eligibility ──────────────────────────────────────────────
  // Cancellation is blocked once the order has reached "Shipping" / "Sent Out" /
  // "In Transit" (or is already delivered/cancelled).
  //
  // isTerminal falls back to the order-list's own status (`order?.status`) when
  // the /order-tracking call hasn't resolved yet or fails — otherwise the whole
  // Cancel Order option would silently disappear any time that one endpoint is
  // slow or unavailable, even though we already know from the list whether the
  // order is still active.
  const isTerminal = trackingData
    ? trackingData.orderCancelled || trackingData.orderDelivered
    : order?.status === "Cancelled" || order?.status === "Delivered";
  const hasShipped = timeline.some((t) =>
    /shipping|transit|sentout|sent out|out for delivery/i.test((t.orderStatus || "").replace(/\s+/g, " ")),
  );
  const canCancel = !isTerminal && !hasShipped;

  // NOTE (backend integration pending): there is no cancel-order endpoint in
  // the API yet, so this button is UI-only for now. Once the endpoint exists,
  // replace the body below with something like:
  //
  //   setCancelling(true);
  //   await api.post(`/api/tokenized/v1/order-cancel/${orderNo}`, {}, {
  //     headers: { Authorization: authHeader, "X-API-Key": apiKey || "" },
  //   });
  //   queryClient.invalidateQueries({ queryKey: ["order-tracking", orderNo] });
  //   queryClient.invalidateQueries({ queryKey: ["order-list"] });
  //
  // The button, the eligibility check (canCancel) above, and the confirmation
  // modal below are already fully built and just need the real call wired in.
  const handleCancelOrder = () => {
    toast("Order cancellation isn't connected to the backend yet.", { icon: "🚧" });
    setShowCancelModal(false);
  };

  // ── Booking money / Cash on Delivery due-amount ───────────────────────────
  const grandAmount = trackingData?.grandAmount ?? order?.totalNumber ?? 0;
  const paidAmount = trackingData?.paidAmount ?? 0;
  const dueAmount = Math.max(0, grandAmount - paidAmount);
  const paymentType = rawOrder?.paymentType; // "COD" | "OP" | "Partial" | undefined
  const isCOD = paymentType === "COD" || !!rawOrder?.isFullPaymentAtStore;
  const isBookingMoney = paymentType === "Partial";
  const showDueBanner = dueAmount > 0 && !trackingData?.orderCancelled;

  // ── Active tracking step ──────────────────────────────────────────────────
  const currentOrderStatus = rawOrder?.orderStatus || order?.status || "";
  const activeStep = getActiveStep(
    currentOrderStatus,
    trackingData?.orderCancelled,
    trackingData?.orderDelivered,
  );
  // Payment allowed only in steps 0 (Placed) and 1 (Confirmed)
  const canPayDue = activeStep <= 1 && dueAmount > 0;

  const handlePayDue = () => {
    if (!canPayDue) return;
    setShowPayDueModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-[#F7F7F7] dark:bg-[#393430] rounded-3xl flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-[#7A4500] animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Fetching tracking details for Order #{orderNo}...
        </p>
      </div>
    );
  }

  const alertLogs = trackingData?.alertsLogs || [];

  return (
    <div className="p-5 rounded-3xl bg-[#F7F7F7] dark:bg-[#393430] font-sans space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-[#7A4500] dark:text-[#d48c34] text-xl font-bold">
            Order #{trackingData?.orderNo || orderNo}
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Placed on {formatDate(trackingData?.createdAt || order?.orderDate)}
          </p>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            statusText === "Cancelled"
              ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
              : statusText === "Delivered"
              ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          {statusText}
        </span>
      </div>

      {/* ── Invoice Details | Need Help? | Cancel Order ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowInvoice(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#2e2a27] border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
        >
          <FileText size={14} /> Invoice Details
        </button>
        <Link
          href="/support"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#2e2a27] border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
        >
          <HelpCircle size={14} /> Need Help?
        </Link>

        {!isTerminal && (
          <button
            onClick={() => canCancel && setShowCancelModal(true)}
            disabled={!canCancel}
            title={!canCancel ? "This order can no longer be cancelled because shipping has already started" : undefined}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition ml-auto ${
              canCancel
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <XOctagon size={14} /> Cancel Order
          </button>
        )}
      </div>

      {/* ── Why cancellation is unavailable ── */}
      {!isTerminal && !canCancel && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs text-gray-500 dark:text-gray-400">
          <Truck size={15} className="mt-0.5 shrink-0" />
          <span>Shipping has already started, so this order can no longer be cancelled. If you still need to cancel it, please contact support.</span>
        </div>
      )}

      {/* ── Due amount notice (Booking Money / Cash on Delivery) ── */}
      {showDueBanner && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Wallet size={16} className="text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Due: ৳{dueAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed max-w-md">
                  {isBookingMoney
                    ? "Only the booking money (advance) has been paid. The remaining amount is due on delivery."
                    : isCOD
                    ? "This is a Cash on Delivery order. Please pay the remaining amount when the product is delivered."
                    : "This order hasn't been fully paid yet."}
                </p>
                {!canPayDue && activeStep >= 2 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={11} />
                    Payment is disabled for Shipping or Completed/Cancelled orders.
                  </p>
                )}
              </div>
              <button
                onClick={handlePayDue}
                disabled={!canPayDue}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  canPayDue
                    ? "bg-[#7A4500] hover:bg-[#5a3300] text-white"
                    : "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                }`}
              >
                Pay Due Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Logs Banner (If any) ── */}
      {alertLogs.length > 0 && (
        <div className="space-y-2">
          {alertLogs.map((alert, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{alert.alertTypes || "Notice"}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 7-Day Return Widget ── */}
      <div>
        <ReturnWidget
          orderDateISO={trackingData?.createdAt || order?.orderDate || ""}
          isDelivered={!!trackingData?.orderDelivered || order?.status === "Delivered"}
          orderNo={trackingData?.orderNo || orderNo}
        />
      </div>

      {/* ── Order Tracking — 4-step flow with green active highlight ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Order Tracking</h3>
        <div className="bg-white dark:bg-[#2e2a27] p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80">

          {/* Tracking code */}
          {trackingData?.trackingCode && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <Truck size={15} className="text-[#7A4500] dark:text-[#d48c34] shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tracking: <span className="font-bold text-gray-800 dark:text-white">{trackingData.trackingCode}</span>
                {trackingData.courierName ? ` · ${trackingData.courierName}` : ""}
              </p>
            </div>
          )}

          {/* 4-step horizontal progress bar */}
          <div className="relative flex items-start justify-between mb-6">
            {/* background connecting line */}
            <div className="absolute top-4 left-[8%] right-[8%] h-[2px] bg-gray-200 dark:bg-zinc-700 z-0" />
            {/* green progress line — grows from left as activeStep increases */}
            <div
              className="absolute top-4 left-[8%] h-[2px] bg-green-500 z-0 transition-all duration-500 ease-in-out"
              style={{
                width: activeStep === 0
                  ? "0%"
                  : `${(activeStep / (TRACKING_STEPS.length - 1)) * 84}%`,
              }}
            />

            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeStep;
              const isCancelledStep = trackingData?.orderCancelled && idx === activeStep && idx === 3;
              return (
                <div key={step.label} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isCancelledStep
                      ? "border-red-500 bg-red-500"
                      : isCompleted
                      ? "border-green-500 bg-green-500"
                      : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                  }`}>
                    {isCancelledStep ? (
                      <XOctagon size={14} className="text-white" />
                    ) : isCompleted ? (
                      <CheckCircle size={14} className="text-white" />
                    ) : (
                      <Circle size={8} className="text-gray-300 dark:text-zinc-600 fill-current" />
                    )}
                  </div>
                  <p className={`text-[11px] font-semibold mt-2 text-center leading-tight px-1 ${
                    isCancelledStep
                      ? "text-red-500 dark:text-red-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Current status pill */}
          <div className="flex items-center justify-center mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              trackingData?.orderCancelled
                ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : trackingData?.orderDelivered
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            }`}>
              Current: {rawOrder?.orderStatus || statusText}
            </span>
          </div>

          {/* Detailed timeline */}
          {timeline.length > 0 && (
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Status History</p>
              {timeline.map((t, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{t.orderStatus}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {t.createdBy || "System"} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Delivery Details Section ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Delivery Address</h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
              <MapPin size={18} className="text-[#7A4500] dark:text-[#d48c34]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                {trackingData?.fullName || "Customer"} ({trackingData?.mobile || "N/A"})
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 leading-relaxed">
                {trackingData?.address2 ? `${trackingData.address} - ${trackingData.address2}` : trackingData?.address || "Address details not available"}
              </p>
              {trackingData?.deliveryIns && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">Delivery Instruction: {trackingData.deliveryIns}</p>
              )}
              {trackingData?.customerNotes && (
                <p className="text-xs text-gray-400 mt-0.5">Notes: {trackingData.customerNotes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Information Section ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Package size={20} className="text-[#7A4500] dark:text-[#d48c34]" />
            Product Information
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-[#7A4500] dark:text-[#d48c34]">
            {rawOrder?.comerzOrderItems?.length || rawOrder?.productCount || 1} Item(s)
          </span>
        </div>

        <div className="bg-white dark:bg-[#2e2a27] rounded-2xl border border-gray-100 dark:border-zinc-800/80 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
          {rawOrder?.comerzOrderItems && rawOrder.comerzOrderItems.length > 0 ? (
            rawOrder.comerzOrderItems.map((item, idx) => {
              const offerPrice = item.offerPrice ?? 0;
              const discount = item.discount ?? 0;
              const finalPrice = item.finalPrice ?? (offerPrice - discount);
              const minBooking = item.minBookingPrice ?? 0;

              return (
                <div key={item.comerzOrderItemUUID || idx} className="p-4 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Item Badge & Icon */}
                    <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                      <ShoppingBag size={20} className="text-[#7A4500] dark:text-[#d48c34]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                              #{idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {item.productName}
                            </h4>
                          </div>
                          {item.variantName && item.variantName !== item.productName && (
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                              Variant / Spec: <span className="text-gray-700 dark:text-gray-300">{item.variantName}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-extrabold text-[#7A4500] dark:text-[#d48c34] bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
                          ৳{finalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Full Pricing & Item Reference breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-gray-50 dark:bg-[#25211e] text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Item Reference Code</span>
                          <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold truncate block">
                            {item.comerzOrderItemUUID ? `#${item.comerzOrderItemUUID.slice(0, 18)}...` : `#ITEM-${idx + 1}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Pricing Details</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              ৳{offerPrice.toLocaleString("en-IN")}
                            </span>
                            {discount > 0 && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                (-৳{discount.toLocaleString("en-IN")} discount)
                              </span>
                            )}
                          </div>
                        </div>

                        {minBooking > 0 && (
                          <div className="sm:col-span-2 pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-between text-amber-800 dark:text-amber-300">
                            <span>Minimum Booking Price (Advance):</span>
                            <span className="font-bold">৳{minBooking.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Fallback single product display when comerzOrderItems is empty */
            <div className="p-4 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                <ShoppingBag size={20} className="text-[#7A4500] dark:text-[#d48c34]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {rawOrder?.productName || `Product (${rawOrder?.productCount || 1} Item)`}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Total Product Price: <span className="font-bold text-[#7A4500] dark:text-[#d48c34]">৳{(rawOrder?.productPrice ?? 0).toLocaleString("en-IN")}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Summary Section ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Order Summary</h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-3 text-sm">
          {trackingData ? (
            <>
              {/* Delivery method */}
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span>Delivery Type</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {rawOrder?.isHomeDelivery ? "🏠 Home Delivery" : rawOrder?.isStorePickup || rawOrder?.isShopPickup ? "🏪 Store Pickup" : "—"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Product Price</span>
                <span>৳{(rawOrder?.productPrice ?? 0).toLocaleString("en-IN")}</span>
              </div>
              {(rawOrder?.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span>৳{(rawOrder?.deliveryFee ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.discount ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>-৳{(rawOrder?.discount ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>৳{(rawOrder?.subTotal ?? trackingData?.subTotal ?? 0).toLocaleString("en-IN")}</span>
              </div>
              {(rawOrder?.codCharge ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-orange-600 dark:text-orange-400">
                  <span>COD Charge</span>
                  <span>৳{(rawOrder?.codCharge ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.roundOff ?? 0) !== 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span>Round Off</span>
                  <span>{(rawOrder?.roundOff ?? 0) >= 0 ? "+" : ""}৳{(rawOrder?.roundOff ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Paid Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ৳{(rawOrder?.paidAmount ?? paidAmount).toLocaleString("en-IN")}
                </span>
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-red-500">
                  <span>Due Amount</span>
                  <span>৳{dueAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-[#7A4500] dark:text-[#d48c34] text-base">
                  ৳{(rawOrder?.grandTotal ?? grandAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Order Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                  rawOrder?.orderStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                    : rawOrder?.orderStatus === "Delivered"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : rawOrder?.orderStatus === "Cancelled"
                    ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                }`}>
                  {rawOrder?.orderStatus || statusText}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Payment Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                  rawOrder?.isFullPaid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                }`}>
                  {rawOrder?.isFullPaid ? "Fully Paid" : "Payment Pending / Partial"}
                </span>
              </div>
            </>
          ) : (
            /* Fallback when tracking API hasn't resolved — use rawApiData directly */
            <>
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span>Delivery Type</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {rawOrder?.isHomeDelivery ? "🏠 Home Delivery" : rawOrder?.isStorePickup || rawOrder?.isShopPickup ? "🏪 Store Pickup" : "—"}
                </span>
              </div>
              {(rawOrder?.productPrice ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Product Price</span>
                  <span>৳{(rawOrder?.productPrice ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span>৳{(rawOrder?.deliveryFee ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.discount ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>-৳{(rawOrder?.discount ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.subTotal ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>৳{(rawOrder?.subTotal ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.codCharge ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-orange-600 dark:text-orange-400">
                  <span>COD Charge</span>
                  <span>৳{(rawOrder?.codCharge ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              {(rawOrder?.roundOff ?? 0) !== 0 && (
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Round Off</span>
                  <span>{(rawOrder?.roundOff ?? 0) >= 0 ? "+" : ""}৳{(rawOrder?.roundOff ?? 0).toFixed(2)}</span>
                </div>
              )}
              {(rawOrder?.paidAmount ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Paid Amount</span>
                  <span className="text-emerald-600 font-semibold">৳{(rawOrder?.paidAmount ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-[#7A4500] dark:text-[#d48c34] text-base">
                  {order?.total ?? `৳${(rawOrder?.grandTotal ?? rawOrder?.total ?? 0).toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Order Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                  rawOrder?.orderStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                    : rawOrder?.orderStatus === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {rawOrder?.orderStatus || order?.status || "—"}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Payment:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                  rawOrder?.isFullPaid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {rawOrder?.isFullPaid ? "Fully Paid" : "Pending / Partial"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Cancel Order Modal ── */}
      {showCancelModal && (
        <CancelOrderModal
          orderNo={trackingData?.orderNo || orderNo}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          loading={false}
        />
      )}

      {/* ── Pay Due Amount Modal ── */}
      {showPayDueModal && (
        <PayDueModal
          orderNo={trackingData?.orderNo || orderNo}
          dueAmount={dueAmount}
          onClose={() => setShowPayDueModal(false)}
        />
      )}

      {/* ── Invoice Modal ── */}
      {showInvoice && rawOrder && (
        <InvoiceModal
          order={rawOrder}
          onClose={() => setShowInvoice(false)}
          authHeader={authHeader}
          apiKey={apiKey || ""}
        />
      )}
    </div>
  );
};

export default OrderDetails;
