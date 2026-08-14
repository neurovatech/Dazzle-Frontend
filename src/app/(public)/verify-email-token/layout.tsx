import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * The page below is a Client Component and therefore cannot export metadata,
 * so this Server Component layout supplies it.
 *
 * SECURITY: these URLs carry an email-verification token in the path. Indexing
 * them would expose the tokens publicly. `noindex` here is defense-in-depth
 * alongside the robots.txt disallow rule.
 */
export const metadata: Metadata = {
  title: "Verify Email",
  ...NOINDEX_METADATA,
};

export default function VerifyEmailTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
