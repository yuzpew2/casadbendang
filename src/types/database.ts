// Database types matching Supabase schema

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'maintenance';

export type RoomCount = 3 | 4 | 6;

export interface Property {
    id: string;
    name: string;

    // Room-based pricing
    price_3_rooms: number;
    price_4_rooms: number;
    price_6_rooms: number;

    description: string | null;
    whatsapp_number: string | null;
    max_guests: number;

    // Social media
    instagram_url: string | null;
    facebook_url: string | null;
    tiktok_url: string | null;

    // Logo
    logo_url: string | null;

    // Settings
    pending_timeout_hours: number;
    footer_description: string | null;

    created_at: string;
    updated_at: string;
}

export interface PropertyImage {
    id: string;
    property_id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    created_at: string;
}

export interface Booking {
    id: string;
    property_id: string;
    guest_name: string | null;
    guest_phone: string | null;
    start_date: string;
    end_date: string;
    num_guests: number;
    room_count: RoomCount;
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
    room_count: RoomCount;
    total_price: number;
    add_ons?: BookingAddOn[];
    notes?: string;
}

export interface UpdatePropertyInput {
    name?: string;
    price_3_rooms?: number;
    price_4_rooms?: number;
    price_6_rooms?: number;
    description?: string;
    whatsapp_number?: string;
    max_guests?: number;
    instagram_url?: string | null;
    facebook_url?: string | null;
    tiktok_url?: string | null;
    logo_url?: string | null;
    pending_timeout_hours?: number;
    footer_description?: string;
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

export interface CreatePropertyImageInput {
    property_id: string;
    url: string;
    alt_text?: string;
    sort_order?: number;
}

export interface UpdatePropertyImageInput {
    url?: string;
    alt_text?: string;
    sort_order?: number;
}

// Amenities
export interface Amenity {
    id: string;
    property_id: string;
    name: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export interface CreateAmenityInput {
    property_id: string;
    name: string;
    icon?: string;
}

export interface UpdateAmenityInput {
    name?: string;
    icon?: string;
    is_active?: boolean;
    sort_order?: number;
}
