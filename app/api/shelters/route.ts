import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ShelterResponse {
  id: number
  name: string
  type: string
  lat: number
  lng: number
  meters: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const limit = searchParams.get('limit') || '3'

  // Validate required parameters
  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat and lng' },
      { status: 400 }
    )
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  const limitNum = parseInt(limit, 10)

  // Validate parameter values
  if (isNaN(latNum) || isNaN(lngNum) || isNaN(limitNum)) {
    return NextResponse.json(
      { error: 'Invalid parameter values' },
      { status: 400 }
    )
  }

  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates' },
      { status: 400 }
    )
  }

  if (limitNum < 1 || limitNum > 100) {
    return NextResponse.json(
      { error: 'Limit must be between 1 and 100' },
      { status: 400 }
    )
  }

  try {
    // First try the RPC function approach
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearest_shelters', {
      user_lng: lngNum,
      user_lat: latNum,
      result_limit: limitNum
    })

    if (!rpcError && rpcData) {
      // Transform the data to ensure consistent format
      const shelters: ShelterResponse[] = rpcData.map((shelter: any) => ({
        id: shelter.id,
        name: shelter.name,
        type: shelter.type,
        lat: shelter.lat,
        lng: shelter.lon || shelter.lng,
        meters: shelter.meters
      }))

      return NextResponse.json({ shelters })
    }

    // If RPC fails or doesn't exist, try direct table query
    // This is a fallback for when PostGIS isn't available
    const { data: tableData, error: tableError } = await supabase
      .from('shelters')
      .select('*')

    if (tableError) {
      throw tableError
    }

    // If we have geometry columns, try to extract coordinates
    let shelters: ShelterResponse[] = []
    
    if (tableData && tableData.length > 0) {
      // Check if we have lat/lng columns or need to parse geometry
      const firstRow = tableData[0]
      
      if ('lat' in firstRow && 'lng' in firstRow) {
        // Simple lat/lng columns
        shelters = tableData.map(shelter => {
          const shelterLat = parseFloat(shelter.lat)
          const shelterLng = parseFloat(shelter.lng)
          const distance = calculateDistance(latNum, lngNum, shelterLat, shelterLng)
          
          return {
            id: shelter.id,
            name: shelter.name,
            type: shelter.type,
            lat: shelterLat,
            lng: shelterLng,
            meters: distance
          }
        })
      } else if ('latitude' in firstRow && 'longitude' in firstRow) {
        // Alternative column names
        shelters = tableData.map(shelter => {
          const shelterLat = parseFloat(shelter.latitude)
          const shelterLng = parseFloat(shelter.longitude)
          const distance = calculateDistance(latNum, lngNum, shelterLat, shelterLng)
          
          return {
            id: shelter.id,
            name: shelter.name,
            type: shelter.type,
            lat: shelterLat,
            lng: shelterLng,
            meters: distance
          }
        })
      } else {
        // No coordinate columns found, return empty array
        shelters = []
      }
      
      // Sort by distance and limit results
      shelters.sort((a, b) => a.meters - b.meters)
      shelters = shelters.slice(0, limitNum)
    }

    return NextResponse.json({ shelters })
  } catch (error) {
    console.error('Error fetching shelters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shelters' },
      { status: 500 }
    )
  }
}

// Simple distance calculation using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
} 