-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create shelters table with PostGIS geometry column
CREATE TABLE IF NOT EXISTS shelters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  geom GEOMETRY(POINT, 4326)
);

-- Create spatial index for performance
CREATE INDEX IF NOT EXISTS idx_shelters_geom ON shelters USING GIST(geom);

-- Disable RLS for public read access
ALTER TABLE shelters DISABLE ROW LEVEL SECURITY;

-- Create function for K-NN (K-Nearest Neighbors) queries
CREATE OR REPLACE FUNCTION get_nearest_shelters(
  user_lng FLOAT,
  user_lat FLOAT,
  result_limit INT DEFAULT 3
)
RETURNS TABLE (
  id INT,
  name VARCHAR,
  type VARCHAR,
  lat FLOAT,
  lon FLOAT,
  meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.type,
    ST_Y(s.geom) as lat,
    ST_X(s.geom) as lon,
    ST_DistanceSphere(s.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)) as meters
  FROM shelters s
  ORDER BY s.geom <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert Tel Aviv shelters
-- These will create the proper PostGIS geom values (WKB format) automatically
INSERT INTO shelters (name, type, geom) VALUES
  -- Central Tel Aviv
  ('Dizengoff Center Emergency Shelter', 'emergency', ST_SetSRID(ST_MakePoint(34.774615, 32.075306), 4326)),
  ('Rabin Square Underground Shelter', 'underground', ST_SetSRID(ST_MakePoint(34.780698, 32.080117), 4326)),
  ('Habima Square Underground', 'underground', ST_SetSRID(ST_MakePoint(34.780443, 32.072823), 4326)),
  ('City Hall Emergency Shelter', 'emergency', ST_SetSRID(ST_MakePoint(34.780556, 32.083889), 4326)),
  
  -- Beach Area
  ('Gordon Beach Emergency Shelter', 'emergency', ST_SetSRID(ST_MakePoint(34.768194, 32.081250), 4326)),
  ('Frishman Beach Safe Point', 'public', ST_SetSRID(ST_MakePoint(34.767306, 32.078722), 4326)),
  ('Bograshov Beach Shelter', 'public', ST_SetSRID(ST_MakePoint(34.766528, 32.075694), 4326)),
  
  -- North Tel Aviv
  ('Tel Aviv Port Safe Haven', 'safe-haven', ST_SetSRID(ST_MakePoint(34.773611, 32.097917), 4326)),
  ('Yarkon Park North Shelter', 'public', ST_SetSRID(ST_MakePoint(34.809500, 32.093444), 4326)),
  ('Tel Aviv University Campus Shelter', 'institutional', ST_SetSRID(ST_MakePoint(34.803444, 32.113306), 4326)),
  ('Ramat Aviv Mall Shelter', 'commercial', ST_SetSRID(ST_MakePoint(34.794722, 32.109444), 4326)),
  
  -- South Tel Aviv
  ('Carmel Market Safe Zone', 'public', ST_SetSRID(ST_MakePoint(34.768111, 32.068111), 4326)),
  ('Neve Tzedek Community Center', 'community', ST_SetSRID(ST_MakePoint(34.764833, 32.061222), 4326)),
  ('Florentin Neighborhood Shelter', 'public', ST_SetSRID(ST_MakePoint(34.769139, 32.055944), 4326)),
  ('Jaffa Port Historic Shelter', 'public', ST_SetSRID(ST_MakePoint(34.750667, 32.053639), 4326)),
  
  -- East Tel Aviv
  ('Sarona Market Emergency Point', 'emergency', ST_SetSRID(ST_MakePoint(34.787639, 32.071389), 4326)),
  ('Azrieli Center Basement Shelter', 'underground', ST_SetSRID(ST_MakePoint(34.791444, 32.074111), 4326)),
  ('Ichilov Hospital Emergency Zone', 'medical', ST_SetSRID(ST_MakePoint(34.787639, 32.082444), 4326)),
  ('HaShalom Train Station Shelter', 'transit', ST_SetSRID(ST_MakePoint(34.793333, 32.073056), 4326)),
  
  -- Additional Strategic Locations
  ('Rothschild Boulevard Shelter', 'underground', ST_SetSRID(ST_MakePoint(34.774833, 32.063917), 4326)),
  ('Ben Gurion Boulevard Safe Point', 'public', ST_SetSRID(ST_MakePoint(34.773889, 32.077500), 4326)),
  ('Kikar HaMedina Underground', 'underground', ST_SetSRID(ST_MakePoint(34.787222, 32.085556), 4326)),
  ('Bavli Neighborhood Shelter', 'residential', ST_SetSRID(ST_MakePoint(34.796944, 32.088611), 4326)),
  ('Park HaYarkon Central', 'public', ST_SetSRID(ST_MakePoint(34.783333, 32.089722), 4326)),
  ('Old North Community Shelter', 'community', ST_SetSRID(ST_MakePoint(34.775278, 32.094444), 4326))
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted correctly
-- You can run this query to see the coordinates:
-- SELECT id, name, type, ST_X(geom) as longitude, ST_Y(geom) as latitude FROM shelters;

-- Alternative table structure if PostGIS is not available
-- (Fallback option with simple lat/lng columns)
/*
CREATE TABLE IF NOT EXISTS shelters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shelters_lat ON shelters(lat);
CREATE INDEX IF NOT EXISTS idx_shelters_lng ON shelters(lng);

-- Sample data for non-PostGIS version (Tel Aviv)
INSERT INTO shelters (name, type, lat, lng) VALUES
  ('Dizengoff Center Emergency Shelter', 'emergency', 32.075306, 34.774615),
  ('Tel Aviv Port Safe Haven', 'safe-haven', 32.097917, 34.773611),
  ('Rabin Square Underground Shelter', 'underground', 32.080117, 34.780698),
  ('Sarona Market Emergency Point', 'emergency', 32.071389, 34.787639),
  ('Yarkon Park North Shelter', 'public', 32.093444, 34.809500);
*/ 