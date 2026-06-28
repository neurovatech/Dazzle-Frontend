"use client";
import {
  FacebookIcon,
  InstragramIcon,
  LinkindIcon,
  MassageIcon,
  YouTubeIcon,
} from "@/icon";
import GooglePlay from "@/images/googlePlay.png";
import AppStore from "@/images/app_store.png";
import Image from "next/image";
import Link from "next/link";
// import LatestBlog from "./LatestBlog";
// import { usePathname } from "next/navigation";

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkSection = {
  title: string;
  links: FooterLink[];
};

const sections: FooterLinkSection[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Career", href: "/career" },
      { label: "Our Brand", href: "/brands" },
      { label: "Blogs", href: "/blogs" },
      { label: "Press Coverage", href: "/press-coverage" },
      { label: "Order Tracking", href: "/order-tracking" },
      { label: "Trade In", href: "/trade-in" },
      { label: "Product Disclaimer Policy", href: "/product-disclaimer-policy" },
      { label: "Membership Policy", href: "/membership-policy" },
      { label: "Pre-Order Policy", href: "/pre-order-policy" },
    ],
  },
  {
    title: "Help Center",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Support System", href: "/support" },
      { label: "Announcement", href: "/announcement" },
      { label: "Corporate", href: "/corporate" },
      { label: "Feedback", href: "/feedback" },
      { label: "Sitemap", href: "/sitemap" },
      { label: "Affiliate Policy", href: "/affiliate-policy" },
      { label: "Data Protection Policy", href: "/data-protection-policy" },
      { label: "Loyalty Program Policy", href: "/loyalty-program-policy" },
    ],
  },
  {
    title: "Terms & Conditions",
    links: [
      { label: "Terms & Conditions", href: "/terms-conditions" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Warranty Policy", href: "/warranty-policy" },
      // { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Exchange Policy", href: "/exchange-policy" },
      { label: "Delivery Policy", href: "/delivery-policy" },
      { label: "EMI Policy", href: "/emi-policy" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      // { label: "Others Policy", href: "/other-policy" },
    ],
  },
];

export default function Footer() {
  // const pathname = usePathname();
  return (
    <div className="overflow-hidden">
      {/* {!pathname.startsWith("/product") &&
       !pathname.startsWith("/blogs") &&
       !pathname.startsWith("/shop-location") &&
        pathname !== "/auth/login" &&
        pathname !== "/auth/registration" &&
        pathname !== "/blogs" &&
        pathname !== "/auth/otp" &&
        pathname !== "/auth/forget-password" && <LatestBlog />} */}
      <footer className="relative mt-10! max-w-355 mx-auto ">
        {/* Newsletter */}
        <div className="ml-3.75! mr-3.75!">
          <div className="relative z-10  mx-auto! max-w-4xl rounded-[28px] bg-background px-6 py-8 shadow-lg md:px-10">
            <div className="text-center">
              <h2 className="lg:text-2xl text-sm font-semibold tracking-wide text-primary uppercase">
                Subscribe To Our Newsletter
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Get all the latest information on Events, Sales and Offers.
              </p>
            </div>

            <div className="mx-auto mt-6 flex max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-background sm:flex-row">
              <div className="pl-4 pt-4.75">
                <MassageIcon />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-4 text-sm outline-none"
              />
              <button className="m-1 rounded-xl  dark:bg-[#36291e] px-8 py-3 text-sm font-medium  transition hover:bg-black hover:text-white dark:text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* <div className="absolute bottom-0 opacity-200 left-1/2 h-130 w-130 -translate-x-1/2 bg-[#463d34]/50 blur-3xl rounded-t-[200px]" /> */}

        <div className="absolute left-1/2 top-2/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[950px] rounded-full bg-[#E9CCAE] opacity-20 blur-[500px] pointer-events-none" />

        <div className="-mt-30 rounded-t-4xl bg-[#101518] px-6 pb-8 pt-40 text-white md:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-15 ">
            <div className="lg:col-span-3">
              <h1 className="text-5xl font-bold tracking-tight">dazzle</h1>
              <p className="mt-6 text-sm leading-7 text-gray-300">
                Looking for the best Apple products, the top smartphones and the
                latest gadgets in the world of gadgets? Look no further than
                Dazzle Mobile & Gadget Shop.
              </p>

              <div className="mt-6 flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#222222DB] text-sm cursor-pointer">
                  <FacebookIcon />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#222222DB] text-sm cursor-pointer">
                  <InstragramIcon />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#222222DB] text-sm cursor-pointer">
                  <LinkindIcon />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#222222DB] text-sm cursor-pointer">
                  <YouTubeIcon />
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm text-gray-300">Download Our App:</p>
                <div className="flex gap-1">
                  <Link href="/" className="">
                    <Image
                      className="border-2 border-[#282828] rounded-xl"
                      src={AppStore}
                      width={150}
                      // height={100}
                      alt="Picture of the author"
                    />
                  </Link>
                  <Link href="/" className="">
                    <Image
                      src={GooglePlay}
                      width={150}
                      // height={300}
                      alt="Picture of the author"
                    />
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="grid gap-10 lg:grid-cols-4 grid-cols-2">
                {sections.map((section) => (
                  <div className="relative z-10" key={section.title}>
                    <h3 className="mb-5 border-b border-gray-800 pb-3 text-base font-medium">
                      {section.title}
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-300">
                      {section.links.map((link) => (
                        <li
                          key={link.label}
                          className="cursor-pointer transition hover:text-[#ba975f]"
                        >
                          <Link
                            href={link.href}
                            className="transition hover:text-[#ba975f]"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="relative z-10">
                  <h3 className="mb-5 border-b border-gray-800 pb-3 text-base font-medium">
                    Contact
                  </h3>
                  <ul className="space-y-4 text-sm text-gray-300">
                    <li>09638001122</li>
                    <li>admin@dazzle.com.bd</li>
                    {/* exchange-policy */}
                    <li>
                      <Link
                        href="/exchange-policy"
                        className="transition hover:text-[#ba975f]"
                      >
                        Exchange Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="md:mt-12 pt-6 text-center text-sm text-gray-400 relative z-10">
            <div className="hidden md:block">
              <svg
                width="100%"
                height="53"
                viewBox="0 0 1324 53"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1324 52.1508H975.046C971.67 51.9197 963.5 50.3784 963.5 44C963.5 37.6216 962.77 29.0408 961.695 25.8054C954.698 7.50232 928.396 1.30885 916.12 0.5H408.801C391.307 0.499791 363.225 9.16882 359.082 36.5515V46C359.082 49.1598 358 52.5 350.335 52.5C346.652 52.5 115.244 52.5 0 52.5"
                  stroke="white"
                  strokeOpacity="0.16"
                />
              </svg>
            </div>

            <span className=" p-5 block lg:w-[50%] m-auto -mt-7.5 text-[#C6C6C6] ">
              © {new Date().getFullYear()} Thanks From DazzleTM Ltd. | All
              rights reserved
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
