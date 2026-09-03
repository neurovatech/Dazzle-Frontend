/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import Breadcrumb from "@/components/share/Breadcrumb";
import CampaignDetailClient from "@/components/Offer/CampaignDetailClient";
import type { Campaign } from "../page";
import { SITE_NAME, OG_LOCALE, buildOgImage, absoluteUrl } from "@/lib/seo-config";

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
  campaign_name?: string;
  campaignDescription?: string;
  campaign_description?: string;
  campaignImage?: string;
  campaign_image?: string;
  endedAt?: string;
  ended_at?: string;
  data: CampaignProduct[];
  message?: string;
}

interface CampaignsResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Campaign[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to format slug to capitalized title without hyphens
function cleanSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function getCampaignDetail(slug: string): Promise<CampaignDetailResponse | null> {
  try {
    const res = await api.get<CampaignDetailResponse>(`campaign/${slug}`, {
      next: { revalidate: 5 },
    });
    if (res && res.found && res.statusCode !== 404) {
      return res;
    }
  } catch (err) {
    console.warn(`Failed to fetch campaign by slug "${slug}":`, err);
  }
  try {
    const campaignsList = await api.get<CampaignsResponse>("campaigns", {
      next: { revalidate: 5 },
    });
    const foundCampaign = campaignsList.data?.find(
      (c) => c.slug === slug || c.campaign_uuid === slug
    );

    if (foundCampaign) {
      try {
        const res = await api.get<CampaignDetailResponse>(`campaign/${foundCampaign.campaign_uuid}`, {
          next: { revalidate: 5 },
        });
        if (res && res.found && res.statusCode !== 404) {
          return res;
        }
      } catch (err) {
        console.warn(`Failed to fetch campaign detail by UUID "${foundCampaign.campaign_uuid}":`, err);
      }
      try {
        const res = await api.get<CampaignDetailResponse>(`campaign/${foundCampaign.campaign_id}`, {
          next: { revalidate: 5 },
        });
        if (res && res.found && res.statusCode !== 404) {
          return res;
        }
      } catch (err) {
        console.warn(`Failed to fetch campaign detail by ID "${foundCampaign.campaign_id}":`, err);
      }
    }
  } catch (err) {
    console.error("Error in fallback campaign fetching:", err);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCampaignDetail(slug);

  const name = data?.campaign_name ?? data?.campaignName ?? cleanSlug(slug);
  const description =
    data?.campaign_description ||
    data?.campaignDescription ||
    `Shop exclusive deals from the ${name} campaign at Dazzle. Best prices on smartphones, laptops & gadgets in Bangladesh.`;
  const image = data?.campaign_image ?? data?.campaignImage;
  const ogTitle = `${name} - Dazzle Offer`;
  const ogImage = buildOgImage(image, name);

  return {
    title: ogTitle,
    description,
    alternates: { canonical: `/offer/${slug}` },
    openGraph: {
      title: ogTitle,
      description,
      url: absoluteUrl(`/offer/${slug}`),
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const initialData = await getCampaignDetail(slug);

  if (!initialData) notFound();

  const campaignName        = initialData.campaign_name ?? initialData.campaignName ?? cleanSlug(slug);
  const campaignDescription = initialData.campaign_description ?? initialData.campaignDescription;
  const campaignImage       = initialData.campaign_image ?? initialData.campaignImage;
  const endedAt             = initialData.ended_at ?? initialData.endedAt;

  const resolvedSlug =
    (initialData as any).campaignUuid ??
    (initialData as any).campaign_uuid ??
    slug;

  const breadcrumbItems = [
    { label: "Home",  href: "/" },
    { label: "Offer", href: "/offer" },
    { label: campaignName, href: `/offer/${slug}` },
  ];

  return (
    <div className="min-h-screen max-w-355 mx-auto md:px-12.5 px-4 pb-12">
      <Breadcrumb items={breadcrumbItems} />
      <CampaignDetailClient
        slug={resolvedSlug}
        initialData={initialData}
        campaignName={campaignName}
        campaignDescription={campaignDescription}
        campaignImage={campaignImage}
        endedAt={endedAt}
      />
    </div>
  );
}
