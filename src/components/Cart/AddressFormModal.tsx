"use client";
import React, { useState } from "react";
import GlobalModal from "@/components/share/GlobalModal";

type AddressData = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
};

type AddressFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: AddressData) => void;
  initialData?: AddressData;
};

const DISTRICTS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"];
const CITIES = ["Dhaka", "Mirpur", "Uttara", "Gulshan", "Bashundhara"];

export default function AddressFormModal({
  isOpen,
  onClose,
  onApply,
  initialData,
}: AddressFormModalProps) {
  const [form, setForm] = useState<AddressData>(
    initialData || { name: "", phone: "", address: "", district: "", city: "" }
  );

  const handleChange = (field: keyof AddressData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setForm({ name: "", phone: "", address: "", district: "", city: "" });
  };

  const handleApply = () => {
    onApply(form);
    onClose();
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Delivery Address">
      <div className="px-6 pb-6 space-y-4  max-h-100 overflow-y-auto ">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Address</label>
          <input
            type="text"
            placeholder="Enter your full address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">District</label>
          <div className="relative">
            <select
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            >
              <option value="">Select district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">City</label>
          <div className="relative">
            <select
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClear}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <span className="w-4 h-4 rounded-full border-2 border-gray-400 inline-block" />
            CLEAR ALL
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] transition"
          >
            APPLY
          </button>
        </div>
      </div>
    </GlobalModal>
  );
}