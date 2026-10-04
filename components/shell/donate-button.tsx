import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Quiet Donate link for the top bars. */
export function DonateButton() {
  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/donate" aria-label="Donate">
        <Heart className="text-brand-bright" aria-hidden="true" />
        Donate
      </Link>
    </Button>
  )
}
