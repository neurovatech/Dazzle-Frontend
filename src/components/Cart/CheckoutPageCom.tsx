"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/share/Breadcrumb";
import Link from "next/link";
import { Plus, Minus, CreditCard, Truck, Check, Store, ShieldCheck, MapPin } from "lucide-react";
import toast from "react-hot-toast";

type AddressData = {
  name: string;
  phone: string;
  zip: string;
  address: string;
  district: string;
  thana: string;
};

type CartItemType = {
  id: number;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  inStock: boolean;
};

const INITIAL_ITEMS: CartItemType[] = [
  {
    id: 1,
    brand: "Apple",
    name: "iPhone 17 Pro Max (iPhone 17 Pro Max color-Cosmic Orange region/variant-USA (Dual e-Sim)...",
    price: 144888,
    originalPrice: 189990,
    image: "https://dazzle.sgp1.cdn.digitaloceanspaces.com/42749/Honor-X6c-Price-in-bangladesh-Ocean-Cyan.jpg",
    quantity: 1,
    inStock: true,
  },
];

const DISTRICTS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];
const THANAS: Record<string, string[]> = {
  Dhaka: ["Banani", "Gulshan", "Dhanmondi", "Mirpur", "Uttara", "Mohammadpur", "Badda", "Tejgaon"],
  Chittagong: ["Panchlaish", "Double Mooring", "Kotwali", "Halishahar", "Pahartali"],
  Sylhet: ["Kotwali", "Shah Paran", "Osmani Nagar", "South Surma"],
  Rajshahi: ["Boalia", "Motihar", "Rajpara", "Shah Mokhdum"],
};

