import type { Metadata } from "next";
import FooterPagesCom from "@/components/share/FooterPagesCom";

export const metadata: Metadata = {
  title: "Exchange Policy",
  description:
    "Read Dazzle's Exchange Policy before booking your product. Learn about advance payment, delivery timeline, order confirmation, cancellation, and refund terms for pre-orders.",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ExchangePolicy() {
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      <FooterPagesCom endpoint="exchange_policy" fallbackTitle="Exchange Policy" />
    </div>
  );
}