/**
 * Converts the master GeoJSON dataset into an optimized static JSON file
 * with normalized bilingual type labels and clean data.
 *
 * Run: npx tsx scripts/build-shelter-data.ts
 */

import * as fs from "fs"
import * as path from "path"

interface GeoFeature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: {
    id: number
    name?: string
    address?: string
    neighborhood?: string
    city?: string
    type?: string
    capacity?: string
    is_public?: boolean
    sources?: string
    notes?: string
  }
}

interface GeoJSON {
  type: "FeatureCollection"
  features: GeoFeature[]
}

// Maps raw type values → normalized key
const TYPE_NORMALIZE: Record<string, string> = {
  "public shelter": "public_shelter",
  "מקלט ציבורי": "public_shelter",
  "מקלט": "public_shelter",
  bomb_shelter: "bomb_shelter",
  bomb: "bomb_shelter",
  "bomb shelter": "bomb_shelter",
  "underground parking": "underground_parking",
  "חניון תת-קרקעי": "underground_parking",
  School: "school",
  "בית ספר (מתקן קליטה)": "school",
  Distributed: "distributed",
  Meguniot: "fortified_space",
  "מיגונית": "fortified_space",
  "מחסה - הכי מוגן שיש": "reinforced_shelter",
  "מחסה": "reinforced_shelter",
  "גני ילדים": "kindergarten",
  "תחנת כרמלית": "carmelit_station",
  building: "building",
  changing_rooms: "public_shelter",
}

// City names: English → Hebrew
const CITY_HEBREW: Record<string, string> = {
  Jerusalem: "ירושלים",
  "Tel Aviv": "תל אביב",
  Haifa: "חיפה",
  "Beer Sheva": "באר שבע",
  Holon: "חולון",
  Rehovot: "רחובות",
  Herzliya: "הרצליה",
  "Rishon LeZion": "ראשון לציון",
  Ashkelon: "אשקלון",
  Ashdod: "אשדוד",
  "Petah Tikva": "פתח תקווה",
  "Bat Yam": "בת ים",
  "Hod HaSharon": "הוד השרון",
  Netanya: "נתניה",
  "Ramat Gan": "רמת גן",
  "Kfar Saba": "כפר סבא",
}

interface ShelterOutput {
  id: number
  lat: number
  lng: number
  name?: string
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  type: string
  capacity?: number
  sources: string
}

const geojsonPath = path.join(__dirname, "..", "docs", "israel_shelters_MASTER_v2.geojson")
const outputPath = path.join(__dirname, "..", "data", "shelters.json")

const raw: GeoJSON = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"))

const shelters: ShelterOutput[] = []
let skipped = 0

for (const feature of raw.features) {
  const [lng, lat] = feature.geometry.coordinates
  const p = feature.properties

  // Skip entries with invalid coordinates
  if (!lat || !lng || lat < 29 || lat > 34 || lng < 33 || lng > 37) {
    skipped++
    continue
  }

  const rawType = (p.type ?? "").trim()
  const normalizedType = TYPE_NORMALIZE[rawType] ?? "public_shelter"

  const cityRaw = (p.city ?? "").trim()
  // Some city fields contain Hebrew or misplaced data; clean up
  const cityEn = CITY_HEBREW[cityRaw] ? cityRaw : undefined
  const cityHe = cityEn ? CITY_HEBREW[cityEn] : undefined

  const shelter: ShelterOutput = {
    id: p.id,
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
    type: normalizedType,
    sources: p.sources ?? "",
  }

  const name = (p.name ?? "").replace(/\u200B/g, "").trim()
  if (name) shelter.name = name

  const address = (p.address ?? "").replace(/\u200B/g, "").trim()
  if (address) shelter.address = address

  const neighborhood = (p.neighborhood ?? "").trim()
  if (neighborhood) shelter.neighborhood = neighborhood

  if (cityEn) shelter.city_en = cityEn
  if (cityHe) shelter.city_he = cityHe

  const cap = parseInt(p.capacity ?? "", 10)
  if (cap > 0) shelter.capacity = cap

  shelters.push(shelter)
}

// Sort by id for deterministic output
shelters.sort((a, b) => a.id - b.id)

fs.writeFileSync(outputPath, JSON.stringify(shelters, null, 0))

console.log(`Processed ${raw.features.length} features`)
console.log(`Output: ${shelters.length} shelters`)
console.log(`Skipped: ${skipped} (invalid coordinates)`)

// Stats
const withName = shelters.filter((s) => s.name).length
const withAddress = shelters.filter((s) => s.address).length
const withCapacity = shelters.filter((s) => s.capacity).length
const withCity = shelters.filter((s) => s.city_en).length
console.log(`\nField coverage:`)
console.log(`  Name: ${withName} (${Math.round((withName / shelters.length) * 100)}%)`)
console.log(`  Address: ${withAddress} (${Math.round((withAddress / shelters.length) * 100)}%)`)
console.log(`  Capacity: ${withCapacity} (${Math.round((withCapacity / shelters.length) * 100)}%)`)
console.log(`  City: ${withCity} (${Math.round((withCity / shelters.length) * 100)}%)`)

// Type distribution
const typeCounts: Record<string, number> = {}
for (const s of shelters) {
  typeCounts[s.type] = (typeCounts[s.type] ?? 0) + 1
}
console.log(`\nType distribution:`)
for (const [t, c] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.toString().padStart(5)} ${t}`)
}
