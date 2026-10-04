import type { ReactNode } from "react"
import { LocateFixed, MapPin, RefreshCw, SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Spinner } from "@/components/ui/spinner"

/* Everything that floats over the map. All positioned absolutely inside <main>. */

/** Recenter the map on the user. Top-left of the map. */
export function LocateButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <IconButton
      label="Go to my location"
      tone="glass"
      size="lg"
      onClick={onClick}
      className={cn("absolute top-4 left-3 z-map-overlay text-info", className)}
    >
      <LocateFixed />
    </IconButton>
  )
}

/** "Finding you…" status pill while geolocation runs. Top-center. */
export function LocatingPill({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute top-4 left-1/2 z-map-overlay -translate-x-1/2", className)}
      role="status"
      aria-label="Finding your location"
    >
      <div className="flex items-center gap-2.5 rounded-full bg-scrim/85 backdrop-blur-md border border-fg/10 px-4 py-2 shadow-xl">
        <Spinner className="h-4 w-4 text-brand-soft" />
        <span className="text-sm font-semibold text-fg">מאתר מיקום / Finding you…</span>
      </div>
    </div>
  )
}

/** Shown after the user moved far enough that distances are stale. Top-center. */
export function UpdateLocationButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 z-map-overlay bg-warn-strong hover:bg-warn-press text-fg font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 text-sm",
        className
      )}
      aria-label="Update shelter distances for new location"
    >
      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
      עדכן מקלטים / UPDATE
    </Button>
  )
}

/** Location is outside Israel; nudges the user to search. Bottom-center. */
export function OutsideIsraelBanner({ className }: { className?: string }) {
  return (
    <div className={cn("absolute bottom-6 left-1/2 -translate-x-1/2 z-map-overlay", className)} role="alert">
      <div className="flex items-center gap-2 bg-warn-deep/95 backdrop-blur-md border border-warn-strong/40 text-fg rounded-full px-4 py-2 shadow-xl whitespace-nowrap">
        <SearchX className="h-3.5 w-3.5 text-warn-soft flex-shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold">מחוץ לישראל — חפש כתובת / Outside Israel</span>
      </div>
    </div>
  )
}

/** Geolocation failed for a reason other than permission. Top, full width. */
export function LocationErrorCard({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div
      className={cn(
        "absolute top-4 left-3 right-3 max-w-md mx-auto z-map-overlay bg-danger-deep/90 border border-brand-strong text-fg rounded-xl px-4 py-3",
        className
      )}
      role="alert"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{message}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="text-fg hover:text-fg hover:bg-brand-strong/50 font-bold flex-shrink-0"
          aria-label="Retry getting location"
        >
          נסה שוב / RETRY
        </Button>
      </div>
    </div>
  )
}

/** Location permission denied. Covers the map with an allow button and an address search. */
export function PermissionPrompt({ onAllow, search, className }: { onAllow?: () => void; search?: ReactNode; className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 bg-scrim/80 backdrop-blur-md z-map-modal flex items-center justify-center p-4", className)}
      role="dialog"
      aria-modal="true"
      aria-label="Location permission required"
    >
      <div className="bg-panel rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-bright/40">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-bright/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-brand-bright" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-fg mb-2">נדרש מיקום / LOCATION NEEDED</h2>
          <p className="text-fg/70 mb-4 text-sm leading-relaxed">
            אפשר גישה למיקום כדי למצוא מקלטים קרובים / Allow location to find shelters near you.
          </p>
          <Button
            onClick={onAllow}
            className="w-full bg-brand hover:bg-brand-strong text-fg font-bold py-4 text-lg rounded-xl mb-4"
            aria-label="Enable location access"
          >
            אפשר מיקום / ALLOW LOCATION
          </Button>
          <p className="text-xs text-fg/50 mb-3">או חפש כתובת / Or search an address:</p>
          {search}
        </div>
      </div>
    </div>
  )
}
