"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { X, Search, ChevronDown, ChevronRight, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShelterCard from "./shelter-card"
import type {
  DirectoryResponse,
  CityGroup,
  RegionGroup,
  DirectoryShelterEntry,
  Shelter,
  Coordinates,
} from "@/lib/types"
import { SHELTER_TYPES } from "@/lib/types"
import { calculateEtas, haversineDistance } from "@/lib/utils"

interface ShelterDirectoryProps {
  open: boolean
  onClose: () => void
  onShowOnMap: (shelter: Shelter) => void
  userLocation?: Coordinates | null
}

// Convert a directory entry into a Shelter object for the card component
function toShelter(
  entry: DirectoryShelterEntry,
  userLocation?: Coordinates | null
): Shelter {
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
  { key: "all", label: "All / הכל" },
  { key: "public_shelter", label: "Public" },
  { key: "school", label: "School" },
  { key: "underground_parking", label: "Parking" },
  { key: "distributed", label: "Distributed" },
  { key: "fortified_space", label: "Fortified" },
  { key: "bomb_shelter", label: "Bomb" },
  { key: "reinforced_shelter", label: "Reinforced" },
  { key: "kindergarten", label: "Kindergarten" },
]

const SEARCH_RESULTS_PAGE_SIZE = 50

export default function ShelterDirectory({
  open,
  onClose,
  onShowOnMap,
  userLocation,
}: ShelterDirectoryProps) {
  const [data, setData] = useState<DirectoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState<Set<string>>(new Set())
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())
  const [searchVisibleCount, setSearchVisibleCount] = useState(SEARCH_RESULTS_PAGE_SIZE)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch directory data on first open
  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    fetch("/api/shelters/directory")
      .then((res) => res.json())
      .then((d: DirectoryResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, data])

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setActiveFilter("all")
      setSearchVisibleCount(SEARCH_RESULTS_PAGE_SIZE)
    }
  }, [open])

  const toggleCity = useCallback((key: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleNeighborhood = useCallback((key: string) => {
    setExpandedNeighborhoods((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleRegion = useCallback((key: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Filter entries by type
  const filterByType = useCallback(
    (entries: DirectoryShelterEntry[]) => {
      if (activeFilter === "all") return entries
      return entries.filter((e) => e.type === activeFilter)
    },
    [activeFilter]
  )

  // Search across all shelters
  const searchResults = useMemo(() => {
    if (!data || !searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()

    const allEntries: DirectoryShelterEntry[] = []
    for (const city of data.cities) {
      for (const n of city.neighborhoods) allEntries.push(...n.shelters)
      allEntries.push(...city.shelters)
    }
    for (const region of data.unknownRegions) allEntries.push(...region.shelters)

    const typeLabel = (type: string) => {
      const t = SHELTER_TYPES[type]
      return t ? `${t.he} ${t.en}`.toLowerCase() : type
    }

    const filtered = allEntries.filter((e) => {
      if (activeFilter !== "all" && e.type !== activeFilter) return false
      const fields = [
        e.address,
        e.name,
        e.city_he,
        e.city_en,
        e.neighborhood,
        typeLabel(e.type),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return fields.includes(q)
    })

    return filtered
  }, [data, searchQuery, activeFilter])

  const handleShowOnMap = useCallback(
    (shelter: Shelter) => {
      onShowOnMap(shelter)
      onClose()
    },
    [onShowOnMap, onClose]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-4 pt-4 pb-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-white">
            SHELTER DIRECTORY / מאגר מקלטים
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
            aria-label="Close directory"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchVisibleCount(SEARCH_RESULTS_PAGE_SIZE)
            }}
            placeholder="Search shelters / חפש מקלטים..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
            dir="auto"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? "bg-red-600 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }`}
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
            <Loader2 className="h-8 w-8 animate-spin text-red-500" aria-hidden="true" />
            <p className="text-sm font-semibold mt-3 text-white/60">Loading shelters...</p>
          </div>
        )}

        {data && !loading && searchResults !== null && (
          <SearchResultsList
            results={searchResults}
            visibleCount={searchVisibleCount}
            onShowMore={() => setSearchVisibleCount((c) => c + SEARCH_RESULTS_PAGE_SIZE)}
            userLocation={userLocation}
            onShowOnMap={handleShowOnMap}
            query={searchQuery}
          />
        )}

        {data && !loading && searchResults === null && (
          <div className="p-3 space-y-1">
            {/* Total count */}
            <div className="px-2 pb-2">
              <p className="text-xs text-white/30">
                {data.totalCount.toLocaleString()} shelters across Israel / מקלטים ברחבי ישראל
              </p>
            </div>

            {/* City groups */}
            {data.cities.map((city) => {
              const filteredCount = activeFilter === "all"
                ? city.count
                : countFiltered(city, activeFilter)
              if (filteredCount === 0) return null
              return (
                <CitySection
                  key={city.cityHe || city.cityEn}
                  city={city}
                  isExpanded={expandedCities.has(city.cityHe || city.cityEn)}
                  onToggle={() => toggleCity(city.cityHe || city.cityEn)}
                  expandedNeighborhoods={expandedNeighborhoods}
                  onToggleNeighborhood={toggleNeighborhood}
                  filterByType={filterByType}
                  filteredCount={filteredCount}
                  userLocation={userLocation}
                  onShowOnMap={handleShowOnMap}
                />
              )
            })}

            {/* Unknown regions */}
            {data.unknownRegions.length > 0 && (
              <div className="mt-2">
                <div className="px-2 py-2">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wider">
                    Other Locations / מיקומים נוספים
                  </p>
                </div>
                {data.unknownRegions.map((region) => {
                  const filtered = filterByType(region.shelters)
                  if (filtered.length === 0) return null
                  return (
                    <RegionSection
                      key={region.nameEn}
                      region={region}
                      isExpanded={expandedRegions.has(region.nameEn)}
                      onToggle={() => toggleRegion(region.nameEn)}
                      filteredShelters={filtered}
                      userLocation={userLocation}
                      onShowOnMap={handleShowOnMap}
                    />
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
  for (const n of city.neighborhoods) {
    count += n.shelters.filter((s) => s.type === type).length
  }
  count += city.shelters.filter((s) => s.type === type).length
  return count
}

function CitySection({
  city,
  isExpanded,
  onToggle,
  expandedNeighborhoods,
  onToggleNeighborhood,
  filterByType,
  filteredCount,
  userLocation,
  onShowOnMap,
}: {
  city: CityGroup
  isExpanded: boolean
  onToggle: () => void
  expandedNeighborhoods: Set<string>
  onToggleNeighborhood: (key: string) => void
  filterByType: (entries: DirectoryShelterEntry[]) => DirectoryShelterEntry[]
  filteredCount: number
  userLocation?: Coordinates | null
  onShowOnMap: (shelter: Shelter) => void
}) {
  const cityKey = city.cityHe || city.cityEn

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors rounded-xl"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
        )}
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-bold text-white" dir="auto">
            {city.cityHe ? `${city.cityHe} / ${city.cityEn}` : city.cityEn}
          </span>
        </div>
        <span className="text-xs font-semibold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
          {filteredCount}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-4 pr-1 pb-2 space-y-1" style={{ contentVisibility: "auto" }}>
          {/* Neighborhoods */}
          {city.neighborhoods.map((neighborhood) => {
            const filtered = filterByType(neighborhood.shelters)
            if (filtered.length === 0) return null
            const nKey = `${cityKey}::${neighborhood.name}`
            const nExpanded = expandedNeighborhoods.has(nKey)

            return (
              <div key={neighborhood.name}>
                <button
                  onClick={() => onToggleNeighborhood(nKey)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-white/5 transition-colors rounded-lg"
                  aria-expanded={nExpanded}
                >
                  {nExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-white/60 flex-1 text-left" dir="auto">
                    {neighborhood.name}
                  </span>
                  <span className="text-[10px] text-white/25">{filtered.length}</span>
                </button>

                {nExpanded && (
                  <div className="pl-4 space-y-1.5 pb-1">
                    {filtered.map((entry) => (
                      <ShelterCard
                        key={entry.id}
                        shelter={toShelter(entry, userLocation)}
                        variant="directory"
                        onShowOnMap={onShowOnMap}
                        userLocation={userLocation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Shelters without a neighborhood */}
          {filterByType(city.shelters).length > 0 && (
            <div className="pl-6 space-y-1.5">
              {filterByType(city.shelters).map((entry) => (
                <ShelterCard
                  key={entry.id}
                  shelter={toShelter(entry, userLocation)}
                  variant="directory"
                  onShowOnMap={onShowOnMap}
                  userLocation={userLocation}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegionSection({
  region,
  isExpanded,
  onToggle,
  filteredShelters,
  userLocation,
  onShowOnMap,
}: {
  region: RegionGroup
  isExpanded: boolean
  onToggle: () => void
  filteredShelters: DirectoryShelterEntry[]
  userLocation?: Coordinates | null
  onShowOnMap: (shelter: Shelter) => void
}) {
  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors rounded-xl"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
        )}
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-white/70">
            {region.nameHe} / {region.nameEn}
          </span>
        </div>
        <span className="text-xs font-semibold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
          {filteredShelters.length}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-8 pr-1 pb-2 space-y-1.5" style={{ contentVisibility: "auto" }}>
          {filteredShelters.slice(0, 100).map((entry) => (
            <ShelterCard
              key={entry.id}
              shelter={toShelter(entry, userLocation)}
              variant="directory"
              onShowOnMap={onShowOnMap}
              userLocation={userLocation}
            />
          ))}
          {filteredShelters.length > 100 && (
            <p className="text-xs text-white/30 text-center py-2">
              Showing 100 of {filteredShelters.length} — use search to find specific shelters
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SearchResultsList({
  results,
  visibleCount,
  onShowMore,
  userLocation,
  onShowOnMap,
  query,
}: {
  results: DirectoryShelterEntry[]
  visibleCount: number
  onShowMore: () => void
  userLocation?: Coordinates | null
  onShowOnMap: (shelter: Shelter) => void
  query: string
}) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <MapPin className="h-8 w-8 text-white/20 mb-3" aria-hidden="true" />
        <p className="text-sm font-semibold text-white/50">No results for &quot;{query}&quot;</p>
        <p className="text-xs text-white/30 mt-1">Try a different search term</p>
      </div>
    )
  }

  const visible = results.slice(0, visibleCount)

  return (
    <div className="p-3 space-y-1.5">
      <p className="text-xs text-white/30 px-2 pb-1">
        {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
      </p>
      {visible.map((entry) => (
        <ShelterCard
          key={entry.id}
          shelter={toShelter(entry, userLocation)}
          variant="directory"
          onShowOnMap={onShowOnMap}
          userLocation={userLocation}
        />
      ))}
      {visibleCount < results.length && (
        <div className="text-center pt-2 pb-4">
          <Button
            onClick={onShowMore}
            variant="ghost"
            className="text-sm text-white/50 hover:text-white hover:bg-white/10"
          >
            Show more ({results.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
