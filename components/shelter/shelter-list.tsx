"use client"

import { useEffect, useState } from "react"
import { MapPin, Shield } from "lucide-react"
import type { Shelter, Coordinates } from "@/lib/types"
import { Bi } from "@/components/ui/bi"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import ShelterCard from "./shelter-card"

export interface ShelterListProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  onOpenShare?: (shelter?: Shelter) => void
}

/** Placeholder shaped like the nearest card plus two rows. */
export function ShelterListSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Finding shelters">
      <div className="rounded-2xl border border-line bg-surface-2 p-4">
        <div className="flex gap-3">
          <Skeleton className="w-7 h-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-[52px] w-full rounded-2xl mt-5" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface-2/60 p-4 flex gap-3">
          <Skeleton className="w-7 h-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </div>
      ))}
      <p className="sr-only">מחפש מקלטים / Finding shelters</p>
    </div>
  )
}

/**
 * Nearby shelters ranked by distance. The nearest one is always expanded;
 * tapping another row expands it in place.
 */
export function ShelterList({ shelters, isLoading, hasLocationError, userLocation, onOpenShare }: ShelterListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // A new result set collapses everything back to the nearest card.
  const resultKey = shelters.map((s) => s.id).join(",")
  useEffect(() => setExpandedId(null), [resultKey])

  if (isLoading) return <ShelterListSkeleton />

  if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    return (
      <EmptyState
        role="alert"
        tone="warn"
        icon={MapPin}
        title={<Bi he="נדרש מיקום" en="Location needed" />}
        description={<Bi he="הפעל מיקום כדי למצוא מקלטים" en="Turn on location to find shelters" layout="stack" className="items-center" />}
      />
    )
  }
  if (shelters.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title={<Bi he="לא נמצאו מקלטים" en="No shelters found" />}
        description={<Bi he="עבור לאזור מיושב" en="Move to a populated area" layout="stack" className="items-center" />}
      />
    )
  }
  return (
    <div role="list" aria-label="Nearby shelters" className="space-y-2">
      {shelters.map((shelter, i) => {
        const closest = i === 0
        return (
          <div key={shelter.id} role="listitem">
            <ShelterCard
              shelter={shelter}
              rank={i + 1}
              userLocation={userLocation}
              isClosest={closest}
              expanded={closest || expandedId === shelter.id}
              onToggle={closest ? undefined : () => setExpandedId((cur) => (cur === shelter.id ? null : shelter.id))}
              onShare={onOpenShare ? (s) => onOpenShare(s) : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}
