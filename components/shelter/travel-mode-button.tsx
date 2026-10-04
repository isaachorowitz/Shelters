import { PersonStanding, PlayIcon as Run, Car, Share2, AlertTriangle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEtaParts } from "./format"

export type TravelMode = "walk" | "run" | "drive" | "share" | "report"

const MODES: Record<TravelMode, { icon: LucideIcon; label: string; row: string; icon_: string; caption: string; compact: boolean }> = {
  walk: { icon: PersonStanding, label: "הליכה Walk", row: "bg-walk/10 border-walk/20", icon_: "text-walk", caption: "text-walk/70", compact: false },
  run: { icon: Run, label: "ריצה Run", row: "bg-run/10 border-run/20", icon_: "text-run", caption: "text-run/70", compact: false },
  drive: { icon: Car, label: "נסיעה Drive", row: "bg-drive/10 border-drive/20", icon_: "text-drive", caption: "text-drive/70", compact: false },
  share: { icon: Share2, label: "שתף", row: "bg-fg/4 border-fg/8", icon_: "text-fg/50", caption: "text-fg/30", compact: true },
  report: { icon: AlertTriangle, label: "דווח", row: "bg-warn/6 border-warn/12", icon_: "text-warn-muted/60", caption: "text-warn-muted/40", compact: true },
}

interface TravelModeButtonProps {
  mode: TravelMode
  /** Minutes to the shelter; shown next to the icon for walk and run. */
  etaMinutes?: number
  disabled?: boolean
  onClick?: () => void
  "aria-label": string
}

/**
 * One tile in the card's action row. Walk, run, and drive stretch to fill;
 * share and report are fixed-width squares.
 */
export function TravelModeButton({ mode, etaMinutes, disabled, onClick, "aria-label": ariaLabel }: TravelModeButtonProps) {
  const m = MODES[mode]
  const Icon = m.icon
  const eta = etaMinutes != null ? formatEtaParts(etaMinutes) : null
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "card-press flex flex-col items-center rounded-xl border disabled:opacity-40",
        m.compact ? "w-11 justify-center flex-shrink-0" : "flex-1 py-2.5",
        mode === "drive" && "justify-center",
        m.row
      )}
      aria-label={ariaLabel}
    >
      {eta ? (
        <div className="flex items-center gap-1">
          <Icon className={cn("h-4 w-4", m.icon_)} aria-hidden="true" />
          <span className="text-ui font-black text-fg">
            {eta.value}
            <span className="text-micro text-fg/40 ml-0.5">{eta.unit}</span>
          </span>
        </div>
      ) : mode === "walk" || mode === "run" ? (
        <div className="flex items-center gap-1">
          <Icon className={cn("h-4 w-4", m.icon_)} aria-hidden="true" />
        </div>
      ) : (
        <Icon className={cn("h-4 w-4", m.icon_)} aria-hidden="true" />
      )}
      <span className={cn("font-semibold mt-0.5", m.compact ? "text-nano" : "text-micro", m.caption)}>{m.label}</span>
    </button>
  )
}