export default function CheckoutPageCom() {
  const [items, setItems] = useState<CartItemType[]>(INITIAL_ITEMS);
  const [paymentType, setPaymentType] = useState<"online" | "cod">("online");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "sslcommerz">("bkash");
  const [deliveryMethod, setDeliveryMethod] = useState<"regular" | "pickup">("regular");
  const [addressTab, setAddressTab] = useState<"existing" | "new">("new");
  const [selectedStore, setSelectedStore] = useState<string>("Banani Branch (Dazzle Flagship)");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState<AddressData>({
    name: "Akm Dulal",
    phone: "01988534220",
    zip: "",
    address: "",
    district: "Dhaka",
    thana: "Banani",
  });

  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([
    {
      name: "Akm Dulal",
      phone: "01988534220",
      zip: "1212",
      address: "House 45, Road 11, Banani",
      district: "Dhaka",
      thana: "Banani",
    },
  ]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "#" },
  ];

  // Quantity Handlers
  const handleIncrease = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.address) {
      toast.error("Please fill in all the required information.");
      return;
    }
    setSavedAddresses([addressForm]);
    setAddressTab("existing");
    toast.success("Address saved successfully!");
  };

  const handleConfirmOrder = () => {
    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions.");
      return;
    }
    if (deliveryMethod === "regular" && savedAddresses.length === 0) {
      toast.error("Please save your delivery address.");
      return;
    }
    setOrderConfirmed(true);
    toast.success("Your order has been successfully placed!");
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === "pickup" ? 0 : 60;
  const codCharge = paymentType === "cod" ? Math.round((subtotal + deliveryFee) * 0.01) : 0;
  const discount = 1; // 1 BDT discount as in screenshot
  const total = subtotal + deliveryFee + codCharge - discount;

  const formatPrice = (val: number) => "৳" + val.toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-8">
          Checkout your cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Payment & Delivery */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* 1. Payment Method Card */}
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment</h2>
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
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "online" ? "border-[#D4A97A]" : "border-gray-300 dark:border-zinc-700"
                    }`}>
                      {paymentType === "online" && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
                    </div>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => setPaymentType("cod")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentType === "cod"
                        ? "border-[#D4A97A] bg-amber-50/10 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-sm font-bold block">Cash on Delivery</span>
                      <span className="text-[10px] text-amber-600 font-semibold">(1% Extra COD Charge)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "cod" ? "border-[#D4A97A]" : "border-gray-300 dark:border-zinc-700"
                    }`}>
                      {paymentType === "cod" && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Gateway Method (bkash or sslcommerz) - Show if Online Payment is active */}
              {paymentType === "online" && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    <CreditCard size={18} />
                    <span>Payment Method</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* bKash */}
                    <button
                      onClick={() => setPaymentMethod("bkash")}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer h-20 ${
                        paymentMethod === "bkash"
                          ? "border-[#e2136e] bg-pink-50/5 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {/* Stylized bKash Representation */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#e2136e] flex items-center justify-center text-white font-black text-xs">
                          bK
                        </div>
                        <span className="font-extrabold text-[#e2136e] text-lg">bKash</span>
                      </div>
                    </button>

                    {/* SSLCOMMERZ */}
                    <button
                      onClick={() => setPaymentMethod("sslcommerz")}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer h-20 ${
                        paymentMethod === "sslcommerz"
                          ? "border-blue-600 bg-blue-50/5 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {/* Stylized SSLCOMMERZ Representation */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-[10px] leading-tight">
                          SSL
                        </div>
                        <span className="font-extrabold text-blue-600 text-base tracking-tighter">SSLCOMMERZ</span>
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery</h2>
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
                    <span className="text-sm font-bold">Regular Delivery</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      deliveryMethod === "regular" ? "border-[#D4A97A]" : "border-gray-300 dark:border-zinc-700"
                    }`}>
                      {deliveryMethod === "regular" && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
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
                    <span className="text-sm font-bold">Shop Pickup</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      deliveryMethod === "pickup" ? "border-[#D4A97A]" : "border-gray-300 dark:border-zinc-700"
                    }`}>
                      {deliveryMethod === "pickup" && <div className="w-2 h-2 rounded-full bg-[#D4A97A]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* If Regular Delivery is active: Address selector and input */}
              {deliveryMethod === "regular" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60 space-y-4">
                  <span className="block text-sm font-bold text-gray-800 dark:text-white">Add Address</span>

                  {/* Tabs */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAddressTab("existing")}
                      className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                        addressTab === "existing"
                          ? "bg-white border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                          : "bg-gray-50 border-transparent text-gray-400 dark:bg-zinc-900"
                      }`}
                    >
                      Existing Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressTab("new")}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
                        addressTab === "new"
                          ? "bg-[#D4A97A] text-white"
                          : "bg-gray-50 text-gray-400 dark:bg-zinc-900"
                      }`}
                    >
                      New Address
                    </button>
                  </div>

                  {addressTab === "new" ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      {/* Name */}
                      <div>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          placeholder="Full Name"
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                        />
                      </div>

                      {/* Phone & Zip */}
                      <div className="flex gap-4">
                        <div className="w-2/3">
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="Phone Number"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                          />
                        </div>
                        <div className="w-1/3">
                          <input
                            type="text"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            placeholder="ZIP"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Full Address */}
                      <div>
                        <textarea
                          rows={3}
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          placeholder="Full address"
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white resize-none"
                        />
                      </div>

                      {/* District */}
                      <div>
                        <select
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value, thana: THANAS[e.target.value]?.[0] || "" })}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer"
                        >
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Thana */}
                      <div>
                        <select
                          value={addressForm.thana}
                          onChange={(e) => setAddressForm({ ...addressForm, thana: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer"
                        >
                          {(THANAS[addressForm.district] || []).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Save Button */}
                      <button
                        type="submit"
                        className="w-full bg-[#101518] hover:bg-black text-white text-xs font-bold py-3.5 rounded-xl transition tracking-widest cursor-pointer"
                      >
                        SAVE
                      </button>
                    </form>
                  ) : (
                    // Existing Address List
                    <div className="space-y-3">
                      {savedAddresses.map((addr, idx) => (
                        <div key={idx} className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-900/40 relative">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white">
                            <MapPin size={14} className="text-[#D4A97A]" />
                            <span>{addr.name} ({addr.phone})</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {addr.address || "No address provided"}, {addr.thana}, {addr.district} - {addr.zip}
                          </p>
                          <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-0.5">
                            <Check size={12} />
                          </div>
                        </div>
                      ))}
                      {savedAddresses.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No saved address found.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* If Shop Pickup is active: Store selector */}
              {deliveryMethod === "pickup" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/60 space-y-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    <Store size={18} />
                    <span>Select Store</span>
                  </div>

                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] dark:text-white cursor-pointer"
                  >
                    <option value="Banani Branch (Dazzle Flagship)">Banani Branch (Dazzle Flagship)</option>
                    <option value="Dhanmondi Branch (Dazzle Express)">Dhanmondi Branch (Dazzle Express)</option>
                    <option value="Mirpur Branch (Dazzle Hub)">Mirpur Branch (Dazzle Hub)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Description & totals */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A97A] flex items-center justify-center text-[#D4A97A] font-bold text-sm">
                  3
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Description</h2>
              </div>

              {/* Grey Container Box for Cart Items */}
              <div className="bg-gray-50 dark:bg-zinc-900/30 rounded-2xl p-4 divide-y divide-gray-100 dark:divide-zinc-800/80">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start">
                    {/* Index */}
                    <span className="text-xs font-bold text-gray-400 mt-1">{index + 1}</span>

                    {/* Thumbnail Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-150 flex-shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>

                    {/* Description Details */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-zinc-200 leading-snug line-clamp-2" title={item.name}>
                        {item.name}
                      </h4>
                      
                      <div className="flex items-center justify-between gap-2 pt-2">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item.id)}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                          >
                            <Minus size={10} className="text-gray-500" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800 dark:text-white select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item.id)}
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
                          {item.originalPrice > 0 && (
                            <span className="block text-[10px] text-gray-400 line-through">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-sm text-gray-400 py-6 text-center italic">Your cart is empty</p>
                )}
              </div>

              {/* Receipt Totals details */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                
                {/* Sub-Total */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">Sub-Total:</span>
                  <span className="text-gray-900 dark:text-white">{subtotal.toLocaleString("en-IN")} BDT</span>
                </div>

                {/* Delivery fee */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">Delivery Fee:</span>
                  <span className="text-gray-900 dark:text-white">{deliveryFee} BDT</span>
                </div>

                {/* 1% COD Charge - updates in real time based on Payment Type selection */}
                {paymentType === "cod" && (
                  <div className="flex justify-between items-center text-sm font-semibold text-amber-600">
                    <span className="flex items-center gap-1">
                      <span>COD Charge (1%):</span>
                    </span>
                    <span>{codCharge.toLocaleString("en-IN")} BDT</span>
                  </div>
                )}

                {/* Discount */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                  <span className="text-gray-900 dark:text-white">{discount} BDT</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 dark:border-zinc-800">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {total.toLocaleString("en-IN")} BDT
                  </span>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
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
                    <Link href="/terms-conditions" className="text-[#D4A97A] hover:underline">
                      Terms & Conditions
                    </Link>{" "}
                    outlined, including{" "}
                    <Link href="/delivery-policy" className="text-[#D4A97A] hover:underline">
                      Delivery
                    </Link>
                    ,{" "}
                    <Link href="/refund-policy" className="text-[#D4A97A] hover:underline">
                      Refund
                    </Link>
                    , and{" "}
                    <Link href="/cancellation-policy" className="text-[#D4A97A] hover:underline">
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
                  className="bg-amber-50 hover:bg-[#D4A97A]/10 text-[#a0743b] border-2 border-[#D4A97A] font-bold px-8 py-3.5 rounded-xl transition cursor-pointer text-xs uppercase tracking-widest"
                >
                  CONFIRM ORDER
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thank you! Your order was successful.</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your order number is: <strong className="text-gray-800 dark:text-white">#DZ-{Math.floor(100000 + Math.random() * 900000)}</strong>
              <br />
              We will contact you soon.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setOrderConfirmed(false)}
                className="w-full py-3 bg-[#D4A97A] text-white font-bold rounded-xl hover:bg-[#c89a6b] transition text-xs tracking-wider cursor-pointer"
              >
                Go Back / Payments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
