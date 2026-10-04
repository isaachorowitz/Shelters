import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

type Tone = "neutral" | "warn"

interface EmptyStateProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Shows a spinner instead of an icon. */
  loading?: boolean
  icon?: LucideIcon
  tone?: Tone
  role?: "status" | "alert"
  /** Optional action under the text. */
  action?: React.ReactNode
  className?: string
}

/** Centered loading, empty, or needs-attention message. */
export function EmptyState({
  title,
  description,
  loading,
  icon: Icon,
  tone = "neutral",
  role = "status",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 px-4 text-center", className)} role={role}>
      {loading ? (
        <Spinner className="h-6 w-6 mb-3" />
      ) : Icon ? (
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-3",
            tone === "warn" ? "bg-warn/12 text-warn" : "bg-surface-3 text-fg-subtle"
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : null}
      <div className="text-body font-semibold text-fg">{title}</div>
      {description && <div className="text-label text-fg-subtle mt-1 max-w-[260px]">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
