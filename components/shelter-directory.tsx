"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { X, Search, ChevronDown, ChevronRight, MapPin, Loader2, Share2, Eye, Navigation, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  DirectoryResponse,
  CityGroup,
  DirectoryShelterEntry,
  Shelter,
  Coordinates,
} from "@/lib/types"
import { SHELTER_TYPES } from "@/lib/types"
import { calculateEtas, haversineDistance } from "@/lib/utils"
import { getShelterDisplayInfo } from "@/lib/shelter-display"

interface ShelterDirectoryProps {
  open: boolean
  onClose: () => void
  onShowOnMap: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
  userLocation?: Coordinates | null
}

function toShelter(entry: DirectoryShelterEntry, userLocation?: Coordinates | null): Shelter {
  const distance = userLocation
    ? haversineDistance(userLocation, { lat: entry.lat, lng: entry.lng })
    : undefined
  return {
    id: String(entry.id),
    name: entry.name || `מקלט #${entry.id}`,
    type: entry.type,
    coordinates: { lat: entry.lat, lng: entry.lng },
    distance,
    address: entry.address,
    neighborhood: entry.neighborhood,
    cityEn: entry.city_en,
    cityHe: entry.city_he,
    capacity: entry.capacity,
    sources: entry.sources,
    etas: distance != null ? calculateEtas(distance) : undefined,
  }
}

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "public_shelter", label: "Public" },
  { key: "bomb_shelter", label: "Bomb" },
  { key: "school", label: "School" },
  { key: "underground_parking", label: "Parking" },
  { key: "fortified_space", label: "Fortified" },
  { key: "distributed", label: "Distributed" },
  { key: "reinforced_shelter", label: "Reinforced" },
]

const PAGE_SIZE = 40

