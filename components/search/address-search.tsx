"use client"

import { MapPin, LocateFixed, X } from "lucide-react"
import type { Coordinates } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"
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
        "absolute inset-x-0 top-[calc(100%+6px)] max-h-[min(320px,50vh)] p-1.5 rounded-2xl overflow-y-auto overscroll-contain bg-surface-2 border border-line-strong shadow-popover z-popover",
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
          className="flex items-center gap-3 w-full min-h-12 px-3 py-2 rounded-xl text-left transition-colors hover:bg-fg/6 active:bg-fg/10"
          role="option"
          aria-selected={false}
        >
          <MapPin className="h-4 w-4 text-fg-subtle flex-shrink-0" aria-hidden="true" />
          <span className="text-body text-fg leading-snug" dir="auto">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE LOCATION — map pill while a searched address replaces GPS
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
        "flex items-center gap-2 h-11 pl-3.5 pr-1.5 rounded-full max-w-full bg-surface-2/95 backdrop-blur-md border border-warn/40 shadow-popover",
        className
      )}
      role="status"
    >
      <MapPin className="h-4 w-4 text-warn flex-shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-label font-medium text-fg" dir="auto" title={label}>
        {label}
      </span>
      {onReturnToMe && (
        <button
          type="button"
          onClick={onReturnToMe}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-caption font-semibold text-fg bg-fg/8 hover:bg-fg/15 flex-shrink-0 transition-colors"
          aria-label="המיקום שלי / Return to my location"
        >
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          <Bi he="המיקום שלי" en="Me" />
        </button>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center w-8 h-8 rounded-full text-fg-muted hover:text-fg hover:bg-fg/8 flex-shrink-0 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/** Nominatim often returns the same street address as several entities. */
function uniqueByLabel(list: AddressSuggestion[]): AddressSuggestion[] {
  const seen = new Set<string>()
  return list.filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)))
}

/* ─────────────────────────────────────────────────────────────
   ADDRESS SEARCH — field + suggestions
───────────────────────────────────────────────────────────── */

interface AddressSearchProps {
  onLocationSelect: (coords: Coordinates, label: string) => void
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export function AddressSearch({
  onLocationSelect,
  className,
  placeholder = "חפש כתובת · Search an address",
  autoFocus,
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
        autoFocus={autoFocus}
        aria-label="חפש כתובת / Search for an address in Israel"
      />

      {search.showResults && search.results.length > 0 && (
        <AddressResults
          suggestions={uniqueByLabel(search.results.map((r) => ({ id: r.place_id, label: formatResult(r) })))}
          onSelect={(id) => {
            const r = byId.get(id)
            if (r) search.select(r)
          }}
        />
      )}
    </div>
  )
}

export default AddressSearch
