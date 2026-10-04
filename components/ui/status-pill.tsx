import { cn } from "@/lib/utils"

interface StatusPillProps {
  label?: string
  className?: string
}

/** Pulsing "LIVE" indicator in the top bar. */
export function StatusPill({ label = "LIVE", className }: StatusPillProps) {
  return (
    <div
      className={cn(
        "no-min-h flex items-center gap-1 px-2 py-1 rounded-full bg-live-strong/12 border border-live-strong/25",
        className
      )}
      role="status"
      aria-label="System live"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" aria-hidden="true" />
      <span className="text-tiny font-bold text-live tracking-wide">{label}</span>
    </div>
  )
}
