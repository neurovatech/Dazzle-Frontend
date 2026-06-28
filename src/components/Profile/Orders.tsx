"use client";
import { ChevronRight } from "lucide-react";
import { Order } from "./profile.types";
import { orders } from "./profile.data";

interface OrdersProps {
  onOrderClick: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ onOrderClick }) => {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onOrderClick(order)}
          className="bg-white dark:bg-[#393430] rounded-2xl p-4 border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-bold text-[#7A4500]">Order {order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {order.date}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
              {order.total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                order.status === "Delivered"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {order.status}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
