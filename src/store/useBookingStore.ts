import { create } from 'zustand';
import { addDays } from 'date-fns';

export interface DateRange {
    from: Date | undefined;
    to?: Date | undefined;
}

export interface AddOn {
    id: string;
    name: string;
    price: number;
}

interface BookingState {
    dateRange: DateRange;
    guestCount: number;
    selectedAddOns: AddOn[];
    basePrice: number;
    cleaningFee: number;

    // Actions
    setDateRange: (range: DateRange) => void;
    setGuestCount: (count: number) => void;
    toggleAddOn: (addOn: AddOn) => void;
    setPrices: (basePrice: number, cleaningFee: number) => void;

    // Computed
    getTotalPrice: () => number;
    getNights: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
    dateRange: {
        from: addDays(new Date(), 1),
        to: addDays(new Date(), 3),
    },
    guestCount: 1,
    selectedAddOns: [],
    basePrice: 0,
    cleaningFee: 0,

    setDateRange: (range) => set({ dateRange: range }),
    setGuestCount: (count) => set({ guestCount: count }),
    setPrices: (basePrice, cleaningFee) => set({ basePrice, cleaningFee }),

    toggleAddOn: (addOn) => set((state) => {
        const isAlreadySelected = state.selectedAddOns.find((i) => i.id === addOn.id);
        if (isAlreadySelected) {
            return { selectedAddOns: state.selectedAddOns.filter((i) => i.id !== addOn.id) };
        }
        return { selectedAddOns: [...state.selectedAddOns, addOn] };
    }),

    getNights: () => {
        const { from, to } = get().dateRange;
        if (!from || !to) return 0;
        const diffTime = Math.abs(to.getTime() - from.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    getTotalPrice: () => {
        const state = get();
        const nights = state.getNights();
        if (nights === 0) return 0;

        const addOnsTotal = state.selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
        return (nights * state.basePrice) + state.cleaningFee + addOnsTotal;
    },
}));
