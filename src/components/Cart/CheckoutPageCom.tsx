/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/share/Breadcrumb";
import Link from "next/link";
import {
  CreditCard, Truck, Check, Store, ShieldCheck,
  MapPin, Lock, Loader2, AlertTriangle, Plus, Minus,
} from "lucide-react";
import toast from "react-hot-toast";
import Bikask from "@/images/bKash-Logo.svg";
import SSl from "@/images/ssl-logo.svg";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { increaseQty, decreaseQty, clearCart, patchMinBookingPrice } from "@/store/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── API Types ────────────────────────────────────────────────────────────────
interface CreateInvoiceResponse { statusCode: number; status: string; message: string; data?: { orderToken: string; orderNo: string }; errors?: string[]; }
interface CreateOrderProductResponse { statusCode: number; status: string; message: string; errors?: string[]; }
interface ExecuteOrderResponse { statusCode: number; status: string; message: string; data?: { orderToken: string; orderNo: string; total: number; }; errors?: string[]; }
interface SslPayResponse { statusCode: number; status: string; GatewayPageURL?: string; message?: string; }
interface BkashPayResponse { statusCode: number; status: string; bkashURL?: string; message?: string; }
interface AddressBookItem { addressUuid: string; fullName: string; mobileNo: string; addressLabel?: string; addressLine1: string; addressLine2?: string; isDefault: boolean; isActive: boolean; districtID: number; policeStationID: number; }
interface AddressListResponse { statusCode: number; status: string; message: string; count: number; data: AddressBookItem[]; }
interface AreaItem {
  areaID: number;
  areaName: string;
  isExtremeDelivery: boolean;
  extremeDeliveryMinMinutes?: number;
  extremeDeliveryMaxMinutes?: number;
  extremeDeliveryCharge: number;
  extremeDeliveryPriority?: number;
  isExpressDelivery: boolean;
  expressDeliveryHours?: number;
  expressDeliveryCharge: number;
  expressDeliveryPriority?: number;
  isSameDayDelivery: boolean;
  sameDayDeliveryDays?: number;
  sameDayDeliveryCharge: number;
  sameDayDeliveryPriority?: number;
  isRegularDelivery: boolean;
  regularDeliveryMinDays?: number;
  regularDeliveryMaxDays?: number;
  regularDeliveryCharge: number;
  regularDeliveryPriority?: number;
  isFullPaymentAllowed: boolean;
  isBookingMoneyAllowed: boolean;
  isSSLCommerzAllowed: boolean;
  isBkashAllowed: boolean;
  isCashOnDeliveryAllowed: boolean;
  codChargePercentage: number;
  codFixedCharge: number;
  isActive: boolean;
}
interface DistrictItem { distID: number; districtName: string; area: AreaItem[]; }
interface AreaListResponse { statusCode: number; status: string; message: string; count: number; data: DistrictItem[]; }
interface StoreItem { uuid: string; branchName: string; slug: string; address: string; }

// ─── Types ────────────────────────────────────────────────────────────────────
type DeliveryType  = "home" | "pickup";
type ServiceLevel  = "regular" | "same_day" | "express" | "extreme";
type PaymentOption = "full_online" | "booking" | "cod" | "full_at_store";

