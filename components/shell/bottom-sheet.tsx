import type { ReactNode, TouchEvent } from "react"
import { SHEET_SNAPS, SHEET_PEEK_MIN_PX } from "@/lib/design/layout"
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
  /** Summary row under the grab handle, always visible. */
  summary: ReactNode
  /** Controls that ride on the sheet's top edge (e.g. the locate button). */
  accessory?: ReactNode
  /** Hides the accessory (when the sheet is fully open). */
  hideAccessory?: boolean
  children: ReactNode
  className?: string
}

/**
 * Phone bottom sheet that sits over the map. Pure layout: pair it with
 * useSheetSnap() for drag and snap behavior.
 */
export function BottomSheet({
  label,
  height,
  dragging,
  handleProps,
  summary,
  accessory,
  hideAccessory,
  children,
  className,
}: BottomSheetProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-sheet flex flex-col bg-surface-1/95 backdrop-blur-xl rounded-t-sheet border-t border-line-strong shadow-sheet",
        !dragging && "transition-[height] duration-sheet ease-spring",
        className
      )}
      style={{
        height:
          height === null
            ? `calc(max(${SHEET_SNAPS.peek * 100}dvh, ${SHEET_PEEK_MIN_PX}px) + ${SAB})`
            : `calc(${height}px + ${SAB})`,
        maxHeight: `calc(${SHEET_SNAPS.full * 100}dvh + ${SAB})`,
      }}
      role="region"
      aria-label={label}
    >
      {accessory && (
        <div
          className={cn(
            "absolute bottom-full right-3 mb-3 flex flex-col gap-2 transition-opacity duration-200",
            hideAccessory && "opacity-0 pointer-events-none"
          )}
        >
          {accessory}
        </div>
      )}

      {/* Grab area */}
      <div
        className="shrink-0 flex flex-col items-center pt-2 cursor-grab active:cursor-grabbing touch-none"
        {...handleProps}
        role="button"
        aria-label="Drag or tap to resize"
      >
        <div className="w-9 h-1 rounded-full bg-fg/25" aria-hidden="true" />
        <div className="flex items-center w-full px-4 pt-2.5 pb-3">{summary}</div>
      </div>

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
