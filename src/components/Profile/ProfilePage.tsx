"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ActiveLabel, Order } from "./profile.types";
import ProfileSideNav from "./ProfileSideNav";
import WishList from "./WishList";
import Orders from "./Orders";
import OrderDetails from "./OrderDetails";
import DeliveryAddress from "./DeliveryAddress";
import Coupons from "./Coupons";
import Compare from "./Compare";
import ChangePassword from "./ChangePassword";
import ProfileOtp from "./ProfileOtp";

const Profile: React.FC = () => {
  const [activeLabel, setActiveLabel] = useState<ActiveLabel>("Wishlist");
  /** null = show side-nav menu, string = show that page (mobile only) */
  const [mobileView, setMobileView] = useState<ActiveLabel | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Reset sub-views when tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeLabel !== "Orders") setSelectedOrder(null);
    if (activeLabel !== "Change Password") setShowOtp(false);
  }, [activeLabel]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleMobileMenuClick = (label: ActiveLabel): void => {
    setActiveLabel(label);
    setMobileView(label);
    setSelectedOrder(null);
    setShowOtp(false);
  };

  const handleDesktopMenuClick = (label: ActiveLabel): void => {
    setActiveLabel(label);
  };

  const handleMobileBack = (): void => {
    if (selectedOrder) {
      setSelectedOrder(null);
      return;
    }
    if (showOtp) {
      setShowOtp(false);
      return;
    }
    setMobileView(null);
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const pageTitle: string = selectedOrder
    ? `Order ${selectedOrder.id}`
    : showOtp
      ? "Verify OTP"
      : activeLabel === "Address"
        ? "Delivery Address"
        : activeLabel;

  // ── Content renderer (shared desktop + mobile) ───────────────────────────────
  const renderContent = (): React.ReactNode => {
    if (selectedOrder)
      return (
        <OrderDetails
          order={selectedOrder}
        />
      );
    if (showOtp) return <ProfileOtp />;

    switch (activeLabel) {
      case "Wishlist":
        return <WishList />;
      case "Orders":
        return <Orders onOrderClick={setSelectedOrder} />;
      case "Address":
        return <DeliveryAddress />;
      case "Coupons":
        return <Coupons />;
      case "Compare":
        return <Compare />;
      case "Change Password":
        return (
          <ChangePassword setShowOtp={setShowOtp} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="md:hidden">
        {mobileView === null ? (
          <div className="md:p-4 md:pb-20">
            <nav className="text-xs text-primary mb-4">
              <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-white-30">
                Home
              </span>
              <span className="mx-1">›</span>
              <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-white-30">
                Menu
              </span>
            </nav>
            <ProfileSideNav
              activeLabel={activeLabel}
              darkMode={darkMode}
              onMenuClick={handleMobileMenuClick}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
              showChevrons
            />
          </div>
        ) : (
          <div className="pb-20">
            <div className="sticky top-0 bg-white dark:bg-[#393430] border-b border-gray-100 md:px-4 md:py-3 flex items-center gap-3 z-9999">
              <button
                onClick={handleMobileBack}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#555] transition-colors"
              >
                <ArrowLeft
                  size={20}
                  className="text-gray-700 dark:text-white"
                />
              </button>
              <nav className=" text-gray-400 flex items-center gap-1">
                <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-gray-300">
                  Home
                </span>
                <span>›</span>
                <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-gray-300">
                  Menu
                </span>
                <span>›</span>
                <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-gray-300">
                  {pageTitle}
                </span>
              </nav>
            </div>

            <div className="p-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {pageTitle}
              </h1>
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <div className="max-w-350 mx-auto">
          <nav className="text-sm text-gray-400 py-6 flex items-center gap-1">
            <span className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-white-30">
              Home
            </span>
            <ChevronRight size={12} />
            <span className="hover:text-black transition-colors text-black dark:text-white dark:hover:text-white-30">
              Profile
            </span>
          </nav>

          <div className="grid grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <div className="h-fit sticky top-6 z-99">
              <ProfileSideNav
                activeLabel={activeLabel}
                darkMode={darkMode}
                onMenuClick={handleDesktopMenuClick}
                onToggleDarkMode={() => setDarkMode((d) => !d)}
                showChevrons={false}
              />
            </div>

            <div className="">
              {selectedOrder && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mb-4 text-xs font-bold text-[#7A4500] dark:text-[#d48c34] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Orders
                </button>
              )}
              {!selectedOrder && !showOtp && (
                <h1
                  className={`text-3xl font-bold text-gray-900 dark:text-white ${
                    activeLabel === "Wishlist" ? "mb-8" : "mb-6"
                  }`}
                >
                  {pageTitle}
                </h1>
              )}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
