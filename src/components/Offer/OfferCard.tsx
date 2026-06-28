"use client";
import Link from "next/link";
import CountdownBadges from "./CountdownBadges";
import OfferImg from "@/images/offer.png";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
export interface Offer {
  id: number;
  title: string;
  slug: string;
  badge: string;
}

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="bg-white shadow-[0px_0px_32px_0px_#0000001A] rounded-3xl px-[22px] py-[19px] border border-[#F2F2F2] overflow-hidden flex flex-col">
      {/* Banner */}
      <img
        src={OfferImg.src}
        alt="khkhkjhkh "
        className="w-full h-full object-contain"
      />

      {/* Body */}
      <div className="mt-5 flex flex-col gap-4 flex-1">
        <CountdownBadges size="sm" />
        <p className="text-[#000000] font-semibold line-clamp-2">
          {offer.title}
        </p>
        <Link
          href={`/offer/${offer.slug}`}
          className="flex items-center justify-between bg-[#222222] text-white rounded-[14px] px-[15px] py-3.5 text-sm font-semibold tracking-widest hover:bg-[#222222]/95 transition-colors uppercase"
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
