-- Migration Script: Add new features
-- Run this if you already have existing tables

-- 1. Add room pricing columns to properties (replacing single price)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS price_3_rooms INT DEFAULT 350,
ADD COLUMN IF NOT EXISTS price_4_rooms INT DEFAULT 450,
ADD COLUMN IF NOT EXISTS price_6_rooms INT DEFAULT 650;

-- 2. Add social media columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- 3. Add logo column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 4. Add pending timeout setting (hours before auto-cancel)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS pending_timeout_hours INT DEFAULT 24;

-- 4. Add room_count to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS room_count INT DEFAULT 3;

-- 5. Create property_images table (only if not exists)
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create index for property_images
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON property_images(sort_order);

-- 7. Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for property_images
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Public can view property_images') THEN
        CREATE POLICY "Public can view property_images" ON property_images FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Admin full access to property_images') THEN
        CREATE POLICY "Admin full access to property_images" ON property_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 9. Add footer_description column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS footer_description TEXT;

-- 10. Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Check',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Index for amenities
CREATE INDEX IF NOT EXISTS idx_amenities_property_id ON amenities(property_id);

-- 12. Enable RLS on amenities
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies for amenities
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amenities' AND policyname = 'Public can view amenities') THEN
        CREATE POLICY "Public can view amenities" ON amenities FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amenities' AND policyname = 'Admin full access to amenities') THEN
        CREATE POLICY "Admin full access to amenities" ON amenities FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 14. IMPORTANT: Storage bucket policies (run these in SQL editor)
-- If images are showing 400 errors, you need to add these policies:

-- For public read access to images:
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES ('Public read', 'property-images', '{"operation": "SELECT", "role": "anon"}');

-- Or run this SQL:
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
-- CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images');
-- CREATE POLICY "Auth delete" ON storage.objects FOR DELETE USING (bucket_id = 'property-images');

SELECT 'Migration completed successfully! Remember to configure storage bucket policies.' as status;

