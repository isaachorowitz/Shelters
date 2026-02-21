export interface Coordinates {
  lat: number
  lng: number
}

export interface Shelter {
  id: string
  name: string
  type: string
  coordinates: Coordinates
  distance?: number // in meters
  etas?: {
    run: number // in minutes
    walk: number // in minutes
    cycle: number // in minutes
    scooter: number // in minutes
  }
}

/** Shape returned by the /api/shelters endpoint */
export interface ShelterApiResponse {
  id: number
  name: string
  type: string
  lat: number
  lng: number
  meters: number
}
