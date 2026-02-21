import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import shelterData from "@/data/shelters.json"

interface ShelterRow {
  id: number
  name: string
  type: string
  lat: number
  lng: number
  meters: number
  address?: string
  neighborhood?: string
  city_en?: string
  city_he?: string
  capacity?: number
  sources?: string
}

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

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3
  const p1 = (lat1 * Math.PI) / 180
  const p2 = (lat2 * Math.PI) / 180
  const dp = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Static shelter data loaded from data/shelters.json
// 2,939 shelters from 10 verified Israeli open data sources
const SHELTERS: ShelterEntry[] = shelterData as ShelterEntry[]

function buildName(s: ShelterEntry): string {
  if (s.name) return s.name
  // Generate a descriptive fallback name for shelters without one
  if (s.address && s.city_he) return `מקלט – ${s.address}, ${s.city_he}`
  if (s.address) return `מקלט – ${s.address}`
  if (s.city_he) return `מקלט ציבורי – ${s.city_he}`
  if (s.city_en) return `Public Shelter – ${s.city_en}`
  return `מקלט #${s.id}`
}

// Pre-computed bounding box radii in degrees for spatial pre-filtering.
// At Israel's latitude (~31°N), 1° lat ≈ 111km, 1° lng ≈ 95km.
// For small limits we use a tight box; for larger limits we widen to ensure
// we capture enough candidates before the expensive haversine sort.
const BOX_SIZES: [number, number, number][] = [
  // [maxLimit, latDeg, lngDeg]
  [10, 0.15, 0.18],   // ~17km — ample for 10 nearest in cities
  [50, 0.35, 0.42],   // ~39km
  [200, 0.6, 0.72],   // ~67km
]

function staticResponse(lat: number, lng: number, limit: number) {
  // Spatial pre-filter: narrow candidates via cheap lat/lng box before haversine
  let candidates = SHELTERS
  const boxSize = BOX_SIZES.find(([maxLim]) => limit <= maxLim)
  if (boxSize) {
    const [, latDeg, lngDeg] = boxSize
    const filtered = SHELTERS.filter(
      (s) => Math.abs(s.lat - lat) <= latDeg && Math.abs(s.lng - lng) <= lngDeg
    )
    // Only use the filter if it returned enough candidates
    if (filtered.length >= limit) candidates = filtered
  }

  const shelters: ShelterRow[] = candidates.map((s) => ({
    id: s.id,
    name: buildName(s),
    type: s.type,
    lat: s.lat,
    lng: s.lng,
    meters: haversine(lat, lng, s.lat, s.lng),
    address: s.address,
    neighborhood: s.neighborhood,
    city_en: s.city_en,
    city_he: s.city_he,
    capacity: s.capacity,
    sources: s.sources,
  }))
  shelters.sort((a, b) => a.meters - b.meters)

  const response = NextResponse.json({ shelters: shelters.slice(0, limit) })
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=3600")
  return response
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const lat = params.get("lat")
  const lng = params.get("lng")
  const limitStr = params.get("limit") ?? "5"

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing required parameters: lat and lng" },
      { status: 400 }
    )
  }

  const latN = parseFloat(lat)
  const lngN = parseFloat(lng)
  const limitN = parseInt(limitStr, 10)

  if (isNaN(latN) || isNaN(lngN) || isNaN(limitN)) {
    return NextResponse.json({ error: "Invalid parameter values" }, { status: 400 })
  }
  if (latN < -90 || latN > 90 || lngN < -180 || lngN > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }
  if (limitN < 1 || limitN > 5000) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 5000" },
      { status: 400 }
    )
  }

  // If Supabase is configured, try it first (allows live updates)
  if (supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_nearest_shelters",
        { user_lng: lngN, user_lat: latN, result_limit: limitN }
      )

      if (!rpcError && rpcData) {
        const shelters: ShelterRow[] = rpcData.map((row: Record<string, unknown>) => {
          let distance = Number(row.meters)
          if (distance < 1) {
            distance = haversine(latN, lngN, Number(row.lat), Number(row.lon ?? row.lng))
          }
          return {
            id: row.id,
            name: row.name,
            type: row.type,
            lat: Number(row.lat),
            lng: Number(row.lon ?? row.lng),
            meters: distance,
            address: row.address as string | undefined,
            neighborhood: row.neighborhood as string | undefined,
            city_en: row.city_en as string | undefined,
            city_he: row.city_he as string | undefined,
            capacity: row.capacity ? Number(row.capacity) : undefined,
            sources: row.sources as string | undefined,
          }
        })
        const response = NextResponse.json({ shelters })
        response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")
        return response
      }

      const { data: tableData, error: tableError } = await supabase
        .from("shelters")
        .select("*")

      if (!tableError && tableData?.length) {
        const first = tableData[0]
        let shelters: ShelterRow[]

        if ("lat" in first && "lng" in first) {
          shelters = tableData.map((r: Record<string, unknown>) => ({
            id: Number(r.id),
            name: String(r.name),
            type: String(r.type),
            lat: Number(r.lat),
            lng: Number(r.lng),
            meters: haversine(latN, lngN, Number(r.lat), Number(r.lng)),
          }))
        } else if ("latitude" in first && "longitude" in first) {
          shelters = tableData.map((r: Record<string, unknown>) => ({
            id: Number(r.id),
            name: String(r.name),
            type: String(r.type),
            lat: Number(r.latitude),
            lng: Number(r.longitude),
            meters: haversine(latN, lngN, Number(r.latitude), Number(r.longitude)),
          }))
        } else {
          return staticResponse(latN, lngN, limitN)
        }

        shelters.sort((a, b) => a.meters - b.meters)
        const response = NextResponse.json({ shelters: shelters.slice(0, limitN) })
        response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")
        return response
      }
    } catch {
      // Supabase failed, fall through to static data
    }
  }

  // Primary data source: static JSON file (2,939 shelters)
  return staticResponse(latN, lngN, limitN)
}
