"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
type LinkProps = {
  href: string;
  children: React.ReactNode;
};

function InlineLink({ href, children }: LinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:decoration-blue-400/40 dark:hover:text-blue-300"
    >
      {children}
    </a>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <h2 className=" text-[19px] leading-snug text-zinc-900 dark:text-zinc-100">
      {children}
    </h2>
  );
}

function Answer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-400">
      {children}
    </p>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 first:mt-0">{children}</div>;
}

function LocationShop({ children }: { children: React.ReactNode }) {
  return (
    <li className="ml-6 list-['◦'] text-[13.5px] leading-relaxed text-zinc-700 marker:text-zinc-400 dark:text-zinc-400 dark:marker:text-zinc-600">
      <span className="pl-1.5">{children}</span>
    </li>
  );
}

type Branch = {
  name: string;
  shops: string[];
};

function LocationBranch({
  index,
  name,
  shops,
}: {
  index: number;
  name: string;
  shops: string[];
}) {
  return (
    <div className={index > 0 ? "mt-3" : ""}>
      <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-200">
        {index + 1}. {name}
      </p>
      <ul className="mt-0.5 space-y-0.5">
        {shops.map((s, i) => (
          <LocationShop key={i}>{s}</LocationShop>
        ))}
      </ul>
    </div>
  );
}

function LocationCityHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
      <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
        {children}
      </p>
    </div>
  );
}

function LocationCityBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100/60 px-4 py-4 dark:bg-zinc-800/40">
      {children}
    </div>
  );
}


const DHAKA_BRANCHES: Branch[] = [
  {
    name: "Jamuna Future Park",
    shops: [
      "Shop 1: 021C & 021D, Block-B, 4th Floor, Kuril Pragoti Shoroni, Dhaka.",
      "Shop 2: 4A-022B, Level-4, Block-A, Dhaka-1229.",
      "Shop 3: 4A-025A, Level 4, West court, Block A, Dhaka - 1229",
    ],
  },
  {
    name: "Bashundhara Shopping Mall",
    shops: [
      "Shop 1: 88 & 89, Level 6, Block D, Bashundhara Shopping Mall, Dhaka 1229 ( Laptop, Tablet, and gadgets)",
      "Shop 2 : 23, Basement 1, Bashundhara Shopping Mall, Dhaka 1229 (Mobile Phones and gadgets)",
    ],
  },
  {
    name: "Centre Point Shopping Mall",
    shops: [
      "Shop No: A19 & A20, Level- 4, Centre point shopping mall, Dhaka Mymensingh Highway, Near Dhaka airport, Dhaka",
    ],
  },
  {
    name: "Dazzle Hypermarket- Bashundhara City Shopping Mall",
    shops: [
      "Shop No: 35 to 51, Block-B, Level 7 (Gold Floor), Bashundhara City Shopping Mall, Dhaka",
    ],
  },
];

const CHITTAGONG_BRANCHES: Branch[] = [
  {
    name: "Finlay Square Branch",
    shops: ["Shop No: 414 & 429, 4th Floor, East Nasirabad, Chittagong."],
  },
  {
    name: "Meridian Kohinoor City Branch",
    shops: [
      "Shop No: 509 & 510, 5th floor, Wasa Circle, 344 Mohammad Ali road, Chittagong",
    ],
  },
];

