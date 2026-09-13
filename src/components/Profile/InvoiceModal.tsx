"use client";
import Image from "next/image";
import { Loader2, X, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiOrderItem, OrderTrackingResponse } from "./profile.types";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import LogoBlack from "@/images/header-logo-black.svg";

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

// No product/order amount on an invoice is ever meant to show fractional taka —
// truncate (not round) so the visible whole-taka figure never shifts from what
// was actually charged, e.g. ৳429.65 always shows as ৳429, never ৳430.
const fmtBDT = (n: number) => Math.floor(n).toLocaleString("en-IN");

/**
 * jsPDF's addImage needs a raster (PNG/JPEG), so the logo svg is rasterized
 * on a canvas at load time — the browser renders <img src="*.svg"> fine, and
 * drawImage from that onto a canvas gives a real PNG data URL to embed.
 */
async function svgToPngDataUrl(
  svgUrl: string,
  scale = 4,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const img = new window.Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo failed to load"));
    });
    img.src = svgUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/png"), width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  }
}

/**
 * Shared invoice viewer + PDF download, used from both the order list
 * (quick action) and the order details page ("Invoice Details" button).
 * The PDF is built directly with jsPDF/autoTable — real, selectable-text
 * pages saved straight to disk, not a print-dialog "Save as PDF" detour
 * that depends on the browser's own print pipeline.
 */
