import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade-In Your Device - Dazzle",
  description: "Get instant quotes and exchange value for your old smartphone, laptop, tablet, or smartwatch. Secure and eco-friendly device trade-in at Dazzle.",
};

export default function TradeInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
