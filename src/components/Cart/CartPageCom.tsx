"use client";
import React, { useState } from "react";
import CartItem from "./CartItem";
import AddressFormModal from "./AddressFormModal";
import AddressViewModal from "./AddressViewModal";
import PaymentMethodModal from "./PaymentMethodModal";
import AddCouponModal from "./AddCouponModal";
import Breadcrumb from "@/components/share/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { patchResolvedVariant } from "@/store/slices/cartSlice";
import { verifyOrderProducts } from "@/lib/verify-order-product";
import toast from "react-hot-toast";
import { DeliveryOption } from "./CartSidebar";
import { LogIn, X } from "lucide-react";

type AddressData = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
};

type ModalType =
  | "none"
  | "address_form"
  | "address_view"
  | "payment"
  | "coupon";

export default function CartPageCom() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const token = useAppSelector((state) => state.auth.token);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate the cart against the backend before handing it to checkout.
   *
   * A cart persists in localStorage indefinitely, so a variant can be retired
   * by the catalogue while it is still sitting in someone's cart. Checkout would
   * then fail at order creation with nothing useful to show. verify-order-product
   * catches that here, and get-default-variant supplies the replacement variant,
   * which is written back into the cart before we navigate.
   *
   * Verification never blocks the redirect — that is deliberate. If the check
   * itself is unreachable we would rather let the user reach checkout than strand
   * them on the cart page.
   */
  const handleCheckout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (!token) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    try {
      const { patches, unresolved } = await verifyOrderProducts(
        cartItems.map((item) => ({
          id: item.id,
          productUuid: item.productUuid,
          variantUuid: item.variantUuid,
          accessoriesUuid: item.accessoriesUuid,
          name: item.name,
        })),
      );

      patches.forEach((patch) =>
        dispatch(
          patchResolvedVariant({
            id: patch.id,
            variantUuid: patch.variantUuid,
            price: patch.price,
            originalPrice: patch.originalPrice,
            image: patch.image,
          }),
        ),
      );

      if (unresolved.length > 0) {
        // Block the redirect — a line the backend still rejects after the
        // get-default-variant recovery attempt will only fail again at order
        // creation, so checkout is not a valid next step for this cart.
        const detail = unresolved
          .map((u) => `${u.name || "An item"}: ${u.reason}`)
          .join(" ");
        toast.error(`Validation failed. ${detail}`);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("[CartPageCom] order verification failed:", err);
      // The check itself errored (e.g. network down) rather than rejecting a
      // specific line — let the user through instead of stranding them here.
    }

    router.push("/checkout");
  };

  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentLabel, setPaymentLabel] = useState("Cash on Delivery");
  const [modal, setModal] = useState<ModalType>("none");

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

  const baseSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const baseDeliveryFees: Record<DeliveryOption, number> = {
    regular: 0,
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
          Shopping Cart{" "}
          <span className="text-[#E6A817]">({cartItems.length})</span>
        </h1>

        <div className="w-full">
          {/* Cart Items List */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 divide-y divide-gray-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">🛒</p>
                <p className="font-semibold text-lg">Your cart is empty</p>
                <p className="text-sm mt-1">Add some products to get started</p>
                <Link
                  href="/"
                  className="inline-block mt-4 bg-[#D4A97A] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#c89a6b] transition"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item) => <CartItem key={item.id} {...item} />)
            )}
          </div>

          {/* Bottom section: Promo code + Totals */}
          <div className="mt-6 flex flex-col md:flex-row md:justify-between gap-4">
            {/* Promo Code & Gift Voucher */}
            <div className="w-full md:w-80 lg:w-96 rounded-2xl space-y-3 border border-gray-100 dark:border-zinc-800 p-5 dark:bg-[#1C1A17] bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Apply promo code"
                  className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] text-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  className="shrink-0 bg-[#E9DCCF] hover:bg-[#d8c7b8] text-gray-800 font-bold px-4 py-3 rounded-xl transition text-xs tracking-wider cursor-pointer"
                >
                  APPLY
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gift Voucher"
                  className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A97A] text-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  className="shrink-0 bg-[#E9DCCF] hover:bg-[#d8c7b8] text-gray-800 font-bold px-4 py-3 rounded-xl transition text-xs tracking-wider cursor-pointer"
                >
                  APPLY
                </button>
              </div>
            </div>

            {/* Receipt Totals Box */}
            <div className="w-full md:w-80 lg:w-96 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 dark:bg-[#1C1A17] bg-white shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="text-sm text-gray-900 font-bold dark:text-white">
                  {subtotal} {selectedCurrency}
                </span>
              </div>
              <hr className="border-dashed border-gray-300 dark:border-gray-600" />

              <div className="flex justify-between my-4">
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Total
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-bold">
                  {totalBill} {selectedCurrency}
                </span>
              </div>

              <div className="flex gap-3 mt-4">
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center text-sm font-medium text-white hover:opacity-80 transition bg-[#D4A97A] rounded-lg px-3 py-3"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center text-sm font-medium text-white hover:opacity-80 transition bg-[#101518] dark:bg-[#2a2420] rounded-lg px-3 py-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                  ) : (
                    "Checkout"
                  )}
                </button>
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

      {/* ── Login Required Modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center gap-5">
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <LogIn size={30} className="text-[#D4A97A]" />
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Login Required
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please log in to proceed to checkout. Your cart items will be
                saved.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/auth/login"
                className="flex-1 py-2.5 rounded-xl bg-[#D4A97A] hover:bg-[#c89a6b] text-white text-sm font-bold text-center transition"
                onClick={() => setShowLoginModal(false)}
              >
                Login Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
