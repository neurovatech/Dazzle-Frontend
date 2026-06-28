"use client";

import  { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
  isOpen: boolean;
  modalContent: ReactNode;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, modalContent, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useGlobalModal must be used within ModalProvider");
  }

  return context;
};