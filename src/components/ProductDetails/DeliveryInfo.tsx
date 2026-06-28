import React from "react";
import { Bike, Star, ShoppingBag } from "lucide-react";

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
      icon: <Bike size={22} className="text-orange-500" />,
      label: "Estimated Delivery",
      value: deliveryDays,
      bg: "bg-orange-50",
    },
    {
      icon: <Star size={22} className="text-yellow-500 fill-yellow-400" />,
      label: "Purchase Point",
      value: purchasePoints.toString(),
      bg: "bg-yellow-50",
    },
    {
      icon: <ShoppingBag size={22} className="text-blue-500" />,
      label: "Minimum Booking Amount",
      value: formatPrice(minBookingAmount),
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} rounded-2xl p-3 flex flex-col items-center text-center gap-1.5`}
        >
          {item.icon}
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">{item.label}</p>
          <p className="text-sm sm:text-base font-extrabold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DeliveryInfo;