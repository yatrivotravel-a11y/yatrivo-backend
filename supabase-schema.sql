-- Yatrivo Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (auth.users is built-in)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Categories table
CREATE TABLE IF NOT EXISTS trip_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_name TEXT NOT NULL,
  city TEXT NOT NULL,
  image_url TEXT NOT NULL,
  trip_category_id UUID REFERENCES trip_categories(id) ON DELETE CASCADE,
  trip_category_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour Packages table
CREATE TABLE IF NOT EXISTS tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_name TEXT NOT NULL,
  city TEXT NOT NULL,
  price_range TEXT NOT NULL,
  trip_category_id UUID REFERENCES trip_categories(id) ON DELETE CASCADE,
  trip_category_name TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  overview TEXT NOT NULL,
  tour_highlights TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(trip_category_id);
CREATE INDEX IF NOT EXISTS idx_destinations_city ON destinations(city);
CREATE INDEX IF NOT EXISTS idx_packages_category ON tour_packages(trip_category_id);
CREATE INDEX IF NOT EXISTS idx_packages_city ON tour_packages(city);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trip Categories: Public read, authenticated write
CREATE POLICY "Anyone can view trip categories" ON trip_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert trip categories" ON trip_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update trip categories" ON trip_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete trip categories" ON trip_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Destinations: Public read, authenticated write
CREATE POLICY "Anyone can view destinations" ON destinations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert destinations" ON destinations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update destinations" ON destinations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete destinations" ON destinations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Tour Packages: Public read, authenticated write
CREATE POLICY "Anyone can view tour packages" ON tour_packages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tour packages" ON tour_packages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tour packages" ON tour_packages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tour packages" ON tour_packages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_categories_updated_at BEFORE UPDATE ON trip_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_packages_updated_at BEFORE UPDATE ON tour_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
