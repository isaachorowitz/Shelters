"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ShelterPanel from "@/components/shelter-panel"
import { Loader2 } from "lucide-react"

import type { Shelter, Coordinates } from "@/lib/types"
import { mockShelters as allMockShelters } from "@/lib/data"
import { calculateDistance, calculateEtas } from "@/lib/utils"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full bg-neutral-900">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 mt-4 text-white">Loading map...</p>
    </div>
  ),
})

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([])
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(coords)
          setLoadingLocation(false)
          setLocationError(null)
        },
        (err) => {
          console.error("Error getting location:", err)
          setLocationError(
            "Unable to retrieve your location. Please enable location services in your browser or system settings.",
          )
          setLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setLocationError("Geolocation is not supported by your browser.")
      setLoadingLocation(false)
    }
  }, [])

  useEffect(() => {
    let sheltersToDisplay: Shelter[]
    if (userLocation) {
      const sheltersWithDistance = allMockShelters.map((shelter) => {
        const distance = calculateDistance(userLocation, shelter.coordinates)
        const etas = calculateEtas(distance)
        return { ...shelter, distance, etas }
      })

      sheltersWithDistance.sort(
        (a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY),
      )
      sheltersToDisplay = sheltersWithDistance.slice(0, 3)
    } else {
      // If no user location (e.g. due to error or still loading), show some default shelters without distance/ETA
      // Or an empty array if we prefer to show nothing until location is known
      sheltersToDisplay = allMockShelters.slice(0, 3).map((s) => ({ ...s, distance: undefined, etas: undefined }))
    }
    setNearbyShelters(sheltersToDisplay)
  }, [userLocation, allMockShelters])

  const isMapLoading = loadingLocation && !userLocation && !locationError

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-neutral-900">
      <Header />

      <main className="flex-1 pt-[56px]">
        {" "}
        {/* Approx header height */}
        {isMapLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 z-30">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-white">Getting your location...</p>
          </div>
        )}
        {locationError && !loadingLocation && (
          <div className="absolute inset-x-0 top-[60px] p-4 bg-red-800/90 text-white text-center text-sm z-30">
            <p>{locationError}</p>
            <p className="mt-1 opacity-80">Map will show a default area.</p>
          </div>
        )}
        <MapView
          userLocation={userLocation}
          shelters={allMockShelters} // Pass all shelters to map for markers
          mapHeight="calc(100vh - 56px)"
        />
      </main>

      <ShelterPanel
        shelters={nearbyShelters}
        isLoading={loadingLocation && !userLocation && !locationError}
        hasLocationError={!!locationError}
      />
    </div>
  )
}
