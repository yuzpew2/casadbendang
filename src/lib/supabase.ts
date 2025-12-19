import { createBrowserClient } from '@supabase/ssr';
import type {
    Property,
    PropertyImage,
    Booking,
    AddOn,
    CreateBookingInput,
    UpdatePropertyInput,
    CreateAddOnInput,
    UpdateAddOnInput,
    CreatePropertyImageInput,
    UpdatePropertyImageInput,
    BookingStatus,
    RoomCount
} from '@/types/database';

// Browser client for client components
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ============ PROPERTY FUNCTIONS ============

export async function getProperty(): Promise<Property | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching property:', error);
        return null;
    }
    return data;
}

export async function updateProperty(id: string, updates: UpdatePropertyInput): Promise<Property | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating property:', error);
        return null;
    }
    return data;
}

// ============ PROPERTY IMAGES FUNCTIONS ============

export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching property images:', error);
        return [];
    }
    return data || [];
}

export async function createPropertyImage(input: CreatePropertyImageInput): Promise<PropertyImage | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('property_images')
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error('Error creating property image:', error);
        return null;
    }
    return data;
}

export async function updatePropertyImage(id: string, updates: UpdatePropertyImageInput): Promise<PropertyImage | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('property_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating property image:', error);
        return null;
    }
    return data;
}

export async function deletePropertyImage(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting property image:', error);
        return false;
    }
    return true;
}

export async function reorderPropertyImages(images: { id: string; sort_order: number }[]): Promise<boolean> {
    const supabase = createClient();

    for (const img of images) {
        const { error } = await supabase
            .from('property_images')
            .update({ sort_order: img.sort_order })
            .eq('id', img.id);

        if (error) {
            console.error('Error reordering images:', error);
            return false;
        }
    }
    return true;
}

// ============ BOOKING FUNCTIONS ============

export async function getBlockedDates(propertyId: string): Promise<Date[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending', 'maintenance']);

    if (error) {
        console.error('Error fetching blocked dates:', error);
        return [];
    }

    const blockedDates: Date[] = [];
    data?.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);

        const current = new Date(start);
        while (current < end) {
            blockedDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
    });

    return blockedDates;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            property_id: input.property_id,
            guest_name: input.guest_name || null,
            guest_phone: input.guest_phone || null,
            start_date: input.start_date,
            end_date: input.end_date,
            num_guests: input.num_guests,
            room_count: input.room_count,
            total_price: input.total_price,
            add_ons: input.add_ons || [],
            notes: input.notes || null,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating booking:', error);
        return null;
    }
    return data;
}

export async function getBookings(propertyId: string): Promise<Booking[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
    return data || [];
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating booking status:', error);
        return null;
    }
    return data;
}

export async function deleteBooking(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting booking:', error);
        return false;
    }
    return true;
}

export async function createMaintenanceBlock(
    propertyId: string,
    startDate: string,
    endDate: string,
    notes?: string
): Promise<Booking | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            property_id: propertyId,
            start_date: startDate,
            end_date: endDate,
            num_guests: 0,
            room_count: 3,
            total_price: 0,
            status: 'maintenance',
            notes: notes || 'Maintenance block'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating maintenance block:', error);
        return null;
    }
    return data;
}

// ============ ADD-ON FUNCTIONS ============

export async function getAddOns(propertyId: string): Promise<AddOn[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching add-ons:', error);
        return [];
    }
    return data || [];
}

export async function getActiveAddOns(propertyId: string): Promise<AddOn[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching active add-ons:', error);
        return [];
    }
    return data || [];
}

export async function createAddOn(input: CreateAddOnInput): Promise<AddOn | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('add_ons')
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error('Error creating add-on:', error);
        return null;
    }
    return data;
}

export async function updateAddOn(id: string, updates: UpdateAddOnInput): Promise<AddOn | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('add_ons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating add-on:', error);
        return null;
    }
    return data;
}

export async function deleteAddOn(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('add_ons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting add-on:', error);
        return false;
    }
    return true;
}

// ============ STORAGE FUNCTIONS ============

export async function uploadImage(file: File, folder: string = 'images'): Promise<string | null> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading image:', error);
        return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

    return publicUrl;
}

export async function deleteStorageImage(path: string): Promise<boolean> {
    const supabase = createClient();

    // Extract path from URL if it's a full URL
    let filePath = path;
    if (path.includes('property-images/')) {
        filePath = path.split('property-images/')[1];
    }

    const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

    if (error) {
        console.error('Error deleting image from storage:', error);
        return false;
    }
    return true;
}
