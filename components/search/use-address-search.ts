"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { Coordinates } from "@/lib/types"

export interface NominatimResult {
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

function joinAddress(r: NominatimResult, fallbackParts: number): string {
  const addr = r.address
  if (!addr) return r.display_name.split(",").slice(0, fallbackParts).join(",")
  const parts = [
    addr.road && addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road,
    addr.city || addr.town || addr.village || addr.suburb,
  ].filter(Boolean)
  return parts.join(", ") || r.display_name.split(",").slice(0, fallbackParts).join(",")
}

/** Text shown for a suggestion in the dropdown. */
export const formatResult = (r: NominatimResult) => joinAddress(r, 3)
/** Text kept in the field and the active-location pill after picking one. */
export const buildLabel = (r: NominatimResult) => joinAddress(r, 2)

/**
 * Debounced Israel-only address lookup against OpenStreetMap Nominatim.
 * Owns the query text, results, and dropdown visibility.
 */
export function useAddressSearch(onLocationSelect: (coords: Coordinates, label: string) => void) {
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
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        signal: ac.signal,
        headers: { "User-Agent": "ShelterNow/1.0 (emergency-shelter-app)" },
      })
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

  const onQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (!value.trim()) {
        setResults([])
        setShowResults(false)
        return
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => searchAddress(value), 400)
    },
    [searchAddress]
  )

  const select = useCallback(
    (result: NominatimResult) => {
      const coords: Coordinates = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
      const label = buildLabel(result)
      onLocationSelect(coords, label)
      setQuery(label)
      setResults([])
      setShowResults(false)
      inputRef.current?.blur()
    },
    [onLocationSelect]
  )

  const clear = useCallback(() => {
    setQuery("")
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }, [])

  const onFocus = useCallback(() => {
    if (results.length > 0) setShowResults(true)
  }, [results.length])

  // Close results when clicking/touching outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return { query, results, isSearching, showResults, inputRef, containerRef, onQueryChange, onFocus, select, clear }
}
