"use client"

import type { Shelter, Coordinates } from "@/lib/types"
import ShelterCard from "./shelter-card"
import { Loader2, Shield, MapPin, List, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShelterPanelProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  onOpenDirectory?: () => void
  onOpenShare?: (shelter?: Shelter) => void
}

export default function ShelterPanel({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  onOpenDirectory,
  onOpenShare,
}: ShelterPanelProps) {
  return (
    <div className="flex flex-col h-full" id="shelter-list-content">
      {/* Panel header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-black text-white tracking-wide">
            {isLoading
              ? "SCANNING..."
              : shelters.length > 0
                ? `NEAREST SHELTERS (${shelters.length})`
                : "NEAREST SHELTERS"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onOpenShare && (
            <button
              onClick={() => onOpenShare()}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold text-blue-300 transition-colors"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}
              aria-label="Share a shelter"
            >
              <Share2 className="h-3 w-3" aria-hidden="true" />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Scrollable shelter list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-white text-center" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-3" aria-hidden="true" />
            <p className="text-sm font-bold">Locating Shelters</p>
            <p className="text-xs text-white/45 mt-1">Scanning nearby area...</p>
          </div>
        )}

        {!isLoading && hasLocationError && shelters.every((s) => s.distance === undefined) && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-white" role="alert">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6 text-amber-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold">Location Required</p>
            <p className="text-xs text-white/45 mt-1 max-w-[200px]">
              Enable location to find nearby shelters
            </p>
          </div>
        )}

        {!isLoading && !hasLocationError && shelters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-white" role="status">
            <div className="w-12 h-12 rounded-full bg-white/6 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-white/25" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold">No Shelters Found</p>
            <p className="text-xs text-white/45 mt-1">Move to a populated area</p>
          </div>
        )}

        {!isLoading && shelters.length > 0 && (
          <div role="list" aria-label="Nearby shelters" className="space-y-3">
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
        )}
      </div>

      {/* Footer actions */}
      {onOpenDirectory && (
        <div className="shrink-0 border-t border-white/8 px-3 py-2">
          <Button
            onClick={onOpenDirectory}
            variant="ghost"
            className="w-full text-xs text-white/35 hover:text-white hover:bg-white/6 font-semibold h-9"
          >
            <List className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Browse All Shelters
          </Button>
        </div>
      )}
    </div>
  )
}
