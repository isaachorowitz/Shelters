import { MapPin, Shield } from "lucide-react"
import type { Shelter, Coordinates } from "@/lib/types"
import { EmptyState } from "@/components/ui/empty-state"
import ShelterCard from "./shelter-card"

export interface ShelterListProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  onOpenShare?: (shelter?: Shelter) => void
}

/** Ranked nearby shelters, or the loading / location-needed / empty state. */
export function ShelterList({ shelters, isLoading, hasLocationError, userLocation, onOpenShare }: ShelterListProps) {
  if (isLoading) {
    return <EmptyState loading title="מחפש מקלטים / Finding Shelters" description="סורק את האזור / Scanning your area..." />
  }
  if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    return (
      <EmptyState
        role="alert"
        tone="warn"
        icon={MapPin}
        title="נדרש מיקום / Location Needed"
        description="הפעל מיקום כדי למצוא מקלטים / Turn on location to find shelters"
      />
    )
  }
  if (shelters.length === 0) {
    return <EmptyState icon={Shield} title="לא נמצאו מקלטים / No Shelters Found" description="עבור לאזור מיושב / Move to a populated area" />
  }
  return (
    <div role="list" aria-label="Nearby shelters" className="space-y-3">
      {shelters.map((shelter, i) => (
        <div key={shelter.id} role="listitem">
          <ShelterCard
            shelter={shelter}
            rank={i + 1}
            userLocation={userLocation}
            onShare={onOpenShare ? (s) => onOpenShare(s) : undefined}
            isClosest={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
