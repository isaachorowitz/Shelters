-- ================================================================
-- SHELTER NAVIGATOR: Production Database Schema
-- ================================================================
-- Run this in Supabase SQL Editor to set up all tables and indexes
-- Project: Shelter Navigator (isaachorowitz/Shelters)
-- Last updated: March 2026
-- ================================================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Main shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id              BIGSERIAL PRIMARY KEY,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  type            TEXT NOT NULL DEFAULT 'public_shelter',
  name            TEXT,
  address         TEXT,
  neighborhood    TEXT,
  city_en         TEXT,
  city_he         TEXT,
  capacity        INTEGER,
  sources         TEXT,
  geom            GEOMETRY(Point, 4326),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index (critical for proximity queries)
CREATE INDEX IF NOT EXISTS shelters_geom_idx
  ON shelters USING GIST (geom);

-- Covering indexes for common filter combinations
CREATE INDEX IF NOT EXISTS shelters_type_idx ON shelters (type);
CREATE INDEX IF NOT EXISTS shelters_city_idx ON shelters (city_en);
CREATE INDEX IF NOT EXISTS shelters_lat_lng_idx ON shelters (lat, lng);

-- Auto-populate geom from lat/lng
CREATE OR REPLACE FUNCTION set_shelter_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shelter_geom_trigger ON shelters;
CREATE TRIGGER shelter_geom_trigger
  BEFORE INSERT OR UPDATE OF lat, lng ON shelters
  FOR EACH ROW EXECUTE FUNCTION set_shelter_geom();

-- Row Level Security (public read, authenticated write)
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read shelters" ON shelters;
CREATE POLICY "Public can read shelters"
  ON shelters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can insert shelters" ON shelters;
CREATE POLICY "Authenticated can insert shelters"
  ON shelters FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update shelters" ON shelters;
CREATE POLICY "Authenticated can update shelters"
  ON shelters FOR UPDATE
  TO authenticated
  USING (true);

-- Nearby shelters function (returns shelters within radius, sorted by distance)
CREATE OR REPLACE FUNCTION get_nearby_shelters(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 1.0,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  type TEXT,
  name TEXT,
  address TEXT,
  city_en TEXT,
  city_he TEXT,
  capacity INTEGER,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.lat,
    s.lng,
    s.type,
    s.name,
    s.address,
    s.city_en,
    s.city_he,
    s.capacity,
    ST_Distance(
      s.geom::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000.0 AS distance_km
  FROM shelters s
  WHERE ST_DWithin(
    s.geom::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================================
-- VERIFICATION QUERIES (run after import to check data health)
-- ================================================================
-- SELECT COUNT(*) as total FROM shelters;
-- SELECT type, COUNT(*) as count FROM shelters GROUP BY type ORDER BY count DESC;
-- SELECT city_en, COUNT(*) as count FROM shelters WHERE city_en IS NOT NULL GROUP BY city_en ORDER BY count DESC LIMIT 20;
-- SELECT
--   COUNT(*) as total,
--   COUNT(name) as with_name,
--   COUNT(address) as with_address,
--   COUNT(city_en) as with_city
-- FROM shelters;
