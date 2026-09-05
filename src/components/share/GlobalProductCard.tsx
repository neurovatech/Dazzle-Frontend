// Server Component — no "use client".
//
// This card renders ~40 times on the homepage and on every listing page. It used
// to be a single 455-line Client Component, so all of that markup (badges,
// image wrapper, title, tooltip, price block with two inline SVGs) hydrated on
// every instance even though none of it changes after render.
//
// Now only the genuinely interactive parts are client islands:
//   • ProductCardImage    — onError fallback to the placeholder
//   • ProductCardWishlist — Redux wishlist toggle
//   • ProductCardBuy      — cart state, variant lookup, quick view
//
// The public props API is unchanged, so no call site needs updating.
import React from "react";
import Link from "next/link";
import { CompareIcon } from "@/icon";
import ProductImage from "@/images/product.png";
import ProductCardImage from "./ProductCardImage";
import ProductCardWishlist from "./ProductCardWishlist";
import ProductCardBuy from "./ProductCardBuy";
export type { DefaultVariantResponse } from "./ProductCardBuy";

interface ProductCardProps {
  productUuid?: string;
  image?: string;
  discount?: number;
  badge?: string;
  title?: string;
  inStock?: boolean;
  price?: number;
  originalPrice?: number;
  isBestDeal?: boolean;
  slug?: string;
  uuid?: string;
  minBookingPrice?: number;
  /**
   * "To be announced" — listed in the catalogue but not yet purchasable.
   *
   * Defaults to the inverse of `inStock`, because that is exactly how every
   * call site already derives it (`inStock: !item.isTba`). That default is what
   * lets the flag appear correctly across all 33 usages without editing each
   * one; a call site holding the raw API item can still pass isTba explicitly.
   */
  isTba?: boolean;
}

const formatPrice = (val: number) =>
  val > 0 ? "" + val.toLocaleString("en-IN") : "0";

