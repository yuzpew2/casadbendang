// Database types matching Supabase schema

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'maintenance';

export interface Property {
    id: string;
    name: string;
    price_per_night: number;
    cleaning_fee: number;
    description: string | null;
    images: string[] | null;
    whatsapp_number: string | null;
    max_guests: number;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    property_id: string;
    guest_name: string | null;
    guest_phone: string | null;
    start_date: string;
    end_date: string;
    num_guests: number;
    status: BookingStatus;
    total_price: number;
    add_ons: BookingAddOn[];
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface BookingAddOn {
    name: string;
    price: number;
}

export interface AddOn {
    id: string;
    property_id: string;
    name: string;
    price: number;
    is_active: boolean;
    created_at: string;
}

// Input types for creating/updating
export interface CreateBookingInput {
    property_id: string;
    guest_name?: string;
    guest_phone?: string;
    start_date: string;
    end_date: string;
    num_guests: number;
    total_price: number;
    add_ons?: BookingAddOn[];
    notes?: string;
}

export interface UpdatePropertyInput {
    name?: string;
    price_per_night?: number;
    cleaning_fee?: number;
    description?: string;
    images?: string[];
    whatsapp_number?: string;
    max_guests?: number;
}

export interface CreateAddOnInput {
    property_id: string;
    name: string;
    price: number;
}

export interface UpdateAddOnInput {
    name?: string;
    price?: number;
    is_active?: boolean;
}
