import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Coordinates } from "./types"

const AVERAGE_SPEEDS_MPS = {
  // meters per second
  walk: 1.4, // ~5 km/h
  run: 2.8, // ~10 km/h
  cycle: 5.5, // ~20 km/h
  scooter: 4.2, // ~15 km/h
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  if (!coord1 || !coord2) return Number.POSITIVE_INFINITY

  const R = 6371e3 // Earth radius in meters
  const lat1Rad = (coord1.lat * Math.PI) / 180
  const lat2Rad = (coord2.lat * Math.PI) / 180
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // in meters
}

export function calculateEtas(distanceMeters: number): { run: number; walk: number; cycle: number; scooter: number } {
  if (distanceMeters === Number.POSITIVE_INFINITY || isNaN(distanceMeters)) {
    const max_eta = 999
    return { walk: max_eta, run: max_eta, cycle: max_eta, scooter: max_eta }
  }
  return {
    walk: Math.round(distanceMeters / AVERAGE_SPEEDS_MPS.walk / 60), // minutes
    run: Math.round(distanceMeters / AVERAGE_SPEEDS_MPS.run / 60), // minutes
    cycle: Math.round(distanceMeters / AVERAGE_SPEEDS_MPS.cycle / 60), // minutes
    scooter: Math.round(distanceMeters / AVERAGE_SPEEDS_MPS.scooter / 60), // minutes
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compute estimated time of arrival (ETA) based on distance and speed
 * @param meters - Distance in meters
 * @param speedKmh - Speed in kilometers per hour (default: 5 km/h for walking)
 * @returns ETA in minutes
 */
export function computeEta(meters: number, speedKmh: number = 5): number {
  if (meters <= 0 || speedKmh <= 0) return 0
  
  // Convert meters to kilometers
  const kilometers = meters / 1000
  
  // Calculate time in hours
  const hours = kilometers / speedKmh
  
  // Convert to minutes and round up
  const minutes = Math.ceil(hours * 60)
  
  return minutes
}

/**
 * Format ETA for display
 * @param minutes - ETA in minutes
 * @returns Formatted string (e.g., "5 min", "1 hr 30 min")
 */
export function formatEta(minutes: number): string {
  if (minutes < 1) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`
  }
  
  return `${hours} hr ${remainingMinutes} min`
}
