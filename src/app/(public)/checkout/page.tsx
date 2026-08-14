import type { Metadata } from "next";
import CheckoutPageCom from "@/components/Cart/CheckoutPageCom";
import { NOINDEX_METADATA } from "@/lib/seo-config";

// Transactional page — must never be indexed.
export const metadata: Metadata = {
  title: "Checkout",
  ...NOINDEX_METADATA,
};

function Checkout() {
  return (
    <div>
      <CheckoutPageCom />
    </div>
  )
}

export default Checkout
