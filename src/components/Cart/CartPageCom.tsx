"use client";
import React, { useState } from "react";
import CartItem from "./CartItem";
import CartSidebar from "./CartSidebar";
import AddressFormModal from "./AddressFormModal";
import AddressViewModal from "./AddressViewModal";
import PaymentMethodModal from "./PaymentMethodModal";
import AddCouponModal from "./AddCouponModal";
import OrderSuccessModal from "./OrderSuccessModal";
import Breadcrumb from "@/components/share/Breadcrumb";
import { Cpu } from 'lucide-react';


import Link from "next/link";

type AddressData = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
};

type CartItemType = {
  id: number;
  brand: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  quantity: number;
  inStock: boolean;
};

const INITIAL_ITEMS: CartItemType[] = [
  {
    id: 1,
    brand: "Apple",
    name: "Belkin USB C 7 in 1 Multip...",
    price: "1,00,000",
    originalPrice: "130,000",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=200&hei=200&fmt=jpeg",
    quantity: 1,
    inStock: true,
  },
  {
    id: 2,
    brand: "Apple",
    name: "Belkin USB C 7 in 1 Multip...",
    price: "1,00,000",
    originalPrice: "130,000",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=200&hei=200&fmt=jpeg",
    quantity: 1,
    inStock: true,
  },
];

type ModalType =
  | "none"
  | "address_form"
  | "address_view"
  | "payment"
  | "coupon";

import { DeliveryOption } from "./CartSidebar";

export default function CartPageCom() {
  const [items, setItems] = useState<CartItemType[]>(INITIAL_ITEMS);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentLabel, setPaymentLabel] = useState("Cash on Delivery");
  const [modal, setModal] = useState<ModalType>("none");

  // 20 Client Requirements Checkout States
  const [selectedCurrency, setSelectedCurrency] = useState<string>("BDT");
  const [useWalletSplit, setUseWalletSplit] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryOption>("regular");
  const [selectedStore, setSelectedStore] = useState<string>("banani");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    "10:00 AM - 12:00 PM (Available)",
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "#" },
  ];

  const handleIncrease = (id: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );

  const handleDecrease = (id: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );

  const handleAddressApply = (data: AddressData) => {
    setSavedAddress(data);
    setModal("none");
  };

  const handleAddressClick = () => {
    setModal(savedAddress ? "address_view" : "address_form");
  };

  const PAYMENT_MAP: Record<string, string> = {
    cash: "Cash on Delivery",
    mobile_banking: "Mobile Banking",
    card: "Debit/Credit Card",
    store: "Pay at Store",
    book: "Book Product",
  };

  // Calculate pricing values based on current exchange rates and selections
  const baseSubtotal = items.reduce(
    (sum, item) =>
      sum + parseFloat(item.price.replace(/,/g, "")) * item.quantity,
    0,
  );
  const baseDeliveryFees: Record<DeliveryOption, number> = {
    regular: 60,
    fast: 150,
    express: 100,
    pickup: 0,
  };
  const baseDeliveryFee = baseDeliveryFees[selectedDelivery];
  const baseTotalBill = baseSubtotal + baseDeliveryFee;

  const rateMap: Record<string, number> = {
    BDT: 1,
    USD: 118,
    AED: 32,
    EUR: 126,
  };
  const rate = rateMap[selectedCurrency] || 1;

  const subtotal = (baseSubtotal / rate).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedCurrency === "BDT" ? 0 : 2,
  });
  const deliveryFee = (baseDeliveryFee / rate).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedCurrency === "BDT" ? 0 : 2,
  });
  const totalBill = (baseTotalBill / rate).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedCurrency === "BDT" ? 0 : 2,
  });

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="px-4 sm:px-6 py-4">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Shopping Cart <span className="text-[#E6A817]">({items.length})</span>
        </h1>

        <div className="w-full">
          <div className="w-full">
            <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-gray-100 dark:border-gray-800  shadow-sm px-5 divide-y divide-gray-100">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              ))}
            </div>

            <div className="grid grid-cols-12 md:grid-cols-8 gap-4 mt-6">
              <div className="md:col-span-3 col-span-12 md:col-start-6 rounded-2xl shadow-sm p-4 dark:bg-[#1C1A17]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-white">
                    Subtotal
                  </span>
                  <span className="text-sm text-gray-900 font-bold dark:text-white">
                     {subtotal} {selectedCurrency}
                  </span>
                </div>
                <hr className="border-dashed border-gray dark:border-white"></hr>

                <div className="flex justify-between my-4">
                  <span className="text-sm text-gray-500 dark:text-white">
                    Discount
                  </span>
                  <span className="text-sm text-gray-900 font-bold dark:text-white">
                    {/* {selectedCurrency} {deliveryFee} */}
                    10 {selectedCurrency}
                  </span>
                </div>
                <hr className="border-dashed border-gray dark:border-white"></hr>

                <div className="flex justify-between my-4">
                  <span className="text-sm text-gray-500 dark:text-white">
                    Total
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white font-bold">
                  {totalBill}   {selectedCurrency} 
                  </span>
                </div>

                <div className="flex justify-between mb-2 gap-4">
  <div className="mt-4 w-full">
    <Link
      href="/"
      className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white dark:text-white hover:text-[#c9911a] transition bg-[#D4A97A] dark:bg-[#FDF3E7] rounded-lg px-4 py-4"
    >

      Continue Shopping
    </Link>
  </div>
  <div className="mt-4 w-full">
    <Link
      href="/checkout"
      className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white dark:text-white hover:text-[#c9911a] transition bg-[#101518] dark:bg-[#FDF3E7] rounded-lg px-4 py-4"
    >
      Checkout
    </Link>
  </div>
</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AddressFormModal
        isOpen={modal === "address_form"}
        onClose={() => setModal("none")}
        onApply={handleAddressApply}
      />

      {savedAddress && (
        <>
          <AddressViewModal
            isOpen={modal === "address_view"}
            onClose={() => setModal("none")}
            address={savedAddress}
            onDelete={() => {
              setSavedAddress(null);
              setModal("none");
            }}
            onEdit={() => setModal("address_form")}
          />
          <AddressFormModal
            isOpen={modal === "address_form"}
            onClose={() => setModal("none")}
            onApply={handleAddressApply}
            initialData={savedAddress}
          />
        </>
      )}

      <AddCouponModal
        isOpen={modal === "coupon"}
        onClose={() => setModal("none")}
        onApply={(coupon) => {
          setAppliedCoupon(coupon.code);
          setModal("none");
        }}
      />

      <PaymentMethodModal
        isOpen={modal === "payment"}
        onClose={() => setModal("none")}
        onConfirm={(method, sub) => {
          let label = PAYMENT_MAP[method] || "Cash on Delivery";
          if (sub) {
            label += ` (${sub === "bkash" ? "bKash" : "Nagad"})`;
          }
          setPaymentLabel(label);
        }}
        bookProductPrice="৳ 1,00,000"
        selectedDelivery={selectedDelivery}
      />
    </div>
  );
}
