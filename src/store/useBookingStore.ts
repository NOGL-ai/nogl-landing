import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingData {
  sessionId: string;
  title: string;
  date: string;
  duration: number;
  expert: {
    name: string;
    image: string;
  };
  pricing: {
    basePrice: number;
    recordingPrice: number;
  };
  participants: number;
  includeRecording: boolean;
  recordingCount: number;
  total: number;
  rating?: {
    average: number;
    count: number;
  };
}

interface BookingStore {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData) => void;
  clearBookingData: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      bookingData: null,
      setBookingData: (data) => set({ bookingData: data }),
      clearBookingData: () => set({ bookingData: null }),
    }),
    {
      name: 'booking-storage',
    }
  )
); 