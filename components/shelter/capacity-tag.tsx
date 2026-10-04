import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

/** People icon plus capacity, e.g. "120 ppl". Renders nothing for unknown capacity. */
export function CapacityTag({ capacity, className }: { capacity?: number; className?: string }) {
  if (!capacity || capacity <= 0) return null
  return (
    <span className={cn("flex items-center gap-0.5", className)}>
      <Users className="h-3 w-3" aria-hidden="true" />
      {capacity} ppl
    </span>
  )
}
