/**
 * Master data pipeline: merges shelters from ALL sources into a single
 * deduplicated, validated dataset.
 *
 * Sources (in priority order):
 *   1. Existing GeoJSON master file (docs/israel_shelters_MASTER_v2.geojson)
 *   2. OSM shelters & underground parking (data/osm-shelters-raw.json)
 *   3. Google Places results (data/google-places-raw.json) — optional
 *
 * Deduplication strategy:
 *   - Round coordinates to 4 decimal places (~11m accuracy)
 *   - If two shelters have the same 4-decimal coords, merge metadata
 *   - Prefer government/NGO source names over generated names
 *
 * Validation:
 *   - Coordinates must be within Israel bounds (29.4–33.5 lat, 34.0–35.9 lng)
 *   - No null/zero coordinates
 *   - Types must be from a controlled vocabulary
 *
 * Run: npx tsx scripts/merge-all-sources.ts
 * Output: data/shelters.json (overwrites existing)
 */

import * as fs from "fs"
import * as path from "path"

// ─── Types ─────────────────────────────────────────────────────────

interface GeoFeature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

interface GeoJSON {
  type: "FeatureCollection"
  features: GeoFeature[]
}

interface OsmShelter {
  osm_type: string
  osm_id: number
  lat: number
  lng: number
  name?: string
  name_he?: string
  name_en?: string
  shelter_type: string
  capacity?: number
  access?: string
  operator?: string
  source_category: string
}

interface GooglePlace {
  google_place_id: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
}

interface MergedShelter {
  id: number
  lat: number
  lng: number
  type: string
  name?: string
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  capacity?: number
  sources: string
}

// ─── Constants ─────────────────────────────────────────────────────

const GEOJSON_PATH = path.join(__dirname, "..", "docs", "israel_shelters_MASTER_v2.geojson")
const OSM_PATH = path.join(__dirname, "..", "data", "osm-shelters-raw.json")
const GOOGLE_PATH = path.join(__dirname, "..", "data", "google-places-raw.json")
const OUTPUT_PATH = path.join(__dirname, "..", "data", "shelters.json")

// Israel bounds (generous)
const LAT_MIN = 29.4
const LAT_MAX = 33.5
const LNG_MIN = 34.0
const LNG_MAX = 35.9

// Type normalization map
const TYPE_NORMALIZE: Record<string, string> = {
  "public shelter": "public_shelter",
  "מקלט ציבורי": "public_shelter",
  "מקלט": "public_shelter",
  bomb_shelter: "bomb_shelter",
  bomb: "bomb_shelter",
  "bomb shelter": "bomb_shelter",
  "underground parking": "underground_parking",
  underground_parking: "underground_parking",
  "חניון תת-קרקעי": "underground_parking",
  parking: "underground_parking",
  School: "school",
  school: "school",
  "בית ספר (מתקן קליטה)": "school",
  Distributed: "distributed",
  distributed: "distributed",
  Meguniot: "fortified_space",
  fortified_space: "fortified_space",
  "מיגונית": "fortified_space",
  "מחסה - הכי מוגן שיש": "reinforced_shelter",
  "מחסה": "reinforced_shelter",
  reinforced_shelter: "reinforced_shelter",
  "גני ילדים": "kindergarten",
  kindergarten: "kindergarten",
  "תחנת כרמלית": "carmelit_station",
  carmelit_station: "carmelit_station",
  building: "building",
  bunker: "bomb_shelter",
  changing_rooms: "public_shelter",
}

const VALID_TYPES = new Set([
  "public_shelter",
  "bomb_shelter",
  "underground_parking",
  "school",
  "distributed",
  "fortified_space",
  "reinforced_shelter",
  "kindergarten",
  "carmelit_station",
  "building",
])

// City names: English → Hebrew
const CITY_HEBREW: Record<string, string> = {
  Jerusalem: "ירושלים",
  "Tel Aviv": "תל אביב",
  Haifa: "חיפה",
  "Beer Sheva": "באר שבע",
  "Be'er Sheva": "באר שבע",
  Ashdod: "אשדוד",
  Ashkelon: "אשקלון",
  Netanya: "נתניה",
  Petah: "פתח תקווה",
  Rehovot: "רחובות",
  Rishon: "ראשון לציון",
  Herzliya: "הרצליה",
}

