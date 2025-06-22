"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ShelterPanel from "@/components/shelter-panel"
import { Loader2, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { Shelter, Coordinates } from "@/lib/types"
import { calculateEtas } from "@/lib/utils"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full bg-black">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-red-500" />
        <div className="absolute inset-0 h-16 w-16 animate-ping">
          <Loader2 className="h-16 w-16 text-red-500/50" />
        </div>
      </div>
      <p className="mt-4 text-white font-bold">INITIALIZING MAP...</p>
    </div>
  ),
})

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [allShelters, setAllShelters] = useState<Shelter[]>([])
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([])
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [loadingShelters, setLoadingShelters] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  // Request location permission
  const requestLocationPermission = useCallback(() => {
    setLoadingLocation(true)
    setLocationError(null)
    setPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(coords)
        setLoadingLocation(false)
        setLocationError(null)
        setIsTracking(true)
      },
      (err) => {
        console.error("Error getting location:", err)
        setLoadingLocation(false)
        
        if (err.code === 1) { // Permission denied
          setPermissionDenied(true)
          setLocationError("Location access denied. Enable location to find bomb shelters.")
        } else if (err.code === 2) { // Position unavailable
          setLocationError("Unable to determine location. Check device settings.")
        } else if (err.code === 3) { // Timeout
          setLocationError("Location request timed out. Try again.")
        } else {
          setLocationError("Unable to retrieve location. Enable location services.")
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    )
  }, [])

  // Initial location request
  useEffect(() => {
    requestLocationPermission()
  }, [requestLocationPermission])

  // Handle location updates from map
  const handleLocationUpdate = useCallback((newLocation: Coordinates) => {
    setUserLocation(newLocation)
  }, [])

  // Fetch shelters when user location is available or changes
  useEffect(() => {
    if (!userLocation) return

    const fetchShelters = async () => {
      setLoadingShelters(true)
      try {
        // Fetch nearby shelters (limit 5 for the panel)
        const nearbyResponse = await fetch(
          `/api/shelters?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=5`
        )
        
        if (!nearbyResponse.ok) {
          throw new Error('Failed to fetch shelters')
        }
        
        const nearbyData = await nearbyResponse.json()
        
        // Transform API response to match our Shelter type
        const transformedNearby = nearbyData.shelters.map((shelter: any) => ({
          id: shelter.id,
          name: shelter.name,
          type: shelter.type,
          coordinates: {
            lat: shelter.lat,
            lng: shelter.lng
          },
          distance: shelter.meters,
          etas: calculateEtas(shelter.meters)
        }))
        
        setNearbyShelters(transformedNearby)
        
        // Fetch more shelters for the map (limit 100 for Israel)
        const allResponse = await fetch(
          `/api/shelters?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=100`
        )
        
        if (allResponse.ok) {
          const allData = await allResponse.json()
          const transformedAll = allData.shelters.map((shelter: any) => ({
            id: shelter.id,
            name: shelter.name,
            type: shelter.type,
            coordinates: {
              lat: shelter.lat,
              lng: shelter.lng
            },
            distance: shelter.meters,
            etas: calculateEtas(shelter.meters)
          }))
          setAllShelters(transformedAll)
        } else {
          // If fetching all shelters fails, at least use the nearby ones
          setAllShelters(transformedNearby)
        }
      } catch (error) {
        console.error('Error fetching shelters:', error)
      } finally {
        setLoadingShelters(false)
      }
    }

    fetchShelters()
  }, [userLocation])

  const isInitialLoading = loadingLocation && !userLocation && !locationError

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-black">
      <Header />

      <main className="flex-1 pt-[56px] relative">
        {/* Map is always visible */}
        <MapView
          userLocation={userLocation}
          shelters={allShelters}
          mapHeight="calc(100vh - 56px)"
          onLocationUpdate={isTracking ? handleLocationUpdate : undefined}
        />

        {/* Location permission prompt overlay */}
        {permissionDenied && !isInitialLoading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="bg-black/90 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-red-500/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-10 w-10 text-red-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">LOCATION REQUIRED</h3>
                <p className="text-white/80 mb-6">
                  Enable location services to find the nearest bomb shelters in case of emergency.
                </p>
                <Button 
                  onClick={requestLocationPermission}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg rounded-xl"
                >
                  ENABLE LOCATION NOW
                </Button>
                <p className="text-xs text-white/50 mt-4">
                  Your location is used only for emergency shelter navigation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial loading overlay */}
        {isInitialLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
            <div className="relative">
              <Shield className="h-20 w-20 text-red-500" />
              <div className="absolute inset-0 h-20 w-20 animate-ping">
                <Shield className="h-20 w-20 text-red-500/50" />
              </div>
            </div>
            <p className="mt-4 text-white font-black text-xl">ACQUIRING LOCATION...</p>
            <p className="text-white/70 text-sm">Locating nearest bomb shelters</p>
          </div>
        )}

        {/* Error alert */}
        {locationError && !permissionDenied && !loadingLocation && (
          <Alert className="absolute top-4 left-4 right-4 max-w-md mx-auto z-30 bg-red-900/90 border-red-700 text-white">
            <AlertDescription className="flex items-center justify-between font-bold">
              <span>{locationError}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={requestLocationPermission}
                className="text-white hover:text-white hover:bg-red-800/50 ml-2 font-bold"
              >
                RETRY
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </main>

      <ShelterPanel
        shelters={nearbyShelters}
        isLoading={loadingLocation || loadingShelters}
        hasLocationError={!!locationError}
        userLocation={userLocation}
      />
    </div>
  )
}
