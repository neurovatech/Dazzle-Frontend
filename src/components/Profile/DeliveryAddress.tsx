/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Edit2,
  Trash2,
  MapPin,
  Plus,
  Loader2,
  Star,
} from "lucide-react";

import locationImg from "@/images/location.png";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface AddressBookItem {
  addressUuid: string;
  fullName: string;
  mobileNo: string;
  addressLabel?: string;
  addressLine1: string;
  addressLine2?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  isActive: boolean;
  districtID: number;
  policeStationID: number;
  updatedAt?: string;
}

interface AddressListResponse {
  statusCode: number;
  status: string;
  message: string;
  count: number;
  data: AddressBookItem[];
}

interface AreaItem {
  areaID: number;
  areaName: string;
}

interface DistrictItem {
  distID: number;
  districtName: string;
  area: AreaItem[];
}

interface AreaListResponse {
  statusCode: number;
  status: string;
  message: string;
  count: number;
  data: DistrictItem[];
}

interface AlterAddressResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    addressId: number;
    addressUuid: string;
    updatedAt?: string;
    createdAt?: string;
  };
}

// Response for PUT /address/{uuid}/primary
interface SetPrimaryResponse {
  statusCode: number;
  status: string;
  message: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const DeliveryAddress = () => {
  const queryClient = useQueryClient();
  const { user, token, apiKey } = useAppSelector((state) => state.auth);

  // Ensure Authorization header always has Bearer prefix
  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  // States
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressBookItem | null>(
    null,
  );

  // Form States
  const [fullName, setFullName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [districtID, setDistrictID] = useState<number>(0);
  const [policeStationID, setPoliceStationID] = useState<number>(0);

  // 1. Fetch Area List (Districts and Thanas/Areas) from API
  const { data: areaList, isLoading: isAreaLoading } =
    useQuery<AreaListResponse>({
      queryKey: ["areaList"],
      queryFn: async () => {
        return api.get<AreaListResponse>("area-list", {
          headers: {
            "X-API-Key": apiKey || "",
            Authorization: authHeader,
          },
        });
      },
    });

  // 2. Fetch Address List
  const { data: addressList, isLoading: isListLoading } =
    useQuery<AddressListResponse>({
      queryKey: ["addressList", apiKey],
      queryFn: async () => {
        return api.get<AddressListResponse>("address-list", {
          headers: {
            "X-API-Key": apiKey || "",
            Authorization: authHeader,
          },
        });
      },
      enabled: !!apiKey && !!token,
    });

  // 3. Save Address Mutation (Add or Edit)
  const { mutate: saveAddress, isPending: isSaving } = useMutation({
    mutationFn: async (payload: {
      uuid?: string;
      data: Partial<AddressBookItem>;
      isEdit: boolean;
    }) => {
      const endpoint = payload.isEdit
        ? `alter-address-book/${payload.uuid}`
        : "new-address-book";

      return api.post<AlterAddressResponse>(endpoint, payload.data, {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Address book updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["addressList"] });

      const newUuid = res.data?.addressUuid 
      setPrimaryAddress(newUuid);
      closeModal();
    },
    onError: (err: any) => {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.errors && parsed.errors.length > 0) {
          parsed.errors.forEach((e: string) => toast.error(e));
        } else {
          toast.error(parsed.message || "Failed to save address.");
        }
      } catch {
        toast.error("Something went wrong.");
      }
    },
  });

