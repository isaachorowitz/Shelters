"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import L from "leaflet"
import { useEffect, useRef, useCallback, useState } from "react"
import type { Shelter, Coordinates } from "@/lib/types"
import { SHELTER_TYPES } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { haversineDistance } from "@/lib/utils"
import { MAP_COLORS } from "@/lib/design/map-colors"

const CARTO_TILE_URL = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(process.env.NEXT_PUBLIC_CARTO_BASEMAP_API_KEY ?? "")}`

// Local marker icons — only used for user location (1 DOM element)
const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userLocationIcon = L.divIcon({
  html: `<div style="position:relative"><div style="width:20px;height:20px;background:${MAP_COLORS.user};border:4px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div><div class="user-pulse-ring"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: "user-location-marker",
})

L.Marker.prototype.options.icon = defaultIcon

interface MapViewProps {
  userLocation: Coordinates | null
  shelters: Shelter[]
  mapHeight?: string
  onLocationUpdate?: (location: Coordinates) => void
  nearbyShelters?: Shelter[]
  focusedShelterId?: string | null
  onFocusHandled?: () => void
  flyToLocation?: { coords: Coordinates; zoom: number; key: number } | null
}

const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [28.5, 33.5],
  [34.0, 36.5],
]

const ROUTE_COLORS = MAP_COLORS.routes
const MIN_MOVE_DISTANCE = 10
const MIN_UPDATE_INTERVAL_MS = 3000 // Throttle GPS updates to prevent glitchy behavior while driving

function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()
  const initialized = useRef(false)

  useEffect(() => {
    try {
      if (!initialized.current) {
        map.setView(center, zoom)
        map.setMaxBounds(ISRAEL_BOUNDS)
        map.setMinZoom(7)
        initialized.current = true
      } else {
        map.flyTo(center, zoom, { duration: 1 })
      }
    } catch {
      // Map container may be in a transitional state (React Strict Mode double-mount)
    }
  }, [map, center, zoom])

  return null
}

function LocationTracker({ onLocationUpdate }: { onLocationUpdate?: (loc: Coordinates) => void }) {
  const map = useMap()
  const lastRef = useRef<Coordinates | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const watchRef = useRef<number | null>(null)
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!navigator.geolocation || !onLocationUpdate) return

    const startWatching = () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)

      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }

          // Skip if user hasn't moved enough
          if (lastRef.current) {
            const dist = haversineDistance(lastRef.current, loc)
            if (dist < MIN_MOVE_DISTANCE) return
          }

          // Time-based throttle to prevent glitchy updates while driving
          const now = Date.now()
          const elapsed = now - lastUpdateTimeRef.current

          if (elapsed < MIN_UPDATE_INTERVAL_MS) {
            // Schedule a trailing update if none pending
            if (!pendingRef.current) {
              pendingRef.current = setTimeout(() => {
                pendingRef.current = null
                lastRef.current = loc
                lastUpdateTimeRef.current = Date.now()
                onLocationUpdate(loc)
              }, MIN_UPDATE_INTERVAL_MS - elapsed)
            }
            return
          }

          lastRef.current = loc
          lastUpdateTimeRef.current = now
          // No flyTo — position marker updates via React state,
          // user can recenter manually to avoid map jerking while driving
          onLocationUpdate(loc)
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
      )
    }

    // Safari can show a second location permission dialog when watchPosition
    // is called immediately after getCurrentPosition. Delay the watch start
    // to let Safari's permission state settle after the initial grant.
    // Browsers with Permissions API (Chrome, Firefox) can skip the delay
    // by checking if geolocation is already granted.
    let cancelled = false
    const tryStart = async () => {
      try {
        const perm = await navigator.permissions?.query({ name: "geolocation" as PermissionName })
        if (!cancelled && perm?.state === "granted") {
          startWatching()
          return
        }
      } catch {
        // Safari doesn't support Permissions API for geolocation — fall through
      }
      // Fallback: delay watchPosition to avoid re-triggering Safari's prompt
      if (!cancelled) {
        delayRef.current = setTimeout(startWatching, 1000)
      }
    }
    tryStart()

    return () => {
      cancelled = true
      if (delayRef.current) {
        clearTimeout(delayRef.current)
        delayRef.current = null
      }
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
      }
      if (pendingRef.current) {
        clearTimeout(pendingRef.current)
        pendingRef.current = null
      }
    }
  }, [map, onLocationUpdate])

  return null
}

