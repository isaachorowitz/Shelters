import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import sheltersData from "@/data/shelters.json"
import type { ShelterApiResponse } from "@/lib/types"

// Static data fallback (used when Supabase is unavailable or query is simple)
const staticShelters: ShelterApiResponse[] = sheltersData as ShelterApiResponse[]

// Cache control: revalidate every 24 hours
export const revalidate = 86400

// Haversine distance in meters between two lat/lng points
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Helper: filter shelters from static data
function staticResponse(
  latN: number | null,
  lngN: number | null,
  limitN: number,
  typeFilter?: string,
  cityFilter?: string
): NextResponse {
  let filtered = staticShelters

  // Type filter
  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter((s) => s.type === typeFilter)
  }

  // City filter
  if (cityFilter) {
    const city = cityFilter.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.city_en?.toLowerCase().includes(city) ||
        s.city_he?.includes(cityFilter)
    )
  }

  // Proximity sort with real Haversine distance
  if (latN !== null && lngN !== null) {
    filtered = filtered
      .map((s) => ({
        ...s,
        meters: haversineMeters(latN, lngN, s.lat, s.lng),
      }))
      .sort((a, b) => a.meters - b.meters)
      .slice(0, limitN)
  } else {
    filtered = filtered.slice(0, limitN)
  }

  return NextResponse.json({ shelters: filtered }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // Parse params
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const limit = searchParams.get("limit") ?? "50"
  const type = searchParams.get("type") ?? undefined
  const city = searchParams.get("city") ?? undefined
  const source = searchParams.get("source") ?? "auto"

  const latN = lat ? parseFloat(lat) : null
  const lngN = lng ? parseFloat(lng) : null
  const limitN = Math.min(parseInt(limit, 10) || 50, 500)

  // Validate coordinates if provided
  if (latN !== null && (isNaN(latN) || latN < 29 || latN > 34)) {
    return NextResponse.json({ error: "Invalid latitude. Must be between 29 and 34 (Israel)." }, { status: 400 })
  }
  if (lngN !== null && (isNaN(lngN) || lngN < 34 || lngN > 36)) {
    return NextResponse.json({ error: "Invalid longitude. Must be between 34 and 36 (Israel)." }, { status: 400 })
  }

  // Force static data
  if (source === "static") {
    return staticResponse(latN, lngN, limitN, type, city)
  }

  // Try Supabase first
  try {
    if (!supabase) throw new Error("Supabase not configured")

    // Use PostGIS nearby function if coordinates are provided
    if (latN !== null && lngN !== null) {
      const { data, error } = await supabase.rpc("get_nearby_shelters", {
        user_lat: latN,
        user_lng: lngN,
        radius_km: 5.0,
        max_results: limitN,
      })

      if (error) throw error
      if (data && data.length > 0) {
        return NextResponse.json({ shelters: data }, {
          headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
        })
      }
    }

    // General query
    let query = supabase
      .from("shelters")
      .select("id, lat, lng, type, name, address, neighborhood, city_en, city_he, capacity, sources")
      .limit(limitN)

    if (type && type !== "all") query = query.eq("type", type)
    if (city) query = query.ilike("city_en", `%${city}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ shelters: data ?? [] }, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
    })
  } catch (err) {
    // Supabase unavailable — fall through to static data
    console.warn("[shelters API] Supabase error, using static data:", err)
    return staticResponse(latN, lngN, limitN, type, city)
  }
}
