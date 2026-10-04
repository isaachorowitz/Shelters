import { cn } from "@/lib/utils"
import { Bi } from "@/components/ui/bi"

type Confidence = "high" | "medium" | "low"

const CONFIG: Record<Confidence, { he: string; en: string; dot: string }> = {
  high: { he: "אמינות גבוהה", en: "High confidence", dot: "bg-live" },
  medium: { he: "אמינות בינונית", en: "Medium", dot: "bg-warn" },
  low: { he: "לא מאומת", en: "Unverified", dot: "bg-fg/30" },
}

/** Dot plus label for how strongly the data sources agree on a shelter. */
export function ConfidenceBadge({ confidence }: { confidence?: Confidence }) {
  if (!confidence) return null
  const { he, en, dot } = CONFIG[confidence]
  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-fg-subtle">
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} aria-hidden="true" />
      <Bi he={he} en={en} />
    </span>
  )
}
