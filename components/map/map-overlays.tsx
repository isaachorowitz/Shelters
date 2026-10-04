import type { ReactNode } from "react"
import { AlertTriangle, LocateFixed, MapPin, RefreshCw, SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Spinner } from "@/components/ui/spinner"

/* Everything that floats over the map. */

/** Column pinned to the top of the map that stacks status pills and banners. */
export function MapTopStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-3 inset-x-3 z-map-overlay flex flex-col items-center gap-2 [&>*]:pointer-events-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Frosted pill used for map status messages. */
function MapPill({ children, className, role }: { children: ReactNode; className?: string; role?: "status" | "alert" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 h-11 px-4 rounded-full bg-surface-2/95 backdrop-blur-md border border-line-strong shadow-popover text-label font-medium text-fg",
        className
      )}
      role={role}
    >
      {children}
    </div>
  )
}

/** Recenter the map on the user. */
export function LocateButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <IconButton label="Go to my location" tone="glass" size="lg" onClick={onClick} className={cn("text-info", className)}>
      <LocateFixed />
    </IconButton>
  )
}

/** "Finding you…" while geolocation runs. */
export function LocatingPill({ className }: { className?: string }) {
  return (
    <MapPill className={cn("pointer-events-none", className)} role="status">
      <Spinner className="h-4 w-4" />
      <Bi he="מאתר מיקום" en="Finding you…" />
    </MapPill>
  )
}

/** Shown after the user moved far enough that distances are stale. */
export function UpdateLocationButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-press flex items-center gap-2.5 h-11 px-4 rounded-full bg-warn text-bg text-label font-semibold shadow-popover hover:bg-warn/90",
        className
      )}
      aria-label="Update shelter distances for new location"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      <Bi he="עדכן מקלטים" en="Update" />
    </button>
  )
}

/** Location is outside Israel; nudges the user to search. */
export function OutsideIsraelBanner({ className }: { className?: string }) {
  return (
    <MapPill className={cn("border-warn/40", className)} role="alert">
      <SearchX className="h-4 w-4 text-warn flex-shrink-0" aria-hidden="true" />
      <Bi he="מחוץ לישראל — חפש כתובת" en="Outside Israel" />
    </MapPill>
  )
}

/** Geolocation failed for a reason other than permission. */
export function LocationErrorCard({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-md flex items-center gap-3 p-3 pl-4 rounded-2xl bg-surface-2/95 backdrop-blur-md border border-brand/40 shadow-popover",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-brand-bright flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 text-label font-medium text-fg">{message}</span>
      <Button size="sm" variant="secondary" onClick={onRetry} className="flex-shrink-0" aria-label="Retry getting location">
        <Bi he="נסה שוב" en="Retry" />
      </Button>
    </div>
  )
}

/** Location permission denied. Covers the map with an allow button and an address search. */
export function PermissionPrompt({ onAllow, search, className }: { onAllow?: () => void; search?: ReactNode; className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 bg-scrim/70 backdrop-blur-md z-map-modal flex items-center justify-center p-4", className)}
      role="dialog"
      aria-modal="true"
      aria-label="Location permission required"
    >
      <div className="bg-panel rounded-3xl p-6 max-w-sm w-full border border-line-strong shadow-popover">
        <div className="w-14 h-14 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
          <MapPin className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-heading font-semibold text-fg tracking-tight">
          <Bi he="נדרש מיקום" en="Location needed" layout="stack" enClassName="text-title text-fg-muted font-medium" />
        </h2>
        <p className="text-body text-fg-muted mt-3">
          <span lang="he" dir="rtl" className="block text-left">אפשר גישה למיקום כדי למצוא מקלטים קרובים</span>
          <span lang="en" className="block mt-1">Allow location to find shelters near you.</span>
        </p>
        <Button variant="primary" size="xl" className="w-full mt-6" onClick={onAllow} aria-label="Enable location access">
          <LocateFixed aria-hidden="true" />
          <Bi he="אפשר מיקום" en="Allow location" />
        </Button>
        <div className="flex items-center gap-3 my-5 text-caption text-fg-subtle">
          <span className="h-px flex-1 bg-line" />
          <Bi he="או חפש כתובת" en="or search an address" />
          <span className="h-px flex-1 bg-line" />
        </div>
        {search}
      </div>
    </div>
  )
}
