"use client";

import { useState } from "react";
import ProductCard from "./ProductCrad";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
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
  const [adding, setAdding] = useState(false);

  if (!products || products.length === 0) return null;

  // Use raw numeric prices if available, else parse from display string
  const parsePrice = (p: Product, field: "price" | "originalPrice") => {
    if (field === "price")
      return p.rawPrice ?? Number((p.price ?? "").replace(/[^\d.]/g, "")) ?? 0;
    return (
      p.rawOriginalPrice ??
      Number((p.originalPrice ?? p.price ?? "").replace(/[^\d.]/g, "")) ??
      0
    );
  };

  const totalPrice = products.reduce((s, p) => s + parsePrice(p, "price"), 0);
  const totalOriginalPrice = products.reduce(
    (s, p) => s + parsePrice(p, "originalPrice"),
    0,
  );

  const availableCount = products.filter((p) => p.inStock).length;

  const cartItems = useAppSelector((state) => state.cart.items);

  const handleAddToCartAll = async () => {
    const inStockItems = products.filter((p) => p.inStock);
    if (inStockItems.length === 0) {
      toast.error("No available products to add.");
      return;
    }

    setAdding(true);
    try {
      let addedCount = 0;
      for (const p of inStockItems) {
        const pUuid = (p.productUuid || p.id || "").trim();
        let variantUUID = pUuid;  // default fallback
        let finalPrice = parsePrice(p, "price");
        let finalRegPrice = parsePrice(p, "originalPrice");
        let finalImage = p.image || "";

        if (pUuid) {
          try {
            const res = await api.get<DefaultVariantResponse>(
              `/get-default-variant/${pUuid}?priceSort=1&userDefine=0`
            );
            if (res?.data) {
              // isTba true হলে এই product skip করো
              if (res.data.isTba) {
                console.log(`[FrequentlyBoughtTogether] Skipping ${pUuid} — isTba: true`);
                continue;
              }
              variantUUID = res.data.variantUUID || variantUUID;
              finalPrice = res.data.offerPrice ?? finalPrice;
              finalRegPrice = res.data.regularPrice ?? finalRegPrice;
              if (res.data.thumbnailURL) {
                finalImage = res.data.thumbnailURL;
              }
            }
          } catch (err) {
            console.error(`[FrequentlyBoughtTogether] get-default-variant failed for ${pUuid}:`, err);
          }
        }

        const isAlreadyInCart = cartItems.some(
          (item) => item.id === variantUUID || item.variantUuid === variantUUID
        );

        if (isAlreadyInCart) {
          continue;
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
          })
        );
        addedCount++;
      }

      if (addedCount > 0) {
        toast.success(`${addedCount} item${addedCount > 1 ? "s" : ""} added to cart! 🛒`);
        if (onAddToCart) {
          onAddToCart();
        }
      } else {
        toast.error("Products already added to cart!");
      }
    } catch (err) {
      console.error("[FrequentlyBoughtTogether] handleAddToCartAll error:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="py-4 w-full">
      <h3 className="py-3 font-bold">Frequently Buy Together</h3>

      <div className="flex flex-wrap items-stretch gap-2 sm:gap-3 w-full">
        {products.map((prod, index) => (
          <div key={index} className="flex items-stretch gap-2 sm:gap-3 min-w-0">
            <div className="w-[150px] sm:w-[180px] shrink-0">
              <ProductCard {...prod} />
            </div>
            {index < products.length - 1 && (
              <span className="text-xl sm:text-2xl text-gray-400 dark:text-gray-500 font-light select-none shrink-0 flex items-center">
                +
              </span>
            )}
          </div>
        ))}

        <span className="text-xl sm:text-2xl text-gray-400 dark:text-gray-500 font-light select-none shrink-0 flex items-center">
          =
        </span>

        <div className="flex flex-col items-start sm:items-center px-1 sm:px-2 shrink-0 justify-center">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {products.length} Items
          </span>
          <span className="text-orange-500 font-bold text-base sm:text-lg whitespace-nowrap">
            BDT {totalPrice.toLocaleString("en-US")}
          </span>
          {totalOriginalPrice > totalPrice && (
            <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm line-through whitespace-nowrap">
              BDT {totalOriginalPrice.toLocaleString("en-US")}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleAddToCartAll}
        disabled={availableCount === 0 || adding}
        className={`shrink-0 px-6 mt-4 sm:px-8 py-3 text-sm sm:text-base font-semibold rounded-full transition-colors duration-150 whitespace-nowrap shadow-sm
          ${availableCount === 0 || adding
            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
            : "bg-[#E9CCAE] hover:bg-[#D4B89A] active:bg-[#C0A486] text-black cursor-pointer"
          }`}
      >
        {adding ? "Adding..." : `Add ${availableCount} item${availableCount !== 1 ? "s" : ""} to cart`}
      </button>
    </div>
  );
}