  // 4. Delete Address (Hard Delete via API)
  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (uuid: string) => {
      return api.delete<AlterAddressResponse>(`address-delete/${uuid}`, {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
    },
    onSuccess: (res: any) => {
      toast.success(res.message || "Address deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["addressList"] });
    },
    onError: (err: any) => {
      try {
        const parsed = JSON.parse(err.message);
        toast.error(parsed.message || "Failed to delete address.");
      } catch {
        toast.error("Something went wrong while deleting.");
      }
    },
  });

  // 5. Set Address as Primary/Default — PUT /address/{uuid}/primary
  const {
    mutate: setPrimaryAddress,
    isPending: isSettingPrimary,
    variables: settingPrimaryUuid,
  } = useMutation({
    mutationFn: async (uuid: string) => {
      return api.put<SetPrimaryResponse>(
        `address/${uuid}/primary`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey || "",
            Authorization: authHeader,
          },
        },
      );
    },
    onSuccess: (res) => {
      toast.success(res.message || "Primary address updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["addressList"] });
    },
    onError: (err: any) => {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.errors && parsed.errors.length > 0) {
          parsed.errors.forEach((e: string) => toast.error(e));
        } else {
          toast.error(parsed.message || "Failed to set primary address.");
        }
      } catch {
        toast.error("Something went wrong while setting default address.");
      }
    },
  });

  const handleSetDefaultClick = (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrimaryAddress(uuid);
  };

  // State for custom delete confirmation modal
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const handleDeleteClick = (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingUuid(uuid);
  };

  // Handle District Change to Reset Thana Selection
  const handleDistrictChange = (id: number) => {
    setDistrictID(id);
    setPoliceStationID(0); // Reset Thana
  };

  // Open Modal for New Address
  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setMobileNo("");
    setAddressLabel("Home");
    setAddressLine1("");
    setAddressLine2("");
    setDeliveryInstructions("");
    setIsDefault(false);
    setDistrictID(0);
    setPoliceStationID(0);
    setIsModalOpen(true);
  };

  // Open Modal for Updating Address
  const openEditModal = (item: AddressBookItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(item);
    setFullName(item.fullName);
    setMobileNo(item.mobileNo);
    setAddressLabel(item.addressLabel || "Home");
    setAddressLine1(item.addressLine1);
    setAddressLine2(item.addressLine2 || "");
    setDeliveryInstructions(item.deliveryInstructions || "");
    setIsDefault(item.isDefault);
    setDistrictID(item.districtID);
    setPoliceStationID(item.policeStationID);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNo.trim() || !addressLine1.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const isEdit = !!editingAddress;
    const payloadData = {
      fullName,
      mobileNo,
      addressLabel,
      addressLine1,
      addressLine2: addressLine2 || "",
      deliveryInstructions: deliveryInstructions || "",
      isDefault,
      isActive: true,
      districtID: districtID || 0,
      policeStationID: policeStationID || 0,
    };

    saveAddress({
      uuid: editingAddress?.addressUuid,
      data: payloadData,
      isEdit,
    });
  };

  // Active Addresses Filter
  const activeAddresses =
    addressList?.data?.filter((addr) => addr.isActive) || [];

  // Selected District object from API data
  const selectedDistrictObj = areaList?.data?.find(
    (d) => d.distID === districtID,
  );

  return (
    <div className="w-full">
      {isListLoading || isAreaLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="animate-spin text-yellow-600 mb-2" size={24} />
          <p className="text-sm text-gray-400">
            Loading addresses and areas...
          </p>
        </div>
      ) : activeAddresses.length === 0 ? (
        <div className="bg-gray-50 dark:bg-[#23201d] rounded-2xl p-6 text-center border border-dashed border-gray-200 dark:border-gray-800">
          <MapPin
            className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
            size={32}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No saved addresses found. Add one below!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAddresses.map((addr) => {
            const isExpanded = expandedUuid === addr.addressUuid;
            const isThisSettingPrimary =
              isSettingPrimary && settingPrimaryUuid === addr.addressUuid;

            // Look up Names from Area List API data dynamically
            const districtName =
              areaList?.data?.find((d) => d.distID === addr.districtID)
                ?.districtName || "Unknown District";
            const thanaName =
              areaList?.data
                ?.find((d) => d.distID === addr.districtID)
                ?.area?.find((t) => t.areaID === addr.policeStationID)
                ?.areaName || "Unknown Thana";

            return (
              <div
                key={addr.addressUuid}
                className="overflow-hidden bg-white dark:bg-[#23201d] rounded-2xl border border-gray-100 dark:border-gray-800 transition-all"
              >
                {/* Header Row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={() =>
                    setExpandedUuid(isExpanded ? null : addr.addressUuid)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Image
                        src={locationImg}
                        alt="Location"
                        width={24}
                        height={24}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {addr.addressLabel || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        {addr.addressLine1}{" "}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90 text-yellow-600" : ""}`}
                    size={18}
                  />
                </div>

                {/* Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-black/10 flex flex-col md:flex-row md:justify-between items-start gap-4">
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2.5">
                      <div>
                        <span className="font-semibold block text-gray-400">
                          Recipient Name
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {addr.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold block text-gray-400">
                          Phone Number
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {addr.mobileNo}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold block text-gray-400">
                          Region
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          District: {districtName} | Thana: {thanaName}
                        </span>
                      </div>
                      {addr.deliveryInstructions && (
                        <div>
                          <span className="font-semibold block text-gray-400">
                            Delivery Instructions
                          </span>
                          <p className="italic text-gray-500 mt-0.5">
                            {addr.deliveryInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 flex-wrap">
                      <button
                        onClick={(e) => openEditModal(addr, e)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                      >
                        <Edit2 size={13} />
                        Edit
                      </button>

                      {activeAddresses.length > 1 && (
                        <button
                          onClick={(e) =>
                            handleDeleteClick(addr.addressUuid, e)
                          }
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      )}

                      {/* Set as Default — calls PUT /address/{uuid}/primary */}
                      {!addr.isDefault && (
                        <button
                          type="button"
                          disabled={isThisSettingPrimary}
                          onClick={(e) =>
                            handleSetDefaultClick(addr.addressUuid, e)
                          }
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-yellow-200 dark:border-yellow-900/40 rounded-xl text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isThisSettingPrimary ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Star size={13} />
                          )}
                          Default
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD ANOTHER TRIGGER ── */}
      <button
        onClick={openAddModal}
        className="flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-600 dark:bg-yellow-500/10 text-white dark:text-yellow-400 rounded-2xl text-sm font-bold hover:bg-yellow-700 transition duration-200 shadow-sm"
      >
        <Plus size={16} />
        Add another address
      </button>

      {/* ── ADD/EDIT ADDRESS MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Top Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAddress ? "Update Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="rotate-90 text-gray-400" size={16} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Recipient Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01700000000"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              {/* Address Label (Home / Office) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {["Home", "Office", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressLabel(lbl)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-200 ${
                        addressLabel === lbl
                          ? "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* District & Thana (Side by Side) */}
              <div className="grid grid-cols-2 gap-3">
                {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    District
                  </label>
                  <div className="relative">
                    <select
                      value={districtID}
                      onChange={(e) =>
                        handleDistrictChange(Number(e.target.value))
                      }
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-700 dark:text-white focus:outline-none"
                    >
                      <option value={0}>Select District</option>
                      {areaList?.data?.map((d) => (
                        <option key={d.distID} value={d.distID}>
                          {d.districtName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Thana Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Thana
                  </label>
                  <div className="relative">
                    <select
                      value={policeStationID}
                      disabled={!districtID}
                      onChange={(e) =>
                        setPoliceStationID(Number(e.target.value))
                      }
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-700 dark:text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={0}>Select Thana</option>
                      {selectedDistrictObj?.area.map((t) => (
                        <option key={t.areaID} value={t.areaID}>
                          {t.areaName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House no., street, block/area"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment, floor, landmark"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  placeholder="e.g. Call before delivery, drop at reception"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282522] text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500/20"
                />
                <label
                  htmlFor="isDefault"
                  className="text-xs text-gray-600 dark:text-gray-300 font-semibold cursor-pointer select-none"
                >
                  Set as default delivery address
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold tracking-wider hover:bg-gray-700 transition flex items-center justify-center gap-1.5"
                >
                  {isSaving && <Loader2 size={13} className="animate-spin" />}
                  {editingAddress ? "UPDATE ADDRESS" : "ADD ADDRESS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingUuid && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delete Address
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-white leading-relaxed">
              Are you sure you want to permanently delete this delivery address
              from your profile?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUuid(null)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(deletingUuid);
                  setDeletingUuid(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wider transition"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddress;