"use client";
import {
  ChevronRight,
  Delete,
  DotSquareIcon,
  EditIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import locationImg from "@/images/location.png";
import { useState } from "react";

type AddressData = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
};

const DeliveryAddress = () => {
  const [show, setShow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState<AddressData>({
    name: "",
    phone: "",
    address: "",
    district: "",
    city: "",
  });

  const DISTRICTS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"];
  const CITIES = ["Dhaka", "Mirpur", "Uttara", "Gulshan", "Bashundhara"];

  const handleChange = (field: keyof AddressData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setForm({ name: "", phone: "", address: "", district: "", city: "" });
  };

  return (
    <div>
      <div
        className="relative mb-3 bg-[#F7F7F7] dark:bg-[#393430] py-4 px-5 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-gray-100 text-red-500">
            <Image src={locationImg} alt="Location" width={38} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Dhaka
            </h4>
            <p className="text-sm text-gray-400 dark:text-gray-300">
              Rd 7, Block A, Bashundhara
            </p>
          </div>
        </div>
        <ChevronRight
          className={`md:block hidden text-[#222222] dark:text-white transition-all duration-300 ${show ? "rotate-90" : "rotate-none"}`}
          size={20}
        />
        <DotSquareIcon
          onClick={() => setShowPopup((prev) => !prev)}
          className={`block md:hidden text-[#222222] dark:text-white transition-all duration-300`}
          size={20}
        />
        {/* for mobile device */}
        <div
          className={`absolute z-10 -bottom-[70%] right-7 items-center gap-3 bg-white shadow-[0px_0px_14.4px_3px_#E9CCAE70] rounded-xl p-3 ${showPopup ? "block" : "hidden"} md:hidden`}
        >
          <div
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              setShowPopup(false);
            }}
            className="text-[#575757] flex items-center gap-2 px-2 rounded-md hover:bg-white transition-all cursor-pointer"
          >
            <EditIcon size={16} /> <span>Edit</span>
          </div>
          <hr className="border-t border-gray-200 my-2" />
          <div className="text-[#575757] flex items-center gap-2 px-2 rounded-md hover:bg-white transition-all cursor-pointer">
            <Delete size={16} className="text-red-600" /> <span>Delete</span>
          </div>
        </div>
      </div>

      {/* address details */}

      {/* address form for mobile */}
      <div
        className={`space-y-4 ${showAddressForm ? "block" : "hidden"} md:hidden`}
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">
            Name
          </label>
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
          <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">
            Phone Number
          </label>
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
          <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">
            Address
          </label>
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
          <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">
            District
          </label>
          <div className="relative">
            <select
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            >
              <option value="">Select district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">
            City
          </label>
          <div className="relative">
            <select
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Buttons */}
        <button
          type="submit"
          // disabled={isSubmitting}
          className="w-full py-4 rounded-[20px] bg-gray-900 dark:bg-gray-300 text-white dark:text-black text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-400 transition-all duration-200 mt-4"
        >
          ADD ADDRESS
          {/* {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Sending OTP...
          </span>
        ) : (
          "SEND OTP"
        )} */}
        </button>
      </div>

      <div
        className={`hidden mb-7 bg-[#F7F7F7] rounded-2xl p-5 pr-9 justify-between items-start ${show ? "opacity-100 md:flex" : "opacity-0 hidden"}`}
      >
        <div className="text-[#222222] font-medium space-y-5">
          <div className="">
            <h4 className="mb-2.5">Name</h4>
            <h4 className="text-xl">Anika Rahnum</h4>
          </div>
          <div className="">
            <h4 className="mb-2.5">Phone Number</h4>
            <h4 className="text-xl">017373828292</h4>
          </div>
          <div className="">
            <h4 className="mb-2.5">Address</h4>
            <h4 className="text-xl">Block A, Bashundhara, Dhaka</h4>
          </div>
          <div className="">
            <h4 className="mb-2.5">District</h4>
            <h4 className="text-xl">Dhaka</h4>
          </div>
          <div className="">
            <h4 className="mb-2.5">City</h4>
            <h4 className="text-xl">Dhaka</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[#575757] flex items-center gap-2 py-0.5 px-2 rounded-md hover:bg-white transition-all cursor-pointer">
            <EditIcon size={16} /> <span>Edit</span>
          </div>
          <div className="text-[#575757] flex items-center gap-2 py-0.5 px-2 rounded-md hover:bg-white transition-all cursor-pointer">
            <Delete size={16} className="text-red-600" /> <span>Delete</span>
          </div>
        </div>
      </div>

      {/* add onother */}
      <div
        className="flex items-center gap-1.5 cursor-pointer w-fit mt-4"
        onClick={() => setShowAddressForm(!showAddressForm)}
      >
        <div className="p-0.5 bg-[#6D3F0E] dark:bg-white rounded-md">
          {/* w-5 h-5 flex items-center justify-center */}
          <StarIcon className="text-gray-300 dark:text-black " size={16} />
        </div>
        <span className="text-[#6D3F0E] font-semibold dark:text-white">
          Add another
        </span>
      </div>
    </div>
  );
};

export default DeliveryAddress;
