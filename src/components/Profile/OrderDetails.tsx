"use client";
import { useState } from "react";
import { ChevronRight, RotateCcw, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import locationImg from "@/images/location.png";
import { Order, ReturnReason } from "./profile.types";

// ─── Helper: 7-day window check ──────────────────────────────────────────────
function isWithinReturnWindow(orderDateISO: string): boolean {
  const orderDate = new Date(orderDateISO);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function getDaysAgo(orderDateISO: string): number {
  const orderDate = new Date(orderDateISO);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ─── Return Modal ─────────────────────────────────────────────────────────────
interface ReturnModalProps {
  order: Order;
  onClose: () => void;
}

const RETURN_REASONS: ReturnReason[] = [
  "Defective / Not Working",
  "Wrong Item Delivered",
  "Item Not as Described",
  "Changed My Mind",
  "Damaged in Shipping",
];

const ReturnModal: React.FC<ReturnModalProps> = ({ order, onClose }) => {
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
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success(`Return request for Order ${order.id} submitted successfully!`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2a2520] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
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
              <p className="text-xs text-gray-400">Order {order.id}</p>
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
            /* ── Success State ── */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Request Submitted!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your return request for Order <strong>{order.id}</strong> has been received.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                Our team will contact you within 24-48 hours to arrange pickup.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-left mb-6">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Return Reference</p>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">
                  RTN-{order.id.replace("#", "")}-{Date.now().toString().slice(-4)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#7A4500] text-white rounded-2xl font-semibold hover:bg-[#5a3300] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Items Summary */}
              {order.items && order.items.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#1e1a17] rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                    Items in this order
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.name} × {item.qty}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return Reason */}
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

              {/* Description */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !reason}
                className="w-full py-3.5 bg-[#7A4500] text-white rounded-2xl font-semibold hover:bg-[#5a3300] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

// ─── Return Status Badge ──────────────────────────────────────────────────────
interface ReturnWidgetProps {
  order: Order;
}

const ReturnWidget: React.FC<ReturnWidgetProps> = ({ order }) => {
  const [showModal, setShowModal] = useState(false);

  const canReturn = isWithinReturnWindow(order.orderDate);
  const daysAgo = getDaysAgo(order.orderDate);
  const daysLeft = 7 - daysAgo;

  // Only show return widget for delivered orders
  if (order.status !== "Delivered") {
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
        <ReturnModal order={order} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

// ─── Main OrderDetails Component ──────────────────────────────────────────────
interface OrderDetailsProps {
  order?: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  // Default mock order for backward compatibility
  const displayOrder: Order = order ?? {
    id: "#7678",
    date: "August 04, 2025",
    orderDate: "2025-08-04T10:30:00Z",
    status: "In Progress",
    total: "৳1,00,120",
    items: [
      { name: "Apple iPhone 15 Pro Max", qty: 1, price: "৳1,00,000" },
      { name: "Delivery Fee", qty: 1, price: "৳120" },
    ],
  };

  const steps = [
    {
      title: "Delivered",
      subtitle: "Waiting...",
      completed: false,
      last: false,
    },
    {
      title: "In Transit",
      subtitle: "Waiting...",
      completed: false,
      last: false,
    },
    {
      title: "Sent Out",
      subtitle: "Sent out Mar 7, 2026",
      time: "8:00 PM",
      completed: true,
      last: false,
    },
    {
      title: "Packaged",
      subtitle: "Packaged Mar 7, 2026",
      time: "8:00 PM",
      completed: true,
      last: true,
    },
  ];

  return (
    <div className="p-5 rounded-3xl bg-[#F7F7F7] dark:bg-[#393430] font-sans">
      {/* Header Section */}
      <div className="rounded-2xl mb-5 flex justify-between items-start">
        <div>
          <h2 className="text-[#7A4500] text-xl font-bold">
            Order {displayOrder.id}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {displayOrder.date}
          </p>
          <div className="flex gap-3 mt-4">
            <button className="bg-white px-5 py-2 border border-gray-200 rounded-xl text-sm dark:text-black font-medium hover:bg-gray-50 transition-colors">
              Invoice Details
            </button>
            <button className="bg-white px-5 py-2 border border-gray-200 rounded-xl text-sm dark:text-black font-medium hover:bg-gray-50 transition-colors">
              Need Help?
            </button>
          </div>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            displayOrder.status === "Delivered"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {displayOrder.status}
        </span>
      </div>

      {/* ── 7-Day Return Widget ────────────────────────────────────────── */}
      <div className="mb-5">
        <ReturnWidget order={displayOrder} />
      </div>

      {/* Order Tracking Section */}
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Order Tracking
        </h3>
        <div className="bg-white dark:bg-[#393430] p-3 rounded-2xl border border-gray-100">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4 items-start">
              {/* Stepper Line Logic */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white ${
                    step.completed ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  {step.completed && (
                    <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  )}
                </div>
                {!step.last && (
                  <div className="w-[1px] h-[30px] border-l-2 border-dashed border-gray-300 my-1"></div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 flex items-center pb-2">
                <div>
                  <h4
                    className={`font-semibold ${
                      step.completed
                        ? "text-gray-800 dark:text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{step.subtitle}</p>
                </div>
                {step.time && (
                  <span className="text-xs text-gray-400 font-medium mx-auto">
                    {step.time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Delivery Address
        </h3>
        <div className="bg-white dark:bg-[#393430] py-4 px-5 rounded-xl border border-gray-100 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-gray-100 text-red-500">
              <Image src={locationImg} alt="Location" width={38} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Dhaka
              </h4>
              <p className="text-sm text-gray-400 dark:text-gray-300">
                Rd 7, Block A, Bashundhara
              </p>
            </div>
          </div>
          <ChevronRight
            className="text-[#222222] dark:text-white mx-auto"
            size={20}
          />
        </div>
      </div>

      {/* Order Summary Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Order Summary
        </h3>
        <div className="bg-white dark:bg-[#393430] py-4 px-5 rounded-xl text-base text-[#222222] dark:text-white border border-gray-100 space-y-2">
          {displayOrder.items ? (
            displayOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <span className="font-medium text-sm">
                  {item.name} × {item.qty}
                </span>
                <span className="mx-auto font-semibold">{item.price}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center">
                <span className="font-medium">Subtotal</span>
                <span className="mx-auto font-semibold">৳ 1,00,000</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Delivery Fee</span>
                <span className="mx-auto font-semibold">৳ 120</span>
              </div>
            </>
          )}
          <div className="border-t border-gray-100 dark:border-gray-600 pt-2 flex items-center">
            <span className="font-bold">Total Bill</span>
            <span className="mx-auto font-bold text-[#7A4500]">
              {displayOrder.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
