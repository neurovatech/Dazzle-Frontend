import React from "react";
import Image from "next/image";
import { Review } from "@/types/location";
import quote from "@/images/quote.svg";
import reviewBg from "@/images/review_bg.png";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div
      className={`rounded-[14px] py-4.5 px-5.5 pb-8`}
      style={{
        backgroundImage: `url(${reviewBg.src})`,
        backgroundSize: "contain",
        backgroundColor: "#ffffff",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
      }}
    >
      <p className="text-[#747474] leading-relaxed">
        <span className="">
          {review.text}{" "}
          <Image
            src={quote}
            alt="Quote"
            className="w-4.5 text-[#6D3F0E] inline-block"
          />
        </span>
      </p>
      <hr className="border-[#EEEEEE] my-[15px] w-4/5" />
      <div className="flex items-center gap-2.5">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={review.avatar}
            alt={review.author}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <p className="font-semibold text-[#6D3F0E]">{review.author}</p>
          <p className="text-sm text-[#747474]">{review.role}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
