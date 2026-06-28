"use client";
import Image from "next/image";
import Link from "next/link";
import Newest from "@/components/HomePage/FlashSale/Newest";


function OnlineExclusive() {

  return (
    <div className="">
      <div className="bg-[#ebebeb] dark:bg-[#2e2b28]">
        <div className="flex flex-col flex-1 items-center max-w-355 mx-auto px-4 ">
          <div className="w-full pt-5">
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35924%2Fmain-banner.jpg&w=3840&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
            <div className="bg-black text-white flex justify-evenly items-center text-center gap-x-2 rounded-full md:rounded-xl md:max-w-3xl mx-auto py-1 md:py-2 px-3 md:px-10 font-semibold text-[10px] md:text-base my-6">
              <p>Delivery:</p>
              <p className="gradient-text">1-3 days</p>

              <span className="h-7 md:h-6 bg-gray-500 w-px"></span>
              <div>
                <p className="gradient-text">3-7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto pt-4 px-4">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4 w-full">
          <Link
            className="w-full shadow-lg transition-all duration-500 hover:shadow-2xl "
            href=""
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35925%2F205.jpg&w=640&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
          <Link
            className="w-full shadow-lg transition-all duration-500 hover:shadow-2xl "
            href=""
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35925%2F205.jpg&w=640&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
          <Link
            className="w-full shadow-lg transition-all duration-500 hover:shadow-2xl "
            href=""
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35925%2F205.jpg&w=640&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
          <Link
            className="w-full shadow-lg transition-all duration-500 hover:shadow-2xl "
            href=""
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35925%2F205.jpg&w=640&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
        </div>
      </div>

      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Online Exclusive Products
          </h3>
          <Link href="/product" className="">
            See all
          </Link>
        </div>
        <Newest />
      </div>

      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto pt-6 px-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          <Link
            href="/"
            className="shadow-lg transition-all duration-500 hover:shadow-2xl"
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35924%2Fmain-banner.jpg&w=3840&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
          <Link
            href="/"
            className="shadow-lg transition-all duration-500 hover:shadow-2xl"
          >
            <Image
              src="https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F35924%2Fmain-banner.jpg&w=3840&q=75"
              width={500}
              height={500}
              className="w-full!"
              alt="Picture of the author"
            />
          </Link>
        </div>
      </div>

      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Best Selling Items
          </h3>
          <Link href="/product" className="">
            See all
          </Link>
        </div>
        <Newest />
      </div>
      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Deals of the Day
          </h3>
          <Link href="/product" className="">
            See all
          </Link>
        </div>
        <Newest />
      </div>
    </div>
  );
}

export default OnlineExclusive;
