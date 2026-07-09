import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import Breadcrumb from "@/components/share/Breadcrumb";
import CampaignDetailClient from "@/components/Offer/CampaignDetailClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CampaignProduct {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: {
    fileUuid: string;
    mediaFileUrl: string;
  } | null;
}

export interface CampaignDetailResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  campaignName?: string;
  campaignDescription?: string;
  campaignImage?: string;
  endedAt?: string;
  data: CampaignProduct[];
  message?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function getCampaignDetail(slug: string): Promise<CampaignDetailResponse | null> {
  try {
    const res = await api.get<CampaignDetailResponse>(`campaign/${slug}`, {
      cache: "no-store",
    });
    if (res.statusCode === 404 || !res.found) return null;
    return res;
  } catch {
    return null;
  }
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCampaignDetail(slug);

  const name = data?.campaignName
    ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `${name} - Dazzle Offer`,
    description:
      data?.campaignDescription ||
      `Shop exclusive deals from the ${name} campaign at Dazzle. Best prices on smartphones, laptops & gadgets in Bangladesh.`,
    openGraph: {
      title: `${name} - Dazzle Offer`,
      description: data?.campaignDescription || `Exclusive offers from ${name}`,
      url: `https://dazzle.com.bd/offer/${slug}`,
      type: "website",
      images: data?.campaignImage ? [{ url: data.campaignImage }] : undefined,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const initialData = await getCampaignDetail(slug);

  if (!initialData) notFound();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Offer", href: "/offer" },
    { label: initialData.campaignName ?? slug, href: `/offer/${slug}` },
  ];

  return (
    <div className="min-h-screen max-w-355 mx-auto md:px-12.5 px-4 pb-12">
      <Breadcrumb items={breadcrumbItems} />
      <CampaignDetailClient
        slug={slug}
        initialData={initialData}
        campaignName={initialData.campaignName ?? slug}
        campaignDescription={initialData.campaignDescription}
        campaignImage={initialData.campaignImage}
        endedAt={initialData.endedAt}
      />
    </div>
  );
}
