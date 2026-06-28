"use client";
import React, { useState } from "react";
import { Search, ChevronLeft, MapPin, Truck, Calendar, Clock, MessageSquare, Mail, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type TrackingStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered";

type OrderDetails = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  total: string;
  deliveryType: string;
  currentBranch: string;
  privateNotes: string;
  timeline: { status: TrackingStatus; label: string; time: string; desc: string; done: boolean }[];
  logs: { type: "sms" | "email"; time: string; message: string }[];
};

const MOCK_ORDER: OrderDetails = {
  id: "DZ-9944",
  customerName: "John Doe",
  phone: "+8801700000000",
  email: "john.doe@gmail.com",
  date: "2026-06-20",
  total: "৳1,00,150",
  deliveryType: "Extreme Fast Delivery 🚚",
  currentBranch: "Banani Branch (Dazzle Flagship)",
  privateNotes: "Customer requested delivery at the office. Call 10 minutes prior to arrival.",
  timeline: [
    { status: "pending", label: "Order Placed", time: "10:00 AM, 20 Jun", desc: "Order submitted via shopping cart", done: true },
    { status: "confirmed", label: "Confirmed", time: "10:15 AM, 20 Jun", desc: "Confirmed by Call Agent (Sufian)", done: true },
    { status: "packed", label: "Packed & Ready", time: "11:30 AM, 20 Jun", desc: "Packed at Banani flagship store", done: true },
    { status: "shipped", label: "Shipped", time: "02:30 PM, 20 Jun", desc: "Handed over to Pathao courier service", done: true },
    { status: "delivered", label: "Delivered", time: "Pending", desc: "Courier dispatcher is en route to destination", done: false },
  ],
  logs: [
    { type: "sms", time: "10:01 AM", message: "Your Dazzle order DZ-9944 has been placed successfully." },
    { type: "email", time: "10:02 AM", message: "Dazzle Invoice DZ-9944 successfully dispatched to john.doe@gmail.com." },
    { type: "sms", time: "10:16 AM", message: "DZ-9944 Confirmed: Thank you for choosing Dazzle. Preparing package." },
    { type: "sms", time: "02:32 PM", message: "DZ-9944 Shipped: Handed to courier dispatcher. OTP is 4492." },
  ],
};

const BRANCHES = [
  "Banani Branch (Dazzle Flagship)",
  "Dhanmondi Branch (Dazzle Express)",
  "Mirpur Branch (Dazzle Hub)",
];

export default function OrderTracking() {
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [activeBranch, setActiveBranch] = useState("");

  const handleSearch = () => {
    if (searchId.trim().toUpperCase() === "DZ-9944") {
      setOrder(MOCK_ORDER);
      setActiveBranch(MOCK_ORDER.currentBranch);
      toast.success("Order DZ-9944 loaded successfully!");
    } else {
      setOrder(null);
      toast.error("Order ID not found. Enter DZ-9944 for testing.");
    }
  };

  const handleBranchTransfer = (newBranch: string) => {
    setActiveBranch(newBranch);
    toast.success(`Order ownership successfully transferred to ${newBranch}`);
    // Simulate updating logs
    if (order) {
      const now = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      const newLog = {
        type: "email" as const,
        time: now,
        message: `Order ownership transfer notification sent to ${newBranch}.`,
      };
      setOrder({
        ...order,
        logs: [newLog, ...order.logs],
      });
    }
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#1E1C1A] font-sans md:p-0 p-5 pb-20 max-w-355 mx-auto text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="pt-10 flex flex-col gap-5 items-center">
        <h1 className="text-2xl font-extrabold text-[#101518] dark:text-white">
          Track Your Order Status
        </h1>
        <p className="text-xs text-gray-400 -mt-3">Enter mock ID <strong className="text-[#7B4F1E] dark:text-[#bd9961]">DZ-9944</strong> to preview simulated workflows</p>
        
        {/* Search Input bar */}
        <div className="flex items-center gap-3 w-full md:w-1/2 lg:w-1/3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="text-[#222222] bg-white dark:bg-[#2A2622] dark:text-white w-full border border-[#E7E7E7] dark:border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            placeholder="Enter Order ID (e.g. DZ-9944)"
          />
          <button
            onClick={handleSearch}
            className="bg-[#7B4F1E] hover:bg-[#684219] py-3.5 px-6 rounded-xl text-white cursor-pointer transition-colors flex items-center justify-center"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {order && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in px-2">
          
          {/* Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Info details */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Order {order.id} Details</h3>
                  <p className="text-xs text-gray-400">Placed on {order.date}</p>
                </div>
                <span className="text-xs bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold px-3 py-1 rounded-full">
                  {order.deliveryType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Customer Details</p>
                  <p className="font-bold text-sm mt-0.5">{order.customerName}</p>
                  <p className="text-gray-500 mt-0.5">{order.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Total Bill Amount</p>
                  <p className="font-bold text-base text-[#7B4F1E] dark:text-[#bd9961] mt-0.5">{order.total}</p>
                </div>
              </div>

              {/* Private CRM notes */}
              <div className="bg-[#FAF8F5] dark:bg-[#2E2A26] rounded-xl p-3 border border-gray-150 dark:border-gray-800 flex items-start gap-2 text-xs">
                <MessageSquare size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block mb-0.5 text-gray-800 dark:text-gray-200">Customer Service Private Notes:</span>
                  <p className="text-gray-500 dark:text-gray-400">{order.privateNotes}</p>
                </div>
              </div>
            </div>

            {/* Tracking timeline */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">CRM Delivery Status Timeline</h3>
              
              <div className="relative border-l-2 border-gray-250 dark:border-gray-800 ml-4 space-y-8 pb-2">
                {order.timeline.map((step) => (
                  <div key={step.status} className="relative pl-6">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-4 flex items-center justify-center ${
                        step.done
                          ? "bg-[#7B4F1E] border-white dark:border-[#25221F]"
                          : "bg-white dark:bg-[#25221F] border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {step.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className={`font-bold ${step.done ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {step.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar CRM Controls (SMS & Transfers) */}
          <div className="space-y-6">
            
            {/* Branch Transfer Box */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#7B4F1E]" /> Order Branch Dispatcher
              </h3>
              
              <div className="text-xs space-y-2">
                <p className="text-gray-500">Currently handled by branch:</p>
                <div className="font-bold text-sm bg-orange-50/50 dark:bg-orange-950/20 text-[#7B4F1E] dark:text-[#bd9961] p-2.5 rounded-lg border border-orange-100/50">
                  🏪 {activeBranch}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                  Transfer Dispatch Ownership
                </label>
                <select
                  value={activeBranch}
                  onChange={(e) => handleBranchTransfer(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#342D26] border border-gray-250 dark:border-gray-800 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#7B4F1E] cursor-pointer"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notification logs */}
            <div className="bg-white dark:bg-[#25221F] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={14} className="text-[#7B4F1E]" /> Transmitted Alerts Logs
              </h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {order.logs.map((log, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-[#2E2A26] rounded-xl p-3 border border-gray-150 dark:border-gray-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className={`text-[9px] uppercase tracking-wider py-0.5 px-2 rounded-full ${
                        log.type === "sms"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                      }`}>
                        {log.type === "sms" ? "SMS Alert" : "Email Dispatch"}
                      </span>
                      <span className="text-[10px] text-gray-400">{log.time}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-300 leading-relaxed">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Back to Home links */}
      <div className="mt-10 flex justify-center">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#7B4F1E] transition">
          <ChevronLeft size={16} /> Back to Home Page
        </Link>
      </div>
    </div>
  );
}
