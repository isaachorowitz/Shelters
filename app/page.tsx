"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ShelterPanel from "@/components/shelter-panel"
import AddressSearch from "@/components/address-search"
import ShelterDirectory from "@/components/shelter-directory"
import ShareShelterDialog from "@/components/share-shelter-dialog"
import { Loader2, MapPin, Shield, RefreshCw, SearchX, LocateFixed } from "lucide-react"
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

  return (
    <div className="flex flex-col bg-black" style={{ height: "100dvh", overflow: "hidden" }}>
      <a
        href="#shelter-list-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to shelter list
      </a>

      {/* Top nav — 56px + safe-area-top */}
      <Header onOpenDirectory={handleOpenDirectory}>
        <AddressSearch
          onLocationSelect={handleSearchSelect}
          activeLabel={searchLabel ?? undefined}
          onClearActive={searchLabel ? handleClearSearch : undefined}
          hasUserLocation={!!userLocation}
          compact
        />
      </Header>

      {/* Body — accounts for header height including safe-area-top */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: "calc(56px + env(safe-area-inset-top))" }}
      >

        {/* ── Sidebar (md and up only) ─────────────────────────── */}
        <aside
          className="hidden md:flex w-[340px] shrink-0 flex-col bg-black border-r border-white/8 overflow-hidden z-20"
          aria-label="Nearest shelters"
        >
          <ShelterPanel
            shelters={nearbyShelters}
            isLoading={(!searchLocation && loadingLocation) || loadingShelters}
            hasLocationError={!!locationError && !searchLocation}
            userLocation={effectiveLocation}
            onOpenDirectory={handleOpenDirectory}
            onOpenShare={handleOpenShare}
            sidebar
          />
        </aside>

        {/* ── Map ─────────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden" role="main">
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

          {/* My Location button */}
          {userLocation && !locationError && (
            <button
              onClick={handleRecenterToUser}
              className="absolute top-4 left-3 z-30 w-11 h-11 flex items-center justify-center rounded-full shadow-lg card-press"
              style={{
                background: "rgba(0,0,0,0.88)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
              }}
              aria-label="Go to my location"
            >
              <LocateFixed className="h-5 w-5 text-blue-400" />
            </button>
          )}

          {locationChanged && !loadingLocation && (
            <Button
              onClick={handleLocationRefresh}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 text-sm"
              aria-label="Update shelter distances for new location"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              עדכן מקלטים / UPDATE
            </Button>
          )}

          {outsideIsrael && !searchLocation && !isInitialLoading && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30" role="alert">
              <div className="flex items-center gap-2 bg-amber-800/95 backdrop-blur-md border border-amber-600/40 text-white rounded-full px-4 py-2 shadow-xl whitespace-nowrap">
                <SearchX className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold">מחוץ לישראל — חפש כתובת / Outside Israel</span>
              </div>
            </div>
          )}

          {isInitialLoading && (
            <div
              className="pointer-events-none absolute top-4 left-1/2 z-30 -translate-x-1/2"
              role="status"
              aria-label="Finding your location"
            >
              <div className="flex items-center gap-2.5 rounded-full bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2 shadow-xl">
                <Loader2 className="h-4 w-4 text-red-400 animate-spin" aria-hidden="true" />
                <span className="text-sm font-semibold text-white">מאתר מיקום / Finding you…</span>
              </div>
            </div>
          )}

          {locationError && !permissionDenied && !loadingLocation && !searchLocation && (
            <div
              className="absolute top-4 left-3 right-3 max-w-md mx-auto z-30 bg-red-900/90 border border-red-700 text-white rounded-xl px-4 py-3"
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
                  נסה שוב / RETRY
                </Button>
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
                  <h2 className="text-xl font-black text-white mb-2">נדרש מיקום / LOCATION NEEDED</h2>
                  <p className="text-white/70 mb-4 text-sm leading-relaxed">
                    אפשר גישה למיקום כדי למצוא מקלטים קרובים / Allow location to find shelters near you.
                  </p>
                  <Button
                    onClick={requestLocation}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg rounded-xl mb-4"
                    aria-label="Enable location access"
                  >
                    אפשר מיקום / ALLOW LOCATION
                  </Button>
                  <p className="text-xs text-white/50 mb-3">או חפש כתובת / Or search an address:</p>
                  <AddressSearch onLocationSelect={(coords, label) => {
                    handleSearchSelect(coords, label)
                    setPermissionDenied(false)
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile bottom sheet (hidden on md+) — shows top 3 shelters ── */}
          <div className="md:hidden">
            <ShelterPanel
              shelters={nearbyShelters.slice(0, 3)}
              isLoading={(!searchLocation && loadingLocation) || loadingShelters}
              hasLocationError={!!locationError && !searchLocation}
              userLocation={effectiveLocation}
              onOpenDirectory={handleOpenDirectory}
              onOpenShare={handleOpenShare}
            />
          </div>
        </main>
      </div>

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
    </div>
  )
}
