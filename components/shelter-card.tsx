"use client"

import type { Shelter } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonStanding, Bike, Zap, PlayIcon as Run, Navigation, MapPin } from "lucide-react"

interface ShelterCardProps {
  shelter: Shelter
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
  const handleNavigate = () => {
    if (shelter.coordinates) {
      const destination = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
      // Universal link that tries Apple Maps first on iOS, then Google Maps, then web Google Maps
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      let mapsUrl
      if (isIOS) {
        mapsUrl = `maps://?daddr=${destination}&dirflg=d` // d for driving, w for walking, r for transit
      } else {
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`
      }

      // Fallback for web if native app fails or not available
      const webMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`

      // Attempt to open native app, then fallback
      // This is a simplified approach; more robust solutions might use a timeout
      const newWindow = window.open(mapsUrl, "_blank")
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // If popup was blocked or failed to open, try web URL
        window.open(webMapsUrl, "_blank", "noopener,noreferrer")
      }
    }
  }

  const etaItems = shelter.etas
    ? [
        { icon: Run, label: shelter.etas.run, color: "text-amber-400", mode: "Running" },
        { icon: PersonStanding, label: shelter.etas.walk, color: "text-green-400", mode: "Walking" },
        { icon: Bike, label: shelter.etas.cycle, color: "text-blue-400", mode: "Cycling" },
        { icon: Zap, label: shelter.etas.scooter, color: "text-purple-400", mode: "Scooter" },
      ]
    : []

  return (
    <div className="bg-neutral-700/60 backdrop-blur-sm p-4 rounded-xl shadow-lg flex flex-col gap-3.5 border border-neutral-600/50 hover:border-neutral-500/70 transition-colors duration-200">
      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-lg font-semibold text-white leading-tight">{shelter.name}</h3>
          <Badge
            variant="secondary"
            className="text-xs bg-sky-500/80 text-white hover:bg-sky-500 whitespace-nowrap px-2 py-1 rounded-md"
          >
            {shelter.type}
          </Badge>
        </div>
        {shelter.distance !== undefined && (
          <p className="text-sm text-neutral-300 flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 text-primary/80" />
            {shelter.distance < 1000
              ? `${shelter.distance.toFixed(0)} m`
              : `${(shelter.distance / 1000).toFixed(1)} km`}{" "}
            away
          </p>
        )}
      </div>

      {shelter.etas && etaItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-neutral-200">
          {etaItems.map((eta, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 p-1.5 bg-neutral-600/50 rounded-md text-xs leading-tight"
              title={`${eta.mode} ETA`}
            >
              <eta.icon className={`h-4 w-4 ${eta.color}`} />
              <span>{eta.label} min</span>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleNavigate}
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground mt-1.5 py-3 text-base font-medium rounded-lg"
        disabled={!shelter.coordinates}
        aria-label={`Navigate to ${shelter.name}`}
      >
        <Navigation className="mr-2 h-5 w-5" />
        Navigate
      </Button>
    </div>
  )
}
