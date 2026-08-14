// import type { Metadata } from "next";
// import FaqCom from "./FaqCom";

// export const metadata: Metadata = {
//   title: "FAQ | Dazzle",
//   description:
//     "Frequently asked questions about Dazzle — Bangladesh's leading smartphone and accessories retailer. Store locations, products, brands, warranty, and online ordering.",
// };

// export default function Page() {
//   return <FaqCom />;
// }




import type { Metadata } from "next";
import FooterPagesCom from "@/components/share/FooterPagesCom";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Dazzle — Bangladesh's leading smartphone and accessories retailer. Store locations, products, brands, warranty, and online ordering.",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function RefundPolicy() {
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      <FooterPagesCom endpoint="faq" fallbackTitle="FAQ" />
    </div>
  );
}