import type { Coordinates } from "@/lib/types"

export type NavApp = "google" | "apple" | "waze"
export type TravelMode = "walking" | "driving"

/** Deep link that opens turn-by-turn directions in the chosen app. */
export function directionsUrl(
  app: NavApp,
  destination: Coordinates,
  origin?: Coordinates | null,
  mode: TravelMode = "walking"
): string {
  const dest = `${destination.lat},${destination.lng}`
  if (app === "waze") return `waze://?ll=${dest}&navigate=yes`
  if (app === "apple") return `maps://?daddr=${dest}&dirflg=w`
  const from = origin ? `&origin=${origin.lat},${origin.lng}` : ""
  return `https://www.google.com/maps/dir/?api=1${from}&destination=${dest}&travelmode=${mode}`
}

export function openDirections(...args: Parameters<typeof directionsUrl>) {
  window.open(directionsUrl(...args), "_blank", "noopener,noreferrer")
}
