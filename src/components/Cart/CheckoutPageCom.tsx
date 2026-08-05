/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/share/Breadcrumb";
import Link from "next/link";
import {
  Plus,
  Minus,
  CreditCard,
  Truck,
  Check,
  Store,
  ShieldCheck,
  MapPin,
  Lock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Bikask from "@/images/bKash-Logo.svg";
import SSl from "@/images/ssl-logo.svg";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} from "@/store/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── API Response Types ───────────────────────────────────────────────────────
interface CreateInvoiceResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: {
    orderToken: string;
    orderNo: string;
    createdAt: string;
  };
  errors?: string[];
}

interface CreateOrderProductResponse {
  statusCode: number;
  status: string;
  message: string;
  errors?: string[];
}

interface ExecuteOrderResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: {
    orderToken: string;
    orderNo: string;
    fullName: string;
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
    isCancelled: boolean;
  };
  errors?: string[];
}

interface SslPayResponse {
  statusCode: number;
  status: string;
  GatewayPageURL?: string;
  message?: string;
  errors?: string[];
}

interface BkashPayResponse {
  statusCode: number;
  status: string;
  paymentID?: string;
  bkashURL?: string;
  message?: string;
  errors?: string[];
}

// ─── Delivery Address Types ─────────────────────────────────────────────────
interface AddressBookItem {
  addressUuid: string;
  fullName: string;
  mobileNo: string;
  addressLabel?: string;
  addressLine1: string;
  addressLine2?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  isActive: boolean;
  districtID: number;
  policeStationID: number;
  updatedAt?: string;
}

interface AddressListResponse {
  statusCode: number;
  status: string;
  message: string;
  count: number;
  data: AddressBookItem[];
}

interface AreaItem {
  areaID: number;
  areaName: string;
}

interface DistrictItem {
  distID: number;
  districtName: string;
  area: AreaItem[];
}

interface AreaListResponse {
  statusCode: number;
  status: string;
  message: string;
  count: number;
  data: DistrictItem[];
}

interface StoreItem {
  uuid: string;
  branchName: string;
  slug: string;
  address: string;
  contactNo?: string;
  email?: string;
}

