import type { ReactNode, TouchEvent } from "react"
import { SHEET_SNAPS } from "@/lib/design/layout"
import { cn } from "@/lib/utils"

const SAB = "env(safe-area-inset-bottom)"

export interface SheetHandleProps {
  onTouchStart?: (e: TouchEvent) => void
  onTouchMove?: (e: TouchEvent) => void
  onTouchEnd?: () => void
  onClick?: () => void
}

interface BottomSheetProps {
  /** Accessible name for the region. */
  label: string
  /** Current height in px; null renders the peek height from CSS. */
  height: number | null
  /** Turns the height transition off while a finger is moving the sheet. */
  dragging?: boolean
  /** Touch and tap handlers for the grab area (see useSheetSnap). */
  handleProps?: SheetHandleProps
  /** Summary row under the grab pill, always visible. */
  summary: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Mobile bottom sheet that sits over the map. Pure layout: pair it with
 * useSheetSnap() for drag and snap behavior.
 */
export function BottomSheet({ label, height, dragging, handleProps, summary, children, className }: BottomSheetProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-sheet flex flex-col bg-surface-1/97 rounded-t-sheet border-t border-fg/9 shadow-sheet backdrop-blur-xl",
        !dragging && "transition-[height] duration-sheet ease-spring",
        className
      )}
      style={{
        height: height === null ? `calc(${SHEET_SNAPS.peek * 100}dvh + ${SAB})` : `calc(${height}px + ${SAB})`,
        maxHeight: `calc(${SHEET_SNAPS.full * 100}dvh + ${SAB})`,
      }}
      role="region"
      aria-label={label}
    >
      {/* Grab area */}
      <div
        className="shrink-0 flex flex-col items-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
        {...handleProps}
        role="button"
        aria-label="Drag or tap to resize"
      >
        <div className="w-10 h-1 rounded-full mb-3 bg-fg/22" aria-hidden="true" />
        <div className="flex items-center w-full px-4 pb-2">{summary}</div>
      </div>

      <div className="shrink-0 h-px mx-4 bg-fg/7" />

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain pb-safe [-webkit-overflow-scrolling:touch]"
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
