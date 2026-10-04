"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Share2, Check, MapPin, Navigation, Loader2, Search, X, ChevronLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Shelter, Coordinates, ShelterApiResponse } from "@/lib/types"
import { calculateEtas, cn } from "@/lib/utils"
import { getShelterDisplayInfo } from "@/lib/shelter-display"

interface ShareShelterDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** When passed, skips the search step and goes straight to sharing this shelter */
  shelter?: Shelter | null
  /** Current user's nearby shelters — shown as quick options */
  nearbyShelters?: Shelter[]
  userLocation?: Coordinates | null
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    suburb?: string
  }
}

function formatResult(r: NominatimResult): string {
  const addr = r.address
  if (!addr) return r.display_name.split(",").slice(0, 3).join(", ")
  const parts = [
    addr.road && addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road,
    addr.city || addr.town || addr.village || addr.suburb,
  ].filter(Boolean)
  return parts.join(", ") || r.display_name.split(",").slice(0, 3).join(", ")
}

function buildLabel(r: NominatimResult): string {
  const addr = r.address
  if (!addr) return r.display_name.split(",").slice(0, 2).join(", ")
  const parts = [
    addr.road && addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road,
    addr.city || addr.town || addr.village || addr.suburb,
  ].filter(Boolean)
  return parts.join(", ") || r.display_name.split(",").slice(0, 2).join(", ")
}

function transformShelter(s: ShelterApiResponse): Shelter {
  return {
    id: String(s.id),
    name: s.name,
    type: s.type,
    coordinates: { lat: s.lat, lng: s.lng },
    distance: s.meters,
    address: s.address,
    neighborhood: s.neighborhood,
    cityEn: s.city_en,
    cityHe: s.city_he,
    capacity: s.capacity,
    sources: s.sources,
    etas: calculateEtas(s.meters ?? Number.POSITIVE_INFINITY),
  }
}

function buildShareText(shelter: Shelter, contextLabel?: string): string {
  const display = getShelterDisplayInfo(shelter)
  const addr = display.primaryLine
  const city = display.secondaryLine ? `, ${display.secondaryLine}` : ""
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${shelter.coordinates.lat},${shelter.coordinates.lng}`
  const waze = `https://waze.com/ul?ll=${shelter.coordinates.lat},${shelter.coordinates.lng}&navigate=yes`

  let msg = `🛡️ Bomb shelter${contextLabel ? ` near ${contextLabel}` : ""}:\n📍 ${addr}${city}\n\nNavigate:\n🗺 ${gmaps}\n🚗 ${waze}`
  if (shelter.distance != null) {
    const dist = shelter.distance < 1000
      ? `${Math.round(shelter.distance)}m`
      : `${(shelter.distance / 1000).toFixed(1)}km`
    msg += `\n\n📏 ${dist} away`
    if (shelter.etas?.walk) msg += ` · 🚶 ${shelter.etas.walk} min walk`
  }
  return msg
}

function ShelterOption({
  shelter,
  rank,
  selected,
  onSelect,
}: {
  shelter: Shelter
  rank?: number
  selected: boolean
  onSelect: () => void
}) {
  const display = getShelterDisplayInfo(shelter)
  const dist = shelter.distance != null
    ? shelter.distance < 1000 ? `${Math.round(shelter.distance)}m` : `${(shelter.distance / 1000).toFixed(1)}km`
    : null
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors border",
        selected ? "border-brand/50 bg-brand/10" : "bg-surface-2 border-line hover:border-line-strong"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-label font-semibold flex-shrink-0",
          rank === 1 ? "bg-brand text-white" : selected ? "bg-brand/40 text-fg" : "bg-fg/8 text-fg"
        )}
      >
        {rank ?? <MapPin className="h-3.5 w-3.5 text-fg-muted" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label font-semibold text-fg truncate leading-tight" dir="auto">{display.primaryLine}</p>
        {display.secondaryLine && (
          <p className="text-caption text-fg-subtle truncate">{display.secondaryLine}</p>
        )}
      </div>
      {dist && <span className="text-label font-semibold text-brand-soft flex-shrink-0 ml-1">{dist}</span>}
      {selected && <Check className="h-3.5 w-3.5 text-brand-soft flex-shrink-0" aria-hidden="true" />}
    </button>
  )
}

