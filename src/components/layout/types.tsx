import {
  AirpodIcon,
  CoverIcon,
  GadgetIcon,
  LaptopIcon,
  MobileIcon,
  ProtectorIcon,
  SoundIcon,
  TabletIcon,
  WatchIcon,
} from "@/icon";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  badgeCount?: string;
}

export interface CategoryChild {
  label: string;
  count: number;
  logo?: string;
}

export interface CategoryItem {
  label: string;
  logo?: string;
  icon: React.ReactNode;
  children?: CategoryChild[];
}

export const topNavItems: NavItem[] = [
  { label: "New Blogs", href: "/blogs" },
  { label: "EMI Policy", href: "/emi-policy" },
];

export const mainNavItems: NavItem[] = [
  { label: "Brand", href: "/brands" },
  { label: "Online Exclusive", href: "/online-exclusive" },
  { label: "Offer", href: "/offer", badge: "offer", badgeCount: "" },
  { label: "Pre-Order", href: "/pre-order" },
];

// export const categoryNavItems = [
//   "Smartphone", "Tablets", "Laptop", "Smartwatch",
//   "Sound Appliance", "Gadgets", "Accessories", "Smart TV",
// ];
export const categoryNavItems = [
  {
    id: "cat-1",
    name: "Phones",
    slug: "phones",
    thumbnail: "/images/categories/1.svg",
    submenu: [
      { id: "ph-1", name: "ZTE", slug: "zte" },
      { id: "ph-2", name: "iPhone", slug: "iphone" },
      { id: "ph-3", name: "Oppo", slug: "oppo" },
      { id: "ph-4", name: "Vivo", slug: "vivo" },
      { id: "ph-5", name: "Motorola", slug: "motorola" },
      { id: "ph-6", name: "Realme", slug: "realme" },
      { id: "ph-7", name: "Asus", slug: "asus" },
      { id: "ph-8", name: "Infinix", slug: "infinix" },
      { id: "ph-9", name: "Tecno", slug: "tecno" },
      { id: "ph-10", name: "Poco", slug: "poco" },
      { id: "ph-11", name: "iQOO", slug: "iqoo" },
      { id: "ph-12", name: "Samsung", slug: "samsung" },
      { id: "ph-13", name: "Google", slug: "google" },
      { id: "ph-14", name: "Xiaomi", slug: "xiaomi" },
      { id: "ph-15", name: "OnePlus", slug: "oneplus" },
      { id: "ph-16", name: "Honor", slug: "honor" },
      { id: "ph-17", name: "Huawei", slug: "huawei" },
      { id: "ph-18", name: "Nothing", slug: "nothing" },
    ],
  },
  {
    id: "cat-2",
    name: "Tablet",
    slug: "tablet",
    thumbnail: "/images/categories/2.svg",
    submenu: [
      { id: "tb-1", name: "ZTE Tablet", slug: "zte-tablet" },
      { id: "tb-2", name: "Motorola Tablet", slug: "motorola-tablet" },
      { id: "tb-3", name: "OnePlus Tab", slug: "oneplus-tab" },
      { id: "tb-4", name: "Huawei Tablet", slug: "huawei-tablet" },
      { id: "tb-5", name: "iPad", slug: "ipad" },
      { id: "tb-6", name: "Pixel Tablet", slug: "pixel-tablet" },
      { id: "tb-7", name: "Amazon", slug: "amazon" },
      { id: "tb-8", name: "Samsung TAB", slug: "samsung-tab" },
    ],
  },
  {
    id: "cat-3",
    name: "Laptop",
    slug: "laptop",
    thumbnail: "/images/categories/3.svg",
    submenu: [
      { id: "lp-1", name: "Mac Mini", slug: "mac-mini" },
      { id: "lp-2", name: "Monitor", slug: "monitor" },
      { id: "lp-3", name: "Microsoft", slug: "microsoft" },
      { id: "lp-4", name: "Apple Macbook", slug: "apple-macbook" },
      { id: "lp-5", name: "Gaming Laptop", slug: "gaming-laptop" },
      { id: "lp-6", name: "Lenovo", slug: "lenovo" },
      { id: "lp-7", name: "Dell", slug: "dell" },
      { id: "lp-8", name: "HP", slug: "hp" },
    ],
  },
  {
    id: "cat-4",
    name: "Smart Watch",
    slug: "smart-watch",
    thumbnail: "/images/categories/4.svg",
    submenu: [
      { id: "sw-1", name: "Apple Watch", slug: "apple-watch" },
      {
        id: "sw-2",
        name: "Samsung Galaxy Watch",
        slug: "samsung-galaxy-watch",
      },
      { id: "sw-3", name: "FitBit", slug: "fitbit" },
      { id: "sw-4", name: "Garmin", slug: "garmin" },
      { id: "sw-5", name: "Amazfit", slug: "amazfit" },
      { id: "sw-6", name: "Noise", slug: "noise" },
      { id: "sw-7", name: "boAt", slug: "boat" },
    ],
  },
  {
    id: "cat-5",
    name: "Gadget",
    slug: "gadget",
    thumbnail: "/images/categories/6.svg",
    submenu: [
      { id: "gd-1", name: "Camera", slug: "camera" },
      { id: "gd-2", name: "Earbuds", slug: "earbuds" },
      { id: "gd-3", name: "AirPods", slug: "airpods" },
      { id: "gd-4", name: "VR Headsets", slug: "vr-headsets" },
      { id: "gd-5", name: "Router", slug: "router" },
    ],
  },
  {
    id: "cat-6",
    name: "Accessories",
    slug: "accessories",
    thumbnail: "/images/categories/7.svg",
    submenu: [
      { id: "ac-1", name: "Chargers", slug: "chargers" },
      { id: "ac-2", name: "Power Banks", slug: "power-banks" },
      { id: "ac-3", name: "Phone Cases", slug: "phone-cases" },
      { id: "ac-4", name: "Mouse", slug: "mouse" },
      { id: "ac-5", name: "Tripod", slug: "tripod" },
    ],
  },
  {
    id: "cat-7",
    name: "Sounds",
    slug: "sounds",
    thumbnail: "/images/categories/5.svg",
    submenu: [
      { id: "sd-1", name: "Bluetooth Speakers", slug: "bluetooth-speakers" },
      { id: "sd-2", name: "Soundbars", slug: "soundbars" },
      { id: "sd-3", name: "Amplifier", slug: "amplifier" },
    ],
  },
  {
    id: "cat-8",
    name: "Smart TV",
    slug: "smart-tv",
    thumbnail: "/images/categories/8.svg",
    submenu: [
      { id: "tv-1", name: "Samsung TV", slug: "samsung-tv" },
      { id: "tv-2", name: "Xiaomi TV", slug: "xiaomi-tv" },
      { id: "tv-3", name: "Sony", slug: "sony" },
      { id: "tv-4", name: "Hisense", slug: "hisense" },
    ],
  },
];

export const exploreCategories: CategoryItem[] = [
  {
    label: "Mobile",
    icon: <MobileIcon />,
    children: [
      { label: "iPhone", count: 16, logo: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F29366%2Fapple.jpg&w=256&q=75" },
      { label: "Samsung", count: 16, logo: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F29367%2FSAMSUNG.jpg&w=256&q=75" },
      { label: "Xioame", count: 12, logo: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F45205%2Flogo(1).jpg&w=256&q=75" },
      { label: "Motorala", count: 0, logo: "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F45206%2Flogo(2).jpg&w=256&q=75" },
    ],
  },
  {
    label: "Tablets",
    icon: <TabletIcon />,

  },
  { label: "Laptops", icon: <LaptopIcon /> },
  { label: "Smart Watchs", icon: <WatchIcon /> },
  { label: "Gadgets", icon: <GadgetIcon /> },
  { label: "Airpods", icon: <AirpodIcon /> },
  { label: "Sound", icon: <SoundIcon /> },
  { label: "Phone cover", icon: <CoverIcon /> },
  { label: "Screen Protector", icon: <ProtectorIcon /> },
];
