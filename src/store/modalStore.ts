import { create } from "zustand";
interface Comment  {
    selectedClient: string,
    comment: string,
    selectedWeek: string
}

type ModalData = Record<string, unknown> | unknown[] | Comment ;


interface ModalStore {
  modals: Record<string, ModalData | true>;
  openModal: (id: string, data?: ModalData) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
  getModalData: (id: string) => ModalData | true | undefined;
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


export const useSpecificModal = <TData extends ModalData = ModalData>(modalId: string) => {
  const { openModal, closeModal, isOpen, getModalData } = useModalStore();

  return {
    open: (data?: TData) => openModal(modalId, data),
    close: () => closeModal(modalId),
    isOpen: isOpen(modalId),
    data: getModalData(modalId) as TData | undefined,
  };
};
