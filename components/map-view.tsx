"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import L from "leaflet"
import { useEffect, useState } from "react"
import type { Shelter, Coordinates } from "@/lib/types"
import { AlertTriangle } from "lucide-react"

// Import Leaflet's CSS (already in layout, but good for component encapsulation if moved)
// import 'leaflet/dist/leaflet.css';

// Default icon fix for Next.js
// These paths assume images are in public/leaflet-images/ or served correctly by leaflet package
// For Next.js, direct CDN or properly configured public assets might be needed if imports fail.
// Using unpkg for icon images as a robust solution for environments like Next.js.
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Bomb shelter icon (red)
const shelterIcon = L.divIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.6);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'shelter-marker'
})

// Custom user location icon (blue dot)
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3B82F6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>
      <div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: 28px;
        height: 28px;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        opacity: 0.3;
        animation: pulse 2s infinite;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: 'user-location-marker'
})

L.Marker.prototype.options.icon = defaultIcon

interface MapViewProps {
  userLocation: Coordinates | null
  shelters: Shelter[]
  mapHeight?: string
  onLocationUpdate?: (location: Coordinates) => void
}

// Israel bounds to restrict map view
const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [29.5, 34.2], // Southwest
  [33.3, 35.9]  // Northeast
]

function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
    // Restrict to Israel region
    map.setMaxBounds(ISRAEL_BOUNDS)
    map.setMinZoom(7)
  }, [map, center, zoom])
  return null
}

function LocationTracker({ onLocationUpdate }: { onLocationUpdate?: (location: Coordinates) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (!navigator.geolocation) return

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        // Update map center smoothly
        map.flyTo([newLocation.lat, newLocation.lng], map.getZoom(), {
          duration: 1
        })
        
        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate(newLocation)
        }
      },
      (error) => {
        console.error("Location tracking error:", error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [map, onLocationUpdate])

  return null
}

export default function MapView({ userLocation, shelters, mapHeight = "100vh", onLocationUpdate }: MapViewProps) {
  // Default to Tel Aviv center
  const defaultCenter: LatLngExpression = [32.0853, 34.7818]
  const currentCenter: LatLngExpression = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter
  const currentZoom = userLocation ? 16 : 13

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.3;
        }
        50% {
          transform: scale(1.5);
          opacity: 0.1;
        }
        100% {
          transform: scale(1);
          opacity: 0.3;
        }
      }
      .leaflet-container {
        background: #0a0a0a;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{ height: mapHeight, width: "100%" }} className="relative z-0 bg-black">
      <MapContainer
        center={currentCenter}
        zoom={currentZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-map-container"
        zoomControl={false}
        maxBounds={ISRAEL_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <ChangeView center={currentCenter} zoom={currentZoom} />
        <LocationTracker onLocationUpdate={onLocationUpdate} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          minZoom={7}
        />
        
        {/* User location with accuracy circle */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={100} // 100 meter accuracy radius
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.5
              }}
            />
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <strong>YOUR LOCATION</strong>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Bomb shelter markers */}
        {shelters.map((shelter) => (
          <Marker 
            key={shelter.id} 
            position={[shelter.coordinates.lat, shelter.coordinates.lng]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="text-sm font-bold">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <strong className="text-base">{shelter.name}</strong>
                </div>
                <div className="text-red-600 font-bold uppercase">{shelter.type} SHELTER</div>
                {shelter.distance && (
                  <div className="text-gray-700 mt-1 font-semibold">
                    {(shelter.distance / 1000).toFixed(1)} km away
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
