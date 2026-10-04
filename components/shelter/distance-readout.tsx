import { cn } from "@/lib/utils"
import { formatDistanceParts } from "./format"

/** Distance figure with a small unit, right-aligned on the card. */
export function DistanceReadout({ meters, size = "md", className }: { meters: number; size?: "md" | "lg"; className?: string }) {
  const { value, unit } = formatDistanceParts(meters)
  return (
    <span className={cn("inline-flex items-baseline gap-0.5 tabular-nums text-fg", className)}>
      <span className={cn("font-semibold tracking-tight", size === "lg" ? "text-heading" : "text-title")}>{value}</span>
      <span className="text-label text-fg-subtle">{unit}</span>
    </span>
  )
}