// --- Helpers for imperative popup content ---

function escapeHtml(s: string): string {
  const el = document.createElement("span")
  el.textContent = s
  return el.innerHTML
}

function getNavUrl(shelter: Shelter, userLocation: Coordinates | null): string {
  const dest = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  if (isIOS) return `maps://?daddr=${dest}&dirflg=w`
  if (isAndroid) return `google.navigation:q=${dest}&mode=w`
  const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""
  return `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ""}&destination=${dest}&travelmode=walking`
}

function buildPopupContent(
  shelter: Shelter,
  nearbyIdx: number,
  userLocation: Coordinates | null,
): HTMLElement {
  const container = document.createElement("div")
  container.style.cssText = "min-width:200px;font-family:inherit"

  const display = getShelterDisplayInfo(shelter)

  // Primary line: address or best available
  let html = `<div style="font-size:14px;font-weight:700;margin-bottom:2px" dir="auto">${escapeHtml(display.primaryLine)}</div>`

  // Secondary line: context (neighborhood, city)
  if (display.secondaryLine) {
    html += `<div style="color:#9ca3af;font-size:11px;margin-bottom:2px" dir="auto">${escapeHtml(display.secondaryLine)}</div>`
  }

  // Meaningful name if different from primary
  if (display.meaningfulName) {
    html += `<div style="color:#6b7280;font-size:10px;margin-bottom:4px" dir="auto">${escapeHtml(display.meaningfulName)}</div>`
  }

  // Type label
  html += `<div style="color:${MAP_COLORS.popupType};font-weight:700;font-size:11px;margin-bottom:4px" dir="auto">${escapeHtml(display.typeLabel)}`
  if (shelter.capacity != null && shelter.capacity > 0) {
    html += ` &middot; ${shelter.capacity} ppl`
  }
  html += `</div>`

  if (shelter.distance != null) {
    const distText = shelter.distance < 1000
      ? `${Math.round(shelter.distance)}m away`
      : `${(shelter.distance / 1000).toFixed(1)} km away`
    html += `<div style="color:#d1d5db;font-weight:600;margin-bottom:4px">${distText}</div>`
  }

  if (shelter.etas) {
    html += `<div style="color:#9ca3af;font-size:11px;margin-bottom:8px">הליכה Walk: ${shelter.etas.walk} min &middot; ריצה Run: ${shelter.etas.run} min</div>`
  }

  if (nearbyIdx >= 0 && nearbyIdx < 5) {
    html += `<div style="background:${ROUTE_COLORS[nearbyIdx]};color:white;font-weight:700;font-size:11px;padding:4px 8px;border-radius:6px;text-align:center;margin-bottom:8px">#${nearbyIdx + 1} NEAREST</div>`
  }

  const navUrl = getNavUrl(shelter, userLocation)
  html += `<a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;background:${MAP_COLORS.popupAction};color:white;font-weight:700;padding:8px 12px;font-size:13px;border-radius:8px;text-align:center;text-decoration:none;cursor:pointer">נווט / NAVIGATE</a>`

  container.innerHTML = html
  return container
}

/**
 * ShelterLayer — renders shelter markers imperatively on the Canvas renderer.
 *
 * Why imperative? With 500+ markers, React component reconciliation is expensive.
 * By creating L.circleMarker instances directly and managing a LayerGroup,
 * all markers are batch-rendered on a single <canvas> element with zero DOM overhead.
 *
 * Viewport filtering: only markers within the padded viewport are added to the layer group.
 * Markers outside the viewport are removed. This keeps rendering O(visible) not O(total).
 */
