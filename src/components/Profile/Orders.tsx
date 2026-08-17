"use client";
import React, { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Loader2, PackageX, ShoppingBag, Package, FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import { OrderListResponse, ApiOrderItem, Order } from "./profile.types";
import InvoiceModal from "./InvoiceModal";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
};

/** Four tabs — per Figma, only "All Orders" shows a count. */
type Tab = "all" | "pending" | "completed" | "cancel";

function tabMatches(o: ApiOrderItem, tab: Tab): boolean {
  if (tab === "all") return true;
  if (tab === "cancel") return o.isCancelled;
  if (tab === "completed") return o.isDelivered && !o.isCancelled;
  return !o.isDelivered && !o.isCancelled; // pending / in-progress
}

/** Order (list item) → Order (profile.types shape) — feeds OrderDetails/ProfilePage navigation. */
function toOrderModel(o: ApiOrderItem): Order {
  const status: Order["status"] = o.isCancelled ? "Cancelled" : o.isDelivered ? "Delivered" : "In Progress";
  return {
    id: o.comerzOrderNo,
    comerzOrderNo: o.comerzOrderNo,
    date: fmtDate(o.createdAt),
    orderDate: o.createdAt,
    status,
    total: `৳${(o.total ?? 0).toLocaleString("en-IN")}`,
    totalNumber: o.total,
    rawApiData: o,
  };
}

function StatusLabel({ order }: { order: ApiOrderItem }) {
  if (order.isCancelled) return <span className="text-xs font-bold text-red-500 shrink-0">Cancel</span>;
  if (order.isDelivered) return <span className="text-xs font-bold text-green-600 shrink-0">Success</span>;
  return <span className="text-xs font-bold text-amber-600 shrink-0">In Progress</span>;
}

// ─── Order Row (shared mobile + desktop, Tailwind adapts) ────────────────────
function OrderRow({
  order, onOpen, onInvoice,
}: {
  order: ApiOrderItem;
  onOpen: () => void;
  onInvoice: () => void;
}) {
  const firstItem = order.comerzOrderItems?.[0];
  const productLabel = firstItem
    ? `${firstItem.productName}${order.comerzOrderItems!.length > 1 ? ` +${order.comerzOrderItems!.length - 1} more` : ""}`
    : order.productName || `${order.productCount} product${order.productCount !== 1 ? "s" : ""}`;

    console.log(order, "firstItemfirstItemfirstItemfirstItemfirstItem")

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-gray-100 dark:border-zinc-800 p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">

        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <Package size={22} className="text-gray-400" />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {productLabel}
            </p>
            <StatusLabel order={order} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Order #{order.comerzOrderNo}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
            ৳{(order.total ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Action button — Figma: "Track Order" while in-progress, otherwise "See Details" ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            !order.isDelivered && !order.isCancelled
              ? "bg-[#FFF1E0] text-[#7A4500] border border-[#E9CCAE] hover:bg-[#FCE7CE]"
              : "bg-white dark:bg-transparent border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          {!order.isDelivered && !order.isCancelled ? "Track Order" : "See Details"}
        </button>
        <button
          onClick={onInvoice}
          title="View Invoice"
          className="w-10 h-10 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
        >
          <FileText size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Orders Component ──────────────────────────────────────────────────
interface OrdersProps {
  onOrderClick?: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ onOrderClick }) => {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>("all");
  const [invoiceOrder, setInvoiceOrder] = useState<ApiOrderItem | null>(null);
  const limit = 10;

  const { isAuthenticated, token, apiKey } = useAppSelector((s) => s.auth);
  const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

  const { data: orderListRes, isLoading, isError, error } = useQuery<OrderListResponse>({
    queryKey: ["order-list", apiKey, page],
    queryFn: () => api.get<OrderListResponse>(
      `/api/tokenized/v1/order-list?page=${page}&limit=${limit}`,
      { headers: { Authorization: authHeader, "X-API-Key": apiKey || "" } }
    ),
    enabled: !!isAuthenticated && !!token && !!apiKey,
  });

  const totalPages = orderListRes?.totalPages || 1;
  const totalCount = orderListRes?.totalCount || 0;

  // Note: the Pending/Completed/Cancel filters only apply to the current page of
  // results, because the order-list API doesn't support server-side status filtering.
  const filteredOrders = useMemo(
    () => (orderListRes?.data || []).filter((o) => tabMatches(o, tab)),
    [orderListRes?.data, tab],
  );

  const handleOpen = (order: ApiOrderItem) => {
    onOrderClick?.(toOrderModel(order));
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800">
        <PackageX className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white">Login Required</h3>
        <p className="text-xs text-gray-400 mt-1">Please log in to view your orders.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-[#7A4500] animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading your orders...</p>
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

  return (
    <>
      <div className="space-y-4 font-sans">
        {/* ── Tabs (Figma: All Orders (23) | Pending | Completed | Cancel) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            { key: "all", label: `All Orders (${totalCount})` },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
            { key: "cancel", label: "Cancel" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                tab === t.key
                  ? "bg-[#E9CCAE] text-[#5a3300] dark:bg-[#6D3F0E] dark:text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-white">No Orders Found</h3>
            <p className="text-xs text-gray-400 mt-1">There are no orders in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.comerzOrderNo}
                order={order}
                onOpen={() => handleOpen(order)}
                onInvoice={() => setInvoiceOrder(order)}
              />
            ))}
          </div>
        )}

        {/* Pagination — follows the order-list API's own paging (independent of the tab filter) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white disabled:opacity-40 flex items-center gap-1">
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white disabled:opacity-40 flex items-center gap-1">
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          authHeader={authHeader}
          apiKey={apiKey || ""}
        />
      )}
    </>
  );
};

export default Orders;
