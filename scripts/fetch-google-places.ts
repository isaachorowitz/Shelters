/**
 * Fetches underground parking garages across Israel from Google Places API (New).
 *
 * Strategy: Grid search across Israel with overlapping circles to find
 * all underground parking locations. These serve as bomb shelters.
 *
 * Prerequisites:
 *   - Google Cloud project with Places API (New) enabled
 *   - API key with Places API access
 *   - Set GOOGLE_PLACES_API_KEY environment variable
 *
 * Run: GOOGLE_PLACES_API_KEY=your_key npx tsx scripts/fetch-google-places.ts
 * Output: data/google-places-raw.json
 */

import * as fs from "fs"
import * as path from "path"

const API_KEY = process.env.GOOGLE_PLACES_API_KEY
if (!API_KEY) {
  console.error("ERROR: Set GOOGLE_PLACES_API_KEY environment variable")
  console.error("  Get a key at: https://console.cloud.google.com/apis/credentials")
  console.error("  Enable 'Places API (New)' in your Google Cloud project")
  process.exit(1)
}

const OUTPUT_PATH = path.join(__dirname, "..", "data", "google-places-raw.json")
const API_URL = "https://places.googleapis.com/v1/places:searchNearby"

// Grid of center points covering Israel's populated areas
// Each point searches a 5km radius. Grid spacing ~7km for overlap.
const SEARCH_GRID: { lat: number; lng: number; label: string }[] = [
  // Tel Aviv metro area (dense grid - 3km spacing)
  { lat: 32.060, lng: 34.770, label: "TLV South" },
  { lat: 32.080, lng: 34.775, label: "TLV Center" },
  { lat: 32.100, lng: 34.780, label: "TLV North" },
  { lat: 32.075, lng: 34.795, label: "TLV East" },
  { lat: 32.055, lng: 34.760, label: "Jaffa" },
  { lat: 32.090, lng: 34.810, label: "Ramat Gan" },
  { lat: 32.065, lng: 34.810, label: "Givatayim" },
  { lat: 32.110, lng: 34.835, label: "Bnei Brak" },
  { lat: 32.120, lng: 34.810, label: "Ramat HaSharon" },

  // Holon / Bat Yam
  { lat: 32.020, lng: 34.770, label: "Bat Yam" },
  { lat: 32.010, lng: 34.790, label: "Holon" },

  // Rishon LeZion / Rehovot
  { lat: 31.970, lng: 34.790, label: "Rishon LeZion" },
  { lat: 31.890, lng: 34.810, label: "Rehovot" },

  // Petah Tikva / Hod HaSharon / Kfar Saba
  { lat: 32.090, lng: 34.880, label: "Petah Tikva" },
  { lat: 32.155, lng: 34.890, label: "Hod HaSharon" },
  { lat: 32.180, lng: 34.910, label: "Kfar Saba" },

  // Herzliya / Netanya
  { lat: 32.160, lng: 34.790, label: "Herzliya" },
  { lat: 32.330, lng: 34.860, label: "Netanya" },

  // Ashdod / Ashkelon
  { lat: 31.800, lng: 34.650, label: "Ashdod" },
  { lat: 31.670, lng: 34.570, label: "Ashkelon" },

  // Beer Sheva
  { lat: 31.250, lng: 34.790, label: "Beer Sheva" },
  { lat: 31.265, lng: 34.810, label: "Beer Sheva East" },

  // Jerusalem
  { lat: 31.770, lng: 35.210, label: "Jerusalem Center" },
  { lat: 31.790, lng: 35.230, label: "Jerusalem North" },
  { lat: 31.750, lng: 35.220, label: "Jerusalem South" },
  { lat: 31.780, lng: 35.240, label: "Jerusalem East" },

  // Haifa
  { lat: 32.790, lng: 34.990, label: "Haifa Center" },
  { lat: 32.810, lng: 34.990, label: "Haifa North" },
  { lat: 32.770, lng: 34.980, label: "Haifa South" },

  // Northern cities
  { lat: 32.700, lng: 35.300, label: "Nazareth" },
  { lat: 32.820, lng: 35.490, label: "Tiberias" },
  { lat: 32.970, lng: 35.500, label: "Safed" },

  // Modi'in
  { lat: 31.900, lng: 34.950, label: "Modi'in" },
]

