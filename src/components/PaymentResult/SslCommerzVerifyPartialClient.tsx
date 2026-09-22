"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PartialPaymentResultView, { type PartialPaymentOutcome } from "@/components/PaymentResult/PartialPaymentResultView";
import { api } from "@/lib/api";
import SslLogo from "@/images/ssl-logo.svg";

interface SslVerifyPartialResponse {
  statusCode: number;
  status: string;
  card_type?: string;
  tran_id?: string;
  amount?: string;
}

const LoadingScreen = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
  </div>
);

/**
 * Confirms the due-amount payment with
 * GET /api/tokenized/v1/sslcommerz-verify-partial/{payState}/{orderToken}
 * before trusting the route's own outcome — same pattern as
 * SslCommerzVerifyClient for the full-checkout flow. Only the success
 * route's outcome can be downgraded by a failed verify (fails closed).
 */
export default function SslCommerzVerifyPartialClient({
  orderToken,
  payState,
  routeOutcome,
}: {
  orderToken: string;
  payState: "payment-success" | "payment-error" | "payment-cancel";
  routeOutcome: PartialPaymentOutcome;
}) {
  const [verifying, setVerifying] = useState(true);
  const [outcome, setOutcome] = useState<PartialPaymentOutcome>(routeOutcome);
  const [amount, setAmount] = useState<string | undefined>();
  const [trxID, setTrxID] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<SslVerifyPartialResponse>(
          `/api/tokenized/v1/sslcommerz-verify-partial/${payState}/${encodeURIComponent(orderToken)}`,
          // Reached straight from SSLCommerz's own redirect — an expired or
          // missing session here is normal, not the site-wide session-expired modal.
          { suppressSessionExpired: true },
        );
        if (cancelled) return;

        const valid = res?.statusCode === 200 && res?.status === "VALID";
        if (routeOutcome === "success") {
          setOutcome(valid ? "success" : "error");
        }
        if (res?.tran_id) setTrxID(res.tran_id);
        if (res?.amount) setAmount(res.amount);
      } catch (err) {
        console.error(`[SslCommerzVerifyPartial:${payState}] verify call failed:`, err);
        // Fails closed: a verify call that errors out must never leave the
        // success route's optimistic default state standing.
        if (!cancelled && routeOutcome === "success") setOutcome("error");
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderToken, payState]);

  if (verifying) return <LoadingScreen />;

  return (
    <PartialPaymentResultView
      outcome={outcome}
      gatewayName="SSLCommerz"
      gatewayLogo={SslLogo}
      amount={amount}
      trxID={trxID}
    />
  );
}
