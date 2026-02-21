"use client"

import type { Shelter } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
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
  Users,
  Eye,
  Share2,
} from "lucide-react"
import { useState, useCallback, useMemo } from "react"
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
  variant?: "nearby" | "directory"
  onShowOnMap?: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
}

export default function ShelterCard({
  shelter,
  rank,
  userLocation,
  variant = "nearby",
  onShowOnMap,
  onShare,
}: ShelterCardProps) {
  const [showNavModal, setShowNavModal] = useState(false)
  const display = useMemo(() => getShelterDisplayInfo(shelter), [shelter])

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

  // Build the inline detail chips: type + capacity
  const typeChip = display.typeLabel
  const capacityChip =
    shelter.capacity && shelter.capacity > 0 ? `${shelter.capacity} ppl` : null

  if (variant === "directory") {
    return (
      <>
        <article
          className="bg-neutral-900/60 rounded-xl border border-white/5 overflow-hidden px-3.5 py-2.5"
          aria-label={`${display.primaryLine} - shelter`}
        >
          {/* Primary: address / best available text */}
          <h3 className="text-sm font-bold text-white leading-tight" dir="auto">
            {display.primaryLine}
          </h3>

          {/* Secondary line + type + capacity inline */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {display.secondaryLine && (
              <span className="text-xs text-white/40" dir="auto">
                {display.secondaryLine}
              </span>
            )}
            {display.secondaryLine && <span className="text-white/20 text-xs">&middot;</span>}
            <span className="text-xs text-red-400/70">{typeChip}</span>
            {capacityChip && (
              <>
                <span className="text-white/20 text-xs">&middot;</span>
                <span className="text-xs text-white/30 flex items-center gap-0.5">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {capacityChip}
                </span>
              </>
            )}
          </div>

          {/* Meaningful name subtitle if different from primary */}
          {display.meaningfulName && (
            <p className="text-[11px] text-white/25 mt-0.5 truncate" dir="auto">
              {display.meaningfulName}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2">
            {onShowOnMap && (
              <Button
                onClick={() => onShowOnMap(shelter)}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/60 hover:text-white hover:bg-white/10 font-semibold px-3"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Show on Map / הצג במפה
              </Button>
            )}
            <Button
              onClick={() => setShowNavModal(true)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold px-3"
            >
              <Navigation className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Navigate / נווט
            </Button>
          </div>
        </article>

        <NavModal
          open={showNavModal}
          onOpenChange={setShowNavModal}
          primaryLine={display.primaryLine}
          onNavigate={handleNavigate}
        />
      </>
    )
  }

  // variant === "nearby" (default)
  return (
    <>
      <article
        className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
        aria-label={`${display.primaryLine} - shelter${distanceText ? `, ${distanceText} away` : ""}`}
      >
        {/* Top bar: rank + primary info + distance */}
        <div className="flex items-start gap-3 px-4 pt-3 pb-1">
          {rank != null && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0 mt-0.5 ${
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
            {/* Primary: address or best available */}
            <h3 className="text-base font-bold text-white leading-tight" dir="auto">
              {display.primaryLine}
            </h3>

            {/* Secondary: neighborhood, city */}
            {display.secondaryLine && (
              <p className="text-xs text-white/40 mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}

            {/* Meaningful name if not already shown */}
            {display.meaningfulName && (
              <p className="text-[11px] text-white/25 mt-0.5 truncate" dir="auto">
                {display.meaningfulName}
              </p>
            )}
          </div>
          {distanceText && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-red-400" aria-hidden="true" />
              <span className="text-lg font-black text-white">{distanceText}</span>
            </div>
          )}
        </div>

        {/* Type + capacity inline */}
        <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
          <span className="text-xs font-semibold text-red-400/70" dir="auto">{typeChip}</span>
          {capacityChip && (
            <>
              <span className="text-white/20 text-xs">&middot;</span>
              <span className="text-xs text-white/30 flex items-center gap-0.5">
                <Users className="h-3 w-3" aria-hidden="true" />
                {capacityChip}
              </span>
            </>
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

        {/* Navigate + Share buttons */}
        <div className="px-3 pb-3 pt-1 flex gap-2">
          <Button
            onClick={() => setShowNavModal(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
            disabled={!shelter.coordinates}
            aria-label="Navigate to shelter"
          >
            <Navigation className="mr-2 h-5 w-5" aria-hidden="true" />
            NAVIGATE
          </Button>
          {onShare && (
            <Button
              onClick={() => onShare(shelter)}
              variant="ghost"
              className="w-12 h-auto bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/25 text-blue-400 rounded-xl transition-all flex-shrink-0"
              aria-label="Share shelter"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </article>

      <NavModal
        open={showNavModal}
        onOpenChange={setShowNavModal}
        primaryLine={display.primaryLine}
        onNavigate={handleNavigate}
      />
    </>
  )
}

function NavModal({
  open,
  onOpenChange,
  primaryLine,
  onNavigate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  primaryLine: string
  onNavigate: (mapType: "google" | "apple" | "waze") => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-2 border-red-500/40 text-white max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center">
            CHOOSE NAVIGATION
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 text-sm" dir="auto">
            Walking directions to {primaryLine}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-3">
          <Button
            onClick={() => onNavigate("google")}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
          >
            <Map className="h-5 w-5" aria-hidden="true" />
            Google Maps
            <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
          </Button>

          <Button
            onClick={() => onNavigate("apple")}
            className="w-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
          >
            <Smartphone className="h-5 w-5" aria-hidden="true" />
            Apple Maps
            <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
          </Button>

          <Button
            onClick={() => onNavigate("waze")}
            className="w-full bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-500 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3"
          >
            <Navigation className="h-5 w-5" aria-hidden="true" />
            Waze
            <ExternalLink className="h-4 w-4 ml-auto opacity-50" aria-hidden="true" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
