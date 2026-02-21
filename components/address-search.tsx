"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Search, X, MapPin, Loader2, LocateFixed } from "lucide-react"
import type { Coordinates } from "@/lib/types"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    suburb?: string
    state?: string
  }
}

interface AddressSearchProps {
  onLocationSelect: (coords: Coordinates, label: string) => void
  activeLabel?: string
  onClearActive?: () => void
  hasUserLocation?: boolean
  className?: string
}

function formatResult(r: NominatimResult): string {
  const addr = r.address
  if (!addr) return r.display_name.split(",").slice(0, 3).join(",")
  const parts = [
    addr.road && addr.house_number
      ? `${addr.road} ${addr.house_number}`
      : addr.road,
    addr.city || addr.town || addr.village || addr.suburb,
  ].filter(Boolean)
  return parts.join(", ") || r.display_name.split(",").slice(0, 3).join(",")
}

function buildLabel(result: NominatimResult): string {
  const addr = result.address
  if (!addr) return result.display_name.split(",").slice(0, 2).join(",")
  const parts = [
    addr.road && addr.house_number
      ? `${addr.road} ${addr.house_number}`
      : addr.road,
    addr.city || addr.town || addr.village || addr.suburb,
  ].filter(Boolean)
  return parts.join(", ") || result.display_name.split(",").slice(0, 2).join(",")
}

export default function AddressSearch({
  onLocationSelect,
  activeLabel,
  onClearActive,
  hasUserLocation,
  className = "",
}: AddressSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchAddress = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: q,
        format: "json",
        countrycodes: "il",
        limit: "6",
        addressdetails: "1",
        "accept-language": "en,he",
      })
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: ac.signal,
          headers: { "User-Agent": "ShelterNow/1.0 (emergency-shelter-app)" },
        }
      )
      if (res.ok) {
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowResults(data.length > 0)
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (!value.trim()) {
        setResults([])
        setShowResults(false)
        return
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => searchAddress(value), 250)
    },
    [searchAddress]
  )

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      const coords: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      }
      const label = buildLabel(result)
      onLocationSelect(coords, label)
      setQuery(label)
      setResults([])
      setShowResults(false)
      inputRef.current?.blur()
    },
    [onLocationSelect]
  )

  const handleClear = useCallback(() => {
    setQuery("")
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }, [])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center h-9 bg-white/8 border border-white/10 rounded-full overflow-hidden focus-within:border-red-500/40 focus-within:bg-white/10 transition-all">
        <div className="flex items-center justify-center w-9 h-9 flex-shrink-0">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-400" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4 text-white/40" aria-hidden="true" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true) }}
          placeholder={activeLabel ? "Search a new address..." : "Search address in Israel..."}
          className="flex-1 bg-transparent text-white text-sm py-1.5 pr-1 outline-none placeholder:text-white/35"
          aria-label="Search for an address in Israel"
          autoComplete="off"
          dir="auto"
        />
        {query && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center w-8 h-8 mr-0.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 flex-shrink-0 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div
          className="absolute left-0 right-0 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto"
          style={{
            top: "calc(100% + 6px)",
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            zIndex: 9999,
          }}
          role="listbox"
          aria-label="Address suggestions"
        >
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              role="option"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <MapPin className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
              </div>
              <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.9)" }} dir="auto">
                {formatResult(r)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active search indicator — shown below the input when an address is pinned */}
      {activeLabel && !showResults && (
        <div
          className="absolute left-0 right-0 flex items-center gap-2 px-3 py-2 rounded-xl mt-1"
          style={{
            top: "calc(100% + 4px)",
            background: "rgba(180,90,0,0.92)",
            border: "1px solid rgba(251,146,60,0.3)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            zIndex: 9999,
          }}
        >
          <MapPin className="h-3.5 w-3.5 text-orange-300 flex-shrink-0" aria-hidden="true" />
          <span
            className="flex-1 text-xs font-semibold text-white truncate"
            dir="auto"
            title={activeLabel}
          >
            {activeLabel}
          </span>
          {hasUserLocation && onClearActive && (
            <button
              onClick={onClearActive}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white flex-shrink-0 transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              aria-label="Return to my location"
            >
              <LocateFixed className="h-3 w-3" />
              My Location
            </button>
          )}
          {onClearActive && (
            <button
              onClick={onClearActive}
              className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
