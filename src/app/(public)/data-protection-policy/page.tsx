import type { Metadata } from "next";
import FooterPagesCom from "@/components/share/FooterPagesCom";

export const metadata: Metadata = {
  title: "Data Protection Policy",
  description:
    "Read Dazzle's Data Protection Policy before booking your product. Learn about advance payment, delivery timeline, order confirmation, cancellation, and refund terms for pre-orders.",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DataProtectionPolicy() {
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      <FooterPagesCom endpoint="data_protection_policy" fallbackTitle="Data Protection Policy" />
    </div>
  );
}