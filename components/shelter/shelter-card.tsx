"use client"

import { useState, useMemo } from "react"
import { Navigation, Eye, AlertTriangle } from "lucide-react"
import type { Shelter, Coordinates } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import ReportProblemDialog from "@/components/report-problem-dialog"
import { RankBadge } from "./rank-badge"
import { DistanceReadout } from "./distance-readout"
import { ConfidenceBadge } from "./confidence-badge"
import { CapacityTag } from "./capacity-tag"
import { TravelModeButton } from "./travel-mode-button"
import { NavigationChooser } from "./navigation-chooser"
import { openDirections, type NavApp } from "./navigation-links"
import { formatDistance, formatEtaParts } from "./format"

interface ShelterCardProps {
  shelter: Shelter
  /** 1-based rank by distance; shows the colored badge. */
  rank?: number
  userLocation?: Coordinates | null
  /**
   * nearby:    big card with ETAs and one-tap navigation (sidebar, bottom sheet).
   * directory: compact row for the full shelter directory.
   */
  variant?: "nearby" | "directory"
  onShowOnMap?: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
  isClosest?: boolean
}

export function ShelterCard({
  shelter,
  rank,
  userLocation,
  variant = "nearby",
  onShowOnMap,
  onShare,
  isClosest,
}: ShelterCardProps) {
  const [chooser, setChooser] = useState<"drive" | "directions" | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const display = useMemo(() => getShelterDisplayInfo(shelter), [shelter])
  const hasCoords = !!shelter.coordinates

  const walk = () => {
    if (hasCoords) openDirections("google", shelter.coordinates, userLocation, "walking")
  }

  const handleChoose = (app: NavApp) => {
    if (!hasCoords) return
    openDirections(app, shelter.coordinates, userLocation, chooser === "drive" ? "driving" : "walking")
    setChooser(null)
  }

  const distanceText = shelter.distance != null ? formatDistance(shelter.distance) : null
  const etaLabel = (minutes?: number) => {
    if (minutes == null) return ""
    const { value, unit } = formatEtaParts(minutes)
    return `, ${value} ${unit}`
  }

  const dialogs = (
    <>
      <NavigationChooser
        open={chooser !== null}
        onOpenChange={(v) => !v && setChooser(null)}
        purpose={chooser ?? "drive"}
        title={display.primaryLine}
        onSelect={handleChoose}
      />
      <ReportProblemDialog shelter={shelter} open={showReportDialog} onOpenChange={setShowReportDialog} />
    </>
  )

  if (variant === "directory") {
    return (
      <>
        <article
          className="bg-surface-4/60 rounded-xl border border-fg/5 overflow-hidden px-3.5 py-2.5"
          aria-label={`${display.primaryLine} - shelter`}
        >
          <h3 className="text-sm font-bold text-fg leading-tight" dir="auto">
            {display.primaryLine}
          </h3>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-xs">
            {display.secondaryLine && (
              <>
                <span className="text-fg/40" dir="auto">{display.secondaryLine}</span>
                <span className="text-fg/20">&middot;</span>
              </>
            )}
            <span className="text-brand-soft/70">{display.typeLabel}</span>
            {shelter.capacity && shelter.capacity > 0 ? (
              <>
                <span className="text-fg/20">&middot;</span>
                <CapacityTag capacity={shelter.capacity} className="text-fg/30" />
              </>
            ) : null}
          </div>

          {display.meaningfulName && (
            <p className="text-caption text-fg/25 mt-0.5 truncate" dir="auto">
              {display.meaningfulName}
            </p>
          )}

          {shelter.confidence && (
            <div className="mt-1">
              <ConfidenceBadge confidence={shelter.confidence} />
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {onShowOnMap && (
              <Button
                onClick={() => onShowOnMap(shelter)}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-fg/60 hover:text-fg hover:bg-fg/10 font-semibold px-3"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                הצג במפה / Show on Map
              </Button>
            )}
            <Button
              onClick={() => setChooser("directions")}
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-brand-soft hover:text-brand-softer hover:bg-brand-bright/10 font-semibold px-3"
            >
              <Navigation className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              נווט / Directions
            </Button>
            <Button
              onClick={() => setShowReportDialog(true)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-fg/30 hover:text-warn hover:bg-warn-muted/10 font-semibold px-2 ml-auto"
              aria-label="דווח על בעיה / Report problem"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </article>
        {dialogs}
      </>
    )
  }

  return (
    <>
      <article
        className={cn(
          "card-press rounded-2xl overflow-hidden",
          isClosest ? "bg-brand/8 border-2 border-brand/50 shadow-glow-brand" : "bg-surface-4/95 border border-fg/8"
        )}
        aria-label={`${display.primaryLine} - ${isClosest ? "closest " : ""}shelter${distanceText ? `, ${distanceText} away` : ""}`}
      >
        {isClosest && (
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
            <Chip tone="highlight" size="xs">המקלט הקרוב / Closest Shelter</Chip>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          {rank != null && <RankBadge rank={rank} />}
          <div className="flex-1 min-w-0">
            <h3 className="text-title font-bold text-fg leading-snug" dir="auto">
              {display.primaryLine}
            </h3>
            {display.secondaryLine && (
              <p className="text-label text-fg/40 mt-0.5 truncate" dir="auto">
                {display.secondaryLine}
              </p>
            )}
          </div>
          {distanceText && <DistanceReadout text={distanceText} />}
        </div>

        <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
          <Chip tone="brand">{display.typeLabel}</Chip>
          <CapacityTag capacity={shelter.capacity} className="text-caption text-fg/25" />
          {shelter.confidence && <ConfidenceBadge confidence={shelter.confidence} />}
        </div>

        <div className="flex gap-1.5 px-3 pb-3">
          <TravelModeButton
            mode="walk"
            etaMinutes={shelter.etas?.walk}
            disabled={!hasCoords}
            onClick={walk}
            aria-label={`Walk to shelter${etaLabel(shelter.etas?.walk)}`}
          />
          <TravelModeButton
            mode="run"
            etaMinutes={shelter.etas?.run}
            disabled={!hasCoords}
            onClick={walk}
            aria-label={`Run to shelter${etaLabel(shelter.etas?.run)}`}
          />
          <TravelModeButton
            mode="drive"
            disabled={!hasCoords}
            onClick={() => setChooser("drive")}
            aria-label="Drive to shelter"
          />
          {onShare && (
            <TravelModeButton mode="share" onClick={() => onShare(shelter)} aria-label="שתף / Share shelter" />
          )}
          <TravelModeButton
            mode="report"
            onClick={() => setShowReportDialog(true)}
            aria-label="דווח על בעיה / Report problem"
          />
        </div>
      </article>
      {dialogs}
    </>
  )
}

export default ShelterCard
