import { LucideIcon } from "lucide-react";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
}

export interface WishlistItem {
  id: number;
  name: string;
  badge: string;
  tag: string;
  stock: boolean;
  price: string;
  old: string;
}

export interface Order {
  id: string;
  date: string;
  orderDate: string; // ISO date string – 7-day return window calculation-এর জন্য
  status: "In Progress" | "Delivered";
  total: string;
  items?: OrderItem[];
}

export interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

export interface TrackingStep {
  title: string;
  subtitle: string;
  time?: string;
  completed: boolean;
}

export interface Address {
  label: string;
  address: string;
  default: boolean;
}

export interface Coupon {
  code: string;
  discount: string;
  expiry: string;
  min: string;
}

export type ActiveLabel =
  | "Wishlist"
  | "Orders"
  | "Address"
  | "Coupons"
  | "Compare"
  | "Change Password";

export type ReturnReason =
  | "Defective / Not Working"
  | "Wrong Item Delivered"
  | "Item Not as Described"
  | "Changed My Mind"
  | "Damaged in Shipping";