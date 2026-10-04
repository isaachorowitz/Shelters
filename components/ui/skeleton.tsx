import { cn } from "@/lib/utils"

/** Pulsing placeholder block while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-fg/8", className)} aria-hidden="true" />
}
