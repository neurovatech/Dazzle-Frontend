import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/share/GlobalProductCard";
import { api } from "@/lib/api";
export interface Brand {
  is_active: boolean;
  id: string;
  label: string;
  logo: string;
  slug: string;
}

export default async function ShopBrand() {
  let brands: Brand[] = [];
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/brands?order=0&page=1&limit=8",
      { cache: "no-store" },
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
        is_featured: Boolean(b.is_featured),
      }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
  }

  return (
    <div className="md:px-12.5 px-4">
      <div className="flex justify-between items-center ">
        <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          {" "}
          Shop by Brand{" "}
        </h3>
        <Link href="/brands" className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 ">
          See all
        </Link>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-1">
          {brands?.map((item) => (
            <Link
              key={item.id}
              href={`/brands/${item.slug}`}
              className="flex flex-col items-center  w-full"
            >
              <div className="relative w-full aspect-square bg-white  rounded-4xl p-3 md:p-8 transition-all duration-300 hover:scale-105 hover:bg-[#fcf5ed] hover:border-[#E9CCAE] border border-[#F5F5F5]">
                <div className="relative w-full h-full">
                  <Image
                    src={item.logo}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 25vw, 20vw"
                    className="object-contain transition-transform duration-300 hover:scale-110"
                  />
                </div>
              </div>

              <h5 className="mt-2 text-center text-[10px] lg:text-sm font-medium text-primary">
                {item.label}
              </h5>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}