export default function ShelterDirectory({
  open,
  onClose,
  onShowOnMap,
  onShare,
  userLocation,
}: ShelterDirectoryProps) {
  const [data, setData] = useState<DirectoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    fetch("/api/shelters/directory")
      .then((r) => r.json())
      .then((d: DirectoryResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, data])

  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setActiveFilter("all")
      setVisibleCount(PAGE_SIZE)
    } else {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [open])

  const toggleCity = useCallback((key: string) => {
    setExpandedCities((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })
  }, [])

  const toggleNeighborhood = useCallback((key: string) => {
    setExpandedNeighborhoods((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })
  }, [])

  const filterEntry = useCallback((e: DirectoryShelterEntry) => {
    return activeFilter === "all" || e.type === activeFilter
  }, [activeFilter])

  const allEntries = useMemo((): DirectoryShelterEntry[] => {
    if (!data) return []
    const out: DirectoryShelterEntry[] = []
    for (const city of data.cities) {
      for (const n of city.neighborhoods) out.push(...n.shelters)
      out.push(...city.shelters)
    }
    for (const region of data.unknownRegions) out.push(...region.shelters)
    return out
  }, [data])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    const typeLabel = (type: string) => {
      const t = SHELTER_TYPES[type]
      return t ? `${t.he} ${t.en}`.toLowerCase() : type
    }
    return allEntries.filter((e) => {
      if (!filterEntry(e)) return false
      const fields = [e.address, e.name, e.city_he, e.city_en, e.neighborhood, typeLabel(e.type)]
        .filter(Boolean).join(" ").toLowerCase()
      return fields.includes(q)
    })
  }, [allEntries, searchQuery, filterEntry])

  const handleShowOnMap = useCallback((shelter: Shelter) => {
    onShowOnMap(shelter)
    onClose()
  }, [onShowOnMap, onClose])

  const handleShare = useCallback((shelter: Shelter) => {
    onShare?.(shelter)
    onClose()
  }, [onShare, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col" role="dialog" aria-modal="true" aria-label="Shelter directory">

      {/* Header */}
      <div className="shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/8 px-4 pt-4 pb-3" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600/15 rounded-xl flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Shelter Directory</h2>
              {data && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  {data.totalCount.toLocaleString()} shelters across Israel
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Close directory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
            placeholder="Search by address, city, neighborhood..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/40 focus:bg-white/7 transition-all"
            dir="auto"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeFilter === f.key ? "rgba(220,38,38,0.9)" : "rgba(255,255,255,0.06)",
                color: activeFilter === f.key ? "white" : "rgba(255,255,255,0.5)",
                border: activeFilter === f.key ? "1px solid rgba(220,38,38,0.5)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <Loader2 className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-white/50 mt-3">Loading shelters...</p>
          </div>
        )}

        {/* Search results */}
        {data && !loading && searchResults !== null && (
          <div className="p-3">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="h-8 w-8 text-white/15 mb-3" />
                <p className="text-sm font-semibold text-white/40">No results for &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-white/25 mt-1">Try different keywords</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-white/30 px-1 pb-2">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-1.5">
                  {searchResults.slice(0, visibleCount).map((entry) => (
                    <DirectoryEntryRow
                      key={entry.id}
                      entry={entry}
                      userLocation={userLocation}
                      onShowOnMap={handleShowOnMap}
                      onShare={onShare ? handleShare : undefined}
                    />
                  ))}
                </div>
                {visibleCount < searchResults.length && (
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="w-full py-3 text-xs text-white/40 hover:text-white/70 font-semibold transition-colors mt-2"
                  >
                    Show more ({searchResults.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Browse by city */}
        {data && !loading && searchResults === null && (
          <div className="p-2 space-y-0.5">
            {data.cities.map((city) => {
              const cityKey = city.cityHe || city.cityEn
              const filteredCount = activeFilter === "all"
                ? city.count
                : countFiltered(city, activeFilter)
              if (filteredCount === 0) return null
              const isExpanded = expandedCities.has(cityKey)
              return (
                <CitySection
                  key={cityKey}
                  city={city}
                  cityKey={cityKey}
                  isExpanded={isExpanded}
                  onToggle={() => toggleCity(cityKey)}
                  expandedNeighborhoods={expandedNeighborhoods}
                  onToggleNeighborhood={toggleNeighborhood}
                  filterEntry={filterEntry}
                  filteredCount={filteredCount}
                  userLocation={userLocation}
                  onShowOnMap={handleShowOnMap}
                  onShare={onShare ? handleShare : undefined}
                />
              )
            })}

            {data.unknownRegions.length > 0 && data.unknownRegions.some((r) => r.shelters.some(filterEntry)) && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider px-3 pb-2">
                  Other Locations
                </p>
                {data.unknownRegions.map((region) => {
                  const filtered = region.shelters.filter(filterEntry)
                  if (filtered.length === 0) return null
                  const rKey = region.nameEn
                  const isExpanded = expandedCities.has(rKey)
                  return (
                    <div key={rKey} className="rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCity(rKey)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/4 transition-colors rounded-xl"
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-white/30 flex-shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />}
                        <span className="flex-1 text-left text-sm font-semibold text-white/60" dir="auto">
                          {region.nameHe || region.nameEn}
                        </span>
                        <span className="text-[11px] text-white/25 bg-white/5 px-2 py-0.5 rounded-full">{filtered.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="pl-8 pr-2 pb-2 space-y-1">
                          {filtered.slice(0, 100).map((entry) => (
                            <DirectoryEntryRow key={entry.id} entry={entry} userLocation={userLocation} onShowOnMap={handleShowOnMap} onShare={onShare ? handleShare : undefined} />
                          ))}
                          {filtered.length > 100 && (
                            <p className="text-xs text-white/25 text-center py-2">
                              Showing first 100 — use search to find more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function countFiltered(city: CityGroup, type: string): number {
  let count = 0
  for (const n of city.neighborhoods) count += n.shelters.filter((s) => s.type === type).length
  count += city.shelters.filter((s) => s.type === type).length
  return count
}

function CitySection({
  city,
  cityKey,
  isExpanded,
  onToggle,
  expandedNeighborhoods,
  onToggleNeighborhood,
  filterEntry,
  filteredCount,
  userLocation,
  onShowOnMap,
  onShare,
}: {
  city: CityGroup
  cityKey: string
  isExpanded: boolean
  onToggle: () => void
  expandedNeighborhoods: Set<string>
  onToggleNeighborhood: (key: string) => void
  filterEntry: (e: DirectoryShelterEntry) => boolean
  filteredCount: number
  userLocation?: Coordinates | null
  onShowOnMap: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
}) {
  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/4 transition-colors rounded-xl"
        aria-expanded={isExpanded}
      >
        {isExpanded
          ? <ChevronDown className="h-4 w-4 text-white/35 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-white/35 flex-shrink-0" />}
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-bold text-white" dir="auto">
            {city.cityHe || city.cityEn}
          </span>
          {city.cityHe && city.cityEn && (
            <span className="text-xs text-white/30 ml-1.5">{city.cityEn}</span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-white/30 bg-white/5 px-2 py-0.5 rounded-full flex-shrink-0">
          {filteredCount}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-4 pr-1 pb-2 space-y-0.5">
          {city.neighborhoods.map((neighborhood) => {
            const filtered = neighborhood.shelters.filter(filterEntry)
            if (filtered.length === 0) return null
            const nKey = `${cityKey}::${neighborhood.name}`
            const nExpanded = expandedNeighborhoods.has(nKey)
            return (
              <div key={neighborhood.name}>
                <button
                  onClick={() => onToggleNeighborhood(nKey)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-white/4 transition-colors rounded-lg"
                  aria-expanded={nExpanded}
                >
                  {nExpanded
                    ? <ChevronDown className="h-3 w-3 text-white/25 flex-shrink-0" />
                    : <ChevronRight className="h-3 w-3 text-white/25 flex-shrink-0" />}
                  <span className="text-xs font-semibold text-white/50 flex-1 text-left" dir="auto">
                    {neighborhood.name}
                  </span>
                  <span className="text-[10px] text-white/20">{filtered.length}</span>
                </button>
                {nExpanded && (
                  <div className="pl-3 space-y-1 pb-1">
                    {filtered.map((entry) => (
                      <DirectoryEntryRow
                        key={entry.id}
                        entry={entry}
                        userLocation={userLocation}
                        onShowOnMap={onShowOnMap}
                        onShare={onShare}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {city.shelters.filter(filterEntry).map((entry) => (
            <DirectoryEntryRow
              key={entry.id}
              entry={entry}
              userLocation={userLocation}
              onShowOnMap={onShowOnMap}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DirectoryEntryRow({
  entry,
  userLocation,
  onShowOnMap,
  onShare,
}: {
  entry: DirectoryShelterEntry
  userLocation?: Coordinates | null
  onShowOnMap: (shelter: Shelter) => void
  onShare?: (shelter: Shelter) => void
}) {
  const shelter = useMemo(() => toShelter(entry, userLocation), [entry, userLocation])
  const display = useMemo(() => getShelterDisplayInfo(shelter), [shelter])
  const dist = shelter.distance != null
    ? shelter.distance < 1000 ? `${Math.round(shelter.distance)}m` : `${(shelter.distance / 1000).toFixed(1)}km`
    : null
  const typeLabel = SHELTER_TYPES[entry.type]?.en ?? entry.type

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl group transition-colors"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white leading-snug truncate" dir="auto">
          {display.primaryLine}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {display.secondaryLine && (
            <span className="text-[10px] text-white/35 truncate max-w-[160px]" dir="auto">
              {display.secondaryLine}
            </span>
          )}
          <span className="text-[10px] text-red-400/50">{typeLabel}</span>
          {entry.capacity != null && entry.capacity > 0 && (
            <span className="text-[10px] text-white/25">{entry.capacity} ppl</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {dist && <span className="text-[11px] font-bold text-white/50">{dist}</span>}
        <button
          onClick={() => onShowOnMap(shelter)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Show on map"
          title="Show on map"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${entry.lat},${entry.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
          aria-label="Navigate"
          title="Navigate"
        >
          <Navigation className="h-3.5 w-3.5" />
        </a>
        {onShare && (
          <button
            onClick={() => onShare(shelter)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            aria-label="Share shelter"
            title="Share"
          >
            <Share2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