const ProductCard: React.FC<ProductCardProps> = ({
  productUuid,
  image = "",
  discount = 0,
  badge,
  title = "Product",
  inStock = true,
  price = 0,
  originalPrice = 0,
  isBestDeal = false,
  slug,
  uuid,
  minBookingPrice = 0,
  isTba,
}) => {
  const itemId = productUuid || uuid || "";
  // Explicit prop wins; otherwise fall back to the inverse of inStock.
  const showTbaFlag = isTba ?? !inStock;
  const href = `/product/${slug || title?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      data-product-uuid={itemId}
      className="group relative bg-white rounded-2xl sm:rounded-3xl cursor-pointer w-full h-full flex flex-col shadow-lg transition-all duration-500 hover:shadow-sm select-none"
    >
      <div className="bg-white p-2 sm:p-3 lg:p-4 pb-0! rounded-2xl sm:rounded-3xl relative">
        {/* Top Badges */}
        <div className="flex justify-between items-start mb-2 sm:mb-3 h-5 sm:h-6 absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-50">
          {discount > 0 ? (
            <span className="bg-[#ff7575] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              {discount}%
            </span>
          ) : (
            <span />
          )}
          {badge ? (
            <span className="bg-[linear-gradient(93.36deg,#222222_-28.88%,#6D3F0E_93.21%)] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md max-w-[80%]">
              {badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Product Image — fixed-height, never crops, contains full image */}
        <Link href={href} className="block px-2 pt-2">
          <div className="relative flex justify-center items-center h-42 transition-all duration-500">
            <div className="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-105">
              <ProductCardImage
                src={image || ProductImage}
                alt={title || "Product image"}
              />
            </div>
          </div>
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between relative z-50">
          

          {isBestDeal === true && (
            <button className="ml-auto bg-[#087400] text-white text-[8px] sm:text-xs font-bold px-1 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md lg:w-[50%]! w-[80%] flex justify-center items-center gap-1">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_3253_13820)">
                  <path
                    d="M3.61152 4.13683C3.55363 4.75433 3.51301 5.84714 3.87762 6.3123C3.87762 6.3123 3.70598 5.11183 5.24465 3.60566C5.86418 2.99933 6.00738 2.17464 5.79106 1.55613C5.66817 1.20574 5.44371 0.916282 5.24871 0.714173C5.13496 0.595344 5.22231 0.399329 5.38785 0.406438C6.38926 0.451126 8.01223 0.729407 8.70184 2.46003C9.00449 3.21972 9.02684 4.0048 8.88262 4.80308C8.79121 5.31292 8.46621 6.44636 9.20762 6.5855C9.73676 6.68503 9.9927 6.26457 10.1075 5.96191C10.1552 5.83597 10.3207 5.80449 10.4101 5.90503C11.3039 6.92168 11.38 8.1191 11.1952 9.14996C10.8377 11.1426 8.81965 12.5929 6.81481 12.5929C4.31027 12.5929 2.3166 11.1599 1.79965 8.56597C1.59145 7.51886 1.69707 5.44699 3.31191 3.98449C3.43176 3.8748 3.62777 3.9723 3.61152 4.13683Z"
                    fill="url(#paint0_radial_3253_13820)"
                  />
                  <path
                    d="M7.72987 7.86271C6.80667 6.67443 7.22003 5.31857 7.44651 4.77826C7.47698 4.70717 7.39573 4.64013 7.33174 4.68381C6.93464 4.95396 6.12112 5.58974 5.74229 6.48451C5.2294 7.69412 5.26596 8.28623 5.56964 9.00935C5.75245 9.44506 5.54018 9.53748 5.43354 9.55373C5.32995 9.56998 5.23448 9.50092 5.15831 9.42881C4.93922 9.2184 4.78307 8.95111 4.70737 8.65693C4.69112 8.59396 4.60885 8.5767 4.57128 8.62849C4.2869 9.02154 4.13963 9.65224 4.13253 10.0981C4.11018 11.4763 5.2487 12.5935 6.62588 12.5935C8.36159 12.5935 9.62604 10.674 8.6287 9.06928C8.33924 8.60209 8.06706 8.29638 7.72987 7.86271Z"
                    fill="url(#paint1_radial_3253_13820)"
                  />
                </g>
                <defs>
                  <radialGradient
                    id="paint0_radial_3253_13820"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-7.16899 -0.0311134 -0.0511149 11.7629 6.31875 12.6245)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.314" stopColor="#FF9800" />
                    <stop offset="0.662" stopColor="#FF6D00" />
                    <stop offset="0.972" stopColor="#F44336" />
                  </radialGradient>
                  <radialGradient
                    id="paint1_radial_3253_13820"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-0.0757642 7.50066 5.64481 0.0570107 6.72135 5.49005)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.214" stopColor="#FFF176" />
                    <stop offset="0.328" stopColor="#FFF27D" />
                    <stop offset="0.487" stopColor="#FFF48F" />
                    <stop offset="0.672" stopColor="#FFF7AD" />
                    <stop offset="0.793" stopColor="#FFF9C4" />
                    <stop
                      offset="0.822"
                      stopColor="#FFF8BD"
                      stopOpacity="0.804"
                    />
                    <stop
                      offset="0.863"
                      stopColor="#FFF6AB"
                      stopOpacity="0.529"
                    />
                    <stop
                      offset="0.91"
                      stopColor="#FFF38D"
                      stopOpacity="0.209"
                    />
                    <stop offset="0.941" stopColor="#FFF176" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="clip0_3253_13820">
                    <rect width="13" height="13" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="pt-.5 lg:pt-0"> Best Deal </span>
            </button>
          )}

          <div
            className="flex gap-1 sm:gap-2 ml-auto p-1 -mr-2 sm:-mr-2 lg:-mr-4 bg-[#F5F5F5] pl-2 [--r:20px] sm:[--r:26px] w-[110px]"
            style={{
              clipPath: `shape(
      from 0 100%,
      curve by var(--r) calc(-1 * var(--r)) with var(--r) 0,
      vline to var(--r),
      curve by var(--r) calc(-1 * var(--r)) with 0 calc(-1 * var(--r)),
      hline to 100%,
      vline to 100%,
      hline to 0
    )`,
            }}
          >
            <ProductCardWishlist
              productUuid={itemId}
              title={title || ""}
              slug={slug || ""}
              image={image || ""}
              price={price}
              originalPrice={originalPrice}
              discount={discount}
              badge={badge || ""}
              inStock={inStock}
              isBestDeal={isBestDeal}
            />
            {/* Compare */}
            <Link
              href="/product-compare"
              className="w-8 h-8 mt-1 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Compare"
            >
              <CompareIcon />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-1 bg-[#F5F5F5] rounded-tl-2xl rounded-b-2xl">
        {/* Title & Stock */}
        <div className="text-left">
          <Link href={href}>
            <h3
              className="font-semibold dark:text-[#222] text-[15px] leading-[1.5] line-clamp-2 h-11 text-[#575757] max-[640px]:text-[13px]"
              title={title}
            >
              <span className="hidden sm:inline">
                {title.length > 40 ? title.slice(0, 40) + "..." : title}
              </span>

              <span className="inline sm:hidden">
                {title.length > 30 ? title.slice(0, 30) + "..." : title}
              </span>

              {/* showTbaFlag=true হলে stock status দেখাবে না */}
              {!showTbaFlag && (
                inStock ? (
                  <span className="text-[#03A000] font-bold"> In Stock </span>
                ) : (
                  <span className="text-[#f00]"> Out Of Stock </span>
                )
              )}
            </h3>
          </Link>
          <div
            role="tooltip"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[60] w-max max-w-[220px] whitespace-normal rounded-lg bg-gray-900 text-white text-[10px] sm:text-xs px-2.5 py-1.5 shadow-lg opacity-0 scale-95 origin-bottom transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 "
          >
            {title}
            {/* little arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>

        {/* Price */}
        <Link href={href} className="flex items-baseline gap-2 sm:gap-2 mb-2 sm:mb-4">
          {showTbaFlag ? (
            /* TBA mode — price ও stock সব লুকাও, শুধু TBA badge */
            <div className="bg-[#6D3F0E] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              TBA
            </div>
          ) : (
            <>
              {/* Figma: Urbanist Bold 20px, line-height 160% */}
              <span className="items-center flex gap-1 font-bold text-[20px] leading-[1.6] tracking-[0%] text-gray-900">
                <svg
                  width="12"
                  height="14"
                  viewBox="0 0 12 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.05292 0.00767491C0.539583 -0.0591029 0.0729167 0.317281 0.0116667 0.848469C-0.0495833 1.37966 0.309167 1.86835 0.819583 1.93513L1.05 1.96548C1.51667 2.02619 1.86667 2.439 1.86667 2.93072V3.88686H0.7C0.312083 3.88686 0 4.21164 0 4.61535C0 5.01905 0.312083 5.34383 0.7 5.34383H1.86667V10.6861C1.86667 12.2948 3.12083 13.6 4.66667 13.6H5.6C8.69167 13.6 11.2 10.9896 11.2 7.77212V6.8008C11.2 5.19206 9.94583 3.88686 8.4 3.88686H7.93333C7.41708 3.88686 7 4.32092 7 4.85817C7 5.39543 7.41708 5.82949 7.93333 5.82949H8.4C8.91625 5.82949 9.33333 6.26354 9.33333 6.8008V7.77212C9.33333 9.91811 7.66208 11.6574 5.6 11.6574H4.66667C4.15042 11.6574 3.73333 11.2233 3.73333 10.6861V5.34383H4.9C5.28792 5.34383 5.6 5.01905 5.6 4.61535C5.6 4.21164 5.28792 3.88686 4.9 3.88686H3.73333V2.93072C3.73625 1.45858 2.68625 0.217114 1.28333 0.0349929L1.05292 0.00463937V0.00767491Z"
                    fill="#101518"
                  />
                </svg>
                {formatPrice(price)}
              </span>
              {originalPrice > 0 && originalPrice !== price && (
                // Figma: Urbanist Regular 14px, line-height 160%, strikethrough
                <span className="text-gray-400 text-[14px] font-normal leading-[1.6] line-through flex items-center gap-1 pl-1">
                  <svg
                    width="9"
                    height="10"
                    viewBox="0 0 9 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.789687 0.0055311C0.404687 -0.0425939 0.0546875 0.228656 0.00875003 0.611468C-0.0371875 0.994281 0.231875 1.34647 0.614687 1.39459L0.7875 1.41647C1.1375 1.46022 1.4 1.75772 1.4 2.11209V2.80116H0.525C0.234062 2.80116 0 3.03522 0 3.32616C0 3.61709 0.234062 3.85116 0.525 3.85116H1.4V7.70116C1.4 8.86053 2.34063 9.80116 3.5 9.80116H4.2C6.51875 9.80116 8.4 7.91991 8.4 5.60116V4.90116C8.4 3.74178 7.45937 2.80116 6.3 2.80116H5.95C5.56281 2.80116 5.25 3.11397 5.25 3.50116C5.25 3.88834 5.56281 4.20116 5.95 4.20116H6.3C6.68719 4.20116 7 4.51397 7 4.90116V5.60116C7 7.14772 5.74656 8.40116 4.2 8.40116H3.5C3.11281 8.40116 2.8 8.08834 2.8 7.70116V3.85116H3.675C3.96594 3.85116 4.2 3.61709 4.2 3.32616C4.2 3.03522 3.96594 2.80116 3.675 2.80116H2.8V2.11209C2.80219 1.05116 2.01469 0.156468 0.9625 0.0252185L0.789687 0.00334347V0.0055311Z"
                      fill="#747474"
                    />
                  </svg>
                  {formatPrice(originalPrice)}
                </span>
              )}
            </>
          )}
        </Link>

        {/* Bottom Actions */}
        <ProductCardBuy
          itemId={itemId}
          title={title || "Product"}
          slug={slug || ""}
          image={image || ""}
          price={price}
          originalPrice={originalPrice}
          inStock={inStock}
          minBookingPrice={minBookingPrice}
          showTbaFlag={showTbaFlag}
        />
      </div>
    </div>
  );
};

export default ProductCard;
