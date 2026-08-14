import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component page — metadata must live in this Server Component layout.
 * Order tracking is per-user and has no search value.
 */
export const metadata: Metadata = {
  title: "Order Tracking",
  ...NOINDEX_METADATA,
};

export default function OrderTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
