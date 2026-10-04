import { cn } from "@/lib/utils"

const RANK_COLORS = [
  "bg-rank-1 shadow-rank-1/30",
  "bg-rank-2 shadow-rank-2/30",
  "bg-rank-3 shadow-rank-3/30",
  "bg-rank-4 shadow-rank-4/30",
  "bg-rank-5 shadow-rank-5/30",
]

/** Colored circle with the shelter's rank by distance (1 = nearest). */
export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  const color = RANK_COLORS[Math.min(Math.max(rank, 1), RANK_COLORS.length) - 1]
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center font-black text-base text-fg flex-shrink-0 shadow-lg",
        color,
        className
      )}
      aria-label={`Number ${rank} nearest`}
    >
      {rank}
    </div>
  )
}
