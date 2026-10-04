import { cn } from "@/lib/utils"

type Confidence = "high" | "medium" | "low"

const CONFIG: Record<Confidence, { label: string; dot: string; text: string }> = {
  high: { label: "אמינות גבוהה / High confidence", dot: "bg-live", text: "text-live/70" },
  medium: { label: "אמינות בינונית / Medium", dot: "bg-caution", text: "text-caution/70" },
  low: { label: "לא מאומת / Unverified", dot: "bg-fg/30", text: "text-fg/30" },
}

/** Dot plus label for how much the data sources agree on a shelter. */
export function ConfidenceBadge({ confidence }: { confidence?: Confidence }) {
  if (!confidence) return null
  const { label, dot, text } = CONFIG[confidence]
  return (
    <span className="flex items-center gap-1" aria-label={label}>
      <span className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0", dot)} aria-hidden="true" />
      <span className={cn("text-tiny font-semibold", text)}>{label}</span>
    </span>
  )
}
