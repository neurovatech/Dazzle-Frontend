import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component pages — metadata must live in this Server Component
 * layout. Applies to all three payment-success/payment-error/payment-cancel
 * routes underneath. No search value, and the query string can carry a
 * transaction id — same reasoning as /order-tracking.
 */
export const metadata: Metadata = {
  title: "Payment Status",
  ...NOINDEX_METADATA,
};

export default function SslcommerzVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