function ShelterLayer({
  shelters,
  nearbyShelters,
  userLocation,
  focusedShelterId,
  onFocusHandled,
}: {
  shelters: Shelter[]
  nearbyShelters: Shelter[]
  userLocation: Coordinates | null
  focusedShelterId?: string | null
  onFocusHandled?: () => void
}) {
  const map = useMap()
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup())
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const userLocationRef = useRef(userLocation)
  userLocationRef.current = userLocation
  const nearbySheltersRef = useRef(nearbyShelters)
  nearbySheltersRef.current = nearbyShelters

  // Add all markers to the layer group (always visible)
  const syncViewport = useCallback(() => {
    const lg = layerGroupRef.current
    markersRef.current.forEach((marker) => {
      if (!lg.hasLayer(marker)) lg.addLayer(marker)
    })
  }, [])

  // Rebuild all marker instances when shelter data changes
  useEffect(() => {
    const lg = layerGroupRef.current

    // Clean up existing markers
    markersRef.current.forEach((m) => {
      m.off("click")
      lg.removeLayer(m)
    })
    markersRef.current.clear()

    const nearestId = nearbyShelters[0]?.id
    const nearbyIds = nearbyShelters.slice(0, 5).map((s) => s.id)
    const nearbySet = new Set(nearbyIds)

    // Render regular shelters first, then nearby ones on top
    const regularShelters: Shelter[] = []
    const nearbyShelterList: Shelter[] = []
    for (const shelter of shelters) {
      if (nearbySet.has(shelter.id)) {
        nearbyShelterList.push(shelter)
      } else {
        regularShelters.push(shelter)
      }
    }

    // Regular shelters (rendered first, appear below)
    for (const shelter of regularShelters) {
      const cm = L.circleMarker(
        [shelter.coordinates.lat, shelter.coordinates.lng],
        {
          radius: 5,
          fillColor: MAP_COLORS.shelter,
          fillOpacity: 0.7,
          color: MAP_COLORS.shelterEdge,
          weight: 1,
          interactive: true,
        }
      )

      const s = shelter
      cm.on("click", () => {
        const nearbyIdx = nearbySheltersRef.current.findIndex((ns) => ns.id === s.id)
        const content = buildPopupContent(s, nearbyIdx, userLocationRef.current)
        cm.bindPopup(content, { maxWidth: 280, className: "shelter-popup" }).openPopup()
      })

      markersRef.current.set(shelter.id, cm)
    }

    // Nearby shelters (rendered last, appear on top)
    for (const shelter of nearbyShelterList) {
      const isNearest = shelter.id === nearestId
      const isTop3 = nearbyIds.indexOf(shelter.id) < 3

      const cm = L.circleMarker(
        [shelter.coordinates.lat, shelter.coordinates.lng],
        {
          radius: isNearest ? 12 : isTop3 ? 9 : 7,
          fillColor: isNearest ? MAP_COLORS.nearest : MAP_COLORS.shelter,
          fillOpacity: 1,
          color: isNearest ? MAP_COLORS.nearestEdge : isTop3 ? MAP_COLORS.top3Edge : MAP_COLORS.nearbyEdge,
          weight: isNearest ? 4 : 2,
          interactive: true,
        }
      )

      // Lazy popup — DOM only created on click, not for all 500 markers
      const s = shelter // capture in closure
      cm.on("click", () => {
        const nearbyIdx = nearbySheltersRef.current.findIndex((ns) => ns.id === s.id)
        const content = buildPopupContent(s, nearbyIdx, userLocationRef.current)
        cm.bindPopup(content, { maxWidth: 280, className: "shelter-popup" }).openPopup()
      })

      markersRef.current.set(shelter.id, cm)
    }

    // Initial viewport sync
    syncViewport()
  }, [shelters, nearbyShelters, syncViewport])

  // Mount layer group — no viewport filtering, all markers always present
  useEffect(() => {
    const lg = layerGroupRef.current
    lg.addTo(map)

    return () => {
      lg.clearLayers()
      lg.remove()
    }
  }, [map, syncViewport])

  // Focus on a specific shelter (from directory "Show on Map")
  useEffect(() => {
    if (!focusedShelterId) return
    const marker = markersRef.current.get(focusedShelterId)
    if (marker) {
      const latlng = marker.getLatLng()
      // Ensure marker is in the layer group
      const lg = layerGroupRef.current
      if (!lg.hasLayer(marker)) lg.addLayer(marker)
      // Fly to the shelter and open its popup
      map.flyTo(latlng, 17, { duration: 1 })
      setTimeout(() => {
        marker.fire("click")
      }, 1100) // wait for flyTo to complete
    }
    onFocusHandled?.()
  }, [focusedShelterId, map, onFocusHandled])

  return null
}