// ─── Helper: radio button ──────────────────────────────────────────────────────
function Radio({ checked, onChange, label, sub, badge, disabled }: {
  checked: boolean; onChange: () => void; label: string; sub?: string; badge?: string; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={disabled ? undefined : onChange} disabled={disabled}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
        disabled
          ? "border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed dark:border-zinc-900 dark:bg-zinc-900/20"
          : checked
          ? "border-[#D4A97A] bg-amber-50/10 dark:bg-amber-950/10 cursor-pointer"
          : "border-gray-200 dark:border-zinc-800 cursor-pointer"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${disabled ? "text-gray-400 dark:text-zinc-600" : checked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
          {badge && <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
        </div>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${disabled ? "border-gray-200 dark:border-zinc-800" : checked ? "border-[#D4A97A]" : "border-gray-300 dark:border-zinc-700"}`}>
        {checked && !disabled && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
      </div>
    </button>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm shrink-0">{step}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CheckoutPageCom() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const { isAuthenticated, token, apiKey, user } = useAppSelector((s) => s.auth);
  const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

  // ── Step 1: Delivery Type ──────────────────────────────────────────────────
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");

  // ── Step 2: Address (Home Delivery only) ──────────────────────────────────
  const [addressTab, setAddressTab] = useState<"existing" | "new">("existing");
  const [selectedAddressUuid, setSelectedAddressUuid] = useState("");
  const [selectedStoreUuid, setSelectedStoreUuid] = useState("");
  const [newAddr, setNewAddr] = useState({
    fullName: user?.userFullName || "", mobile: "", email: user?.email || "",
    addressLabel: "Home", addressLine1: "", districtId: 0, areaId: 0,
  });

  useEffect(() => {
    if (user) setNewAddr((p) => ({ ...p, fullName: p.fullName || user.userFullName || "", email: p.email || user.email || "" }));
  }, [user]);

  // ── Step 3: Service Level & Payment ───────────────────────────────────────
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("regular");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("full_online");
  const [paymentGateway, setPaymentGateway] = useState<"bkash" | "ssl">("bkash");

  // ── Misc ──────────────────────────────────────────────────────────────────
  const [remarks, setRemarks] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNo: string; total: number } | null>(null);

  // ── API fetches ────────────────────────────────────────────────────────────
  const { data: addressListRes } = useQuery<AddressListResponse>({
    queryKey: ["addressList", apiKey],
    queryFn: () => api.get<AddressListResponse>("address-list", { headers: { "X-API-Key": apiKey || "", Authorization: authHeader } }),
    enabled: !!isAuthenticated && !!apiKey && !!token,
  });
  const savedAddresses = addressListRes?.data || [];

  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressUuid) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (def) setSelectedAddressUuid(def.addressUuid);
    }
  }, [savedAddresses, selectedAddressUuid]);

  // Auto switch to "new" address tab if there are no existing/saved addresses
  useEffect(() => {
    if (addressListRes && savedAddresses.length === 0) {
      setAddressTab("new");
    }
  }, [addressListRes, savedAddresses]);

  const { data: areaListRes } = useQuery<AreaListResponse>({
    queryKey: ["areaList"],
    queryFn: () => api.get<AreaListResponse>("area-list", { headers: { "X-API-Key": apiKey || "", Authorization: authHeader } }),
  });
  const districts = areaListRes?.data || [];
  console.log("Districts:", districts);
  const selectedDistObj = districts.find((d) => d.distID === Number(newAddr.districtId));
  const availableAreas = useMemo(() => {
    return (selectedDistObj?.area || []).filter((a) => a.isActive);
  }, [selectedDistObj]);

  const { data: storeListRes } = useQuery<{ data: StoreItem[] }>({
    queryKey: ["storeList"],
    queryFn: () => api.get<{ data: StoreItem[] }>("/stores"),
  });
  const storeList = storeListRes?.data || [];
  useEffect(() => {
    if (storeList.length > 0 && !selectedStoreUuid) setSelectedStoreUuid(storeList[0].uuid);
  }, [storeList, selectedStoreUuid]);

  // ── Fetch minBookingPrice for cart items that are missing it ────────────────
  useEffect(() => {
    const missing = cartItems.filter(
      (item) => (item.minBookingPrice === undefined || item.minBookingPrice === null) && item.productUuid
    );
    if (missing.length === 0) return;

    missing.forEach(async (item) => {
      try {
        const res = await api.get<{ data?: { minBookingPrice?: number } }>(
          `/product/${item.productUuid}`
        );
        const mbp = res?.data?.minBookingPrice ?? 0;
        if (mbp > 0) {
          dispatch(patchMinBookingPrice({ id: item.id, minBookingPrice: mbp }));
        }
      } catch {
        // silently ignore
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  // ── Selected Area Object ───────────────────────────────────────────────────
  const selectedAreaObj = useMemo(() => {
    if (deliveryType === "pickup") return undefined;
    let targetDistrictId = 0;
    let targetAreaId = 0;

    if (addressTab === "existing") {
      const addr = savedAddresses.find((a) => a.addressUuid === selectedAddressUuid);
      if (addr) {
        targetDistrictId = Number(addr.districtID);
        targetAreaId = Number(addr.policeStationID);
      }
    } else {
      targetDistrictId = Number(newAddr.districtId);
      targetAreaId = Number(newAddr.areaId);
    }

    if (!targetDistrictId || !targetAreaId) return undefined;
    const dist = districts.find((d) => d.distID === targetDistrictId);
    return dist?.area.find((a) => a.areaID === targetAreaId);
  }, [deliveryType, addressTab, selectedAddressUuid, savedAddresses, districts, newAddr.districtId, newAddr.areaId]);

  // ── Booking Money = sum of minBookingPrice per unique product (not × qty) ──
  const totalBookingMoney = useMemo(
    () => cartItems.reduce((s, item) => s + (item.minBookingPrice || 0), 0),
    [cartItems]
  );

  // ── Available service levels ───────────────────────────────────────────────
  const visibleServices = useMemo(() => {
    if (deliveryType === "pickup") return [];
    if (!selectedAreaObj) return [];

    const services: { value: ServiceLevel; label: string; sub: string; charge: number; badge?: string }[] = [];

    if (selectedAreaObj.isExtremeDelivery) {
      const minMin = selectedAreaObj.extremeDeliveryMinMinutes || 15;
      const maxMin = selectedAreaObj.extremeDeliveryMaxMinutes || 60;
      services.push({
        value: "extreme",
        label: "Extreme Delivery",
        sub: `${minMin} – ${maxMin} minutes`,
        charge: Number(selectedAreaObj.extremeDeliveryCharge),
        badge: "Full Payment Only"
      });
    }

    if (selectedAreaObj.isExpressDelivery) {
      const hours = selectedAreaObj.expressDeliveryHours || 4;
      services.push({
        value: "express",
        label: "Express Delivery",
        sub: `${hours} hours`,
        charge: Number(selectedAreaObj.expressDeliveryCharge),
        badge: "Full Payment Only"
      });
    }

    if (selectedAreaObj.isSameDayDelivery) {
      const days = selectedAreaObj.sameDayDeliveryDays || 1;
      services.push({
        value: "same_day",
        label: "Same Day Delivery",
        sub: `${days} day${days > 1 ? "s" : ""}`,
        charge: Number(selectedAreaObj.sameDayDeliveryCharge),
        badge: "Full Payment Only"
      });
    }

    if (selectedAreaObj.isRegularDelivery) {
      const minDays = selectedAreaObj.regularDeliveryMinDays || 1;
      const maxDays = selectedAreaObj.regularDeliveryMaxDays || 3;
      services.push({
        value: "regular",
        label: "Regular Delivery",
        sub: `${minDays} – ${maxDays} days`,
        charge: Number(selectedAreaObj.regularDeliveryCharge)
      });
    }

    return services;
  }, [deliveryType, selectedAreaObj]);

  // Auto-fix serviceLevel when visibleServices change
  useEffect(() => {
    if (deliveryType === "pickup") return;
    if (visibleServices.length > 0) {
      const valid = visibleServices.map((s) => s.value);
      if (!valid.includes(serviceLevel)) {
        if (valid.includes("regular")) {
          setServiceLevel("regular");
        } else {
          setServiceLevel(valid[0]);
        }
      }
    }
  }, [visibleServices, serviceLevel, deliveryType]);

  // ── Available payment options ──────────────────────────────────────────────
  const paymentOptions = useMemo(() => {
    if (deliveryType === "pickup") {
      return [
        { value: "full_online" as PaymentOption, label: "Full Payment Online", sub: "SSL / bKash", disabled: false },
        { value: "booking" as PaymentOption, label: "Booking Money", sub: `Min. Booking: ৳${totalBookingMoney.toLocaleString("en-IN")}`, disabled: totalBookingMoney === 0 },
        { value: "full_at_store" as PaymentOption, label: "Full Payment at Store", disabled: false },
      ];
    }

    if (!selectedAreaObj) return [];

    const options: { value: PaymentOption; label: string; sub?: string; disabled: boolean }[] = [];

    const isFullPaymentOnly = serviceLevel === "extreme" || serviceLevel === "express" || serviceLevel === "same_day";

    // Full Payment Online
    const sslAllowed = selectedAreaObj.isSSLCommerzAllowed;
    const bkashAllowed = selectedAreaObj.isBkashAllowed;
    if (selectedAreaObj.isFullPaymentAllowed && (sslAllowed || bkashAllowed)) {
      options.push({
        value: "full_online",
        label: "Full Payment Online",
        sub: isFullPaymentOnly
          ? `SSL / bKash — required for ${serviceLevel} delivery`
          : "SSL / bKash",
        disabled: false
      });
    }

    // Booking Money
    if (!isFullPaymentOnly && selectedAreaObj.isBookingMoneyAllowed) {
      options.push({
        value: "booking",
        label: "Booking Money",
        sub: `Min. Booking: ৳${totalBookingMoney.toLocaleString("en-IN")}`,
        disabled: totalBookingMoney === 0
      });
    }

    // Cash on Delivery
    if (!isFullPaymentOnly && selectedAreaObj.isCashOnDeliveryAllowed) {
      const chargeParts: string[] = [];
      if (selectedAreaObj.codChargePercentage > 0) {
        chargeParts.push(`${selectedAreaObj.codChargePercentage}%`);
      }
      if (selectedAreaObj.codFixedCharge > 0) {
        chargeParts.push(`৳${selectedAreaObj.codFixedCharge}`);
      }
      const chargeText = chargeParts.length > 0
        ? ` (${chargeParts.join(" + ")} COD charge)`
        : "";
      options.push({
        value: "cod",
        label: "Cash on Delivery",
        sub: `Pay at your doorstep${chargeText}`,
        disabled: false
      });
    }

    return options;
  }, [deliveryType, selectedAreaObj, serviceLevel, totalBookingMoney]);

  // Auto-fix paymentOption when options change (exclude disabled options from active default selections)
  useEffect(() => {
    const validNonDisabled = paymentOptions.filter((p) => !p.disabled).map((p) => p.value);
    if (validNonDisabled.length > 0 && !validNonDisabled.includes(paymentOption)) {
      setPaymentOption(validNonDisabled[0]);
    }
  }, [paymentOptions, paymentOption]);

  // When switching to pickup → always default to full_online
  useEffect(() => {
    if (deliveryType === "pickup") {
      setPaymentOption("full_online");
    }
  }, [deliveryType]);

  // Auto-fix paymentGateway based on allowed gateways in selected area
  useEffect(() => {
    if (deliveryType === "pickup") return;
    if (!selectedAreaObj) return;

    const sslAllowed = selectedAreaObj.isSSLCommerzAllowed;
    const bkashAllowed = selectedAreaObj.isBkashAllowed;

    if (sslAllowed && !bkashAllowed) {
      setPaymentGateway("ssl");
    } else if (bkashAllowed && !sslAllowed) {
      setPaymentGateway("bkash");
    }
  }, [selectedAreaObj, deliveryType]);

  // ── Price Calculations ─────────────────────────────────────────────────────
  const subtotal    = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = useMemo(() => {
    if (deliveryType === "pickup") return 0;
    const currentService = visibleServices.find((s) => s.value === serviceLevel);
    return currentService ? currentService.charge : 0;
  }, [deliveryType, visibleServices, serviceLevel]);
  const remainingAfterBooking = Math.max(0, subtotal - totalBookingMoney);
  const codCharge = useMemo(() => {
    if (paymentOption !== "cod" || !selectedAreaObj) return 0;
    const percentageCharge = (remainingAfterBooking * (selectedAreaObj.codChargePercentage || 0)) / 100;
    const fixedCharge = selectedAreaObj.codFixedCharge || 0;
    return Math.round(percentageCharge + fixedCharge);
  }, [paymentOption, selectedAreaObj, remainingAfterBooking]);
  const amountDue   =
    paymentOption === "full_online"   ? subtotal + deliveryFee
    : paymentOption === "booking"     ? totalBookingMoney
    : paymentOption === "cod"         ? subtotal + deliveryFee + codCharge
    : paymentOption === "full_at_store" ? 0
    : subtotal + deliveryFee;
  const total = subtotal + deliveryFee + codCharge;
  const fmt = (v: number) => "৳" + v.toLocaleString("en-IN");

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout", href: "#" }];

  // ── Order Submit ──────────────────────────────────────────────────────────
  const handleConfirmOrder = async () => {
    if (!isAuthenticated || !token || !apiKey) { toast.error("Please log in to checkout."); return; }
    if (cartItems.length === 0) { toast.error("Your cart is empty."); return; }
    if (!termsAccepted) { toast.error("Please accept the Terms & Conditions."); return; }
    if (deliveryType === "pickup" && !selectedStoreUuid) { toast.error("Please select a pickup store."); return; }

    const isPickup = deliveryType === "pickup";
    let userFullName = "", email = "", mobile = "", addressLabel = "Home", districtId = 0, areaId = 0;

    if (!isPickup) {
      if (addressTab === "existing") {
        const addr = savedAddresses.find((a) => a.addressUuid === selectedAddressUuid) || savedAddresses[0];
        if (!addr) { toast.error("Please select or add a delivery address."); return; }
        userFullName = addr.fullName || user?.userFullName || "";
        email = user?.email || "";
        mobile = addr.mobileNo || "";
        addressLabel = addr.addressLabel || "Home";
        districtId = Number(addr.districtID);
        areaId = Number(addr.policeStationID);
      } else {
        if (!newAddr.fullName.trim() || !newAddr.mobile.trim() || !newAddr.districtId || !newAddr.areaId) {
          toast.error("Please fill in all required address fields."); return;
        }
        userFullName = newAddr.fullName.trim(); email = newAddr.email.trim() || user?.email || "";
        mobile = newAddr.mobile.trim(); addressLabel = newAddr.addressLabel;
        districtId = Number(newAddr.districtId); areaId = Number(newAddr.areaId);
      }

      // Check if selected area is active
      const matchedDist = districts.find((d) => d.distID === districtId);
      const matchedArea = matchedDist?.area.find((a) => a.areaID === areaId);
      if (!matchedArea || !matchedArea.isActive) {
        toast.error("The selected delivery area is currently inactive. Please choose or add a different address.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const browserToken = `web-session-${apiKey}-${Date.now()}`;
      const apiPaymentType = paymentOption === "cod" ? "COD" : paymentOption === "booking" ? "Partial" : "OP";
      const apiPaymentMethod = (paymentOption === "full_online" || paymentOption === "booking")
        ? (paymentGateway === "bkash" ? "bkash" : "sslcommerz") : "";
      const apiDeliveryMethod = isPickup ? "ShopPickup"
        : serviceLevel === "extreme" ? "Extreme" : serviceLevel === "express" ? "Express"
        : serviceLevel === "same_day" ? "SameDay" : "Regular";

      const invoicePayload: any = { usersCommUuid: apiKey, browserToken, paymentType: apiPaymentType,
        paymentMethod: apiPaymentMethod, deliveryMethod: apiDeliveryMethod, remarks: remarks.trim(), isShopPickup: isPickup };
      if (isPickup) invoicePayload.storeUuid = selectedStoreUuid;
      else { Object.assign(invoicePayload, { userFullName, email, mobile, addressLabel, districtId, areaId }); }

      const resInvoice = await api.post<CreateInvoiceResponse>("/api/tokenized/v1/create-order-invoice", invoicePayload,
        { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } });
      if (!resInvoice || resInvoice.status !== "success" || !resInvoice.data?.orderToken) {
        toast.error(resInvoice?.errors?.join(", ") || resInvoice?.message || "Failed to create invoice."); setIsSubmitting(false); return;
      }
      const orderToken = resInvoice.data.orderToken;

      for (const item of cartItems) {
        for (let q = 0; q < item.quantity; q++) {
          const res = await api.post<CreateOrderProductResponse>("/api/tokenized/v1/create-order-product",
            { productUuid: item.productUuid || item.id, variantUuid: item.variantUuid || item.id, usersCommUuid: apiKey, orderToken, accessoriesUuid: item.accessoriesUuid || "" },
            { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } });
          if (!res || res.status !== "success") { toast.error(res?.errors?.join(", ") || "Failed to add product."); setIsSubmitting(false); return; }
        }
      }

      const resEx = await api.post<ExecuteOrderResponse>("/api/tokenized/v1/execute-order", { orderToken },
        { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } });
      if (!resEx || resEx.status !== "success") { toast.error(resEx?.errors?.join(", ") || "Failed to execute order."); setIsSubmitting(false); return; }

      if (paymentOption === "full_online" || paymentOption === "booking") {
        if (paymentGateway === "ssl") {
          const r = await api.post<SslPayResponse>("/api/tokenized/v1/sslcommerz-pay", { orderToken }, { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } });
          if (r?.GatewayPageURL) { dispatch(clearCart()); window.location.href = r.GatewayPageURL; return; }
          toast.error(r?.message || "SSLCommerz failed.");
        } else {
          const r = await api.post<BkashPayResponse>("/api/tokenized/v1/bkash-pay", { orderToken }, { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } });
          if (r?.bkashURL) { dispatch(clearCart()); window.location.href = r.bkashURL; return; }
          toast.error(r?.message || "bKash failed.");
        }
      } else {
        dispatch(clearCart());
        setConfirmedOrder({ orderNo: resInvoice.data.orderNo || `DZL-${Date.now()}`, total: resEx.data?.total || total });
        setOrderConfirmed(true);
        toast.success("Order placed successfully!");
      }
    } catch (err: any) {
      console.error("[Checkout]", err);
      try { const p = JSON.parse(err.message); toast.error(p?.errors?.join(", ") || p?.message || "Order failed."); }
      catch { toast.error(err?.message || "Order failed."); }
    } finally { setIsSubmitting(false); }
  };

  console.log(cartItems, "cartItemscartItemscartItemscartItemscartItems")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">Checkout</h1>

        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Login Required</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">You must log in to place an order.</p>
              </div>
            </div>
            <Link href="/auth/login" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl">LOG IN NOW</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* ── Step 1: Delivery Method ── */}
            <Section step={1} title="Delivery Method">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Radio checked={deliveryType === "home"} onChange={() => setDeliveryType("home")} label="🏠 Home Delivery" sub="Delivered to your doorstep" />
                <Radio checked={deliveryType === "pickup"} onChange={() => setDeliveryType("pickup")} label="🏪 Store Pickup" sub="Pick up from any Dazzle store" />
              </div>
            </Section>

            {/* ── Step 2: Address (Home Delivery only) ── */}
            {deliveryType === "home" && (
              <Section step={2} title="Delivery Address">
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAddressTab("existing")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border transition cursor-pointer ${addressTab === "existing" ? "bg-white border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" : "bg-gray-50 border-transparent text-gray-400 dark:bg-zinc-900"}`}>
                    Existing Address ({savedAddresses.length})
                  </button>
                  <button type="button" onClick={() => setAddressTab("new")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${addressTab === "new" ? "bg-[#D4A97A] text-white" : "bg-gray-50 text-gray-400 dark:bg-zinc-900"}`}>
                    New Address
                  </button>
                </div>

                {addressTab === "existing" ? (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => {
                      const dist = districts.find((d) => d.distID === Number(addr.districtID));
                      const areaObj = dist?.area.find((a) => a.areaID === Number(addr.policeStationID));
                      const isAreaActive = areaObj ? areaObj.isActive : true;

                      return (
                        <div key={addr.addressUuid}
                          onClick={() => {
                            if (!isAreaActive) {
                              toast.error("This address belongs to an inactive delivery area.");
                              return;
                            }
                            setSelectedAddressUuid(addr.addressUuid);
                          }}
                          className={`border rounded-2xl p-4 cursor-pointer transition relative ${
                            !isAreaActive
                              ? "border-red-200 bg-red-50/10 opacity-60 cursor-not-allowed"
                              : selectedAddressUuid === addr.addressUuid
                              ? "border-[#D4A97A] bg-amber-50/20 dark:bg-zinc-800"
                              : "border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white">
                            <MapPin size={14} className="text-[#D4A97A]" />
                            <span>{addr.fullName} ({addr.mobileNo})</span>
                            {addr.addressLabel && <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full">{addr.addressLabel}</span>}
                            {!isAreaActive && <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">Service Inactive</span>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                          {isAreaActive && selectedAddressUuid === addr.addressUuid && <div className="absolute top-4 right-4 bg-[#D4A97A] text-white rounded-full p-1"><Check size={12} /></div>}
                        </div>
                      );
                    })}
                    {savedAddresses.length === 0 && <p className="text-xs text-gray-400 border border-dashed rounded-xl p-4 text-center">No saved addresses. Use New Address tab.</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[["Full Name *", "fullName", "text", "Full Name"], ["Mobile *", "mobile", "tel", "01700000000"], ["Email", "email", "email", "email@example.com"]].map(([label, key, type, placeholder]) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                        <input type={type} value={(newAddr as any)[key]} placeholder={placeholder}
                          onChange={(e) => setNewAddr((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Address *</label>
                      <textarea rows={2} value={newAddr.addressLine1} placeholder="House, Road, Area" onChange={(e) => setNewAddr((p) => ({ ...p, addressLine1: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white resize-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">District *</label>
                        <select value={newAddr.districtId} onChange={(e) => setNewAddr((p) => ({ ...p, districtId: Number(e.target.value), areaId: 0 }))}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer">
                          <option value={0}>Select District</option>
                          {districts.map((d) => <option key={d.distID} value={d.distID}>{d.districtName}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Police Station / Area *</label>
                        <select value={newAddr.areaId} onChange={(e) => setNewAddr((p) => ({ ...p, areaId: Number(e.target.value) }))} disabled={!newAddr.districtId}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer disabled:opacity-50">
                          <option value={0}>Select Area</option>
                          {availableAreas.map((a) => <option key={a.areaID} value={a.areaID}>{a.areaName}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* ── Step 2 (Pickup): Store Selection ── */}
            {deliveryType === "pickup" && (
              <Section step={2} title="Select Pickup Store *">
                <div className="space-y-3">
                  {storeList.map((store) => (
                    <Radio key={store.uuid} checked={selectedStoreUuid === store.uuid} onChange={() => setSelectedStoreUuid(store.uuid)}
                      label={store.branchName} sub={store.address || "Dazzle Store"} />
                  ))}
                  {storeList.length === 0 && <p className="text-xs text-gray-400">Loading stores...</p>}
                </div>
              </Section>
            )}

            {/* ── Step 3: Delivery Service & Payment ── */}
            <Section step={3} title="Delivery Service & Payment">

              {/* Service Level (Home Delivery only) */}
              {deliveryType === "home" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Truck size={16} /> Delivery Service</p>
                  {!selectedAreaObj && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2">
                      ⚠️ Please select or add a delivery address to view available delivery services.
                    </div>
                  )}
                  {selectedAreaObj && visibleServices.length === 0 && (
                    <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2">
                      ⚠️ Delivery service is currently not available for this area.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visibleServices.map((s) => (
                      <Radio key={s.value} checked={serviceLevel === s.value} onChange={() => setServiceLevel(s.value)} label={s.label} sub={s.sub} badge={s.badge} />
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Option */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard size={16} /> Payment Method</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentOptions.map((opt) => (
                    <Radio key={opt.value} checked={paymentOption === opt.value} onChange={() => setPaymentOption(opt.value)} label={opt.label} sub={opt.sub} disabled={opt.disabled} />
                  ))}
                </div>

                {/* Booking Money info */}
                {paymentOption === "booking" && totalBookingMoney > 0 && (
                  <div className="text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl px-3 py-2 text-blue-700 dark:text-blue-400">
                    📌 Total Booking Money in your cart: <strong>৳{totalBookingMoney.toLocaleString("en-IN")}</strong>
                    <br />Partial Payment can be made after Order Confirmation from the panel. Once order is shifted, Partial Payment is not available.
                  </div>
                )}

                {/* COD charge info */}
                {paymentOption === "cod" && selectedAreaObj && codCharge > 0 && (
                  <div className="text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2 text-amber-700 dark:text-amber-400">
                    💰 COD Charge: <strong>৳{codCharge.toLocaleString("en-IN")}</strong>
                    {selectedAreaObj.codChargePercentage > 0 && ` (${selectedAreaObj.codChargePercentage}% on remaining ৳${remainingAfterBooking.toLocaleString("en-IN")})`}
                    {selectedAreaObj.codFixedCharge > 0 && ` (Fixed charge: ৳${selectedAreaObj.codFixedCharge})`}
                  </div>
                )}

                {/* Gateway selector (online / booking) */}
                {(paymentOption === "full_online" || paymentOption === "booking") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(deliveryType === "pickup" || !selectedAreaObj || selectedAreaObj.isBkashAllowed) && (
                      <button type="button" onClick={() => setPaymentGateway("bkash")}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 h-16 transition-all cursor-pointer ${paymentGateway === "bkash" ? "border-[#e2136e] bg-pink-50/20" : "border-gray-200 dark:border-zinc-800"}`}>
                        <Image src={Bikask} alt="bKash" className="w-32" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentGateway === "bkash" ? "border-[#e2136e]" : "border-gray-300"}`}>
                          {paymentGateway === "bkash" && <div className="w-2 h-2 rounded-full bg-[#e2136e]" />}
                        </div>
                      </button>
                    )}
                    {(deliveryType === "pickup" || !selectedAreaObj || selectedAreaObj.isSSLCommerzAllowed) && (
                      <button type="button" onClick={() => setPaymentGateway("ssl")}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 h-16 transition-all cursor-pointer ${paymentGateway === "ssl" ? "border-[#D4A97A] bg-amber-50/20" : "border-gray-200 dark:border-zinc-800"}`}>
                        <Image src={SSl} alt="SSLCommerz" className="w-32" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentGateway === "ssl" ? "border-[#D4A97A]" : "border-gray-300"}`}>
                          {paymentGateway === "ssl" && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Full at store info */}
                {paymentOption === "full_at_store" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                    ✅ No delivery address required. Pay in full at the store.
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Remarks / Delivery Instructions (Optional)</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Call before delivery"
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white" />
              </div>
            </Section>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm shrink-0">4</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order ({cartItems.length})</h2>
              </div>

              {/* Cart Items */}
              <div className="bg-gray-50 dark:bg-zinc-900/30 rounded-2xl p-4 divide-y divide-gray-100 dark:divide-zinc-800/80 max-h-96 overflow-y-auto">
                {cartItems.map((item, i) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start">
                    <span className="text-xs font-bold text-gray-400 mt-1">{i + 1}</span>
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="object-contain max-h-full max-w-full" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-zinc-200 leading-snug line-clamp-2">{item.name}</h4>
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                          <button type="button" onClick={() => dispatch(decreaseQty(item.id))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"><Minus size={10} className="text-gray-500" /></button>
                          <span className="px-2 text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                          <button type="button" onClick={() => dispatch(increaseQty(item.id))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"><Plus size={10} className="text-gray-500" /></button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{fmt(item.price * item.quantity)}</span>
                          {(item.minBookingPrice ?? 0) > 0 && (
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                              Booking: {fmt(item.minBookingPrice!)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {cartItems.length === 0 && <p className="text-sm text-gray-400 py-6 text-center italic">Cart is empty</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-sm font-semibold">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span>{fmt(deliveryFee)}</span></div>
                {codCharge > 0 && <div className="flex justify-between text-amber-600"><span>COD Charge (1%)</span><span>{fmt(codCharge)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-dashed border-gray-200 dark:border-zinc-800">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">{fmt(total)}</span>
                </div>
                {(paymentOption === "booking" || paymentOption === "cod") && (
                  <div className="flex justify-between pt-1">
                    <span className="text-[#D4A97A] font-bold">{paymentOption === "booking" ? "Pay Now (Booking)" : "Pay Now"}</span>
                    <span className="text-[#D4A97A] font-bold">{fmt(amountDue)}</span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#D4A97A] focus:ring-[#D4A97A] mt-0.5 cursor-pointer" />
                <span className="text-xs text-gray-600 dark:text-zinc-400 leading-normal">
                  I accept the <Link href="/terms-conditions" className="text-[#D4A97A] hover:underline">Terms & Conditions</Link>, <Link href="/delivery-policy" className="text-[#D4A97A] hover:underline">Delivery</Link>, <Link href="/refund-policy" className="text-[#D4A97A] hover:underline">Refund</Link> & <Link href="/cancellation-policy" className="text-[#D4A97A] hover:underline">Cancellation</Link> policies.
                </span>
              </label>

              <button onClick={handleConfirmOrder} disabled={isSubmitting || cartItems.length === 0}
                className={`w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-[#D4A97A]/10 text-[#a0743b] border-2 border-[#D4A97A] font-bold px-8 py-3.5 rounded-xl transition text-xs uppercase tracking-widest ${isSubmitting || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>PROCESSING...</span></>) : `CONFIRM ORDER — ${fmt(amountDue || total)}`}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock size={12} /> <span>Secured by SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1C1A17] rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-gray-100 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto text-white"><ShieldCheck size={36} /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Placed Successfully! 🎉</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Order No: <strong className="text-gray-800 dark:text-white">{confirmedOrder?.orderNo}</strong><br />Total: {fmt(confirmedOrder?.total || total)}</p>
            <Link href="/profile" className="inline-block w-full py-3 bg-[#D4A97A] text-white font-bold rounded-xl hover:bg-[#c89a6b] transition text-xs tracking-wider">VIEW ORDER HISTORY</Link>
          </div>
        </div>
      )}
    </div>
  );
}
