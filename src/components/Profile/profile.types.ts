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

export interface ApiOrderItem {
  comerzOrderNo: string;
  createdAt: string;
  paymentType: string;
  paymentMethod: string;
  deliveryMethod: string;
  productCount: number;
  productPrice: number;
  deliveryFee: number;
  discount: number;
  subTotal: number;
  paidAmount: number;
  total: number;
  isFullPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  isShopPickup: boolean;
}

export interface OrderListResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ApiOrderItem[];
  message?: string;
}

export interface OrderTrackingTimeline {
  createdAt: string;
  createdBy: string;
  orderStatus: string;
}

export interface OrderAlertLog {
  createdAt: string;
  alertTypes: string;
  description: string;
}

export interface OrderTrackingData {
  orderNo: string;
  createdAt: string;
  fullName: string;
  mobile: string;
  address: string;
  address2?: string;
  deliveryIns?: string;
  customerNotes?: string;
  subTotal: number;
  paidAmount: number;
  grandAmount: number;
  orderFullPaid: boolean;
  orderDelivered: boolean;
  orderCancelled: boolean;
  statusTimeline?: OrderTrackingTimeline[];
  alertsLogs?: OrderAlertLog[];
}

export interface OrderTrackingResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: OrderTrackingData;
}

export interface Order {
  id: string; // comerzOrderNo
  comerzOrderNo?: string;
  date: string;
  orderDate: string; // ISO date string
  status: "In Progress" | "Delivered" | "Cancelled";
  total: string;
  totalNumber?: number;
  items?: OrderItem[];
  rawApiData?: ApiOrderItem;
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