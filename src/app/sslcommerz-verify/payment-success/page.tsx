"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentResultView from "@/components/PaymentResult/PaymentResultView";
import SslLogo from "@/images/ssl-logo.svg";

/**
 * SSLCommerz redirects here only on a successful payment — the route itself
 * (not a query param) is what tells us the outcome, unlike bKash's single
 * callback URL. `orderNo` (or SSLCommerz's own `tran_id`, used as our order
 * reference) is read from the query string so the card can show real
 * order/amount details via /order-tracking. See
 * docs/payment-callback-pages-backend-contract.txt for the exact contract
 * this assumes.
 */
function SuccessContent() {
  const params = useSearchParams();
  const orderNo = params.get("orderNo") || params.get("order") || params.get("tran_id");

  return (
    <PaymentResultView outcome="success" orderNo={orderNo} gatewayName="SSLCommerz" gatewayLogo={SslLogo} />
  );
}

export default function SslPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
