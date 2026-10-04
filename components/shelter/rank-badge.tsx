import { cn } from "@/lib/utils"

/** Circle with the shelter's rank by distance. Rank 1 is red; the rest are neutral. */
export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-label font-semibold tabular-nums flex-shrink-0",
        rank === 1 ? "bg-brand text-white" : "bg-fg/8 text-fg-muted",
        className
      )}
      aria-label={`Number ${rank} nearest`}
    >
      {rank}
    </div>
  )
}