export default function InvoiceModal({
  order, onClose, authHeader, apiKey,
}: {
  order: ApiOrderItem; onClose: () => void; authHeader: string; apiKey: string;
}) {
  const orderNo = order.comerzOrderNo;
  const { data: res, isLoading } = useQuery<OrderTrackingResponse>({
    queryKey: ["order-invoice-detail", orderNo],
    queryFn: () => api.get<OrderTrackingResponse>(`/order-tracking/${orderNo}`, {
      headers: { Authorization: authHeader, "X-API-Key": apiKey },
    }),
    enabled: !!orderNo,
  });
  const d = res?.data;
  const billAddressLine1 = d?.addressLine1 || d?.address;
  const billAddressLine2 = d?.addressLine2 || d?.address2;
  // order-tracking's own isStorePickup/addressLabel are live and authoritative;
  // the order-list item (`order`) is only a fallback until tracking loads.
  const isPickupDelivery = d ? d.isStorePickup === true : !!(order.isStorePickup || order.isShopPickup);
  const addressLabel = d?.addressLabel || order.addressLabel;
  const codCharge = order.codCharge ?? 0;

  const duAmt = Math.max(0, (d?.grandAmount ?? order.total ?? 0) - (d?.paidAmount ?? 0));

  const handleDownload = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    let y = 50;

    // ── Brand + contact (left) ──
    const logo = await svgToPngDataUrl(LogoBlack.src);
    if (logo) {
      const logoH = 22;
      const logoW = (logo.width / logo.height) * logoH;
      doc.addImage(logo.dataUrl, "PNG", marginX, y - logoH + 4, logoW, logoH);
    } else {
      // Logo failed to rasterize (e.g. blocked by the browser) — a plain
      // wordmark still gets an invoice out the door instead of a blank header.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("dazzle", marginX, y);
    }

    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text("Dazzle Store, Dhaka, Bangladesh", marginX, y + 18);
    doc.text("Hotline: 09638001122", marginX, y + 30);
    doc.text("Whatsapp: 09638001122", marginX, y + 42);

    // ── Invoice info + bill-to (right) ──
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Invoice no: ${orderNo}`, pageWidth - marginX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Date: ${fmtDate(d?.createdAt || order.createdAt)}`, pageWidth - marginX, y + 14, { align: "right" });

    let billY = y + 32;
    if (d) {
      doc.setTextColor(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Bill to", pageWidth - marginX, billY, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(d.fullName || "", pageWidth - marginX, billY + 12, { align: "right" });
      doc.text(d.mobile || "", pageWidth - marginX, billY + 24, { align: "right" });
      const deliveryLine = `${isPickupDelivery ? "Store Pickup" : "Home Delivery"}${addressLabel ? ` (${addressLabel})` : ""}`;
      doc.text(deliveryLine, pageWidth - marginX, billY + 36, { align: "right" });
      const addr = billAddressLine2 ? `${billAddressLine1}, ${billAddressLine2}` : (billAddressLine1 || "");
      const addrLines = doc.splitTextToSize(addr, 220);
      doc.text(addrLines, pageWidth - marginX, billY + 48, { align: "right" });
      billY += 48 + addrLines.length * 11;
    }

    const [dueR, dueG, dueB] = duAmt === 0 ? [56, 161, 105] : [229, 62, 62];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(dueR, dueG, dueB);
    doc.text(
      `Due Amount: ${fmtBDT(duAmt)} BDT (${duAmt === 0 ? "Paid" : "Unpaid"})`,
      pageWidth - marginX,
      billY + 16,
      { align: "right" },
    );

    y = Math.max(y + 60, billY + 36);
    doc.setDrawColor(220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 18;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120);
    const notice =
      "*** Attention Please: dazzle sells only original Products. We offer anytime double money back guarantee if the product is not original ***";
    const noticeLines = doc.splitTextToSize(notice, pageWidth - marginX * 2);
    doc.text(noticeLines, marginX, y);
    y += noticeLines.length * 10 + 10;

    const rows =
      order.comerzOrderItems && order.comerzOrderItems.length > 0
        ? order.comerzOrderItems.map((item) => [
            item.productName,
            item.variantName || "N/A",
            fmtBDT(item.offerPrice),
            "1",
            fmtBDT(item.finalPrice),
          ])
        : [
            [
              `${order.productCount} product${order.productCount !== 1 ? "s" : ""}`,
              "N/A",
              fmtBDT(order.productPrice ?? 0),
              String(order.productCount),
              fmtBDT(order.total),
            ],
          ];

    const footRows = [
      ["Shipping", "", "", "", fmtBDT(order.deliveryFee ?? 0)],
      ["Discount Total", "", "", "", fmtBDT(order.discount ?? 0)],
      ...(codCharge > 0 ? [["COD Charge", "", "", "", fmtBDT(codCharge)]] : []),
      ["Paid Amount", "", "", "", fmtBDT(d?.paidAmount ?? 0)],
      ["Due Amount", "", "", "", fmtBDT(duAmt)],
      ["Total", "", "", "", fmtBDT(order.total)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Product", "Accessory", "Unit Price", "Quantity", "Total"]],
      body: rows,
      foot: footRows,
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 9, textColor: 90, lineColor: 220, lineWidth: 0.5 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: "bold" },
      footStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: "bold" },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "right" },
      },
    });

    doc.save(`Invoice-${orderNo}.pdf`);
  };

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
          <div className="px-6 pb-6">
            {/* Invoice top */}
            <div className="border border-gray-200 rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Brand left */}
                <div>
                  <Image src={LogoBlack} alt="Dazzle" className="h-7 w-auto" priority />
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
                      <p className="font-medium text-gray-700">
                        {isPickupDelivery ? "🏪 Store Pickup" : "🏠 Home Delivery"}
                        {addressLabel ? ` (${addressLabel})` : ""}
                      </p>
                      <p className="max-w-[200px]">{billAddressLine1}{billAddressLine2 ? `, ${billAddressLine2}` : ""}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 justify-end">
                    <p className="text-sm font-bold text-gray-700">Due Amount: <span className="text-red-500">৳{fmtBDT(duAmt)}</span></p>
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
                      <td className="border border-gray-200 p-2 text-right">{fmtBDT(item.offerPrice)}</td>
                      <td className="border border-gray-200 p-2 text-center">1</td>
                      <td className="border border-gray-200 p-2 text-right">{fmtBDT(item.finalPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-gray-200 p-2">{order.productCount} product{order.productCount !== 1 ? "s" : ""}</td>
                    <td className="border border-gray-200 p-2 text-gray-400">N/A</td>
                    <td className="border border-gray-200 p-2 text-right">{fmtBDT(order.productPrice ?? 0)}</td>
                    <td className="border border-gray-200 p-2 text-center">{order.productCount}</td>
                    <td className="border border-gray-200 p-2 text-right">{fmtBDT(order.total)}</td>
                  </tr>
                )}
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Shipping</td><td className="border border-gray-200 p-2 text-right">{fmtBDT(order.deliveryFee ?? 0)}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Discount Total</td><td className="border border-gray-200 p-2 text-right">{fmtBDT(order.discount ?? 0)}</td></tr>
                {codCharge > 0 && (
                  <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">COD Charge</td><td className="border border-gray-200 p-2 text-right text-orange-600 font-bold">{fmtBDT(codCharge)}</td></tr>
                )}
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Paid Amount</td><td className="border border-gray-200 p-2 text-right text-green-600 font-bold">{fmtBDT(d?.paidAmount ?? 0)}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Due Amount</td><td className="border border-gray-200 p-2 text-right text-red-600 font-bold">{fmtBDT(duAmt)}</td></tr>
                <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-200 p-2 font-bold">Total</td><td className="border border-gray-200 p-2 text-right font-bold">{fmtBDT(order.total)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
