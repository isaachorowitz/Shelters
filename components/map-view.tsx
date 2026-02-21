"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import L from "leaflet"
import { useEffect, useRef, useCallback, useState } from "react"
import type { Shelter, Coordinates } from "@/lib/types"
import { SHELTER_TYPES } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { haversineDistance } from "@/lib/utils"

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
  html: `<div style="position:relative"><div style="width:20px;height:20px;background:#3B82F6;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div><div class="user-pulse-ring"></div></div>`,
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
}

const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [28.5, 33.5],
  [34.0, 36.5],
]

const ROUTE_COLORS = ["#ef4444", "#f97316", "#eab308"]
const MIN_MOVE_DISTANCE = 10
const VIEWPORT_PAD = 0.3 // 30% buffer beyond viewport for smooth panning

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
  const watchRef = useRef<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation || !onLocationUpdate) return

    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }

        if (lastRef.current) {
          const dist = haversineDistance(lastRef.current, loc)
          if (dist < MIN_MOVE_DISTANCE) return
        }

        lastRef.current = loc
        try {
          map.flyTo([loc.lat, loc.lng], map.getZoom(), { duration: 1 })
        } catch {
          // Map may be in transitional state
        }
        onLocationUpdate(loc)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    )

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
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
  html += `<div style="color:#ef4444;font-weight:700;font-size:11px;margin-bottom:4px" dir="auto">${escapeHtml(display.typeLabel)}`
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
    html += `<div style="color:#9ca3af;font-size:11px;margin-bottom:8px">Walk: ${shelter.etas.walk} min &middot; Run: ${shelter.etas.run} min</div>`
  }

  if (nearbyIdx >= 0 && nearbyIdx < 3) {
    html += `<div style="background:${ROUTE_COLORS[nearbyIdx]};color:white;font-weight:700;font-size:11px;padding:4px 8px;border-radius:6px;text-align:center;margin-bottom:8px">#${nearbyIdx + 1} NEAREST</div>`
  }

  const navUrl = getNavUrl(shelter, userLocation)
  html += `<a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;background:#DC2626;color:white;font-weight:700;padding:8px 12px;font-size:13px;border-radius:8px;text-align:center;text-decoration:none;cursor:pointer">GET DIRECTIONS / נווט</a>`

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

  // Sync visible markers to current viewport
  const syncViewport = useCallback(() => {
    const bounds = map.getBounds().pad(VIEWPORT_PAD)
    const lg = layerGroupRef.current

    markersRef.current.forEach((marker) => {
      const inView = bounds.contains(marker.getLatLng())
      if (inView && !lg.hasLayer(marker)) {
        lg.addLayer(marker)
      } else if (!inView && lg.hasLayer(marker)) {
        lg.removeLayer(marker)
      }
    })
  }, [map])

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
    const nearbySet = new Set(nearbyShelters.slice(0, 3).map((s) => s.id))

    for (const shelter of shelters) {
      const isNearest = shelter.id === nearestId
      const isTopNearby = nearbySet.has(shelter.id)

      const cm = L.circleMarker(
        [shelter.coordinates.lat, shelter.coordinates.lng],
        {
          radius: isNearest ? 10 : isTopNearby ? 8 : 5,
          fillColor: "#DC2626",
          fillOpacity: isNearest ? 1 : isTopNearby ? 0.9 : 0.7,
          color: isNearest ? "#FCD34D" : isTopNearby ? "#ffffff" : "rgba(255,255,255,0.25)",
          weight: isNearest ? 3 : isTopNearby ? 2 : 1,
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

  // Mount layer group + listen for viewport changes
  useEffect(() => {
    const lg = layerGroupRef.current
    lg.addTo(map)
    map.on("moveend", syncViewport)

    return () => {
      map.off("moveend", syncViewport)
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

export default function MapView({
  userLocation,
  shelters,
  mapHeight = "100vh",
  onLocationUpdate,
  nearbyShelters = [],
  focusedShelterId,
  onFocusHandled,
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
      className="relative z-0 bg-black"
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
        <LocationTracker onLocationUpdate={onLocationUpdate} />
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          minZoom={7}
          keepBuffer={4}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />

        {/* Routes to nearest shelters — max 3 polylines, lightweight */}
        {userLocation &&
          nearbyShelters.slice(0, 3).map((shelter, i) => (
            <Polyline
              key={`route-${shelter.id}`}
              positions={[
                [userLocation.lat, userLocation.lng],
                [shelter.coordinates.lat, shelter.coordinates.lng],
              ]}
              color={ROUTE_COLORS[i]}
              weight={i === 0 ? 4 : 3}
              opacity={i === 0 ? 0.9 : 0.5}
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
                color: "#3B82F6",
                fillColor: "#3B82F6",
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
