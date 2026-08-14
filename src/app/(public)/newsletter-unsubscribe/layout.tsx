import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * Client Component page — metadata must live in this Server Component layout.
 * Unsubscribe links are per-recipient and must not be indexed.
 */
export const metadata: Metadata = {
  title: "Newsletter Unsubscribe",
  ...NOINDEX_METADATA,
};

export default function NewsletterUnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
