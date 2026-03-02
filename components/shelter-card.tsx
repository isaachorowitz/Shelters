"use client"

import type { Shelter } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { Button } from "@/components/ui/button"
import {
  PersonStanding,
  PlayIcon as Run,
  Car,
  Navigation,
  MapPin,
  Map,
  ExternalLink,
  Users,
  Eye,
  Share2,
} from "lucide-react"
import { useState, useCallback, useMemo } from "react"

interface ShelterCardProps {
  shelter: Shelter
  rank?: number
  userLocation?: { lat: number; lng: number } | null
  variant?: "nearby" | "directory"
  onShowOnMap?: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
  isClosest?: boolean
}

function formatEta(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(Math.round(minutes)), unit: "min" }
  const hours = minutes / 60
  if (hours > 99) return { value: ">99", unit: "hr" }
  return { value: hours < 10 ? hours.toFixed(1) : String(Math.round(hours)), unit: "hr" }
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
  const [showDriveModal, setShowDriveModal] = useState(false)
  const [showNavModal, setShowNavModal] = useState(false)
  const display = useMemo(() => getShelterDisplayInfo(shelter), [shelter])

  // Walk / Run → Google Maps walking directions (direct, no modal)
  const openWalkNav = useCallback(() => {
    if (!shelter.coordinates) return
    const dest = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""
    const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ""}&destination=${dest}&travelmode=walking`
    window.open(url, "_blank", "noopener,noreferrer")
  }, [shelter.coordinates, userLocation])

  // Drive → Waze or Google Maps driving
  const openDriveNav = useCallback(
    (app: "google" | "waze") => {
      if (!shelter.coordinates) return
      const dest = `${shelter.coordinates.lat},${shelter.coordinates.lng}`
      if (app === "waze") {
        window.open(`waze://?ll=${dest}&navigate=yes`, "_blank", "noopener,noreferrer")
      } else {
        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""
        const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ""}&destination=${dest}&travelmode=driving`
        window.open(url, "_blank", "noopener,noreferrer")
      }
      setShowDriveModal(false)
    },
    [shelter.coordinates, userLocation]
  )

  // Legacy navigate for directory variant
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
        : shelter.distance < 100_000
          ? `${(shelter.distance / 1000).toFixed(1)}km`
          : `${Math.round(shelter.distance / 1000).toLocaleString()}km`
      : null

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
          <h3 className="text-sm font-bold text-white leading-tight" dir="auto">
            {display.primaryLine}
          </h3>

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

          {display.meaningfulName && (
            <p className="text-[11px] text-white/25 mt-0.5 truncate" dir="auto">
              {display.meaningfulName}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {onShowOnMap && (
              <Button
                onClick={() => onShowOnMap(shelter)}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/60 hover:text-white hover:bg-white/10 font-semibold px-3"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                הצג במפה / Show on Map
              </Button>
            )}
            <Button
              onClick={() => setShowNavModal(true)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold px-3"
            >
              <Navigation className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              נווט / Directions
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
  const walkEta = shelter.etas ? formatEta(shelter.etas.walk) : null
  const runEta = shelter.etas ? formatEta(shelter.etas.run) : null

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
              המקלט הקרוב / Closest Shelter
            </span>
          </div>
        )}

        {/* Top bar: rank badge + info + distance */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
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
            <div className="flex flex-col items-end flex-shrink-0 max-w-[90px]">
              <span className={`font-black text-white leading-none ${distanceText.length > 6 ? "text-base" : "text-[22px]"}`}>
                {distanceText}
              </span>
              <span className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wide mt-0.5">מרחק</span>
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

        {/* Navigation action buttons — Walk / Run / Drive + Share */}
        <div className="flex gap-1.5 px-3 pb-3">
          {/* Walk */}
          <button
            onClick={openWalkNav}
            disabled={!shelter.coordinates}
            className="card-press flex-1 flex flex-col items-center py-2.5 rounded-xl disabled:opacity-40"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}
            aria-label={`Walk to shelter${walkEta ? `, ${walkEta.value} ${walkEta.unit}` : ""}`}
          >
            <div className="flex items-center gap-1">
              <PersonStanding className="h-4 w-4 text-green-400" aria-hidden="true" />
              {walkEta && (
                <span className="text-[13px] font-black text-white">
                  {walkEta.value}<span className="text-[9px] text-white/40 ml-0.5">{walkEta.unit}</span>
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold text-green-400/70 mt-0.5">הליכה Walk</span>
          </button>

          {/* Run */}
          <button
            onClick={openWalkNav}
            disabled={!shelter.coordinates}
            className="card-press flex-1 flex flex-col items-center py-2.5 rounded-xl disabled:opacity-40"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
            aria-label={`Run to shelter${runEta ? `, ${runEta.value} ${runEta.unit}` : ""}`}
          >
            <div className="flex items-center gap-1">
              <Run className="h-4 w-4 text-amber-400" aria-hidden="true" />
              {runEta && (
                <span className="text-[13px] font-black text-white">
                  {runEta.value}<span className="text-[9px] text-white/40 ml-0.5">{runEta.unit}</span>
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold text-amber-400/70 mt-0.5">ריצה Run</span>
          </button>

          {/* Drive */}
          <button
            onClick={() => setShowDriveModal(true)}
            disabled={!shelter.coordinates}
            className="card-press flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl disabled:opacity-40"
            style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}
            aria-label="Drive to shelter"
          >
            <Car className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-blue-400/70 mt-0.5">נסיעה Drive</span>
          </button>

          {/* Share */}
          {onShare && (
            <button
              onClick={() => onShare(shelter)}
              className="card-press w-11 flex flex-col items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              aria-label="שתף / Share shelter"
            >
              <Share2 className="h-4 w-4 text-white/50" aria-hidden="true" />
              <span className="text-[8px] font-semibold text-white/30 mt-0.5">שתף</span>
            </button>
          )}
        </div>
      </article>

      <DriveChooser
        open={showDriveModal}
        onOpenChange={setShowDriveModal}
        primaryLine={display.primaryLine}
        onNavigate={openDriveNav}
      />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   DRIVE CHOOSER — Waze or Google Maps (driving mode)
───────────────────────────────────────────────────────────── */
function DriveChooser({
  open,
  onOpenChange,
  primaryLine,
  onNavigate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  primaryLine: string
  onNavigate: (app: "google" | "waze") => void
}) {
  if (!open) return null
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
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
        aria-label="בחר אפליקציית ניווט / Choose navigation app"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        <div className="px-5 pt-2 pb-4 border-b border-white/6">
          <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest text-center">נווט עם / Drive with</p>
          <p className="text-[15px] font-bold text-white text-center mt-1 truncate px-4" dir="auto">{primaryLine}</p>
        </div>

        <div className="p-4 space-y-2.5">
          <button
            onClick={() => onNavigate("waze")}
            className="card-press w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
            style={{ background: "rgba(51,204,255,0.1)", border: "1px solid rgba(51,204,255,0.15)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(51,204,255,0.15)" }}
            >
              <Navigation className="h-5 w-5 text-[#33ccff]" aria-hidden="true" />
            </div>
            <span className="text-[16px] font-bold text-[#33ccff]">Waze</span>
            <ExternalLink className="h-4 w-4 ml-auto opacity-30 text-[#33ccff]" aria-hidden="true" />
          </button>

          <button
            onClick={() => onNavigate("google")}
            className="card-press w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
            style={{ background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.15)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(66,133,244,0.15)" }}
            >
              <Map className="h-5 w-5 text-[#4285F4]" aria-hidden="true" />
            </div>
            <span className="text-[16px] font-bold text-[#4285F4]">Google Maps</span>
            <ExternalLink className="h-4 w-4 ml-auto opacity-30 text-[#4285F4]" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="card-press w-full py-4 rounded-2xl text-[16px] font-bold text-white/60"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            ביטול / Cancel
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAV MODAL — for directory variant (all nav options)
───────────────────────────────────────────────────────────── */
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
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
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
        aria-label="בחר אפליקציית ניווט / Choose navigation app"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        <div className="px-5 pt-2 pb-4 border-b border-white/6">
          <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest text-center">נווט אל / Get Directions to</p>
          <p className="text-[15px] font-bold text-white text-center mt-1 truncate px-4" dir="auto">{primaryLine}</p>
        </div>

        <div className="p-4 space-y-2.5">
          {[
            { type: "google" as const, label: "Google Maps", icon: Map, color: "#4285F4", bg: "rgba(66,133,244,0.12)" },
            { type: "apple" as const, label: "Apple Maps", icon: MapPin, color: "#ffffff", bg: "rgba(255,255,255,0.08)" },
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

        <div className="px-4 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="card-press w-full py-4 rounded-2xl text-[16px] font-bold text-white/60"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            ביטול / Cancel
          </button>
        </div>
      </div>
    </>
  )
}
