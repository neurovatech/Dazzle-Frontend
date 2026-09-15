"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentResultView, { type PaymentOutcome } from "@/components/PaymentResult/PaymentResultView";
import { api } from "@/lib/api";
import BkashLogo from "@/images/bKash-Logo.svg";

interface BkashVerifyResponse {
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
 * `/bkash-verify/{orderToken}`. The URL's own `status` is only a hint — this
 * calls the real GET /api/tokenized/v1/bkash-verify/{orderToken} endpoint to
 * confirm what actually happened before ever showing "success", so a user
 * can't fake success by editing the URL.
 */
function BkashVerifyContent({ orderToken }: { orderToken: string }) {
  const params = useSearchParams();
  const statusParam = (params.get("status") || "").toLowerCase();
  const paymentID = params.get("paymentID") || "";
  const apiVersion = params.get("apiVersion") || "";
  const orderNoParam = params.get("orderNo") || params.get("order") || params.get("orderId");

  const urlOutcome: PaymentOutcome =
    statusParam === "cancel" || statusParam === "cancelled" ? "cancel" : "error";

  const [verifying, setVerifying] = useState(true);
  const [outcome, setOutcome] = useState<PaymentOutcome>(urlOutcome);
  const [verifiedAmount, setVerifiedAmount] = useState<string | undefined>();
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
        const res = await api.get<BkashVerifyResponse>(
          `/api/tokenized/v1/bkash-verify/${encodeURIComponent(orderToken)}${query ? `?${query}` : ""}`,
          // This page is reached straight from bKash's own redirect — the
          // visitor's session may well have expired mid-payment, or they
          // may be a guest. Either way it's a normal state here, not cause
          // to blast the site-wide "session expired, log out" modal.
          { suppressSessionExpired: true },
        );
        if (cancelled) return;

        const success =
          res?.statusCode === 200 &&
          res?.status === "0000" &&
          (res?.transactionStatus || "").toLowerCase() === "completed";

        if (success) {
          setOutcome("success");
          setVerifiedAmount(res.amount);
          setTrxID(res.trxID);
        } else {
          setOutcome(urlOutcome);
        }
      } catch (err) {
        console.error("[BkashVerify] verify call failed:", err);
        // Couldn't confirm with the backend — fails closed on the redirect's
        // own status, same behaviour as before this endpoint was wired in.
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
    <PaymentResultView
      outcome={outcome}
      orderNo={orderNoParam || orderToken}
      gatewayName="bKash"
      gatewayLogo={BkashLogo}
      verifiedAmount={verifiedAmount}
      trxID={trxID}
    />
  );
}

export default function BkashVerifyClient({ orderToken }: { orderToken: string }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BkashVerifyContent orderToken={orderToken} />
    </Suspense>
  );
}
