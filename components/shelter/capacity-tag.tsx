import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

/** People icon plus capacity, e.g. "240". Renders nothing for unknown capacity. */
export function CapacityTag({ capacity, className }: { capacity?: number; className?: string }) {
  if (!capacity || capacity <= 0) return null
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)} aria-label={`Capacity ${capacity} people`}>
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      {capacity}
    </span>
  )
}
