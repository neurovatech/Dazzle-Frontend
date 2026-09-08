"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { trackPurchase } from "@/lib/analytics/pixelEvents";

export type PaymentOutcome = "success" | "error" | "cancel";

interface OrderSummary {
  orderNo: string;
  grandAmount: number;
  paidAmount: number;
  orderFullPaid: boolean;
  orderCancelled: boolean;
}

interface OrderTrackingResponse {
  statusCode: number;
  status: string;
  message: string;
  data: OrderSummary;
}

const OUTCOME_CONFIG: Record<
  PaymentOutcome,
  { Icon: typeof CheckCircle2; color: string; bg: string; title: string; desc: string }
> = {
  success: {
    Icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    title: "Payment Successful!",
    desc: "Your payment has been received and your order is confirmed.",
  },
  error: {
    Icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    title: "Payment Failed",
    desc: "We couldn't complete your payment. No amount has been charged — please try again.",
  },
  cancel: {
    Icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    title: "Payment Cancelled",
    desc: "You cancelled the payment before it was completed.",
  },
};

/**
 * Shared result screen for every gateway-return page (bKash and SSLCommerz
 * alike). `orderNo` — when the gateway redirect carries one — is used to
 * pull the REAL order state from the existing /order-tracking/{orderNo}
 * endpoint rather than trusting whatever fields the gateway happens to put
 * on the URL, so the amount/status shown here always matches what the
 * account's own order record says.
 */
export default function PaymentResultView({
  outcome,
  orderNo,
  gatewayName,
  gatewayLogo,
}: {
  outcome: PaymentOutcome;
  orderNo: string | null;
  gatewayName: string;
  gatewayLogo: StaticImageData;
}) {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(!!orderNo);
  const tracked = useRef(false);

  useEffect(() => {
    if (!orderNo) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<OrderTrackingResponse>(
          `/order-tracking/${encodeURIComponent(orderNo)}`,
        );
        if (!cancelled && res?.data) setOrder(res.data);
      } catch (err) {
        console.error("[PaymentResultView] order-tracking fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNo]);

  // Fires the client-side Purchase pixel for the one case it CAN fire for:
  // the browser is actually back on our site with a confirmed order. Fires
  // once per mount, only once the real order amount is known.
  useEffect(() => {
    if (outcome === "success" && order && !tracked.current) {
      tracked.current = true;
      trackPurchase(order.orderNo, [], order.grandAmount);
    }
  }, [outcome, order]);

  const { Icon, color, bg, title, desc } = OUTCOME_CONFIG[outcome];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#fffbf6] dark:bg-[#2e2b28]">
      <div className="w-full max-w-md bg-white dark:bg-[#25221F] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 text-center space-y-5">
        <Image src={gatewayLogo} alt={gatewayName} className="h-8 w-auto mx-auto object-contain" />

        <div className={`w-16 h-16 rounded-full ${bg} ${color} flex items-center justify-center mx-auto`}>
          <Icon size={36} />
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
        </div>

        {loading && <Loader2 className="animate-spin mx-auto text-gray-400" size={20} />}

        {order && (
          <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-2xl p-4 text-left text-sm space-y-1.5 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Order No</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Amount</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ৳{order.grandAmount?.toLocaleString("en-BD")}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          {outcome === "success" ? (
            <>
              <Link
                href={order ? `/order-tracking?orderNo=${encodeURIComponent(order.orderNo)}` : "/order-tracking"}
                className="w-full py-3 rounded-xl bg-[#7B4F1E] hover:bg-[#684219] text-white font-bold text-sm transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/"
                className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Continue Shopping
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/checkout"
                className="w-full py-3 rounded-xl bg-[#7B4F1E] hover:bg-[#684219] text-white font-bold text-sm transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/cart"
                className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Back to Cart
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
