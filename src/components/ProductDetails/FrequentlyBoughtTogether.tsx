"use client";

import { useState } from "react";
import ProductCard from "./ProductCrad";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { trackAddToCart } from "@/lib/analytics/pixelEvents";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface DefaultVariantResponse {
  statusCode: number;
  status: string;
  message?: string;
  data?: {
    productUUID: string;
    variantUUID: string;
    regularPrice: number;
    offerPrice: number;
    wholeSalePrice: number;
    thumbnailURL: string;
    isTba: boolean;
  };
}

interface Product {
  id?: string;
  productUuid?: string;
  image?: string;
  name?: string;
  inStock?: boolean;
  price?: string;
  originalPrice?: string;
  rawPrice?: number;
  rawOriginalPrice?: number;
  slug?: string;
}

interface FrequentlyBoughtTogetherProps {
  products: Product[];
  onAddToCart?: () => void;
}

export default function FrequentlyBoughtTogether({
  products,
  onAddToCart,
}: FrequentlyBoughtTogetherProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  // Which card's Add button is mid-flight — keyed by the same id used below,
  // so only that one card shows "Adding..." instead of the whole section.
  const [addingId, setAddingId] = useState<string | null>(null);

  if (!products || products.length === 0) return null;

  const parsePrice = (p: Product, field: "price" | "originalPrice") => {
    if (field === "price")
      return p.rawPrice ?? Number((p.price ?? "").replace(/[^\d.]/g, "")) ?? 0;
    return (
      p.rawOriginalPrice ??
      Number((p.originalPrice ?? p.price ?? "").replace(/[^\d.]/g, "")) ??
      0
    );
  };

  /**
   * Adds one card's product to the cart.
   *
   * The variant to add isn't known up front — same as ProductCardBuy's
   * add-to-cart flow — so it's resolved via get-default-variant right
   * before the dispatch rather than assumed from the product uuid.
   */
  const handleAddOne = async (p: Product) => {
    const pUuid = (p.productUuid || p.id || "").trim();
    const cardKey = pUuid || p.name || "";
    setAddingId(cardKey);
    try {
      let variantUUID = pUuid;
      let finalPrice = parsePrice(p, "price");
      let finalRegPrice = parsePrice(p, "originalPrice");
      let finalImage = p.image || "";

      if (pUuid) {
        try {
          const res = await api.get<DefaultVariantResponse>(
            `/get-default-variant/${pUuid}?priceSort=1&userDefine=0`,
          );
          if (res?.data) {
            if (res.data.isTba) {
              toast.error(`${p.name || "This item"} is not available right now.`);
              return;
            }
            variantUUID = res.data.variantUUID || variantUUID;
            finalPrice = res.data.offerPrice ?? finalPrice;
            finalRegPrice = res.data.regularPrice ?? finalRegPrice;
            if (res.data.thumbnailURL) {
              finalImage = res.data.thumbnailURL;
            }
          }
        } catch (err) {
          console.error(
            `[FrequentlyBoughtTogether] get-default-variant failed for ${pUuid}:`,
            err,
          );
        }
      }

      const isAlreadyInCart = cartItems.some(
        (item) => item.id === variantUUID || item.variantUuid === variantUUID,
      );
      if (isAlreadyInCart) {
        toast.error(`${p.name || "This item"} is already in your cart.`);
        return;
      }

      dispatch(
        addToCart({
          id: variantUUID,
          productUuid: pUuid,
          variantUuid: variantUUID,
          name: p.name || "Product",
          brand: "",
          image: finalImage,
          price: finalPrice,
          originalPrice: finalRegPrice,
          quantity: 1,
          inStock: true,
          slug: p.slug || "",
        }),
      );
      trackAddToCart({ id: pUuid || variantUUID, name: p.name || "Product", price: finalPrice });
      toast.success(`${p.name || "Product"} added to cart! 🛒`);
      onAddToCart?.();
    } catch (err) {
      console.error("[FrequentlyBoughtTogether] handleAddOne error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="py-4 w-full">
      <h3 className="py-3 font-bold">Frequently Buy Together</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {products.map((prod, index) => {
          const cardKey = (prod.productUuid || prod.id || prod.name || String(index)).trim();
          // Matched on productUuid, not the cart row's own id/variantUuid —
          // handleAddOne can resolve a different variant than prod.id via
          // get-default-variant, but the original productUuid is always
          // preserved on the dispatched cart line.
          const pUuid = (prod.productUuid || prod.id || "").trim();
          const alreadyInCart = pUuid
            ? cartItems.some((item) => item.productUuid === pUuid)
            : false;
          return (
            <ProductCard
              key={cardKey}
              {...prod}
              onAdd={() => handleAddOne(prod)}
              adding={addingId === cardKey}
              added={alreadyInCart}
            />
          );
        })}
      </div>
    </div>
  );
}
