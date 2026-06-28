import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Your Feedback - Dazzle",
  description: "Share your experience with Dazzle. Send your reviews, ratings, and feedback to help us serve you better.",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
