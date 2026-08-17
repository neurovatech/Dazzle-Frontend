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

// ─── Main OrderDetails Component ──────────────────────────────────────────────
interface OrderDetailsProps {
  order?: Order;
}

// Canonical delivery steps — Figma shows the most recent step at the top.
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

  // NOTE (backend integration pending): no online due-amount payment endpoint
  // exists yet either. Once available (likely similar to the checkout flow's
  // /api/tokenized/v1/sslcommerz-pay or /api/tokenized/v1/bkash-pay), wire the
  // real call in here. The button below is ready and waiting on it.
  const handlePayDue = () => {
    toast("Online due-amount payment isn't connected to the backend yet.", { icon: "🚧" });
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
                    ? "Only the booking money (advance) has been paid for this order. The remaining amount is due on delivery."
                    : isCOD
                    ? "This is a Cash on Delivery order. Please pay the remaining amount when the product is delivered."
                    : "This order hasn't been fully paid yet. Please contact support to settle the due amount."}
                </p>
              </div>
              <button
                onClick={handlePayDue}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#7A4500] hover:bg-[#5a3300] text-white text-xs font-bold transition"
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

      {/* ── Order Tracking Timeline (Figma-style: newest step first, Waiting for future) ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Order Tracking</h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-4">
          {trackingData?.trackingCode && (
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <Truck size={16} className="text-[#7A4500] dark:text-[#d48c34] shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tracking Code: <span className="font-bold text-gray-800 dark:text-white">{trackingData.trackingCode}</span>
                {trackingData.courierName ? ` (${trackingData.courierName})` : ""}
              </p>
            </div>
          )}

          {trackingData?.orderCancelled ? (
            <div className="flex items-center gap-2 py-2 text-red-600 dark:text-red-400 text-sm font-semibold">
              <XOctagon size={16} /> This order has been cancelled
            </div>
          ) : (
            <div className="space-y-4">
              {CANONICAL_STEPS.map((step, idx) => {
                const match = findTimelineMatch(step, timeline);
                const isLast = idx === CANONICAL_STEPS.length - 1;
                return (
                  <div key={step} className="flex gap-4 items-start relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0 ${
                          match
                            ? "border-[#7A4500] bg-[#7A4500]"
                            : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                        }`}
                      >
                        {match ? <CheckCircle size={14} className="text-white" /> : <Circle size={8} className="text-gray-300 dark:text-zinc-600 fill-current" />}
                      </div>
                      {!isLast && <div className={`w-[1.5px] h-8 my-1 ${match ? "bg-orange-300 dark:bg-orange-800" : "bg-gray-200 dark:bg-zinc-700"}`} />}
                    </div>

                    <div className="flex-1 pb-1">
                      <h4 className={`font-semibold text-sm ${match ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                        {step}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {match ? `${match.createdBy || "System"} • ${formatDate(match.createdAt)}` : "Waiting..."}
                      </p>
                    </div>
                  </div>
                );
              })}
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

      {/* ── Order Summary Section ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Order Summary</h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-3 text-sm">
          {trackingData ? (
            <>
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>৳{(trackingData.subTotal ?? 0).toLocaleString("en-IN")}</span>
              </div>
              {(rawOrder?.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span>৳{(rawOrder?.deliveryFee ?? 0).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Paid Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">৳{paidAmount.toLocaleString("en-IN")}</span>
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-red-500">
                  <span>Due Amount</span>
                  <span>৳{dueAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                <span>Total Bill</span>
                <span className="text-[#7A4500] dark:text-[#d48c34] text-base">৳{grandAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Payment Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    trackingData.orderFullPaid
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  {trackingData.orderFullPaid ? "Fully Paid" : "Payment Pending / Partial"}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span className="text-[#7A4500]">{order?.total}</span>
            </div>
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
