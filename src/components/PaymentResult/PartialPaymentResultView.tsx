"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export type PartialPaymentOutcome = "success" | "error" | "cancel";

const OUTCOME_CONFIG: Record<
  PartialPaymentOutcome,
  { Icon: typeof CheckCircle2; color: string; bg: string; title: string; desc: string }
> = {
  success: {
    Icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    title: "Payment Successful!",
    desc: "Your due-amount payment has been received. The order's remaining balance is now updated.",
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
 * Result screen for the "Pay Due Amount" (partial payment) gateway return —
 * a separate, deliberately lighter component from PaymentResultView (which
 * is for the ORIGINAL checkout/Purchase flow). This never fires the Purchase
 * pixel: the order's Purchase event already fired at checkout time, so
 * re-firing it here for a due-amount top-up would double-count the sale and
 * report the wrong (partial) amount as if it were the whole order.
 */
export default function PartialPaymentResultView({
  outcome,
  gatewayName,
  gatewayLogo,
  amount,
  trxID,
}: {
  outcome: PartialPaymentOutcome;
  gatewayName: string;
  gatewayLogo: StaticImageData;
  amount?: string;
  trxID?: string;
}) {
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

        {(amount || trxID) && (
          <div className="bg-gray-50 dark:bg-[#2E2A26] rounded-2xl p-4 text-left text-sm space-y-1.5 border border-gray-100 dark:border-gray-800">
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                <span className="font-bold text-gray-900 dark:text-white">৳{amount}</span>
              </div>
            )}
            {trxID && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                <span className="font-bold text-gray-900 dark:text-white">{trxID}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/profile?tab=Orders"
            className="w-full py-3 rounded-xl bg-[#7B4F1E] hover:bg-[#684219] text-white font-bold text-sm transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
