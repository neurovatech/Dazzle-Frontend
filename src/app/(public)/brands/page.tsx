import type { Metadata } from "next";
import BrandCard from "@/components/Brands/BrandCard";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Shop by Brand - Dazzle",
  description: "Browse premium tech and gadget brands at Dazzle.",
};

export const dynamic = "force-dynamic";

export interface Brand {
  id: string;
  label: string;
  logo: string;
  slug: string;
}

async function BrandPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
  ];

  let brands: Brand[] = [];

  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/brands?order=1&page=1&limit=1000",
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
      }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
  }

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
        <BrandCard brands={brands} />
      </div>
    </div>
  );
}

export default BrandPage;