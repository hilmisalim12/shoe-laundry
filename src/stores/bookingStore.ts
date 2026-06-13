import { create } from 'zustand';

import type { LogisticsType } from '@/src/types';

function defaultScheduledAt() {
  const d = new Date(Date.now() + 86400000);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

type BookingState = {
  step: number;
  selectedServiceId: string;
  shoeType: string;
  quantity: number;
  logisticsType: LogisticsType;
  addressText: string;
  scheduledAt: string;
  notes: string;
  setStep: (step: number) => void;
  setSelectedServiceId: (id: string) => void;
  setShoeType: (type: string) => void;
  setQuantity: (qty: number) => void;
  setLogisticsType: (type: LogisticsType) => void;
  setAddressText: (text: string) => void;
  setScheduledAt: (value: string) => void;
  setNotes: (value: string) => void;
  reset: () => void;
};

const initialState = {
  step: 1,
  selectedServiceId: '',
  shoeType: 'Sneakers',
  quantity: 1,
  logisticsType: 'pickup_delivery' as LogisticsType,
  addressText: '',
  scheduledAt: defaultScheduledAt(),
  notes: '',
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setSelectedServiceId: (selectedServiceId) => set({ selectedServiceId }),
  setShoeType: (shoeType) => set({ shoeType }),
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  setLogisticsType: (logisticsType) => set({ logisticsType }),
  setAddressText: (addressText) => set({ addressText }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setNotes: (notes) => set({ notes }),
  reset: () => set({ ...initialState, scheduledAt: defaultScheduledAt() }),
}));
