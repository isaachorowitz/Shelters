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

const SHELTERS = shelterData as ShelterEntry[]

// Region bucketing for shelters with no city
function getRegion(lat: number): { nameHe: string; nameEn: string } {
  if (lat < 31.2) return { nameHe: "הנגב", nameEn: "Negev" }
  if (lat < 32.2) return { nameHe: "מרכז", nameEn: "Central" }
  return { nameHe: "צפון", nameEn: "North" }
}

export async function GET() {
  const cityMap = new Map<
    string,
    { cityHe: string; cityEn: string; shelters: ShelterEntry[] }
  >()
  const regionMap = new Map<
    string,
    { nameHe: string; nameEn: string; shelters: ShelterEntry[] }
  >()

  for (const s of SHELTERS) {
    if (s.city_he || s.city_en) {
      const key = s.city_he || s.city_en!
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          cityHe: s.city_he || "",
          cityEn: s.city_en || "",
          shelters: [],
        })
      }
      cityMap.get(key)!.shelters.push(s)
    } else {
      const region = getRegion(s.lat)
      const key = region.nameEn
      if (!regionMap.has(key)) {
        regionMap.set(key, { ...region, shelters: [] })
      }
      regionMap.get(key)!.shelters.push(s)
    }
  }

  // Build cities with neighborhood subgroups
  const cities = [...cityMap.values()]
    .map((city) => {
      const neighborhoodMap = new Map<string, ShelterEntry[]>()
      const noNeighborhood: ShelterEntry[] = []

      for (const s of city.shelters) {
        if (s.neighborhood) {
          if (!neighborhoodMap.has(s.neighborhood))
            neighborhoodMap.set(s.neighborhood, [])
          neighborhoodMap.get(s.neighborhood)!.push(s)
        } else {
          noNeighborhood.push(s)
        }
      }

      return {
        cityHe: city.cityHe,
        cityEn: city.cityEn,
        count: city.shelters.length,
        neighborhoods: [...neighborhoodMap.entries()]
          .map(([name, shelters]) => ({
            name,
            count: shelters.length,
            shelters,
          }))
          .sort((a, b) => b.count - a.count),
        shelters: noNeighborhood,
      }
    })
    .sort((a, b) => b.count - a.count)

  const unknownRegions = [...regionMap.values()]
    .map((r) => ({
      nameHe: r.nameHe,
      nameEn: r.nameEn,
      count: r.shelters.length,
      shelters: r.shelters,
    }))
    .sort((a, b) => b.count - a.count)

  const response = NextResponse.json({
    cities,
    unknownRegions,
    totalCount: SHELTERS.length,
  })
  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
  )
  return response
}