export default function FaqCom() {
  const { data, error } = useQuery({
    queryKey: ["faq-data"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => api.get<any>("/pages/faq"),
  });
  console.log("FAQ API Response:", data);

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#2E2B28] font-sans md:p-0 p-5 mb-20">
      <div className="max-w-350 mx-auto">
        {/* Page header bar */}
        <div className="border-b border-zinc-200 bg-[#F7F7F5] dark:border-zinc-800 dark:bg-[#191919]">
          <div className="w-full px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">📋</span>
              <h1 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                Frequently Asked Questions
              </h1>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="w-full">
          <div className="rounded-sm bg-white px-10 py-10 shadow-sm dark:bg-[#202020] sm:px-14 sm:py-12">
            {/* Title */}
            <h1 className=" text-[28px] text-zinc-900 dark:text-zinc-100">
              Dazzle at a glance
            </h1>

            {/* What is Dazzle */}
            <Block>
              <div className="mt-10">
                <Question>What is Dazzle?</Question>
                <Answer>
                  <InlineLink href="https://dazzle.com.bd/">Dazzle</InlineLink>{" "}
                  is one of Bangladesh&apos;s leading retailers specializing
                  in smartphones and related accessories. Offering a broad
                  selection of the latest mobile devices from globally
                  recognized brands, Dazzle is dedicated to providing
                  customers with authentic products, competitive pricing, and
                  exceptional service. Whether you shop in-store or online,
                  Dazzle ensures a seamless shopping experience tailored to
                  your needs.
                </Answer>
              </div>
            </Block>

            {/* Where is Dazzle located */}
            <Block>
              <Question>Where is Dazzle located?</Question>

              <div className="mt-4 overflow-hidden rounded-sm">
                <LocationCityHeader>Dhaka Locations:</LocationCityHeader>
                <LocationCityBody>
                  <div className="space-y-4">
                    {DHAKA_BRANCHES.map((b, i) => (
                      <LocationBranch
                        key={b.name}
                        index={i}
                        name={b.name}
                        shops={b.shops}
                      />
                    ))}
                  </div>
                </LocationCityBody>
              </div>

              <div className="mt-3 overflow-hidden rounded-sm">
                <LocationCityHeader>Chittagong Locations:</LocationCityHeader>
                <LocationCityBody>
                  <div className="space-y-4">
                    {CHITTAGONG_BRANCHES.map((b, i) => (
                      <LocationBranch
                        key={b.name}
                        index={i}
                        name={b.name}
                        shops={b.shops}
                      />
                    ))}
                  </div>
                </LocationCityBody>
              </div>
            </Block>

            {/* Does Dazzle have an online store */}
            <Block>
              <Question>Does Dazzle have an online store?</Question>
              <Answer>
                Yes, Dazzle operates a full-featured online store at{" "}
                <InlineLink href="https://dazzle.com.bd/">
                  https://dazzle.com.bd/
                </InlineLink>
                . The website offers a wide range of products, including the{" "}
                <InlineLink href="https://dazzle.com.bd/">
                  latest smartphones
                </InlineLink>
                , <InlineLink href="https://dazzle.com.bd/">accessories</InlineLink>,
                and <InlineLink href="https://dazzle.com.bd/">gadgets</InlineLink>.
                It provides users with a simple and secure shopping
                experience, enabling them to browse products, compare prices,
                and place orders from the comfort of their homes.
              </Answer>
            </Block>

            {/* What products does Dazzle offer */}
            <Block>
              <Question>What products does Dazzle offer?</Question>
              <Answer>
                Dazzle specializes in{" "}
                <InlineLink href="https://dazzle.com.bd/">smartphones</InlineLink>{" "}
                and accessories. The product catalog includes flagship
                smartphones, mid-range devices, budget-friendly models, and an
                assortment of accessories such as{" "}
                <InlineLink href="https://dazzle.com.bd/">chargers</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">earphones</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">phone cases</InlineLink>,
                and{" "}
                <InlineLink href="https://dazzle.com.bd/">
                  screen protectors
                </InlineLink>
                . Additionally, Dazzle regularly updates its inventory to
                include the newest releases and trending tech gadgets.
              </Answer>
            </Block>

            {/* Which smartphone brands */}
            <Block>
              <Question>
                Which smartphone brands are available at Dazzle?
              </Question>
              <Answer>
                Dazzle proudly stocks devices from the world&apos;s top
                smartphone brands. Customers can find popular names such as{" "}
                <InlineLink href="https://dazzle.com.bd/">Apple</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">Samsung</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">Xiaomi</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">Oppo</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">Vivo</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">OnePlus</InlineLink>,{" "}
                <InlineLink href="https://dazzle.com.bd/">Realme</InlineLink>,
                and more. Each product comes with a manufacturer&apos;s
                warranty, ensuring quality and authenticity.
              </Answer>
            </Block>

            {/* Are the products authentic */}
            <Block>
              <Question>Are the products at Dazzle authentic?</Question>
              <Answer>
                Yes, Dazzle is committed to selling only 100% genuine
                products. Every item available in the store or online is
                sourced directly from authorized distributors or
                manufacturers. Customers can shop confidently, knowing that
                all products come with official warranties and meet the
                highest standards of quality.
              </Answer>
            </Block>

            {/* Warranty */}
            <Block>
              <Question>
                Does Dazzle provide a warranty on its products?
              </Question>
              <Answer>
                Absolutely! All products purchased from Dazzle include an
                official warranty as per the manufacturer&apos;s guidelines.
                The warranty covers manufacturing defects and other specified
                issues, giving customers peace of mind about their purchases.
              </Answer>
            </Block>

            {/* Purchase online */}
            <Block>
              <Question>Can I purchase products online from Dazzle?</Question>
              <Answer>
                Yes, Dazzle&apos;s online store is designed for a seamless
                shopping experience. Customers can explore the product range,
                view detailed specifications, and make secure purchases
                directly through the website. The online store is
                mobile-friendly, allowing users to shop conveniently from
                their smartphones or tablets.
              </Answer>
            </Block>

            {/* Payment methods */}
            <Block>
              <Question>What payment methods are accepted online?</Question>
              <Answer>
                Dazzle accepts a variety of payment methods for online
                purchases, including credit cards, debit cards, mobile
                banking platforms such as bKash and Nagad, and cash on
                delivery for eligible orders. The secure payment gateway
                ensures that all transactions are safe and hassle-free.
              </Answer>
            </Block>
          </div>
        </div>
      </div>
    </div>
  );
}