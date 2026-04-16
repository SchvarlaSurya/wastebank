import { create } from 'zustand';

interface PickupState {
  isOpen: boolean;
  openPickup: () => void;
  closePickup: () => void;
}

export const usePickupStore = create<PickupState>((set) => ({
  isOpen: false,
  openPickup: () => set({ isOpen: true }),
  closePickup: () => set({ isOpen: false }),
}));
