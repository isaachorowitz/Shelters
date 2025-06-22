"use client"

import type { Shelter } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonStanding, Bike, Zap, PlayIcon as Run, Navigation, MapPin, AlertTriangle } from "lucide-react"

interface ShelterCardProps {
  shelter: Shelter
  userLocation?: { lat: number; lng: number } | null
}

export default function ShelterCard({ shelter, userLocation }: ShelterCardProps) {
  const handleNavigate = () => {
    if (shelter.coordinates) {
      const destination = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
      
      // Detect platform
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      const isAndroid = /Android/.test(navigator.userAgent)
      
      let mapsUrl
      
      if (isIOS) {
        // Apple Maps with walking directions
        mapsUrl = `maps://?daddr=${destination}&dirflg=w`
      } else if (isAndroid) {
        // Google Maps app on Android
        mapsUrl = `google.navigation:q=${destination}&mode=w`
      } else {
        // Web fallback with walking directions
        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
        mapsUrl = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=walking`
      }

      // Try to open the URL
      window.open(mapsUrl, "_blank", "noopener,noreferrer")
    }
  }

  const etaItems = shelter.etas
    ? [
        { icon: PersonStanding, label: shelter.etas.walk, color: "text-green-400", mode: "WALK", bgColor: "bg-green-500/20" },
        { icon: Run, label: shelter.etas.run, color: "text-amber-400", mode: "RUN", bgColor: "bg-amber-500/20" },
        { icon: Bike, label: shelter.etas.cycle, color: "text-blue-400", mode: "BIKE", bgColor: "bg-blue-500/20" },
        { icon: Zap, label: shelter.etas.scooter, color: "text-purple-400", mode: "SCOOTER", bgColor: "bg-purple-500/20" },
      ]
    : []

  const getShelterTypeColor = (type: string) => {
    switch (type) {
      case 'underground':
        return 'bg-red-600/90 text-white'
      case 'emergency':
        return 'bg-orange-600/90 text-white'
      case 'medical':
        return 'bg-blue-600/90 text-white'
      default:
        return 'bg-yellow-600/90 text-white'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex flex-col gap-3 border border-white/20 hover:border-white/40 transition-all duration-200">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
            {shelter.name}
          </h3>
          <Badge
            variant="secondary"
            className={`text-xs font-bold uppercase whitespace-nowrap px-2 py-1 rounded-md ${getShelterTypeColor(shelter.type)}`}
          >
            {shelter.type}
          </Badge>
        </div>
        {shelter.distance !== undefined && (
          <p className="text-sm text-white/90 flex items-center font-medium">
            <MapPin className="h-4 w-4 mr-1.5 text-red-400" />
            <span className="text-xl font-bold text-white">
              {shelter.distance < 1000
                ? `${shelter.distance.toFixed(0)}m`
                : `${(shelter.distance / 1000).toFixed(1)}km`}
            </span>
            <span className="ml-1 text-white/70">away</span>
          </p>
        )}
      </div>

      {shelter.etas && etaItems.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {etaItems.map((eta, index) => (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 p-2 ${eta.bgColor} backdrop-blur-sm rounded-lg border border-white/10`}
              title={`${eta.mode} ETA`}
            >
              <eta.icon className={`h-5 w-5 ${eta.color}`} />
              <span className="text-xs font-bold text-white">{eta.label}'</span>
              <span className="text-[10px] text-white/70 font-medium">{eta.mode}</span>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleNavigate}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-base rounded-xl transition-all duration-200 active:scale-95 shadow-lg hover:shadow-red-600/50"
        disabled={!shelter.coordinates}
        aria-label={`Navigate to ${shelter.name}`}
      >
        <Navigation className="mr-2 h-5 w-5" />
        GET TO SAFETY NOW
      </Button>
    </div>
  )
}
