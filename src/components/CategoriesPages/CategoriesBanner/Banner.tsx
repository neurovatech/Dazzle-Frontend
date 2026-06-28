import Image from "next/image";
import Link from "next/link";

import Banner1 from "@/images/b1mages.png";
import Banner2 from "@/images/b2mages.png";
function Banner() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
      <div className="lg:col-span-3 h-full">
        <Link href="#">
          <Image
            src={Banner1}
            width={500}
            height={500}
            alt="Picture of the author"
            className="w-full h-full object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </Link>
        
      </div>
      <div className="lg:col-span-9 h-full">
        <Link href="#">
          <Image
            src={Banner2}
            width={500}
            height={300}
            alt="Picture of the author"
            className="w-full h-full object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </Link>
      </div>
    </div> 
  );
}

export default Banner;
