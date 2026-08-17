import { api } from "@/lib/api";
import ShopBrand from "./ShopBrand";
import type { Brand } from "./ShopBrand";

export default async function ShopBrandSectionCom() {
  let brands: Brand[] = [];

  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/brands?order=0&page=1&limit=20",
      { next: { revalidate: 60 } }
    );

    const list = Array.isArray(res) ? res : (res?.data ?? []);
    brands = list
      .filter((b) => b.is_active === true)
      .map((b) => ({
        id: String(b.uuid),
        label: String(b.brand_name ?? "Unknown Brand"),
        logo: b.thumbnail_img ? String(b.thumbnail_img) : "",
        slug: String(b.brand_slug ?? b.brand_name ?? ""),
        is_active: Boolean(b.is_active),
      }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching brands:", error);
    }
  }

  if (brands.length === 0) return null;

  return <ShopBrand brands={brands} />;
}
