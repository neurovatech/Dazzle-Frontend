import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get In Touch & Support Center",
  description: "Contact Dazzle customer support. Reach out for order issues, product questions, corporate inquiries, or store address queries.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
