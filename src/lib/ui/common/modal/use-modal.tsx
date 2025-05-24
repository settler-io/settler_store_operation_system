"use client";

import { useCallback, useState, type PropsWithChildren } from "react";
import { Modal } from "./modal";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const _Modal = useCallback(
    (props: PropsWithChildren) => {
      return (
        <Modal isOpen={isOpen} onClose={closeModal}>
          {props.children}
        </Modal>
      );
    },
    [isOpen, closeModal],
  );

  return {
    openModal,
    closeModal,
    Modal: _Modal,
  } as const;
}
