"use client"

import type { Shelter, Coordinates } from "@/lib/types"
import ShelterCard from "./shelter-card"
import { ChevronUp, ChevronDown, AlertTriangle, Loader2, Info, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ShelterPanelProps {
  shelters: Shelter[]
  isLoading: boolean
  hasLocationError: boolean
  userLocation?: Coordinates | null
  isDesktopPanel?: boolean
}

export default function ShelterPanel({ shelters, isLoading, hasLocationError, userLocation, isDesktopPanel = false }: ShelterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile and auto-expand
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-expand when shelters are loaded
  useEffect(() => {
    if (!isLoading && shelters.length > 0) {
      setIsExpanded(true)
    }
  }, [isLoading, shelters.length])

  // Desktop panel is always expanded and has different styling
  if (isDesktopPanel) {
    return (
      <div className="h-full w-full bg-black/90 backdrop-blur-xl rounded-2xl border-2 border-red-500/30 shadow-2xl overflow-hidden m-4">
        <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl py-4 px-6 border-b border-red-500/30">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            {isLoading ? "SCANNING..." : "NEAREST BOMB SHELTERS"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 scrollbar-track-black/50 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-white text-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                <div className="absolute inset-0 h-12 w-12 animate-ping">
                  <Loader2 className="h-12 w-12 text-red-500/50" />
                </div>
              </div>
              <p className="text-xl font-bold mt-4">LOCATING NEAREST BOMB SHELTERS</p>
              <p className="text-sm text-white/70">Stand by...</p>
            </div>
          ) : hasLocationError && shelters.every((s) => s.distance === undefined) ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-white">
              <AlertTriangle className="h-12 w-12 text-amber-400 animate-pulse mb-3" />
              <p className="text-xl font-bold">LOCATION ACCESS REQUIRED</p>
              <p className="text-sm text-white/70 mt-2">
                Enable location services to find bomb shelters near you
              </p>
            </div>
          ) : shelters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-white">
              <Info className="h-12 w-12 text-sky-400 mb-3" />
              <p className="text-xl font-bold">NO SHELTERS IN RANGE</p>
              <p className="text-sm text-white/70">Move to a populated area</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} userLocation={userLocation} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mobile panel layout - adjusted height to prevent cutoff
  const panelHeightClass = isExpanded 
    ? (isMobile ? "h-[60vh] max-h-[calc(100vh-120px)]" : "h-[50vh] max-h-[500px]")
    : "h-[80px]"

  const userHasRealDistance = (s: Shelter[]) => s.some((sh) => sh.distance !== undefined)

  const togglePanel = () => setIsExpanded(!isExpanded)

  let content
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          <div className="absolute inset-0 h-12 w-12 animate-ping">
            <Loader2 className="h-12 w-12 text-red-500/50" />
          </div>
        </div>
        <p className="text-xl font-bold mt-4">LOCATING NEAREST BOMB SHELTERS</p>
        <p className="text-sm text-white/70">Stand by...</p>
      </div>
    )
  } else if (hasLocationError && shelters.every((s) => s.distance === undefined)) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-center text-white p-6">
        <AlertTriangle className="h-12 w-12 text-amber-400 animate-pulse mb-3" />
        <p className="text-xl font-bold">LOCATION ACCESS REQUIRED</p>
        <p className="text-sm text-white/70 mt-2">
          Enable location services to find bomb shelters near you
        </p>
      </div>
    )
  } else if (shelters.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center h-full text-center text-white p-6">
        <Info className="h-12 w-12 text-sky-400 mb-3" />
        <p className="text-xl font-bold">NO SHELTERS IN RANGE</p>
        <p className="text-sm text-white/70">Move to a populated area</p>
      </div>
    )
  } else {
    content = (
      <div className="space-y-3 pb-4">
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} userLocation={userLocation} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 w-full' : 'bottom-0 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl'} 
        bg-black/50 backdrop-blur-2xl rounded-t-3xl shadow-2xl z-50 transition-all duration-300 ease-in-out overflow-hidden 
        border-t-2 border-red-500/50 ${panelHeightClass}`}
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))',
        boxShadow: '0 -10px 40px rgba(239, 68, 68, 0.3)',
      }}
    >
      <div
        className="flex items-center justify-between sticky top-0 bg-black/60 backdrop-blur-xl py-3 px-4 cursor-pointer h-[64px] border-b border-red-500/30"
        onClick={togglePanel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePanel()}
        aria-expanded={isExpanded}
        aria-controls="shelter-list-content"
      >
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          {isLoading ? "SCANNING..." : userHasRealDistance(shelters) ? "NEAREST BOMB SHELTERS" : "BOMB SHELTERS"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            togglePanel()
          }}
          className="text-white hover:text-white hover:bg-white/20 p-2 rounded-lg h-10 w-10"
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
        </Button>
      </div>

      <div
        id="shelter-list-content"
        className={`h-[calc(100%-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 scrollbar-track-black/50 transition-opacity duration-200 ${isExpanded ? "opacity-100 p-4" : "opacity-0 p-0"}`}
      >
        {isExpanded && content}
      </div>
      
      {!isExpanded && !isLoading && (
        <div
          className="text-sm text-white font-bold text-center px-2 absolute bottom-0 left-0 right-0 h-[16px] flex items-center justify-center animate-pulse"
          onClick={togglePanel}
          role="button"
          tabIndex={-1}
        >
          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
          {shelters.length > 0
            ? `${shelters.length} BOMB SHELTER${shelters.length > 1 ? "S" : ""} NEARBY - TAP FOR DETAILS`
            : "NO SHELTERS IN RANGE"}
        </div>
      )}
    </div>
  )
}
