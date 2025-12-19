import { create } from 'zustand';
import type { RoomCount } from '@/types/database';

interface AddOnItem {
    id: string;
    name: string;
    price: number;
}

interface RoomPrices {
    price_3_rooms: number;
    price_4_rooms: number;
    price_6_rooms: number;
}

interface BookingState {
    dateRange: { from: Date | undefined; to: Date | undefined };
    guestCount: number;
    roomCount: RoomCount;
    selectedAddOns: AddOnItem[];
    roomPrices: RoomPrices;

    // Actions
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
    setGuestCount: (count: number) => void;
    setRoomCount: (count: RoomCount) => void;
    toggleAddOn: (addOn: AddOnItem) => void;
    setRoomPrices: (prices: RoomPrices) => void;

    // Computed
    getNights: () => number;
    getRoomPrice: () => number;
    getTotalPrice: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
    dateRange: { from: undefined, to: undefined },
    guestCount: 2,
    roomCount: 3,
    selectedAddOns: [],
    roomPrices: {
        price_3_rooms: 350,
        price_4_rooms: 450,
        price_6_rooms: 650,
    },

    setDateRange: (range) => set({ dateRange: range }),

    setGuestCount: (count) => set({ guestCount: count }),

    setRoomCount: (count) => set({ roomCount: count }),

    toggleAddOn: (addOn) => set((state) => {
        const exists = state.selectedAddOns.find(a => a.id === addOn.id);
        if (exists) {
            return { selectedAddOns: state.selectedAddOns.filter(a => a.id !== addOn.id) };
        }
        return { selectedAddOns: [...state.selectedAddOns, addOn] };
    }),

    setRoomPrices: (prices) => set({ roomPrices: prices }),

    getNights: () => {
        const { dateRange } = get();
        if (!dateRange.from || !dateRange.to) return 0;
        const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    getRoomPrice: () => {
        const { roomCount, roomPrices } = get();
        switch (roomCount) {
            case 3: return roomPrices.price_3_rooms;
            case 4: return roomPrices.price_4_rooms;
            case 6: return roomPrices.price_6_rooms;
            default: return roomPrices.price_3_rooms;
        }
    },

    getTotalPrice: () => {
        const nights = get().getNights();
        const roomPrice = get().getRoomPrice();
        const addOnsTotal = get().selectedAddOns.reduce((sum, a) => sum + a.price, 0);
        return (roomPrice * nights) + addOnsTotal;
    },
}));
