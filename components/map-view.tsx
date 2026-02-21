"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import L from "leaflet"
import { useEffect, useRef, useCallback, useState } from "react"
import type { Shelter, Coordinates } from "@/lib/types"
import { Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { haversineDistance } from "@/lib/utils"

// Local marker icons to avoid CORS
const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const shelterIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#DC2626,#991B1B);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(220,38,38,0.5)"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "shelter-marker",
})

const nearestShelterIcon = L.divIcon({
  html: `<div style="width:42px;height:42px;background:linear-gradient(135deg,#DC2626,#7F1D1D);border:3px solid #FCD34D;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(220,38,38,0.7),0 0 24px rgba(252,211,77,0.3)"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg></div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  className: "shelter-marker",
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
}

// Expanded bounds with generous buffer to prevent white edges when panning
const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [28.5, 33.5],
  [34.0, 36.5],
]

const ROUTE_COLORS = ["#ef4444", "#f97316", "#eab308"]
const MIN_MOVE_DISTANCE = 10

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

export default function MapView({
  userLocation,
  shelters,
  mapHeight = "100vh",
  onLocationUpdate,
  nearbyShelters = [],
}: MapViewProps) {
  // Unique key per mount cycle to prevent "container reused" error in React Strict Mode
  const [mapKey] = useState(() => Math.random())
  const defaultCenter: LatLngExpression = [32.0853, 34.7818]
  const currentCenter: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter
  const currentZoom = userLocation ? 16 : 13

  const handleNavigate = useCallback(
    (shelter: Shelter) => {
      if (!shelter.coordinates) return
      const dest = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      let url: string
      if (isIOS) {
        url = `maps://?daddr=${dest}&dirflg=w`
      } else if (isAndroid) {
        url = `google.navigation:q=${dest}&mode=w`
      } else {
        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""
        url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ""}&destination=${dest}&travelmode=walking`
      }
      window.open(url, "_blank", "noopener,noreferrer")
    },
    [userLocation]
  )

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
      >
        <MapController center={currentCenter} zoom={currentZoom} />
        <LocationTracker onLocationUpdate={onLocationUpdate} />
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          minZoom={7}
          keepBuffer={6}
        />

        {/* Routes to nearest shelters */}
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

        {/* User location */}
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

        {/* Shelter markers */}
        {shelters.map((shelter) => {
          const nearbyIdx = nearbyShelters.findIndex((ns) => ns.id === shelter.id)
          const isNearest = nearbyIdx === 0
          return (
            <Marker
              key={shelter.id}
              position={[shelter.coordinates.lat, shelter.coordinates.lng]}
              icon={isNearest ? nearestShelterIcon : shelterIcon}
            >
              <Popup>
                <div className="text-sm font-bold min-w-[200px]">
                  <strong className="text-base block mb-1">{shelter.name}</strong>
                  <div className="text-red-500 font-bold uppercase mb-2 text-xs">
                    {shelter.type} SHELTER
                  </div>
                  {shelter.distance != null && (
                    <div className="text-gray-300 font-semibold mb-1">
                      {shelter.distance < 1000
                        ? `${Math.round(shelter.distance)}m away`
                        : `${(shelter.distance / 1000).toFixed(1)} km away`}
                    </div>
                  )}
                  {shelter.etas && (
                    <div className="text-gray-400 text-xs mb-3">
                      Walk: {shelter.etas.walk} min &middot; Run: {shelter.etas.run} min
                    </div>
                  )}
                  {nearbyIdx >= 0 && nearbyIdx < 3 && (
                    <div
                      className="mb-2 px-2 py-1 rounded text-xs font-bold text-white text-center"
                      style={{ backgroundColor: ROUTE_COLORS[nearbyIdx] }}
                    >
                      #{nearbyIdx + 1} NEAREST
                    </div>
                  )}
                  <Button
                    onClick={() => handleNavigate(shelter)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-sm rounded-lg"
                  >
                    <Navigation className="mr-1 h-4 w-4" aria-hidden="true" />
                    GET DIRECTIONS
                  </Button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
