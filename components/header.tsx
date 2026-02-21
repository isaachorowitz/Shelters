"use client"

import { Shield, List } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import DataSourcesDialog from "./data-sources-dialog"
import type { Coordinates } from "@/lib/types"

const CITY_SHORTCUTS: { label: string; labelHe: string; coords: Coordinates; zoom: number }[] = [
  { label: "Tel Aviv", labelHe: "ת״א", coords: { lat: 32.0853, lng: 34.7818 }, zoom: 14 },
  { label: "Jerusalem", labelHe: "ירושלים", coords: { lat: 31.7683, lng: 35.2137 }, zoom: 14 },
  { label: "Haifa", labelHe: "חיפה", coords: { lat: 32.794, lng: 34.9896 }, zoom: 14 },
]

interface HeaderProps {
  children?: ReactNode
  onOpenDirectory?: () => void
  onCityShortcut?: (coords: Coordinates, label: string) => void
  activeCityLabel?: string | null
}

export default function Header({ children, onOpenDirectory, onCityShortcut, activeCityLabel }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-red-500/30"
      role="banner"
    >
      {/* Main row */}
      <div className="flex items-center h-12 px-2 gap-2">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-col hidden sm:flex">
            <h1 className="text-xs font-black text-white tracking-wider leading-none">
              SHELTER NOW
            </h1>
            <p className="text-[8px] text-red-400/90 font-semibold tracking-widest uppercase leading-tight mt-0.5">
              איתור מקלטים
            </p>
          </div>
        </div>

        {/* Search slot — fills the middle */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenDirectory && (
            <Button
              onClick={onOpenDirectory}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
              aria-label="Browse all shelters"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          )}
          <DataSourcesDialog />
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30"
            role="status"
            aria-label="System status: Active and ready"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-[10px] font-bold text-green-400 hidden xs:inline">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* City shortcuts row */}
      {onCityShortcut && (
        <div className="flex items-center gap-1.5 px-2 pb-1.5 overflow-x-auto scrollbar-none">
          {CITY_SHORTCUTS.map((city) => {
            const isActive = activeCityLabel === city.label
            return (
              <button
                key={city.label}
                onClick={() => onCityShortcut(city.coords, city.label)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0"
                style={{
                  background: isActive ? "rgba(220,38,38,0.9)" : "rgba(255,255,255,0.08)",
                  border: isActive ? "1px solid rgba(220,38,38,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  color: isActive ? "white" : "rgba(255,255,255,0.65)",
                }}
                aria-label={`Zoom to ${city.label}`}
                aria-pressed={isActive}
              >
                <span>{city.label}</span>
                <span className="opacity-60 text-[9px]">{city.labelHe}</span>
              </button>
            )
          })}
          <div className="text-[10px] text-white/20 flex-shrink-0 ml-1 hidden sm:block">quick zoom</div>
        </div>
      )}
    </header>
  )
}
