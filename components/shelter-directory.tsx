"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { X, ChevronRight, MapPin, Share2, Eye, Navigation } from "lucide-react"
import { Bi } from "@/components/ui/bi"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { IconButton } from "@/components/ui/icon-button"
import { SearchField } from "@/components/ui/search-field"
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
import { cn } from "@/lib/utils"

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
    <div className="fixed inset-0 z-directory bg-panel flex flex-col animate-in fade-in-0 duration-150" role="dialog" aria-modal="true" aria-label="Shelter directory">

      {/* Header */}
      <div className="shrink-0 border-b border-line pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center justify-between gap-3 h-12">
            <div className="min-w-0">
              <h2 className="text-title font-semibold text-fg tracking-tight">
                <Bi he="מאגר המקלטים" en="Shelter directory" />
              </h2>
              {data && (
                <p className="text-caption text-fg-subtle tabular-nums">
                  {data.totalCount.toLocaleString()} shelters across Israel
                </p>
              )}
            </div>
            <IconButton label="Close directory" onClick={onClose}>
              <X />
            </IconButton>
          </div>

          <SearchField
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
            onClear={() => setSearchQuery("")}
            placeholder="Search by address, city, neighborhood..."
            aria-label="Search the shelter directory"
            className="mt-2"
          />

          {/* Type filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 mt-3">
            {TYPE_FILTERS.map((f) => {
              const active = activeFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    "h-8 px-3.5 rounded-full text-label font-medium whitespace-nowrap transition-colors flex-shrink-0 border",
                    active ? "bg-fg text-bg border-fg" : "bg-transparent text-fg-muted border-line-strong hover:text-fg hover:bg-fg/6"
                  )}
                  aria-pressed={active}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-2 sm:px-4 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {loading && <EmptyState loading title="Loading shelters..." className="py-20" />}

          {/* Search results */}
          {data && !loading && searchResults !== null && (
            <div className="px-1">
              {searchResults.length === 0 ? (
                <EmptyState icon={MapPin} title={<>No results for &quot;{searchQuery}&quot;</>} description="Try different keywords" className="py-16" />
              ) : (
                <>
                  <p className="text-caption text-fg-subtle px-1 pb-2 tabular-nums">
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
                    <Button variant="ghost" size="md" className="w-full mt-2" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                      Show more ({searchResults.length - visibleCount} remaining)
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Browse by city */}
          {data && !loading && searchResults === null && (
            <div className="space-y-1">
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
                <div className="pt-4">
                  <p className="text-eyebrow font-semibold text-fg-subtle uppercase tracking-wider px-3 pb-2">
                    Other Locations
                  </p>
                  {data.unknownRegions.map((region) => {
                    const filtered = region.shelters.filter(filterEntry)
                    if (filtered.length === 0) return null
                    const rKey = region.nameEn
                    const isExpanded = expandedCities.has(rKey)
                    return (
                      <div key={rKey} className={cn("rounded-2xl", isExpanded && "bg-surface-1")}>
                        <button
                          onClick={() => toggleCity(rKey)}
                          className="w-full flex items-center gap-3 px-3 h-12 hover:bg-fg/4 transition-colors rounded-2xl"
                          aria-expanded={isExpanded}
                        >
                          <ChevronRight className={cn("h-4 w-4 text-fg-subtle flex-shrink-0 transition-transform", isExpanded && "rotate-90")} />
                          <span className="flex-1 text-left text-body font-medium text-fg-muted" dir="auto">
                            {region.nameHe || region.nameEn}
                          </span>
                          <Chip tone="neutral" className="tabular-nums">{filtered.length}</Chip>
                        </button>
                        {isExpanded && (
                          <div className="px-2 pb-2 space-y-1.5">
                            {filtered.slice(0, 100).map((entry) => (
                              <DirectoryEntryRow key={entry.id} entry={entry} userLocation={userLocation} onShowOnMap={handleShowOnMap} onShare={onShare ? handleShare : undefined} />
                            ))}
                            {filtered.length > 100 && (
                              <p className="text-caption text-fg-subtle text-center py-2">
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
    <div className={cn("rounded-2xl transition-colors", isExpanded && "bg-surface-1")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 h-14 hover:bg-fg/4 transition-colors rounded-2xl"
        aria-expanded={isExpanded}
      >
        <ChevronRight className={cn("h-4 w-4 text-fg-subtle flex-shrink-0 transition-transform", isExpanded && "rotate-90")} />
        <div className="flex-1 text-left min-w-0 flex items-baseline gap-2">
          <span className="text-body font-semibold text-fg" dir="auto">
            {city.cityHe || city.cityEn}
          </span>
          {city.cityHe && city.cityEn && (
            <span className="text-label text-fg-subtle truncate">{city.cityEn}</span>
          )}
        </div>
        <Chip tone="neutral" className="tabular-nums flex-shrink-0">{filteredCount}</Chip>
      </button>

      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {city.neighborhoods.map((neighborhood) => {
            const filtered = neighborhood.shelters.filter(filterEntry)
            if (filtered.length === 0) return null
            const nKey = `${cityKey}::${neighborhood.name}`
            const nExpanded = expandedNeighborhoods.has(nKey)
            return (
              <div key={neighborhood.name}>
                <button
                  onClick={() => onToggleNeighborhood(nKey)}
                  className="w-full flex items-center gap-2.5 px-3 h-11 hover:bg-fg/4 transition-colors rounded-xl"
                  aria-expanded={nExpanded}
                >
                  <ChevronRight className={cn("h-3.5 w-3.5 text-fg-subtle flex-shrink-0 transition-transform", nExpanded && "rotate-90")} />
                  <span className="text-label font-medium text-fg-muted flex-1 text-left" dir="auto">
                    {neighborhood.name}
                  </span>
                  <span className="text-caption text-fg-subtle tabular-nums">{filtered.length}</span>
                </button>
                {nExpanded && (
                  <div className="pl-3 space-y-1.5 pb-2">
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
    ? shelter.distance < 1000 ? `${Math.round(shelter.distance)} m` : `${(shelter.distance / 1000).toFixed(1)} km`
    : null
  const typeLabel = SHELTER_TYPES[entry.type]?.en ?? entry.type

  const action = "w-11 h-11 rounded-lg flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/8 transition-colors"

  return (
    <div className="flex items-center gap-2 pl-3.5 pr-1 py-1.5 rounded-xl bg-surface-2 border border-line">
      <div className="flex-1 min-w-0">
        <p className="text-label font-medium text-fg leading-snug truncate" dir="auto">
          {display.primaryLine}
        </p>
        <div className="flex items-center gap-x-2 gap-y-0.5 mt-0.5 flex-wrap text-caption text-fg-subtle">
          {display.secondaryLine && (
            <span className="truncate max-w-[180px]" dir="auto">{display.secondaryLine}</span>
          )}
          <span>{typeLabel}</span>
          {entry.capacity != null && entry.capacity > 0 && <span className="tabular-nums">{entry.capacity} ppl</span>}
          {dist && <span className="tabular-nums text-fg-muted">{dist}</span>}
        </div>
      </div>
      <div className="flex items-center flex-shrink-0">
        <button onClick={() => onShowOnMap(shelter)} className={action} aria-label="Show on map" title="Show on map">
          <Eye className="h-4 w-4" />
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${entry.lat},${entry.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className={action}
          aria-label="Navigate"
          title="Navigate"
        >
          <Navigation className="h-4 w-4" />
        </a>
        {onShare && (
          <button onClick={() => onShare(shelter)} className={action} aria-label="Share shelter" title="Share">
            <Share2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
