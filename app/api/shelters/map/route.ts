import { NextResponse } from "next/server"
import shelterData from "@/data/shelters.json"

interface ShelterEntry {
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

const SHELTERS: ShelterEntry[] = shelterData as ShelterEntry[]

function buildName(s: ShelterEntry): string {
  if (s.name) return s.name
  if (s.address && s.city_he) return `מקלט – ${s.address}, ${s.city_he}`
  if (s.address) return `מקלט – ${s.address}`
  if (s.city_he) return `מקלט ציבורי – ${s.city_he}`
  if (s.city_en) return `Public Shelter – ${s.city_en}`
  return `מקלט #${s.id}`
}

// Lightweight endpoint: returns ALL shelters with coordinates only (no distance computation)
// Used by the map to display every shelter marker regardless of user location
let cachedResponse: string | null = null

export async function GET() {
  if (!cachedResponse) {
    const shelters = SHELTERS.map((s) => ({
      id: s.id,
      name: buildName(s),
      type: s.type,
      lat: s.lat,
      lng: s.lng,
      address: s.address,
      neighborhood: s.neighborhood,
      city_en: s.city_en,
      city_he: s.city_he,
      capacity: s.capacity,
      sources: s.sources,
    }))
    cachedResponse = JSON.stringify({ shelters })
  }

  const response = new NextResponse(cachedResponse, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  })
  return response
}
