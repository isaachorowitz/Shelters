"use client"

import type { Shelter } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonStanding, Bike, Zap, PlayIcon as Run, Navigation, MapPin, AlertTriangle, Map, Smartphone } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ShelterCardProps {
  shelter: Shelter
  userLocation?: { lat: number; lng: number } | null
}

export default function ShelterCard({ shelter, userLocation }: ShelterCardProps) {
  const [showNavigationModal, setShowNavigationModal] = useState(false)

  const handleNavigate = (mapType: 'google' | 'apple' | 'waze') => {
    if (shelter.coordinates) {
      const destination = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
      
      let mapsUrl
      
      switch(mapType) {
        case 'apple':
          mapsUrl = `maps://?daddr=${destination}&dirflg=w`
          break
        case 'waze':
          mapsUrl = `waze://?ll=${destination}&navigate=yes`
          break
        case 'google':
        default:
          const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
          mapsUrl = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=walking`
          break
      }

      window.open(mapsUrl, "_blank", "noopener,noreferrer")
      setShowNavigationModal(false)
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
    <>
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
                <span className="text-xs font-bold text-white">{eta.label}m</span>
                <span className="text-[10px] text-white/70 font-medium">{eta.mode}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => setShowNavigationModal(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-base rounded-xl transition-all duration-200 active:scale-95 shadow-lg hover:shadow-red-600/50"
          disabled={!shelter.coordinates}
          aria-label={`Navigate to ${shelter.name}`}
        >
          <Navigation className="mr-2 h-5 w-5" />
          GET TO SAFETY NOW
        </Button>
      </div>

      <Dialog open={showNavigationModal} onOpenChange={setShowNavigationModal}>
        <DialogContent className="bg-black/95 border-2 border-red-500/50 text-white max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              NAVIGATE TO SHELTER
            </DialogTitle>
            <DialogDescription className="text-center text-white/80 font-semibold">
              Choose your navigation app
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => handleNavigate('google')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Map className="h-6 w-6" />
              Google Maps
            </Button>
            
            <Button
              onClick={() => handleNavigate('apple')}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Smartphone className="h-6 w-6" />
              Apple Maps
            </Button>
            
            <Button
              onClick={() => handleNavigate('waze')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Navigation className="h-6 w-6" />
              Waze
            </Button>
          </div>
          
          <p className="text-xs text-white/50 text-center mt-4">
            Walking directions to {shelter.name}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
