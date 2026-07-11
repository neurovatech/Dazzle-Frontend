import type { Metadata } from "next";
import FooterPagesCom from "@/components/share/FooterPagesCom";

export const metadata: Metadata = {
  title: "Refund Policy - Dazzle",
  description:
    "Read Dazzle's Refund Policy before booking your product. Learn about advance payment, delivery timeline, order confirmation, cancellation, and refund terms for pre-orders.",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function RefundPolicy() {
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      <FooterPagesCom endpoint="refund_policy" fallbackTitle="Refund Policy" />
    </div>
  );
}