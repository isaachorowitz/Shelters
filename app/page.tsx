"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ShelterPanel from "@/components/shelter-panel"
import { Loader2, MapPin, Shield, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { Shelter, Coordinates } from "@/lib/types"
import { calculateEtas } from "@/lib/utils"

// Test location in Tel Aviv
const TEST_LOCATION: Coordinates = {
  lat: 32.08771237463072,
  lng: 34.77489252878912
}

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
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [locationChanged, setLocationChanged] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const lastLocationRef = useRef<Coordinates | null>(null)
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect desktop and PWA mode
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    // Check if running as PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIosPwa = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isIosPwa)
    }
    
    checkDesktop()
    checkPWA()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Use test location for development
  useEffect(() => {
    // For development, use test location immediately
    if (process.env.NODE_ENV === 'development') {
      setUserLocation(TEST_LOCATION)
      setLoadingLocation(false)
      setIsTracking(true)
      lastLocationRef.current = TEST_LOCATION
      return
    }
  }, [])

  // Request location permission with better error handling
  const requestLocationPermission = useCallback(async () => {
    setLoadingLocation(true)
    setLocationError(null)
    setPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      setLoadingLocation(false)
      return
    }

    // For PWA, check permission state first
    if (isPWA && 'permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        console.log('Permission state:', permission.state)
        
        if (permission.state === 'denied') {
          setPermissionDenied(true)
          setLocationError("Location access denied. Please enable in your device settings.")
          setLoadingLocation(false)
          return
        }
      } catch (e) {
        console.error('Permission query failed:', e)
      }
    }

    // Try to get current position with timeout
    const timeoutId = setTimeout(() => {
      setLoadingLocation(false)
      setLocationError("Location request timed out. Please try again.")
      setRetryCount(prev => prev + 1)
    }, 15000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(coords)
        setLoadingLocation(false)
        setLocationError(null)
        setIsTracking(true)
        lastLocationRef.current = coords
        setRetryCount(0)
      },
      (err) => {
        clearTimeout(timeoutId)
        console.error("Error getting location:", err)
        setLoadingLocation(false)
        setRetryCount(prev => prev + 1)
        
        if (err.code === 1) { // Permission denied
          setPermissionDenied(true)
          if (isPWA) {
            setLocationError("Location blocked. Open this link in Safari/Chrome to enable location, then return to the app.")
          } else {
            setLocationError("Location access denied. Enable location to find bomb shelters.")
          }
        } else if (err.code === 2) { // Position unavailable
          setLocationError("Unable to determine location. Make sure location services are enabled.")
        } else if (err.code === 3) { // Timeout
          setLocationError("Location request timed out. Please try again.")
        } else {
          setLocationError("Unable to retrieve location. Please check your settings.")
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    )
  }, [isPWA, retryCount])

  // Initial location request (only in production)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      requestLocationPermission()
    }
  }, [requestLocationPermission])

  // Handle location updates from map with debouncing
  const handleLocationUpdate = useCallback((newLocation: Coordinates) => {
    // Clear any pending timeout
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current)
    }

    // Update the user location immediately for UI responsiveness
    setUserLocation(newLocation)

    // Debounce the location change detection
    locationUpdateTimeoutRef.current = setTimeout(() => {
      if (lastLocationRef.current) {
        // Calculate distance moved (in meters)
        const R = 6371e3
        const φ1 = lastLocationRef.current.lat * Math.PI / 180
        const φ2 = newLocation.lat * Math.PI / 180
        const Δφ = (newLocation.lat - lastLocationRef.current.lat) * Math.PI / 180
        const Δλ = (newLocation.lng - lastLocationRef.current.lng) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        // Only show update button if moved more than 100 meters
        if (distance > 100) {
          setLocationChanged(true)
        }
      }
    }, 2000) // Wait 2 seconds before checking if we should show the update button
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current)
      }
    }
  }, [])

  // Update location and refresh shelters
  const handleLocationRefresh = useCallback(() => {
    setLocationChanged(false)
    if (userLocation) {
      lastLocationRef.current = userLocation
      // Force refresh shelters
      setNearbyShelters([])
      setAllShelters([])
    }
  }, [userLocation])

  // Open in browser for PWA permission issues
  const openInBrowser = () => {
    const currentUrl = window.location.href
    window.open(currentUrl, '_blank')
  }

  // Fetch shelters when user location is available or changes
  useEffect(() => {
    if (!userLocation || locationChanged) return

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
  }, [userLocation, locationChanged])

  const isInitialLoading = loadingLocation && !userLocation && !locationError

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-black">
      <Header />

      <main className="flex-1 pt-[56px] relative">
        {/* Map takes full space */}
        <MapView
          userLocation={userLocation}
          shelters={allShelters}
          mapHeight="100%"
          onLocationUpdate={isTracking ? handleLocationUpdate : undefined}
          nearbyShelters={nearbyShelters.slice(0, 3)}
          onShelterClick={setSelectedShelter}
        />

        {/* Desktop floating panel */}
        {isDesktop && (
          <div className="absolute top-[72px] left-4 bottom-4 w-[400px] max-w-[calc(100vw-32px)] z-20">
            <ShelterPanel
              shelters={nearbyShelters}
              isLoading={loadingLocation || loadingShelters}
              hasLocationError={!!locationError}
              userLocation={userLocation}
              isDesktopPanel={true}
            />
          </div>
        )}

        {/* Mobile bottom panel */}
        {!isDesktop && (
          <ShelterPanel
            shelters={nearbyShelters}
            isLoading={loadingLocation || loadingShelters}
            hasLocationError={!!locationError}
            userLocation={userLocation}
            isDesktopPanel={false}
          />
        )}

        {/* Location update button */}
        {locationChanged && !loadingLocation && (
          <Button
            onClick={handleLocationRefresh}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            UPDATE LOCATION
          </Button>
        )}

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
                  {isPWA 
                    ? "Location access is needed to find bomb shelters. You may need to enable it in your device settings."
                    : "Enable location services to find the nearest bomb shelters in case of emergency."
                  }
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={requestLocationPermission}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg rounded-xl"
                  >
                    {retryCount > 0 ? 'TRY AGAIN' : 'ENABLE LOCATION NOW'}
                  </Button>
                  {isPWA && retryCount > 1 && (
                    <Button 
                      onClick={openInBrowser}
                      variant="outline"
                      className="w-full border-red-500/50 text-white hover:bg-red-900/20 font-bold py-4 text-sm rounded-xl"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      OPEN IN BROWSER
                    </Button>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-4">
                  {isPWA && retryCount > 0
                    ? "If location isn't working, try opening in your browser to grant permission."
                    : "Your location is used only for emergency shelter navigation."
                  }
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
    </div>
  )
}
