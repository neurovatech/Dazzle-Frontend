"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import RelatedProduct from "./RelatedProduct";
import NoImg from "@/images/no_images.png";
import { sortInStockFirst } from "@/lib/sortProducts";

// ── API response shape from /products?categorySlug=... ──────────────
interface Thumbnail {
  mediaFileUrl?: string;
  mediafileUrl?: string;
}

interface ProductItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: Thumbnail | Thumbnail[] | null;
}

interface ProductListResponse {
  totalCount: number;
  data: ProductItem[];
}

export interface ProductCardItem {
  uuid: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  isBestDeal: boolean;
  inStock: boolean;
  image: string;
}

// ── Helper: thumbnail URL extract ───────────────────────────────────
function getThumb(thumbnails: ProductItem["thumbnails"]): string {
  if (!thumbnails) return NoImg.src;
  if (Array.isArray(thumbnails)) {
    return (thumbnails[0] as Thumbnail)?.mediaFileUrl
        ?? (thumbnails[0] as Thumbnail)?.mediafileUrl
        ?? NoImg.src;
  }
  return (thumbnails as Thumbnail).mediaFileUrl
      ?? (thumbnails as Thumbnail).mediafileUrl
      ?? NoImg.src;
}

interface RelatedProductSectionComProps {
  categorySlug?: string;
}

export default function RelatedProductSectionCom({ categorySlug }: RelatedProductSectionComProps) {
  console.log("RelatedProductSectionCom categorySlug:", categorySlug);
  const { data, isLoading } = useQuery<ProductListResponse>({
    queryKey: ["related-products", categorySlug],
    queryFn: () =>
      api.get<ProductListResponse>(
        `/products?brandSlug=${categorySlug ?? ""}`
      ),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  });

  const products: ProductCardItem[] = sortInStockFirst(data?.data ?? []).map((item) => ({
    uuid:          item.productUuid,
    title:         item.productName,
    slug:          item.productSlug,
    price:         item.discountedPrice,
    originalPrice: item.regularPrice,
    discount:      Math.round(item.disRate ?? 0),
    badge:         item.productBadge ?? "",
    isBestDeal:    false,
    inStock:       !item.isTba,
    image:         getThumb(item.thumbnails),
  }));

  if (!categorySlug) return null;

  if (isLoading) {
    return (
      <div className="px-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="lg:px-4">
      <RelatedProduct products={products} />
    </div>
  );
}
