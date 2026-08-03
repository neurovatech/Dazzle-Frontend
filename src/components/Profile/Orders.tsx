"use client";
import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Loader2, PackageX, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import { Order, OrderListResponse, ApiOrderItem } from "./profile.types";

interface OrdersProps {
  onOrderClick: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ onOrderClick }) => {
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { isAuthenticated, token, apiKey } = useAppSelector(
    (state) => state.auth
  );

  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  // ── Fetch Order List from API ──
  const { data: orderListRes, isLoading, isError, error } = useQuery<OrderListResponse>({
    queryKey: ["order-list", apiKey, page],
    queryFn: async () => {
      return api.get<OrderListResponse>(
        `/api/tokenized/v1/order-list?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: authHeader,
            "X-API-Key": apiKey || "",
          },
        }
      );
    },
    enabled: !!isAuthenticated && !!token && !!apiKey,
  });

  const apiOrders = orderListRes?.data || [];
  const totalPages = orderListRes?.totalPages || 1;
  const totalCount = orderListRes?.totalCount || 0;

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const handleSelectOrder = (item: ApiOrderItem) => {
    const status: "In Progress" | "Delivered" | "Cancelled" = item.isCancelled
      ? "Cancelled"
      : item.isDelivered
      ? "Delivered"
      : "In Progress";

    const mappedOrder: Order = {
      id: item.comerzOrderNo,
      comerzOrderNo: item.comerzOrderNo,
      date: formatDate(item.createdAt),
      orderDate: item.createdAt,
      status: status,
      total: `৳${(item.total ?? 0).toLocaleString("en-IN")}`,
      totalNumber: item.total ?? 0,
      rawApiData: item,
    };

    onOrderClick(mappedOrder);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800">
        <PackageX className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white">Authentication Required</h3>
        <p className="text-xs text-gray-400 mt-1">Please log in to view your order history.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7A4500] animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading your orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800">
        <PackageX className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white">Failed to load orders</h3>
        <p className="text-xs text-gray-400 mt-1">{(error as Error)?.message || "Something went wrong."}</p>
      </div>
    );
  }

  if (apiOrders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white">No Orders Found</h3>
        <p className="text-xs text-gray-400 mt-1">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Showing {apiOrders.length} of {totalCount} orders
        </span>
      </div>

      <div className="space-y-3">
        {apiOrders.map((order) => {
          const status = order.isCancelled
            ? "Cancelled"
            : order.isDelivered
            ? "Delivered"
            : "In Progress";

          return (
            <div
              key={order.comerzOrderNo}
              onClick={() => handleSelectOrder(order)}
              className="bg-white dark:bg-[#393430] rounded-2xl p-4 border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
            >
              <div>
                <p className="font-bold text-[#7A4500] dark:text-[#d48c34]">
                  Order #{order.comerzOrderNo}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {formatDate(order.createdAt)} • {order.productCount} Item
                  {order.productCount !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
                  ৳{(order.total ?? 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    order.isCancelled
                      ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                      : order.isDelivered
                      ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400"
                  }`}
                >
                  {status}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
