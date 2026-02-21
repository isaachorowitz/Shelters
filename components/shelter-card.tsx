"use client"

import type { Shelter } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  PersonStanding,
  Bike,
  Zap,
  PlayIcon as Run,
  Navigation,
  MapPin,
  Map,
  Smartphone,
  ExternalLink,
} from "lucide-react"
import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ShelterCardProps {
  shelter: Shelter
  rank?: number
  userLocation?: { lat: number; lng: number } | null
}

const SHELTER_TYPE_LABELS: Record<string, string> = {
  underground: "Underground",
  emergency: "Emergency",
  medical: "Medical",
  public: "Public",
  community: "Community",
  "safe-haven": "Safe Haven",
}

export default function ShelterCard({ shelter, rank, userLocation }: ShelterCardProps) {
  const [showNavModal, setShowNavModal] = useState(false)

  const handleNavigate = useCallback(
    (mapType: "google" | "apple" | "waze") => {
      if (!shelter.coordinates) return
      const dest = `${shelter.coordinates.lat},${shelter.coordinates.lng}`

      let url: string
      switch (mapType) {
        case "apple":
          url = `maps://?daddr=${dest}&dirflg=w`
          break
        case "waze":
          url = `waze://?ll=${dest}&navigate=yes`
          break
        default: {
          const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""
          url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ""}&destination=${dest}&travelmode=walking`
          break
        }
      }
      window.open(url, "_blank", "noopener,noreferrer")
      setShowNavModal(false)
    },
    [shelter.coordinates, userLocation]
  )

  const distanceText =
    shelter.distance != null
      ? shelter.distance < 1000
        ? `${Math.round(shelter.distance)}m`
        : `${(shelter.distance / 1000).toFixed(1)}km`
      : null

  const typeLabel = SHELTER_TYPE_LABELS[shelter.type] ?? shelter.type

  return (
    <>
      <article
        className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
        aria-label={`${shelter.name} - ${typeLabel} shelter${distanceText ? `, ${distanceText} away` : ""}`}
      >
        {/* Top bar with rank indicator */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          {rank != null && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0 ${
                rank === 1
                  ? "bg-red-600"
                  : rank === 2
                    ? "bg-orange-600"
                    : "bg-amber-600"
              }`}
              aria-label={`Number ${rank} nearest`}
            >
              {rank}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-tight truncate">
              {shelter.name}
            </h3>
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              {typeLabel}
            </span>
          </div>
          {distanceText && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <MapPin className="h-4 w-4 text-red-400" aria-hidden="true" />
              <span className="text-lg font-black text-white">{distanceText}</span>
            </div>
          )}
        </div>

        {/* ETA grid */}
        {shelter.etas && (
          <div className="grid grid-cols-4 gap-1 px-3 py-2" role="list" aria-label="Estimated travel times">
            {[
              { icon: PersonStanding, label: shelter.etas.walk, mode: "Walk", color: "text-green-400" },
              { icon: Run, label: shelter.etas.run, mode: "Run", color: "text-amber-400" },
              { icon: Bike, label: shelter.etas.cycle, mode: "Bike", color: "text-blue-400" },
              { icon: Zap, label: shelter.etas.scooter, mode: "Scooter", color: "text-purple-400" },
            ].map((eta) => (
              <div
                key={eta.mode}
                className="flex flex-col items-center py-1.5 rounded-lg bg-white/5"
                role="listitem"
                aria-label={`${eta.mode}: ${eta.label} minutes`}
              >
                <eta.icon className={`h-4 w-4 ${eta.color}`} aria-hidden="true" />
                <span className="text-sm font-bold text-white mt-0.5">{eta.label}</span>
                <span className="text-[9px] text-white/50 font-medium uppercase">{eta.mode}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigate button */}
        <div className="px-3 pb-3 pt-1">
          <Button
            onClick={() => setShowNavModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
            disabled={!shelter.coordinates}
            aria-label={`Navigate to ${shelter.name}`}
          >
            <Navigation className="mr-2 h-5 w-5" aria-hidden="true" />
            NAVIGATE
          </Button>
        </div>
      </article>

      <Dialog open={showNavModal} onOpenChange={setShowNavModal}>
        <DialogContent className="bg-neutral-950 border-2 border-red-500/40 text-white max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center">
              CHOOSE NAVIGATION
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 text-sm">
              Walking directions to {shelter.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 mt-3">
            <Button
              onClick={() => handleNavigate("google")}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Map className="h-5 w-5" aria-hidden="true" />
              Google Maps
              <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
            </Button>

            <Button
              onClick={() => handleNavigate("apple")}
              className="w-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Smartphone className="h-5 w-5" aria-hidden="true" />
              Apple Maps
              <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
            </Button>

            <Button
              onClick={() => handleNavigate("waze")}
              className="w-full bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-500 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
            >
              <Navigation className="h-5 w-5" aria-hidden="true" />
              Waze
              <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
