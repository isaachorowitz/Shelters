"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { AppShell } from "@/components/shell/app-shell"
import { TopBar } from "@/components/shell/top-bar"
import { NearbySidebar, NearbySheet } from "@/components/shelter/nearby-panel"
import AddressSearch, { ActiveLocationPill } from "@/components/search/address-search"
import ShelterDirectory from "@/components/shelter-directory"
import ShareShelterDialog from "@/components/share-shelter-dialog"
import {
  MapTopStack,
  LocateButton,
  LocatingPill,
  UpdateLocationButton,
  OutsideIsraelBanner,
  LocationErrorCard,
  PermissionPrompt,
} from "@/components/map/map-overlays"
import { Spinner } from "@/components/ui/spinner"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

import type { Shelter, ShelterApiResponse, Coordinates } from "@/lib/types"
import { calculateEtas, haversineDistance } from "@/lib/utils"

const LOCATION_CHANGE_THRESHOLD = 100
const LOCATION_DEBOUNCE_MS = 2000
const GEOLOCATION_TIMEOUT_MS = 10000

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
        <div className="flex flex-col items-center justify-center h-full bg-bg text-fg p-6" role="alert">
          <Shield className="h-16 w-16 text-brand-bright mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold mb-2">MAP LOAD ERROR</h2>
          <p className="text-sm mb-4 text-fg/70">Unable to load map component</p>
          <Button onClick={() => window.location.reload()} className="bg-brand hover:bg-brand-strong">
            RELOAD PAGE
          </Button>
        </div>
      ),
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-bg" role="status" aria-label="Loading map">
        <Spinner className="h-12 w-12" />
        <p className="mt-3 text-fg font-bold text-lg">LOADING MAP...</p>
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
    etas: calculateEtas(s.meters ?? Number.POSITIVE_INFINITY),
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
  const [locationChanged, setLocationChanged] = useState(false)
  const [outsideIsrael, setOutsideIsrael] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareShelter, setShareShelter] = useState<Shelter | null>(null)
  const [focusedShelterId, setFocusedShelterId] = useState<string | null>(null)
  const [flyToLocation, setFlyToLocation] = useState<{ coords: Coordinates; zoom: number; key: number } | null>(null)
  const [allMapShelters, setAllMapShelters] = useState<Shelter[]>([])
  const lastFetchLocationRef = useRef<Coordinates | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const allSheltersLoadedRef = useRef(false)
  const locationRequestActiveRef = useRef(false)

  // The effective location for shelter lookups: search overrides user location
  const effectiveLocation = searchLocation ?? userLocation

  const requestLocation = useCallback(() => {
    // Prevent multiple simultaneous getCurrentPosition calls — Safari can
    // show duplicate permission dialogs if the API is called while a
    // previous request is still pending.
    if (locationRequestActiveRef.current) return
    locationRequestActiveRef.current = true

    setLoadingLocation(true)
    setLocationError(null)
    setPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      setLoadingLocation(false)
      locationRequestActiveRef.current = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationRequestActiveRef.current = false
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
        locationRequestActiveRef.current = false
        setLoadingLocation(false)
        if (err.code === 1) {
          setPermissionDenied(true)
          setLocationError("Location access was denied. Turn on location to find shelters.")
        } else if (err.code === 2) {
          setLocationError("Could not find your location. Check your device settings.")
        } else if (err.code === 3) {
          setLocationError("Location took too long. Tap to try again.")
        } else {
          setLocationError("Could not get your location. Turn on location services and try again.")
        }
      },
      // enableHighAccuracy:false uses fast network/wifi location instead of GPS.
      // GPS (highAccuracy) routinely hangs for 30s+ on phones indoors — the
      // cause of the mobile "Finding shelters" freeze. City-block accuracy is
      // plenty to rank nearby shelters; the map's watchPosition refines later.
      // maximumAge allows a recent cached fix to return instantly.
      { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60000 }
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

  // Load ALL shelters for map display (lightweight endpoint, no haversine)
  // Deferred until after nearby shelters load to prioritize critical data
  const loadAllMapShelters = useCallback(() => {
    if (allSheltersLoadedRef.current) return
    const ac = new AbortController()

    const loadAll = async () => {
      try {
        const res = await fetch(`/api/shelters/map`, { signal: ac.signal })
        if (!res.ok) return
        const { shelters: raw } = await res.json()
        const all = (raw as ShelterApiResponse[]).map((s) => ({
          id: String(s.id),
          name: s.name,
          type: s.type,
          coordinates: { lat: s.lat, lng: s.lng },
          address: s.address,
          neighborhood: s.neighborhood,
          cityEn: s.city_en,
          cityHe: s.city_he,
          capacity: s.capacity,
          sources: s.sources,
        } as Shelter))
        setAllMapShelters(all)
        allSheltersLoadedRef.current = true
      } catch {
        // Will use nearby shelters as fallback
      }
    }

    loadAll()
    return () => ac.abort()
  }, [])

  // Load every shelter onto the map immediately — NOT gated on geolocation.
  // This is what makes the app work even when location is slow, denied, or
  // hangs (the mobile bug): the 7,577 shelters render right away, and
  // geolocation only adds the "nearest" ranking on top.
  useEffect(() => {
    const cleanup = loadAllMapShelters()
    return cleanup
  }, [loadAllMapShelters])

  // Fetch nearby shelters when effective location changes
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
        // After critical nearby data is loaded, load all shelters for map
        loadAllMapShelters()
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return
      } finally {
        setLoadingShelters(false)
      }
    }

    fetchShelters()
    return () => ac.abort()
  }, [effectiveLocation, locationChanged, loadAllMapShelters])

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

  const handleOpenShare = useCallback((shelter?: Shelter) => {
    setShareShelter(shelter ?? null)
    setShowShare(true)
  }, [])

  const handleShareClose = useCallback((v: boolean) => {
    setShowShare(v)
    if (!v) setTimeout(() => setShareShelter(null), 300)
  }, [])

  const isInitialLoading = loadingLocation && !userLocation && !locationError
  const nearbyForRoutes = useMemo(() => nearbyShelters.slice(0, 5), [nearbyShelters])

  // Merge all map shelters with nearby shelters (which have distance/etas)
  const sheltersForMap = useMemo(() => {
    if (allMapShelters.length === 0) return allShelters
    // Create a map of nearby shelters with their distance data
    const nearbyMap = new Map(allShelters.map((s) => [s.id, s]))
    return allMapShelters.map((s) => nearbyMap.get(s.id) ?? s)
  }, [allMapShelters, allShelters])

  const handleRecenterToUser = useCallback(() => {
    if (userLocation) {
      setFlyToLocation({ coords: userLocation, zoom: 16, key: Date.now() })
    }
  }, [userLocation])

  const panelProps = {
    isLoading: (!searchLocation && loadingLocation) || loadingShelters,
    hasLocationError: !!locationError && !searchLocation,
    userLocation: effectiveLocation,
    onOpenDirectory: handleOpenDirectory,
    onOpenShare: handleOpenShare,
  }

  const locateButton = userLocation && !locationError ? <LocateButton onClick={handleRecenterToUser} /> : null

  return (
    <AppShell
      topBar={
        <TopBar
          search={(done, overlay) => (
            <AddressSearch
              autoFocus={overlay}
              onLocationSelect={(coords, label) => {
                handleSearchSelect(coords, label)
                done()
              }}
            />
          )}
        />
      }
      sidebar={<NearbySidebar shelters={nearbyShelters} {...panelProps} />}
      overlays={
        <>
          <ShelterDirectory
            open={showDirectory}
            onClose={() => setShowDirectory(false)}
            onShowOnMap={handleShowOnMap}
            onShare={(shelter) => handleOpenShare(shelter)}
            userLocation={effectiveLocation}
          />
          <ShareShelterDialog
            open={showShare}
            onOpenChange={handleShareClose}
            shelter={shareShelter}
            nearbyShelters={nearbyShelters}
            userLocation={effectiveLocation}
          />
        </>
      }
    >
      <MapView
        userLocation={effectiveLocation}
        shelters={sheltersForMap}
        mapHeight="100%"
        onLocationUpdate={isTracking && !searchLocation ? handleLocationUpdate : undefined}
        nearbyShelters={nearbyForRoutes}
        focusedShelterId={focusedShelterId}
        onFocusHandled={handleFocusHandled}
        flyToLocation={flyToLocation}
      />

      {/* Status and messages, stacked at the top of the map */}
      <MapTopStack>
        {isInitialLoading && <LocatingPill />}
        {searchLabel && (
          <ActiveLocationPill
            label={searchLabel}
            onReturnToMe={userLocation ? handleClearSearch : undefined}
            onClear={handleClearSearch}
          />
        )}
        {locationChanged && !loadingLocation && <UpdateLocationButton onClick={handleLocationRefresh} />}
        {outsideIsrael && !searchLocation && !isInitialLoading && <OutsideIsraelBanner />}
        {locationError && !permissionDenied && !loadingLocation && !searchLocation && (
          <LocationErrorCard message={locationError} onRetry={requestLocation} />
        )}
      </MapTopStack>

      {/* Desktop: locate control top-right of the map (phones carry it on the sheet) */}
      {locateButton && <div className="hidden md:block absolute top-4 right-4 z-map-overlay">{locateButton}</div>}

      {permissionDenied && !isInitialLoading && !searchLocation && (
        <PermissionPrompt
          onAllow={requestLocation}
          search={
            <AddressSearch
              onLocationSelect={(coords, label) => {
                handleSearchSelect(coords, label)
                setPermissionDenied(false)
              }}
            />
          }
        />
      )}

      {/* Phone: bottom sheet with the top 3 shelters (hidden on md+) */}
      <div className="md:hidden">
        <NearbySheet shelters={nearbyShelters.slice(0, 3)} accessory={locateButton} {...panelProps} />
      </div>
    </AppShell>
  )
}
