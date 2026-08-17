import Link from "next/link";
import { api } from "@/lib/api";
import ShopBrand, { Brand } from "./ShopBrand";

export default async function ShopBrandSectionCom() {
  let brands: Brand[] = [];
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/brands?order=0&page=1&limit=16",
      { next: { revalidate: 60 } },
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
    console.error("Error fetching brands:", error);
  }

  return (
    <div className="md:px-12.5 px-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Shop by Brand
        </h3>
        <Link href="/brands" className="text-sm font-medium bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] hover:text-[#CB843B] transition-colors duration-300">
          See all
        </Link>
      </div>
      <ShopBrand brands={brands} />
    </div>
  );
}
