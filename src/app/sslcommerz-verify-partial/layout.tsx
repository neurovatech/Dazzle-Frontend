import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component pages — metadata must live in this Server Component
 * layout. Applies to all three payment-success/payment-error/payment-cancel
 * routes underneath. Same reasoning as /sslcommerz-verify.
 */
export const metadata: Metadata = {
  title: "Payment Status",
  ...NOINDEX_METADATA,
};

export default function SslcommerzVerifyPartialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
