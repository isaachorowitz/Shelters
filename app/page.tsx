"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ShelterPanel from "@/components/shelter-panel"
import AddressSearch from "@/components/address-search"
import ShelterDirectory from "@/components/shelter-directory"
import { Loader2, MapPin, Shield, RefreshCw, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

import type { Shelter, ShelterApiResponse, Coordinates } from "@/lib/types"
import { calculateEtas, haversineDistance } from "@/lib/utils"

const LOCATION_CHANGE_THRESHOLD = 100
const LOCATION_DEBOUNCE_MS = 2000
const GEOLOCATION_TIMEOUT_MS = 15000

// Israel bounding box (generous)
const ISRAEL_LAT_MIN = 29.4
const ISRAEL_LAT_MAX = 33.4
const ISRAEL_LNG_MIN = 34.2
const ISRAEL_LNG_MAX = 35.9

function isInIsrael(coords: Coordinates): boolean {
  return (
    coords.lat >= ISRAEL_LAT_MIN &&
    coords.lat <= ISRAEL_LAT_MAX &&
    coords.lng >= ISRAEL_LNG_MIN &&
    coords.lng <= ISRAEL_LNG_MAX
  )
}

const MapView = dynamic(
  () =>
    import("@/components/map-view").catch(() => ({
      default: () => (
        <div className="flex flex-col items-center justify-center h-full bg-black text-white p-6" role="alert">
          <Shield className="h-16 w-16 text-red-500 mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold mb-2">MAP LOAD ERROR</h2>
          <p className="text-sm mb-4 text-white/70">Unable to load map component</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            RELOAD PAGE
          </Button>
        </div>
      ),
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-black" role="status" aria-label="Loading map">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" aria-hidden="true" />
        <p className="mt-3 text-white font-bold text-lg">LOADING MAP...</p>
      </div>
    ),
  }
)

function transformShelter(s: ShelterApiResponse): Shelter {
  return {
    id: String(s.id),
    name: s.name,
    type: s.type,
    coordinates: { lat: s.lat, lng: s.lng },
    distance: s.meters,
    address: s.address,
    neighborhood: s.neighborhood,
    cityEn: s.city_en,
    cityHe: s.city_he,
    capacity: s.capacity,
    sources: s.sources,
    etas: calculateEtas(s.meters),
  }
}

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [searchLocation, setSearchLocation] = useState<Coordinates | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const [allShelters, setAllShelters] = useState<Shelter[]>([])
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([])
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [loadingShelters, setLoadingShelters] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [locationChanged, setLocationChanged] = useState(false)
  const [outsideIsrael, setOutsideIsrael] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)
  const [focusedShelterId, setFocusedShelterId] = useState<string | null>(null)
  const lastFetchLocationRef = useRef<Coordinates | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // The effective location for shelter lookups: search overrides user location
  const effectiveLocation = searchLocation ?? userLocation

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)")
    const handle = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches)
    handle(mql)
    mql.addEventListener("change", handle)
    return () => mql.removeEventListener("change", handle)
  }, [])

  const requestLocation = useCallback(() => {
    setLoadingLocation(true)
    setLocationError(null)
    setPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(coords)
        setLoadingLocation(false)
        setLocationError(null)
        setIsTracking(true)
        lastFetchLocationRef.current = coords

        if (!isInIsrael(coords)) {
          setOutsideIsrael(true)
        }
      },
      (err) => {
        setLoadingLocation(false)
        if (err.code === 1) {
          setPermissionDenied(true)
          setLocationError("Location access denied. Enable location to find shelters.")
        } else if (err.code === 2) {
          setLocationError("Unable to determine location. Check device settings.")
        } else if (err.code === 3) {
          setLocationError("Location request timed out. Try again.")
        } else {
          setLocationError("Unable to retrieve location. Enable location services.")
        }
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const handleLocationUpdate = useCallback((newLoc: Coordinates) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setUserLocation(newLoc)

    debounceRef.current = setTimeout(() => {
      if (lastFetchLocationRef.current) {
        const dist = haversineDistance(lastFetchLocationRef.current, newLoc)
        if (dist > LOCATION_CHANGE_THRESHOLD) setLocationChanged(true)
      }
    }, LOCATION_DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleLocationRefresh = useCallback(() => {
    setLocationChanged(false)
    if (effectiveLocation) {
      lastFetchLocationRef.current = effectiveLocation
      setNearbyShelters([])
      setAllShelters([])
    }
  }, [effectiveLocation])

  const handleSearchSelect = useCallback((coords: Coordinates, label: string) => {
    setSearchLocation(coords)
    setSearchLabel(label)
    setOutsideIsrael(false)
    setLocationChanged(false)
    setNearbyShelters([])
    setAllShelters([])
    lastFetchLocationRef.current = coords
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchLocation(null)
    setSearchLabel(null)
    if (userLocation) {
      lastFetchLocationRef.current = userLocation
      setNearbyShelters([])
      setAllShelters([])
      if (!isInIsrael(userLocation)) {
        setOutsideIsrael(true)
      }
    }
  }, [userLocation])

  // Fetch shelters when effective location changes — single API call
  useEffect(() => {
    if (!effectiveLocation || locationChanged) return
    const ac = new AbortController()

    const fetchShelters = async () => {
      setLoadingShelters(true)
      try {
        const res = await fetch(
          `/api/shelters?lat=${effectiveLocation.lat}&lng=${effectiveLocation.lng}&limit=500`,
          { signal: ac.signal }
        )
        if (!res.ok) throw new Error("Failed to fetch shelters")
        const { shelters: raw } = await res.json()
        const all = (raw as ShelterApiResponse[]).map(transformShelter)
        setAllShelters(all)
        setNearbyShelters(all.slice(0, 5))
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return
      } finally {
        setLoadingShelters(false)
      }
    }

    fetchShelters()
    return () => ac.abort()
  }, [effectiveLocation, locationChanged])

  const handleShowOnMap = useCallback((shelter: Shelter) => {
    setFocusedShelterId(shelter.id)
    setShowDirectory(false)
  }, [])

  const handleFocusHandled = useCallback(() => {
    setFocusedShelterId(null)
  }, [])

  const handleOpenDirectory = useCallback(() => {
    setShowDirectory(true)
  }, [])

  const isInitialLoading = loadingLocation && !userLocation && !locationError
  const nearbyForRoutes = useMemo(() => nearbyShelters.slice(0, 3), [nearbyShelters])

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-black">
      <a
        href="#shelter-list-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to shelter list
      </a>

      <Header onOpenDirectory={handleOpenDirectory}>
        <AddressSearch
          onLocationSelect={handleSearchSelect}
          activeLabel={searchLabel ?? undefined}
          onClearActive={searchLabel ? handleClearSearch : undefined}
          hasUserLocation={!!userLocation}
        />
      </Header>

      <main className="flex-1 pt-14 relative" role="main">
        <MapView
          userLocation={effectiveLocation}
          shelters={allShelters}
          mapHeight="100%"
          onLocationUpdate={isTracking && !searchLocation ? handleLocationUpdate : undefined}
          nearbyShelters={nearbyForRoutes}
          focusedShelterId={focusedShelterId}
          onFocusHandled={handleFocusHandled}
        />


        {isDesktop && (
          <div className="absolute top-[60px] left-4 bottom-4 w-[380px] max-w-[calc(100vw-32px)] z-20">
            <ShelterPanel
              shelters={nearbyShelters}
              isLoading={(!searchLocation && loadingLocation) || loadingShelters}
              hasLocationError={!!locationError && !searchLocation}
              userLocation={effectiveLocation}
              isDesktopPanel
              onOpenDirectory={handleOpenDirectory}
            />
          </div>
        )}

        {!isDesktop && (
          <ShelterPanel
            shelters={nearbyShelters}
            isLoading={(!searchLocation && loadingLocation) || loadingShelters}
            hasLocationError={!!locationError && !searchLocation}
            userLocation={effectiveLocation}
            onOpenDirectory={handleOpenDirectory}
          />
        )}

        {locationChanged && !loadingLocation && (
          <Button
            onClick={handleLocationRefresh}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-full shadow-lg flex items-center gap-2"
            aria-label="Update shelter distances for new location"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            UPDATE SHELTERS
          </Button>
        )}

        {/* Outside Israel notice — compact bottom pill */}
        {outsideIsrael && !searchLocation && !isInitialLoading && (
          <div
            className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-30"
            role="alert"
          >
            <div className="flex items-center gap-2 bg-amber-800/95 backdrop-blur-md border border-amber-600/40 text-white rounded-full px-4 py-2.5 shadow-xl shadow-black/40 whitespace-nowrap">
              <SearchX className="h-4 w-4 text-amber-300 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold">Not in Israel</span>
              <span className="text-xs text-white/60 hidden sm:inline">&mdash; search an address above</span>
            </div>
          </div>
        )}

        {permissionDenied && !isInitialLoading && !searchLocation && (
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Location permission required"
          >
            <div className="bg-neutral-950 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-500/40">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-red-500" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">LOCATION REQUIRED</h2>
                <p className="text-white/70 mb-4 text-sm leading-relaxed">
                  Enable location services to find the nearest bomb shelters in case of emergency.
                </p>
                <Button
                  onClick={requestLocation}
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 text-lg rounded-xl mb-4"
                  aria-label="Enable location access"
                >
                  ENABLE LOCATION
                </Button>
                <p className="text-xs text-white/50 mb-3">
                  Or search for a specific address:
                </p>
                <AddressSearch onLocationSelect={(coords, label) => {
                  handleSearchSelect(coords, label)
                  setPermissionDenied(false)
                }} />
                <p className="text-xs text-white/40 mt-4">
                  Your location is used only to find nearby shelters and is never stored.
                </p>
              </div>
            </div>
          </div>
        )}

        {isInitialLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30"
            role="status"
            aria-label="Acquiring your location"
          >
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-red-500" aria-hidden="true" />
            </div>
            <p className="text-white font-black text-xl">ACQUIRING LOCATION</p>
            <p className="text-white/50 text-sm mt-1">Finding nearest bomb shelters...</p>
          </div>
        )}

        {locationError && !permissionDenied && !loadingLocation && !searchLocation && (
          <div
            className="absolute top-[72px] left-3 right-3 max-w-md mx-auto z-30 bg-red-900/90 border border-red-700 text-white rounded-xl px-4 py-3"
            role="alert"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{locationError}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={requestLocation}
                className="text-white hover:text-white hover:bg-red-800/50 font-bold flex-shrink-0"
                aria-label="Retry getting location"
              >
                RETRY
              </Button>
            </div>
          </div>
        )}
      </main>

      <ShelterDirectory
        open={showDirectory}
        onClose={() => setShowDirectory(false)}
        onShowOnMap={handleShowOnMap}
        userLocation={effectiveLocation}
      />
    </div>
  )
}
