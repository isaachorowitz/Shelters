import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Coordinates } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// -- Distance --

/** Haversine distance between two coordinates in meters */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371e3 // Earth radius in meters
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

  return R * c
}

// -- ETA --

const SPEEDS_MPS = {
  walk: 1.4, // ~5 km/h
  run: 2.8, // ~10 km/h
  cycle: 5.5, // ~20 km/h
  scooter: 4.2, // ~15 km/h
} as const

export function calculateEtas(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return { walk: 999, run: 999, cycle: 999, scooter: 999 }
  }
  return {
    walk: Math.max(1, Math.round(distanceMeters / SPEEDS_MPS.walk / 60)),
    run: Math.max(1, Math.round(distanceMeters / SPEEDS_MPS.run / 60)),
    cycle: Math.max(1, Math.round(distanceMeters / SPEEDS_MPS.cycle / 60)),
    scooter: Math.max(1, Math.round(distanceMeters / SPEEDS_MPS.scooter / 60)),
  }
}

/** Format minutes for display: "< 1 min", "5 min", "1 hr 30 min" */
export function formatEta(minutes: number): string {
  if (minutes < 1) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) return hours === 1 ? "1 hr" : `${hours} hrs`
  return `${hours} hr ${remaining} min`
}
