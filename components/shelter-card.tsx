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
  isClosest?: boolean
}

export default function ShelterCard({
  shelter,
  rank,
  userLocation,
  variant = "nearby",
  onShowOnMap,
  onShare,
  isClosest,
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
              Directions / נווט
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
        className="card-press rounded-2xl overflow-hidden"
        style={{
          background: isClosest ? "rgba(220,38,38,0.08)" : "rgba(22,22,22,0.95)",
          border: isClosest ? "2px solid rgba(220,38,38,0.5)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isClosest ? "0 0 20px rgba(220,38,38,0.15)" : undefined,
        }}
        aria-label={`${display.primaryLine} - ${isClosest ? "closest " : ""}shelter${distanceText ? `, ${distanceText} away` : ""}`}
      >
        {/* Closest badge */}
        {isClosest && (
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(220,38,38,0.25)", color: "#FCA5A5" }}
            >
              Closest Shelter
            </span>
          </div>
        )}

        {/* Top bar: rank badge + info + distance */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          {rank != null && (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-base text-white flex-shrink-0 shadow-lg ${
                rank === 1 ? "bg-red-600 shadow-red-600/30"
                : rank === 2 ? "bg-orange-500 shadow-orange-500/30"
                : rank === 3 ? "bg-amber-500 shadow-amber-500/30"
                : rank === 4 ? "bg-green-500 shadow-green-500/30"
                : "bg-blue-500 shadow-blue-500/30"
              }`}
              aria-label={`Number ${rank} nearest`}
            >
              {rank}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-white leading-snug" dir="auto">
              {display.primaryLine}
            </h3>
            {display.secondaryLine && (
              <p className="text-[12px] text-white/40 mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}
          </div>
          {distanceText && (
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[22px] font-black text-white leading-none">{distanceText}</span>
              <span className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wide mt-0.5">away</span>
            </div>
          )}
        </div>

        {/* Type chip */}
        <div className="flex items-center gap-1.5 px-4 pb-2">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(220,38,38,0.12)", color: "rgba(252,165,165,0.85)" }}
          >
            {typeChip}
          </span>
          {capacityChip && (
            <span className="text-[11px] text-white/25 flex items-center gap-0.5">
              <Users className="h-3 w-3" aria-hidden="true" />
              {capacityChip}
            </span>
          )}
        </div>

        {/* ETA grid */}
        {shelter.etas && (
          <div
            className="grid grid-cols-4 gap-1.5 mx-3 mb-3 p-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)" }}
            role="list"
            aria-label="Estimated travel times"
          >
            {[
              { icon: PersonStanding, label: shelter.etas.walk, mode: "Walk", unit: "min", color: "#4ade80" },
              { icon: Run, label: shelter.etas.run, mode: "Run", unit: "min", color: "#fbbf24" },
              { icon: Bike, label: shelter.etas.cycle, mode: "Bike", unit: "min", color: "#60a5fa" },
              { icon: Zap, label: shelter.etas.scooter, mode: "Scooter", unit: "min", color: "#c084fc" },
            ].map((eta) => (
              <div
                key={eta.mode}
                className="flex flex-col items-center py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)" }}
                role="listitem"
                aria-label={`${eta.mode}: ${eta.label} minutes`}
              >
                <eta.icon className="h-4 w-4" style={{ color: eta.color }} aria-hidden="true" />
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-[15px] font-black text-white leading-none">{eta.label}</span>
                  <span className="text-[9px] text-white/40 font-bold">{eta.unit}</span>
                </div>
                <span className="text-[9px] text-white/35 font-semibold uppercase tracking-wide mt-0.5">{eta.mode}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="px-3 pb-3 flex gap-2">
          <button
            onClick={() => setShowNavModal(true)}
            disabled={!shelter.coordinates}
            className="card-press flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[15px] text-white disabled:opacity-40"
            style={{
              background: "#DC2626",
              boxShadow: "0 4px 20px rgba(220,38,38,0.35)",
            }}
            aria-label="Get directions to shelter"
          >
            <Navigation className="h-5 w-5" aria-hidden="true" />
            Get Directions
          </button>
          {onShare && (
            <button
              onClick={() => onShare(shelter)}
              className="card-press w-14 flex items-center justify-center rounded-2xl text-blue-400"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.22)",
              }}
              aria-label="Share shelter"
            >
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </button>
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
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Action sheet — slides up from bottom like iOS */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
        style={{
          background: "rgba(18,18,18,0.99)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -12px 60px rgba(0,0,0,0.8)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Choose navigation app"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Title */}
        <div className="px-5 pt-2 pb-4 border-b border-white/6">
          <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest text-center">Get Directions to</p>
          <p className="text-[15px] font-bold text-white text-center mt-1 truncate px-4" dir="auto">{primaryLine}</p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2.5">
          {[
            { type: "google" as const, label: "Google Maps", icon: Map, color: "#4285F4", bg: "rgba(66,133,244,0.12)" },
            { type: "apple" as const, label: "Apple Maps", icon: Smartphone, color: "#ffffff", bg: "rgba(255,255,255,0.08)" },
            { type: "waze" as const, label: "Waze", icon: Navigation, color: "#33ccff", bg: "rgba(51,204,255,0.1)" },
          ].map(({ type, label, icon: Icon, color, bg }) => (
            <button
              key={type}
              onClick={() => onNavigate(type)}
              className="card-press w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
              style={{ background: bg, border: `1px solid ${color}22` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              </div>
              <span className="text-[16px] font-bold" style={{ color }}>{label}</span>
              <ExternalLink className="h-4 w-4 ml-auto opacity-30" style={{ color }} aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Cancel */}
        <div className="px-4 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="card-press w-full py-4 rounded-2xl text-[16px] font-bold text-white/60"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
