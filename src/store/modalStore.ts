import { create } from "zustand";

interface ModalStore {
  modals: Record<string, any>;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
  getModalData: (id: string) => any;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: {},

  openModal: (id, data) =>
    set((state) => ({
      modals: { ...state.modals, [id]: data || true },
    })),

  closeModal: (id) =>
    set((state) => {
      const newModals = { ...state.modals };
      delete newModals[id];
      return { modals: newModals };
    }),

  closeAll: () => set({ modals: {} }),

  isOpen: (id) => Boolean(get().modals[id]),

  getModalData: (id) => get().modals[id],
}));

export const useSpecificModal = (modalId: string) => {
  const { openModal, closeModal, isOpen, getModalData } = useModalStore();

  return {
    open: (data?: any) => openModal(modalId, data),
    close: () => closeModal(modalId),
    isOpen: isOpen(modalId),
    data: getModalData(modalId),
  };
};
