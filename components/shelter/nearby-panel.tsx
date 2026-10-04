"use client"

import { useEffect, type ReactNode } from "react"
import { List, Share2 } from "lucide-react"
import type { Shelter } from "@/lib/types"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { IconButton } from "@/components/ui/icon-button"
import { Sidebar } from "@/components/shell/sidebar"
import { BottomSheet } from "@/components/shell/bottom-sheet"
import { useSheetSnap } from "@/components/shell/use-sheet-snap"
import { ShelterList, type ShelterListProps } from "./shelter-list"

interface NearbyPanelProps extends ShelterListProps {
  onOpenDirectory?: () => void
  className?: string
}

/* ─────────────────────────────────────────────────────────────
   HEADER — title, count, share; shared by sidebar and sheet
───────────────────────────────────────────────────────────── */

export function NearbyHeader({
  shelters,
  isLoading,
  onShare,
}: {
  shelters: Shelter[]
  isLoading: boolean
  onShare?: () => void
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-body font-semibold text-fg">
            <Bi he="מקלטים קרובים" en="Nearby shelters" />
          </h2>
          {!isLoading && shelters.length > 0 && <Chip tone="neutral">{shelters.length}</Chip>}
        </div>
      </div>
      {onShare && (
        <IconButton
          label="שתף / Share"
          tone="surface"
          size="md"
          onClick={(e) => {
            e.stopPropagation()
            onShare()
          }}
        >
          <Share2 />
        </IconButton>
      )}
    </div>
  )
}

export function BrowseAllButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button variant="secondary" size="lg" className={className ?? "w-full"} onClick={onClick}>
      <List aria-hidden="true" />
      <Bi he="כל המקלטים" en="Browse all shelters" />
    </Button>
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
      header={<NearbyHeader shelters={shelters} isLoading={isLoading} onShare={onOpenShare ? () => onOpenShare() : undefined} />}
      footer={onOpenDirectory && <BrowseAllButton onClick={onOpenDirectory} />}
    >
      <ShelterList {...list} />
    </Sidebar>
  )
}

/* ─────────────────────────────────────────────────────────────
   PHONE — draggable bottom sheet over the map
───────────────────────────────────────────────────────────── */

interface NearbySheetProps extends NearbyPanelProps {
  /** Controls riding on the sheet's top edge, e.g. the locate button. */
  accessory?: ReactNode
}

export function NearbySheet({ onOpenDirectory, accessory, ...list }: NearbySheetProps) {
  const { shelters, isLoading, onOpenShare } = list
  const sheet = useSheetSnap()
  const { snapToPeek } = sheet

  // When shelters arrive, snap to peek (shows the full nearest card)
  useEffect(() => {
    if (!isLoading && shelters.length > 0) snapToPeek()
  }, [isLoading, shelters.length, snapToPeek])

  return (
    <BottomSheet
      label="Shelter list"
      height={sheet.height}
      dragging={sheet.dragging}
      handleProps={sheet.handleProps}
      accessory={accessory}
      hideAccessory={sheet.isFull}
      summary={<NearbyHeader shelters={shelters} isLoading={isLoading} onShare={onOpenShare ? () => onOpenShare() : undefined} />}
    >
      <div className="px-3">
        <ShelterList {...list} />
      </div>
      {onOpenDirectory && !isLoading && shelters.length > 0 && (
        <div className="px-3 pt-3 pb-4">
          <BrowseAllButton onClick={onOpenDirectory} />
        </div>
      )}
    </BottomSheet>
  )
}
