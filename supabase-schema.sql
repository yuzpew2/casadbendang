-- Casa Bendang Database Schema (Updated)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table (single property for now)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Casa Bendang',
    
    -- Room-based pricing (3, 4, 6 rooms)
    price_3_rooms INT NOT NULL DEFAULT 350,
    price_4_rooms INT NOT NULL DEFAULT 450,
    price_6_rooms INT NOT NULL DEFAULT 650,
    
    description TEXT DEFAULT 'Experience the serene beauty of a modern tropical homestay amidst the lush paddy fields of Malaysia.',
    whatsapp_number TEXT DEFAULT '60193452907',
    max_guests INT DEFAULT 10,
    
    -- Social media links
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,
    
    -- Logo
    logo_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    room_count INT DEFAULT 3, -- 3, 4, or 6 rooms
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
INSERT INTO properties (name, price_3_rooms, price_4_rooms, price_6_rooms, description, whatsapp_number)
VALUES (
    'Casa Bendang',
    350,
    450,
    650,
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
        
    -- Insert default images
    INSERT INTO property_images (property_id, url, alt_text, sort_order) VALUES
        (prop_id, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000', 'Casa Bendang exterior view', 0),
        (prop_id, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2000', 'Living room', 1);
END $$;

-- Create indexes for better query performance
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_add_ons_property_id ON add_ons(property_id);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_sort_order ON property_images(sort_order);

-- Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Public read access for properties (for landing page)
CREATE POLICY "Public can view properties" ON properties
    FOR SELECT USING (true);

-- Public can create pending bookings (for WhatsApp booking flow)
CREATE POLICY "Public can create bookings" ON bookings
    FOR INSERT WITH CHECK (status = 'pending');

-- Public can view add-ons
CREATE POLICY "Public can view add-ons" ON add_ons
    FOR SELECT USING (is_active = true);

-- Public can view property images
CREATE POLICY "Public can view property_images" ON property_images
    FOR SELECT USING (true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin full access to properties" ON properties
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to bookings" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to add_ons" ON add_ons
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to property_images" ON property_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket for images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

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
