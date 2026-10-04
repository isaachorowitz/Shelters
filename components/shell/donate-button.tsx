import Link from "next/link"
import { Heart } from "lucide-react"

/** Solid red Donate link. Icon-only below the `sm` breakpoint. */
export function DonateButton() {
  return (
    <Link
      href="/donate"
      className="no-min-h flex items-center gap-1.5 px-3 h-8 rounded-lg bg-brand hover:bg-brand-bright text-fg text-label font-bold transition-colors flex-shrink-0"
      aria-label="Donate"
    >
      <Heart className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Donate</span>
    </Link>
  )
}
