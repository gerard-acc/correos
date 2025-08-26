import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSpecificModal } from "../../../store/modalStore";
import "./modal.css";

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
}

export function Modal({
  id,
  title,
  children,
  footer,
  closeOnEsc = true,
  closeOnOverlay = true,
}: ModalProps) {
  const modal = useSpecificModal(id);

  useEffect(() => {
    if (!modal.isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") modal.close();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modal, closeOnEsc]);

  if (!modal.isOpen) return null;

  return createPortal(
    <div
      className="modalBackdrop"
      onClick={closeOnOverlay ? modal.close : undefined}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <p>{title}</p>
          <button className="modal__header__close" onClick={modal.close}>
            <img src="/cross.svg" width="12px"></img>
          </button>
        </div>
        <div className="modal__content">{children}</div>
        <div className="modal__footer">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}
