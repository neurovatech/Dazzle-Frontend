"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PartialPaymentResultView, { type PartialPaymentOutcome } from "@/components/PaymentResult/PartialPaymentResultView";
import BkashLogo from "@/images/bKash-Logo.svg";

/**
 * Fallback for the malformed bKash redirect shape middleware.ts rewrites
 * here (order reference glued onto the path with no separator — see
 * docs/payment-callback-pages-backend-contract.txt, section 4). Without a
 * real `/bkash-verify-partial/{orderToken}` path segment there's no token to
 * call the verify endpoint with, so this only shows the outcome the
 * redirect's own `status` implies — same limitation /bkash-verify/page.tsx
 * has for the full-checkout flow.
 */
function BkashVerifyPartialContent() {
  const params = useSearchParams();
  const statusParam = (params.get("status") || "").toLowerCase();

  const outcome: PartialPaymentOutcome =
    statusParam === "success"
      ? "success"
      : statusParam === "cancel" || statusParam === "cancelled"
        ? "cancel"
        : "error";

  return <PartialPaymentResultView outcome={outcome} gatewayName="bKash" gatewayLogo={BkashLogo} />;
}

export default function BkashVerifyPartialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
        </div>
      }
    >
      <BkashVerifyPartialContent />
    </Suspense>
  );
}
