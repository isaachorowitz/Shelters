"use client"

import { useEffect } from "react"
import { Shield, List, Share2 } from "lucide-react"
import type { Shelter } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/shell/sidebar"
import { BottomSheet } from "@/components/shell/bottom-sheet"
import { useSheetSnap } from "@/components/shell/use-sheet-snap"
import { ShelterList, type ShelterListProps } from "./shelter-list"
import { formatDistanceShort } from "./format"

interface NearbyPanelProps extends ShelterListProps {
  onOpenDirectory?: () => void
  className?: string
}

/* ─────────────────────────────────────────────────────────────
   SHARE PILL — small blue "share" action in panel headers
───────────────────────────────────────────────────────────── */

export function SharePill({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-min-h flex items-center gap-1 px-2.5 py-1.5 rounded-full text-caption font-bold text-info-soft bg-info-strong/12 border border-info-strong/20"
    >
      <Share2 className="h-3 w-3" />
      {label}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   DESKTOP — sidebar next to the map
───────────────────────────────────────────────────────────── */

export function NearbySidebar({ onOpenDirectory, className, ...list }: NearbyPanelProps) {
  const { shelters, isLoading, onOpenShare } = list
  return (
    <Sidebar
      className={className}
      label="Nearest shelters"
      contentId="shelter-list-content"
      header={
        <>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-bright flex-shrink-0" />
            <span className="text-sm font-black text-fg tracking-wide">
              {isLoading
                ? "מחפש... / FINDING..."
                : `${shelters.length > 0 ? `${shelters.length} ` : ""}מקלטים קרובים / NEAREST`}
            </span>
          </div>
          {onOpenShare && <SharePill label="שתף / Share" onClick={() => onOpenShare()} />}
        </>
      }
      footer={
        onOpenDirectory && (
          <Button
            onClick={onOpenDirectory}
            variant="ghost"
            className="no-min-h w-full text-xs text-fg/35 hover:text-fg hover:bg-fg/6 font-semibold h-9"
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            כל המקלטים / Browse All Shelters
          </Button>
        )
      }
    >
      <ShelterList {...list} />
    </Sidebar>
  )
}

/* ─────────────────────────────────────────────────────────────
   PHONE — draggable bottom sheet over the map
───────────────────────────────────────────────────────────── */

export function NearbySheetSummary({
  shelters,
  isLoading,
  showShare,
  onShare,
}: {
  shelters: Shelter[]
  isLoading: boolean
  showShare?: boolean
  onShare?: () => void
}) {
  const nearest = shelters[0]
  const nearestDist = nearest?.distance != null ? formatDistanceShort(nearest.distance) : null
  return (
    <>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-brand-bright" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-title font-black text-fg leading-tight tracking-tight">
            {isLoading
              ? "מחפש מקלטים... / Finding..."
              : shelters.length > 0
                ? `${shelters.length} מקלטים קרובים / Nearest`
                : "לא נמצאו מקלטים / No Shelters"}
          </span>
          {!isLoading && nearestDist && (
            <span className="text-label text-fg/45 font-medium leading-tight mt-0.5">
              הקרוב: <span className="text-brand-soft font-bold">{nearestDist}</span>
              {nearest?.etas && <span className="text-fg/30"> · {nearest.etas.walk} min הליכה</span>}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {showShare && onShare && (
          <SharePill
            label="שתף"
            onClick={(e) => {
              e.stopPropagation()
              onShare()
            }}
          />
        )}
      </div>
    </>
  )
}

export function BrowseAllButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-fg/40 active:text-fg/70 transition-colors bg-fg/4 border border-fg/7",
        className
      )}
    >
      <List className="h-4 w-4" />
      כל המקלטים / Browse All
    </button>
  )
}

export function NearbySheet({ onOpenDirectory, ...list }: NearbyPanelProps) {
  const { shelters, isLoading, onOpenShare } = list
  const sheet = useSheetSnap()
  const { snapToPeek } = sheet

  // When shelters arrive, snap to peek (shows the full first card)
  useEffect(() => {
    if (!isLoading && shelters.length > 0) snapToPeek()
  }, [isLoading, shelters.length, snapToPeek])

  return (
    <BottomSheet
      label="Shelter list"
      height={sheet.height}
      dragging={sheet.dragging}
      handleProps={sheet.handleProps}
      summary={
        <NearbySheetSummary
          shelters={shelters}
          isLoading={isLoading}
          showShare={!sheet.isPeek}
          onShare={onOpenShare ? () => onOpenShare() : undefined}
        />
      }
    >
      <div className="px-3 py-3">
        <ShelterList {...list} />
      </div>
      {onOpenDirectory && !isLoading && shelters.length > 0 && (
        <div className="px-3 pb-4">
          <BrowseAllButton onClick={onOpenDirectory} />
        </div>
      )}
    </BottomSheet>
  )
}
