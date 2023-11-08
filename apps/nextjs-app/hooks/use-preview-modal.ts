import { create } from 'zustand';

interface PreviewModalStore {
  isOpen: boolean;
  data?: any;
  onOpen: (data: any) => void;
  onClose: () => void;
}

const usePreviewModal = create<PreviewModalStore>((set: any) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data: any) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));

export default usePreviewModal;
