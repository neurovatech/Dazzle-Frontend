import React from "react";
import Image from "next/image";
import { Review } from "@/types/location";
import quote from "@/images/quote.svg";
import reviewBg from "@/images/review_bg.png";

interface ReviewCardProps {
  review: Review;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const initials = getInitials(review.authorName);

  return (
    <div
      className="rounded-[14px] py-4.5 px-5.5 pb-8"
      style={{
        backgroundImage: `url(${reviewBg.src})`,
        backgroundSize: "contain",
        backgroundColor: "#ffffff",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
      }}
    >
      <p className="text-[#747474] leading-relaxed">
        {review.quote}{" "}
        <Image
          src={quote}
          alt="Quote"
          className="w-4.5 text-[#6D3F0E] inline-block"
        />
      </p>
      <hr className="border-[#EEEEEE] my-[15px] w-4/5" />
      <div className="flex items-center gap-2.5">
        {/* Avatar — image থাকলে show করব, না থাকলে initials */}
        {review.imageUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
            <Image
              src={review.imageUrl}
              alt={review.authorName}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#6D3F0E] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
        )}
        <div>
          <p className="font-semibold text-[#6D3F0E]">{review.authorName}</p>
          <p className="text-sm text-[#747474]">{review.designation}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
