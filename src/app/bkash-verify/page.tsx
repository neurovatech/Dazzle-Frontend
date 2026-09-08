"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentResultView, { type PaymentOutcome } from "@/components/PaymentResult/PaymentResultView";
import BkashLogo from "@/images/bKash-Logo.svg";

/**
 * bKash's tokenized-checkout redirect appends `?paymentID=...&status=...`
 * (values: success / failure / cancel) to whatever callback URL is
 * configured with bKash — this page is that URL. `orderNo` is expected too
 * (our own backend's own addition to the redirect, not bKash's) so the
 * success card can show real order/amount details via /order-tracking.
 *
 * Deliberately fails closed: anything other than an explicit
 * `status=success` renders the failure state, never the success one — see
 * docs/payment-callback-pages-backend-contract.txt for the exact contract
 * this assumes and what to confirm with the backend.
 */
function BkashVerifyContent() {
  const params = useSearchParams();
  const statusParam = (params.get("status") || "").toLowerCase();
  const orderNo = params.get("orderNo") || params.get("order") || params.get("orderId");

  const outcome: PaymentOutcome =
    statusParam === "success"
      ? "success"
      : statusParam === "cancel" || statusParam === "cancelled"
        ? "cancel"
        : "error";

  return (
    <PaymentResultView
      outcome={outcome}
      orderNo={orderNo}
      gatewayName="bKash"
      gatewayLogo={BkashLogo}
    />
  );
}

export default function BkashVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
        </div>
      }
    >
      <BkashVerifyContent />
    </Suspense>
  );
}