type Step = "pick" | "confirm"

export default function ShareShelterDialog({
  open,
  onOpenChange,
  shelter: prefillShelter,
  nearbyShelters = [],
  userLocation,
}: ShareShelterDialogProps) {
  const [step, setStep] = useState<Step>(prefillShelter ? "confirm" : "pick")

  // Address search state
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [friendLabel, setFriendLabel] = useState<string | null>(null)

  // Shelter options
  const [contextShelters, setContextShelters] = useState<Shelter[]>([])
  const [loadingContext, setLoadingContext] = useState(false)
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(prefillShelter ?? null)

  // Share state
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // When a prefill shelter is passed, jump to confirm step
  useEffect(() => {
    if (open && prefillShelter) {
      setSelectedShelter(prefillShelter)
      setStep("confirm")
    } else if (open && !prefillShelter) {
      setStep("pick")
    }
  }, [open, prefillShelter])

  const searchAddress = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q, format: "json", countrycodes: "il", limit: "5",
        addressdetails: "1", "accept-language": "en,he",
      })
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        signal: ac.signal,
        headers: { "User-Agent": "ShelterNow/1.0 (emergency-shelter-app)" },
      })
      if (res.ok) {
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val)
    setShowSuggestions(false)
    if (!val.trim()) { setSuggestions([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchAddress(val), 280)
  }, [searchAddress])

  const handleAddressSelect = useCallback(async (r: NominatimResult) => {
    const label = buildLabel(r)
    const coords: Coordinates = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) }
    setQuery(label)
    setFriendLabel(label)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedShelter(null)
    setContextShelters([])
    setLoadingContext(true)
    setShareError(null)
    try {
      const res = await fetch(`/api/shelters?lat=${coords.lat}&lng=${coords.lng}&limit=5`)
      if (!res.ok) throw new Error("Failed")
      const { shelters: raw } = await res.json()
      const results = (raw as ShelterApiResponse[]).map(transformShelter)
      setContextShelters(results)
      if (results.length > 0) setSelectedShelter(results[0])
    } catch {
      setShareError("Couldn't find shelters near that address.")
    } finally {
      setLoadingContext(false)
    }
  }, [])

  const handleClearAddress = useCallback(() => {
    setQuery("")
    setFriendLabel(null)
    setSuggestions([])
    setShowSuggestions(false)
    setContextShelters([])
    setSelectedShelter(null)
    inputRef.current?.focus()
  }, [])

  const handleShare = useCallback(async () => {
    if (!selectedShelter) return
    const text = buildShareText(selectedShelter, friendLabel ?? undefined)
    if (navigator.share) {
      try { await navigator.share({ text }); return } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setShareError("Could not copy to clipboard.")
    }
  }, [selectedShelter, friendLabel])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("pick")
      setQuery("")
      setFriendLabel(null)
      setSuggestions([])
      setShowSuggestions(false)
      setContextShelters([])
      setSelectedShelter(null)
      setCopied(false)
      setShareError(null)
    }, 300)
  }, [onOpenChange])

  const sheltersToList = contextShelters.length > 0 ? contextShelters : nearbyShelters.slice(0, 5)
  const listLabel = contextShelters.length > 0
    ? `Nearest to ${friendLabel}`
    : "Your nearest shelters"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 pr-14 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-info/15 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-4 w-4 text-info" />
            </div>
            <div>
              <DialogTitle className="leading-tight">
                Share a Shelter
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {contextShelters.length > 0 || prefillShelter
                  ? "Pick a shelter to share with your friend"
                  : "Search your friend's address or share from your nearest shelters"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 py-3 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin">

          {/* Address search — always shown unless we have a prefill */}
          {!prefillShelter && (
            <div className="relative">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors bg-fg/6 border border-line focus-within:border-fg/30"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-soft flex-shrink-0" />
                ) : (
                  <Search className="h-4 w-4 text-fg-subtle flex-shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                  placeholder="Friend's address in Israel..."
                  className="flex-1 bg-transparent text-base text-fg focus:outline-none placeholder:text-fg-subtle min-w-0"
                  autoComplete="off"
                  dir="auto"
                />
                {query && (
                  <button onClick={handleClearAddress} className="text-fg-subtle hover:text-fg flex-shrink-0" aria-label="Clear address">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute inset-x-0 rounded-xl overflow-hidden mt-1 bg-surface-2 border border-line-strong shadow-popover z-popover"
                >
                  {suggestions.map((r) => (
                    <button
                      key={r.place_id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddressSelect(r)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left border-b border-line last:border-0 transition-colors hover:bg-fg/6"
                    >
                      <MapPin className="h-3.5 w-3.5 text-brand-soft flex-shrink-0" />
                      <span className="text-label text-fg truncate" dir="auto">{formatResult(r)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loadingContext && (
            <div className="flex items-center justify-center gap-2 py-3 text-fg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-label">Finding nearby shelters...</span>
            </div>
          )}

          {/* Error */}
          {shareError && (
            <div className="text-label text-brand-soft bg-brand/10 border border-brand/25 px-3 py-2 rounded-xl">
              {shareError}
            </div>
          )}

          {/* Shelter list */}
          {sheltersToList.length > 0 && !loadingContext && (
            <div>
              <p className="text-eyebrow font-semibold text-fg-subtle uppercase tracking-wider mb-2">
                {listLabel}
              </p>
              <div className="space-y-2">
                {sheltersToList.map((s, i) => (
                  <ShelterOption
                    key={s.id}
                    shelter={s}
                    rank={i + 1}
                    selected={selectedShelter?.id === s.id}
                    onSelect={() => setSelectedShelter(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No shelters yet prompt */}
          {!loadingContext && sheltersToList.length === 0 && !prefillShelter && !friendLabel && (
            <div className="text-center py-4">
              <p className="text-label text-fg-subtle">Search an address to find shelters near your friend</p>
            </div>
          )}

          {/* Selected shelter confirm card */}
          {selectedShelter && !loadingContext && (() => {
            const d = getShelterDisplayInfo(selectedShelter)
            const dist = selectedShelter.distance != null
              ? selectedShelter.distance < 1000 ? `${Math.round(selectedShelter.distance)}m` : `${(selectedShelter.distance / 1000).toFixed(1)}km`
              : null
            return (
              <div
                className="rounded-xl p-3 bg-surface-2 border border-line"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-brand-soft mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label font-semibold text-fg leading-snug" dir="auto">{d.primaryLine}</p>
                    {d.secondaryLine && <p className="text-caption text-fg-subtle mt-0.5">{d.secondaryLine}</p>}
                    <p className="text-caption text-brand-soft mt-0.5">{d.typeLabel}</p>
                  </div>
                  {dist && <span className="text-label font-semibold text-fg flex-shrink-0">{dist}</span>}
                </div>
                {selectedShelter.etas && (
                  <div className="flex gap-3 mt-2 pl-6">
                    <span className="text-caption text-fg-subtle">🚶 {selectedShelter.etas.walk} min</span>
                    <span className="text-caption text-fg-subtle">🏃 {selectedShelter.etas.run} min</span>
                  </div>
                )}
                {/* Quick nav links for the friend */}
                <div className="flex gap-2 mt-2.5 pl-0">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedShelter.coordinates.lat},${selectedShelter.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-caption font-semibold text-fg-muted hover:text-fg transition-colors bg-google/12 border border-google/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="h-3 w-3" />
                    Google Maps
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${selectedShelter.coordinates.lat},${selectedShelter.coordinates.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-caption font-semibold text-fg-muted hover:text-fg transition-colors bg-waze/12 border border-waze/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="h-3 w-3" />
                    Waze
                  </a>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Share button */}
        <div className="px-4 pb-4 pt-3 border-t border-line shrink-0">
          <Button
            onClick={handleShare}
            disabled={!selectedShelter}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                {selectedShelter ? "Share This Shelter" : "Select a shelter above"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
