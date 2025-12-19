import { z } from 'zod';

// Login form schema
export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Property settings schema
export const propertySettingsSchema = z.object({
    name: z.string().min(1, 'Property name is required'),
    price_per_night: z.number().min(1, 'Price must be at least RM1'),
    cleaning_fee: z.number().min(0, 'Cleaning fee cannot be negative'),
    description: z.string().optional(),
    whatsapp_number: z.string().regex(/^60\d{9,10}$/, 'Enter a valid Malaysian number (e.g., 60193452907)'),
    max_guests: z.number().min(1, 'Must allow at least 1 guest'),
});

export type PropertySettingsFormData = z.infer<typeof propertySettingsSchema>;

// Add-on schema
export const addOnSchema = z.object({
    name: z.string().min(1, 'Add-on name is required'),
    price: z.number().min(0, 'Price cannot be negative'),
});

export type AddOnFormData = z.infer<typeof addOnSchema>;

// Booking schema (for validation before submission)
export const bookingSchema = z.object({
    guest_name: z.string().optional(),
    guest_phone: z.string().optional(),
    start_date: z.string(),
    end_date: z.string(),
    num_guests: z.number().min(1, 'At least 1 guest required'),
    total_price: z.number().min(0),
    add_ons: z.array(z.object({
        name: z.string(),
        price: z.number(),
    })).optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
