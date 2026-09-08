"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentResultView from "@/components/PaymentResult/PaymentResultView";
import SslLogo from "@/images/ssl-logo.svg";

/** SSLCommerz redirects here when the customer cancelled the payment. See payment-success/page.tsx for the shared design notes. */
function CancelContent() {
  const params = useSearchParams();
  const orderNo = params.get("orderNo") || params.get("order") || params.get("tran_id");

  return (
    <PaymentResultView outcome="cancel" orderNo={orderNo} gatewayName="SSLCommerz" gatewayLogo={SslLogo} />
  );
}

export default function SslPaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
