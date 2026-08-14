import Link from "next/link";
import Image from "next/image";
import PressImg from "@/images/offer.png";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
export interface AnnouncementType {
  id: number;
  title: string;
  slug: string;
  badge: string;
}

const AnnouncementCard = ({ press }: { press: AnnouncementType }) => {
  return (
    <div className="bg-white dark:bg-[#302d29] shadow-[0px_0px_32px_0px_#0000001A] rounded-3xl px-[22px] py-[19px] border border-[#F2F2F2] dark:border-[#444444] overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="w-full h-full">
        <Image
          src={PressImg}
          alt="Press Coverage"
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Body */}
      <div className="mt-5 flex flex-col gap-4 flex-1">
        <p className="text-[#000000] dark:text-white font-semibold line-clamp-2">
          {press.title}
        </p>
        <Link
          // href={`/press-coverage/${press.slug}`}
          href={`#`}
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
};

export default AnnouncementCard;
