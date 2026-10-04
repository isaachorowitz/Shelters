"use client"

import { MapPin, LocateFixed, X } from "lucide-react"
import type { Coordinates } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SearchField } from "@/components/ui/search-field"
import { useAddressSearch, formatResult, type NominatimResult } from "./use-address-search"

/* ─────────────────────────────────────────────────────────────
   RESULTS — suggestion dropdown under the field
───────────────────────────────────────────────────────────── */

export interface AddressSuggestion {
  id: string | number
  label: string
}

export function AddressResults({
  suggestions,
  onSelect,
  className,
}: {
  suggestions: AddressSuggestion[]
  onSelect: (id: AddressSuggestion["id"]) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-[calc(100%+6px)] max-h-[min(300px,50vh)] rounded-2xl overflow-hidden overflow-y-auto overscroll-contain bg-surface-2 border border-fg/15 shadow-popover z-popover",
        className
      )}
      role="listbox"
      aria-label="Address suggestions"
    >
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onTouchEnd={(e) => {
            e.preventDefault()
            onSelect(s.id)
          }}
          onClick={() => onSelect(s.id)}
          className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b border-fg/5 last:border-0 hover:bg-fg/6 active:bg-fg/10"
          role="option"
          aria-selected={false}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-bright/15">
            <MapPin className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
          </div>
          <span className="text-sm leading-snug text-fg/90" dir="auto">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE LOCATION — orange pill while a searched address is pinned
───────────────────────────────────────────────────────────── */

export function ActiveLocationPill({
  label,
  onReturnToMe,
  onClear,
  className,
}: {
  label: string
  /** Shown only when the user's own location is known. */
  onReturnToMe?: () => void
  onClear?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-[calc(100%+4px)] flex items-center gap-2 px-3 py-2 rounded-xl mt-1 bg-warn-pin/92 border border-warn-pin-edge/30 shadow-pin z-popover",
        className
      )}
    >
      <MapPin className="h-3.5 w-3.5 text-warn-pin-soft flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 text-xs font-semibold text-fg truncate" dir="auto" title={label}>
        {label}
      </span>
      {onReturnToMe && (
        <button
          type="button"
          onClick={onReturnToMe}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-bold text-fg flex-shrink-0 transition-colors bg-fg/15 hover:bg-fg/25 active:bg-fg/30"
          aria-label="המיקום שלי / Return to my location"
        >
          <LocateFixed className="h-3 w-3" />
          המיקום שלי
        </button>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 transition-colors bg-fg/10 hover:bg-fg/20 active:bg-fg/25"
          aria-label="Clear search"
        >
          <X className="h-3 w-3 text-fg" />
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ADDRESS SEARCH — field + suggestions + active pill
───────────────────────────────────────────────────────────── */

interface AddressSearchProps {
  onLocationSelect: (coords: Coordinates, label: string) => void
  /** Label of the address currently overriding the user's location. */
  activeLabel?: string
  onClearActive?: () => void
  hasUserLocation?: boolean
  className?: string
  placeholder?: string
}

export function AddressSearch({
  onLocationSelect,
  activeLabel,
  onClearActive,
  hasUserLocation,
  className,
  placeholder = "חפש כתובת... / Search address...",
}: AddressSearchProps) {
  const search = useAddressSearch(onLocationSelect)
  const byId = new Map<AddressSuggestion["id"], NominatimResult>(search.results.map((r) => [r.place_id, r]))

  return (
    <div ref={search.containerRef} className={cn("relative", className)}>
      <SearchField
        ref={search.inputRef}
        value={search.query}
        loading={search.isSearching}
        onChange={(e) => search.onQueryChange(e.target.value)}
        onFocus={search.onFocus}
        onClear={search.clear}
        placeholder={placeholder}
        aria-label="חפש כתובת / Search for an address in Israel"
      />

      {search.showResults && search.results.length > 0 && (
        <AddressResults
          suggestions={search.results.map((r) => ({ id: r.place_id, label: formatResult(r) }))}
          onSelect={(id) => {
            const r = byId.get(id)
            if (r) search.select(r)
          }}
        />
      )}

      {activeLabel && !search.showResults && (
        <ActiveLocationPill
          label={activeLabel}
          onReturnToMe={hasUserLocation ? onClearActive : undefined}
          onClear={onClearActive}
        />
      )}
    </div>
  )
}

export default AddressSearch
