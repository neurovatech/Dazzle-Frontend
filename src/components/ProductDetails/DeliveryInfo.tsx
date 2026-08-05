import React from "react";
import { Bike, Star, ShoppingBag } from "lucide-react";
import Bk from "@/images/bk.png";
import ST from "@/images/st.png";
import LK from "@/images/lk.png";
interface DeliveryInfoProps {
  deliveryDays: string;
  purchasePoints: number;
  minBookingAmount: number;
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({
  deliveryDays,
  purchasePoints,
  minBookingAmount,
}) => {
  const items = [
    {
      icon: Bk,
      label: "Estimated Delivery",
      value: "0-3 Days",
      bg: "bg-[#FFFCD3]",
    },
    {
      icon: ST,
      label: "Purchase Point",
      value: purchasePoints.toString(),
      bg: "bg-[#FFEFDE]",
    },
    {
      icon: LK,
      label: "Minimum Booking Amount",
      value: formatPrice(minBookingAmount),
      bg: "bg-[#F0F4FF]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} rounded-2xl px-3 py-6 flex flex-col items-center text-center gap-1.5`}
        >
          <img src={item.icon.src} alt={item.label} className="w-6 h-6" />
          <p className="text-[10px] sm:text-xs text-[#222222] font-medium leading-tight">{item.label}</p>
          <p className="text-sm sm:text-base font-extrabold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DeliveryInfo;