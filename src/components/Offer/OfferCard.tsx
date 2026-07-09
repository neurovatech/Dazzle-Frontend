"use client";
import Link from "next/link";
import CountdownBadges from "./CountdownBadges";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
import NoImg from "@/images/no_images.png";
import type { Campaign } from "@/app/(public)/offer/page";

import Image from "next/image";
import { useState } from "react";
export default function OfferCard({ campaign }: { campaign: Campaign }) {
  const [imageSrc, setImageSrc] = useState(campaign.image_url || NoImg.src);
  const endDate = campaign.ended_at ? new Date(campaign.ended_at) : null;

  return (
    <div className="bg-white dark:bg-[#1c1917] shadow-[0px_0px_32px_0px_#0000001A] rounded-3xl px-[22px] py-[19px] border border-[#F2F2F2] dark:border-white/5 overflow-hidden flex flex-col">
      {/* Banner image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Link href={`/offer/${campaign.slug}`}>
        <Image
          src={imageSrc}
          alt={campaign.campaign_name}
          width={400}
          height={176}
          className="w-full h-44 object-cover rounded-2xl"
          onError={() => setImageSrc(NoImg.src)}
        />
      </Link>

      {/* Body */}
      <div className="mt-5 flex flex-col gap-4 flex-1">
        {/* Countdown — only if end date is in the future */}
        {endDate && endDate > new Date() && (
          <CountdownBadges size="sm" endDate={endDate} />
        )}

        <Link href={`/offer/${campaign.slug}`} className="text-[#000000] dark:text-white font-semibold line-clamp-2">
          {campaign.campaign_name}
        </Link>

        {campaign.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}

        <Link
          href={`/offer/${campaign.slug}`}
          className="flex items-center justify-between bg-[#222222] text-white rounded-[14px] px-[15px] py-3.5 text-sm font-semibold tracking-widest hover:bg-[#222222]/90 transition-colors uppercase mt-auto"
        >
          See Details
          <span className="w-6 h-6 rounded-full border border-[#FACC15] flex items-center justify-center">
            <ArrowAngleRightIcon />
          </span>
        </Link>
      </div>
    </div>
  );
}
