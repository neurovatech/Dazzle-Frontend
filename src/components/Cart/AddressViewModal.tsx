"use client";
import GlobalModal from "@/components/share/GlobalModal";

type AddressData = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
};

type AddressViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  address: AddressData;
  onDelete: () => void;
  onEdit: () => void;
};

export default function AddressViewModal({
  isOpen,
  onClose,
  address,
  onDelete,
  onEdit,
}: AddressViewModalProps) {
  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Delivery Address">
      <div className="px-6 pb-6 space-y-4">
        {/* Name */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Name</p>
          <p className="text-sm font-medium text-gray-900">{address.name}</p>
        </div>

        {/* Phone */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
          <p className="text-sm font-medium text-gray-900">{address.phone}</p>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Address</p>
          <p className="text-sm font-medium text-gray-900">{address.address}</p>
        </div>

        {/* District */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">District</p>
          <p className="text-sm font-medium text-gray-900">{address.district}</p>
        </div>

        {/* City */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">City</p>
          <p className="text-sm font-medium text-gray-900">{address.city}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onDelete}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 tracking-widest transition"
          >
            DELETE
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-xl bg-[#7B4F1E] text-white text-sm font-semibold hover:bg-[#6A4219] tracking-widest transition"
          >
            EDIT
          </button>
        </div>
      </div>
    </GlobalModal>
  );
}