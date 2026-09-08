import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component page — metadata must live in this Server Component layout.
 * A gateway-return page has no search value and its query string can carry a
 * transaction id, same reasoning as /order-tracking.
 */
export const metadata: Metadata = {
  title: "Payment Status",
  ...NOINDEX_METADATA,
};

export default function BkashVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