function FlyToController({ flyToLocation }: { flyToLocation: MapViewProps["flyToLocation"] }) {
  const map = useMap()
  const prevKeyRef = useRef<number | null>(null)

  useEffect(() => {
    if (!flyToLocation) return
    if (flyToLocation.key === prevKeyRef.current) return
    prevKeyRef.current = flyToLocation.key
    try {
      map.flyTo([flyToLocation.coords.lat, flyToLocation.coords.lng], flyToLocation.zoom, { duration: 1.2 })
    } catch {
      // Map may be in transitional state
    }
  }, [map, flyToLocation])

  return null
}

export default function MapView({
  userLocation,
  shelters,
  mapHeight = "100vh",
  onLocationUpdate,
  nearbyShelters = [],
  focusedShelterId,
  onFocusHandled,
  flyToLocation,
}: MapViewProps) {
  const [mapKey] = useState(() => Math.random())
  const defaultCenter: LatLngExpression = [32.0853, 34.7818]
  const currentCenter: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter
  const currentZoom = userLocation ? 16 : 13

  return (
    <div
      style={{ height: mapHeight, width: "100%" }}
      className="relative z-0 bg-bg"
      role="application"
      aria-label="Map showing shelter locations"
    >
      <MapContainer
        key={mapKey}
        center={currentCenter}
        zoom={currentZoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        className="leaflet-map-container"
        zoomControl={false}
        maxBounds={ISRAEL_BOUNDS}
        maxBoundsViscosity={0.8}
        preferCanvas
      >
        <MapController center={currentCenter} zoom={currentZoom} />
        <FlyToController flyToLocation={flyToLocation} />
        <LocationTracker onLocationUpdate={onLocationUpdate} />
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution/">CARTO</a>'
          url={CARTO_TILE_URL}
          maxZoom={19}
          minZoom={7}
          keepBuffer={4}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />

        {/* Routes to nearest shelters — 5 polylines */}
        {userLocation &&
          nearbyShelters.slice(0, 5).map((shelter, i) => (
            <Polyline
              key={`route-${shelter.id}`}
              positions={[
                [userLocation.lat, userLocation.lng],
                [shelter.coordinates.lat, shelter.coordinates.lng],
              ]}
              color={ROUTE_COLORS[i]}
              weight={i === 0 ? 5 : i < 3 ? 3 : 2}
              opacity={i === 0 ? 1 : i < 3 ? 0.6 : 0.4}
              dashArray={i === 0 ? undefined : "8, 8"}
            />
          ))}

        {/* User location — single DOM marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={100}
              pathOptions={{
                color: MAP_COLORS.user,
                fillColor: MAP_COLORS.user,
                fillOpacity: 0.08,
                weight: 1,
                opacity: 0.3,
              }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup><strong>YOUR LOCATION</strong></Popup>
            </Marker>
          </>
        )}

        {/* Shelter markers — imperative Canvas layer for performance */}
        <ShelterLayer
          shelters={shelters}
          nearbyShelters={nearbyShelters}
          userLocation={userLocation}
          focusedShelterId={focusedShelterId}
          onFocusHandled={onFocusHandled}
        />
      </MapContainer>
    </div>
  )
}

export type { MapViewProps }