// ─── Helpers ────────────────────────────────────────────────────

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`
}

function normalizeType(raw: unknown): string {
  if (!raw || typeof raw !== "string") return "public_shelter"
  const normalized = TYPE_NORMALIZE[raw.trim()] ?? raw.trim().toLowerCase().replace(/\s+/g, "_")
  return VALID_TYPES.has(normalized) ? normalized : "public_shelter"
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    lat >= LAT_MIN && lat <= LAT_MAX &&
    lng >= LNG_MIN && lng <= LNG_MAX &&
    lat !== 0 && lng !== 0
  )
}

// ─── Loaders ────────────────────────────────────────────────────

function loadGeoJSON(): MergedShelter[] {
  if (!fs.existsSync(GEOJSON_PATH)) {
    console.warn("  WARNING: GeoJSON master file not found, skipping")
    return []
  }

  const raw: GeoJSON = JSON.parse(fs.readFileSync(GEOJSON_PATH, "utf-8"))
  const shelters: MergedShelter[] = []

  for (const feature of raw.features) {
    if (feature.geometry.type !== "Point") continue

    const [lngRaw, latRaw] = feature.geometry.coordinates
    const lat = Math.round(latRaw * 1e6) / 1e6
    const lng = Math.round(lngRaw * 1e6) / 1e6

    if (!isValidCoord(lat, lng)) continue

    const p = feature.properties
    const shelter: MergedShelter = {
      id: 0, // assigned later
      lat,
      lng,
      type: normalizeType(p.type ?? p.shelter_type ?? p.Type),
      sources: String(p.sources ?? p.source ?? "geojson"),
    }

    if (p.name) shelter.name = String(p.name)
    if (p.address) shelter.address = String(p.address)
    if (p.neighborhood) shelter.neighborhood = String(p.neighborhood)
    if (p.city_en) shelter.city_en = String(p.city_en)
    if (p.city_he) shelter.city_he = String(p.city_he)
    if (p.capacity) {
      const cap = parseInt(String(p.capacity), 10)
      if (cap > 0) shelter.capacity = cap
    }

    shelters.push(shelter)
  }

  return shelters
}

function loadOsmShelters(): MergedShelter[] {
  if (!fs.existsSync(OSM_PATH)) {
    console.warn("  INFO: No OSM data found (run fetch-osm-shelters.ts first)")
    return []
  }

  const raw: OsmShelter[] = JSON.parse(fs.readFileSync(OSM_PATH, "utf-8"))
  return raw
    .filter((s) => isValidCoord(s.lat, s.lng))
    .map((s) => ({
      id: 0,
      lat: s.lat,
      lng: s.lng,
      type: normalizeType(s.shelter_type),
      name: s.name_en ?? s.name_he ?? s.name,
      sources: `osm:${s.osm_type}/${s.osm_id}`,
    }))
}

function loadGooglePlaces(): MergedShelter[] {
  if (!fs.existsSync(GOOGLE_PATH)) {
    console.warn("  INFO: No Google Places data found (run fetch-google-places.ts first)")
    return []
  }

  const raw: GooglePlace[] = JSON.parse(fs.readFileSync(GOOGLE_PATH, "utf-8"))
  return raw
    .filter((p) => isValidCoord(p.lat, p.lng))
    .map((p) => ({
      id: 0,
      lat: p.lat,
      lng: p.lng,
      type: "underground_parking",
      name: p.name || undefined,
      address: p.address || undefined,
      sources: `google:${p.google_place_id}`,
    }))
}

// ─── Main ────────────────────────────────────────────────────────

function main() {
  console.log("\n=== Shelter Data Merge Pipeline ===")
  console.log("=================================\n")

  // Load all sources
  console.log("Loading sources...")
  console.log("  1. GeoJSON master file...")
  const geojsonShelters = loadGeoJSON()
  console.log(`     Loaded ${geojsonShelters.length} shelters`)

  console.log("  2. OSM shelters...")
  const osmShelters = loadOsmShelters()
  console.log(`     Loaded ${osmShelters.length} OSM shelters`)

  console.log("  3. Google Places...")
  const googleShelters = loadGooglePlaces()
  console.log(`     Loaded ${googleShelters.length} Google Places`)

  // Merge with deduplication
  console.log("\nMerging and deduplicating...")
  const coordMap = new Map<string, MergedShelter>()

  // Priority: GeoJSON (most authoritative) > OSM > Google
  for (const shelter of [...geojsonShelters, ...osmShelters, ...googleShelters]) {
    const key = coordKey(shelter.lat, shelter.lng)

    if (coordMap.has(key)) {
      // Merge: keep existing (higher priority) but add source info
      const existing = coordMap.get(key)!
      if (!existing.sources.includes(shelter.sources)) {
        existing.sources = `${existing.sources},${shelter.sources}`
      }
      // Fill in missing fields from lower-priority source
      if (!existing.name && shelter.name) existing.name = shelter.name
      if (!existing.address && shelter.address) existing.address = shelter.address
      if (!existing.capacity && shelter.capacity) existing.capacity = shelter.capacity
    } else {
      coordMap.set(key, { ...shelter })
    }
  }

  // Assign sequential IDs
  const merged = Array.from(coordMap.values())
  merged.forEach((s, i) => (s.id = i + 1))

  // Stats
  const typeCounts: Record<string, number> = {}
  for (const s of merged) {
    typeCounts[s.type] = (typeCounts[s.type] ?? 0) + 1
  }

  console.log(`\nMerge complete!`)
  console.log(`  Total shelters: ${merged.length}`)
  console.log("  By type:")
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type}: ${count}`)
  }

  const multiSource = merged.filter((s) => s.sources.includes(",")).length
  console.log(`  Multi-source (verified): ${multiSource}`)

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2))
  console.log(`\nOutput: ${OUTPUT_PATH}`)
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(0)} KB`)
}

main()