export default function CheckoutPageCom() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated, token, apiKey, user } = useAppSelector(
    (state) => state.auth,
  );

  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  // ─── Form States ────────────────────────────────────────────────────────────
  const [paymentType, setPaymentType] = useState<"online" | "cod">("online");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "card">("bkash");
  const [deliveryMethod, setDeliveryMethod] = useState<"regular" | "express" | "extreme" | "pickup">(
    "regular",
  );
  const [addressTab, setAddressTab] = useState<"existing" | "new">("existing");
  const [selectedAddressUuid, setSelectedAddressUuid] = useState<string>("");
  const [selectedStoreUuid, setSelectedStoreUuid] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<{
    orderNo: string;
    orderToken: string;
    total: number;
  } | null>(null);

  // New Address Form state
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: user?.userFullName || "",
    mobile: "",
    email: user?.email || "",
    addressLabel: "Home",
    addressLine1: "",
    districtId: 0,
    areaId: 0,
  });

  // Update name & email if user logs in
  useEffect(() => {
    if (user) {
      setNewAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.userFullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // ─── Fetch API Data ─────────────────────────────────────────────────────────

  // 1. Saved Addresses
  const { data: addressListRes } = useQuery<AddressListResponse>({
    queryKey: ["addressList", apiKey],
    queryFn: async () => {
      return api.get<AddressListResponse>("address-list", {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
    },
    enabled: !!isAuthenticated && !!apiKey && !!token,
  });

  const savedAddresses = addressListRes?.data || [];

  // Auto-select primary/default or first address
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressUuid) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressUuid(defaultAddr.addressUuid);
      }
    }
  }, [savedAddresses, selectedAddressUuid]);

  // 2. Districts & Areas
  const { data: areaListRes } = useQuery<AreaListResponse>({
    queryKey: ["areaList"],
    queryFn: async () => {
      return api.get<AreaListResponse>("area-list", {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
    },
  });

  const districts = areaListRes?.data || [];
  const selectedDistrictObj = districts.find(
    (d) => d.distID === Number(newAddressForm.districtId),
  );
  const availableAreas = selectedDistrictObj?.area || [];

  // 3. Stores List for Pickup
  const { data: storeListRes } = useQuery<{ data: StoreItem[] }>({
    queryKey: ["storeList"],
    queryFn: async () => {
      return api.get<{ data: StoreItem[] }>("/stores");
    },
  });

  const storeList = storeListRes?.data || [];

  useEffect(() => {
    if (storeList.length > 0 && !selectedStoreUuid) {
      setSelectedStoreUuid(storeList[0].uuid);
    }
  }, [storeList, selectedStoreUuid]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = deliveryMethod === "pickup" ? 0 : 60;
  const codCharge =
    paymentType === "cod" ? Math.round((subtotal + deliveryFee) * 0.01) : 0;
  const discount = 0;
  const total = subtotal + deliveryFee + codCharge - discount;

  const formatPrice = (val: number) => "৳" + val.toLocaleString("en-IN");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "#" },
  ];

  // ─── Order Confirmation Handler ─────────────────────────────────────────────
  const handleConfirmOrder = async () => {
    if (!isAuthenticated || !token || !apiKey) {
      toast.error("Please log in to complete your checkout.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add items before checking out.");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions.");
      return;
    }

    const isShopPickup = deliveryMethod === "pickup";

    // Validate Pickup Store
    if (isShopPickup && !selectedStoreUuid) {
      toast.error("Please select a store for pickup.");
      return;
    }

    // Validate Regular Delivery Address
    let userFullName = "";
    let email = "";
    let mobile = "";
    let addressLabel = "Home";
    let districtId = 0;
    let areaId = 0;

    if (!isShopPickup) {
      if (addressTab === "existing") {
        const selectedAddr =
          savedAddresses.find((a) => a.addressUuid === selectedAddressUuid) ||
          savedAddresses[0];

        if (!selectedAddr) {
          toast.error(
            "Please select a valid delivery address or create a new one.",
          );
          return;
        }

        userFullName = selectedAddr.fullName || user?.userFullName || "";
        email = user?.email || "";
        mobile = selectedAddr.mobileNo || "";
        addressLabel = selectedAddr.addressLabel || "Home";
        districtId = Number(selectedAddr.districtID);
        areaId = Number(selectedAddr.policeStationID);
      } else {
        // New Address
        if (
          !newAddressForm.fullName.trim() ||
          !newAddressForm.mobile.trim() ||
          !newAddressForm.districtId ||
          !newAddressForm.areaId
        ) {
          toast.error("Please fill in all required delivery address fields.");
          return;
        }
        userFullName = newAddressForm.fullName.trim();
        email = newAddressForm.email.trim() || user?.email || "";
        mobile = newAddressForm.mobile.trim();
        addressLabel = newAddressForm.addressLabel || "Home";
        districtId = Number(newAddressForm.districtId);
        areaId = Number(newAddressForm.areaId);
      }
    }

    setIsSubmitting(true);

    try {
      const browserToken = `web-session-${apiKey}-${Date.now()}`;

      // Payload for create-order-invoice
      const invoicePayload: any = {
        usersCommUuid: apiKey,
        browserToken: browserToken,
        paymentType: paymentType === "online" ? "OP" : "COD",
        paymentMethod:
          paymentType === "online"
            ? paymentMethod === "bkash"
              ? "bkash"
              : "sslcommerz"
            : "",
        deliveryMethod: isShopPickup ? "ShopPickup" : "Regular",
        remarks: remarks.trim(),
        isShopPickup: isShopPickup,
      };

      if (isShopPickup) {
        invoicePayload.storeUuid = selectedStoreUuid;
      } else {
        invoicePayload.userFullName = userFullName;
        invoicePayload.email = email;
        invoicePayload.mobile = mobile;
        invoicePayload.addressLabel = addressLabel;
        invoicePayload.districtId = districtId;
        invoicePayload.areaId = areaId;
      }

      // Step 1: Create Order Invoice
      const resInvoice = await api.post<CreateInvoiceResponse>(
        "/api/tokenized/v1/create-order-invoice",
        invoicePayload,
        {
          headers: {
            Authorization: authHeader,
            "X-API-Key": apiKey || "",
          },
        },
      );

      if (
        !resInvoice ||
        resInvoice.status !== "success" ||
        !resInvoice.data?.orderToken
      ) {
        const errMsg =
          resInvoice?.errors && resInvoice.errors.length > 0
            ? resInvoice.errors.join(", ")
            : resInvoice?.message || "Failed to create order invoice.";
        toast.error(errMsg);
        setIsSubmitting(false);
        return;
      }

      const orderToken = resInvoice.data.orderToken;

      // Step 2: Create Order Product for each item in cart
      for (const item of cartItems) {
        const pUuid = item.productUuid || item.id || "";
        const vUuid = item.variantUuid || item.id || "";
        const accUuid =
          item.accessoriesUuid && item.accessoriesUuid.trim()
            ? item.accessoriesUuid.trim()
            : undefined;

        const itemQty = item.quantity && item.quantity > 0 ? item.quantity : 1;

        for (let q = 0; q < itemQty; q++) {
          const productPayload: any = {
            productUuid: pUuid,
            variantUuid: vUuid,
            usersCommUuid: apiKey,
            orderToken: orderToken,
            accessoriesUuid: accUuid || "",
            // productPayload.accessoriesUuid = accUuid;
          };

          // if (accUuid) {
          //   productPayload.accessoriesUuid = accUuid;
          // }

          const resProduct = await api.post<CreateOrderProductResponse>(
            "/api/tokenized/v1/create-order-product",
            productPayload,
            {
              headers: {
                Authorization: authHeader,
                "X-API-Key": apiKey || "",
              },
            },
          );

          if (!resProduct || resProduct.status !== "success") {
            const errMsg =
              resProduct?.errors && resProduct.errors.length > 0
                ? resProduct.errors.join(", ")
                : resProduct?.message || "Failed to add product to order.";
            toast.error(errMsg);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Step 3: Execute Order (after all products created successfully)
      const resExecute = await api.post<ExecuteOrderResponse>(
        "/api/tokenized/v1/execute-order",
        { orderToken },
        {
          headers: {
            Authorization: authHeader,
            "X-API-Key": apiKey || "",
          },
        },
      );

      if (!resExecute || resExecute.status !== "success") {
        const errMsg =
          resExecute?.errors && resExecute.errors.length > 0
            ? resExecute.errors.join(", ")
            : resExecute?.message || "Failed to execute order.";
        toast.error(errMsg);
        setIsSubmitting(false);
        return;
      }

      // Step 3: Payment Handling
      if (paymentType === "online") {
        if (paymentMethod === "card") {
          // SSLCommerz
          const resSsl = await api.post<SslPayResponse>(
            "/api/tokenized/v1/sslcommerz-pay",
            { orderToken },
            {
              headers: {
                Authorization: authHeader,
                "X-API-Key": apiKey || "",
              },
            },
          );

          if (resSsl?.GatewayPageURL) {
            dispatch(clearCart());
            window.location.href = resSsl.GatewayPageURL;
            return;
          } else {
            toast.error(
              resSsl?.message || "Failed to initiate SSLCommerz payment.",
            );
          }
        } else if (paymentMethod === "bkash") {
          // bKash
          const resBkash = await api.post<BkashPayResponse>(
            "/api/tokenized/v1/bkash-pay",
            { orderToken },
            {
              headers: {
                Authorization: authHeader,
                "X-API-Key": apiKey || "",
              },
            },
          );

          if (resBkash?.bkashURL) {
            dispatch(clearCart());
            window.location.href = resBkash.bkashURL;
            return;
          } else {
            toast.error(
              resBkash?.message || "Failed to initiate bKash payment.",
            );
          }
        }
      } else {
        // COD Payment Success
        dispatch(clearCart());
        setConfirmedOrderData({
          orderNo:
            resInvoice.data.orderNo ||
            resExecute.data?.orderNo ||
            `DZL-${Date.now()}`,
          orderToken: orderToken,
          total: resExecute.data?.total || total,
        });
        setOrderConfirmed(true);
        toast.success("Order placed successfully!");
      }
    } catch (err: any) {
      console.error("[Checkout] Submit error:", err);
      try {
        const parsed =
          typeof err.message === "string" ? JSON.parse(err.message) : err;
        if (
          parsed?.errors &&
          Array.isArray(parsed.errors) &&
          parsed.errors.length > 0
        ) {
          parsed.errors.forEach((e: string) => toast.error(e));
        } else {
          toast.error(
            parsed?.message || "Something went wrong while placing order.",
          );
        }
      } catch {
        toast.error(err?.message || "Failed to place order.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6">
          Checkout your cart
        </h1>

        {/* ── Auth Warning Banner if user is NOT logged in ── */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Authentication Required
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You are not logged in. You must log in to place an order.
                </p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              LOG IN NOW
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Payment & Delivery */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. Payment Method Card */}
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment
                </h2>
              </div>

              {/* Payment Type Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                  <CreditCard size={18} />
                  <span>Payment Type</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Online Payment */}
                  <button
                    onClick={() => setPaymentType("online")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentType === "online"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <span className="text-sm font-bold">Online Payment</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "online"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {paymentType === "online" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => {
                      if (deliveryMethod === "express") {
                        toast.error("Cash on Delivery is not available for Express Delivery.", {
                          style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                          },
                        });
                        return;
                      }
                      setPaymentType("cod");
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      deliveryMethod === "express" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      paymentType === "cod"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-sm font-bold block">
                        Cash on Delivery
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold">
                        (1% Extra COD Charge)
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "cod"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {paymentType === "cod" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Gateway Method (bKash or SSLCommerz) */}
              {paymentType === "online" && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    <CreditCard size={18} />
                    <span>Payment Method</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bkash")}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer h-20 ${
                        paymentMethod === "bkash"
                          ? "border-[#e2136e] bg-pink-50/20 dark:bg-pink-950/20 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-pink-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={Bikask}
                          alt="bKash"
                          className="w-40 mx-auto"
                        />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "bkash"
                            ? "border-[#e2136e]"
                            : "border-gray-300 dark:border-zinc-700"
                        }`}
                      >
                        {paymentMethod === "bkash" && (
                          <div className="w-2 h-2 rounded-full bg-[#e2136e]" />
                        )}
                      </div>
                    </button>

                    {/* Card (SSLCommerz) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer h-20 ${
                        paymentMethod === "card"
                          ? "border-[#D4A97A] bg-amber-50/20 dark:bg-amber-950/20 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-amber-200"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Image
                          src={SSl}
                          alt="SSLCommerz"
                          className="w-40 mx-auto"
                        />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "card"
                            ? "border-[#D4A97A]"
                            : "border-gray-300 dark:border-zinc-700"
                        }`}
                      >
                        {paymentMethod === "card" && (
                          <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Delivery Card */}
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm">
                  2
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delivery
                </h2>
              </div>

              {/* Delivery Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                  <Truck size={18} />
                  <span>Delivery Method</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular Delivery */}
                  <button
                    onClick={() => setDeliveryMethod("regular")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliveryMethod === "regular"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-sm font-bold">
                        Regular Delivery
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        24 hours to 72 hours
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === "regular"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {deliveryMethod === "regular" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>
                  
                  {/* Express Delivery */}
                  <button
                    onClick={() => {
                      setDeliveryMethod("express");
                      if (paymentType === "cod") {
                        setPaymentType("online");
                        toast("Cash on Delivery is disabled for Express Delivery.", {
                          icon: '🚚',
                          style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                          },
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliveryMethod === "express"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-sm font-bold">
                        Express Delivery
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        Single day delivery
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === "express"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {deliveryMethod === "express" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>

                  {/* Regular Delivery */}
                  <button
                    onClick={() => setDeliveryMethod("extreme")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliveryMethod === "extreme"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-sm font-bold">
                        Extreme Fast Delivery
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        15min - 60min
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === "extreme"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {deliveryMethod === "extreme" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>

                  {/* Shop Pickup */}
                  <button
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliveryMethod === "pickup"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-sm font-bold">
                        Shop Pickup
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        Can choose store and pickup any store
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === "pickup"
                          ? "border-[#D4A97A]"
                          : "border-gray-300 dark:border-zinc-700"
                      }`}
                    >
                      {deliveryMethod === "pickup" && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* If Regular Delivery is active */}
              {deliveryMethod === "regular" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60 space-y-4">
                  <span className="block text-sm font-bold text-gray-800 dark:text-white">
                    Delivery Address
                  </span>

                  {/* Tabs */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAddressTab("existing")}
                      className={`py-2 px-4 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        addressTab === "existing"
                          ? "bg-white border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                          : "bg-gray-50 border-transparent text-gray-400 dark:bg-zinc-900"
                      }`}
                    >
                      Existing Address ({savedAddresses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressTab("new")}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                        addressTab === "new"
                          ? "bg-[#D4A97A] text-white"
                          : "bg-gray-50 text-gray-400 dark:bg-zinc-900"
                      }`}
                    >
                      New Address
                    </button>
                  </div>

                  {addressTab === "existing" ? (
                    /* Existing Addresses from Profile */
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => {
                        const isSelected =
                          selectedAddressUuid === addr.addressUuid;
                        return (
                          <div
                            key={addr.addressUuid}
                            onClick={() =>
                              setSelectedAddressUuid(addr.addressUuid)
                            }
                            className={`border rounded-2xl p-4 cursor-pointer transition relative ${
                              isSelected
                                ? "border-[#D4A97A] bg-amber-50/20 dark:bg-zinc-800"
                                : "border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:border-amber-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white">
                              <MapPin size={14} className="text-[#D4A97A]" />
                              <span>
                                {addr.fullName} ({addr.mobileNo})
                              </span>
                              {addr.addressLabel && (
                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                  {addr.addressLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2
                                ? `, ${addr.addressLine2}`
                                : ""}
                            </p>
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-[#D4A97A] text-white rounded-full p-1">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {savedAddresses.length === 0 && (
                        <div className="p-4 rounded-xl border border-dashed text-center text-xs text-gray-400">
                          No saved addresses found in your profile. Please click
                          New Address to enter delivery details.
                        </div>
                      )}
                    </div>
                  ) : (
                    /* New Address Form */
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newAddressForm.fullName}
                          onChange={(e) =>
                            setNewAddressForm({
                              ...newAddressForm,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Full Name"
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                        />
                      </div>

                      {/* Phone & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="text"
                            value={newAddressForm.mobile}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                mobile: e.target.value,
                              })
                            }
                            placeholder="01700000000"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={newAddressForm.email}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                email: e.target.value,
                              })
                            }
                            placeholder="user@example.com"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Address Line */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Full Address *
                        </label>
                        <textarea
                          rows={2}
                          value={newAddressForm.addressLine1}
                          onChange={(e) =>
                            setNewAddressForm({
                              ...newAddressForm,
                              addressLine1: e.target.value,
                            })
                          }
                          placeholder="House, Road, Apartment details"
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white resize-none"
                        />
                      </div>

                      {/* District & Area Dropdowns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            District *
                          </label>
                          <select
                            value={newAddressForm.districtId}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                districtId: Number(e.target.value),
                                areaId: 0,
                              })
                            }
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer"
                          >
                            <option value={0}>Select District</option>
                            {districts.map((d) => (
                              <option key={d.distID} value={d.distID}>
                                {d.districtName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Area / Police Station *
                          </label>
                          <select
                            value={newAddressForm.areaId}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                areaId: Number(e.target.value),
                              })
                            }
                            disabled={!newAddressForm.districtId}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer disabled:opacity-50"
                          >
                            <option value={0}>Select Area</option>
                            {availableAreas.map((a) => (
                              <option key={a.areaID} value={a.areaID}>
                                {a.areaName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If Shop Pickup is active */}
              {deliveryMethod === "pickup" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60 space-y-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    <Store size={18} />
                    <span>Select Pickup Store</span>
                  </div>

                  <select
                    value={selectedStoreUuid}
                    onChange={(e) => setSelectedStoreUuid(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer"
                  >
                    {storeList.map((store) => (
                      <option key={store.uuid} value={store.uuid}>
                        {store.branchName} ({store.address || "Dazzle Store"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Order Remarks */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Order Remarks / Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Please call before delivery"
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Product Description & totals */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm">
                  3
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Items ({cartItems.length})
                </h2>
              </div>

              {/* Cart Items Box */}
              <div className="bg-gray-50 dark:bg-zinc-900/30 rounded-2xl p-4 divide-y divide-gray-100 dark:divide-zinc-800/80 max-h-96 overflow-y-auto scrollbar-thin">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start"
                  >
                    <span className="text-xs font-bold text-gray-400 mt-1">
                      {index + 1}
                    </span>

                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-150 flex-shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                      <h4
                        className="text-xs font-semibold text-gray-800 dark:text-zinc-200 leading-snug line-clamp-2"
                        title={item.name}
                      >
                        {item.name}
                      </h4>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                          <button
                            type="button"
                            onClick={() => dispatch(decreaseQty(item.id))}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                          >
                            <Minus size={10} className="text-gray-500" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800 dark:text-white select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => dispatch(increaseQty(item.id))}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                          >
                            <Plus size={10} className="text-gray-500" />
                          </button>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <p className="text-sm text-gray-400 py-6 text-center italic">
                    Your cart is empty
                  </p>
                )}
              </div>

              {/* Receipt Totals details */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">
                    Sub-Total:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">
                    Delivery Fee:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                {paymentType === "cod" && (
                  <div className="flex justify-between items-center text-sm font-semibold text-amber-600">
                    <span>COD Charge (1%):</span>
                    <span>{formatPrice(codCharge)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 dark:border-zinc-800">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-[#D4A97A] focus:ring-[#D4A97A] mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-zinc-400 leading-normal">
                    I accept the{" "}
                    <Link
                      href="/terms-conditions"
                      className="text-[#D4A97A] hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    outlined, including{" "}
                    <Link
                      href="/delivery-policy"
                      className="text-[#D4A97A] hover:underline"
                    >
                      Delivery
                    </Link>
                    ,{" "}
                    <Link
                      href="/refund-policy"
                      className="text-[#D4A97A] hover:underline"
                    >
                      Refund
                    </Link>
                    , and{" "}
                    <Link
                      href="/cancellation-policy"
                      className="text-[#D4A97A] hover:underline"
                    >
                      Cancellation
                    </Link>{" "}
                    Policies.
                  </span>
                </label>
              </div>

              {/* Confirm Order Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting || cartItems.length === 0}
                  className={`w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-[#D4A97A]/10 text-[#a0743b] border-2 border-[#D4A97A] font-bold px-8 py-3.5 rounded-xl transition cursor-pointer text-xs uppercase tracking-widest ${
                    isSubmitting || cartItems.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PROCESSING ORDER...</span>
                    </>
                  ) : (
                    "CONFIRM ORDER"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Simulation */}
      {orderConfirmed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1C1A17] rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-gray-150 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto text-white">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Thank you! Your order was placed successfully.
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your Order Number is:{" "}
              <strong className="text-gray-800 dark:text-white font-bold">
                {confirmedOrderData?.orderNo || "#DZL-10001"}
              </strong>
              <br />
              Total Amount: {formatPrice(confirmedOrderData?.total || total)}
            </p>
            <div className="pt-2">
              <Link
                href="/profile"
                className="inline-block w-full py-3 bg-[#D4A97A] text-white font-bold rounded-xl hover:bg-[#c89a6b] transition text-xs tracking-wider cursor-pointer"
              >
                VIEW ORDER HISTORY
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
