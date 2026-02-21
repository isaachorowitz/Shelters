"use client"

import type { Shelter, Coordinates } from "@/lib/types"
import ShelterCard from "./shelter-card"
import { ChevronUp, ChevronDown, AlertTriangle, Loader2, Shield, MapPin, List, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ShelterPanelProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  isDesktopPanel?: boolean
  onOpenDirectory?: () => void
  onOpenShare?: (shelter?: Shelter) => void
}

function PanelContent({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  onOpenDirectory,
  onOpenShare,
}: Omit<ShelterPanelProps, "isDesktopPanel" | "onOpenShare"> & { onOpenShare?: (shelter?: Shelter) => void }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-white text-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" aria-hidden="true" />
        <p className="text-base font-bold mt-3">Locating Shelters</p>
        <p className="text-sm text-white/50 mt-1">Scanning nearby area...</p>
      </div>
    )
  }

  if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-white" role="alert">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
          <MapPin className="h-6 w-6 text-amber-400" aria-hidden="true" />
        </div>
        <p className="text-base font-bold">Location Required</p>
        <p className="text-sm text-white/50 mt-1 max-w-[220px]">
          Enable location to find nearby shelters
        </p>
      </div>
    )
  }

  if (shelters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-white" role="status">
        <div className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center mb-3">
          <Shield className="h-6 w-6 text-white/30" aria-hidden="true" />
        </div>
        <p className="text-base font-bold">No Shelters Found</p>
        <p className="text-sm text-white/50 mt-1">Move to a populated area</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3" role="list" aria-label="Nearby shelters">
        {shelters.map((shelter, i) => (
          <div key={shelter.id} role="listitem">
            <ShelterCard
              shelter={shelter}
              rank={i + 1}
              userLocation={userLocation}
              onShare={onOpenShare ? (s) => onOpenShare(s) : undefined}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {onOpenShare && (
          <Button
            onClick={() => onOpenShare()}
            variant="ghost"
            className="flex-1 text-xs text-blue-400/70 hover:text-blue-300 hover:bg-blue-500/10 font-semibold h-9"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Share
          </Button>
        )}
        {onOpenDirectory && (
          <Button
            onClick={onOpenDirectory}
            variant="ghost"
            className="flex-1 text-xs text-white/35 hover:text-white hover:bg-white/8 font-semibold h-9"
          >
            <List className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            All Shelters
          </Button>
        )}
      </div>
    </>
  )
}

export default function ShelterPanel({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  isDesktopPanel = false,
  onOpenDirectory,
  onOpenShare,
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
        <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl py-3 px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" aria-hidden="true" />
            <h2 className="text-sm font-black text-white tracking-wide">
              {isLoading ? "SCANNING..." : `NEAREST SHELTERS (${shelters.length})`}
            </h2>
          </div>
          {onOpenShare && (
            <button
              onClick={() => onOpenShare()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-blue-300 transition-colors"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}
              aria-label="Share a shelter"
            >
              <Share2 className="h-3 w-3" aria-hidden="true" />
              Share
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <PanelContent
            shelters={shelters}
            isLoading={isLoading}
            hasLocationError={hasLocationError}
            userLocation={userLocation}
            onOpenDirectory={onOpenDirectory}
            onOpenShare={onOpenShare}
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
      className={`fixed bottom-0 left-0 right-0 w-full bg-black/95 backdrop-blur-2xl rounded-t-2xl shadow-2xl z-20 transition-[height] duration-300 ease-out overflow-hidden border-t border-white/10 ${
        isExpanded ? "h-[55vh] max-h-[calc(100vh-100px)]" : "h-[68px]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Shelter list"
    >
      {/* Drag handle / header */}
      <button
        className="flex items-center w-full sticky top-0 bg-black/80 backdrop-blur-xl px-4 cursor-pointer h-[68px] border-b border-white/8"
        onClick={toggle}
        aria-expanded={isExpanded}
        aria-controls="shelter-list-content"
        aria-label={isExpanded ? "Collapse shelter list" : "Expand shelter list"}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/15 rounded-full" aria-hidden="true" />

        <div className="flex items-center gap-2 flex-1 min-w-0 pt-1">
          <Shield className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-black text-white leading-tight">
              {isLoading
                ? "SCANNING..."
                : shelters.length > 0
                  ? `${shelters.length} NEAREST SHELTERS`
                  : "NO SHELTERS"}
            </span>
            {!isLoading && nearestDist && (
              <span className="text-xs text-white/45 font-medium">
                Closest: <span className="text-red-400 font-bold">{nearestDist}</span>
                {nearestShelter?.etas && (
                  <> · {nearestShelter.etas.walk} min walk</>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenShare && isExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenShare() }}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold text-blue-300 transition-colors"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}
              aria-label="Share a shelter"
            >
              <Share2 className="h-3 w-3" aria-hidden="true" />
              Share
            </button>
          )}
          <div className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        id="shelter-list-content"
        className={`h-[calc(100%-68px)] overflow-y-auto scrollbar-thin transition-opacity duration-200 ${
          isExpanded ? "opacity-100 p-3" : "opacity-0 p-0 pointer-events-none"
        }`}
        style={{ paddingBottom: isExpanded ? "calc(0.75rem + env(safe-area-inset-bottom))" : 0 }}
      >
        {isExpanded && (
          <PanelContent
            shelters={shelters}
            isLoading={isLoading}
            hasLocationError={hasLocationError}
            userLocation={userLocation}
            onOpenDirectory={onOpenDirectory}
            onOpenShare={onOpenShare}
          />
        )}
      </div>
    </div>
  )
}
