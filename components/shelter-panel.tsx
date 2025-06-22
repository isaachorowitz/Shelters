"use client"

import type { Shelter } from "@/lib/types"
import ShelterCard from "./shelter-card"
import { ChevronUp, ChevronDown, AlertTriangle, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ShelterPanelProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
}

export default function ShelterPanel({ shelters, isLoading, hasLocationError }: ShelterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const panelHeightClass = isExpanded ? "h-[40vh] max-h-[380px] min-h-[220px]" : "h-[68px]" // Adjusted min-height and collapsed height

  const userHasRealDistance = (s: Shelter[]) => s.some((sh) => sh.distance !== undefined)

  const togglePanel = () => setIsExpanded(!isExpanded)

  let content
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-neutral-300 p-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-lg font-medium">Finding nearest shelters...</p>
        <p className="text-sm text-neutral-400">Please wait a moment.</p>
      </div>
    )
  } else if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-center text-neutral-300 p-6">
        <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
        <p className="text-lg font-medium">Location Unavailable</p>
        <p className="text-sm text-neutral-400">
          Could not determine your location. Showing default shelters. Enable location services for accurate results.
        </p>
      </div>
    )
  } else if (shelters.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-center text-neutral-300 p-6">
        <Info className="h-10 w-10 text-sky-400 mb-3" />
        <p className="text-lg font-medium">No Shelters Found</p>
        <p className="text-sm text-neutral-400">There are no shelters listed for your current area.</p>
      </div>
    )
  } else {
    content = (
      <div className="space-y-3.5">
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] max-w-xl bg-neutral-800/80 backdrop-blur-xl rounded-t-xl shadow-2xl z-10 transition-all duration-300 ease-in-out overflow-hidden border-t border-neutral-700/60 ${panelHeightClass}`}
    >
      <div
        className="flex items-center justify-between sticky top-0 bg-neutral-800/80 backdrop-blur-sm py-2.5 px-4 cursor-pointer h-[52px]"
        onClick={togglePanel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePanel()}
        aria-expanded={isExpanded}
        aria-controls="shelter-list-content"
      >
        <h2 className="text-lg font-semibold text-white">
          {isLoading ? "Loading..." : userHasRealDistance(shelters) ? "Nearest Shelters" : "Available Shelters"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation() // Prevent panel toggle if button is clicked directly
            togglePanel()
          }}
          className="text-neutral-300 hover:text-white hover:bg-neutral-700/80 p-1.5 rounded-md h-8 w-8"
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      <div
        id="shelter-list-content"
        className={`h-[calc(100%-52px)] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50 transition-opacity duration-200 ${isExpanded ? "opacity-100 p-4 pt-2" : "opacity-0 p-0 pt-0"}`}
      >
        {isExpanded && content}
      </div>
      {!isExpanded && !isLoading && (
        <div
          className="text-sm text-neutral-300 text-center px-2 truncate absolute bottom-0 left-0 right-0 h-[calc(68px-52px)] flex items-center justify-center leading-tight"
          onClick={togglePanel}
          role="button"
          tabIndex={-1} // Make it part of the toggle area
        >
          {shelters.length > 0
            ? `${shelters.length} ${userHasRealDistance(shelters) ? "nearby" : ""} shelter${shelters.length > 1 ? "s" : ""}`
            : "No shelters"}
          {" - Tap to expand"}
        </div>
      )}
    </div>
  )
}
