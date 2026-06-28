import Image from "next/image";
import Banner from "@/images/o_banner.png";

function OfferBanner() {
  return (
    <div className="grid md:grid-cols-2 grid-cols-2 md:gap-4 gap-2 py-6 cursor-pointer">
      <div className="overflow-hidden rounded-xl">
        <Image
          src={Banner}
          width={500}
          height={500}
          alt="Offer banner"
          loading="lazy"
          className="w-full transition-all duration-500 hover:scale-105 hover:shadow-lg"
        />
      </div>

      <div className="overflow-hidden rounded-xl">
        <Image
          src={Banner}
          width={500}
          height={500}
          alt="Offer banner"
          loading="lazy"
          className="w-full transition-all duration-500 hover:scale-105 hover:shadow-lg"
        />
      </div>
    </div>
  );
}

export default OfferBanner;