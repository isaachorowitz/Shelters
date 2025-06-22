import type { Shelter } from "./types"

// Example: San Francisco area
export const mockShelters: Shelter[] = [
  { id: "1", name: "Safe Haven Community Shelter", type: "Emergency", coordinates: { lat: 37.7749, lng: -122.4194 } },
  { id: "2", name: "Golden Gate Family Center", type: "Family", coordinates: { lat: 37.78, lng: -122.424 } },
  { id: "3", name: "Bayview Youth Refuge", type: "Youth", coordinates: { lat: 37.73, lng: -122.38 } },
  { id: "4", name: "Downtown Drop-In Center", type: "Emergency", coordinates: { lat: 37.79, lng: -122.4 } },
  { id: "5", name: "Sunset Women's Shelter", type: "Women", coordinates: { lat: 37.76, lng: -122.48 } },
  { id: "6", name: "Mission District Support Hub", type: "General", coordinates: { lat: 37.7597, lng: -122.4148 } },
  { id: "7", name: "Richmond Area Safe Place", type: "Family", coordinates: { lat: 37.779, lng: -122.478 } },
]
