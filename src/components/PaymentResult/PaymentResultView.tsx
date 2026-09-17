"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { trackPurchase, sendServerPurchaseEvent } from "@/lib/analytics/pixelEvents";

export type PaymentOutcome = "success" | "error" | "cancel";

interface OrderSummary {
  orderNo: string;
  /** The API's real field name — `grandAmount` never matched any response field. */
  grandTotal: number;
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
  verifiedAmount,
  trxID,
}: {
  outcome: PaymentOutcome;
  orderNo: string | null;
  gatewayName: string;
  gatewayLogo: StaticImageData;
  /**
   * Amount confirmed directly by the gateway's own verify endpoint —
   * shown only as a fallback when `/order-tracking` has no matching order
   * (e.g. bKash's redirect carries a raw orderToken UUID, not the
   * DZL-XXXXX order number /order-tracking expects).
   */
  verifiedAmount?: string;
  trxID?: string;
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
          // Public gateway-return page — a stale/missing session here is
          // normal and shouldn't trigger the site-wide session-expired modal.
          { suppressSessionExpired: true },
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

  // Fires the Purchase pixel + server-side Conversions API event for the
  // one case a bKash/SSLCommerz order can be tracked from THIS app: the
  // browser is actually back on our site with a confirmed order. Fires
  // once per mount, only once the real order amount is known. A customer
  // who pays and never returns to this page is not covered here — that
  // requires the payment gateway's own webhook on the real backend, see
  // docs/tracking-backend-requirements.txt.
  useEffect(() => {
    if (outcome === "success" && order && !tracked.current) {
      tracked.current = true;
      const eventId = trackPurchase(order.orderNo, [], order.grandTotal);
      sendServerPurchaseEvent({ eventId, orderId: order.orderNo, value: order.grandTotal });
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

        {order ? (
          <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-2xl p-4 text-left text-sm space-y-1.5 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Order No</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Amount</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ৳{order.grandTotal?.toLocaleString("en-BD")}
              </span>
            </div>
          </div>
        ) : (
          // /order-tracking had no matching order (e.g. bKash's redirect
          // carries a raw orderToken UUID, not a DZL-XXXXX order number) —
          // fall back to whatever the gateway's own verify call confirmed.
          !loading &&
          verifiedAmount && (
            <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-2xl p-4 text-left text-sm space-y-1.5 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-bold text-gray-900 dark:text-white">৳{verifiedAmount}</span>
              </div>
              {trxID && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                  <span className="font-bold text-gray-900 dark:text-white">{trxID}</span>
                </div>
              )}
            </div>
          )
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
