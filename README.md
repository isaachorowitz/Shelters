# ShelterNow PWA design

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/isaacs-projects-56492b44/v0-shelter-now-pwa-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/MXZY7MQy6Sa)

## Overview

ShelterNow is a Progressive Web App that helps users find nearby shelters quickly. It uses geolocation to show the nearest shelters with estimated arrival times.

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- PostgreSQL database with PostGIS extension enabled

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Enable PostGIS extension in your Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Create the shelters table:
```sql
CREATE TABLE shelters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  geom GEOMETRY(POINT, 4326)
);

-- Create spatial index for performance
CREATE INDEX idx_shelters_geom ON shelters USING GIST(geom);

-- Disable RLS for public read access
ALTER TABLE shelters SET (rowsecurity = off);
```

4. Create a PostgreSQL function for K-NN queries:
```sql
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
    ST_Distance(s.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)) as meters
  FROM shelters s
  ORDER BY s.geom <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

5. Insert sample data (optional):
```sql
INSERT INTO shelters (name, type, geom) VALUES
  ('Downtown Emergency Shelter', 'emergency', ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)),
  ('Mission District Center', 'temporary', ST_SetSRID(ST_MakePoint(-122.4138, 37.7599), 4326)),
  ('Bayview Family Shelter', 'family', ST_SetSRID(ST_MakePoint(-122.3890, 37.7249), 4326));
```

### Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Performance Optimization

The app is optimized for sub-200ms API response times on Supabase free tier:

- PostGIS K-NN queries with spatial indexing
- Efficient distance calculations using ST_Distance
- Limited result sets (default 3 shelters)
- Client-side ETA calculations to reduce server load

## Deployment

Your project is live at:

**[https://vercel.com/isaacs-projects-56492b44/v0-shelter-now-pwa-design](https://vercel.com/isaacs-projects-56492b44/v0-shelter-now-pwa-design)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/MXZY7MQy6Sa](https://v0.dev/chat/projects/MXZY7MQy6Sa)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository