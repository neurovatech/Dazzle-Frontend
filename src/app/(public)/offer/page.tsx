import OfferCard from "@/components/Offer/OfferCard";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import { SITE_NAME, OG_LOCALE, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Campaign {
  campaign_id: number;
  campaign_uuid: string;
  campaign_name: string;
  slug: string;
  image_url: string;
  description: string;
  started_at: string;
  ended_at: string;
  is_active: boolean;
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

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Latest Offers & Campaigns",
  description:
    "Explore Dazzle's latest campaigns, flash sales, and exclusive offers on smartphones, laptops, and gadgets in Bangladesh.",
  alternates: { canonical: "/offer" },
  openGraph: {
    title: "Latest Offers & Campaigns - Dazzle",
    description: "Shop the best deals and limited-time offers at Dazzle.",
    url: absoluteUrl("/offer"),
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Offers & Campaigns - Dazzle",
    description: "Shop the best deals and limited-time offers at Dazzle.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Offer", href: "/offer" },
];

export default async function OffersPage() {
  let campaigns: Campaign[] = [];

  try {
    const res = await api.get<CampaignsResponse>("campaigns", {
      next: { revalidate: 5 },
    });
    if (res.found && res.data?.length) {
      campaigns = res.data;
    }
  } catch (err) {
    console.error("Error fetching campaigns:", err);
  }




  return (
    <div className="min-h-screen py-5 px-4">
      <div className="max-w-355 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-355 mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Latest Offers
        </h1>

        {campaigns?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">No active campaigns at the moment.</p>
            <p className="text-gray-300 text-xs mt-1">Check back soon for exciting deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {campaigns.map((campaign) => (
              <OfferCard key={campaign.campaign_uuid} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
