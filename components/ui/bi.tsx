import { cn } from "@/lib/utils"

interface BiProps {
  /** Hebrew text, shown first. */
  he: string
  /** English text, shown second and quieter. */
  en: string
  /**
   * inline: "נווט · Navigate" on one line.
   * stack:  Hebrew above, English below.
   */
  layout?: "inline" | "stack"
  className?: string
  /** Classes for the English half (defaults to a quieter tone). */
  enClassName?: string
}

/**
 * Hebrew and English together. The app always shows both on purpose: during a
 * siren nobody should have to find a language switch.
 */
export function Bi({ he, en, layout = "inline", className, enClassName }: BiProps) {
  if (layout === "stack") {
    return (
      <span className={cn("flex flex-col items-start", className)}>
        <span lang="he" dir="rtl">{he}</span>
        <span lang="en" className={cn("text-fg-subtle font-normal", enClassName)}>{en}</span>
      </span>
    )
  }
  // The separator lives with the English half, so hiding English hides it too.
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span lang="he" dir="rtl">{he}</span>
      <span className={cn("inline-flex items-baseline gap-x-1.5 opacity-75", enClassName)}>
        <span aria-hidden="true" className="opacity-50">·</span>
        <span lang="en">{en}</span>
      </span>
    </span>
  )
}