interface GooglePlace {
  id: string
  displayName?: { text: string; languageCode: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  types?: string[]
  primaryType?: string
}

interface NearbySearchResponse {
  places?: GooglePlace[]
}

interface PlaceResult {
  google_place_id: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
  search_label: string
}

async function searchNearby(
  lat: number,
  lng: number,
  label: string,
  radiusMeters = 5000
): Promise<PlaceResult[]> {
  const body = {
    includedTypes: ["parking"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    languageCode: "he",
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.parkingOptions",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.warn(`  WARNING: API error for ${label}: ${res.status} - ${errorText.substring(0, 200)}`)
    return []
  }

  const data: NearbySearchResponse = await res.json()
  const places = data.places ?? []

  return places
    .filter((p) => {
      // Filter for underground / multi-level parking (likely shelters)
      const types = p.types ?? []
      const name = p.displayName?.text?.toLowerCase() ?? ""
      const isUnderground =
        name.includes("תת") || // underground in Hebrew
        name.includes("חניון") || // parking in Hebrew
        name.includes("underground") ||
        name.includes("מרתף") || // basement
        types.includes("parking")
      return isUnderground && p.location
    })
    .map((p) => ({
      google_place_id: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      lat: Math.round(p.location!.latitude * 1e6) / 1e6,
      lng: Math.round(p.location!.longitude * 1e6) / 1e6,
      types: p.types ?? [],
      search_label: label,
    }))
}

// Also search for bomb shelters explicitly
async function searchBombShelters(
  lat: number,
  lng: number,
  label: string
): Promise<PlaceResult[]> {
  // Use Text Search for "מקלט" (shelter) since there's no built-in type
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.types",
    },
    body: JSON.stringify({
      textQuery: "מקלט ציבורי",
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 5000,
        },
      },
      languageCode: "he",
    }),
  })

  if (!res.ok) return []

  const data: NearbySearchResponse = await res.json()
  return (data.places ?? [])
    .filter((p) => p.location)
    .map((p) => ({
      google_place_id: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      lat: Math.round(p.location!.latitude * 1e6) / 1e6,
      lng: Math.round(p.location!.longitude * 1e6) / 1e6,
      types: p.types ?? [],
      search_label: label,
    }))
}

async function main() {
  console.log("Fetching parking & shelters from Google Places API...")
  console.log(`Grid points: ${SEARCH_GRID.length}`)

  const allResults: PlaceResult[] = []
  const seenIds = new Set<string>()

  for (let i = 0; i < SEARCH_GRID.length; i++) {
    const point = SEARCH_GRID[i]
    console.log(`[${i + 1}/${SEARCH_GRID.length}] ${point.label} (${point.lat}, ${point.lng})`)

    // Search for parking
    const parkingResults = await searchNearby(point.lat, point.lng, point.label)
    for (const r of parkingResults) {
      if (!seenIds.has(r.google_place_id)) {
        seenIds.add(r.google_place_id)
        allResults.push(r)
      }
    }

    // Search for bomb shelters  
    const shelterResults = await searchBombShelters(point.lat, point.lng, point.label)
    for (const r of shelterResults) {
      if (!seenIds.has(r.google_place_id)) {
        seenIds.add(r.google_place_id)
        allResults.push(r)
      }
    }

    // Rate limiting: 200ms between requests (well within free tier limits)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2))

  console.log(`\nTotal unique places: ${allResults.length}`)
  console.log(`Output: ${OUTPUT_PATH}`)
}

main().catch(console.error)
