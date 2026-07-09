import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import LocationDetailPageCom from "@/components/shop/LocationDetailPageCom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreDetail {
  uuid: string;
  branch_name: string;
  slug: string;
  address: string;
  latitude: string;
  longitude: string;
  dayoff: string;
  openday: string;
  contactno: string;
  email: string;
  description: string;
  thumbnail_img: string;
  thumbnail: { fileUUID: string; mediaFileURL: string }[];
}

interface StoreDetailResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: StoreDetail;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function getStoreBySlug(slug: string): Promise<StoreDetail | null> {
  try {
    const res = await api.get<StoreDetailResponse>(`stores/${slug}`, {
      cache: "no-store",
    });
    if (!res.found || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) return { title: "Store Not Found - Dazzle" };

  const [description] = (store.description || "").split("~seperator~");

  return {
    title: `${store.branch_name} - Dazzle Store`,
    description:
      description?.trim() ||
      `Visit Dazzle at ${store.branch_name}. Located at ${store.address}. Contact: ${store.contactno}`,
    openGraph: {
      title: `${store.branch_name} - Dazzle Store`,
      description: description?.trim() || store.address,
      url: `https://dazzle.com.bd/shop-location/${slug}`,
      images: store.thumbnail_img ? [{ url: store.thumbnail_img }] : undefined,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShopLocationDetails({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) notFound();

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <LocationDetailPageCom store={store} />
    </div>
  );
}
