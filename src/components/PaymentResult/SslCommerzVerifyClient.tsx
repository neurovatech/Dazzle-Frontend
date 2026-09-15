"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PaymentResultView, { type PaymentOutcome } from "@/components/PaymentResult/PaymentResultView";
import { api } from "@/lib/api";
import SslLogo from "@/images/ssl-logo.svg";

interface SslVerifyResponse {
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
 * Confirms the payment with GET /api/tokenized/v1/sslcommerz-verify/{payState}/{orderToken}
 * before trusting the route's own outcome. `payState` matches the URL
 * segment (payment-success/payment-error/payment-cancel) SSLCommerz was
 * given as the success_url/fail_url/cancel_url.
 *
 * Only the success route's outcome can be downgraded by a failed verify
 * (fails closed — a bad/expired verify never upgrades to "success"); the
 * error/cancel routes keep their own meaning regardless, since there's
 * nothing to "confirm up" from those.
 */
export default function SslCommerzVerifyClient({
  orderToken,
  payState,
  routeOutcome,
}: {
  orderToken: string;
  payState: "payment-success" | "payment-error" | "payment-cancel";
  routeOutcome: PaymentOutcome;
}) {
  const [verifying, setVerifying] = useState(true);
  const [outcome, setOutcome] = useState<PaymentOutcome>(routeOutcome);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [verifiedAmount, setVerifiedAmount] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<SslVerifyResponse>(
          `/api/tokenized/v1/sslcommerz-verify/${payState}/${encodeURIComponent(orderToken)}`,
          // Reached straight from SSLCommerz's own redirect — an expired or
          // missing session here is normal, not a reason to show the
          // site-wide "session expired, log out" modal.
          { suppressSessionExpired: true },
        );
        if (cancelled) return;

        const valid = res?.statusCode === 200 && res?.status === "VALID";
        if (routeOutcome === "success") {
          setOutcome(valid ? "success" : "error");
        }
        // tran_id is the real DZL-XXXXX order number — feeds PaymentResultView's
        // own /order-tracking lookup for the full order/amount card.
        if (res?.tran_id) setOrderNo(res.tran_id);
        if (res?.amount) setVerifiedAmount(res.amount);
      } catch (err) {
        console.error(`[SslCommerzVerify:${payState}] verify call failed:`, err);
        // Couldn't confirm — fails closed: a verify call that errors out
        // must never leave the success route's optimistic default state
        // standing, or a user could "confirm" a payment just by visiting
        // the success URL while the backend is unreachable.
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
    <PaymentResultView
      outcome={outcome}
      orderNo={orderNo}
      gatewayName="SSLCommerz"
      gatewayLogo={SslLogo}
      verifiedAmount={verifiedAmount}
    />
  );
}
