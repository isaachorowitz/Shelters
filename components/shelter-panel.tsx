"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  sidebar?: boolean
}

// Snap points as % of viewport height (from bottom)
const SNAP_PEEK = 0.44   // collapsed: shows handle + first full card with action buttons
const SNAP_HALF = 0.60   // half sheet: shows a couple cards
const SNAP_FULL = 0.85   // full sheet: almost full screen

function snapTo(fraction: number): number {
  if (typeof window === "undefined") return 200
  return Math.round(window.innerHeight * fraction)
}

function nearestSnap(height: number): number {
  const vh = window.innerHeight
  const snaps = [SNAP_PEEK, SNAP_HALF, SNAP_FULL].map((s) => s * vh)
  return snaps.reduce((prev, cur) =>
    Math.abs(cur - height) < Math.abs(prev - height) ? cur : prev
  )
}

function ShelterList({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  onOpenShare,
}: Pick<ShelterPanelProps, "shelters" | "isLoading" | "hasLocationError" | "userLocation" | "onOpenShare">) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white text-center" role="status">
        <Loader2 className="h-7 w-7 animate-spin text-red-500 mb-3" aria-hidden="true" />
        <p className="text-sm font-bold">מחפש מקלטים / Finding Shelters</p>
        <p className="text-xs text-white/40 mt-1">סורק את האזור / Scanning your area...</p>
      </div>
    )
  }
  if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-white" role="alert">
        <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-3">
          <MapPin className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-sm font-bold">נדרש מיקום / Location Needed</p>
        <p className="text-xs text-white/40 mt-1 max-w-[200px]">הפעל מיקום כדי למצוא מקלטים / Turn on location to find shelters</p>
      </div>
    )
  }
  if (shelters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-white" role="status">
        <div className="w-12 h-12 rounded-full bg-white/6 flex items-center justify-center mb-3">
          <Shield className="h-6 w-6 text-white/25" />
        </div>
        <p className="text-sm font-bold">לא נמצאו מקלטים / No Shelters Found</p>
        <p className="text-xs text-white/40 mt-1">עבור לאזור מיושב / Move to a populated area</p>
      </div>
    )
  }
  return (
    <div role="list" aria-label="Nearby shelters" className="space-y-3">
      {shelters.map((shelter, i) => (
        <div key={shelter.id} role="listitem">
          <ShelterCard
            shelter={shelter}
            rank={i + 1}
            userLocation={userLocation}
            onShare={onOpenShare ? (s) => onOpenShare(s) : undefined}
            isClosest={i === 0}
          />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR — desktop only
───────────────────────────────────────────────────────────── */
function SidebarPanel({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  onOpenDirectory,
  onOpenShare,
}: Omit<ShelterPanelProps, "sidebar">) {
  return (
    <div className="flex flex-col h-full" id="shelter-list-content">
      <div className="shrink-0 px-4 py-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm font-black text-white tracking-wide">
            {isLoading ? "מחפש... / FINDING..." : `${shelters.length > 0 ? `${shelters.length} ` : ""}מקלטים קרובים / NEAREST`}
          </span>
        </div>
        {onOpenShare && (
          <button
            onClick={() => onOpenShare()}
            className="no-min-h flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold text-blue-300"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <Share2 className="h-3 w-3" />
            שתף / Share
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        <ShelterList
          shelters={shelters}
          isLoading={isLoading}
          hasLocationError={hasLocationError}
          userLocation={userLocation}
          onOpenShare={onOpenShare}
        />
      </div>
      {onOpenDirectory && (
        <div className="shrink-0 border-t border-white/8 px-3 py-2">
          <Button
            onClick={onOpenDirectory}
            variant="ghost"
            className="no-min-h w-full text-xs text-white/35 hover:text-white hover:bg-white/6 font-semibold h-9"
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            כל המקלטים / Browse All Shelters
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM SHEET — mobile, drag-to-snap
───────────────────────────────────────────────────────────── */
function BottomSheet({
  shelters,
  isLoading,
  hasLocationError,
  userLocation,
  onOpenDirectory,
  onOpenShare,
}: Omit<ShelterPanelProps, "sidebar">) {
  const [height, setHeight] = useState(() => snapTo(SNAP_PEEK))
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startHRef = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  // When shelters arrive, snap to peek (shows full first card)
  useEffect(() => {
    if (!isLoading && shelters.length > 0) {
      setHeight(snapTo(SNAP_PEEK))
    }
  }, [isLoading, shelters.length])

  const clampHeight = (h: number) => {
    const min = snapTo(SNAP_PEEK)
    const max = snapTo(SNAP_FULL)
    return Math.max(min, Math.min(max, h))
  }

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    startHRef.current = height
    setDragging(true)
  }, [height])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    const dy = startYRef.current - e.touches[0].clientY
    setHeight(clampHeight(startHRef.current + dy))
  }, [dragging])

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    setHeight(nearestSnap(height))
  }, [height])

  // Tap handle: cycle through snaps
  const cycleSnap = useCallback(() => {
    const vh = window.innerHeight
    const snaps = [SNAP_PEEK, SNAP_HALF, SNAP_FULL].map((s) => s * vh)
    const cur = height
    const next = snaps.find((s) => s > cur + 10) ?? snaps[0]
    setHeight(next)
  }, [height])

  const nearestDist = shelters[0]?.distance != null
    ? shelters[0].distance < 1000
      ? `${Math.round(shelters[0].distance)}m`
      : `${(shelters[0].distance / 1000).toFixed(1)}km`
    : null

  const isPeek = height <= snapTo(SNAP_PEEK) * 1.1
  const isFull = height >= snapTo(SNAP_FULL) * 0.95
  const sab = "env(safe-area-inset-bottom)"

  return (
    <div
      ref={sheetRef}
      className="fixed left-0 right-0 bottom-0 z-30 flex flex-col"
      style={{
        height: `calc(${height}px + ${sab})`,
        maxHeight: `calc(${SNAP_FULL * 100}dvh + ${sab})`,
        background: "rgba(8,8,8,0.97)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTop: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        transition: dragging ? "none" : "height 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      role="region"
      aria-label="Shelter list"
    >
      {/* ── Drag handle area ── */}
      <div
        className="shrink-0 flex flex-col items-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={cycleSnap}
        role="button"
        aria-label="Drag or tap to resize"
      >
        {/* Pill */}
        <div
          className="w-10 h-1 rounded-full mb-3"
          style={{ background: "rgba(255,255,255,0.22)" }}
          aria-hidden="true"
        />

        {/* Summary row */}
        <div className="flex items-center w-full px-4 pb-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-600/15 flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-black text-white leading-tight tracking-tight">
                {isLoading
                  ? "מחפש מקלטים... / Finding..."
                  : shelters.length > 0
                    ? `${shelters.length} מקלטים קרובים / Nearest`
                    : "לא נמצאו מקלטים / No Shelters"}
              </span>
              {!isLoading && nearestDist && (
                <span className="text-[12px] text-white/45 font-medium leading-tight mt-0.5">
                  הקרוב: <span className="text-red-400 font-bold">{nearestDist}</span>
                  {shelters[0]?.etas && (
                    <span className="text-white/30"> · {shelters[0].etas.walk} min הליכה</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {onOpenShare && !isPeek && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenShare() }}
                className="no-min-h flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold text-blue-300"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <Share2 className="h-3 w-3" />
                שתף
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thin divider */}
      <div className="shrink-0 h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* ── Scrollable content ── */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          paddingBottom: sab,
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-3">
          <ShelterList
            shelters={shelters}
            isLoading={isLoading}
            hasLocationError={hasLocationError}
            userLocation={userLocation}
            onOpenShare={onOpenShare}
          />
        </div>

        {onOpenDirectory && !isLoading && shelters.length > 0 && (
          <div className="px-3 pb-4">
            <button
              onClick={onOpenDirectory}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white/40 active:text-white/70 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <List className="h-4 w-4" />
              כל המקלטים / Browse All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────────────────────── */
export default function ShelterPanel({ sidebar = false, ...props }: ShelterPanelProps) {
  if (sidebar) return <SidebarPanel {...props} />
  return <BottomSheet {...props} />
}
