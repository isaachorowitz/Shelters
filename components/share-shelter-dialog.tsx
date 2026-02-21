"use client"

import { useState, useCallback } from "react"
import { Share2, Copy, Check, MapPin, Navigation, X, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import AddressSearch from "@/components/address-search"
import type { Shelter, Coordinates, ShelterApiResponse } from "@/lib/types"
import { calculateEtas } from "@/lib/utils"
import { getShelterDisplayInfo } from "@/lib/shelter-display"

interface ShareShelterDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Pre-selected shelter to share directly */
  shelter?: Shelter | null
  userLocation?: Coordinates | null
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
    etas: calculateEtas(s.meters),
  }
}

function buildShareText(shelter: Shelter, friendAddr?: string): string {
  const display = getShelterDisplayInfo(shelter)
  const addr = display.primaryLine
  const city = display.secondaryLine ? ` (${display.secondaryLine})` : ""
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${shelter.coordinates.lat},${shelter.coordinates.lng}`
  const waze = `https://waze.com/ul?ll=${shelter.coordinates.lat},${shelter.coordinates.lng}&navigate=yes`

  let msg = `🛡️ Nearest bomb shelter${friendAddr ? ` near ${friendAddr}` : ""}:\n\n📍 ${addr}${city}\n\nNavigate:\n🗺 Google Maps: ${gmaps}\n🚗 Waze: ${waze}`
  if (shelter.distance != null) {
    const dist = shelter.distance < 1000
      ? `${Math.round(shelter.distance)}m`
      : `${(shelter.distance / 1000).toFixed(1)}km`
    msg += `\n\n📏 Distance: ${dist}`
  }
  if (shelter.etas?.walk) {
    msg += ` · 🚶 ${shelter.etas.walk} min walk`
  }
  return msg
}

export default function ShareShelterDialog({
  open,
  onOpenChange,
  shelter: prefillShelter,
  userLocation,
}: ShareShelterDialogProps) {
  const [friendAddress, setFriendAddress] = useState<string | null>(null)
  const [friendCoords, setFriendCoords] = useState<Coordinates | null>(null)
  const [nearestShelters, setNearestShelters] = useState<Shelter[]>([])
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(prefillShelter ?? null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const handleFriendAddressSelect = useCallback(async (coords: Coordinates, label: string) => {
    setFriendCoords(coords)
    setFriendAddress(label)
    setSelectedShelter(null)
    setNearestShelters([])
    setLoading(true)
    setShareError(null)
    try {
      const res = await fetch(`/api/shelters?lat=${coords.lat}&lng=${coords.lng}&limit=5`)
      if (!res.ok) throw new Error("Failed")
      const { shelters: raw } = await res.json()
      const shelters = (raw as ShelterApiResponse[]).map(transformShelter)
      setNearestShelters(shelters)
      if (shelters.length > 0) setSelectedShelter(shelters[0])
    } catch {
      setShareError("Could not find shelters near that address.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleShare = useCallback(async () => {
    if (!selectedShelter) return
    const text = buildShareText(selectedShelter, friendAddress ?? undefined)

    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setShareError("Could not copy to clipboard.")
    }
  }, [selectedShelter, friendAddress])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setTimeout(() => {
      setFriendAddress(null)
      setFriendCoords(null)
      setNearestShelters([])
      setSelectedShelter(prefillShelter ?? null)
      setCopied(false)
      setShareError(null)
    }, 300)
  }, [onOpenChange, prefillShelter])

  const shelterToShow = selectedShelter ?? prefillShelter ?? null
  const display = shelterToShow ? getShelterDisplayInfo(shelterToShow) : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-neutral-950 border border-white/10 text-white max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-4 w-4 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white">
                Share a Shelter
              </DialogTitle>
              <DialogDescription className="text-xs text-white/50 mt-0.5">
                Find the nearest shelter for a friend&apos;s address
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Friend address search */}
          <div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Friend&apos;s Address
            </p>
            <AddressSearch
              onLocationSelect={handleFriendAddressSelect}
              activeLabel={friendAddress ?? undefined}
              onClearActive={() => {
                setFriendAddress(null)
                setFriendCoords(null)
                setNearestShelters([])
                setSelectedShelter(prefillShelter ?? null)
              }}
              placeholder="Enter friend's address..."
              compact
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">Finding nearby shelters...</span>
            </div>
          )}

          {/* Error */}
          {shareError && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-xl">{shareError}</p>
          )}

          {/* Nearby shelters for friend */}
          {nearestShelters.length > 1 && (
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Pick a shelter to share
              </p>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                {nearestShelters.slice(0, 5).map((s, i) => {
                  const d = getShelterDisplayInfo(s)
                  const dist = s.distance != null
                    ? s.distance < 1000 ? `${Math.round(s.distance)}m` : `${(s.distance / 1000).toFixed(1)}km`
                    : null
                  const isSelected = selectedShelter?.id === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShelter(s)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1px solid rgba(220,38,38,0.4)" : "1px solid transparent",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: i === 0 ? "#DC2626" : "rgba(255,255,255,0.1)" }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate" dir="auto">{d.primaryLine}</p>
                        {d.secondaryLine && <p className="text-[10px] text-white/40 truncate">{d.secondaryLine}</p>}
                      </div>
                      {dist && <span className="text-xs font-bold text-red-400 flex-shrink-0">{dist}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected shelter preview */}
          {shelterToShow && display && (
            <div
              className="rounded-xl p-3 space-y-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white leading-tight" dir="auto">{display.primaryLine}</p>
                  {display.secondaryLine && (
                    <p className="text-xs text-white/40 mt-0.5" dir="auto">{display.secondaryLine}</p>
                  )}
                  <p className="text-xs text-red-400/70 mt-0.5">{display.typeLabel}</p>
                </div>
                {shelterToShow.distance != null && (
                  <span className="text-sm font-black text-white flex-shrink-0">
                    {shelterToShow.distance < 1000
                      ? `${Math.round(shelterToShow.distance)}m`
                      : `${(shelterToShow.distance / 1000).toFixed(1)}km`}
                  </span>
                )}
              </div>
              {shelterToShow.etas && (
                <div className="flex gap-3 pt-1">
                  <span className="text-[11px] text-white/40">🚶 {shelterToShow.etas.walk} min</span>
                  <span className="text-[11px] text-white/40">🏃 {shelterToShow.etas.run} min</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation links for the friend */}
          {shelterToShow && (
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${shelterToShow.coordinates.lat},${shelterToShow.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                Google Maps
              </a>
              <a
                href={`https://waze.com/ul?ll=${shelterToShow.coordinates.lat},${shelterToShow.coordinates.lng}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                style={{ background: "rgba(0,200,200,0.15)", border: "1px solid rgba(0,200,200,0.25)" }}
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                Waze
              </a>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="px-5 pb-5">
          <Button
            onClick={handleShare}
            disabled={!shelterToShow}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" aria-hidden="true" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" aria-hidden="true" />
                Share Shelter / שתף מקלט
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
