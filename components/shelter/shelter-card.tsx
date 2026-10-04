"use client"

import { useState, useMemo } from "react"
import { Navigation, Car, Share2, Flag, PersonStanding, Zap, ChevronDown } from "lucide-react"
import type { Shelter, Coordinates } from "@/lib/types"
import { SHELTER_TYPES } from "@/lib/types"
import { getShelterDisplayInfo } from "@/lib/shelter-display"
import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import ReportProblemDialog from "@/components/report-problem-dialog"
import { RankBadge } from "./rank-badge"
import { DistanceReadout } from "./distance-readout"
import { ConfidenceBadge } from "./confidence-badge"
import { CapacityTag } from "./capacity-tag"
import { NavigationChooser } from "./navigation-chooser"
import { openDirections, type NavApp } from "./navigation-links"
import { formatEta } from "./format"

interface ShelterCardProps {
  shelter: Shelter
  /** 1-based rank by distance. */
  rank?: number
  userLocation?: Coordinates | null
  /** The nearest shelter: red flag and a stronger frame. */
  isClosest?: boolean
  /** Shows details and actions. Collapsed cards are one-line rows. */
  expanded?: boolean
  /** Makes the header a toggle. Without it the card is always expanded. */
  onToggle?: () => void
  onShare?: (shelter: Shelter) => void
}

export function ShelterCard({
  shelter,
  rank,
  userLocation,
  isClosest,
  expanded = true,
  onToggle,
  onShare,
}: ShelterCardProps) {
  const [chooserOpen, setChooserOpen] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const display = useMemo(() => getShelterDisplayInfo(shelter), [shelter])
  const type = SHELTER_TYPES[shelter.type]
  const hasCoords = !!shelter.coordinates

  // Walking directions open straight away: one tap, no chooser.
  const navigate = () => {
    if (hasCoords) openDirections("google", shelter.coordinates, userLocation, "walking")
  }

  const handleDrive = (app: NavApp) => {
    if (!hasCoords) return
    openDirections(app, shelter.coordinates, userLocation, "driving")
    setChooserOpen(false)
  }

  const header = (
    <>
      {rank != null && <RankBadge rank={rank} className="mt-0.5" />}
      <span className="flex-1 min-w-0 text-left">
        {isClosest && (
          <Chip tone="brand" size="xs" className="mb-1.5">
            <Bi he="הקרוב ביותר" en="Nearest" />
          </Chip>
        )}
        <span className="block text-title font-semibold text-fg leading-snug" dir="auto">
          {display.primaryLine}
        </span>
        {display.secondaryLine && (
          <span className="block text-label text-fg-subtle mt-0.5 truncate" dir="auto">
            {display.secondaryLine}
          </span>
        )}
      </span>
      <span className="flex flex-col items-end flex-shrink-0 pl-2">
        {shelter.distance != null && <DistanceReadout meters={shelter.distance} size={isClosest ? "lg" : "md"} />}
        {shelter.etas && !expanded && (
          <span className="inline-flex items-center gap-1 text-caption text-fg-subtle tabular-nums mt-0.5">
            <PersonStanding className="h-3.5 w-3.5" aria-hidden="true" />
            {formatEta(shelter.etas.walk)}
          </span>
        )}
      </span>
      {onToggle && !isClosest && (
        <ChevronDown
          className={cn("h-4 w-4 text-fg-subtle flex-shrink-0 self-center transition-transform", expanded && "rotate-180")}
          aria-hidden="true"
        />
      )}
    </>
  )

  return (
    <>
      <article
        className={cn(
          "rounded-2xl border transition-colors",
          isClosest ? "bg-surface-2 border-brand/40" : expanded ? "bg-surface-2 border-line-strong" : "bg-surface-2/60 border-line hover:bg-surface-2"
        )}
        aria-label={`${display.primaryLine} - ${isClosest ? "closest " : ""}shelter${
          shelter.distance != null ? `, ${Math.round(shelter.distance)} meters away` : ""
        }`}
      >
        {onToggle && !isClosest ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="w-full flex items-start gap-3 p-4 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
          >
            {header}
          </button>
        ) : (
          <div className="flex items-start gap-3 p-4">{header}</div>
        )}

        {expanded && (
          <div className="px-4 pb-4 -mt-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-fg-muted">
              {type ? <Bi he={type.he} en={type.en} /> : <span>{display.typeLabel}</span>}
              <CapacityTag capacity={shelter.capacity} />
              <ConfidenceBadge confidence={shelter.confidence} />
            </div>

            <div className="flex items-center gap-4 mt-2 text-caption text-fg-subtle">
              {shelter.etas && (
                <>
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap"
                    title="הליכה / Walk"
                    aria-label={`הליכה / Walk ${formatEta(shelter.etas.walk)}`}
                  >
                    <PersonStanding className="h-4 w-4" aria-hidden="true" />
                    <span className="font-semibold text-fg tabular-nums">{formatEta(shelter.etas.walk)}</span>
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap"
                    title="ריצה / Run"
                    aria-label={`ריצה / Run ${formatEta(shelter.etas.run)}`}
                  >
                    <Zap className="h-4 w-4" aria-hidden="true" />
                    <span className="font-semibold text-fg tabular-nums">{formatEta(shelter.etas.run)}</span>
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowReportDialog(true)}
                className="relative ml-auto -mr-2 inline-flex items-center gap-1.5 h-8 px-2 rounded-lg text-fg-subtle hover:text-fg hover:bg-fg/6 transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']"
                aria-label="דווח על בעיה / Report problem"
              >
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                <Bi he="דווח" en="Report" className="flex-nowrap" />
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="primary"
                size="xl"
                className={cn("flex-1 min-w-0 px-4", !isClosest && "shadow-none")}
                onClick={navigate}
                disabled={!hasCoords}
                aria-label={`Walk to shelter${shelter.etas ? `, ${formatEta(shelter.etas.walk)}` : ""}`}
              >
                <Navigation aria-hidden="true" />
                <Bi he="נווט" en="Navigate" className="flex-nowrap" enClassName="max-[359px]:hidden" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-[52px] w-[52px] rounded-2xl"
                onClick={() => setChooserOpen(true)}
                disabled={!hasCoords}
                aria-label="נסיעה / Drive to shelter"
                title="Drive"
              >
                <Car aria-hidden="true" />
              </Button>
              {onShare && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-[52px] w-[52px] rounded-2xl"
                  onClick={() => onShare(shelter)}
                  aria-label="שתף / Share shelter"
                  title="Share"
                >
                  <Share2 aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        )}
      </article>

      <NavigationChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        purpose="drive"
        title={display.primaryLine}
        onSelect={handleDrive}
      />
      <ReportProblemDialog shelter={shelter} open={showReportDialog} onOpenChange={setShowReportDialog} />
    </>
  )
}

export default ShelterCard
