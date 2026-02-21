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
}

interface ShelterEntry {
  id: number
  name: string
  type: string
  lat: number
  lng: number
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
// To update shelters: replace the JSON file with new data
// Format: [{ id, name, type, lat, lng }, ...]
const SHELTERS: ShelterEntry[] = shelterData

function staticResponse(lat: number, lng: number, limit: number) {
  const shelters: ShelterRow[] = SHELTERS.map((s) => ({
    ...s,
    meters: haversine(lat, lng, s.lat, s.lng),
  }))
  shelters.sort((a, b) => a.meters - b.meters)
  return NextResponse.json({ shelters: shelters.slice(0, limit) })
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
  if (limitN < 1 || limitN > 500) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 500" },
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
          }
        })
        return NextResponse.json({ shelters })
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
        return NextResponse.json({ shelters: shelters.slice(0, limitN) })
      }
    } catch {
      // Supabase failed, fall through to static data
    }
  }

  // Primary data source: static JSON file
  return staticResponse(latN, lngN, limitN)
}
