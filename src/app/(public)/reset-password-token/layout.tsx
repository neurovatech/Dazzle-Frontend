import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo-config";

/**
 * The page below is a Client Component and therefore cannot export metadata,
 * so this Server Component layout supplies it.
 *
 * SECURITY: these URLs carry a password-reset token in the path. If they were
 * ever indexed, the tokens would become publicly searchable. `noindex` here is
 * defense-in-depth alongside the robots.txt disallow rule.
 */
export const metadata: Metadata = {
  title: "Reset Password",
  ...NOINDEX_METADATA,
};

export default function ResetPasswordTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
