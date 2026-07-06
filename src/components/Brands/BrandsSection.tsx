import BrandCard from "./BrandCard";
import { api } from "@/lib/api";

export interface Brand {
  is_active: boolean;
  id: string;
  label: string;
  logo: string;
  slug: string;
}

export default async function BrandsSection() {
  let brands: Brand[] = [];
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/brands?order=1&page=1&limit=8",
      { cache: "no-store" }
    );

    const list = Array.isArray(res) ? res : res?.data ?? [];
    brands = list
      .filter((b) => b.is_active === true)
      .map((b) => ({
        id: String(b.uuid),
        label: String(b.brand_name ?? "Unknown Brand"),
        logo: b.thumbnail_img ? String(b.thumbnail_img) : "",
        slug: String(b.brand_slug ?? b.brand_name ?? ""),
        is_active: Boolean(b.is_active),
        is_featured: Boolean(b.is_featured),
      }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
  }

  return <BrandCard brands={brands} />;
}

