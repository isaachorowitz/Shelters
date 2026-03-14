/**
 * Converts the master GeoJSON dataset into an optimized static JSON file
 * for use in the Next.js application.
 *
 * Input:  docs/israel_shelters_MASTER_v2.geojson
 * Output: data/shelters.json
 *
 * The output format is an array of shelter objects optimized for:
 *   - Fast loading (compact keys)
 *   - Client-side filtering (normalized type field)
 *   - Map rendering (lat/lng instead of GeoJSON coordinates)
 *
 * Run: npx tsx scripts/build-shelter-data.ts
 */

import * as fs from "fs"
import * as path from "path"

const INPUT_PATH = path.join(__dirname, "..", "docs", "israel_shelters_MASTER_v2.geojson")
const OUTPUT_PATH = path.join(__dirname, "..", "data", "shelters.json")

// All known type normalizations from every source
const TYPE_NORMALIZE: Record<string, string> = {
  // English
  "public shelter": "public_shelter",
  "bomb shelter": "bomb_shelter",
  "bomb_shelter": "bomb_shelter",
  "underground parking": "underground_parking",
  "underground_parking": "underground_parking",
  "fortified_space": "fortified_space",
  "reinforced_shelter": "reinforced_shelter",
  "carmelit_station": "carmelit_station",
  "kindergarten": "kindergarten",
  "school": "school",
  "distributed": "distributed",
  "building": "building",
  "bunker": "bomb_shelter",
  "changing_rooms": "public_shelter",
  // Hebrew
  "מקלט ציבורי": "public_shelter",
  "מקלט": "public_shelter",
  "חניון תת-קרקעי": "underground_parking",
  "מיגונית": "fortified_space",
  "מחסה - הכי מוגן שיש": "reinforced_shelter",
  "מחסה": "reinforced_shelter",
  "גני ילדים": "kindergarten",
  "תחנת כרמלית": "carmelit_station",
  "בית ספר (מתקן קליטה)": "school",
  // From OSM sources
  "bomb_shelter": "bomb_shelter",
  // From Google Places  
  "parking": "underground_parking",
  // Legacy
  "School": "school",
  "Distributed": "distributed",
  "Meguniot": "fortified_space",
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

interface GeoFeature {
  type: "Feature"
  geometry: {
    type: string
    coordinates: number[]
  }
  properties: Record<string, unknown>
}

interface GeoJSON {
  type: "FeatureCollection"
  features: GeoFeature[]
}

interface Shelter {
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
  sources?: string
}

function normalizeType(raw: unknown): string {
  if (!raw || typeof raw !== "string") return "public_shelter"
  const trimmed = raw.trim()
  const normalized = TYPE_NORMALIZE[trimmed] ?? trimmed.toLowerCase().replace(/\s+/g, "_")
  return VALID_TYPES.has(normalized) ? normalized : "public_shelter"
}

function main() {
  console.log("Building shelter data from GeoJSON master file...")

  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`ERROR: Input file not found: ${INPUT_PATH}`)
    console.error("Make sure docs/israel_shelters_MASTER_v2.geojson exists")
    process.exit(1)
  }

  const raw: GeoJSON = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"))
  console.log(`Loaded ${raw.features.length} features from GeoJSON`)

  const shelters: Shelter[] = []
  let skipped = 0

  for (const feature of raw.features) {
    if (feature.geometry.type !== "Point") {
      skipped++
      continue
    }

    const [lngRaw, latRaw] = feature.geometry.coordinates
    const lat = Math.round(latRaw * 1e6) / 1e6
    const lng = Math.round(lngRaw * 1e6) / 1e6

    // Validate coordinates are within Israel
    if (lat < 29.4 || lat > 33.5 || lng < 34.0 || lng > 35.9 || lat === 0 || lng === 0) {
      skipped++
      continue
    }

    const p = feature.properties
    const shelter: Shelter = {
      id: shelters.length + 1,
      lat,
      lng,
      type: normalizeType(p.type ?? p.shelter_type ?? p.Type),
    }

    if (p.name) shelter.name = String(p.name)
    if (p.address) shelter.address = String(p.address)
    if (p.neighborhood) shelter.neighborhood = String(p.neighborhood)
    if (p.city_en) shelter.city_en = String(p.city_en)
    if (p.city_he) shelter.city_he = String(p.city_he)
    if (p.sources) shelter.sources = String(p.sources)
    if (p.capacity) {
      const cap = parseInt(String(p.capacity), 10)
      if (cap > 0) shelter.capacity = cap
    }

    shelters.push(shelter)
  }

  console.log(`\nProcessed: ${shelters.length} valid shelters (skipped ${skipped})`)

  // Type distribution
  const typeCounts: Record<string, number> = {}
  for (const s of shelters) {
    typeCounts[s.type] = (typeCounts[s.type] ?? 0) + 1
  }
  console.log("Type distribution:")
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`)
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(shelters))
  console.log(`\nOutput: ${outputPath}`)
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB`)
}

main()
