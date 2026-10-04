import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Spinning loader icon. Size and color come from className. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-brand-bright", className)} aria-hidden="true" />
}
