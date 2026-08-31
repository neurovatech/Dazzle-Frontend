import {
  Heart,
  ShoppingBag,
  MapPin,
  Tag,
  GitCompare,
  Lock,
} from "lucide-react";
import {
  MenuItem,
  WishlistItem,
  Order,
  TrackingStep,
  Address,
  Coupon,
} from "./profile.types";

export const menuItems: MenuItem[] = [
  { label: "Wishlist", icon: Heart },
  { label: "Orders", icon: ShoppingBag },
  { label: "Address", icon: MapPin },
  // { label: "Coupons", icon: Tag },
  { label: "Compare", icon: GitCompare },
  { label: "Change Password", icon: Lock },
];

export const wishlistItems: WishlistItem[] = [
  {
    id: 1,
    name: "Apple AirPods Pro (2nd Gen)",
    badge: "-10%",
    tag: "Buy 2 Get 1",
    stock: true,
    price: "৳1,00,000",
    old: "৳1,30,000",
  },
  {
    id: 2,
    name: "Samsung Galaxy Buds ...",
    badge: "-21%",
    tag: "Hot Sale",
    stock: true,
    price: "৳75,000",
    old: "৳95,000",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Nois...",
    badge: "-20%",
    tag: "Limited",
    stock: false,
    price: "৳1,20,000",
    old: "৳1,50,000",
  },
  {
    id: 4,
    name: "Apple AirPods Pro (2nd Gen)",
    badge: "-10%",
    tag: "Buy 2 Get 1",
    stock: true,
    price: "৳1,00,000",
    old: "৳1,30,000",
  },
];

export const orders: Order[] = [
  {
    id: "#7678",
    date: "August 04, 2025",
    orderDate: "2025-08-04T10:30:00Z", // পুরনো order – return period expired
    status: "In Progress",
    total: "৳1,00,120",
    items: [
      { name: "Apple iPhone 15 Pro Max", qty: 1, price: "৳1,00,000" },
      { name: "Delivery Fee", qty: 1, price: "৳120" },
    ],
  },
  {
    id: "#7521",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    ),
    orderDate: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString(), // 3 দিন আগের order – return এখনো সম্ভব
    status: "Delivered",
    total: "৳75,000",
    items: [
      { name: "Samsung Galaxy S24 Ultra", qty: 1, price: "৳75,000" },
    ],
  },
  {
    id: "#7400",
    date: "June 30, 2025",
    orderDate: "2025-06-30T09:00:00Z", // পুরনো order – return window closed
    status: "Delivered",
    total: "৳50,500",
    items: [
      { name: "Sony WH-1000XM5", qty: 1, price: "৳50,500" },
    ],
  },
];

export const trackingSteps: TrackingStep[] = [
  { title: "Delivered", subtitle: "Waiting...", completed: false },
  { title: "In Transit", subtitle: "Waiting...", completed: false },
  {
    title: "Sent Out",
    subtitle: "Sent out Mar 7, 2026",
    time: "8:00 PM",
    completed: true,
  },
  {
    title: "Packaged",
    subtitle: "Packaged Mar 7, 2026",
    time: "8:00 PM",
    completed: true,
  },
];

export const addresses: Address[] = [
  {
    label: "Home",
    address: "Rd 7, Block A, Bashundhara, Dhaka",
    default: true,
  },
  {
    label: "Office",
    address: "Level 5, Banani Tower, Dhaka",
    default: false,
  },
];

export const coupons: Coupon[] = [
  {
    code: "SAVE10",
    discount: "10% OFF",
    expiry: "Dec 31, 2025",
    min: "৳5,000",
  },
  {
    code: "FLAT200",
    discount: "৳200 OFF",
    expiry: "Nov 15, 2025",
    min: "৳2,000",
  },
];