import type { Metadata } from "next";
import EmiPolicyCom from "@/components/EmiPolicy/EmiPolicyCom";

export const metadata: Metadata = {
  title: "EMI Policy - Dazzle",
  description: "Check the EMI Policy of Dazzle. Learn about offline and online credit card EMI options, payment charges, and supported banks for easy installments.",
};
export default function EMIPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8">
      <EmiPolicyCom />
    </div>
  );
}
