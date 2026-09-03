import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import React from "react";
import { api } from "@/lib/api";
import TermsPagesCom from "./TermsPagesCom"
export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions of Dazzle. Review the user guidelines, account security policies, information collection rules, and liability statements.",
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Terms Conditions", href: "#" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TermsConditions() {
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/pages/terms-condition",
      { next: { revalidate: 5 } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
  }
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4 pt-5">
        {/* Breadcrumb */}
        <div className="max-w-350 mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Title */}
        <TermsPagesCom />
      </div>
    </div>
  );
}
