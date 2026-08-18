"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FacebookIcon,
  InstragramIcon,
  LinkindIcon,
  MassageIcon,
  YouTubeIcon,
} from "@/icon";
import GooglePlay from "@/images/googlePlay.png";
import AppStore from "@/images/app_store.png";
import Logo from "@/images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import FooterEfcted from "@/images/footer_effected.svg";
// import LatestBlog from "./LatestBlog";
// import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscribeResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: {
    email: string;
    alreadyFound: boolean;
    isSubscribed: boolean;
    subscribedAt: string;
  };
  errors?: string[];
}

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
      {
        label: "Product Disclaimer Policy",
        href: "/product-disclaimer-policy",
      },
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
      { label: "Cookies Policy", href: "/cookies-policy" },
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
      { label: "Newsletter", href: "/newsletter-unsubscribe" },
      // { label: "Others Policy", href: "/other-policy" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: siteSettings } = useSiteSettings();

  const { mutate: subscribe, isPending } = useMutation<
    SubscribeResponse,
    Error,
    string
  >({
    mutationFn: (emailValue) =>
      api.post<SubscribeResponse>("newsletter-subscribe", {
        email: emailValue,
        source: "website-footer",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }),
    onSuccess: (res) => {
      setApiErrors([]);
      if (res.statusCode === 200) {
        setSuccessMsg(res.message || "Subscribed successfully!");
        setEmail("");
      } else if (res.errors?.length) {
        setApiErrors(res.errors);
      } else {
        setApiErrors([res.message]);
      }
    },
    onError: (err) => {
      setSuccessMsg("");
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.errors?.length) {
          setApiErrors(parsed.errors);
        } else {
          setApiErrors([parsed.message || "Something went wrong."]);
        }
      } catch {
        setApiErrors(["Something went wrong."]);
      }
    },
  });

  const handleSubscribe = () => {
    setApiErrors([]);
    setSuccessMsg("");
    const trimmed = email.trim();
    if (!trimmed) {
      setApiErrors(["Please enter your email address."]);
      return;
    }
    subscribe(trimmed);
  };

  const [showAll, setShowAll] = useState(false);

  const branches =
    siteSettings?.footerText
      ?.split(/Branch\s*\d+\s*:/i)
      .filter((branch) => branch.trim() !== "") ?? [];

  const VISIBLE_COUNT = 3; // how many branches to show by default
  const visibleBranches = showAll ? branches : branches.slice(0, VISIBLE_COUNT);

  // const pathname = usePathname();
  return (
    <div className="overflow-hidden bg-[#fffbf6] dark:bg-[#2e2b28]">
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
          <div className="relative z-10 mx-auto! max-w-4xl rounded-[28px] bg-background px-4 py-6 sm:px-6 sm:py-8 shadow-lg md:px-10">
            <div className="text-center">
              <h2 className="text-sm sm:text-lg lg:text-2xl font-semibold tracking-wide text-primary uppercase">
                Subscribe To Our Newsletter
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Get all the latest information on Events, Sales and Offers.
              </p>
            </div>

            <div className="mx-auto mt-4 sm:mt-6 flex max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-background">
              <div className="pl-3 sm:pl-4 pt-4">
                <MassageIcon />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setApiErrors([]);
                  setSuccessMsg("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Enter your email"
                disabled={isPending}
                className="w-full px-2 sm:px-3 py-3 sm:py-4 text-sm outline-none bg-transparent disabled:opacity-60"
              />
              <button
                onClick={handleSubscribe}
                disabled={isPending}
                className="m-1 rounded-xl dark:bg-[#36291e] px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium transition hover:bg-black hover:text-white dark:text-white disabled:opacity-60 flex items-center gap-2 shrink-0"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Subscribe
              </button>
            </div>

            {/* Feedback messages */}
            {successMsg && (
              <div className="mx-auto mt-3 flex max-w-2xl items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 size={15} className="shrink-0" />
                {successMsg}
              </div>
            )}
            {apiErrors.length > 0 && (
              <div className="mx-auto mt-3 max-w-2xl">
                {apiErrors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <XCircle size={14} className="shrink-0" />
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* <div className="absolute bottom-0 opacity-200 left-1/2 h-130 w-130 -translate-x-1/2 bg-[#463d34]/50 blur-3xl rounded-t-[200px]" /> */}

        <div className="absolute left-1/2 top-2/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[950px] rounded-full bg-[#E9CCAE5C] opacity-40 blur-[500px] pointer-events-none" />

        {/* <img src={FooterEfcted} alt="footer effec" /> */}
        {/* <Image src={FooterEfcted} alt="bKash" className="w-full mx-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 bottom-0" /> */}

        <div className="-mt-20 sm:-mt-30 rounded-t-4xl bg-[#101518] px-4 pb-8 pt-28 sm:pt-40 text-white sm:px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 lg:gap-15">
            {/* FIX: was "lg:col-span-3" only — missing md:col-span made this
              collapse to a single 1/12 track on iPad, squeezing every word
              onto its own line. Added md:col-span-4 so it gets proper width
              at the md breakpoint, then narrows to 3/12 at lg. */}
            <div className="md:col-span-4 lg:col-span-3">
              {/* Footer Logo — fallback to local Logo if API not loaded yet */}
              <Link href="/" className="">
                {siteSettings?.footerLogo ? (
                  <Image
                    src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/header-logo-white.svg"
                    alt="Footer Logo"
                    width={150}
              height={50}
                    // className="h-12 sm:h-15 w-[60%] sm:w-[70%] object-contain"
                  />
                ) : (
                  <Image
                    src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/header-logo-white.svg"
                    alt="Dazzle Logo"
                    width={150}
              height={50}
                    // className="h-12 sm:h-15 w-[60%] sm:w-[70%] object-contain"
                  />
                )}
              </Link>
              <p className="mt-6 text-sm leading-7 text-gray-300">
                {siteSettings?.footerText?.split(" ").slice(0, 25).join(" ")}
              </p>

              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                <Link
                  href={siteSettings?.facebookUrl || "#"}
                  target="_blank"
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#222222DB] text-sm cursor-pointer"
                >
                  <FacebookIcon />
                </Link>
                <Link
                  href={siteSettings?.instagramUrl || "#"}
                  target="_blank"
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#222222DB] text-sm cursor-pointer"
                >
                  <InstragramIcon />
                </Link>
                <Link
                  href={siteSettings?.linkedinUrl || "#"}
                  target="_blank"
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#222222DB] text-sm cursor-pointer"
                >
                  <LinkindIcon />
                </Link>
                <Link
                  href={siteSettings?.youtubeUrl || "#"}
                  target="_blank"
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#222222DB] text-sm cursor-pointer"
                >
                  <YouTubeIcon />
                </Link>
              </div>

              <div className="mt-4 sm:mt-6">
                <p className="mb-2 sm:mb-3 text-sm text-gray-300">
                  Download Our App:
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Link
                    target="_blank"
                    href="https://play.google.com/store/apps/details?id=com.bd.com.dazzle.app&hl=en"
                    className=""
                  >
                    <Image
                      className="border-2 border-[#282828] rounded-xl"
                      src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/google-play.svg"
                      width={130}
                      height={40}
                      alt="App Store"
                    />
                  </Link>
                  {/* <Link target="_blank" href="https://apps.apple.com/us/app/dazzle-your-ai-photo-rizz/id6737238234" className="">
                    <Image src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/app-store.svg" width={130} height={40} alt="Google Play" />
                  </Link> */}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9">
              <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  {/* <ul className="space-y-4 text-sm text-gray-300">
                    <li>{siteSettings?.contactPhone}</li>
                    <li>{siteSettings?.contactEmail}</li>
                    <li>{siteSettings?.contactAddress}</li>
                  </ul> */}

                  <div className="relative z-10">
                    <div className=" ">
                      {/* <ul className="space-y-4 text-sm text-gray-300">
                        {siteSettings?.footerText
                          ?.split(/Branch\s*\d+\s*:/i)
                          .filter((branch) => branch.trim() !== "")
                          .map((branch, index) => (
                            <li key={index}>
                              <span className="font-medium text-white">
                                Branch {index + 1}:
                              </span>{" "}
                              {branch.trim()}
                            </li>
                          ))}
                      </ul> */}

                      <ul className="space-y-4 text-sm text-gray-300">
                        {visibleBranches.map((branch, index) => (
                          <li key={index}>
                            <span className="font-medium text-white">
                              Branch {index + 1}:
                            </span>{" "}
                            {branch.trim()}
                          </li>
                        ))}
                      </ul>

                      {branches.length > VISIBLE_COUNT && (
                        <button
                          onClick={() => setShowAll((prev) => !prev)}
                          className="mt-3 text-sm font-medium text-white underline underline-offset-2 hover:text-gray-300 transition-colors"
                        >
                          {showAll ? "See less" : "See more"}
                        </button>
                      )}
                    </div>
                  </div>
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

            <span className=" p-5 block lg:w-[50%] m-auto -mt-7.5 pb-18 md:pb-0 text-[#C6C6C6] ">
              {siteSettings?.copyrightText}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
