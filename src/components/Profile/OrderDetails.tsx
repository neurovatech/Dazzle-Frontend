"use client";
import { useState } from "react";
import {
  ChevronRight,
  RotateCcw,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  MapPin,
  FileText,
  Bell,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import locationImg from "@/images/location.png";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Order,
  ReturnReason,
  OrderTrackingResponse,
  OrderTrackingData,
} from "./profile.types";

// ─── Helper: 7-day window check ──────────────────────────────────────────────
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2a2520] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <RotateCcw size={18} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Return Request
              </h2>
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

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Request Submitted!
              </h3>
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
                  Additional Details{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
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

const ReturnWidget: React.FC<ReturnWidgetProps> = ({
  orderDateISO,
  isDelivered,
  orderNo,
}) => {
  const [showModal, setShowModal] = useState(false);

  const canReturn = isWithinReturnWindow(orderDateISO);
  const daysAgo = getDaysAgo(orderDateISO);
  const daysLeft = 7 - daysAgo;

  if (!isDelivered) {
    return null;
  }

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
              canReturn
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {canReturn ? (
              <RotateCcw size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            {canReturn ? (
              <>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Return Available
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  <Clock size={11} className="inline mr-1" />
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your 7-day return window
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Return Window Closed
                </p>
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

      {showModal && (
        <ReturnModal orderNo={orderNo} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

// ─── Main OrderDetails Component ──────────────────────────────────────────────
interface OrderDetailsProps {
  order?: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const orderNo = order?.comerzOrderNo || order?.id || "";

  // ── Fetch Tracking details from API ──
  const { data: trackingRes, isLoading, isError } = useQuery<OrderTrackingResponse>({
    queryKey: ["order-tracking", orderNo],
    queryFn: async () => {
      return api.get<OrderTrackingResponse>(`/order-tracking/${orderNo}`);
    },
    enabled: !!orderNo,
  });

  const trackingData: OrderTrackingData | undefined = trackingRes?.data;

  const formatDate = (isoString?: string) => {
    if (!isoString) return order?.date || "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const statusText = trackingData
    ? trackingData.orderCancelled
      ? "Cancelled"
      : trackingData.orderDelivered
      ? "Delivered"
      : "In Progress"
    : order?.status || "In Progress";

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

  const timelineSteps = trackingData?.statusTimeline || [];
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

      {/* ── Alert Logs Banner (If any) ── */}
      {alertLogs.length > 0 && (
        <div className="space-y-2">
          {alertLogs.map((alert, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3"
            >
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {alert.alertTypes || "Notice"}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {alert.description}
                </p>
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

      {/* ── Order Tracking Timeline ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
          Order Tracking
        </h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
          {timelineSteps.length > 0 ? (
            <div className="space-y-4">
              {timelineSteps.map((step, idx) => {
                const isLast = idx === timelineSteps.length - 1;
                return (
                  <div key={idx} className="flex gap-4 items-start relative">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-[#7A4500] bg-orange-500 flex items-center justify-center z-10 shrink-0">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      {!isLast && (
                        <div className="w-[1.5px] h-8 bg-orange-300 dark:bg-orange-800 my-1" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                        {step.orderStatus}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        By {step.createdBy || "System"} • {formatDate(step.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-gray-400 italic">
              Order processing timeline updates will appear here.
            </div>
          )}
        </div>
      </div>

      {/* ── Delivery Details Section ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
          Delivery Details
        </h3>
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
                {trackingData?.address2
                  ? `${trackingData.address} - ${trackingData.address2}`
                  : trackingData?.address || "Address details not available"}
              </p>
              {trackingData?.deliveryIns && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                  Delivery Instruction: {trackingData.deliveryIns}
                </p>
              )}
              {trackingData?.customerNotes && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Notes: {trackingData.customerNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Summary Section ── */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
          Order Summary
        </h3>
        <div className="bg-white dark:bg-[#2e2a27] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-3 text-sm">
          {trackingData ? (
            <>
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>৳{(trackingData.subTotal ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Paid Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ৳{(trackingData.paidAmount ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-[#7A4500] dark:text-[#d48c34] text-base">
                  ৳{(trackingData.grandAmount ?? 0).toLocaleString("en-IN")}
                </span>
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
    </div>
  );
};

export default OrderDetails;
