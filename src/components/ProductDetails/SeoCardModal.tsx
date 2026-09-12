"use client";

/**
 * SeoCardModal
 *
 * Renders one card per SEO content section (hseogl1–4 from site-settings,
 * each already split on its own headings by the caller — see
 * splitSeoSections). Each card shows its section's full HTML content
 * directly, styled by the tags the CMS content already carries (heading
 * bold and larger, paragraphs plain) — no excerpt, no click-to-expand modal.
 *
 * The first grid (16 cards) now shows only the first 4 by default, with a
 * "Read More" button revealing the rest ("Show Less" to collapse again).
 */

import { useState } from "react";
import Link from "next/link";

interface SeoCard {
  label: string;
  html: string;
  wrapper: string;
}

interface Props {
  cards: SeoCard[];
}

export default function SeoCardModal({ cards }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (cards.length === 0) return null;

  const tabletBrands = [ { name: "Apple iPad", href: "/categories/tablet/ipad", }, { name: "Samsung Tablets", href: "/categories/tablet/samsung-1", }, { name: "Xiaomi Tablets", href: "/categories/tablet/xiaomi-1", }, { name: "Honor Tablets", href: "/categories/tablet/honor-1", }, { name: "Huawei Tablets", href: "/categories/tablet/huawei-1", }, { name: "Google Pixel Tablets", href: "/categories/tablet/pixel-tablet", }, { name: "OnePlus Tablets", href: "/categories/tablet/oneplus-1", }, { name: "Amazon Fire Tablets", href: "/categories/tablet/amazon", }, ];

  const laptopCategories = [ { name: "Apple MacBook", href: "/categories/laptop/apple-macbook", }, { name: "iMac", href: "/categories/laptop/imac", }, { name: "Gaming Laptop", href: "/categories/laptop/gaming-laptop", }, { name: "Ultrabook", href: "/categories/laptop/ultrabook-2-in-1-laptop", }, { name: "2-in-1 Laptops", href: "/categories/laptop/ultrabook-2-in-1-laptop", }, { name: "Mac Studio", href: "/categories/laptop/mac-studio", }, ];

  const benefits = [ { title: "Official Warranty", description: "All products come with an official manufacturer warranty.", }, { title: "Best Prices in Bangladesh", description: "We offer competitive pricing across all product categories.", }, { title: "Free Nationwide Delivery", description: "Enjoy free delivery on your purchases (conditions apply).", }, { title: "Flexible EMI & Exchange Options", description: "Benefit from easy payment plans and upgrade opportunities.", }, { title: "100% Authentic Products", description: "Shop with confidence knowing you are getting genuine products.", }, { title: "Multiple Store Locations", description: "Visit us in person at any of our convenient locations.", }, { title: "Dazzle Premium Service", description: "Our dedicated support team is here to assist you before and after your purchase.", }, { title: "Dazzle Care+ for Apple Products", description: "Exclusive benefits including direct replacement within one year for eligible issues. (Condition Applied)", }, ];

  const faqs = [
    { q: "Is Dazzle a trusted store for authentic smartphones and gadgets in Bangladesh?", a: "Yes, Dazzle is one of Bangladesh's most trusted stores for smartphones, laptops, and gadgets. We provide genuine, high-quality products from leading brands with official warranties and dedicated customer support." },
    { q: "What brands does Dazzle offer for phones, laptops, and gadgets?", a: "Dazzle carries over 113 popular brands, including Apple, Samsung, Xiaomi, Huawei, Oppo, Vivo, OnePlus, Google, Dell, HP, and more. Our wide selection ensures that you can find the best device for your needs." },
    { q: "Does Dazzle offer a warranty on products?", a: "Yes, all our products come with official warranties. Additionally, Apple products are eligible for Dazzle Care+, which provides further protection and a replacement service within the first year (conditions apply)." },
    { q: "Can I order online from Dazzle and get delivery anywhere in Bangladesh?", a: "Absolutely! Dazzle offers nationwide delivery on all orders placed through our website, allowing you to shop conveniently from home. Free delivery is available on select products (conditions apply)." },
    {
      q: "Does Dazzle offer any installment payment plans?",
      a: (
        <>
          Yes,{" "}
          <Link href="/emi-policy" className="text-blue-700 underline underline-offset-2">
            Dazzle offers an EMI
          </Link>{" "}
          option for purchases above BDT 5,000, available with credit cards from 39 partner banks. You can select installment plans up to 36 months to make purchases more manageable.
        </>
      ),
    },
    {
      q: "What is Dazzle Care+?",
      a: (
        <>
          <Link href="/warranty-policy" className="text-blue-700 underline underline-offset-2">
            Dazzle Care+
          </Link>{" "}
          is an exclusive service for Apple products. It includes hardware and software issue coverage, fast replacement, and a high resale value. This program allows customers to get a replacement device within 3-5 days if any covered issues occur within the first year.
        </>
      ),
    },
    { q: "Can I exchange my old device for a new one at Dazzle?", a: "Yes, Dazzle offers an exchange facility with an exchange bonus. Simply bring your old device, and our team will guide you on the exchange value and the best upgrade options available." },
    { q: "Where are Dazzle's store locations in Bangladesh?", a: "Dazzle has multiple branches across Bangladesh. Dhaka: Jamuna Future Park (North Court and West Court), Centre Point Shopping Mall & Bashundhara Shopping Mall. Chittagong: Finlay Square, Meridian Kohinur City and Sanmar Ocean City. We're also expanding with new locations at Bashundhara City Shopping Mall and Centre Point Shopping Mall in Dhaka." },
    { q: "What customer support does Dazzle provide?", a: "Dazzle offers 24/7 customer support to assist with any inquiries, order updates, and technical issues. You can reach us via our hotline at 09638001122 (10 AM - 10 PM) or contact us through our website or social media." },
    { q: "How can I be sure I'm getting a genuine product from Dazzle?", a: "Dazzle guarantees the authenticity of every product. We source directly from authorized distributors and manufacturers, ensuring every item is genuine and backed by an official warranty." },
    { q: "Does Dazzle accept pre-orders for upcoming devices?", a: "Yes, Dazzle accepts pre-orders for new and upcoming devices. Place your pre-order, and we'll ensure delivery within 15 days for any electronic product you choose." },
    { q: "Can I return or exchange a product if I'm not satisfied?", a: "Dazzle aims for complete customer satisfaction. If you encounter any issues, our support team is ready to assist. For specific return and exchange policies, please contact our team for guidance." },
  ];

  // Each entry of the main grid, kept in the SAME order/markup as before —
  // just pulled into an array so we can slice() it for the show-more toggle.
  const gridSections = [
    // 1
    <div key="best-smartphone" className="rounded-2xl p-6 bg-blue-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Dazzle - The Best Smartphone Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        Dazzle offers an extensive selection of smartphones from leading
        brands to suit every preference and budget. We feature top global
        brands like{" "}
        <Link href="/brands/apple" className="text-blue-700 underline underline-offset-2"> Apple iPhone </Link>,{" "}
        <Link href="/brands/samsung" className="text-blue-700 underline underline-offset-2"> Samsung </Link>,{" "}
        <Link href="/brands/google" className="text-blue-700 underline underline-offset-2"> Google </Link>,{" "}
        <Link href="/brands/xiaomi-1" className="text-blue-700 underline underline-offset-2"> Xiaomi </Link>,{" "}
        <Link href="/brands/oppo" className="text-blue-700 underline underline-offset-2"> Oppo </Link>,{" "}
        <Link href="/brands/vivo" className="text-blue-700 underline underline-offset-2"> Vivo </Link>,{" "}
        <Link href="/brands/oneplus" className="text-blue-700 underline underline-offset-2"> OnePlus </Link>,{" "}
        <Link href="/brands/motorola-1" className="text-blue-700 underline underline-offset-2"> Motorola </Link>,{" "}
        <Link href="/brands/realme" className="text-blue-700 underline underline-offset-2"> Realme </Link>,{" "}
        <Link href="/brands/honor" className="text-blue-700 underline underline-offset-2"> Honor </Link>
        , Nokia, Sony, Huawei, Asus, Infinix, Tecno, ZTE, Poco, iQOO, Nothing
        and many more. With each purchase, enjoy the assurance of 100%
        authenticity, competitive prices, and official warranties, making
        Dazzle the best smartphone retailer in Bangladesh.
      </h2>
    </div>,

    // 2
    <div key="best-tablet" className="rounded-2xl p-6 bg-purple-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Tablet and iPad Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Our tablet collection includes popular models like{" "}
        {tabletBrands.map((tablet, index) => (
          <span key={tablet.href}>
            <Link href={tablet.href} className="text-blue-700 underline underline-offset-2 transition-colors hover:text-blue-900"> {tablet.name} </Link>
            {index < tabletBrands.length - 2 ? ", " : index === tabletBrands.length - 2 ? ", and " : ""}
          </span>
        ))}
        , catering to professionals, students, and casual users alike. With options from Amazon, OnePlus, and Honor, Dazzle ensures a variety of choices for entertainment, productivity, and creative needs, complete with reliable after-sales support and fast delivery.{" "}
      </h2>
    </div>,

    // 3
    <div key="best-laptop" className="rounded-2xl p-6 bg-white-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Laptop Selling Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Whether you’re looking for an{" "}
        {laptopCategories.map((laptop, index) => (
          <span key={`${laptop.name}-${laptop.href}`}>
            <Link href={laptop.href} className="text-blue-700 underline underline-offset-2 transition-colors hover:text-blue-900"> {laptop.name} </Link>
            {index < laptopCategories.length - 2 ? ", " : index === laptopCategories.length - 2 ? ", or " : ""}
          </span>
        ))}
        , Dazzle’s laptop selection has it all. We carry premium brands, offering models for gaming, business, or casual use. Our laptops are available with flexible EMI options, official warranties, and knowledgeable support to help you choose the perfect device for your needs.{" "}
      </h2>
    </div>,

    // 4
    <div key="best-macbook" className="rounded-2xl p-6 bg-yellow-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best MacBook and iMac Selling Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        As a top retailer of Apple products, Dazzle offers a range of MacBooks, iMacs, and Mac Studios. Our Apple inventory caters to professionals seeking high-performance devices for creative tasks, from video editing to design work. Every Apple product at Dazzle includes official warranties and access to our premium support team for a seamless experience.{" "}
      </h2>
    </div>,

    // 5
    <div key="best-apple-gadget" className="rounded-2xl p-6 bg-blue-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Apple Gadget Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Dazzle’s Apple gadget selection extends beyond phones and laptops, offering iPhones, AirPods, Apple Watches,iPads, MacBooks, and iMacs that complete your Apple ecosystem. With our Dazzle Care+ program, enjoy the peace of mind of a direct replacement within a year for many Apple devices, alongside competitive pricing and top-quality customer service.{" "}
      </h2>
    </div>,

    // 6
    <div key="best-online-mobile" className="rounded-2xl p-6 bg-green-50-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Online Mobile Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Dazzle’s online store provides a full range of devices and accessories with the convenience of nationwide delivery. We offer thousands of products, from flagship smartphones to essential accessories, all available online with secure shopping and authentic product guarantees. Experience the quality of Dazzle from the comfort of your home.{" "}
      </h2>
    </div>,

    // 7
    <div key="best-smartwatch" className="rounded-2xl p-6 bg-white-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Smartwatch Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        For wearable technology, Dazzle offers an extensive collection of smartwatches from brands like Apple Watch, Samsung Galaxy Watch, Fitbit, Garmin, Huawei Watch, Amazfit, Fossil, Kieslect, Mibro, Xiaomi Watch, Redmi Watch, Realme Watch, Oppo, Honor, Diesel, Zeblaze, Noise, boAt,iMilab, Kospet, Haylou. Whether you &rsquo; re focused on fitness or connectivity, our selection caters to all needs. Dazzle’s commitment to genuine products, warranties, and competitive pricing makes us a trusted choice for smartwatches in Bangladesh.{" "}
      </h2>
    </div>,

    // 8
    <div key="best-airpods" className="rounded-2xl p-6 bg-yellow-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Top AirPods & Earbuds Shop in Dhaka </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Experience top-quality sound with our wide range of Apple AirPods, True Wireless Earbuds, Bluetooth Headphones, Noise-Cancelling Headphones, Over-Ear and In-Ear Headphones, Bone Conduction Headphones, In-Ear Monitors. Dazzle’s curated audio collection includes True Wireless earbuds, noise-canceling options, and bone-conduction headphones, ensuring you find the perfect match for your listening needs, all backed by official warranties.{" "}
      </h2>
    </div>,

    // 9
    <div key="best-gadgets-accessories" className="rounded-2xl p-6 bg-blue-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Gadget and Accessories Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Dazzle offers a diverse range of gadgets, including Adapters and Cables, Chargers and Power Banks, Screen Protectors and Phone Cases, Laptop Sleeves and MacBook Cases, Keyboards, Mice, Stylus Pens, Wireless Chargers and Charging Docks, External Hard Drives and USB Hubs, Smartwatch Bands and Camera Lens Protectors, Bluetooth Trackers and Car Chargers, Webcams and Docking Stations. Our gadget collection is designed to elevate your lifestyle, with each product carefully selected for quality and durability. Find the latest technology and essential accessories, all guaranteed authentic and competitively priced.{" "}
      </h2>
    </div>,

    // 10
    <div key="best-sound-headphones" className="rounded-2xl p-6 bg-green-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Sounds, Headphones, and Microphone Selling Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        From Adapters and Cables to Chargers, Power Banks, Screen Protectors and Phone Cases, Laptop Sleeves and MacBook Cases, Keyboards, Mice, and Stylus Pens, Wireless Chargers and Charging Docks, External Hard Drives and USB Hubs, Smartwatch Bands and Camera Lens Protectors, Bluetooth Trackers and Car Chargers, Webcams and Docking Stations, Dazzle’s audio section has you covered. We provide top-quality sound equipment for music lovers, gamers, and professionals, ensuring clear audio and reliable performance. Each product comes with a warranty, so you can enjoy the best in sound with complete confidence.{" "}
      </h2>
    </div>,

    // 11
    <div key="best-smart-tv" className="rounded-2xl p-6 bg-white-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Best Smart TV Selling Shop in Bangladesh </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Enhance your home entertainment with Dazzle’s range of Smart TVs from Sony, Samsung, and Xiaomi. Our Smart TVs offer cutting-edge technology, stunning visuals, and seamless connectivity options. With competitive pricing, delivery options, and quality assurance, Dazzle is your trusted source for Smart TVs in Bangladesh.{" "}
      </h2>
    </div>,

    // 12
    <div key="who-is-dazzle" className="rounded-2xl p-6 bg-purple-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Who is Dazzle? </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        Dazzle is a leading retailer in Bangladesh, specializing in smartphones, laptops, tablets, smartwatches, gadgets, and accessories. Since 2015, Dazzle has served over 987,000 unique customers, delivered more than 1.89 million products, and built a strong community of over 1.9 million social media followers. With over 13,000 5-star Google reviews, 11 physical showrooms, a dedicated team of 187+ employees and more than 13,000 successful warranty claims, Dazzle has maintained a 99.7% customer satisfaction rate. Additionally, Dazzle operates global hubs in Dubai, Hong Kong and Singapore.{" "}
      </h2>
    </div>,

    // 13
    <div key="why-buy-from-dazzle" className="rounded-2xl p-6 bg-blue-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Why Should You Buy from Dazzle? </h1>
      <ul className="list-disc space-y-2 pl-6 font-[Georgia,serif] text-base leading-[1.38] my-4 text-black dark:text-white">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="pl-1">
            <strong className="font-bold"> {benefit.title} </strong> {": "} <span>{benefit.description}</span>
          </li>
        ))}
      </ul>
    </div>,

    // 14
    <div key="social-presence" className="rounded-2xl p-6 bg-green-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Dazzle’s Social Presence and Reputation </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {" "}
        With a strong social media presence of over 1.2 million followers on Facebook, Dazzle engages actively with its community. We value our customers&lsquo; feedback and continuously strive to improve. Our reputation is built on transparency, reliability, and customer satisfaction.{" "}
      </h2>
    </div>,

    // 15
    <div key="shop-address-map" className="rounded-2xl p-6 bg-white-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Dazzle’s Shop Address and Map </h1>
      <div className="my-4 space-y-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        <h2>
          <strong className="font-bold">Hotline</strong>: 09638001122
        </h2>

        <div>
          <h2 className="font-bold">Dhaka Locations:</h2>
          <ol className="mt-2 list-decimal space-y-3 pl-6">
            <li>
              <h2 className="font-bold">Jamuna Future Park</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop 1: 021C &amp; 021D, Block-B, 4th Floor, Kuril Pragoti Shoroni, Dhaka.</li>
                <li>Shop 2: 4A-022B, Level-4, Block-A, Dhaka-1229.</li>
                <li>Shop 3: 4A-025A, Level 4, West court, Block A, Dhaka - 1229</li>
              </ul>
            </li>
            <li>
              <h2 className="font-bold">Bashundhara Shopping Mall</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop 1: 88 &amp; 89, Level 6, Block D, Bashundhara Shopping Mall, Dhaka 1229 (Laptop, Tablet and gadgets)</li>
                <li>Shop 2: 23, Basement 1, Bashundhara Shopping Mall, Dhaka 1229 (Mobile Phones and gadgets)</li>
              </ul>
            </li>
            <li>
              <h2 className="font-bold">Centre Point Shopping Mall</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop No: A19 &amp; A20, Level-4, Centre point shopping mall, Dhaka Mymensingh Highway, Near Dhaka airport, Dhaka</li>
              </ul>
            </li>
            <li>
              <h2 className="font-bold">Dazzle Hypermarket - Bashundhara City Shopping Mall</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop No: 35 to 51, Block-B, Level 7 (Gold Floor), Bashundhara City Shopping Mall, Dhaka</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <h2 className="font-bold">Chittagong Locations:</h2>
          <ol className="mt-2 list-decimal space-y-3 pl-6">
            <li>
              <h2 className="font-bold">Finlay Square Branch</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop No: 414 &amp; 429, 4th Floor, East Nasirabad, Chittagong</li>
              </ul>
            </li>
            <li>
              <h2 className="font-bold">Meridian Kohinoor City Branch</h2>
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>Shop No: 509 &amp; 510, 5th floor, Wasa Circle, 344 Mohammad Ali road, Chittagong</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>,

    // 16
    <div key="awards" className="rounded-2xl p-6 bg-purple-50 dark:bg-[#1b1b1b] shadow-sm">
      <h1 className="font-bold"> Dazzle’s Awards and Acknowledgments </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        Dazzle has been recognized for excellence in retail and customer service within the tech industry. Our dedication to quality and innovation has earned us accolades, reinforcing our position as a leader in Bangladesh’s gadget retail market.
      </h2>
    </div>,
  ];

  // Testimonials + FAQ — kept in their own grid-cols-1 block, same as before,
  // but now gated behind the same "Read More" toggle as the rest of the grid.
  const extraSections = [
    <div key="testimonials" className="rounded-2xl p-6 bg-blue-50 dark:bg-[#1b1b1b] shadow-sm mb-4">
      <h1 className="font-bold"> Why Customers Believe in Us and What They Say About Us </h1>
      <h2 className="my-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        Our customers trust Dazzle for our commitment to authenticity and exceptional service. Testimonials highlight our reliable after-sales support, wide product range, and the overall seamless shopping experience. We are proud to have built lasting relationships with our customers.
      </h2>
    </div>,

    <div key="faqs" className="rounded-2xl p-6 bg-green-50 dark:bg-[#1b1b1b] shadow-sm sm:col-span-2">
      <h1 className="font-bold"> Frequently Asked Questions about Dazzle </h1>
      <div className="my-4 space-y-4 font-[Georgia,serif] text-base leading-[1.38] text-black dark:text-white">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <h2 className="font-bold">{`${i + 1}. ${faq.q}`}</h2>
            <h2 className="mt-1">{faq.a}</h2>
          </div>
        ))}
      </div>
    </div>,
  ];

  const VISIBLE_COUNT = 4;
  const visibleSections = showAll ? gridSections : gridSections.slice(0, VISIBLE_COUNT);
  const hasMore = gridSections.length > VISIBLE_COUNT;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 lg:px-0">
        {visibleSections}
      </div>

  

      {showAll && (
        <div className="grid grid-cols-1 p-4 lg:px-0">
          {extraSections}
        </div>
      )}

          {hasMore && (
        <div className="flex justify-center p-4 lg:px-0">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="rounded-full px-6 py-2 text-sm font-semibold text-black-700 border border-gray-700 hover:bg-gray-700 dark:bg-[#2e2b28] hover:text-white dark:text-white transition-colors"
          >

            {/* mt-auto w-full flex items-center justify-between bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gray-700 dark:bg-[#2e2b28] transition-colors */}
            {showAll ? "Show Less" : "Read More"}
          </button>
        </div>
      )}
    </div>
  );
}