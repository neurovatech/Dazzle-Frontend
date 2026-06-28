"use client";
import React from "react";
import { createPortal } from "react-dom";

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RightArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

type GlobalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function GlobalModal({
  isOpen,
  onClose,
  onBack,
  title,
  children,
}: GlobalModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4 py-4">
      <div className="relative w-full max-w-[850px] max-h-[calc(100vh-2rem)] rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex shrink-0 justify-between items-center px-5 py-4 border-b border-gray-100">
          <button
            onClick={onBack || onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E9CCAE]"
          >
            <RightArrow />
          </button>
          <h3 className="text-base font-bold text-black">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-black"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content grows with content, scrolls if it exceeds viewport */}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}