"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"

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
L.Marker.prototype.options.icon = defaultIcon

import type { Shelter, Coordinates } from "@/lib/types"
import { useEffect } from "react"

interface MapViewProps {
  userLocation: Coordinates | null
  shelters: Shelter[] // All shelters for markers
  mapHeight?: string
}

function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

export default function MapView({ userLocation, shelters, mapHeight = "100vh" }: MapViewProps) {
  const defaultCenter: LatLngExpression = [37.7749, -122.4194] // San Francisco
  const currentCenter: LatLngExpression = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter
  const currentZoom = userLocation ? 14 : 10

  return (
    <div style={{ height: mapHeight, width: "100%" }} className="z-0 bg-neutral-800">
      <MapContainer
        center={currentCenter}
        zoom={currentZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-map-container" // For potential global styling
      >
        <ChangeView center={currentCenter} zoom={currentZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tiles
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {shelters.map((shelter) => (
          <Marker key={shelter.id} position={[shelter.coordinates.lat, shelter.coordinates.lng]}>
            <Popup>
              <strong className="text-base">{shelter.name}</strong>
              <br />
              Type: {shelter.type}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
