import type { Metadata } from "next";
import FaqCom from "./FaqCom";

export const metadata: Metadata = {
  title: "FAQ | Dazzle",
  description:
    "Frequently asked questions about Dazzle — Bangladesh's leading smartphone and accessories retailer. Store locations, products, brands, warranty, and online ordering.",
};

export default function Page() {
  return <FaqCom />;
}