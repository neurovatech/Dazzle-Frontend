import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component page — metadata must live in this Server Component layout.
 * Same reasoning as /bkash-verify: a gateway-return page has no search value
 * and its query string can carry a transaction id.
 */
export const metadata: Metadata = {
  title: "Payment Status",
  ...NOINDEX_METADATA,
};

export default function BkashVerifyPartialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
