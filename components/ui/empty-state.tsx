import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

type Tone = "neutral" | "warn"

const TONE_CIRCLE: Record<Tone, string> = {
  neutral: "bg-fg/6",
  warn: "bg-warn-muted/15",
}

const TONE_ICON: Record<Tone, string> = {
  neutral: "text-fg/25",
  warn: "text-warn",
}

interface EmptyStateProps {
  title: string
  description?: string
  /** Shows a spinner instead of an icon. */
  loading?: boolean
  icon?: LucideIcon
  tone?: Tone
  role?: "status" | "alert"
  className?: string
}

/** Centered loading, empty, or needs-attention message for a list. */
export function EmptyState({
  title,
  description,
  loading,
  icon: Icon,
  tone = "neutral",
  role = "status",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-12 text-center text-fg", className)}
      role={role}
    >
      {loading ? (
        <Spinner className="h-7 w-7 mb-3" />
      ) : Icon ? (
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", TONE_CIRCLE[tone])}>
          <Icon className={cn("h-6 w-6", TONE_ICON[tone])} aria-hidden="true" />
        </div>
      ) : null}
      <p className="text-sm font-bold">{title}</p>
      {description && (
        <p className={cn("text-xs text-fg/40 mt-1", tone === "warn" && "max-w-[200px]")}>{description}</p>
      )}
    </div>
  )
}
