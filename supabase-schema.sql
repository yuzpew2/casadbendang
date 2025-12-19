-- Casa Bendang Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table (single property for now)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Casa Bendang',
    price_per_night INT NOT NULL DEFAULT 350,
    cleaning_fee INT NOT NULL DEFAULT 50,
    description TEXT DEFAULT 'Experience the serene beauty of a modern tropical homestay amidst the lush paddy fields of Malaysia.',
    images TEXT[] DEFAULT ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000'],
    whatsapp_number TEXT DEFAULT '60193452907',
    max_guests INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_phone TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    num_guests INT DEFAULT 1,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'maintenance')) DEFAULT 'pending',
    total_price INT NOT NULL,
    add_ons JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-ons table
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default property
INSERT INTO properties (name, price_per_night, cleaning_fee, description, whatsapp_number)
VALUES (
    'Casa Bendang',
    350,
    50,
    'Experience the serene beauty of a modern tropical homestay amidst the lush paddy fields of Malaysia. Perfect for retreats, family gatherings, and peaceful getaways.',
    '60193452907'
);

-- Get the property ID for add-ons
DO $$
DECLARE
    prop_id UUID;
BEGIN
    SELECT id INTO prop_id FROM properties LIMIT 1;
    
    -- Insert default add-ons
    INSERT INTO add_ons (property_id, name, price) VALUES
        (prop_id, 'BBQ Pit & Charcoal', 30),
        (prop_id, 'Extra Mattress (Queen)', 50),
        (prop_id, 'Early Check-in (10am)', 80),
        (prop_id, 'Late Check-out (4pm)', 80);
END $$;

-- Create indexes for better query performance
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_add_ons_property_id ON add_ons(property_id);

-- Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Public read access for properties (for landing page)
CREATE POLICY "Public can view properties" ON properties
    FOR SELECT USING (true);

-- Public can create pending bookings (for WhatsApp booking flow)
CREATE POLICY "Public can create bookings" ON bookings
    FOR INSERT WITH CHECK (status = 'pending');

-- Public can view add-ons
CREATE POLICY "Public can view add-ons" ON add_ons
    FOR SELECT USING (is_active = true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin full access to properties" ON properties
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to bookings" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to add_ons" ON add_ons
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to get blocked dates (confirmed, pending, or maintenance bookings)
CREATE OR REPLACE FUNCTION get_blocked_dates(prop_id UUID)
RETURNS TABLE (blocked_date DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT generate_series(b.start_date, b.end_date - INTERVAL '1 day', INTERVAL '1 day')::DATE
    FROM bookings b
    WHERE b.property_id = prop_id
    AND b.status IN ('confirmed', 'pending', 'maintenance');
END;
$$ LANGUAGE plpgsql;
