/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Loader2, PackageX, ShoppingBag,
  Eye, FileText, X, Copy, CheckCircle, Truck, Package, Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import {
  OrderListResponse, ApiOrderItem,
  OrderTrackingResponse, OrderTrackingData,
} from "./profile.types";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number) => "৳" + (v ?? 0).toLocaleString("en-IN");
const fmtDate = (iso?: string) => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};
const payLabel = (t?: string) =>
  t === "COD" ? "Cash on Delivery" : t === "OP" ? "Online Payment" : t === "Partial" ? "Booking Money" : t || "—";

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ item }: { item: ApiOrderItem }) {
  if (item.isCancelled) return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Cancelled</span>;
  if (item.isDelivered) return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-600">Delivered</span>;
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>;
}

// ─── Order Detail Modal ─────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, authHeader, apiKey }: {
  order: ApiOrderItem; onClose: () => void; authHeader: string; apiKey: string;
}) {
  const orderNo = order.comerzOrderNo;
  const { data: res, isLoading } = useQuery<OrderTrackingResponse>({
    queryKey: ["order-tracking-detail", orderNo],
    queryFn: () => api.get<OrderTrackingResponse>(`/order-tracking/${orderNo}`, {
      headers: { Authorization: authHeader, "X-API-Key": apiKey },
    }),
    enabled: !!orderNo,
  });
  const d: OrderTrackingData | undefined = res?.data;

  const steps = ["Packing", "Processed", "Shipping", "Delivered"];
  const timeline = d?.statusTimeline ?? [];
  const currentStep = d?.orderDelivered ? 4 : d?.orderCancelled ? 0
    : timeline.length > 2 ? 3 : timeline.length > 1 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1a17] rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#1c1a17] z-10">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Order Details</p>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B57908] animate-spin" /></div>
        ) : (
          <div className="p-5 space-y-5 text-sm">
            {/* Order ID + total */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Order ID #{d?.orderNo || orderNo}</p>
                <p className="text-xs text-gray-400 mt-0.5">Placed on {fmtDate(d?.createdAt || order.createdAt)}</p>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                BDT {(d?.grandAmount ?? order.total ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Delivery + payment */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span className="flex items-center gap-1"><Truck size={13} /> {order.deliveryMethod || "Regular Delivery"}</span>
              <span>{payLabel(order.paymentType)}</span>
            </div>

            {/* Stepper */}
            <div className="relative py-2">
              <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-200 dark:bg-zinc-700" />
              <div className="relative flex justify-between">
                {steps.map((step, i) => {
                  const active = i < currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 ${active ? "bg-green-500 border-green-500 text-white" : "bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400"}`}>
                        {active ? <CheckCircle size={14} /> : <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600" />}
                      </div>
                      <span className={`text-[10px] font-semibold text-center ${active ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
              {timeline.length > 0 && (
                <p className="text-[10px] text-center text-gray-400 mt-2">
                  {timeline[timeline.length - 1].orderStatus} at {fmtDate(timeline[timeline.length - 1].createdAt)}
                </p>
              )}
            </div>

            {/* Product count row */}
            <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                <Package size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {order.productCount} product{order.productCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">Qty: {order.productCount}</p>
              </div>
              <p className="ml-auto text-[#B57908] font-bold">
                {(order.productPrice ?? 0).toLocaleString("en-IN")} * {order.productCount} = {(order.productPrice ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Shipping + Summary */}
            {d && (
              <div className="grid sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Shipping Address</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{d.fullName}, {d.mobile}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {d.address}{d.address2 ? `, ${d.address2}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Order Summary</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Items Price</span><span>{fmt(d.subTotal ?? 0)}</span></div>
                    {(order.deliveryFee ?? 0) > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Delivery Fee</span><span>{fmt(order.deliveryFee)}</span></div>}
                    {order.paymentType === "COD" && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>1% COD Charge</span>
                        <span>{fmt(order.subTotal - (d.subTotal ?? 0) + (order.deliveryFee ?? 0))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-zinc-700 pt-1"><span>Subtotal</span><span>{fmt(order.subTotal ?? 0)}</span></div>
                    <div className="flex justify-between text-green-600 dark:text-green-400"><span>Paid Amount</span><span>{fmt(d.paidAmount ?? 0)}</span></div>
                    <div className="flex justify-between text-red-500 font-bold">
                      <span>Due Amount</span>
                      <span>{fmt(Math.max(0, (d.grandAmount ?? 0) - (d.paidAmount ?? 0)))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Invoice Modal ──────────────────────────────────────────────────────────
function InvoiceModal({ order, onClose, authHeader, apiKey }: {
  order: ApiOrderItem; onClose: () => void; authHeader: string; apiKey: string;
}) {
  const orderNo = order.comerzOrderNo;
  const printRef = useRef<HTMLDivElement>(null);
  const { data: res, isLoading } = useQuery<OrderTrackingResponse>({
    queryKey: ["order-invoice-detail", orderNo],
    queryFn: () => api.get<OrderTrackingResponse>(`/order-tracking/${orderNo}`, {
      headers: { Authorization: authHeader, "X-API-Key": apiKey },
    }),
    enabled: !!orderNo,
  });
  const d = res?.data;

  const handleDownload = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice #${orderNo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #222; }
        .inv-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .brand { font-size: 28px; font-weight: 900; }
        .tm { font-size: 12px; vertical-align: super; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 700; }
        .red { color: #e53e3e; } .green { color: #38a169; }
        .bold { font-weight: 700; }
      </style></head><body>${html}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const duAmt = Math.max(0, (d?.grandAmount ?? order.total ?? 0) - (d?.paidAmount ?? 0));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Invoice</p>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-xs font-bold rounded-xl transition">
              <Download size={13} /> Download PDF
            </button>
            <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B57908] animate-spin" /></div>
        ) : (
          <div ref={printRef} className="px-6 pb-6">
            {/* Invoice top */}
            <div className="border border-gray-200 rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Brand left */}
                <div>
                  <p className="text-3xl font-black text-gray-900">dazzle<span className="text-sm align-super font-normal">™</span></p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-[220px]">
                    Dazzle Store, Dhaka, Bangladesh<br />
                    Hotline: 09638001122<br />
                    Whatsapp: 09638001122
                  </p>
                </div>
                {/* Invoice info right */}
                <div className="text-right text-sm">
                  <p className="font-bold text-gray-900">Invoice no: {orderNo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Date: {fmtDate(d?.createdAt || order.createdAt)}</p>
                  {d && (
                    <div className="mt-2 text-xs text-gray-600 leading-relaxed">
                      <p className="font-bold text-gray-900 text-sm">Bill to</p>
                      <p className="font-semibold">{d.fullName}</p>
                      <p>{d.mobile}</p>
                      <p className="max-w-[200px]">{d.address}{d.address2 ? `, ${d.address2}` : ""}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 justify-end">
                    <p className="text-sm font-bold text-gray-700">Due Amount: <span className="text-red-500">৳{duAmt.toLocaleString("en-IN")}</span></p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${duAmt === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {duAmt === 0 ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <p className="text-[11px] text-gray-500 italic mb-4">
              *** Attention Please: dazzle sells only original Products. We offer anytime double money back guarantee if the product is not original ***
            </p>

            {/* Products table */}
            <table className="w-full text-xs border-collapse border border-gray-200 text-gray-500">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left font-bold">Product</th>
                  <th className="border border-gray-200 p-2 text-left font-bold">Accessory</th>
                  <th className="border border-gray-200 p-2 text-right font-bold">Unit Price</th>
                  <th className="border border-gray-200 p-2 text-center font-bold">Quantity</th>
                  <th className="border border-gray-200 p-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-2">{order.productCount} product{order.productCount !== 1 ? "s" : ""}</td>
                  <td className="border border-gray-200 p-2 text-gray-400">N/A</td>
                  <td className="border border-gray-200 p-2 text-right">{(order.productPrice ?? 0).toLocaleString("en-IN")}</td>
                  <td className="border border-gray-200 p-2 text-center">{order.productCount}</td>
                  <td className="border border-gray-200 p-2 text-right">
                    {order.total.toLocaleString("en-IN")}
                    {order.paymentType === "COD" ? " (1% COD)" : ""}
                  </td>
                </tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Shipping</td><td className="border border-gray-200 p-2 text-right">{order.deliveryFee ?? 0}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Discount Total</td><td className="border border-gray-200 p-2 text-right">{order.discount ?? 0}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Subtotal</td><td className="border border-gray-200 p-2 text-right font-bold">{order.subTotal.toLocaleString("en-IN")}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Total</td><td className="border border-gray-200 p-2 text-right font-bold">{order.total.toLocaleString("en-IN")}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Orders Component ──────────────────────────────────────────────────
interface OrdersProps {
  onOrderClick?: (order: any) => void;
}

const Orders: React.FC<OrdersProps> = () => {
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<ApiOrderItem | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<ApiOrderItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  const orders = orderListRes?.data || [];
  const totalPages = orderListRes?.totalPages || 1;
  const totalCount = orderListRes?.totalCount || 0;

  const copyOrderNo = (no: string) => {
    navigator.clipboard.writeText(no).then(() => {
      setCopied(no);
      setTimeout(() => setCopied(null), 2000);
    });
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

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#393430] rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white">No Orders Yet</h3>
        <p className="text-xs text-gray-400 mt-1">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 font-sans">
        <p className="text-xs text-gray-400 px-1">Showing {orders.length} of {totalCount} orders</p>

        {orders.map((order: any) => (
          <div key={order.comerzOrderNo}
            className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
            {/* ── Order header row ── */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    Order ID #{order.comerzOrderNo}
                  </span>
                  <button onClick={() => copyOrderNo(order.comerzOrderNo)}
                    className="text-gray-400 hover:text-gray-600 transition" title="Copy Order ID">
                    {copied === order.comerzOrderNo
                      ? <CheckCircle size={13} className="text-green-500" />
                      : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Placed on {fmtDate(order.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  BDT {(order.total ?? 0).toLocaleString("en-IN")}
                </span>
                <StatusBadge item={order} />
                {/* Eye icon → detail modal */}
                <button onClick={() => setDetailOrder(order)}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                  title="View Order Details">
                  <Eye size={15} />
                </button>
                {/* Invoice icon → invoice modal */}
                <button onClick={() => setInvoiceOrder(order)}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                  title="View Invoice">
                  <FileText size={15} />
                </button>
              </div>
            </div>

            {/* ── Product rows ── */}
            {order.productCount > 0 && (
              <div className="border-t border-gray-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-md flex items-center justify-center shrink-0">
                  <Package size={13} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                    {order.comerzOrderItems?.map((item: any) => item.productName).join(", ")}
                    &nbsp;·&nbsp;{payLabel(order.paymentType)}
                    &nbsp;·&nbsp;{order.deliveryMethod || "Regular Delivery"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Qty: {order.productCount}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
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

      {/* Order Detail Modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          authHeader={authHeader}
          apiKey={apiKey || ""}
        />
      )}

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
