"use client";
import { useRef } from "react";
import { Loader2, X, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiOrderItem, OrderTrackingResponse } from "./profile.types";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};

/**
 * Shared invoice viewer + PDF download, used from both the order list
 * (quick action) and the order details page ("Invoice Details" button).
 * Downloading opens a print dialog scoped to the invoice markup only —
 * "Save as PDF" in that dialog is the actual PDF generator, no server
 * PDF service is needed for this.
 */
export default function InvoiceModal({
  order, onClose, authHeader, apiKey,
}: {
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
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
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
                {order.comerzOrderItems && order.comerzOrderItems.length > 0 ? (
                  order.comerzOrderItems.map((item) => (
                    <tr key={item.comerzOrderItemUUID}>
                      <td className="border border-gray-200 p-2">{item.productName}</td>
                      <td className="border border-gray-200 p-2 text-gray-400">{item.variantName || "N/A"}</td>
                      <td className="border border-gray-200 p-2 text-right">{item.offerPrice.toLocaleString("en-IN")}</td>
                      <td className="border border-gray-200 p-2 text-center">1</td>
                      <td className="border border-gray-200 p-2 text-right">{item.finalPrice.toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                ) : (
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
                )}
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Shipping</td><td className="border border-gray-200 p-2 text-right">{order.deliveryFee ?? 0}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Discount Total</td><td className="border border-gray-200 p-2 text-right">{order.discount ?? 0}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Paid Amount</td><td className="border border-gray-200 p-2 text-right text-green-600 font-bold">{(d?.paidAmount ?? 0).toLocaleString("en-IN")}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Due Amount</td><td className="border border-gray-200 p-2 text-right text-red-600 font-bold">{duAmt.toLocaleString("en-IN")}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Total</td><td className="border border-gray-200 p-2 text-right font-bold">{order.total.toLocaleString("en-IN")}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
