"use client";
import Image from "next/image";
import { Loader2, X, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiOrderItem, OrderTrackingResponse } from "./profile.types";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import LogoBlack from "@/images/header-logo-black.svg";
import { getOrderCorrectTotal } from "@/lib/cod-calculator";

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
// Every price cell in the line-items/totals table states its currency
// explicitly, rather than a bare number a reader has to assume is taka.
const fmtBDTLabel = (n: number) => `${fmtBDT(n)} BDT`;

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
  // order-tracking's own isStorePickup/addressLabel are live and authoritative;
  // the order-list item (`order`) is only a fallback until tracking loads.
  const isPickupDelivery = d ? d.isStorePickup === true : !!(order.isStorePickup || order.isShopPickup);
  // Store pickup has no customer address to bill to — it has the STORE's own
  // address instead, which only order-list's `storeLocation` carries.
  const billAddressLine1 = isPickupDelivery
    ? order.storeLocation || "Store address not available"
    : d?.addressLine1 || d?.address;
  const billAddressLine2 = isPickupDelivery ? undefined : d?.addressLine2 || d?.address2;
  const addressLabel = d?.addressLabel || order.addressLabel;
  // Use two-step COD formula: e.g. Product 405244 + Delivery 110 = 405354 → COD 1% = 4094 → Grand 409449
  const _orderCalc = getOrderCorrectTotal(order);
  const codCharge = _orderCalc.codCharge;
  const codRoundOff = _orderCalc.roundOff;
  const correctTotal = _orderCalc.correctTotal || d?.grandAmount || (order.total ?? 0);
  const duAmt = Math.max(0, correctTotal - (d?.paidAmount ?? 0));

  const handleDownload = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 36;
    const cardW = pageWidth - marginX * 2;
    const cardTop = 32;

    // ── Pre-calculate address lines & card height ──
    const addr = billAddressLine2 ? `${billAddressLine1}, ${billAddressLine2}` : (billAddressLine1 || "");
    const addrLines = d ? doc.splitTextToSize(addr, 210) : [];
    const rightContentH = d
      ? 14 + 12 + 13 + 11 + 10.5 + 10.5 + (addrLines.length * 10) + 12 + 14
      : 50;
    const leftContentH = 22 + 8 + 4 * 11; // ~ 74pt
    const cardH = Math.max(leftContentH, rightContentH) + 20;

    // ── 1. Top Card Background (Soft cream with subtle border) ──
    doc.setFillColor(253, 249, 243); // #FAF4EA / #FFFDF9
    doc.setDrawColor(234, 219, 202); // #EADBCA
    doc.setLineWidth(0.75);
    doc.roundedRect(marginX, cardTop, cardW, cardH, 8, 8, "FD");

    // ── 2. Brand left side inside card ──
    const leftX = marginX + 14;
    let leftY = cardTop + 14;

    const logo = await svgToPngDataUrl(LogoBlack.src);
    if (logo) {
      const logoH = 22;
      const logoW = (logo.width / logo.height) * logoH;
      doc.addImage(logo.dataUrl, "PNG", leftX, leftY, logoW, logoH);
      leftY += logoH + 8;
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(109, 63, 14);
      doc.text("dazzle", leftX, leftY + 16);
      leftY += 26;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    doc.text("Dazzle (Finlay Branch)", leftX, leftY);
    leftY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text("Shop NO: 414 & 429, 4th Floor, Finlay Square, East Nasirabad", leftX, leftY);
    leftY += 9.5;
    doc.text("Hotline: 09638001122 / Whatsapp: 01972999969", leftX, leftY);
    leftY += 9.5;
    doc.text("BIN NO - 003313011-0505", leftX, leftY);

    // ── 3. Invoice info & Bill-to right side inside card ──
    const rightX = marginX + cardW - 14;
    let rightY = cardTop + 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(109, 63, 14); // #6D3F0E
    doc.text(`Invoice no: ${orderNo}`, rightX, rightY, { align: "right" });
    rightY += 11;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${fmtDate(d?.createdAt || order.createdAt)}`, rightX, rightY, { align: "right" });
    rightY += 12;

    if (d) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text("Bill to", rightX, rightY, { align: "right" });
      rightY += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(50, 50, 50);
      doc.text(d.fullName || "", rightX, rightY, { align: "right" });
      rightY += 9.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      doc.text(d.mobile || "", rightX, rightY, { align: "right" });
      rightY += 9.5;

      const deliveryLine = `${isPickupDelivery ? "Store Pickup" : "Home Delivery"}${addressLabel ? ` (${addressLabel})` : ""}`;
      doc.setTextColor(70, 70, 70);
      doc.text(deliveryLine, rightX, rightY, { align: "right" });
      rightY += 9.5;

      doc.setTextColor(100, 100, 100);
      doc.text(addrLines, rightX, rightY, { align: "right" });
      rightY += addrLines.length * 9.5 + 4;
    }

    // Due Amount & Colored Status Pill Badge
    const badgeW = 36;
    const badgeH = 12;
    const badgeX = rightX - badgeW;
    const badgeY = rightY - 8.5;

    if (duAmt === 0) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.setLineWidth(0.5);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "FD");
      doc.setTextColor(5, 150, 105); // emerald-700
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("Paid", badgeX + badgeW / 2, badgeY + 8.5, { align: "center" });
    } else {
      doc.setFillColor(254, 242, 242); // rose-50
      doc.setDrawColor(254, 205, 211); // rose-200
      doc.setLineWidth(0.5);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "FD");
      doc.setTextColor(225, 29, 72); // rose-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("Unpaid", badgeX + badgeW / 2, badgeY + 8.5, { align: "center" });
    }

    // Due text placed to left of badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(220, 38, 38);
    doc.text(`Due Amount: ${fmtBDT(duAmt)} BDT`, badgeX - 6, rightY, { align: "right" });

    // ── 4. Attention Notice Box (Amber soft box) ──
    const bannerY = cardTop + cardH + 10;
    const bannerH = 19;

    doc.setFillColor(250, 244, 235); // #FAF4EB
    doc.setDrawColor(233, 204, 174); // #E9CCAE
    doc.setLineWidth(0.75);
    doc.roundedRect(marginX, bannerY, cardW, bannerH, 5, 5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(123, 79, 30); // #7B4F1E
    doc.text("* Attention Please:", marginX + 10, bannerY + 12.5);

    doc.setFont("helvetica", "normal");
    doc.text(
      "dazzle sells only original Products. We offer anytime double money back guarantee if the product is not original.",
      marginX + 78,
      bannerY + 12.5,
    );

    // ── 5. Items & Totals Table ──
    const tableStartY = bannerY + bannerH + 10;

    const rows =
      order.comerzOrderItems && order.comerzOrderItems.length > 0
        ? order.comerzOrderItems.map((item) => {
            const isCarePlan =
              item.productName.toLowerCase().includes("bundle") ||
              item.productName.toLowerCase().includes("care") ||
              item.productName.toLowerCase().includes("replacement");

            return [
              isCarePlan ? `[CARE] ${item.productName}` : item.productName,
              item.variantName || "N/A",
              fmtBDTLabel(item.offerPrice),
              "1",
              fmtBDTLabel(item.finalPrice),
            ];
          })
        : [
            [
              `${order.productCount} product${order.productCount !== 1 ? "s" : ""}`,
              "N/A",
              fmtBDTLabel(order.productPrice ?? 0),
              String(order.productCount),
              fmtBDTLabel(order.total),
            ],
          ];

    const footRows = [
      ["Shipping", "", "", "", fmtBDTLabel(order.deliveryFee ?? 0)],
      ["Discount Total", "", "", "", fmtBDTLabel(order.discount ?? 0)],
      ...(codCharge > 0 ? [["COD Charge", "", "", "", fmtBDTLabel(codCharge)]] : []),
      ...(codRoundOff !== 0 ? [["Round Off", "", "", "", `${codRoundOff > 0 ? "+" : ""}${codRoundOff}`]] : []),
      ["Paid Amount", "", "", "", fmtBDTLabel(d?.paidAmount ?? 0)],
      ["Due Amount", "", "", "", fmtBDTLabel(duAmt)],
      ["Total", "", "", "", fmtBDTLabel(correctTotal)],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head: [["Product", "Variant", "Unit Price", "Quantity", "Total"]],
      body: rows,
      foot: footRows,
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 7, textColor: [60, 60, 60], lineColor: [235, 224, 210], lineWidth: 0.5 },
      headStyles: {
        fillColor: [250, 242, 230], // #FAF2E6
        textColor: [92, 58, 22],   // #5C3A16
        fontStyle: "bold",
        fontSize: 7.5,
        lineColor: [229, 215, 197],
        lineWidth: 0.75,
      },
      footStyles: {
        fillColor: [250, 247, 242],
        textColor: [50, 50, 50],
        fontStyle: "bold",
        fontSize: 7,
        lineColor: [229, 215, 197],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: 178 },
        1: { cellWidth: 135 },
        2: { halign: "right", cellWidth: 84 },
        3: { halign: "center", cellWidth: 38 },
        4: { halign: "right", cellWidth: 88 },
      },
      didParseCell: (data) => {
        // Alternating body row colors
        if (data.section === "body") {
          if (data.row.index % 2 === 1) {
            data.cell.styles.fillColor = [252, 250, 247]; // #FCFAF7
          } else {
            data.cell.styles.fillColor = [255, 255, 255];
          }
        }

        // Summary footer rows styled identically to the UI
        if (data.section === "foot") {
          const rowIndex = data.row.index;
          const rowTitle = footRows[rowIndex]?.[0] || "";

          if (rowTitle === "Shipping") {
            data.cell.styles.fillColor = [250, 247, 242]; // #FAF7F2
            data.cell.styles.textColor = [70, 70, 70];
          } else if (rowTitle === "Discount Total") {
            data.cell.styles.fillColor = [250, 247, 242];
            if (data.column.index === 4) {
              data.cell.styles.textColor = [16, 185, 129]; // emerald-600
            }
          } else if (rowTitle === "COD Charge") {
            data.cell.styles.fillColor = [254, 243, 199]; // amber-50/70
            data.cell.styles.textColor = [180, 83, 9];    // amber-700
            data.cell.styles.fontStyle = "bold";
          } else if (rowTitle === "Paid Amount") {
            data.cell.styles.fillColor = [236, 253, 245]; // emerald-50/50
            data.cell.styles.textColor = [5, 150, 105];   // emerald-600
            data.cell.styles.fontStyle = "bold";
          } else if (rowTitle === "Due Amount") {
            data.cell.styles.fillColor = [255, 241, 242]; // rose-50/50
            data.cell.styles.textColor = [225, 29, 72];   // rose-600
            data.cell.styles.fontStyle = "bold";
          } else if (rowTitle === "Total") {
            data.cell.styles.fillColor = [109, 63, 14];   // brand brown #6D3F0E
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontSize = 8.5;
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save(`Invoice-${orderNo}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E6D8] bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B57908]" />
            <p className="text-[11px] font-bold tracking-widest text-[#7B4F1E] uppercase">Order Invoice</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#6D3F0E] to-[#915413] hover:from-[#5a3409] hover:to-[#7a440c] text-white text-[11px] font-bold rounded-xl transition shadow-xs cursor-pointer">
              <Download size={13} /> Download PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#B57908] animate-spin" /></div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Invoice top card */}
            <div className="border border-[#EADBCA] bg-gradient-to-br from-[#FFFDF9] to-[#FAF4EA] rounded-2xl p-5 mb-4 shadow-xs">
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Brand left */}
                <div>
                  <Image src={LogoBlack} alt="Dazzle" className="h-7 w-auto" priority />
                  <p className="text-[10px] text-gray-600 mt-2 leading-relaxed max-w-[270px]">
                    <strong className="text-gray-800">Dazzle (Finlay Branch)</strong><br />
                    Shop NO: 414 &amp; 429, 4th Floor, Finlay Square, East Nasirabad<br />
                    Hotline: 09638001122 / Whatsapp: 01972999969<br />
                    BIN NO - 003313011-0505
                  </p>
                </div>
                {/* Invoice info right */}
                <div className="text-right text-[10px]">
                  <p className="font-extrabold text-[#6D3F0E] text-[11px]">Invoice no: {orderNo}</p>
                  <p className="text-gray-500 text-[9.5px] mt-0.5">Date: {fmtDate(d?.createdAt || order.createdAt)}</p>
                  {d && (
                    <div className="mt-2 text-[10px] text-gray-600 leading-relaxed">
                      <p className="font-bold text-gray-900 text-[11px]">Bill to</p>
                      <p className="font-semibold text-gray-800">{d.fullName}</p>
                      <p>{d.mobile}</p>
                      <p className="font-medium text-gray-700">
                        {isPickupDelivery ? "🏪 Store Pickup" : "🏠 Home Delivery"}
                        {addressLabel ? ` (${addressLabel})` : ""}
                      </p>
                      <p className="max-w-[220px]">{billAddressLine1}{billAddressLine2 ? `, ${billAddressLine2}` : ""}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 justify-end">
                    <p className="text-[11px] font-bold text-gray-700">
                      Due Amount: <span className="text-red-500 font-extrabold">{fmtBDT(duAmt)} BDT</span>
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      duAmt === 0 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}>
                      {duAmt === 0 ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-[#FAF4EB] border border-[#E9CCAE] rounded-xl px-4 py-2.5 mb-4 text-[9.5px] text-[#7B4F1E] font-medium leading-relaxed flex items-center gap-2">
              <span>⭐</span>
              <span><strong>Attention Please:</strong> dazzle sells only original Products. We offer anytime double money back guarantee if the product is not original.</span>
            </div>

            {/* Invoice Table */}
            <div className="overflow-hidden rounded-xl border border-[#E5D7C5] shadow-xs">
              <table className="w-full text-[10px] border-collapse text-gray-700">
                <thead>
                  <tr className="bg-[#FAF2E6] border-b border-[#E5D7C5] text-[#5C3A16]">
                    <th className="p-2.5 text-left font-bold text-[10px] w-[34%]">Product</th>
                    <th className="p-2.5 text-left font-bold text-[10px] w-[26%]">Variant</th>
                    <th className="p-2.5 text-right font-bold text-[10px] whitespace-nowrap w-[18%]">Unit Price</th>
                    <th className="p-2.5 text-center font-bold text-[10px] whitespace-nowrap w-[6%]">Qty</th>
                    <th className="p-2.5 text-right font-bold text-[10px] whitespace-nowrap w-[16%]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE5D8]">
                  {order.comerzOrderItems && order.comerzOrderItems.length > 0 ? (
                    order.comerzOrderItems.map((item, idx) => {
                      const isCarePlan =
                        item.productName.toLowerCase().includes("bundle") ||
                        item.productName.toLowerCase().includes("care") ||
                        item.productName.toLowerCase().includes("replacement");

                      return (
                        <tr
                          key={item.comerzOrderItemUUID || idx}
                          className={idx % 2 === 1 ? "bg-[#FCFAF7] hover:bg-amber-50/30 transition-colors" : "bg-white hover:bg-amber-50/30 transition-colors"}
                        >
                          <td className="p-2.5 leading-snug">
                            {isCarePlan ? (
                              <div className="flex items-start gap-1.5">
                                <span className="inline-block mt-0.5 shrink-0 px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-100 text-[#7B4F1E] border border-amber-200">
                                  CARE
                                </span>
                                <span className="font-semibold text-gray-800">{item.productName}</span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900">{item.productName}</span>
                            )}
                          </td>
                          <td className="p-2.5 text-gray-500 leading-snug">
                            {item.variantName || <span className="text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap font-medium text-gray-700">
                            {fmtBDTLabel(item.offerPrice)}
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap font-semibold text-gray-600">
                            1
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap font-bold text-gray-900">
                            {fmtBDTLabel(item.finalPrice)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="bg-white">
                      <td className="p-2.5 font-medium">{order.productCount} product{order.productCount !== 1 ? "s" : ""}</td>
                      <td className="p-2.5 text-gray-400 italic">N/A</td>
                      <td className="p-2.5 text-right whitespace-nowrap font-medium">{fmtBDTLabel(order.productPrice ?? 0)}</td>
                      <td className="p-2.5 text-center whitespace-nowrap font-semibold">{order.productCount}</td>
                      <td className="p-2.5 text-right whitespace-nowrap font-bold">{fmtBDTLabel(correctTotal)}</td>
                    </tr>
                  )}

                  {/* Summary Rows */}
                  <tr className="bg-[#FAF7F2] border-t-2 border-[#E7D6C1]">
                    <td colSpan={4} className="p-2.5 font-bold text-gray-700">Shipping</td>
                    <td className="p-2.5 text-right whitespace-nowrap font-semibold text-gray-700">{fmtBDTLabel(order.deliveryFee ?? 0)}</td>
                  </tr>
                  <tr className="bg-[#FAF7F2]">
                    <td colSpan={4} className="p-2.5 font-bold text-gray-700">Discount Total</td>
                    <td className="p-2.5 text-right whitespace-nowrap font-semibold text-emerald-600">{fmtBDTLabel(order.discount ?? 0)}</td>
                  </tr>
                  {codCharge > 0 && (
                    <tr className="bg-amber-50/70">
                      <td colSpan={4} className="p-2.5 font-bold text-amber-900">COD Charge</td>
                      <td className="p-2.5 text-right whitespace-nowrap font-extrabold text-amber-700">{fmtBDTLabel(codCharge)}</td>
                    </tr>
                  )}
                  {codRoundOff !== 0 && (
                    <tr className="bg-[#FAF7F2]">
                      <td colSpan={4} className="p-2.5 font-bold text-gray-500">Round Off</td>
                      <td className="p-2.5 text-right whitespace-nowrap font-semibold text-gray-500">{codRoundOff > 0 ? "+" : ""}{codRoundOff}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/50">
                    <td colSpan={4} className="p-2.5 font-bold text-emerald-900">Paid Amount</td>
                    <td className="p-2.5 text-right whitespace-nowrap font-extrabold text-emerald-600">{fmtBDTLabel(d?.paidAmount ?? 0)}</td>
                  </tr>
                  <tr className="bg-rose-50/50">
                    <td colSpan={4} className="p-2.5 font-bold text-rose-900">Due Amount</td>
                    <td className="p-2.5 text-right whitespace-nowrap font-extrabold text-rose-600">{fmtBDTLabel(duAmt)}</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-[#6D3F0E] via-[#854A11] to-[#B57908] text-white">
                    <td colSpan={4} className="p-3 font-extrabold text-white text-[11px] md:text-xs tracking-wide">Total</td>
                    <td className="p-3 text-right whitespace-nowrap font-black text-white text-[11px] md:text-xs tracking-wide">{fmtBDTLabel(correctTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
