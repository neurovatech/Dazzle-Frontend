import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Connectivity Solutions - Dazzle",
  description: "Equip your business with premium smartphones, laptops, and gadget connectivity from Dazzle. Send your corporate inquiries or book a meeting.",
};

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
