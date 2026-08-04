"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks"; 

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeColor?: string;
};

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 10.204C0 7.915 0 6.771 0.52 5.823C1.038 4.874 1.987 4.286 3.884 3.108L5.884 1.867C7.889 0.622 8.892 0 10 0C11.108 0 12.11 0.622 14.116 1.867L16.116 3.108C18.013 4.286 18.962 4.874 19.481 5.823C20 6.772 20 7.915 20 10.203V11.725C20 15.625 20 17.576 18.828 18.788C17.656 20 15.771 20 12 20H8C4.229 20 2.343 20 1.172 18.788C0.000999928 17.576 0 15.626 0 11.725V10.204Z"
      fill="#E9CCAE"
    />
  </svg>
);

const OfferIcon = ({ active }: { active: boolean }) => (
   <svg
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    style={{ opacity: active ? 1 : 0.4, transition: "opacity 0.2s" }}
  >
    <path d="M252 128
             C 230 95, 210 55, 165 32
             C 128 13, 90 20, 78 52
             C 68 80, 88 105, 120 112
             C 155 120, 200 118, 252 128
             Z
             M232 108
             C 195 98, 165 90, 143 78
             C 120 65, 108 50, 113 38
             C 118 27, 138 27, 158 40
             C 190 62, 215 88, 232 108
             Z"
      fill="#c0392b"
      fillRule="evenodd"
    />

    <path d="M260 128
             C 282 95, 302 55, 347 32
             C 384 13, 422 20, 434 52
             C 444 80, 424 105, 392 112
             C 357 120, 312 118, 260 128
             Z
             M280 108
             C 317 98, 347 90, 369 78
             C 392 65, 404 50, 399 38
             C 394 27, 374 27, 354 40
             C 322 62, 297 88, 280 108
             Z"
      fill="#c0392b"
      fillRule="evenodd"
    />

    <path d="M20 230
             L20 430
             C20 460, 44 484, 74 484
             L438 484
             C468 484, 492 460, 492 430
             L492 230
             Z"
      fill="#f0c419"
    />

    <path d="M45 133
             L467 133
             C481 133, 492 144, 492 158
             L492 210
             C492 224, 481 235, 467 235
             L45 235
             C31 235, 20 224, 20 210
             L20 158
             C20 144, 31 133, 45 133 Z"
      fill="#f0c419"
    />

    <rect x="20" y="222" width="472" height="30" fill="#e8890c" opacity="0.85" />

    <path d="M20 430
             C20 460, 44 484, 74 484
             L438 484
             C468 484, 492 460, 492 430
             L492 462
             C492 474, 482 484, 470 484
             L42 484
             C30 484, 20 474, 20 462
             Z"
      fill="#e8890c"
      opacity="0.85"
    />

    <rect x="212" y="133" width="88" height="351" fill="#e74c3c" />
    <rect x="212" y="222" width="88" height="30" fill="#c0392b" opacity="0.9" />

    <path d="M234 100
             C 234 78, 244 62, 256 62
             C 268 62, 278 78, 278 100
             C 278 118, 268 133, 256 133
             C 244 133, 234 118, 234 100 Z"
      fill="#e74c3c"
    />
  </svg>
);

const CategoriesIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.4204 7.52097C17.2901 7.52097 18.8059 6.00523 18.8059 4.13548C18.8059 2.26573 17.2901 0.75 15.4204 0.75C13.5506 0.75 12.0349 2.26573 12.0349 4.13548C12.0349 6.00523 13.5506 7.52097 15.4204 7.52097Z"
      stroke="#E7E7E7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.13548 18.8061C6.00523 18.8061 7.52097 17.2904 7.52097 15.4206C7.52097 13.5509 6.00523 12.0352 4.13548 12.0352C2.26573 12.0352 0.75 13.5509 0.75 15.4206C0.75 17.2904 2.26573 18.8061 4.13548 18.8061Z"
      stroke="#E7E7E7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0349 12.0349H18.8059V17.6774C18.8059 17.9767 18.687 18.2637 18.4754 18.4754C18.2637 18.687 17.9767 18.8059 17.6774 18.8059H13.1634C12.8641 18.8059 12.5771 18.687 12.3655 18.4754C12.1538 18.2637 12.0349 17.9767 12.0349 17.6774V12.0349ZM0.75 0.75H7.52097V6.39247C7.52097 6.69177 7.40207 6.9788 7.19044 7.19044C6.9788 7.40207 6.69177 7.52097 6.39247 7.52097H1.87849C1.5792 7.52097 1.29216 7.40207 1.08053 7.19044C0.868895 6.9788 0.75 6.69177 0.75 6.39247V0.75Z"
      stroke="#E7E7E7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PreorderIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.94824 0.599609H14.6836C15.4058 0.599657 16.0746 0.937337 16.4844 1.49121L18.6279 4.38965V4.39062C18.8932 4.74851 19.0322 5.17317 19.0322 5.60742L19.0361 16.9277C19.0361 18.0706 18.0669 19.0361 16.8311 19.0361H2.80566C1.56977 19.0361 0.599609 18.0706 0.599609 16.9277V5.60742C0.599609 5.17724 0.740619 4.75179 1.00391 4.39062L3.15137 1.49121C3.5614 0.936963 4.23101 0.599702 4.94824 0.599609ZM4.4707 2.35156L2.9668 4.38281L2.25879 5.33984H17.3818L16.6738 4.38281L15.1699 2.35156L14.9902 2.1084H4.65039L4.4707 2.35156Z"
      stroke="#E7E7E7"
      strokeWidth="1.2"
    />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.5714 12C15.2534 12 15.9075 12.2709 16.3897 12.7532C16.8719 13.2354 17.1429 13.8894 17.1429 14.5714V15.1843C17.1429 18.2503 13.5343 20.5714 8.57143 20.5714C3.60857 20.5714 0 18.3711 0 15.1843V14.5714C0 13.8894 0.270918 13.2354 0.753154 12.7532C1.23539 12.2709 1.88944 12 2.57143 12H14.5714ZM14.5714 13.2857H2.57143C2.25195 13.2857 1.94391 13.4046 1.70734 13.6194C1.47076 13.8341 1.3226 14.1292 1.29171 14.4471L1.28571 14.5714V15.1843C1.28571 17.4763 4.19057 19.2857 8.57143 19.2857C12.7937 19.2857 15.7329 17.4814 15.8537 15.3223L15.8571 15.1843V14.5714C15.8572 14.2519 15.7382 13.9439 15.5235 13.7073C15.3088 13.4708 15.0137 13.3226 14.6957 13.2917L14.5714 13.2857ZM8.57143 0C9.2468 -1.00638e-08 9.91556 0.133024 10.5395 0.391477C11.1635 0.649929 11.7304 1.02875 12.208 1.50631C12.6855 1.98387 13.0644 2.55081 13.3228 3.17477C13.5813 3.79873 13.7143 4.46749 13.7143 5.14286C13.7143 5.81823 13.5813 6.48698 13.3228 7.11094C13.0644 7.7349 12.6855 8.30185 12.208 8.7794C11.7304 9.25696 11.1635 9.63578 10.5395 9.89424C9.91556 10.1527 9.2468 10.2857 8.57143 10.2857C7.20746 10.2857 5.89935 9.74388 4.93488 8.7794C3.97041 7.81493 3.42857 6.50683 3.42857 5.14286C3.42857 3.77889 3.97041 2.47078 4.93488 1.50631C5.89935 0.541835 7.20746 2.03247e-08 8.57143 0ZM8.57143 1.28571C7.54845 1.28571 6.56737 1.69209 5.84402 2.41544C5.12066 3.1388 4.71429 4.11988 4.71429 5.14286C4.71429 6.16583 5.12066 7.14691 5.84402 7.87027C6.56737 8.59362 7.54845 9 8.57143 9C9.59441 9 10.5755 8.59362 11.2988 7.87027C12.0222 7.14691 12.4286 6.16583 12.4286 5.14286C12.4286 4.11988 12.0222 3.1388 11.2988 2.41544C10.5755 1.69209 9.59441 1.28571 8.57143 1.28571Z" fill="#E7E7E7"/>
</svg>

);

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: null },
  { id: "offer", label: "Offer", icon: null },
  { id: "categories", label: "Category", icon: null },
  { id: "pre-order", label: "Pre-order", icon: null },
  { id: "profile", label: "Profile", icon: null },
];

export default function MobileFooter() {
  const [active, setActive] = useState("home");
  const pathname = usePathname();
const token = useAppSelector((state) => state.auth.token);


  const isProductDetail = /^\/product\/.+/.test(pathname);
  if (isProductDetail) return null;

  const renderIcon = (id: string) => {
    const isActive = active === id;
    switch (id) {
      case "home":
        return <HomeIcon active={isActive} />;
      case "offer":
        return <OfferIcon active={isActive} />;
      case "categories":
        return <CategoriesIcon active={isActive} />;
      case "pre-order":
        return <PreorderIcon active={isActive} />;
      case "profile":
        return <ProfileIcon active={isActive} />;
    }
  };

  const getHref = (id: string) => {
    if (id === "home") return "/";
    if (id === "profile") return token ? "/profile" : "/auth/login";
    return id;
  };

  return (
    <div className="fixed bottom-0 z-10 w-full flex justify-center p-3">
      <nav
        className="grid grid-cols-5 gap-1 px-2 py-2 w-full rounded-[28px]"
        style={{
          background: "#1c1a17",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <Link
              href={getHref(item.id)}
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                w-full flex flex-col items-center justify-center gap-1
                py-2 rounded-[18px]
                transition-all duration-300 ease-out
                ${isActive ? "bg-[#2a2520]" : "hover:bg-[#232018]"}
            `}
              style={
                isActive
                  ? {
                      boxShadow:
                        "0 2px 16px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }
                  : {}
              }
            >
              {/* Icon */}
              <div
                className="transition-transform duration-300"
                style={{
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              >
                {renderIcon(item.id)}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-medium tracking-wide whitespace-nowrap"
                style={{
                  color: isActive ? "#c9a96e" : "#6b7280",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
