# SHELTER NOW - Bomb Shelter Locator

*Emergency Response PWA for Israel*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/isaacs-projects-56492b44/v0-shelter-now-pwa-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/MXZY7MQy6Sa)

## Overview

SHELTER NOW is a critical emergency response Progressive Web App designed to help people in Israel quickly locate the nearest bomb shelters during missile alerts. Built with urgency and life-saving functionality in mind, it provides real-time navigation to safety with multiple transport mode ETAs.

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
    ST_DistanceSphere(s.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)) as meters
  FROM shelters s
  ORDER BY s.geom <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

5. Run the complete setup script (includes Tel Aviv test data):
```bash
# Run the SQL setup file in your Supabase SQL editor
# This file includes PostGIS setup, table creation, and 25 Tel Aviv shelter locations
# Copy contents from: supabase-setup.sql
```

### Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

**Note:** The app will work without Supabase configuration by using hardcoded Tel Aviv shelter data as a fallback.

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

## Features

- **Real-time Location Tracking**: Continuous GPS updates for accurate positioning
- **Multi-Transport ETAs**: Walking, running, biking, and scooter time estimates
- **Offline Fallback**: Works without database using hardcoded shelter data
- **Mobile-First Design**: Glassmorphism UI optimized for emergency use
- **One-Tap Navigation**: Direct integration with native map apps
- **Visual Route Indicators**: Shows paths to nearest 3 shelters on map
- **Responsive Layout**: Desktop sidebar, mobile bottom panel

## Performance Optimization

The app is optimized for sub-200ms API response times on Supabase free tier:

- PostGIS K-NN queries with spatial indexing
- Efficient distance calculations using ST_DistanceSphere
- Limited result sets (default 5 shelters)
- Client-side ETA calculations to reduce server load
- Fallback to hardcoded data when database is unavailable

## Deployment on Vercel

### Quick Deploy

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables (optional):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app will work without environment variables using the fallback shelter data.

### Build Configuration

No special configuration needed. Vercel will automatically:
- Detect Next.js framework
- Install dependencies with pnpm
- Build and deploy the app

## Development

```bash
# Run with test location (Tel Aviv)
NODE_ENV=development pnpm dev

# The app will use a test location: 32.08771237463072, 34.77489252878912
```

## Security Considerations

- Location data is only used client-side for navigation
- No user data is stored or transmitted
- Supabase connection is read-only (anon key)
- All shelter data is public information

## License

This is an emergency response application intended for public safety in Israel.