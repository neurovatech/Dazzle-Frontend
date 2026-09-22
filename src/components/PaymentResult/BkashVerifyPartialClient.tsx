"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PartialPaymentResultView, { type PartialPaymentOutcome } from "@/components/PaymentResult/PartialPaymentResultView";
import { api } from "@/lib/api";
import BkashLogo from "@/images/bKash-Logo.svg";

interface BkashVerifyPartialResponse {
  statusCode: number;
  status: string;
  statusMessage?: string;
  paymentID?: string;
  trxID?: string;
  amount?: string;
  transactionStatus?: string;
}

const LoadingScreen = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <Loader2 className="animate-spin text-[#7B4F1E]" size={32} />
  </div>
);

/**
 * bKash's tokenized-checkout redirect appends `?paymentID=...&status=...` to
 * `/bkash-verify-partial/{orderToken}` (same shape as the full-payment
 * `/bkash-verify/{orderToken}` — see BkashVerifyClient). The URL's own
 * `status` is only a hint — this calls the real
 * GET /api/tokenized/v1/bkash-verify-partial/{orderToken} endpoint to
 * confirm what actually happened before showing "success".
 */
function BkashVerifyPartialContent({ orderToken }: { orderToken: string }) {
  const params = useSearchParams();
  const statusParam = (params.get("status") || "").toLowerCase();
  const paymentID = params.get("paymentID") || "";
  const apiVersion = params.get("apiVersion") || "";

  const urlOutcome: PartialPaymentOutcome =
    statusParam === "cancel" || statusParam === "cancelled" ? "cancel" : "error";

  const [verifying, setVerifying] = useState(true);
  const [outcome, setOutcome] = useState<PartialPaymentOutcome>(urlOutcome);
  const [amount, setAmount] = useState<string | undefined>();
  const [trxID, setTrxID] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (paymentID) qs.set("paymentID", paymentID);
        if (statusParam) qs.set("status", statusParam);
        if (apiVersion) qs.set("apiVersion", apiVersion);
        const query = qs.toString();
        const res = await api.get<BkashVerifyPartialResponse>(
          `/api/tokenized/v1/bkash-verify-partial/${encodeURIComponent(orderToken)}${query ? `?${query}` : ""}`,
          // Reached straight from bKash's own redirect — an expired/missing
          // session here is normal, not cause to show the site-wide
          // "session expired, log out" modal.
          { suppressSessionExpired: true },
        );
        if (cancelled) return;

        const success =
          res?.statusCode === 200 &&
          res?.status === "0000" &&
          (res?.transactionStatus || "").toLowerCase() === "completed";

        if (success) {
          setOutcome("success");
          setAmount(res.amount);
          setTrxID(res.trxID);
        } else {
          setOutcome(urlOutcome);
        }
      } catch (err) {
        console.error("[BkashVerifyPartial] verify call failed:", err);
        // Couldn't confirm with the backend — fails closed on the redirect's
        // own status.
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderToken]);

  if (verifying) return <LoadingScreen />;

  return (
    <PartialPaymentResultView
      outcome={outcome}
      gatewayName="bKash"
      gatewayLogo={BkashLogo}
      amount={amount}
      trxID={trxID}
    />
  );
}

export default function BkashVerifyPartialClient({ orderToken }: { orderToken: string }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BkashVerifyPartialContent orderToken={orderToken} />
    </Suspense>
  );
}
