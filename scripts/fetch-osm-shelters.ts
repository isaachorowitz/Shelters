/**
 * Fetches ALL bomb shelters and underground parking from OpenStreetMap
 * via the Overpass API. This catches shelters the community has mapped
 * that aren't in any government dataset.
 *
 * Queries:
 *  1. amenity=shelter + shelter_type=bomb_shelter
 *  2. building=bunker (civilian bunkers)
 *  3. military=bunker + bunker_type=bomb_shelter
 *  4. amenity=parking + parking=underground (usable as shelter)
 *
 * Run: npx tsx scripts/fetch-osm-shelters.ts
 * Output: data/osm-shelters-raw.json
 */

import * as fs from "fs"
import * as path from "path"

const OVERPASS_URL = "https://overpass-api.de/api/interpreter"
const OUTPUT_PATH = path.join(__dirname, "..", "data", "osm-shelters-raw.json")

// Israel bounding box (generous, includes Golan Heights)
const ISRAEL_BBOX = "29.4,34.0,33.5,35.9"

interface OverpassElement {
  type: "node" | "way" | "relation"
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  const fullQuery = `[out:json][timeout:120];${query}`
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(fullQuery)}`,
  })

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`)
  }

  const data: OverpassResponse = await res.json()
  return data.elements
}

function getCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.type === "node" && el.lat != null && el.lon != null) {
    return { lat: el.lat, lon: el.lon }
  }
  if (el.center) {
    return { lat: el.center.lat, lon: el.center.lon }
  }
  return null
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
  location?: string
  source_category: "bomb_shelter" | "bunker" | "underground_parking"
}

async function main() {
  console.log("Fetching bomb shelters from OpenStreetMap...")

  // Query 1: amenity=shelter + shelter_type=bomb_shelter
  console.log("  Query 1: shelter_type=bomb_shelter...")
  const shelters = await queryOverpass(`
    (
      node["amenity"="shelter"]["shelter_type"="bomb_shelter"](${ISRAEL_BBOX});
      way["amenity"="shelter"]["shelter_type"="bomb_shelter"](${ISRAEL_BBOX});
    );
    out center body;
  `)
  console.log(`    Found ${shelters.length} elements`)

  // Query 2: building=bunker (civilian)
  console.log("  Query 2: building=bunker...")
  const bunkers = await queryOverpass(`
    (
      node["building"="bunker"](${ISRAEL_BBOX});
      way["building"="bunker"](${ISRAEL_BBOX});
    );
    out center body;
  `)
  console.log(`    Found ${bunkers.length} elements`)

  // Query 3: military=bunker + bunker_type=bomb_shelter
  console.log("  Query 3: military=bunker + bunker_type=bomb_shelter...")
  const milBunkers = await queryOverpass(`
    (
      node["military"="bunker"]["bunker_type"="bomb_shelter"](${ISRAEL_BBOX});
      way["military"="bunker"]["bunker_type"="bomb_shelter"](${ISRAEL_BBOX});
    );
    out center body;
  `)
  console.log(`    Found ${milBunkers.length} elements`)

  // Query 4: Underground parking
  console.log("  Query 4: underground parking...")
  const parking = await queryOverpass(`
    (
      node["amenity"="parking"]["parking"="underground"](${ISRAEL_BBOX});
      way["amenity"="parking"]["parking"="underground"](${ISRAEL_BBOX});
      relation["amenity"="parking"]["parking"="underground"](${ISRAEL_BBOX});
    );
    out center body;
  `)
  console.log(`    Found ${parking.length} elements`)

  // Deduplicate by OSM ID
  const seen = new Set<string>()
  const results: OsmShelter[] = []

  function processElements(
    elements: OverpassElement[],
    category: OsmShelter["source_category"]
  ) {
    for (const el of elements) {
      const key = `${el.type}/${el.id}`
      if (seen.has(key)) continue
      seen.add(key)

      const coords = getCoords(el)
      if (!coords) continue

      // Validate Israel bounds
      if (coords.lat < 29.4 || coords.lat > 33.5 || coords.lon < 34.0 || coords.lon > 35.9) {
        continue
      }

      const tags = el.tags ?? {}
      const shelter: OsmShelter = {
        osm_type: el.type,
        osm_id: el.id,
        lat: Math.round(coords.lat * 1e6) / 1e6,
        lng: Math.round(coords.lon * 1e6) / 1e6,
        shelter_type:
          category === "underground_parking"
            ? "underground_parking"
            : category === "bunker"
            ? "bomb_shelter"
            : "bomb_shelter",
        source_category: category,
      }

      if (tags.name) shelter.name = tags.name
      if (tags["name:he"]) shelter.name_he = tags["name:he"]
      if (tags["name:en"]) shelter.name_en = tags["name:en"]
      if (tags.capacity) {
        const cap = parseInt(tags.capacity, 10)
        if (cap > 0) shelter.capacity = cap
      }
      if (tags.access) shelter.access = tags.access
      if (tags.operator) shelter.operator = tags.operator
      if (tags.location) shelter.location = tags.location

      results.push(shelter)
    }
  }

  processElements(shelters, "bomb_shelter")
  processElements(bunkers, "bunker")
  processElements(milBunkers, "bomb_shelter")
  processElements(parking, "underground_parking")

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))

  console.log(`\nTotal unique OSM elements: ${results.length}`)
  console.log(`  Bomb shelters: ${results.filter((s) => s.source_category === "bomb_shelter").length}`)
  console.log(`  Bunkers: ${results.filter((s) => s.source_category === "bunker").length}`)
  console.log(`  Underground parking: ${results.filter((s) => s.source_category === "underground_parking").length}`)
  console.log(`Output: ${OUTPUT_PATH}`)
}

main().catch(console.error)
