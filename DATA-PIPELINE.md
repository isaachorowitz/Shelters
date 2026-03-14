# Shelter Data Pipeline — Complete Guide

## Overview

The Shelter Now app aggregates bomb shelter data from **12+ sources** across Israel. This document explains every data source, how to fetch/update them, and how the merge pipeline works.

## Current Data Summary

| Metric | Value |
|--------|-------|
| Total shelters | 3,155 (after pipeline expansion) |
| Cities covered | 16 named cities + Negev/Central/North regions |
| Unique sources | 12 verified sources |
| Field: name | 49% coverage |
| Field: address | 38% coverage |
| Field: city | 50% coverage |
| Field: capacity | 13% coverage |

### Coverage Gaps (cities with < 50 shelters)

| City | Current Count | Notes |
|------|--------------|-------|
| Rishon LeZion | 31 | 4th largest city — needs more |
| Ashkelon | 29 | High-threat area — critical |
| Ashdod | 27 | High-threat area — critical |
| Petah Tikva | 16 | 5th largest city — underrepresented |
| Bat Yam | 15 | Dense population — needs more |
| Hod HaSharon | 14 | |
| Netanya | 13 | Major city — significant gap |
| Ramat Gan | 9 | Dense metro area — severe gap |

### What's Missing: 1,341 shelters have NO city assigned

These are mostly from the Bimkom/Negev and OSM datasets. The merge pipeline assigns them to regions (Negev/Central/North) based on latitude.

---

## Data Sources

### 1. Government Sources (highest trust)

#### Jerusalem Municipality (CKAN + DataCity)
- **Source**: `jerusalem.datacity.org.il`
- **Count**: ~598 shelters (412 CKAN + 186 DataCity)
- **Format**: GeoJSON/CSV via CKAN API
- **Key**: `jerusalem_ckan_2025`, `jerusalem_datacity_2025`
- **Update**: Check quarterly

#### Beer Sheva Municipality
- **Source**: `data.gov.il/dataset/shelters-br7`
- **Count**: 253 shelters (156 unique after dedup)
- **Format**: XLSX via data.gov.il CKAN API
- **Key**: `beer_sheva_govil`
- **Update**: Auto-updated on data.gov.il (last: March 2026)

#### Haifa Municipality
- **Source**: `haifa.datacity.org.il`
- **Count**: ~374 shelters (273 DataCity + 101 PDF)
- **Format**: GeoJSON via CKAN API + manual PDF extraction
- **Key**: `haifa_datacity`, `haifa_pdf`
- **Update**: Check quarterly

### 2. NGO Sources

#### Data for Good Israel (miklat.info)
- **Source**: `miklat.info`
- **Count**: 2,084 shelters (largest single source)
- **Coverage**: Nationwide
- **Key**: `miklat_finder_d4g`

#### Bimkom / Negev Research Lab
- **Source**: Field surveys by Bimkom NGO
- **Count**: 613 shelters
- **Coverage**: Negev region (south)
- **Key**: `negev_bimkom`

### 3. Community Sources

#### OpenStreetMap
- **Source**: Overpass API queries
- **Count**: 764 + 96 new bomb shelters + 120 underground parking
- **Tags**: `amenity=shelter + shelter_type=bomb_shelter`, `building=bunker`, `amenity=parking + parking=underground`
- **Key**: `openstreetmap`, `openstreetmap_v2`
- **Script**: `scripts/fetch-osm-shelters.ts`

#### TLV Shelters Community Map
- **Source**: Google MyMaps community project
- **Count**: 314 shelters
- **Key**: `tlv_mymaps`

### 4. Additional Sources (NEW)

#### Google Places API (Underground Parking + Shelters)
- **Query**: Nearby Search for "parking" type + Text Search for "מקלט ציבורי"
- **Grid**: 33 points covering all major Israeli cities
- **Script**: `scripts/fetch-google-places.ts`
- **Requires**: `GOOGLE_PLACES_API_KEY` environment variable
- **Key**: `google_places`

#### Daniel Rosehill Jerusalem Dataset (HuggingFace)
- **Source**: `huggingface.co/datasets/danielrosehill/Jerusalem-Emergency-Shelters-0925`
- **Count**: ~800 Jerusalem shelters (September 2025 update)
- **Notes**: May contain newer data than current Jerusalem sources

---

## Running the Pipeline

### Step 1: Fetch OSM data (no API key needed)

```bash
npx tsx scripts/fetch-osm-shelters.ts
```

Output: `data/osm-shelters-raw.json`

### Step 2: Fetch Google Places data (requires API key)

```bash
GOOGLE_PLACES_API_KEY=your_key npx tsx scripts/fetch-google-places.ts
```

Output: `data/google-places-raw.json`

### Step 3: Audit government sources

```bash
npx tsx scripts/fetch-gov-data.ts
```

Output: `data/gov-data-audit.json`

### Step 4: Merge everything

```bash
npx tsx scripts/merge-all-sources.ts
```

Output: `data/shelters.json`

### Step 5: Build from GeoJSON only (alternative)

```bash
npx tsx scripts/build-shelter-data.ts
```

---

## Deduplication Strategy

The merge pipeline uses **coordinate-based deduplication**:

1. Coordinates are rounded to 4 decimal places (~11m accuracy)
2. Shelters at the same 4-decimal coordinate are considered duplicates
3. When merging duplicates:
   - Existing (government/NGO) data takes priority
   - New sources enrich missing fields
   - Source attribution is appended

---

## Type Taxonomy

| Key | English | Hebrew | Description |
|-----|---------|--------|-------------|
| `public_shelter` | Public Shelter | מקלט ציבורי | Standard public bomb shelter |
| `bomb_shelter` | Bomb Shelter | מקלט | Dedicated bomb shelter / bunker |
| `underground_parking` | Underground Parking | חניון תת-קרקעי | Parking garage usable as shelter |
| `school` | School Shelter | מקלט בית ספר | Shelter in school facility |
| `distributed` | Distributed Shelter | מקלט מבוזר | Distributed across an area |
| `fortified_space` | Fortified Space | מיגונית | Reinforced room (Mamad/Migunonit) |
| `reinforced_shelter` | Reinforced Shelter | מחסה | Best available reinforced structure |
| `kindergarten` | Kindergarten Shelter | מקלט גני ילדים | Shelter in kindergarten |
| `carmelit_station` | Carmelit Station | תחנת כרמלית | Haifa Carmelit metro station |
| `building` | Building Shelter | מקלט מבנה | Shelter within a building |

---

## Production Checklist

- [ ] Run `fetch-osm-shelters.ts` to get latest OSM data
- [ ] Set `GOOGLE_PLACES_API_KEY` and run `fetch-google-places.ts`
- [ ] Run `merge-all-sources.ts` to produce final `shelters.json`
- [ ] Verify shelter count increased (expect 3,000–3,200+)
- [ ] Run `pnpm build` to ensure no TypeScript errors
- [ ] Check Supabase schema matches `supabase-setup.sql`
- [ ] Deploy to Vercel
- [ ] Verify API response at `/api/shelters?lat=32.08&lng=34.78&limit=5`
