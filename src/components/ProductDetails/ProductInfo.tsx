/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Share2,
  TrendingDown,
  DollarSign,
  Calculator,
  Percent,
  Settings,
  ShieldCheck,
  Users,
  Clock,
  Flame,
} from "lucide-react";
import { WarrantyIcon, SwapIcon, FaireIcon, StarIcon, EyeIcon } from "@/icon";
import QuantitySelector from "./QuantitySelector";
import GlobalModal from "@/components/share/GlobalModal";

type StockStatus = "in_stock" | "overselling" | "pre_order" | "eol";

interface ProductInfoProps {
  title: string;
  brand: string;
  code: string;
  inStock: boolean;
  stockNote?: string;
  warrantyNote?: string;
  stats: {
    soldLastHours: number;
    reviewCount: number;
    viewingNow: number;
  };
  price: number;
  originalPrice: number;
  emiFrom?: number;
}

export default function ProductInfo({
  title,
  brand,
  code,
  warrantyNote,
  stats,
  price: basePrice,
  originalPrice: baseOriginalPrice,
}: ProductInfoProps) {
  // 1. Stock Status selection for demo/client preview
  const [stockStatus, setStockStatus] = useState<StockStatus>("in_stock");

  // 2. Admin profit meter hidden state
  const [showProfitMeter, setShowProfitMeter] = useState(false);

  // 3. Make Your Offer negotiation states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  // 4. Competitor price comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  // 5. Replacement Calculator states
  const [daysUsed, setDaysUsed] = useState("90");
  const [replacementValue, setReplacementValue] = useState<number | null>(null);
  const [dailyCost, setDailyCost] = useState<number | null>(null);

  // 6. Group buy countdown state (48 hours mock timer)
  const [timeLeft, setTimeLeft] = useState(172800); // 48 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 172800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}h : ${minutes.toString().padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`;
  };

  // Pricing computations according to Stock Status
  // If Pre-order, only charge 5% booking deposit fee
  const isPreorder = stockStatus === "pre_order";
  const displayPrice = isPreorder ? Math.round(basePrice * 0.05) : basePrice;
  const originalPrice = isPreorder
    ? Math.round(baseOriginalPrice * 0.05)
    : baseOriginalPrice;

  // Competitor Price scraper simulation
  const handlePriceComparison = () => {
    setIsComparing(true);
    setCompareResult(null);
    setTimeout(() => {
      setIsComparing(false);
      setCompareResult({
        starTech: basePrice + 3500,
        ryans: basePrice + 4500,
        savings: 3500,
      });
    }, 1500);
  };

  // Replacement cost calculator formula
  const calculateReplacement = () => {
    const days = parseInt(daysUsed) || 0;
    if (days <= 0) return;
    const wearRate = 0.0015; // 0.15% wear-and-tear per day
    const wearTearValue = basePrice * (wearRate * days);
    const remainingValue = Math.max(0, basePrice - wearTearValue);
    setReplacementValue(Math.round(remainingValue));
    setDailyCost(Math.round(wearTearValue / days));
  };

  useEffect(() => {
    calculateReplacement();
  }, [daysUsed]);

  const discount = Math.round(
    ((originalPrice - displayPrice) / originalPrice) * 100,
  );

  return (
    <div className="space-y-5 text-gray-800 dark:text-gray-100">
      {/* ── Demo/Client Status Switcher ── */}
      <div className="bg-[#FAF8F5] dark:bg-[#2C2925] border border-[#7B4F1E]/20 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider block mb-1">
            🛠️ Stock Status Demo Switcher
          </span>
          <span className="text-xs text-gray-400 dark:text-white">
            Click to switch product state values
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            ["in_stock", "overselling", "pre_order", "eol"] as StockStatus[]
          ).map((st) => (
            <button
              key={st}
              onClick={() => setStockStatus(st)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                stockStatus === st
                  ? "bg-[#7B4F1E] text-white"
                  : "bg-white dark:bg-[#3E3A35] border border-[#7B4F1E]/20 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:text-black"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Title + Wishlist / Share */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] dark:text-white leading-snug">
            {title}
          </h1>
          {isPreorder && (
            <span className="inline-block mt-2 bg-[#FAF3E7] text-[#7B4F1E] dark:bg-[#5E4221] dark:text-[#E9CCAE] text-xs font-extrabold px-3 py-1 rounded-full border border-[#7B4F1E]/20 animate-pulse">
              Pre-order Booking Open (Pay 5% Booking Deposit Only)
            </span>
          )}
          {stockStatus === "overselling" && (
            <span className="inline-block mt-2 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200/50">
              ⚡ Overselling Allowed (Restocking: Ships in 10-14 days)
            </span>
          )}
          {stockStatus === "eol" && (
            <span className="inline-block mt-2 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200/50">
              🚫 Discontinued (End-Of-Life Variant)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {[
            <Heart key="1" size={16} className="text-[#B57908]" />,
            <SwapIcon key="2" color="#B57908" width={16} height={16} />,
            <Share2 key="3" size={16} className="text-[#B57908]" />,
          ].map((Icon, i) => (
            <button
              key={i}
              className="w-10 h-10 border border-[#EEEEEE] dark:border-gray-700 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              {Icon}
            </button>
          ))}
        </div>
      </div>

      {/* Brand + Code + Hidden Profit Meter Gear */}
      <div className="flex justify-between items-center gap-2 text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 dark:text-white">By:</span>
          <Link
            href="#"
            className="text-[#B57908] dark:text-[#D4A97A] hover:underline font-semibold"
          >
            {brand}
          </Link>
          {/* Secret Gear for Profit Meter */}
          <button
            type="button"
            onClick={() => setShowProfitMeter(!showProfitMeter)}
            className="w-5 h-5 text-gray-300 dark:text-white hover:text-[#B57908] transition"
            title="Admin Cost View (Secret Toggle)"
          >
            <Settings size={14} className="animate-spin-slow" />
          </button>
        </div>

        <div>
          <span className="text-gray-500">
            Code:{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              #{code}
            </span>
          </span>
        </div>
      </div>

      {/* Admin Profit Meter (Secrets Panel) */}
      {showProfitMeter && (
        <div className="bg-[#faf4ea] dark:bg-purple-950/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/20 text-purple-950 dark:text-[#d4a97a] flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Percent size={14} className="text-[#d4a97a]" />
            <span>
              <strong>Admin Profit Meter:</strong> Cost Price: ৳
              {Math.round(basePrice * 0.85).toLocaleString()} | Profit Margin:{" "}
              <strong className="text-[#d4a97a] dark:text-[#d4a97a]">
                15% (৳{Math.round(basePrice * 0.15).toLocaleString()})
              </strong>
            </span>
          </div>
          <span className="text-[10px] bg-[#d4a97a] text-white dark:bg-purple-900/60 font-bold px-2 py-0.5 rounded">
            Hidden from Public
          </span>
        </div>
      )}

      {/* Availability Status */}
      <div className="flex items-center justify-between py-2 text-sm bg-gray-50 dark:bg-[#25221F] p-3 rounded-xl border border-[#7B4F1E]/20 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-white">Availability:</span>
          <span
            className={`font-bold ${
              stockStatus === "eol"
                ? "text-red-500"
                : stockStatus === "pre_order"
                  ? "text-[#7B4F1E] dark:text-[#bd9961]"
                  : "text-emerald-600"
            }`}
          >
            {stockStatus === "in_stock" && "In Stock"}
            {stockStatus === "overselling" && "Restocking Soon"}
            {stockStatus === "pre_order" && "Pre-order Only"}
            {stockStatus === "eol" && "Discontinued (EOL)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
          <FaireIcon />
          <span>
            {stockStatus === "in_stock" &&
              "Please Hurry! Only 21 left in stock"}
            {stockStatus === "overselling" &&
              "Purchase allowed. Backorders supported."}
            {stockStatus === "pre_order" && "Booking open. ETA: July 20"}
            {stockStatus === "eol" &&
              "Item discontinued. Replacement support only."}
          </span>
        </div>
      </div>

      {/* Warranty */}
      {warrantyNote && (
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <WarrantyIcon />
          <span className="bg-linear-to-r from-[#6D3F0E] to-[#D3791B] dark:from-[#D4A97A] dark:to-[#B57908] bg-clip-text text-transparent">
            {warrantyNote}
          </span>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          {
            icon: (
              <Flame size={12} className="text-orange-500 animate-bounce" />
            ),
            text: `${stats.soldLastHours} sold in last 12 hours`,
          },
          {
            icon: <StarIcon />,
            text: `${stats.reviewCount.toLocaleString()} customer reviews`,
          },
          {
            icon: <EyeIcon />,
            text: `${stats.viewingNow} people viewing now`,
          },
        ].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 bg-[#FF757514] dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold px-3 py-2 rounded-[10px]"
          >
            {item.icon}
            {item.text}
          </span>
        ))}
      </div>

      {/* Group Buy Campaign Widget */}
      <div className="bg-linear-to-br from-[#7B4F1E]/5 to-orange-500/5 dark:from-[#3E2F20] dark:to-[#3F2B20] border border-[#7B4F1E]/20 rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#B57908]" />
            <h3 className="text-sm font-bold text-[#7B4F1E] dark:text-[#E9CCAE]">
              Group Buy Campaign Active
            </h3>
          </div>
          <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Clock size={10} />
            {formatSeconds(timeLeft)}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span>Progress (Participants)</span>
            <span>34 / 50 Joined</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-500 to-[#B57908] rounded-full transition-all duration-500"
              style={{ width: "68%" }}
            />
          </div>
        </div>

        {/* Tier Discount Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
          <div className="bg-white/60 dark:bg-white/5 border border-[#7B4F1E]/20 dark:border-gray-800 rounded-lg p-1.5">
            <p className="text-gray-500">Tier 1 (20 Joined)</p>
            <p className="text-[#B57908] text-xs">10% Extra Off</p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 border border-[#7B4F1E]/20 dark:border-gray-800 rounded-lg p-1.5 ring-2 ring-orange-500/30">
            <p className="text-orange-500">Tier 2 (30 Joined) ✓</p>
            <p className="text-[#B57908] text-xs">20% Extra Off</p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 border border-[#7B4F1E]/20 rounded-lg p-1.5">
            <p className="text-gray-500">Tier 3 (50 Joined)</p>
            <p className="text-gray-400 text-xs">30% Extra Off</p>
          </div>
        </div>
      </div>

      {/* Main Pricing block */}
      <div className="lg:flex items-center justify-between gap-4 text-sm bg-[#FAF9F6] dark:bg-[#25221F] p-4 rounded-2xl border border-[#7B4F1E]/20 dark:border-gray-800/80">
        <div className="space-y-1">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isPreorder ? "Booking deposit amount (5%)" : "Special Offer Price"}
          </span>
          <div className="flex gap-2.5 items-center">
            <span className="text-[28px] font-extrabold text-[#B57908] dark:text-[#D4A97A]">
              ৳{displayPrice.toLocaleString()}
            </span>
            <span className="text-[18px] text-[#FF7575] line-through font-semibold">
              ৳{originalPrice.toLocaleString()}
            </span>
            <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold text-xs px-2.5 py-0.5 rounded-md">
              {discount}% OFF
            </span>
          </div>
          {isPreorder && (
            <span className="block text-xs text-gray-500">
              Remaining ৳{Math.round(basePrice * 0.95).toLocaleString()} payable
              at delivery
            </span>
          )}
        </div>

        {/* Quantity Select */}
        <div className="flex items-center gap-3 mt-3 lg:mt-0">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            Quantity:
          </span>
          <QuantitySelector defaultValue={1} />
        </div>
      </div>

      {/* ── Pricing History chart (SVG) ── */}
      <div className="bg-white dark:bg-[#221F1C] border border-[#7B4F1E]/20 dark:border-gray-800 rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <TrendingDown size={14} className="text-[#B57908]" /> Price Drop
          History (2 Months)
        </h3>
        {/* Custom SVG line chart */}
        <div className="w-full h-24">
          <svg
            viewBox="0 0 400 100"
            className="w-full h-full text-orange-500 dark:text-[#bd9961]"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgb(234, 88, 12)"
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(234, 88, 12)"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line
              x1="0"
              y1="20"
              x2="400"
              y2="20"
              stroke="rgba(150, 150, 150, 0.1)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="50"
              x2="400"
              y2="50"
              stroke="rgba(150, 150, 150, 0.1)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="80"
              x2="400"
              y2="80"
              stroke="rgba(150, 150, 150, 0.1)"
              strokeWidth="1"
            />
            {/* Chart Area Fill */}
            <path
              d="M 0,20 L 80,30 L 160,15 L 240,65 L 320,55 L 400,80 L 400,100 L 0,100 Z"
              fill="url(#chartGrad)"
            />
            {/* Chart Path */}
            <path
              d="M 0,20 L 80,30 L 160,15 L 240,65 L 320,55 L 400,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Dots */}

            {/* Dots */}
            <circle
              cx="80"
              cy="30"
              r="4.5"
              fill="#7B4F1E"
              stroke="white"
              strokeWidth="1.5"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1.5)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1)")
              }
            />
            <circle
              cx="240"
              cy="65"
              r="4.5"
              fill="#7B4F1E"
              stroke="white"
              strokeWidth="1.5"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1.5)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1)")
              }
            />
            <circle
              cx="400"
              cy="80"
              r="4.5"
              fill="#7B4F1E"
              stroke="white"
              strokeWidth="1.5"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1.5)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as SVGCircleElement).style.transform =
                  "scale(1)")
              }
            />

            {/* Labels */}
            <text
              x="10"
              y="95"
              className="text-[10px] font-bold fill-gray-400 dark:fill-white uppercase tracking-wide"
            >
              Mid May
            </text>
            <text
              x="180"
              y="95"
              className="text-[10px] font-bold fill-gray-400 dark:fill-white uppercase tracking-wide"
            >
              June 1st
            </text>
            <text
              x="340"
              y="95"
              className="text-[10px] font-bold fill-gray-400 dark:fill-white uppercase tracking-wide"
            >
              Today
            </text>
            {/* Tooltip labels */}
            <text x="85" y="25" className="text-[9px] font-bold fill-[#B57908]">
              ৳1,05,000
            </text>
            <text
              x="245"
              y="60"
              className="text-[9px] font-bold fill-[#B57908]"
            >
              ৳1,02,000
            </text>
            <text
              x="350"
              y="75"
              className="text-[9px] font-bold fill-[#B57908]"
            >
              ৳1,00,000
            </text>
          </svg>
        </div>
      </div>

      {/* ── Competitor Live Price Comparison ── */}
      <div className="bg-[#F8F9FB] dark:bg-[#22201D] border border-[#7B4F1E]/20 dark:border-gray-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-[#B57908]" /> Live Competitor
            Price Checker
          </h3>
          <button
            type="button"
            onClick={handlePriceComparison}
            disabled={isComparing}
            className="text-xs font-bold text-[#7B4F1E] dark:text-[#bd9961] bg-white dark:bg-[#342D26] hover:bg-gray-50 border border-gray-200 dark:border-gray-700 py-1 px-3 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isComparing
              ? "Scanning Competitor Sites..."
              : "Compare Live Price"}
          </button>
        </div>

        {isComparing && (
          <div className="w-full h-1.5 bg-gray-250 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-500 to-[#7B4F1E] rounded-full animate-progress"
              style={{ width: "80%" }}
            />
          </div>
        )}

        {compareResult && (
          <div className="grid grid-cols-3 gap-2.5 pt-1.5 animate-fade-in">
            <div className="bg-white dark:bg-[#2D2A26] rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-850">
              <p className="text-[10px] text-gray-500 font-bold">Star Tech</p>
              <p className="text-sm font-semibold text-red-500">
                ৳{compareResult.starTech.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#2D2A26] rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-850">
              <p className="text-[10px] text-gray-500 font-bold">
                Ryans Computers
              </p>
              <p className="text-sm font-semibold text-red-500">
                ৳{compareResult.ryans.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-2.5 text-center border border-emerald-100/50 dark:border-emerald-900/30">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                You Save At Dazzle
              </p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{compareResult.savings.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Instant Replacement Calculator ── */}
      <div className="bg-[#FAF8F5] dark:bg-[#2D2A26] border border-[#7B4F1E]/20 dark:border-gray-800 rounded-2xl p-4 space-y-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calculator size={14} className="text-[#B57908]" /> Instant
          Replacement Value Calculator
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Enter Days Used (Wear & Tear)
            </label>
            <input
              type="number"
              value={daysUsed}
              onChange={(e) => setDaysUsed(e.target.value)}
              className="w-full text-sm bg-white dark:bg-[#3E3A35] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#7B4F1E]"
              placeholder="e.g. 90"
              min="1"
            />
          </div>

          <div className="flex-1 bg-white dark:bg-[#262320] rounded-xl p-2 border border-gray-200/50 dark:border-gray-800/80 text-center">
            <p className="text-[10px] text-gray-400 font-bold">
              Replacement Value
            </p>
            <p className="text-base font-extrabold text-[#7B4F1E] dark:text-[#bd9961]">
              ৳{replacementValue ? replacementValue.toLocaleString() : "0"}
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              Daily Cost: ৳{dailyCost}
            </p>
          </div>
        </div>
      </div>

      {/* ── Make Your Offer Button ── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setShowOfferModal(true);
            setOfferSubmitted(false);
            setOfferPrice("");
          }}
          className="flex-1 py-3.5 rounded-xl border-2 border-dashed border-[#7B4F1E] hover:bg-[#7B4F1E]/5 text-[#7B4F1E] dark:text-[#bd9961] dark:border-[#bd9961] text-sm font-bold tracking-wider cursor-pointer transition duration-200"
        >
          🤝 Make Your Offer (Negotiate)
        </button>
      </div>

      {/* Make Your Offer Modal */}
      <GlobalModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Negotiate Price - Make Your Offer"
      >
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-100">
          {offerSubmitted ? (
            <div className="text-center py-6 space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">
                Offer Submitted Successfully!
              </h3>
              <p className="text-sm text-gray-500">
                Your offer of{" "}
                <strong>৳{parseInt(offerPrice).toLocaleString()}</strong> has
                been dispatched to the Dazzle admin team. A call-back agent will
                contact you shortly to close the deal.
              </p>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="w-full py-3.5 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219]"
              >
                CLOSE
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Propose your target purchase value for **{title}**. Our sales
                department will assess the bid and confirm via phone.
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Your Proposed Price (৳)
                  </label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full text-sm bg-white dark:bg-[#3E3A35] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#7B4F1E]"
                    placeholder="e.g. 96000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="w-full text-sm bg-white dark:bg-[#3E3A35] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#7B4F1E]"
                    placeholder="e.g. 017XXXXXXXX"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (offerPrice) setOfferSubmitted(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] tracking-widest cursor-pointer"
              >
                SUBMIT OFFER
              </button>
            </div>
          )}
        </div>
      </GlobalModal>
    </div>
  );
}
