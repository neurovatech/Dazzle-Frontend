import type { Metadata } from "next";
import FooterPagesCom from "@/components/share/FooterPagesCom";

export const metadata: Metadata = {
  title: "Product Disclaimer Policy",
  description:
    "Read Dazzle's Product Disclaimer Policy before booking your product. Learn about the terms and conditions associated with our products.",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function MembershipPolicy() {
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      <FooterPagesCom endpoint="product_disclaimer_policy" fallbackTitle="Product Disclaimer Policy" />
    </div>
  );
}