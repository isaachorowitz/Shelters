"use client"

import type { Shelter, Coordinates } from "@/lib/types"
import ShelterCard from "./shelter-card"
import { ChevronUp, ChevronDown, AlertTriangle, Loader2, Shield, MapPin } from "lucide-react"
import { useState, useEffect } from "react"

interface ShelterPanelProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  isDesktopPanel?: boolean
}

function PanelContent({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
}: Omit<ShelterPanelProps, "isDesktopPanel">) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white text-center" role="status">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" aria-hidden="true" />
        <p className="text-lg font-bold mt-3">LOCATING SHELTERS</p>
        <p className="text-sm text-white/60 mt-1">Scanning nearby area...</p>
      </div>
    )
  }

  if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-white" role="alert">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
          <MapPin className="h-7 w-7 text-amber-400" aria-hidden="true" />
        </div>
        <p className="text-lg font-bold">LOCATION REQUIRED</p>
        <p className="text-sm text-white/60 mt-1 max-w-[250px]">
          Enable location services to find shelters near you
        </p>
      </div>
    )
  }

  if (shelters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-white" role="status">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
          <Shield className="h-7 w-7 text-white/40" aria-hidden="true" />
        </div>
        <p className="text-lg font-bold">NO SHELTERS FOUND</p>
        <p className="text-sm text-white/60 mt-1">Move to a populated area</p>
      </div>
    )
  }

  return (
    <div className="space-y-3" role="list" aria-label="Nearby shelters">
      {shelters.map((shelter, i) => (
        <div key={shelter.id} role="listitem">
          <ShelterCard shelter={shelter} rank={i + 1} userLocation={userLocation} />
        </div>
      ))}
    </div>
  )
}

export default function ShelterPanel({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  isDesktopPanel = false,
}: ShelterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (!isLoading && shelters.length > 0) setIsExpanded(true)
  }, [isLoading, shelters.length])

  if (isDesktopPanel) {
    return (
      <div
        className="h-full w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        role="region"
        aria-label="Shelter list"
      >
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl py-4 px-5 border-b border-white/10 shrink-0">
          <Shield className="h-6 w-6 text-red-500" aria-hidden="true" />
          <h2 className="text-lg font-black text-white">
            {isLoading ? "SCANNING..." : `NEAREST SHELTERS (${shelters.length})`}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <PanelContent
            shelters={shelters}
            isLoading={isLoading}
            hasLocationError={hasLocationError}
            userLocation={userLocation}
          />
        </div>
      </div>
    )
  }

  const toggle = () => setIsExpanded((v) => !v)
  const nearestShelter = shelters[0]
  const nearestDist =
    nearestShelter?.distance != null
      ? nearestShelter.distance < 1000
        ? `${Math.round(nearestShelter.distance)}m`
        : `${(nearestShelter.distance / 1000).toFixed(1)}km`
      : null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full bg-black/95 backdrop-blur-2xl rounded-t-2xl shadow-2xl z-50 transition-[height] duration-300 ease-out overflow-hidden border-t border-white/10 ${
        isExpanded ? "h-[55vh] max-h-[calc(100vh-80px)]" : "h-[72px]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Shelter list"
    >
      {/* Drag handle / header */}
      <button
        className="flex items-center w-full sticky top-0 bg-black/80 backdrop-blur-xl px-4 cursor-pointer h-[72px] border-b border-white/10"
        onClick={toggle}
        aria-expanded={isExpanded}
        aria-controls="shelter-list-content"
        aria-label={isExpanded ? "Collapse shelter list" : "Expand shelter list"}
      >
        {/* Drag indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" aria-hidden="true" />

        <div className="flex items-center gap-2 flex-1 min-w-0 pt-1">
          <Shield className="h-5 w-5 text-red-500 flex-shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-black text-white">
              {isLoading
                ? "SCANNING..."
                : shelters.length > 0
                  ? `${shelters.length} SHELTER${shelters.length > 1 ? "S" : ""} NEARBY`
                  : "NO SHELTERS"}
            </span>
            {!isLoading && nearestDist && (
              <span className="text-xs text-white/50 font-medium">
                Nearest: <span className="text-red-400 font-bold">{nearestDist}</span>
                {nearestShelter?.etas && (
                  <> &middot; {nearestShelter.etas.walk} min walk</>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-white/60">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </div>
      </button>

      {/* Content */}
      <div
        id="shelter-list-content"
        className={`h-[calc(100%-72px)] overflow-y-auto scrollbar-thin transition-opacity duration-200 ${
          isExpanded ? "opacity-100 p-4" : "opacity-0 p-0 pointer-events-none"
        }`}
        style={{ paddingBottom: isExpanded ? "calc(1rem + env(safe-area-inset-bottom))" : 0 }}
      >
        {isExpanded && (
          <PanelContent
            shelters={shelters}
            isLoading={isLoading}
            hasLocationError={hasLocationError}
            userLocation={userLocation}
          />
        )}
      </div>
    </div>
  )
}
