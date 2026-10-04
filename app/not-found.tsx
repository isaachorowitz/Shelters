import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-bright flex items-center justify-center mb-5">
        <Shield className="h-6 w-6" />
      </div>
      <h1 className="text-display sm:text-[40px] sm:leading-[44px] font-bold tracking-tight text-fg mb-2">404</h1>
      <p className="text-title text-fg-muted mb-1">Page not found</p>
      <p className="text-body text-fg-subtle mb-8 text-center max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist. Use the shelter finder to locate nearby shelters.
      </p>
      <Button asChild variant="primary" size="lg">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Find Nearest Shelter
        </Link>
      </Button>
      <div className="flex gap-5 mt-10 text-label text-fg-subtle">
        <Link href="/about" className="hover:text-fg-muted underline underline-offset-4">About</Link>
        <Link href="/safety-guide" className="hover:text-fg-muted underline underline-offset-4">Safety Guide</Link>
        <Link href="/contact" className="hover:text-fg-muted underline underline-offset-4">Contact</Link>
      </div>
    </div>
  )
}
